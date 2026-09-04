import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
//import Topbar from "./Topbar.tsx";
//import SearchPage from "./SearchPage.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*<Topbar />
    <SearchPage />*/}
    <App />
  </StrictMode>,
);
