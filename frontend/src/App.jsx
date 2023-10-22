import BulbSVG from "./components/BulbSVG";
import BulbToggle from "./components/BulbToggle";
import LogsSection from "./components/LogsScetion";
import { ClipLoader } from "react-spinners";

function ColorPicker(props) {
  return <div {...props}>{" Color Picker "}</div>;
}

function TemperaturePicker(props) {
  return <div {...props}>{" Temperature picker "}</div>;
}

function BrightnessSlider(props) {
  return <div {...props}>{" Bright "}</div>;
}

function NetInterfacePicker(props) {
  return (
    <button type="button" className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 sm:w-20 sm:h-10 w-20 h-6">
      {" Pick Net interface "}
    </button>
  );
}

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-violet-900 to-slate-900 text-sky-50">
      <div className="com outline-sky-500 basis-7/12 flex overflow-auto">
        <div className="com outline-orange-300 basis-2/5 flex flex-col items-center justify-around">
          <BulbSVG className="com outline-green-300 basis-8/12 flex items-center justify-center" color="#808080" />
          <ClipLoader className="absolute" color="#36d7b7" speedMultiplier="0.7" />
          {/* <BulbToggle />
          <NetInterfacePicker className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 " /> */}
        </div>
        <LogsSection className="com p-4 outline-orange-300 basis-3/5 overflow-auto font-mono bg-gradient-to-b from-indigo-900 to-slate-900 ring-offset-2 ring" />
      </div>
      <div className="com outline-sky-500 basis-5/12 flex justify-around">
        <ColorPicker className="com outline-orange-300 flex items-center justify-center basis-5/12" />
        <TemperaturePicker className="com outline-orange-300 flex items-center justify-center basis-5/12" />
        <BrightnessSlider className="com outline-orange-300 flex items-center justify-center basis-1/12" />
      </div>
    </div>
  );
}
