//import { createState } from "react";

function ProductPage() {
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#990000",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            minHeight: "100svh",
            flexGrow: 1,
            backgroundColor: "#000099",
            display: "flex",
            flexDirection: "row",
            position: "relative",
          }}
        ></div>
        <div
          style={{
            width: "60%",
            height: "60px",
            backgroundColor: "#009900",
            display: "flex",
            placeSelf: "anchor-center",
            flexDirection: "row",
            position: "relative",
          }}
        ></div>
      </div>
    </>
  );
}

export default ProductPage;
