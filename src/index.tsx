import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Make sure you have this for Tailwind

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
