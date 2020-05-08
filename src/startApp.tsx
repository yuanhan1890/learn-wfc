import * as ReactDOM from "react-dom";
import * as React from "react";
import styled from "styled-components";
import { Image } from "@/components/image";
import { Palette } from "@/components/palette";
import { PatternPanel } from "./components/pattern";
import "antd/dist/antd.css";

const Layout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;
const Left = styled.div`
  border-right: 1px solid black;
  max-height: 100%;
  overflow: auto;
`;
const Right = styled.div`
`;

export function start() {
  ReactDOM.render((
    <Layout>
      <Left>
        <Image />
        <Palette />
        <PatternPanel />
      </Left>
      <Right>

      </Right>
    </Layout>
  ), document.getElementById("app"));
}
