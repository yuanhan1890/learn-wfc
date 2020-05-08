import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { Tooltip } from "antd";
import { PIXEL_SIZE } from "@/contants/ui";
import { store } from "@/store";

const ImageContainer = styled.div`
  position: relative;
  margin-bottom: 10px;
`;

const Pixel = styled.div`
  position: absolute;
  width: ${PIXEL_SIZE}px;
  height: ${PIXEL_SIZE}px;
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
                    <Tooltip title={`x=${x},y=${y},cIndex=${pixel}`} key={`${x}-${y}`}>
                      <Pixel key={`${x}-${y}`} style={{ top: y * PIXEL_SIZE, left: x * PIXEL_SIZE, background: bg }} />
                    </Tooltip>
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
