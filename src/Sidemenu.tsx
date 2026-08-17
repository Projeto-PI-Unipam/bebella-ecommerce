import MBtn from "./assets/icons/menu-svg.svg";
import { motion } from "motion/react";
import { useState } from "react";

import "./Sidemenu.css";
import "./assets/fonts/fonts.css";

function Sidemenu() {
  const [isActive, activate] = useState(false);
  const [isReady, makeReady] = useState(false);
  const pinkBgDefault = "#f6bebf";
  const lightBgActive = "#f6bedb";
  return (
    <>
      <div
        className={isActive ? "wrapper dark" : "wrapper"}
        onClick={isActive || isReady ? () => activate(() => false) : () => null}
      >
        <motion.div
          className={isActive ? "sidemenu active" : "sidemenu inactive"}
          animate={{
            height: isActive ? "60%" : 0,
            width: isActive ? "30%" : 0,
          }}
          onAnimationComplete={
            isActive ? () => makeReady(() => true) : () => null
          }
          onAnimationStart={
            isActive ? () => null : () => makeReady(() => false)
          }
        >
          <motion.div
            style={{
              display: "block",
              height: 60,
              width: "100%",
              alignItems: "start",
              borderTopRightRadius: "12px",
            }}
            animate={{
              backgroundColor: isActive ? lightBgActive : pinkBgDefault,
            }}
          >
            <motion.button
              style={{
                display: "block",
                position: "absolute",
                top: 8,
                left: 8,
                borderStyle: "none",
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
            <motion.span
              style={{
                display: "block",
                position: "relative",
                textAlign: "center",
                top: 12,
                /*left: 64,*/
                color: isReady
                  ? "rgba(50, 50, 50, 255)"
                  : "rgba(50, 50, 50, 0)",
                visibility: isReady ? "visible" : "hidden",
                textWrap: "nowrap",
                fontSize: "calc(1.2rem + 0.5vmin)",
                fontWeight: "bold",
                fontFamily: "Boston Angel",
              }}
            >
              Busca por Departamentos
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

export default Sidemenu;
