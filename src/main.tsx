import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
//import App from "./App.tsx";
import Topbar from "./Topbar.tsx";
import Sidemenu from "./Sidemenu.tsx";
import ProductPage from "./ProductPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Topbar />
    {/*<Sidemenu />*/}
    <ProductPage />
    {/*<App />*/}
  </StrictMode>,
);
