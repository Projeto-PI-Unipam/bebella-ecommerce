import type { ObjectId } from "bson";
import {
  createContext,
  type ReactNode,
  useEffect,
  useReducer,
  useState,
} from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.tsx";
import Topbar from "./components/Topbar.tsx";
import { test_p1, test_p2 } from "./database/Test.tsx";
import ItemHandler from "./handlers/ItemHandler.tsx";
import CartPage from "./pages/CartPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import OrdersPage from "./pages/OrdersPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
//import ClothesList from "./components/ClothesList.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import { type ClothesModel } from "./database/Schema.tsx";

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
  sessionStorage.setItem("token", "");
  sessionStorage.removeItem("token");
}

function getToken() {
  const tokenString = sessionStorage.getItem("token");
  if (!tokenString) {
    return null;
  }
  try {
    const userToken = JSON.parse(tokenString);
    return userToken;
  } catch (_e) {
    return null;
  }
}

export const AuthContext = createContext<UserModel | null>(null);

export default function App() {
  const [userToken, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean | null>(null);
  const [userState, putUserState] = useState<UserModel | null>(null);

  function putState(stateOp: { type: string; data: any }) {
    switch (stateOp.type) {
      case "set_state": {
        return stateOp.data;
      }
      case "set_cart": {
        return {
          ...userState!,
          cart_products: stateOp.data,
        };
      }
      case "add_cart": {
        const new_user: UserModel = {
          ...userState!,
          cart_products: [...(userState!.cart_products || []), stateOp.data],
        };
        return new_user;
      }
      case "add_wishlist": {
        const new_user: UserModel = {
          ...userState!,
          wishlist_ids: [...(userState!.wishlist_ids || []), stateOp.data],
        };
        return new_user;
      }
      /* case "fetch_cart": {
				return user?.cart_products ?? [];
			} */
      case "fetch_wish_ids": {
        return userState?.wishlist_ids ?? [];
      }
      default: {
        return userState;
      }
    }
  }

  useEffect(() => {
    async function getUser() {
      setPending(true);
      setToken(getToken());
      if (userToken && userToken.length >= 1 && !userState) {
        const endpoint = "/userapi/parsetoken";
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
            const user_db = await fetch("/userapi/fromtoken", {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              method: "POST",
              body: new URLSearchParams({
                token: userToken,
              }),
            });
            const user_struct = await user_db.json();
            putState({
              type: "set_state",
              data: user_struct,
            });
            console.log(userState);
          }
          setPending(false);
          return;
        } else {
          delToken();
          setPending(true);
          await getUser();
          return;
        }
      }
    }
    getUser();
    return;
  }, [
    location.href,
    location,
    sessionStorage.length,
    location.pathname,
    userToken,
  ]);

  const authPages = [
    ["/cart", <CartPage host={userToken as string} putState={putState} />],
    ["/orders", <OrdersPage host={userToken as string} />],
    ["/admin/items", <ItemHandler host={userToken as string} />],
  ];

  return (
    <div className="max-w-dvw overflow-x-clip">
      <AuthContext value={userState}>
        {!location.pathname.includes("login") && <Topbar host={userToken} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/search/*"
              element={<SearchPage searchType="items" />}
            />

            <Route
              path="/category/*"
              element={<SearchPage searchType="categories" />}
            />

            <Route
              path="/product/*"
              element={<ProductPage putState={putState} />}
            />

            <Route
              path="/login"
              element={<LoginPage setter={setToken} putState={putState} />}
            />

            {pending === false &&
              userState === null &&
              userToken === null &&
              authPages.map((page) => (
                <Route
                  key={page[0] as string}
                  path={page[0] as string}
                  element={
                    <LoginPage
                      redirect={page[0] as string}
                      setter={setToken}
                      putState={putState}
                    />
                  }
                />
              ))}

            {pending === false &&
              (userState !== null || userToken !== null) &&
              authPages.map((page) => (
                <Route
                  key={page[0] as string}
                  path={page[0] as string}
                  element={page[1] as ReactNode}
                />
              ))}
          </Routes>
        </BrowserRouter>
        {!location.pathname.includes("login") && <Footer />}
      </AuthContext>
    </div>
  );
}
