import BLarge from "./assets/icons/logo-horizontal-svg.svg";
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/csr/ShoppingCart";
import Sidemenu from "./Sidemenu";

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
        <Sidemenu />
        <img
          src={BLarge}
          className="mainlogo"
          style={{
            //display: "block",
            /*marginTop: 0,
            marginBottom: 0,
            paddingTop: "6px",
            marginLeft: "56px",*/
            maxHeight: "80%",
          }}
        />
        <ShoppingCartIcon
          style={
            {
              //display: "block",
              //position: "relative",
              //alignSelf: "flex-end",
              //height: "32px",
              //width: "500px",
              //marginRight: 0,
              //verticalAlign: "middle",
              //placeSelf: "flex-end",
            }
          }
          color="#000"
          weight="duotone"
          size={28}
        />
      </div>
    </>
  );
}

export default Topbar;
