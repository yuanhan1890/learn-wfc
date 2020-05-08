import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { OUTPUT_PIXEL_SIZE, OUTPUT_PIXEL_GAP } from "@/contants/ui";
import { store } from "@/store";

const ImageContainer = styled.div`
  position: relative;
  margin-bottom: 10px;
`;

const Pixel = styled.div`
  position: absolute;
  width: ${OUTPUT_PIXEL_SIZE}px;
  height: ${OUTPUT_PIXEL_SIZE}px;
  background: #eee;
  &:hover {
    &:before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.4);
    }
  }
`;

function OutputImageRaw() {
  if (store.width === 0) {
    return null;
  }

  const rows = [] as any[];
  for (let y = 0; y < store.outputHeight; y += 1) {
    const row = [] as any[];
    for (let x = 0; x < store.outputWidth; x += 1) {
      const top = y * OUTPUT_PIXEL_SIZE + OUTPUT_PIXEL_GAP * y;
      const left = x * OUTPUT_PIXEL_SIZE + OUTPUT_PIXEL_GAP * x;
      row.push((
        <Pixel
          key={`${x}-${y}`}
          style={{ top, left }}
        />
      ));
    }
    rows.push((
      <React.Fragment key={y}>
        {row}
      </React.Fragment>
    ));
  }

  return (
    <ImageContainer style={{ width: store.width * OUTPUT_PIXEL_SIZE, height: store.height * OUTPUT_PIXEL_SIZE }}>
      {rows}
    </ImageContainer>
  );
}

export const OutputImage = observer(OutputImageRaw);
