import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { Tiles } from "./components/Tiles";
import { Rules } from "./components/rules";
import { Solver } from "./components/solver";
import { Operations } from "./components/operations";

const Container = styled.div`
`;

function App() {
  return (
    <Container>
      <Tiles />
      <Rules />
      <Operations />
      <Solver />
    </Container>
  );
}

export function main() {
  ReactDOM.render((
    <App />
  ), document.getElementById("app"));
}
