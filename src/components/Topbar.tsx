import BSmall from "../assets/icons/logo-png.png";
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/csr/ShoppingCart";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { HeartIcon } from "@phosphor-icons/react/dist/csr/Heart";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import Sidemenu from "./Sidemenu.tsx";
import { AuthContext } from "../App.tsx";

import "../assets/fonts/fonts.css";
import { useContext, useState } from "react";
import clsx from "clsx";

export const TOP_SHORTCUTS = [
  { name: "Primavera", type: "recent" },
  { name: "Novidades", type: "highlight" },
  { name: "Vestidos", type: "category" },
  { name: "Conjuntos", type: "category" },
  { name: "Blazer", type: "category" },
];

export function linkAtalho(li: { name: string; type: string }) {
  return (
    location.origin +
    (li.type === "recent"
      ? "/"
      : li.type === "highlight"
        ? "/highlights"
        : `/category?s=${encodeURIComponent(li.name.toString().toLowerCase())}`)
  );
}

function Topbar({ host }: { host: string | null }) {
  const backgroundActive = "#f6bebf";
  const userS = useContext(AuthContext);
  const [searchText, setSearch] = useState("");

  return (
    <>
      <div
        className="topbar"
        style={{
          width: "100%",
          height: "48px",
          backgroundColor: backgroundActive,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          flexWrap: "nowrap",
          justifyContent: "space-between",
          alignItems: "center",
          top: 0,
          //placeItems: "stretch",
        }}
      >
        <div className="ml-2 h-16 inline-flex flex-row flex-nowrap justify-evenly items-center">
          <div className="lg:hidden">
            <Sidemenu />
          </div>
          <img
            onClick={() => location.replace(location.origin)}
            src={BSmall}
            className="lg:h-4/7 h-5/8 lg:ml-2 ml-12 cursor-pointer inline-block"
          />
        </div>

        <div className="hidden lg:flex flex-row gap-x-7 xl:gap-x-12 cursor-pointer">
          {TOP_SHORTCUTS.map((li, ind) => (
            <a
              key={ind}
              className="transition delay-8 duration-140 hover:scale-110 hover:translate-y-[-2.5px] whitespace-nowrap"
              href={linkAtalho(li)}
            >
              <span
                key={ind}
                className={`${li.type === "recent" ? "text-[#98263e]" : li.type === "highlight" ? "text-neutral-900 font-medium" : "text-neutral-800"} font-[Prompt]`}
              >
                {li.name.toUpperCase()}
              </span>
            </a>
          ))}
        </div>

        <div className="bg-neutral-100 lg:w-[26%] xl:w-1/3 h-3/4 rounded-4xl items-center pl-4 pr-4 gap-2 flex cursor-text focus-within:ring-2 focus-within:ring-[#98263e]/40 lg:visible collapse">
          <MagnifyingGlassIcon
            size={20}
            color="#737373"
            className="flex-none cursor-pointer"
            aria-label="Buscar"
            onClick={() => {
              if (searchText.length >= 3) {
                location.href = location.origin + `/search?s=${searchText}`;
              }
            }}
          />
          <input
            type="text"
            aria-label="Buscar produtos"
            className="w-full h-85/100 bg-transparent rounded-4xl border-none outline-none items-center content-center justify-start text-neutral-800 font-[Prompt] font-light text-lg placeholder:text-neutral-500"
            placeholder="Buscar produtos"
            onChange={(input) => setSearch(input.target.value)}
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === "Enter" && searchText.length >= 3) {
                location.href = location.origin + `/search?s=${searchText}`;
              }
            }}
          />
        </div>

        {false && (
          <div className="bg-transparent w-30 h-[42px] flex justify-center items-center">
            <div
              className="w-27 h-[38.4px] bg-transparent flex border-2 border-neutral-800 border-solid lg:visible collapse items-center justify-center cursor-pointer transition delay-8 duration-140 ease-in-quad hover:scale-107 hover:-translate-y-[1.5px]"
              onClick={() => location.replace(location.origin + "/discounts")}
            >
              <span className="font-[Prompt] text-neutral-800 text-sm">
                {"Ver Ofertas".toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end">
          <UserIcon
            className="mr-[8px] cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-[2px]"
            color="#98263e"
            weight="duotone"
            size={28}
            onClick={() => {
              if (host && typeof host === "string") {
                location.replace(location.origin + "/orders");
              } else {
                location.assign(location.origin + "/login");
              }
            }}
          />

          {/*<HeartIcon
            className="mr-[8px] cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-[2px]"
            color="#98263e"
            weight="duotone"
            size={28}
          />*/}

          <ShoppingCartIcon
            className="mr-[8px] cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-[2px]"
            color="#98263e"
            weight="duotone"
            size={28}
            onClick={() => location.assign(location.origin + "/cart")}
          />

          {userS && userS.cart_products && (
            <div className="pl-0 -ml-3 -mt-6 mr-2 bg-neutral-50 border border-solid border-[#98263e] rounded-lg w-4 h-4">
              <sup className="font-[Prompt] text-center text-[#98263e] text-xs">
                {(userS!.cart_products || []).length}
              </sup>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Topbar;
