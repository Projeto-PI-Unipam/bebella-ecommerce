import { useEffect, useState } from "react";
import { PageNavButton, PageNavIndicator } from "../components/PageButton";
import { useLocation } from "react-router-dom";
import { b_port } from "../App";
import { ObjectId } from "bson";
import "../assets/fonts/fonts.css";
import ProductCard from "../components/ProductCard";

type size = string | number;
const sizes = ["PP", "P", "M", "G", "GG"];

export interface ClothesModel {
  id: ObjectId;
  db_id: string;
  name: string;
  brand: string;
  category: string;
  size_data: size[];
  description?: string;
  in_stock: number;
  pic_url?: string[];
  price: number;
}

const test: ClothesModel = {
  id: new ObjectId(),
  db_id: new ObjectId().toString(),
  name: "Roupa Teste",
  brand: "Marca Proto",
  category: "Categoria Zero",
  size_data: (sizes as size[]).concat([40, 42] as size[]),
  description: "Produto para testar a pesquisa do site",
  in_stock: 3,
  pic_url: [
    "https://farmrio.com/cdn/shop/files/SPRING_02_EC_R_C.jpg?format=pjpg&v=1788898867&width=640",
    "https://farmrio.com/cdn/shop/files/farm-rio-borbofly-long-sleeve-maxi-dress_361238_1.jpg?format=pjpg&v=1787878453&width=640",
  ],
  price: 200.5,
};

const test2: ClothesModel = {
  id: new ObjectId(),
  db_id: new ObjectId().toString(),
  name: "Segundo Teste",
  brand: "Topíssimo",
  category: "Incrível",
  size_data: (sizes as size[]).concat([40, 42] as size[]),
  description: "Produto para testar a pesquisa do site, de novo!",
  in_stock: 3,
  pic_url: [
    "https://farmrio.com/cdn/shop/files/farm-rio-borbofly-long-sleeve-maxi-dress_361238_1.jpg?format=pjpg&v=1787878453&width=640",
    "https://farmrio.com/cdn/shop/files/SPRING_02_EC_R_C.jpg?format=pjpg&v=1788898867&width=640",
  ],
  price: 120,
};

function formatSearch(term: string) {
  const searchRegex = new RegExp(/(\?s=)(.+)/);
  const searchResults = searchRegex.exec(term);
  if (searchResults && searchResults.length > 2) {
    return searchResults[2];
  } else {
    throw new Error("Não foram encontrados resultados para essa pesquisa.");
  }
}

export default function SearchPage() {
  //const backgroundActive = "#f6bebf";
  //const activeBorder = "#904070";
  const [itemsBase, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(1);
  const [currentPage, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(Math.ceil(itemCount / perPage));
  const location = useLocation();

  useEffect(() => {
    async function getItems() {
      /*console.log(location.search, formatSearch(location.search));
      const endpoint = `http://localhost:${b_port}/items/search/${formatSearch(location.search)}`;
      const results = await fetch(endpoint);
      if (!results.ok) {
        console.error(results.status, results.statusText);
      }
      const fmt_res = await results.json();
      console.log(fmt_res);
      setItemCount(fmt_res[1]);
      setItems(fmt_res[0]);*/

      // test
      setItemCount(5);
      setItems([test, test2, test, test2, test]);
    }
    getItems();
    return;
  }, [location.pathname, location.search]);

  function clothesList() {
    const lst = itemsBase.map((c) => {
      const d: ClothesModel = {
        id: c.id,
        db_id: c._id,
        name: c.name,
        brand: c.brand,
        category: c.category,
        in_stock: c.in_stock,
        pic_url: c.pic_url,
        size_data: c.size_data,
        description: c.description,
        price: c.price,
      };
      return <ProductCard item={d} />;
    });
    return lst;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0)",
        display: "flex",
        flexDirection: "column",
        zIndex: 0,
      }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-3 w-content-fit min-h-screen h-full pl-16 pr-16 pt-20 pb-20 gap-x-12 gap-y-16 justify-center justify-items-start place-self-center"
        /*style={{
          overscrollBehavior: "none",
          width: "100%",
          minHeight: "100svh",
          flexGrow: 1,
          backgroundColor: "#fff",
          display: "grid",
          //flexDirection: "row",
        }}*/
      >
        {clothesList()}
      </div>
      <div
        style={{
          width: "100%",
          height: "52px",
          backgroundColor: "#ddd",
          display: "flex",
          placeSelf: "anchor-center",
          flexDirection: "row",
          position: "relative",
          flexWrap: "nowrap",
          alignItems: "anchor-center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "60%",
            height: "52px",
            backgroundColor: "#ddd",
            display: "flex",
            placeSelf: "anchor-center",
            flexDirection: "row",
            position: "relative",
            flexWrap: "nowrap",
            alignItems: "anchor-center",
            justifyContent: "center",
          }}
        >
          <PageNavButton
            label="<"
            visibility={currentPage > 1}
            setter={setPage}
          />
          <PageNavIndicator
            label={currentPage}
            visibility={true}
            hspace={3}
            setter={setPage}
          />
          <PageNavButton
            label=">"
            visibility={currentPage < totalPages}
            setter={setPage}
          />
        </div>
      </div>
    </div>
  );
}
