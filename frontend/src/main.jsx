import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./main.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  // TODO: Wrap the <App /> component in a <React.StrictMode> component.
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
