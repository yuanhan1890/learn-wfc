import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { Solver } from "./components/solver";

const Container = styled.div`
`;

function App() {
  return (
    <Container>
      <Solver />
    </Container>
  );
}

export function main() {
  ReactDOM.render((
    <App />
  ), document.getElementById("app"));
}
