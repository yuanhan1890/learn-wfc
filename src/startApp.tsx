import * as ReactDOM from "react-dom";
import * as React from "react";
import { Image } from "@/components/image";

export function start() {
  ReactDOM.render(<Image />, document.getElementById("app"));
}
