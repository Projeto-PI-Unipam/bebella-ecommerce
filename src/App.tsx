import type { ObjectId } from "bson";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Topbar from "./components/Topbar";
import { test_p1, test_p2 } from "./database/Test";
import ItemHandler from "./handlers/ItemHandler";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import ProductPage from "./pages/ProductPage";
//import ClothesList from "./components/ClothesList";
import SearchPage from "./pages/SearchPage";

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
		return false;
	}
	const userToken = JSON.parse(tokenString);
	return userToken;
}

export const AuthContext = createContext<UserModel | null>(null);

export default function App() {
	const [userToken, setToken] = useState(getToken());
	const [tokenValid, setValid] = useState<boolean | null>(null);
	const [activeSession, activateSession] = useState<string | boolean | null>(
		userToken,
	);
	const [userAuth, setUser] = useState<UserModel | null>(null);

	const check =
		activeSession && typeof activeSession === "string" && tokenValid !== false;

	useEffect(() => {
		async function getUser() {
			if (userToken && userToken.length >= 1 && !userAuth) {
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

	const authPages = [
		["/cart", <CartPage host={activeSession as string} />],
		["/orders", <OrdersPage host={activeSession as string} />],
		["/admin/items", <ItemHandler host={activeSession as string} />],
	];

	return (
		<div className="max-w-dvw overflow-x-clip">
			{!location.pathname.includes("login") && <Topbar host={activeSession} />}
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<ProductPage item={test_p1} />} />

					<Route path="/search" element={<SearchPage />} />

					<Route path="/product" element={<ProductPage item={test_p2} />} />

					<Route
						path="/login"
						element={<LoginPage setter={activateSession} />}
					/>

					{(activeSession === false || tokenValid === false) &&
						authPages.map((page) => (
							<Route
								key={page[0] as string}
								path={page[0] as string}
								element={
									<LoginPage
										redirect={page[0] as string}
										setter={activateSession}
									/>
								}
							/>
						))}

					{check &&
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
		</div>
	);
}
