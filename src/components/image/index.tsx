import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { PIXEL_SIZE } from "@/contants/ui";
import { store } from "@/store";

const ImageContainer = styled.div`
  position: relative;
`;

const Pixel = styled.div`
  position: absolute;
  width: ${PIXEL_SIZE}px;
  height: ${PIXEL_SIZE}px;
`;

function ImageRaw() {
  if (store.width === 0) {
    return null;
  }

  return (
    <ImageContainer style={{ width: store.width * PIXEL_SIZE, height: store.height * PIXEL_SIZE }}>
      {
        store.imagePixels.map((row, x) => {
          return (
            <React.Fragment key={x}>
              {
                row.map((pixel, y) => {
                  const color = store.colors[pixel];
                  const bg = `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;
                  return (
                    <Pixel key={`${x}-${y}`} style={{ top: y * PIXEL_SIZE, left: x * PIXEL_SIZE, background: bg }} />
                  );
                })
              }
            </React.Fragment>
          );
        })
      }
    </ImageContainer>
  );
}

export const Image = observer(ImageRaw);
