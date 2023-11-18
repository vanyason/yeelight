import { useState, useEffect } from "react";
import { SelfDiscover, Connect, Disconnect, GetGuts, TurnOn, TurnOff, SetRGBInt, SetTemp, SetBrightness } from "../wailsjs/go/yeelight/YLightBulb";
import { RGBHexStringToInt, RGBIntToHexString } from "./utils";

import useLogs from "./useLogs";

import BulbButton from "./components/BulbButton";
import LogsSection from "./components/LogsSection";
import ColorPicker from "./components/ColorPicker";
import TemperaturePicker from "./components/TemperaturePicker";
import BrightnessSlider from "./components/BrightnessSlider";
import ReconnectButton from "./components/ReconnectButton";
import DropLogsButton from "./components/DropLogsButton";

const COLOR_CHANGE = 1;
const TEMP_CHANGE = 2;
const BRIGHT_CHANGE = 3;

let lock = false;

export default function App() {
  const [logMsgs, log, clearLogs] = useLogs();
  const [bulb, setBulb] = useState(null);

  // Nasty hacks to make the color picker work
  const [commitColorChange, setCommitColorChange] = useState(false);
  const [commitTempChange, setCommitTempChange] = useState(false);
  const [commitBrightnessChange, setCommitBrightnessChange] = useState(false);

  async function connect() {
    if (lock) {
      log("Connect : lock is on!");
      return;
    }

    lock = true;
    let bulbLocal = null;
    const retries = 3;
    for (let i = 1; i <= retries && !bulbLocal; i++) {
      try {
        log(`Looking for bulb (try ${i} of ${retries})...`);
        bulbLocal = await SelfDiscover();
        await Connect();
        setBulb(bulbLocal);
        log("Bulb found and connected!");
        lock = false;
        return;
      } catch (err) {
        bulbLocal ? log(`Can not connect : ${err}`) : log(`Bulb not found! Trying again... : ${err}`);
      }
    }
    log("Bulb not found! Check that it is turned on and retry!");
    lock = false;
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

    lock = true;
    try {
      await Disconnect();
      setBulb(null);
      log("Bulb disconnected!");
    } catch (err) {
      log(`Can not disconnect : ${err}`);
    }
    lock = false;
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

    lock = true;
    log("Toggling bulb...");

    const expectedPower = !bulb.power;
    try {
      bulb.power ? await TurnOff() : await TurnOn();
      setBulb(await GetGuts());
      log(`Bulb is now ${expectedPower ? "ON" : "OFF"}`);
    } catch (err) {
      log(`Can not toggle bulb : ${err}`);
    }

    lock = false;
  }

  async function commit(changeType) {
    if (lock) {
      log("Can`t commit: lock is on!");
      return;
    }

    if (!bulb) {
      log("Can`t commit: bulb not connected!");
      return;
    }

    lock = true;
    log(`Committing new state: [rgb : ${RGBIntToHexString(bulb.rgb)}, temp: ${bulb.ct},brightness: ${bulb.bright}]`);

    try {
      switch (changeType) {
        case COLOR_CHANGE:
          await SetRGBInt(bulb.rgb);
          break;
        case TEMP_CHANGE:
          await SetTemp(bulb.ct);
          break;
        case BRIGHT_CHANGE:
          await SetBrightness(bulb.bright);
          break;
        default:
          log(`Unknown change type ${changeType}`);
          break;
      }
      setBulb(await GetGuts());
      log("State committed!");
    } catch (err) {
      log(`Can not commit new state : ${err}`);
    }

    lock = false;
  }

  function onColorPickerColorChange(color) {
    setBulb((prev) => {
      if (!prev) return;
      return { ...prev, rgb: RGBHexStringToInt(color.hexString), mode: 1 };
    });
  }

  function onTemperaturePickerTempChange(color) {
    setBulb((prev) => {
      if (!prev) return;
      return { ...prev, ct: parseInt(color.kelvin), mode: 2 };
    });
  }

  function onBrightnessSliderBrightChange(color) {
    setBulb((prev) => {
      if (!prev) return;
      return { ...prev, bright: color.value };
    });
  }

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (commitColorChange) {
      commit(COLOR_CHANGE);
      setCommitColorChange(false);
    } else if (commitTempChange) {
      commit(TEMP_CHANGE);
      setCommitTempChange(false);
    } else if (commitBrightnessChange) {
      commit(BRIGHT_CHANGE);
      setCommitBrightnessChange(false);
    }
  }, [commitColorChange, commitTempChange, commitBrightnessChange]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-t from-zinc-900 to-zinc-700 text-sky-100">
      <div className="basis-9/12 flex overflow-auto">
        <div className="m-2 outline rounded outline-2 outline-gray-400 basis-2/5 flex flex-col items-center justify-around">
          <BulbButton onClick={toggle} bulbRef={bulb} parentClasses="basis-9/12 flex items-center justify-center" />
          <div className="h-full flex flex-col items-center justify-center gap-4 basis-3/12">
            <ReconnectButton onClick={reconnect} />
            <DropLogsButton onClick={clearLogs} />
          </div>
        </div>
        <LogsSection parentClasses="m-2 basis-3/5" logs={logMsgs} />
      </div>
      <div className="m-2 outline rounded outline-2 outline-gray-400 basis-3/12 flex items-center gap-4 justify-center">
        <ColorPicker
          rgb={bulb ? RGBIntToHexString(bulb.rgb) : undefined}
          onColorChange={onColorPickerColorChange}
          onColorChangeEnd={() => {
            setCommitColorChange(true);
          }}
        />
        <TemperaturePicker
          temp={bulb ? bulb.ct : undefined}
          onTempChange={onTemperaturePickerTempChange}
          onTempChangeEnd={() => {
            setCommitTempChange(true);
          }}
        />
        <BrightnessSlider
          bright={bulb ? bulb.bright : undefined}
          onBrightChange={onBrightnessSliderBrightChange}
          onBrightChangeEnd={() => {
            setCommitBrightnessChange(true);
          }}
        />
      </div>
    </div>
  );
}
