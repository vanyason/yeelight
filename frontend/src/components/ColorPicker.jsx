import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

let colorPicker = null;

export default function ColorPicker({ onColorChange, onColorChangeEnd, rgb = "#FFFFFF" }) {
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

      colorPicker.on("input:change", function (color) {
        onColorChange ? onColorChange(color) : undefined;
      });

      colorPicker.on("input:end", function (color) {
        onColorChangeEnd ? onColorChangeEnd(color) : undefined;
      });
    }

    return () => {
      if (colorPicker) {
        colorPicker = null;
        colorPickerDomRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (colorPicker) {
      colorPicker.color.set(rgb);
    }
  }, [rgb]);

  return <div className="hover:opacity-95" ref={colorPickerDomRef} />;
}
