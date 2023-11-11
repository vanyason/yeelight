import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

let colorPicker = null;

export default function TemperaturePicker(props) {
  const colorPickerDomRef = useRef(null);

  useEffect(() => {
    if (colorPickerDomRef.current && !colorPicker) {
      colorPicker = new iro.ColorPicker(colorPickerDomRef.current, {
        width: 250,
        color: "rgb(255, 0, 0)",
        borderWidth: 1,
        borderColor: "#fff",
        layoutDirection: "horizontal",
        layout: [
          {
            component: iro.ui.Slider,
            options: {
              sliderType: "kelvin",
              sliderSize: 40,
            },
          },
        ],
      });

      colorPicker.on("input:end", function (color) {
        console.log(color.kelvin);
        console.log(color.value);
      });
    }

    return () => {
      if (colorPicker) {
        colorPicker = null;
        colorPickerDomRef.current = null;
      }
    };
  }, []);

  return <div {...props} ref={colorPickerDomRef} />;
}
