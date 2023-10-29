import { useState, useRef, useEffect } from "react";
import { Discover } from "../wailsjs/go/main/App.js";

import BulbSVG from "./components/BulbSVG";
import BulbToggle from "./components/BulbToggle";
import LogsSection from "./components/LogsSection";
import ColorPicker from "./components/ColorPicker";
import TemperaturePicker from "./components/TemperaturePicker";
import BrightnessSlider from "./components/BrightnessSlider";
import ReconnectButton from "./components/ReconnectButton";

function logMessage(msg) {
  return `[${new Date().toLocaleTimeString()}] ${msg}`;
}

export default function App() {
  const [logMsgs, setLogMsgs] = useState([logMessage("App started...")]);
  const [bulbConnected, setBulbConnected] = useState(false);
  const yBulb = useRef(null);

  function log(msg) {
    setLogMsgs((logMsgs) => [...logMsgs, logMessage(msg)]);
  }

  async function findAndConnectBulb() {
    let b = null;
    while (!b) {
      try {
        b = await Discover();
        log("Bulb found!" + b);
        yBulb.current = b;
        setBulbConnected(true);
        console.log(yBulb.current);
      } catch (err) {
        log("Bulb not found! Try again... comes from catch" + err);
      }
    }
  }

  useEffect(() => {
    log("Looking for bulb...");
    // findAndConnectBulb();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-violet-900 to-slate-900 text-sky-50">
      <div className="com outline-sky-500 basis-7/12 flex overflow-auto">
        <div className="com outline-orange-300 basis-2/5 flex flex-col items-center justify-around">
          <BulbSVG className="com outline-green-300 basis-10/12 flex items-center justify-center" color="#808080" connected={+bulbConnected} />
          <div className="com flex w-full items-center justify-evenly basis-2/12">
            {bulbConnected && <ReconnectButton className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 " />}
            {bulbConnected && <BulbToggle />}
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
