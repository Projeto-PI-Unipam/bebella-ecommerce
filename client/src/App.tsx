import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Navbar from "./components/Navbar";
import Topbar from "./components/Topbar";
import { useEffect, useState } from "react";
import { ObjectId } from "bson";
import ClothesList from "./components/ClothesList";
import SearchPage from "./pages/SearchPage";
import HomePage from "./pages/HomePage";
import ItemHandler from "./handlers/ItemHandler";

export const b_port = 5180;

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

function saveToken(token: string) {
  sessionStorage.setItem("token", JSON.stringify(token));
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
        const check = await fetch(
          `http://localhost:${b_port}/userapi/parsetoken`,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            body: new URLSearchParams({
              token: userToken,
            }),
          },
        );
        if (check.ok) {
          setToken(userToken);
          saveToken(userToken);
          activateSession(userToken);
        }
      } else {
        const user_exists = await fetch(
          `http://localhost:${b_port}/userapi/check`,
          {
            method: "POST",
            body: JSON.stringify({
              email: "admin2@admin2.com",
            }),
          },
        );
        if (!user_exists.ok) {
          console.error(user_exists.statusText);
          return;
        } else if (!user_exists.json()) {
          alert("Usuário não cadastrado");
          return;
        } else {
          const user_data = await fetch(
            `http://localhost:${b_port}/userapi/login`,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              method: "POST",
              body: new URLSearchParams({
                email: "admin2@admin2.com",
                password: "teste",
              }),
            },
          );
          if (!user_data.ok) {
            console.error(user_data.statusText);
          } else if (!user_data) {
            alert("Informações Incorretas");
          } else {
            const res = await user_data.text();
            setToken(res);
            saveToken(res);
            activateSession(res);
          }
        }
      }
    }
    getUser();
    return;
  }, [location.pathname, sessionStorage.length]);
  return (
    <div className="w-full p-6">
      <Topbar host={activeSession} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/browse" element={<ClothesList />} />
          <Route
            path="/admin/items"
            element={<ItemHandler host={activeSession} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
