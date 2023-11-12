import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

let colorPicker = null;

export default function ColorPicker({ parentClasses }) {
  const colorPickerDomRef = useRef(null);

  useEffect(() => {
    if (colorPickerDomRef.current && !colorPicker) {
      colorPicker = new iro.ColorPicker(colorPickerDomRef.current, {
        width: 200,
        borderWidth: 1,
        borderColor: "#fff",
        layout: [
          {
            component: iro.ui.Wheel,
          },
        ],
      });

      // colorPicker.on("input:end", function (color) {
      // });
    }

    return () => {
      if (colorPicker) {
        colorPicker = null;
        colorPickerDomRef.current = null;
      }
    };
  }, []);

  return <div className={`${parentClasses}`} ref={colorPickerDomRef} />;
}
