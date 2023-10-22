package yeelight

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type ColorMode int64

const (
	RGB               ColorMode = 1
	Temperature       ColorMode = 2
	HSV               ColorMode = 3
	timeout                     = time.Second * 3
	writeTimeout                = timeout
	connectionTimeout           = timeout
	readTimeout                 = timeout
	waitTimeout                 = time.Millisecond * 1500
	bufSize                     = 2048
)

type (
	// Yeelight device controller class
	YLightBulb struct {
		Power    bool         `json:"power"`    //< on / off
		Mode     ColorMode    `json:"mode"`     //< 1 - color mode; 2 - temperature; 3 - HSV
		RGB      int          `json:"rgb"`      //< RGB value  		     (decimal)  	if mode = 1
		SAT      int          `json:"sat"`      //< Saturation  		  (0-100)		if mode = 3
		HUE      int          `json:"hue"`      //< HUE 				  (0-359)		if mode = 3
		CT       int          `json:"ct"`       //< current temperature   (? - ?)		if mode = 2
		Bright   int          `json:"bright"`   //< brightness 		      (1-100)
		Location *net.TCPAddr `json:"location"` //< yeelight://ip:port
		conn     net.Conn     `json:"conn"`     //< TCP connection to yeelight
	}

	// COMMAND request to Yeelight device
	Command struct {
		ID     int    `json:"id"`
		Method string `json:"method"`
		Params []any  `json:"params"`
	}

	// ERROR response from Yeelight device (response to every command if error exists)
	Error struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	}

	// RESULT response from Yeelight device (response to every command)
	CommandResult struct {
		ID     int   `json:"id"`
		Result []any `json:"result,omitempty"`
		Error  Error `json:"error,omitempty"`
	}

	// NOTIFICATION response from Yeelight device (every time device`s` state changes)
	Notification struct {
		Method string            `json:"method"`
		Params map[string]string `json:"params"`
	}
)

// Find bulb in the local network. This is the constructor for the Yeelight controller
// You need to provide the net interface name. It can be found with the ifconfig command (powershell / cmd)
func Discover(interfaceName string) (bulb *YLightBulb, e error) {
	data, err := getDiscoverData(interfaceName)
	if err != nil {
		return nil, err
	}
	return parseDiscoverData(data)
}

// Before sending commands connection should be established. Do not forget to disconnect
func (y *YLightBulb) Connect() (err error) {
	if y.conn != nil {
		return nil
	}
	if y.conn, err = net.DialTimeout("tcp", y.Location.String(), timeout); err != nil {
		return fmt.Errorf("[yeelight - connect] can not connect : %w", err)
	}
	return nil
}

// Guess what this method does 🤔
func (y *YLightBulb) Disconnect() (err error) {
	if y.conn == nil {
		return nil
	}
	if err = y.conn.Close(); err != nil {
		return fmt.Errorf("[yeelight - disconnect] can not disconnect : %w", err)
	}
	y.conn = nil
	return nil
}

// Sends command to the bulb. Method connect should be called before that. Check the yeelight doc for the messages format
// In short, method param is a method name. params is the array of params. Pass them one by one
// Example : SendCommand("get_prop", "power")
func (y *YLightBulb) SendCommand(method string, params ...any) (*CommandResult, *Notification, error) {
	const fn = "[yeelight - sendCommand]"

	// check tcp connection
	if y.conn == nil {
		return nil, nil, fmt.Errorf("%s not connected. connect first", fn)
	}

	// command -> json + \r\n
	cmd := generateCommand(method, params...)
	req, err := json.Marshal(cmd)
	if err != nil {
		return nil, nil, fmt.Errorf("%s can not marshal (struct - %v) : %w", fn, cmd, err)
	}
	req = append(req, "\r\n"...)

	// send command
	y.conn.SetWriteDeadline(time.Now().Add(writeTimeout))
	sent, err := y.conn.Write(req)
	if sent != len(req) {
		return nil, nil, fmt.Errorf("%s error sending (message - %s) : sent %d out of %d", fn, req, sent, len(req))
	}
	if err != nil {
		return nil, nil, fmt.Errorf("%s error sending (message - %s) : %w", fn, req, err)
	}

	// wait some time because several replies can return
	time.Sleep(waitTimeout)

	// read and parse reply (can have result (mandatory) and notify (optional) messages)
	buf := make([]byte, bufSize)
	y.conn.SetReadDeadline(time.Now().Add(readTimeout))
	read, err := y.conn.Read(buf)
	if err != nil {
		return nil, nil, fmt.Errorf("%s error reading (read: %d) : %w", fn, read, err)
	}

	buf = buf[:read]
	result := new(CommandResult)
	notification := new(Notification)
	messages := bytes.Split(buf, []byte("\n"))
	for _, message := range messages {
		if bytes.Contains(message, []byte("id")) {
			err = json.Unmarshal(message, result)
			if err != nil {
				return nil, nil, fmt.Errorf("%s error parsing reply from json (sent: %s received: %s) : %w", fn, req, buf, err)
			}
		} else if bytes.Contains(message, []byte("props")) {
			err = json.Unmarshal(message, notification)
			if err != nil {
				return nil, nil, fmt.Errorf("%s error parsing reply from json (sent: %s received: %s) : %w", fn, req, buf, err)
			}
		}
	}

	return result, notification, nil
}

