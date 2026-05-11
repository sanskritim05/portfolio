import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Book } from "./components/Book";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Book />
  </StrictMode>,
);
