import { useState } from "react";
import { PageNavButton, PageNavIndicator } from "../components/PageButton";

function SearchPage() {
  //const backgroundActive = "#f6bebf";
  //const activeBorder = "#904070";
  const [currentPage, setPage] = useState(1);
  return (
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
          height: "52px",
          backgroundColor: "#009900",
          display: "flex",
          placeSelf: "anchor-center",
          flexDirection: "row",
          position: "relative",
          flexWrap: "nowrap",
          alignItems: "anchor-center",
          justifyContent: "center",
        }}
      >
        <PageNavButton label="<" visibility={true} setter={setPage} />
        <PageNavIndicator
          label={currentPage}
          visibility={true}
          hspace={3}
          setter={setPage}
        />
        <PageNavButton label=">" visibility={true} setter={setPage} />
      </div>
    </div>
  );
}

export default SearchPage;
