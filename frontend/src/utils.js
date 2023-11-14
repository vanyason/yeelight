export function LogMessage(msg) {
  return `[${new Date().toLocaleTimeString()}] ${msg}`;
}

export function RGBHexStringToInt(rgbStr) {
  return parseInt(rgbStr.replace("#", ""), 16);
}

export function RGBIntToHexString(rgbInt) {
  return `#${rgbInt.toString(16).padStart(6, "0")}`;
}
