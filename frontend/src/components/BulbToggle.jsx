import { useState } from "react";
import IconLightbulbOnSVG from "./IconLightbulbOnSVG";
import IconLightbulbOffSVG from "./IconLightbulbOffSVG";

const common = "sm:w-12 sm:h-12 w-10 h-10 relative rounded-xl transition duration-500 transform p-1 text-white ";
const onCSS = common + "bg-yellow-500 -translate-x-2";
const offCSS = common + "bg-gray-700 translate-x-full";

export default function BulbToggle(props) {
  const [isOn, setIsOn] = useState(true);

  function toggle() {
    setTimeout(setIsOn(!isOn), 250);
  }

  return (
    <button
      className="sm:w-20 sm:h-10 w-14 h-8  rounded-xl bg-white flex items-center transition duration-300 focus:outline-none shadow "
      {...props}
      onClick={toggle}
    >
      <div className={isOn ? onCSS : offCSS}>{isOn ? <IconLightbulbOnSVG /> : <IconLightbulbOffSVG />}</div>
    </button>
  );
}
