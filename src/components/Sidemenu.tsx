import { motion } from "motion/react";
import { useState } from "react";
import MBtn from "../assets/icons/menu-svg.svg";
import { linkAtalho, TOP_SHORTCUTS } from "./Topbar.tsx";

import "./Sidemenu.css";
import "../assets/fonts/fonts.css";

export default function Sidemenu() {
  const [isActive, activate] = useState(false);
  const [isReady, makeReady] = useState(false);
  const pinkBgDefault = "#f6bebf";
  const lightBgActive = "#f6bedb";
  return (
    <>
      <div
        className={isActive ? "wrapper dark" : "wrapper"}
        onClick={isActive || isReady ? () => activate(() => false) : () => null}
      ></div>
      <motion.div
        className={isActive ? "sidemenu active" : "sidemenu inactive"}
        animate={{
          height: isActive ? "60%" : 0,
          width: isActive ? "calc(max(30%, 300px)" : 0,
        }}
        onAnimationComplete={
          isActive ? () => makeReady(() => true) : () => null
        }
        onAnimationStart={isActive ? () => null : () => makeReady(() => false)}
      >
        <motion.div
          style={{
            display: "flex",
            justifyContent: "center",
            height: 42,
            width: "100%",
            alignItems: "center",
            borderTopRightRadius: "12px",
            zIndex: 999,
          }}
          animate={{
            backgroundColor: isActive ? lightBgActive : pinkBgDefault,
          }}
        >
          <motion.button
            className={
              !isActive && !isReady
                ? "mr-2 cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-0.5"
                : ""
            }
            style={{
              position: "absolute",
              verticalAlign: "middle",
              top: 0,
              left: 4,
              borderStyle: "none",
              width: "40px",
              height: "40px",
            }}
            animate={{
              backgroundColor: isActive ? lightBgActive : pinkBgDefault,
            }}
            onClick={() => activate((isActive) => !isActive)}
          >
            <motion.img
              src={MBtn}
              className="btnmenu"
              animate={{
                rotate: isActive ? 90 : 0,
              }}
              whileHover={{ cursor: "pointer" }}
            />
          </motion.button>
          <motion.p
            style={{
              display: "flex",
              paddingBottom: 2,
              paddingLeft: 8,
              position: "relative",
              justifySelf: "anchor-center",
              justifyContent: "center",
              textAlign: "center",
              alignSelf: "center",
              verticalAlign: "center",
              //top: 12,
              /*left: 64,*/
              color: isReady ? "rgba(50, 50, 50, 255)" : "rgba(50, 50, 50, 0)",
              visibility: isReady ? "visible" : "hidden",
              textWrap: "nowrap",
              fontSize: "calc(1.05rem + 0.4vh)",
              fontWeight: "bold",
              fontFamily: "Boston Angel",
            }}
          >
            {"Busca por Departamentos"}
          </motion.p>
        </motion.div>
        {isReady && (
          <ul className="m-0 flex list-none flex-col p-0 pt-2 text-left">
            {TOP_SHORTCUTS.map((li) => (
              <li key={li.name}>
                <a
                  href={linkAtalho(li)}
                  className="flex min-h-11 items-center px-5 font-[Prompt] text-base text-neutral-800! no-underline hover:bg-white/40"
                >
                  {li.name.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </>
  );
}
