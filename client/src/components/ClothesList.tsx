import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ObjectId } from "bson";
import { b_port } from "../App";

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

export default function ClothesList() {
  const [clothes, fetchClothes] = useState([]);
  const [clothesTotal, setTotal] = useState(0);
  const location = useLocation();

  useEffect(() => {
    async function getClothes() {
      // Determines which endpoint to call based on current route
      const endpoint = `http://localhost:${b_port}/browse`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const result = await response.json();
      fetchClothes(result[0]);
      setTotal(result[1]);
    }
    getClothes();
    return;
  }, [location.pathname]);

  function clothesList() {
    console.log(clothes);
    const lst = clothes.map((c) => {
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
    <>
      <h3 className="text-lg font-semibold p-4">{"Todos os Itens"}</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
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
            <tbody className="[&_tr:last-child]:border-0">
              {clothesList()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
