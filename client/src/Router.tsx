import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import RestaurantList from "./components/RestaurantList";
import SearchPage from "./pages/SearchPage";
import HomePage from "./pages/HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/browse",
    element: <App />,
    children: [
      {
        path: "/browse",
        element: <RestaurantList />,
      },
    ],
  },
]);

export default router;
