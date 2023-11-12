import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

let tempPicker = null;

export default function TemperaturePicker({ parentClasses }) {
  const colorPickerDomRef = useRef(null);

  useEffect(() => {
    if (colorPickerDomRef.current && !tempPicker) {
      tempPicker = new iro.ColorPicker(colorPickerDomRef.current, {
        width: 200,
        borderWidth: 1,
        borderColor: "#fff",
        layoutDirection: "horizontal",
        layout: [
          {
            component: iro.ui.Slider,
            options: {
              sliderType: "kelvin",
              sliderSize: 40,
              sliderShape: "circle",
            },
          },
        ],
      });

      // tempPicker.on("input:end", function (color) {
      //   console.log(color.kelvin);
      //   console.log(color.value);
      // });
    }

    return () => {
      if (tempPicker) {
        tempPicker = null;
        colorPickerDomRef.current = null;
      }
    };
  }, []);

  return <div className={`${parentClasses}`} ref={colorPickerDomRef} />;
}
