package main

import (
	"log"
	"yeelight/yeelight"
)

const (
	netInterface = "wlp4s0" //< thats my linux default network interface retrieved from ifconfig. Replace it with yours
	retries      = 2
)

// stop on error
func stopOnError(err error) {
	if err != nil {
		panic(err)
	}
}

// Looking for a bulb and create controller
func setup() (b *yeelight.YLightBulb, err error) {
	b, err = yeelight.Discover(netInterface)
	for i := 0; i < retries && err != nil; i++ {
		log.Println(err)
		b, err = yeelight.Discover(netInterface)
	}
	return b, err
}

// test get prop
func testGetProp(b *yeelight.YLightBulb) {
	res, notif, err := b.SendCommand("get_prop", "power")
	for i := 0; i < retries && err != nil; i++ {
		log.Println(err)
		res, notif, err = b.SendCommand("get_prop", "power")
	}
	stopOnError(err)

	log.Printf("Result: %+v\n", res)
	log.Printf("Notification: %+v\n", notif)
}

// test toggle
func testToggle(b *yeelight.YLightBulb) {
	for i := 0; i < 2; i++ {
		stopOnError(b.Toggle())
		log.Printf("Power: %t\n", b.Power)
	}
}

// test turn on/off
func testTurnOnOff(b *yeelight.YLightBulb) {
	stopOnError(b.TurnOff())
	log.Printf("Power: %t\n", b.Power)
	stopOnError(b.TurnOn())
	log.Printf("Power: %t\n", b.Power)
}

func main() {
	b, err := setup()
	stopOnError(err)
	log.Printf("Bulb: %+v\n", b)

	stopOnError(b.Connect())
	defer b.Disconnect()

	testGetProp(b)
	testTurnOnOff(b)
}
