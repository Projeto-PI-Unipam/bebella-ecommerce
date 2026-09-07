import BSmall from "../assets/icons/logo-png.png";
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/csr/ShoppingCart";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import Sidemenu from "./Sidemenu";

import "../assets/fonts/fonts.css";

function Topbar() {
  const backgroundActive = "#f6bebf";

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
            //src={BLarge}
            src={BSmall}
            className="mainlogo"
            style={{
              //display: "block",
              /*marginTop: 0,
            marginBottom: 0,
            paddingTop: "6px",*/
              marginLeft: "48px",
              maxHeight: "90%",
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: "#f1e8ee",
            width: "calc(42% + 10vw)",
            height: "75%",
            borderRadius: "12px",
            display: "flex",
            justifyItems: "start",
            alignItems: "center",
            paddingLeft: "4px",
            paddingRight: "4px",
            cursor: "text",
          }}
        >
          <input
            type="text"
            style={{
              width: "100%",
              height: "85%",
              backgroundColor: "transparent",
              borderRadius: "12px",
              borderStyle: "none",
              alignContent: "center",
              justifyContent: "start",
              color: "#000",
              fontFamily: "Prompt",
              fontWeight: 300,
              fontSize: "20px",
            }}
            placeholder=""
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <ShoppingCartIcon
            style={{
              marginRight: "8px",
              cursor: "pointer",
            }}
            color="#000"
            weight="duotone"
            size={28}
          />

          <UserIcon
            style={{
              marginRight: "8px",
              cursor: "pointer",
            }}
            color="#000"
            weight="duotone"
            size={28}
          />
        </div>
      </div>
    </>
  );
}

export default Topbar;
