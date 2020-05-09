import React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";
import { wave } from "@/stores/wave";
import { Tile } from "../tile";

const Container = styled.div``;
const TilesContainer = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
`;
const TileContainer = styled.div`
  margin: 5px;
`;
const TileName = styled.div`
  white-space: nowrap;
  width: 80px;
`;
const TileBlock = styled.div``;

function TilesRaw() {
  const tileSize = wave.tileSize * 4;

  return (
    <Container>
      <TilesContainer>
        {
          wave.tiles.map((t) => {
            return (
              <TileContainer key={t.name}>
                <TileName>{t.name}</TileName>
                <TileBlock>
                  <Tile data={t} size={tileSize} />
                </TileBlock>
              </TileContainer>
            );
          })
        }
      </TilesContainer>
    </Container>
  );
}

export const Tiles = observer(TilesRaw);
