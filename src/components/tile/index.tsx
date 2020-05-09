import React from "react";
import { ITile } from "@/stores/wave";

export function Tile(props: { data: ITile; size: number }) {
  const { data } = props;
  return (
    <div style={{
      width: props.size,
      height: props.size,
      backgroundImage: `url(${data.url})`,
      backgroundSize: "cover",
      transform: `rotate(${data.rotate || 0}deg) scaleX(${data.scaleX || 1})`,
    }} />
  );
}
