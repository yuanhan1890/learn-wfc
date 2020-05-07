import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { COLOR_BLOCK_SIZE } from "@/contants/ui";
import { store } from "@/store";

const Container = styled.div`
  display: flex;
`;
const Color = styled.div`
  margin-right: 10px;
  border: 1px solid black;
  padding: 3px;
`;
const ColorBlockDisplay = styled.div`
  display: flex;
  align-items: center;
`;
const ColorBlockOrder = styled.div`
  margin-right: 10px;
`;
const ColorBlock = styled.div`
  width: ${COLOR_BLOCK_SIZE}px;
  height: ${COLOR_BLOCK_SIZE}px;
  border: 1px solid black;
`;
const ColorName = styled.div`
  font-size: ${Math.max(COLOR_BLOCK_SIZE, 12)}px;
  font-style: italic;
`;

function PaletteRaw() {
  return (
    <Container>
      {
        store.colorFormats.map((c, index) => {
          const colorStr = c.toString();
          return (
            <Color key={colorStr}>
              <ColorBlockDisplay>
                <ColorBlockOrder>{index}</ColorBlockOrder>
                <ColorBlock style={{ background: colorStr }} />
              </ColorBlockDisplay>
              <ColorName>{`${c.toHexString()}, ${Math.floor(c.getAlpha() * 255)}`}</ColorName>
            </Color>
          );
        })
      }
    </Container>
  );
}

export const Palette = observer(PaletteRaw);
