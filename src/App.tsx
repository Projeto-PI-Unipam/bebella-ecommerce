import { useState } from "react";
//import { BrowserRouter, Route, Routes } from "react-router-dom";

import { LoginPage } from "./UserData";
import type { AuthStatus } from "./UserData";
import Topbar from "./Topbar";
import SearchPage from "./SearchPage";

export default function App() {
  const [loginState, makeLogin] = useState(false as AuthStatus);
  if (!loginState) {
    return <LoginPage setter={makeLogin} />;
  }
  return (
    <>
      <Topbar />
      <SearchPage />
    </>
  );
}
