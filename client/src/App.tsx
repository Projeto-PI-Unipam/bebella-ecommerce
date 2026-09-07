import { Outlet } from "react-router-dom";
// import Navbar from "./components/Navbar";
import Topbar from "./components/Topbar";

export default function App() {
  return (
    <div className="w-full p-6">
      <Topbar />
      <Outlet />
    </div>
  );
}
