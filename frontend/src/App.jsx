import { useState, useEffect } from "react";
import { SelfDiscover, Connect, Disconnect, GetGuts, TurnOn, TurnOff, SetRGBInt } from "../wailsjs/go/yeelight/YLightBulb";
import { LogMessage, RGBHexStringToInt, RGBIntToHexString } from "./utils";

import BulbButton from "./components/BulbButton";
import LogsSection from "./components/LogsSection";
import ColorPicker from "./components/ColorPicker";
import TemperaturePicker from "./components/TemperaturePicker";
import BrightnessSlider from "./components/BrightnessSlider";
import ReconnectButton from "./components/ReconnectButton";
import DropLogsButton from "./components/DropLogsButton";

export default function App() {
  const [logMsgs, setLogMsgs] = useState([LogMessage("App started...")]);
  const [bulb, setBulb] = useState(null);
  const [lock, setLock] = useState(false);

  // Nasty hacks to make the color picker work
  const [commitColorChange, setCommitColorChange] = useState(false);

  function log(msg) {
    setLogMsgs((prev) => [...prev, LogMessage(msg)]);
  }

  function dropLogs() {
    setLogMsgs([LogMessage("Logs cleared!")]);
  }

  async function connect() {
    if (lock) {
      log("Connect : lock is on!");
      return;
    }

    setLock(true);
    let bulbLocal = null;
    const retries = 3;
    for (let i = 1; i <= retries && !bulbLocal; i++) {
      try {
        log(`Looking for bulb (try ${i} of ${retries})...`);
        bulbLocal = await SelfDiscover();
        await Connect();
        setBulb(bulbLocal);
        log("Bulb found and connected!");
        setLock(false);
        return;
      } catch (err) {
        bulbLocal ? log(`Can not connect : ${err}`) : log(`Bulb not found! Trying again... : ${err}`);
      }
    }
    log("Bulb not found! Check that it is turned on and retry!");
    setLock(false);
  }

  async function disconnect() {
    if (lock) {
      log("Disconnect : lock is on!");
      return;
    }

    if (!bulb) {
      log("Bulb was null. No need to disconnect!");
      return;
    }

    setLock(true);
    try {
      await Disconnect();
      setBulb(null);
      log("Bulb disconnected!");
    } catch (err) {
      log(`Can not disconnect : ${err}`);
    }
    setLock(false);
  }

  async function reconnect() {
    try {
      await disconnect();
      await connect();
    } catch (err) {
      log(`Can not reconnect : ${err}`);
    }
  }

  async function toggle() {
    if (lock) {
      log("Toggle : lock is on!");
      return;
    }

    if (!bulb) {
      log("Toggle : bulb not connected!");
      return;
    }

    setLock(true);
    log("Toggling bulb...");

    const expectedPower = !bulb.power;
    try {
      bulb.power ? await TurnOff() : await TurnOn();
      setBulb(await GetGuts());
      log(`Bulb is now ${expectedPower ? "ON" : "OFF"}`);
    } catch (err) {
      log(`Can not toggle bulb : ${err}`);
    }

    setLock(false);
  }

  async function commitRGB() {
    if (lock) {
      log("Change RGB : lock is on!");
      return;
    }

    if (!bulb) {
      log("Change color : bulb not connected!");
      return;
    }

    setLock(true);
    log(`Changing color to ${RGBIntToHexString(bulb.rgb)}`);

    try {
      await SetRGBInt(bulb.rgb);
      setBulb(await GetGuts());
      log("Color changed!");
    } catch (err) {
      log(`Can not change color : ${err}`);
    }

    setLock(false);
  }

  function onColorPickerColorChangeEnd(color) {
    setCommitColorChange(true);
  }

  function onColorPickerColorChange(color) {
    setBulb((prev) => {
      return { ...prev, rgb: RGBHexStringToInt(color.hexString) };
    });
  }

  useEffect(() => {
    if (commitColorChange) {
      commitRGB(bulb.rgb);
      setCommitColorChange(false);
    }
  }, [commitColorChange]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-t from-zinc-900 to-zinc-700 text-sky-100">
      <div className="basis-9/12 flex overflow-auto">
        <div className="m-2 outline rounded outline-2 outline-gray-400 basis-2/5 flex flex-col items-center justify-around">
          <BulbButton onClick={toggle} bulbRef={bulb} parentClasses="basis-9/12 flex items-center justify-center" />
          <div className="h-full flex flex-col items-center justify-center gap-4 basis-3/12">
            <ReconnectButton onClick={reconnect} />
            <DropLogsButton onClick={dropLogs} />
          </div>
        </div>
        <LogsSection parentClasses="m-2 basis-3/5" logs={logMsgs} />
      </div>
      <div className="m-2 outline rounded outline-2 outline-gray-400 basis-3/12 flex items-center gap-4 justify-center">
        <ColorPicker
          rgb={bulb ? RGBIntToHexString(bulb.rgb) : undefined}
          onColorChange={onColorPickerColorChange}
          onColorChangeEnd={onColorPickerColorChangeEnd}
        />
        <TemperaturePicker />
        <BrightnessSlider />
      </div>
    </div>
  );
}
