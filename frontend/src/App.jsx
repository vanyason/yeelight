import { useState, useEffect } from "react";
import { SelfDiscover, Connect, Disconnect, GetGuts } from "../wailsjs/go/yeelight/YLightBulb";
import { TurnOn, TurnOff } from "../wailsjs/go/yeelight/YLightBulb";

import { LogMessage } from "./utils/Utils";

import BulbSVG from "./components/BulbSVG";
import BulbToggle from "./components/BulbToggle";
import LogsSection from "./components/LogsSection";
import ColorPicker from "./components/ColorPicker";
import TemperaturePicker from "./components/TemperaturePicker";
import BrightnessSlider from "./components/BrightnessSlider";
import ReconnectButton from "./components/ReconnectButton";

export function BulbConnected(bulb) {
  return bulb !== null;
}

export default function App() {
  const [logMsgs, setLogMsgs] = useState([LogMessage("App started...")]);
  const [bulb, setBulb] = useState(null);

  function log(msg) {
    setLogMsgs((prev) => [...prev, LogMessage(msg)]);
  }

  async function connect() {
    let bulbLocal = null;
    while (!bulbLocal) {
      try {
        bulbLocal = await SelfDiscover();
        await Connect();
        setBulb(bulbLocal);
        log("Bulb found and connected!");
      } catch (err) {
        if (!bulbLocal) {
          log("Bulb not found! Trying again... : " + err);
        } else {
          log("Can not connect :" + err);
        }
      }
    }
  }

  async function disconnect() {
    if (!BulbConnected(bulb)) {
      log("Bulb was null. No need to disconnect!");
      return;
    }

    try {
      await Disconnect();
      setBulb(null);
      log("Bulb disconnected!");
    } catch (err) {
      log("Can not disconnect :" + err);
    }
  }

  async function reconnect() {
    try {
      await disconnect();
      await connect();
    } catch (err) {
      log("Can not reconnect :" + err);
    }
  }

  async function toggleBulb() {
    if (!BulbConnected(bulb)) {
      log("Bulb not connected!");
      return;
    }

    try {
      bulb.power ? await TurnOff() : await TurnOn();
      let b = await GetGuts();
      setBulb(b);
    } catch (err) {
      log("Can not toggle bulb :" + err);
    }
  }

  useEffect(() => {
    log("Looking for bulb...");
    connect();
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-violet-900 to-slate-900 text-sky-50">
      <div className="com outline-sky-500 basis-7/12 flex overflow-auto">
        <div className="com outline-orange-300 basis-2/5 flex flex-col items-center justify-around">
          <BulbSVG
            className="com outline-green-300 basis-10/12 flex items-center justify-center"
            color={BulbConnected(bulb) ? "#" + bulb.rgb.toString(16) : undefined}
            connected={+BulbConnected(bulb)}
          />
          <div className="com flex w-full items-center justify-evenly basis-2/12">
            {BulbConnected(bulb) && (
              <ReconnectButton onClick={reconnect} className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 " />
            )}
            {BulbConnected(bulb) && <BulbToggle clickCallback={toggleBulb} mode={BulbConnected(bulb) ? bulb.power : true} />}
          </div>
        </div>
        <LogsSection
          logs={logMsgs}
          className="com p-4 outline-orange-300 basis-3/5 overflow-auto font-mono bg-gradient-to-b from-indigo-900 to-slate-900 ring-offset-2 ring"
        />
      </div>
      <div className="com outline-sky-500 basis-5/12 flex justify-around">
        <ColorPicker className="com outline-orange-300 flex items-center justify-center basis-5/12" />
        <TemperaturePicker className="com outline-orange-300 flex items-center justify-center basis-5/12" />
        <BrightnessSlider className="com outline-orange-300 flex items-center justify-center basis-1/12" />
      </div>
    </div>
  );
}
