import React, { Fragment } from "react";
import { render } from "react-dom";
import { AppContainer as ReactHotAppContainer } from "react-hot-loader";
import "./app.global.css";

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener("DOMContentLoaded", () => {
  // eslint-disable-next-line global-require
  const Root = require("./Pages/Root").default;
  render(
    <AppContainer>
      <Root />
    </AppContainer>,
    document.getElementById("root")
  );
});