import BulbToggle from "./components/BulbToggle";

function BulbImage(props) {
  return <div {...props}>{" Bulb here "}</div>;
}

function LogsScetion(props) {
  return <div {...props}>{" Logs here "}</div>;
}

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
    <button type="button" className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 w-44">
      {" Pick Net interface "}
    </button>
  );
}

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-tr from-slate-900 to-fuchsia-900 text-cyan-200 font-mono">
      <div className="com outline-sky-500 basis-7/12 flex">
        <div className="com outline-orange-300 basis-2/5 flex flex-col items-center justify-around">
          <BulbImage className="com outline-green-300 basis-5/6 flex items-center justify-center" />
          <BulbToggle />
        </div>
        <LogsScetion className="com outline-orange-300 basis-3/5 flex items-center justify-center" />
      </div>

      <div className="com outline-sky-500 basis-4/12 flex justify-around">
        <ColorPicker className="com outline-orange-300 flex items-center justify-center basis-5/12" />
        <TemperaturePicker className="com outline-orange-300 flex items-center justify-center basis-5/12" />
        <BrightnessSlider className="com outline-orange-300 flex items-center justify-center basis-1/12" />
      </div>

      <div className="com outline-sky-500 basis-1/12 flex flex-col items-center justify-center gap-2">
        <NetInterfacePicker className="com outline-orange-300 items-center ring ring-blue-300 hover:ring-blue-400 w-44" />
      </div>
    </div>
  );
}
