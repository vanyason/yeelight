import BulbSVG from "./components/BulbSVG";
import BulbToggle from "./components/BulbToggle";
import LogsSection from "./components/LogsSection";
import ColorPicker from "./components/ColorPicker";
import TemperaturePicker from "./components/TemperaturePicker";
import BrightnessSlider from "./components/BrightnessSlider";
import NetInterfacePicker from "./components/NetInterfacePicker";
import { ClipLoader } from "react-spinners";

import { useState } from "react";

export default function App() {
  const [logMsgs, setLogMsgs] = useState(["Application started. Looking for device ..."]);
  const [bulbConnected, setBulbConnected] = useState(false);

  function log(msg) {
    setLogMsgs([...logMsgs, msg]);
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-violet-900 to-slate-900 text-sky-50">
      <div className="com outline-sky-500 basis-7/12 flex overflow-auto">
        <div className="com outline-orange-300 basis-2/5 flex flex-col items-center justify-around">
          <BulbSVG className="com outline-green-300 basis-8/12 flex items-center justify-center" color="#808080" />
          {!bulbConnected ? <ClipLoader className="absolute" color="#36d7b7" speedMultiplier="0.7" /> : null}
          {bulbConnected ? <BulbToggle /> : null}
          {bulbConnected ? <NetInterfacePicker className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 " /> : null}
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
