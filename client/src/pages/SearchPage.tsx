import { useEffect, useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { PageNavButton, PageNavIndicator } from "../components/PageButton";
import { useLocation } from "react-router-dom";
import { ObjectId } from "bson";
import "../assets/fonts/fonts.css";
import ProductCard from "../components/ProductCard";
import { type ClothesModel, type size, sizes } from "../database/Schema";

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
  const [category, setCategory] = useState<null | string>(null);
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
    <div className="w-full h-full bg-transparent flex flex-col z-0">
      <div className="flex flex-col w-full h-60 bg-rose-50 pt-6">
        <div className="flex flex-row w-full h-1/6 items-center">
          <span className="ml-8 text-xl text-neutral-500 font-[Prompt]">
            <span
              onClick={() => window.location.replace(window.origin)}
              className="cursor-pointer hover:text-rose-600"
            >
              {"Início".toUpperCase()}
            </span>
            {(
              " / Busca / " + location.search.replace(/\?s=/gi, "")
            ).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-row w-full h-2/5 mt-2 items-center justify-between">
          <span className="ml-8 text-7xl text-neutral-800 font-[Boston_Angel]">
            {"Titulo"}
          </span>
          <div className="bg-transparent border-solid border-2 border-[#f6bebf] w-48 h-12 mr-12 mt-16 rounded-lg flex flex-row items-center justify-between pl-2 pr-2">
            <span className="text-sm font-medium text-neutral-800 font-[Prompt]">
              {"Mais Relevantes".toUpperCase()}
            </span>
            <CaretDownIcon color="#98263e" />
          </div>
        </div>
        <div className="flex flex-row w-full h-1/8">
          <span className="ml-8 mt-3 text-base text-neutral-600 font-[Prompt]">
            {"10 Resultados".toUpperCase()}
          </span>
        </div>
        <div className="flex flex-row w-full h-1/2 bg-rose-50 mt-4 items-center justify-center gap-4">
          {["Camisas", "Shorts", "Calças", "Vestidos", "Saias"].map((s) => (
            <div className="rounded-2xl border-[#f6bebf] border-2 pl-3 pr-3 pt-1 pb-1 cursor-pointer transform hover:scale-110">
              <span className="text-neutral-800 text-base font-[Prompt]">
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 w-content-fit min-h-screen h-full pl-16 pr-16 pt-20 pb-20 gap-x-12 gap-y-16 justify-center justify-items-start place-self-center">
        {clothesList()}
      </div>
      <div className="w-full h-13 bg-neutral-300 flex place-self-center flex-row relative flex-nowrap items-center justify-center">
        <div className="w-3/5 h-13 bg-transparent flex place-self-center flex-row relative flex-nowrap items-center justify-center">
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
