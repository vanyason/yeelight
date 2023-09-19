package main

import (
	"log"
	"yeelight/yeelight"
)

func main() {
	const networkInterfaceName = "Wi-Fi"

	bulb, err := yeelight.Discover(networkInterfaceName)
	if err != nil {
		log.Fatal(err)
	}

	err = bulb.Connect()
	defer bulb.Disconnect()
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("bulb created : %v\n", bulb)

	log.Println("get prop...")
	_, _, err = bulb.SendCommand("get_prop", "power")
	if err != nil {
		log.Fatal(err)
	}

	log.Println("toggle...")
	res, not, err := bulb.SendCommand("toggle")
	if err != nil {
		log.Fatal(err)
	}
	log.Println(res)
	log.Println(not)

	log.Println("toggle...")
	res, not, err = bulb.SendCommand("toggle")
	if err != nil {
		log.Fatal(err)
	}
	log.Println(res)
	log.Println(not)

	log.Println("get prop...")
	_, _, err = bulb.SendCommand("get_prop", "power")
	if err != nil {
		log.Fatal(err)
	}

	log.Println("error...")
	_, _, err = bulb.SendCommand("asdasd", "power")
	if err != nil {
		log.Fatal(err)
	}
}
