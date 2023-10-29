package main

import (
	"context"
	"fmt"
	"yeelight/yeelight"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// Wrappers over the yeelight methods 👇
// Discover returns a light bulb
func (a *App) Discover() (*yeelight.YLightBulb, error) {
	return yeelight.Discover()
}

// Guess what this method does 🤔
func (a *App) Connect(y *yeelight.YLightBulb) (err error) {
	return y.Connect()
}

// Guess what this method does 🤔
func (a *App) Disconnect(y *yeelight.YLightBulb) (err error) {
	return y.Disconnect()
}

// Sends command to the bulb. Method connect should be called before that. Check the yeelight doc for the messages format
// In short, method param is a method name. params is the array of params. Pass them one by one
// Example : SendCommand("get_prop", "power")
func (a *App) SendCommand(y *yeelight.YLightBulb, method string, params ...any) (*yeelight.CommandResult, *yeelight.Notification, error) {
	return y.SendCommand(method, params...)
}

// Turns the bulb on / off. Not recommended to use this method. Use TurnOn / TurnOff instead
func (a *App) Toggle(y *yeelight.YLightBulb) error {
	return y.Toggle()
}

// Turns the bulb on
func (a *App) TurnOn(y *yeelight.YLightBulb) error {
	return y.TurnOn()
}

// Turns the bulb off
func (a *App) TurnOff(y *yeelight.YLightBulb) error {
	return y.TurnOff()
}

// Sets the color of the bulb. 0 - 16777215(0xFFFFFF)
func (a *App) SetRGBInt(y *yeelight.YLightBulb, rgb int) error {
	return y.SetRGBInt(rgb)
}

// Sets the color of the bulb.
func (a *App) SetRGB(y *yeelight.YLightBulb, r, g, b uint8) error {
	return y.SetRGB(r, g, b)
}

// Sets the brightness of the bulb. 1 - 100
func (a *App) SetBrightness(y *yeelight.YLightBulb, brightness uint8) error {
	return y.SetBrightness(brightness)
}

// Sets the color temperature of the bulb. 1700 - 6500
func (a *App) SetTemp(y *yeelight.YLightBulb, temp int) error {
	return y.SetTemp(temp)
}
