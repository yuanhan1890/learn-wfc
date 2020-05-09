import React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";
import { wave } from "@/stores/wave";
import { Tile } from "../tile";

const Container = styled.div`
  width: 400px;
  height: 400px;
  display: flex;
  flex-wrap: wrap;
`;

function SolverRaw() {
  if (!wave.result) {
    return null;
  }

  const tiles = [] as any[];
  for (let j = 0; j < 10; j += 1) {
    for (let i = 0; i < 10; i += 1) {
      const tileIndex = wave.result[i + j * 10];
      tiles.push((
        <Tile key={`${i}-${j}`} data={wave.tiles[tileIndex]} size={40} />
      ));
    }
  }
  return (
    <Container>
      {tiles}
    </Container>
  );
}

export const Solver = observer(SolverRaw);
