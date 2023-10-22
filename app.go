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

// Discover returns a light bulb
func (a *App) Discover(netInterface string) (*yeelight.YLightBulb, error) {
	return yeelight.Discover(netInterface)
}
