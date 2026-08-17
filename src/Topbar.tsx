import MBtn from "./assets/icons/menu-svg.svg";
import BLarge from "./assets/icons/logo-horizontal-svg.svg";
import { useState } from "react";
import { motion } from "motion/react";
import "./Topbar.css";

function Topbar() {
  const [menuActive, activateMenu] = useState(false);

  return (
    <>
      <div className="topbar">
        <div className="barlogo">
          {/*<button
            className="topmenu"
            onClick={() => activateMenu((menuActive) => !menuActive)}
          >
            <motion.img
              src={MBtn}
              className={
                menuActive ? "btnmenu menuActive" : "btnmenu menuInactive"
              }
              animate={{ rotate: menuActive ? 90 : 0 }}
            />
          </button>*/}
          <img src={BLarge} className="mainlogo" />
        </div>
      </div>
      {/*<motion.div
        className="sidemenu_div"
        animate={{
          height: menuActive ? "60%" : 0,
          width: menuActive ? "20%" : 0,
        }}
        style={{
          borderStyle: menuActive ? "solid" : "none",
        }}
      ></motion.div>*/}
    </>
  );
}

export default Topbar;
