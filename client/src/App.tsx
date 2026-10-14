import { BrowserRouter, Route, Routes } from "react-router-dom";
import Topbar from "./components/Topbar";
import { useEffect, useState } from "react";
import { ObjectId } from "bson";
//import ClothesList from "./components/ClothesList";
import SearchPage from "./pages/SearchPage";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";
import ItemHandler from "./handlers/ItemHandler";
import LoginPage from "./pages/LoginPage";
import Footer from "./components/Footer";

export interface UserModel {
  id?: ObjectId;
  func_id?: number;
  name: string;
  email: string;
  hash: string;
  salt: string;
  birth_date: Date;
  picture_url?: string;
  wishlist_ids?: string[];
  cart_products?: string[];
  order_addresses?: string[];
  past_orders?: string[];
}

export function saveToken(token: string) {
  sessionStorage.setItem("token", JSON.stringify(token));
}

function delToken() {
  sessionStorage.setItem("token", null);
}

function getToken() {
  const tokenString = sessionStorage.getItem("token");
  if (!tokenString) {
    return null;
  }
  const userToken = JSON.parse(tokenString);
  return userToken;
}

export default function App() {
  const [activeSession, activateSession] = useState<string | null>(null);
  const [userToken, setToken] = useState(getToken());

  useEffect(() => {
    async function getUser() {
      if (userToken && userToken.length >= 1) {
        const endpoint = import.meta.env.VITE_ENDPOINT + "/userapi/parsetoken";
        const check = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
          body: new URLSearchParams({
            token: userToken,
          }),
        });
        if (check.ok) {
          setToken(userToken);
          saveToken(userToken);
          activateSession(userToken);
        } else {
          delToken();
          await getUser();
          return;
        }
      }
    }
    getUser();
    return;
  }, [location.href, location, sessionStorage.length]);
  return (
    <div>
      {!location.pathname.includes("login") && <Topbar host={activeSession} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          {/*<Route path="/browse" element={<ClothesList />} />*/}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/user/checkout"
            element={<CheckoutPage host={activeSession} />}
          />
          <Route
            path="/admin/items"
            element={<ItemHandler host={activeSession} />}
          />
        </Routes>
      </BrowserRouter>
      {!location.pathname.includes("login") && <Footer />}
    </div>
  );
}
