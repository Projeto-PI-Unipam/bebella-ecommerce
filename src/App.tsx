import {
  createContext,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.tsx";
import Topbar from "./components/Topbar.tsx";
import ItemHandler from "./handlers/ItemHandler.tsx";
import CartPage from "./pages/CartPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import OrdersPage from "./pages/OrdersPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import { type DBState } from "./database/Schema.tsx";
import { type UserModel } from "./database/Schema.tsx";
const AdminPage = lazy(() => import("./pages/AdminPage.tsx"));

export function saveToken(token: string) {
  localStorage.setItem("token", JSON.stringify(token));
}

function delToken() {
  localStorage.setItem("token", "");
  localStorage.removeItem("token");
  localStorage.setItem("userdata", "");
  localStorage.removeItem("userdata");
}

function getToken() {
  const tokenString = localStorage.getItem("token");
  if (!tokenString) {
    return null;
  }
  try {
    const userToken: string = (JSON.parse(tokenString) as string).replace(
      /['"]/g,
      "",
    );
    return userToken;
  } catch (_e) {
    return null;
  }
}

export const AuthContext = createContext<UserModel | null>(null);
export const DBContext = createContext<DBState>({ count: 0 });

export default function App() {
  const [userToken, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean | null>(null);
  const [dbState, putDB] = useState<DBState>({ count: 0 });
  const [userState, putUserState] = useState<UserModel | null>(
    localStorage.getItem("userdata") === null
      ? null
      : JSON.parse(localStorage.getItem("userdata")!),
  );

  function putState(stateOp: { type: string; data: any }) {
    if (!stateOp.type || !stateOp.data) {
      return;
    }
    switch (stateOp.type) {
      case "set_state": {
        putUserState(stateOp.data);
        localStorage.setItem("userdata", JSON.stringify(stateOp.data));
        return;
      }
      case "set_cart": {
        putUserState({ ...userState!, cart_products: stateOp.data });
        localStorage.setItem(
          "userdata",
          JSON.stringify({ ...userState!, cart_products: stateOp.data }),
        );
        return;
      }
      case "add_cart": {
        const new_user: UserModel = {
          ...userState!,
          cart_products: [...(userState!.cart_products || []), stateOp.data],
        };
        localStorage.setItem("userdata", JSON.stringify(new_user));
        putUserState(new_user);
        return;
      }
      case "add_wishlist": {
        const new_user: UserModel = {
          ...userState!,
          wishlist_ids: [...(userState!.wishlist_ids || []), stateOp.data],
        };
        localStorage.setItem("userdata", JSON.stringify(new_user));
        putUserState(new_user);
        return;
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
    async function getDBCount() {
      const dbs = dbState.refreshTime
        ? dbState
        : localStorage.getItem("dbState") === null
          ? null
          : JSON.parse(localStorage.getItem("dbState")!);
      if (
        dbs &&
        dbs.refreshTime &&
        new Date().valueOf() - dbs.refreshTime.valueOf() < 1 * 60 * 60 * 1000
      ) {
        return;
      }
      const res = await fetch("/items/count");
      if (res.ok) {
        const body = await res.json();
        const num = parseInt(body);
        const state = { count: num, refreshTime: new Date() };
        putDB(state);
        localStorage.setItem("dbState", JSON.stringify(state));
      } else {
        console.error(res);
      }
    }
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
            const user_struct: UserModel = await user_db.json();
            putState({
              type: "set_state",
              data: user_struct,
            });
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
    getDBCount();
    getUser();
    setPending(false);
    return;
  }, [
    location.href,
    location,
    localStorage.length,
    location.pathname,
    userToken,
  ]);

  const authPages = [
    ["/cart", <CartPage host={userToken as string} putState={putState} />],
    ["/orders", <OrdersPage host={userToken as string} />],
    ["/admin/items", <ItemHandler host={userToken as string} />],
    [
      "/painel/*",
      <Suspense fallback={<p className="p-10">Carregando painel…</p>}>
        <AdminPage host={userToken} />
      </Suspense>,
    ],
  ];

  return (
    <div className="max-w-dvw overflow-x-clip">
      <AuthContext value={userState}>
        {!location.pathname.includes("login") &&
          !location.pathname.startsWith("/painel") && (
            <Topbar host={userToken} />
          )}
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
              element={<ProductPage host={userToken} putState={putState} />}
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
        {!location.pathname.includes("login") &&
          !location.pathname.startsWith("/painel") && <Footer />}
      </AuthContext>
    </div>
  );
}
