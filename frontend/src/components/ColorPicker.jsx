import React, { useRef, useEffect } from "react";
import iro from "@jaames/iro";

export default function ColorPicker({ onColorChange, onColorChangeEnd, rgb = "#FFFFFF" }) {
  const colorPickerDomRef = useRef(null);
  const colorPicker = useRef(null);

  useEffect(() => {
    if (colorPickerDomRef.current && !colorPicker.current) {
      colorPicker.current = new iro.ColorPicker(colorPickerDomRef.current, {
        width: 200,
        borderWidth: 1,
        borderColor: "#fff",
        layout: [
          {
            component: iro.ui.Wheel,
          },
        ],
      });

      colorPicker.current.on("input:change", function (color) {
        onColorChange ? onColorChange(color) : undefined;
      });

      colorPicker.current.on("input:end", function (color) {
        onColorChangeEnd ? onColorChangeEnd(color) : undefined;
      });
    }
  }, []);

  useEffect(() => {
    if (colorPicker.current && rgb) {
      colorPicker.current.color.set(rgb);
    }
  }, [rgb]);

  return <div className="hover:opacity-95" ref={colorPickerDomRef} />;
}
