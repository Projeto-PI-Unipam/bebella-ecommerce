import BSmall from "../assets/icons/logo-png.png";
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/csr/ShoppingCart";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { HeartIcon } from "@phosphor-icons/react/dist/csr/Heart";
import Sidemenu from "./Sidemenu";

import "../assets/fonts/fonts.css";
import { useEffect, useState } from "react";

function Topbar({ host }: { host: string | boolean | null }) {
  const backgroundActive = "#f6bebf";
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
        <div
          style={{
            marginLeft: "8px",
            height: "48px",
            display: "inline-flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <div>
            <Sidemenu />
          </div>
          <img
            onClick={() => location.replace(location.origin)}
            src={BSmall}
            className="max-h-9/10 ml-[48px] cursor-pointer"
          />
        </div>

        <div className="flex flex-row gap-x-12 lg:visible collapse cursor-pointer">
          {[
            ["PRIMAVERA!", 0],
            ["NOVIDADES", 1],
            ["CAMISAS", 2],
            ["BOLSAS", 3],
            ["CALÇAS", 4],
          ].map((li) => (
            <a
              key={li[1]}
              className="transition delay-8 duration-140 hover:scale-110 hover:translate-y-[-2.5px]"
              href={
                location.origin +
                (li[1] === 0
                  ? "/highlights"
                  : li[1] === 1
                    ? "/novidades"
                    : `/categoria/${encodeURIComponent(li[0].toString().toLowerCase())}`)
              }
            >
              <span
                onClick={() => console.log}
                key={li[1]}
                className={`lg:visible invisible ${li[1] === 0 ? "text-rose-700" : "text-neutral-800"} font-[Prompt]`}
              >
                {li[0]}
              </span>
            </a>
          ))}
        </div>

        <div className="bg-neutral-100 w-1/3 h-3/4 rounded-4xl items-center pl-[4px] pr-[4px] flex cursor-text lg:visible collapse">
          <input
            type="text"
            className="w-full h-85/100 bg-transparent rounded-4xl border-none items-center content-center justify-start text-neutral-800 font-[Prompt] font-light text-xl"
            placeholder=" "
            onChange={(input) => setSearch(input.target.value)}
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === "Enter" && searchText.length >= 3) {
                location.href = location.origin + `/search?s=${searchText}`;
              }
            }}
          />
        </div>

        <div className="bg-transparent w-30 h-[42px] flex justify-center items-center">
          <div
            className="w-27 h-[38.4px] bg-transparent flex border-2 border-neutral-800 border-solid lg:visible collapse items-center justify-center cursor-pointer transition delay-8 duration-140 ease-in-quad hover:scale-107 hover:-translate-y-[1.5px]"
            onClick={() => location.replace(location.origin + "/ofertas")}
          >
            <span className="font-[Prompt] text-neutral-800 text-sm">
              {"Ver Ofertas".toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <UserIcon
            className="mr-[8px] cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-[2px]"
            color="#98263e"
            weight="duotone"
            size={28}
            onClick={() => {
              if (host && typeof host === "string") {
              } else {
                location.assign(location.origin + "/login");
              }
            }}
          />

          <HeartIcon
            className="mr-[8px] cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-[2px]"
            color="#98263e"
            weight="duotone"
            size={28}
          />

          <ShoppingCartIcon
            className="mr-[8px] cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-[2px]"
            color="#98263e"
            weight="duotone"
            size={28}
            onClick={() => location.assign(location.origin + "/cart")}
          />
        </div>
      </div>
    </>
  );
}

export default Topbar;
