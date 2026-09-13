import { useEffect, useState } from "react";
import { PageNavButton, PageNavIndicator } from "../components/PageButton";
import { useLocation } from "react-router-dom";
import { b_port } from "../App";
import { ObjectId } from "bson";

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
  pic_url?: string;
}

const Clothing = ({ data }: { data: ClothesModel }) => (
  <tr
    key={data.db_id}
    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
  >
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {data.name}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {data.description}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {data.category}
    </td>
  </tr>
);

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
      const endpoint = `http://localhost:${b_port}/items/search/${formatSearch(location.search)}`;
      const results = await fetch(endpoint);
      if (!results.ok) {
        console.error(results.status, results.statusText);
      }
      const fmt_res = await results.json();
      setItemCount(fmt_res[1]);
      setItems(fmt_res[0]);
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
      };
      return <Clothing data={d} />;
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
        style={{
          overscrollBehavior: "none",
          width: "100%",
          minHeight: "100svh",
          flexGrow: 1,
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Nome
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Descrição
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                Categoria
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">{clothesList()}</tbody>
        </table>
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
