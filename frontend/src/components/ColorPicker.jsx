import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

let colorPicker = null;

export default function ColorPicker(props) {
  const colorPickerDomRef = useRef(null);

  useEffect(() => {
    if (colorPickerDomRef.current && !colorPicker) {
      colorPicker = new iro.ColorPicker(colorPickerDomRef.current, {
        width: 250,
        color: "rgb(255, 0, 0)",
        borderWidth: 1,
        borderColor: "#fff",
        layout: [
          {
            component: iro.ui.Wheel,
          },
        ],
      });
      console.log(colorPicker);

      colorPicker.on("input:end", function (color) {
        console.log(color);
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
