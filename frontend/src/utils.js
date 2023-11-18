const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export function LogMessage(msg) {
  return `[${new Date().toLocaleTimeString()}] ${msg}`;
}

export function RGBHexStringToInt(rgbStr) {
  return parseInt(rgbStr.replace("#", ""), 16);
}

export function RGBIntToHexString(rgbInt) {
  return `#${rgbInt.toString(16).padStart(6, "0")}`;
}

export function KelvinToRGBHEXString(kelvin) {
  let temp = kelvin / 100;
  let r, g, b;

  if (temp < 66) {
    r = 255;
    g = -155.25485562709179 - 0.44596950469579133 * (g = temp - 2) + 104.49216199393888 * Math.log(g);
    b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp - 10) + 115.67994401066147 * Math.log(b);
  } else {
    r = 351.97690566805693 + 0.114206453784165 * (r = temp - 55) - 40.25366309332127 * Math.log(r);
    g = 325.4494125711974 + 0.07943456536662342 * (g = temp - 50) - 28.0852963507957 * Math.log(g);
    b = 255;
  }

  return RGBIntToHexString((clamp(Math.floor(r), 0, 255) << 16) + (clamp(Math.floor(g), 0, 255) << 8) + clamp(Math.floor(b), 0, 255));
}
