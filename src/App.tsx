import { useState } from "react";
//import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./LoginPage";
import Topbar from "./Topbar";
import SearchPage from "./SearchPage";

export default function App() {
    const [loginState, makeLogin] = useState(false);
    if (!loginState) {
        return <LoginPage />;
    }
    return (
        <>
            <Topbar />
            <SearchPage />
        </>
    );
}
