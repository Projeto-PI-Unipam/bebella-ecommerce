/*
  useful datapoints:
    - total sold in month + value
    - total sold all time + value
    - most sold product overall
    - most sold product in each category
    - most profitable products
    - products running out of stock
    - monthly sale and revenue charts
*/

import { useEffect, useState } from "react";
import { type ClothesModel } from "../components/ClothesList";
import { b_port } from "../App";
import { useLocation } from "react-router-dom";

interface DataPoints {
  /*totalSold: number;
  totalOutValue: number;
  totalInValue: number;
  mostSold: ClothesModel[];
  mostSoldInCat?: ClothesModel;
  mostProfitable: ClothesModel[];*/
  lowStockProducts: ClothesModel[];
  total: ClothesModel[];
  /*monthlySoldPoints: number[];
  monthlyOutPoints: number[];
  monthlyInPoints: number[];*/
  productsCount: number;
}

export default function ItemHandler({ host }: { host: string }) {
  const [showWarn, activateWarn] = useState<number>(1);
  const [datapoints, setData] = useState<DataPoints | null>(null);
  const location = useLocation();
  useEffect(() => {
    async function fetchData() {
      if (host) {
        const endpoint = import.meta.env.VITE_ENDPOINT + `/admin/getproducts`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ auth_token: host }),
          /*body: JSON.stringify({
          auth_token: host,
          //stockWarn: 10,
          //category: "",
        }),*/
        });
        if (!response.ok) {
          activateWarn(response.status === 401 ? 2 : 1);
          return;
        } else {
          const res_json = response.json();
          if (!res_json) {
            activateWarn(2);
          } else {
            activateWarn(0);
            const res = await res_json;
            setData(res);
          }
        }
      }
    }
    fetchData();
    return;
  }, [location.pathname, host]);
  if (showWarn === 0 && host) {
    return (
      <div>
        <h1>{"Autorizado"}</h1>
        <p>{`Total de produtos: ${datapoints?.productsCount ?? 0}`}</p>
      </div>
    );
  } else if (showWarn === 2) {
    return (
      <div>
        <h1>403: não autorizado</h1>
      </div>
    );
  } else {
    return <></>;
  }
}
