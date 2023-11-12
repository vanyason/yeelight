import { useState, useEffect } from "react";
import { SelfDiscover, Connect, Disconnect, GetGuts, TurnOn, TurnOff } from "../wailsjs/go/yeelight/YLightBulb";

import BulbButton from "./components/BulbButton";
import LogsSection from "./components/LogsSection";
import ColorPicker from "./components/ColorPicker";
import TemperaturePicker from "./components/TemperaturePicker";
import BrightnessSlider from "./components/BrightnessSlider";
import ReconnectButton from "./components/ReconnectButton";
import DropLogsButton from "./components/DropLogsButton";

function LogMessage(msg) {
  return `[${new Date().toLocaleTimeString()}] ${msg}`;
}

export default function App() {
  const [logMsgs, setLogMsgs] = useState([LogMessage("App started...")]);
  const [bulb, setBulb] = useState(null);
  const [lock, setLock] = useState(false);

  function log(msg) {
    setLogMsgs((prev) => [...prev, LogMessage(msg)]);
  }

  function dropLogs() {
    setLogMsgs([LogMessage("Logs cleared!")]);
  }

  async function connect() {
    if (lock) return;

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
    if (lock) return;

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
    if (lock) return;

    if (!bulb) {
      log("Bulb not connected!");
      return;
    }

    setLock(true);
    try {
      bulb.power ? await TurnOff() : await TurnOn();
      setBulb(await GetGuts());
    } catch (err) {
      log(`Can not toggle bulb : ${err}`);
    }
    setLock(false);
  }

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
      <div className="m-2 outline rounded outline-2 outline-gray-400 basis-3/12 flex items-center justify-center">
        <ColorPicker parentClasses="m-2 hover:opacity-95" />
        <TemperaturePicker parentClasses="m-2 hover:opacity-95 " />
        <BrightnessSlider parentClasses="m-2 hover:opacity-95" />
      </div>
    </div>
  );
}
