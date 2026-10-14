import { useState } from "react";
import "../assets/fonts/fonts.css";
import SavedCard from "../components/SavedCard";

export default function CheckoutPage({ host }: { host: string | null }) {
  const [itemAmount, countItems] = useState(10); //useState(0);
  const [cep, cepSet] = useState<number | null>(null);
  function cepFmt(): string {
    if (!cep) {
      return "";
    }
    const cepStr = cep.toString();
    if (cepStr.length > 5) {
      return `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;
    } else {
      return cepStr;
    }
  }

  return (
    <div className="w-full min-h-dvh h-full bg-neutral-1000 grid-cols-16 grid-rows-13 font-[Prompt] text-md text-neutral-800 grid pt-8 pb-8">
      <div className="row-start-1 row-span-13 col-start-2 col-end-11 bg-transparent">
        <div className="w-full h-14 bg-neutral-200 flex flex-col justify-around items-start pl-4 pr-4 pt-0.75 pb-0.75">
          <span className="-mb-1 pb-0 leading-none">
            {"Sacola de Compras".toUpperCase()}
          </span>
          <span className="font-light text-neutral-600 mt-0 pt-0 leading-none">
            {`${itemAmount} ${itemAmount === 1 ? "Item" : "Itens"}`.toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col w-full lg:h-[85dvh] overflow-scroll bg-sky-400">
          <ul>
            {Array.from({ length: itemAmount }).map((_, i) => (
              <SavedCard key={i + 1} />
            ))}
          </ul>
        </div>
      </div>
      <div className="row-start-1 row-span-6 col-start-12 col-end-16 bg-purple-600 mb-1.5">
        <div className="h-1/6 w-full bg-neutral-200 flex justify-start items-center">
          <span className="pb-4 pl-4 text-lg">{"Entrega".toUpperCase()}</span>
        </div>
        <div className="h-1/3 w-full bg-sky-500 flex flex-col justify-evenly items-start pl-4 pr-4">
          <span>{"CEP:"}</span>
          <input
            className="w-full h-8 rounded-2xl bg-neutral-200 box-border border-neutral-400"
            type="text"
            maxLength={9}
            value={cepFmt()}
            onChange={(event) =>
              cepSet(parseInt(event.target.value.replace(/[\D]/g, "")) || 0)
            }
          />
        </div>
        <div className="h-1/3 w-full bg-sky-400"></div>
      </div>
      <div className="row-start-8 row-span-6 col-start-12 col-end-16 bg-purple-600">
        <div className="h-1/6 w-full bg-neutral-200 flex justify-start items-center">
          <span className="pb-4 pl-4 text-lg">{"Resumo".toUpperCase()}</span>
        </div>
        <div className="h-1/3 w-full bg-sky-500"></div>
        <div className="h-1/3 w-full bg-sky-400"></div>
      </div>
    </div>
  );
}
