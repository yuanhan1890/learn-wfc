import Tinycolor from "tinycolor2";

export function isColorEqual(c1: Tinycolor.Instance, c2: Tinycolor.Instance) {
  return c1.toString() === c2.toString();
}
