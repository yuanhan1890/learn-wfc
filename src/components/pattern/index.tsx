import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { PATTERN_SIZE } from "@/contants/ui";
import { store } from "@/store";

const PatternContainer = styled.div`
  position: relative;
  margin-right: 10px;
  margin-bottom: 10px;
`;
const PatternBlockContainer = styled.div`
  position: relative;
`;
const PatternBlock = styled.div`
  position: absolute;
  width: ${PATTERN_SIZE}px;
  height: ${PATTERN_SIZE}px;
`;

function Pattern(props: { value: number[] }) {
  const { value: pattern } = props;
  return (
    <PatternContainer>
      <PatternBlockContainer style={{ width: PATTERN_SIZE * store.size, height: PATTERN_SIZE * store.size }}>
        {
          pattern.map((cIndex, idx) => {
            const x = Math.floor(idx / store.size);
            const y = idx % store.size;
            const color = store.colorFormats[cIndex];
            return (
              <PatternBlock
                key={`${x}-${y}`}
                style={{ top: y * PATTERN_SIZE, left: x * PATTERN_SIZE, background: color.toString() }}
              />
            );
          })
        }
      </PatternBlockContainer>
    </PatternContainer>
  );
}

const Container = styled.div`

`;
const Patterns = styled.div`
  display: flex;
  max-width: ${PATTERN_SIZE * 3 * 8 + 10 * 8}px;
  flex-wrap: wrap;
`;

function PatternPanelRaw() {
  return (
    <Container>
      <div>{`total pattern: ${store.patterns.length}`}</div>
      <Patterns>
        {
          store.patterns.map((pattern, idx) => {
            return <Pattern value={pattern} key={idx} />;
          })
        }
      </Patterns>
    </Container>
  );
}

export const PatternPanel = observer(PatternPanelRaw);