// Turns the bulb on / off. Not recommended to use this method. Use TurnOn / TurnOff instead
func (y *YLightBulb) Toggle() error {
	if _, _, err := y.SendCommand("toggle"); err != nil {
		return fmt.Errorf("%s : %w", "[yeelight - sendCommand - toggle]", err)
	}

	y.Power = !y.Power
	return nil
}

// Turns the bulb on
func (y *YLightBulb) TurnOn() error {
	if _, _, err := y.SendCommand("set_power", "on", "smooth", 500); err != nil {
		return fmt.Errorf("%s : %w", "[yeelight - sendCommand - turnOn]", err)
	}

	y.Power = true
	return nil
}

// Turns the bulb off
func (y *YLightBulb) TurnOff() error {
	if _, _, err := y.SendCommand("set_power", "off", "smooth", 500); err != nil {
		return fmt.Errorf("%s : %w", "[yeelight - sendCommand - turnOff]", err)
	}

	y.Power = false
	return nil
}

// func (y *YLightBulb) SetRGB(r, g, b uint8) error {
// 	return nil
// }

// func (y *YLightBulb) SetBright(brightness uint8) error {
// 	return nil
// }

// func (y *YLightBulb) SetTemp(brightness uint16) error {
// 	return nil
// }

func generateCommand(method string, params ...any) Command {
	if len(params) == 0 {
		params = make([]any, 0)
	}

	return Command{
		ID:     rand.New(rand.NewSource(time.Now().UnixNano())).Intn(100),
		Method: method,
		Params: params,
	}
}

func getDiscoverData(interfaceName string) (data string, err error) {
	const (
		fn      = "[yeelight - getDiscoverData]"
		discMsg = "M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1982\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n"
		discAdr = "239.255.255.250:1982"
		netType = "udp"
	)

	// find provided network interface
	intrf, err := net.InterfaceByName(interfaceName)
	if err != nil {
		return "", fmt.Errorf("%s no such interface(%s) - check ipconfig : %w", fn, interfaceName, err)
	}

	// create end point address
	adr, err := net.ResolveUDPAddr(netType, discAdr)
	if err != nil {
		return "", fmt.Errorf("%s : %w", fn, err)
	}

	// create and setup socket
	conn, err := net.ListenMulticastUDP(netType, intrf, adr)
	if err != nil {
		return "", fmt.Errorf("%s : %w", fn, err)
	}
	defer conn.Close()

	// send/read discover message
	conn.SetWriteDeadline(time.Now().Add(writeTimeout))
	written, err := conn.WriteToUDP([]byte(discMsg), adr)
	if err != nil || written != len(discMsg) {
		return "", fmt.Errorf("%s error sending (sent: %d) : %w", fn, written, err)
	}

	conn.SetReadDeadline(time.Now().Add(writeTimeout))
	buf := make([]byte, bufSize)
	read, _, err := conn.ReadFromUDP(buf)
	response := string(buf[:read])
	if err != nil {
		return "", fmt.Errorf("%s error reading (read: %d, received:%s) : %w", fn, read, response, err)
	}

	return response, nil
}

func parseDiscoverData(data string) (bulb *YLightBulb, err error) {
	const fn = "[yeelight - parseDiscoverData]"

	data += "\r\n" //< Some data formatting hacks, sorry 😕

	// Discover data should look like http header. Let`s try to parse it that way
	resp, err := http.ReadResponse(bufio.NewReader(strings.NewReader(data)), nil)
	if err != nil {
		return nil, fmt.Errorf("%s error parsing discover data (data: %s) : %w", fn, data, err)
	}
	defer resp.Body.Close()

	// Parse
	strLocation := resp.Header.Get("location") //< yeelight://ip:port
	strPower := resp.Header.Get("power")       //< on / off
	strMode := resp.Header.Get("color_mode")   //< 1 - color mode; 2 - temperature; 3 - HSV
	strRGB := resp.Header.Get("rgb")           //< RGB value  			(decimal)	if mode = 1
	strSAT := resp.Header.Get("sat")           //< Saturation  			(0-100)		if mode = 3
	strHUE := resp.Header.Get("hue")           //< HUE 					(0-359)		if mode = 3
	strCT := resp.Header.Get("ct")             //< current temperature  (? - ?)		if mode = 2
	strBright := resp.Header.Get("bright")     //< brightness 			(1-100)

	bulb = &YLightBulb{}
	bulb.Location, err = net.ResolveTCPAddr("tcp", strings.TrimPrefix(strLocation, "yeelight://"))
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse location (location: %s): %w", fn, strLocation, err)
	}
	if strPower == "on" {
		bulb.Power = true
	} else if strPower == "off" {
		bulb.Power = false
	} else {
		return nil, fmt.Errorf("%s can`t parse power (power: %s): %w", fn, strPower, err)
	}
	mode, err := strconv.Atoi(strMode)
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse mode (mode: %s): %w", fn, strMode, err)
	}
	bulb.Mode = ColorMode(mode)
	bulb.RGB, err = strconv.Atoi(strRGB)
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse RGB (RGB: %s): %w", fn, strRGB, err)
	}
	bulb.SAT, err = strconv.Atoi(strSAT)
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse SAT (SAT: %s): %w", fn, strSAT, err)
	}
	bulb.HUE, err = strconv.Atoi(strHUE)
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse HUE (HUE: %s): %w", fn, strHUE, err)
	}
	bulb.CT, err = strconv.Atoi(strCT)
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse current temp (CT: %s): %w", fn, strCT, err)
	}
	bulb.Bright, err = strconv.Atoi(strBright)
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse brightness (right: %s): %w", fn, strBright, err)
	}

	return bulb, nil
}
