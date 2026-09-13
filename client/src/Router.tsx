import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ClothesList from "./components/ClothesList";
import SearchPage from "./pages/SearchPage";
import HomePage from "./pages/HomePage";
import ItemHandler from "./handlers/ItemHandler";

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
        element: <ClothesList />,
      },
    ],
  },
  {
    path: "/search",
    element: <App />,
    children: [
      {
        path: "/search",
        element: <SearchPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: <App />,
    children: [
      {
        path: "/admin/items",
        element: <ItemHandler host={} />,
      },
      {
        //path: "/admin/users",
        //element:
      },
    ],
  },
]);

export default router;
