import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

let brightPicker = null;

export default function BrightnessSlider({ onBrightChange, onBrightChangeEnd, bright }) {
  const brightPickerDomRef = useRef(null);

  useEffect(() => {
    if (brightPickerDomRef.current && !brightPicker) {
      brightPicker = new iro.ColorPicker(brightPickerDomRef.current, {
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

      brightPicker.color.value = 50;

      brightPicker.on("input:change", function (color) {
        onBrightChange ? onBrightChange(color) : undefined;
      });

      brightPicker.on("input:end", function (color) {
        onBrightChangeEnd ? onBrightChangeEnd(color) : undefined;
      });
    }

    return () => {
      if (brightPicker) {
        brightPicker = null;
        brightPickerDomRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (brightPicker && bright) {
      brightPicker.color.value = bright;
    }
  }, [bright]);

  return <div className="hover:opacity-95" ref={brightPickerDomRef} />;
}
