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
import OrdersPage from "./pages/OrdersPage";

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
    return false;
  }
  const userToken = JSON.parse(tokenString);
  return userToken;
}

export default function App() {
  const [userToken, setToken] = useState(getToken());
  const [tokenValid, setValid] = useState<boolean | null>(null);
  const [activeSession, activateSession] = useState<string | boolean | null>(
    userToken,
  );

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
          if (userToken) {
            activateSession(userToken);
            setValid(true);
          }
        } else {
          delToken();
          setValid(false);
          activateSession(false);
          await getUser();
          return;
        }
      }
    }
    getUser();
    return;
  }, [location.href, location, sessionStorage.length, location.pathname]);

  return (
    <div className="max-w-dvw overflow-x-clip">
      {!location.pathname.includes("login") && <Topbar host={activeSession} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          {/*<Route path="/browse" element={<ClothesList />} />*/}
          <Route
            path="/login"
            element={<LoginPage setter={activateSession} />}
          />
          {activeSession === false ||
            (tokenValid === false && (
              <Route
                path="/cart"
                element={
                  <LoginPage redirect="/cart" setter={activateSession} />
                }
              />
            ))}
          {activeSession &&
            typeof activeSession === "string" &&
            tokenValid === true && (
              <Route
                path="/admin/items"
                element={<ItemHandler host={activeSession} />}
              />
            ) && (
              <Route
                path="/cart"
                element={<CheckoutPage host={activeSession} />}
              />
            ) && (
              <Route
                path="/orders"
                element={<OrdersPage host={activeSession} />}
              />
            )}
        </Routes>
      </BrowserRouter>
      {!location.pathname.includes("login") && <Footer />}
    </div>
  );
}
