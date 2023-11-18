import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

export default function BrightnessSlider({ onBrightChange, onBrightChangeEnd, bright = 50 }) {
  const brightPickerDomRef = useRef(null);
  const brightPicker = useRef(null);

  useEffect(() => {
    if (brightPickerDomRef.current && !brightPicker.current) {
      brightPicker.current = new iro.ColorPicker(brightPickerDomRef.current, {
        width: 200,
        color: "rgb(0, 0, 0)",
        borderWidth: 1,
        borderColor: "#fff",
        layoutDirection: "horizontal",
        layout: [
          {
            component: iro.ui.Slider,
            options: {
              sliderType: "value",
              sliderSize: 40,
            },
          },
        ],
      });

      brightPicker.current.color.value = 50;

      brightPicker.current.on("input:change", function (color) {
        onBrightChange ? onBrightChange(color) : undefined;
      });

      brightPicker.current.on("input:end", function (color) {
        onBrightChangeEnd ? onBrightChangeEnd(color) : undefined;
      });
    }
  }, []);

  useEffect(() => {
    if (brightPicker.current && bright) {
      brightPicker.current.color.value = bright;
    }
  }, [bright]);

  return <div className="hover:opacity-95" ref={brightPickerDomRef} />;
}
