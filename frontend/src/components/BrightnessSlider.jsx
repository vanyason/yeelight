import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

let brightPicker = null;

export default function BrightnessSlider({ parentClasses }) {
  const colorPickerDomRef = useRef(null);

  useEffect(() => {
    if (colorPickerDomRef.current && !brightPicker) {
      brightPicker = new iro.ColorPicker(colorPickerDomRef.current, {
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

      // brightPicker.on("input:end", function (color) {
      //   console.log(color.value);
      // });
    }

    return () => {
      if (brightPicker) {
        brightPicker = null;
        colorPickerDomRef.current = null;
      }
    };
  }, []);

  return <div className={`${parentClasses}`} ref={colorPickerDomRef} />;
}
