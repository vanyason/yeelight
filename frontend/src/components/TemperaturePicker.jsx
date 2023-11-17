import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

let tempPicker = null;

export default function TemperaturePicker({ onTempChange, onTempChangeEnd, temp }) {
  const tempPickerDomRef = useRef(null);

  useEffect(() => {
    if (tempPickerDomRef.current && !tempPicker) {
      tempPicker = new iro.ColorPicker(tempPickerDomRef.current, {
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
              minTemperature: 2000,
              maxTemperature: 6500,
            },
          },
        ],
      });

      tempPicker.color.kelvin = 4250;

      tempPicker.on("input:change", function (color) {
        onTempChange ? onTempChange(color) : undefined;
      });

      tempPicker.on("input:end", function (color) {
        onTempChangeEnd ? onTempChangeEnd(color) : undefined;
      });
    }

    return () => {
      if (tempPicker) {
        tempPicker = null;
        tempPickerDomRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (tempPicker && temp) {
      tempPicker.color.kelvin = temp;
    }
  }, [temp]);

  return <div className="hover:opacity-95" ref={tempPickerDomRef} />;
}
