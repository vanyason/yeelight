package main

import (
	"log"
	"time"

	"github.com/vanyason/yeelight/yeelight"
)

const retries = 2
const pause = 1

// stop on error
func stopOnError(err error) {
	if err != nil {
		panic(err)
	}
}

// Looking for a bulb and create controller
func setup() (b *yeelight.YLightBulb, err error) {
	log.Println("Looking for a bulb...")
	b, err = yeelight.Discover()
	for i := 0; i < retries && err != nil; i++ {
		log.Println(err)
		b, err = yeelight.Discover()
	}
	return b, err
}

// test get prop
func testGetProp(b *yeelight.YLightBulb) {
	log.Println("Testing get_prop...")
	res, notif, err := b.SendCommand("get_prop", "power")
	stopOnError(err)
	log.Printf("\nResult:\t\t%+v\nNotification:\t%+v\n", res, notif)
	time.Sleep(time.Second * pause)
}

// test toggle
func testToggle(b *yeelight.YLightBulb) {
	for i := 0; i < 2; i++ {
		stopOnError(b.Toggle())
		log.Printf("Power: %t\n", b.Power)
		time.Sleep(time.Second * pause)
	}
}

// test RGB
func testRGB(b *yeelight.YLightBulb) {
	log.Println("Testing RGB...")

	stopOnError(b.SetRGB(255, 0, 0))
	log.Printf("RGB: %d\n", b.RGB)
	time.Sleep(time.Second * pause)

	stopOnError(b.SetRGB(0, 255, 0))
	log.Printf("RGB: %d\n", b.RGB)
	time.Sleep(time.Second * pause)

	stopOnError(b.SetRGB(0, 0, 255))
	log.Printf("RGB: %d\n", b.RGB)
	time.Sleep(time.Second * pause)
}

// test bright
func testBright(b *yeelight.YLightBulb) {
	log.Println("Testing Bright...")
	for i := 0; i <= 100; i += 50 {
		stopOnError(b.SetBrightness(uint8(i)))
		log.Printf("Bright: %d\n", b.Bright)
		time.Sleep(time.Second * pause)
	}
}

// test color temp
func testColorTemp(b *yeelight.YLightBulb) {
	log.Println("Testing Color Temp...")
	stopOnError(b.SetTemp(int(1700)))
	log.Printf("Color Temp: %d\n", b.CT)
	time.Sleep(time.Second * pause)
	stopOnError(b.SetTemp(int(4000)))
	log.Printf("Color Temp: %d\n", b.CT)
	time.Sleep(time.Second * pause)
	stopOnError(b.SetTemp(int(6500)))
	log.Printf("Color Temp: %d\n", b.CT)
	time.Sleep(time.Second * pause)
}

// test turn on/off
func testTurnOnOff(b *yeelight.YLightBulb) {
	log.Println("Testing turn on/off...")
	stopOnError(b.TurnOff())
	time.Sleep(time.Second * pause)
	log.Printf("Power: %t\n", b.Power)
	stopOnError(b.TurnOn())
	log.Printf("Power: %t\n", b.Power)
	time.Sleep(time.Second * pause)
}

// turn on
func turnOn(b *yeelight.YLightBulb) {
	log.Println("Turning on...")
	stopOnError(b.TurnOn())
	log.Printf("Power: %t\n", b.Power)
	time.Sleep(time.Second * pause)
}

// restore default state
func restoreDefault(b *yeelight.YLightBulb, bCopy *yeelight.YLightBulb) {
	log.Println("Restoring defaults...")
	if bCopy.Power {
		stopOnError(b.TurnOn())
	} else {
		stopOnError(b.TurnOff())
	}

	stopOnError(b.SetBrightness(uint8(bCopy.Bright)))

	switch bCopy.Mode {
	case yeelight.RGB:
		stopOnError(b.SetRGBInt(bCopy.RGB))
	case yeelight.Temperature:
		stopOnError(b.SetTemp(bCopy.CT))
	default:
		log.Fatalf("Unknown color mode: %d", bCopy.Mode)
	}
}

func main() {
	b, err := setup()
	stopOnError(err)

	log.Println("Saving state...")
	bCopy := *b
	log.Printf("\nBulb:\t\t%+v\nBulb copy:\t%+v", b, bCopy)

	log.Println("Connecting...")
	stopOnError(b.Connect())
	defer b.Disconnect()

	testGetProp(b)
	turnOn(b)
	testRGB(b)
	testColorTemp(b)
	testBright(b)
	testTurnOnOff(b)
	restoreDefault(b, &bCopy)
	log.Println("Test finished.")
}
