import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

export default function TemperaturePicker({ onTempChange, onTempChangeEnd, temp = 4250 }) {
  const tempPickerDomRef = useRef(null);
  const tempPicker = useRef(null);

  useEffect(() => {
    if (tempPickerDomRef.current && !tempPicker.current) {
      tempPicker.current = new iro.ColorPicker(tempPickerDomRef.current, {
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

      tempPicker.current.color.kelvin = 4250;

      tempPicker.current.on("input:change", function (color) {
        onTempChange ? onTempChange(color) : undefined;
      });

      tempPicker.current.on("input:end", function (color) {
        onTempChangeEnd ? onTempChangeEnd(color) : undefined;
      });
    }
  }, []);

  useEffect(() => {
    if (tempPicker.current && temp) {
      tempPicker.current.color.kelvin = temp;
    }
  }, [temp]);

  return <div className="hover:opacity-95" ref={tempPickerDomRef} />;
}
