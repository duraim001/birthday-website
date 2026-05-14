import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
/** Replace `sword-cursor.jpeg` with your sword PNG/JPEG; hotspot = blade tip in pixels (x, y) from top-left */
import swordCursorUrl from "./sword-cursor.jpeg";

const cursorCss = document.createElement("style");
cursorCss.setAttribute("data-site-cursor", "1");
cursorCss.textContent = `
  html, body, #root,
  button, a, [role="button"], label, summary, .cursor-site {
    cursor: url("${swordCursorUrl}") 6 4, pointer !important;
  }
  input, textarea, select {
    cursor: text !important;
  }
`;
document.head.appendChild(cursorCss);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
