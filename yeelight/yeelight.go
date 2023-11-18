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
	waitTimeout                 = time.Millisecond * 1200
	bufSize                     = 2048
	smoothDur                   = 150
)

type (
	// Yeelight device controller class
	YLightBulb struct {
		Power  bool      `json:"power"`  //< on / off
		Mode   ColorMode `json:"mode"`   //< 1 - color mode; 2 - temperature; 3 - HSV
		RGB    int       `json:"rgb"`    //< RGB value  		     (decimal)  	if mode = 1
		CT     int       `json:"ct"`     //< current temperature   (? - ?)		if mode = 2
		Bright int       `json:"bright"` //< brightness 		      (1-100)

		location *net.TCPAddr `json:"location"` //< yeelight://ip:port
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
		Method string         `json:"method"`
		Params map[string]any `json:"params"`
	}
)

// Find bulb in the local network. This is the constructor for the Yeelight controller
func Discover() (bulb *YLightBulb, e error) {
	data, err := getDiscoverData()
	if err != nil {
		return nil, err
	}
	return parseDiscoverData(data)
}

// This is the special function for the wails lib. It does exactly the same as Discover(), but can be called from the frontend
func (y *YLightBulb) SelfDiscover() (*YLightBulb, error) {
	data, err := getDiscoverData()
	if err != nil {
		return nil, err
	}

	bulb, err := parseDiscoverData(data)
	if err != nil {
		return nil, err
	}

	*y = *bulb
	return y, nil
}

// Returns the pointer to the bulb. This is the special function for the wails lib.
func (y *YLightBulb) GetGuts() *YLightBulb {
	return y
}

// Before sending commands connection should be established. Do not forget to disconnect
func (y *YLightBulb) Connect() (err error) {
	if y.conn != nil {
		return nil
	}
	if y.conn, err = net.DialTimeout("tcp", y.location.String(), timeout); err != nil {
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
	if err != nil || sent != len(req) {
		return nil, nil, fmt.Errorf("%s error sending (message - %s) : sent %d out of %d", fn, req, sent, len(req))
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
	if _, _, err := y.SendCommand("set_power", "on", "smooth", smoothDur); err != nil {
		return fmt.Errorf("%s : %w", "[yeelight - sendCommand - turnOn]", err)
	}

	y.Power = true
	return nil
}

// Turns the bulb off
func (y *YLightBulb) TurnOff() error {
	if _, _, err := y.SendCommand("set_power", "off", "smooth", smoothDur); err != nil {
		return fmt.Errorf("%s : %w", "[yeelight - sendCommand - turnOff]", err)
	}

	y.Power = false
	return nil
}

// Sets the color of the bulb. 0 - 16777215(0xFFFFFF)
func (y *YLightBulb) SetRGBInt(rgb int) error {
	if rgb > 16777215 {
		rgb = 16777215
	}

	if _, _, err := y.SendCommand("set_rgb", rgb, "smooth", smoothDur); err != nil {
		return fmt.Errorf("%s : %w", "[yeelight - sendCommand - setRGBInt]", err)
	}

	y.RGB = rgb
	y.Mode = RGB
	return nil
}

// Sets the color of the bulb.
func (y *YLightBulb) SetRGB(r, g, b uint8) error {
	return y.SetRGBInt(int(r)<<16 + int(g)<<8 + int(b))
}

// Sets the brightness of the bulb. 1 - 100
func (y *YLightBulb) SetBrightness(brightness uint8) error {
	if brightness > 100 {
		brightness = 100
	} else if brightness < 1 {
		brightness = 1
	}

	if _, _, err := y.SendCommand("set_bright", brightness, "smooth", smoothDur); err != nil {
		return fmt.Errorf("%s : %w", "[yeelight - sendCommand - SetBrightness]", err)
	}

	y.Bright = int(brightness)
	return nil
}

// Sets the color temperature of the bulb. 1700 - 6500
func (y *YLightBulb) SetTemp(temp int) error {
	if temp < 1700 {
		temp = 1700
	} else if temp > 6500 {
		temp = 6500
	}

	if _, _, err := y.SendCommand("set_ct_abx", temp, "smooth", smoothDur); err != nil {
		return fmt.Errorf("%s : %w", "[yeelight - sendCommand - setTemp]", err)
	}

	y.CT = int(temp)
	y.Mode = Temperature
	return nil
}

// generates command with random id
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

// find light bulb in the local network
func getDiscoverData() (data string, err error) {
	const (
		fn      = "[yeelight - getDiscoverData]"
		discMsg = "M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1982\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n"
		discAdr = "239.255.255.250:1982"
		netType = "udp"
	)

	// create end point address
	adr, err := net.ResolveUDPAddr(netType, discAdr)
	if err != nil {
		return "", fmt.Errorf("%s : error resolving UDP address: %w", fn, err)
	}

	// create and setup socket
	pConn, err := net.ListenPacket(netType, ":0")
	if err != nil {
		return "", fmt.Errorf("%s : error listening for UDP packets: %w", fn, err)
	}
	defer pConn.Close()

	// cast to UDPConn
	conn, ok := pConn.(*net.UDPConn)
	if !ok {
		return "", fmt.Errorf("%s : error casting to UDP connection", fn)
	}

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

// parse discover data
func parseDiscoverData(data string) (bulb *YLightBulb, err error) {
	const fn = "[yeelight - parseDiscoverData]"

	data += "\r\n" //< Some data formatting hacks, sorry 😕

	// Discover data should look like http header. Let`s try to parse it that way
	resp, err := http.ReadResponse(bufio.NewReader(strings.NewReader(data)), nil)
	if err != nil {
		return nil, fmt.Errorf("%s error reading discover data (data: %s) : %w", fn, data, err)
	}
	defer resp.Body.Close()

	// Parse
	bulb = &YLightBulb{}

	bulb.location, err = net.ResolveTCPAddr("tcp", strings.TrimPrefix(resp.Header.Get("location"), "yeelight://"))
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse location (data: %s): %w", fn, data, err)
	}

	switch resp.Header.Get("power") {
	case "on":
		bulb.Power = true
	case "off":
		bulb.Power = false
	default:
		return nil, fmt.Errorf("%s can`t parse power (data: %s): %w", fn, data, err)
	}

	mode, err := strconv.Atoi(resp.Header.Get("color_mode"))
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse mode (data: %s): %w", fn, data, err)
	}
	bulb.Mode = ColorMode(mode)

	bulb.RGB, err = strconv.Atoi(resp.Header.Get("rgb"))
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse RGB (data: %s): %w", fn, data, err)
	}

	bulb.CT, err = strconv.Atoi(resp.Header.Get("ct"))
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse current temp (data: %s): %w", fn, data, err)
	}

	bulb.Bright, err = strconv.Atoi(resp.Header.Get("bright"))
	if err != nil {
		return nil, fmt.Errorf("%s can`t parse brightness (data: %s): %w", fn, data, err)
	}

	return bulb, nil
}
