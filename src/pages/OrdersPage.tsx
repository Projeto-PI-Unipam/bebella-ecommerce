import { useEffect, useState } from "react";
import { type WebSale, type SaleReview } from "../database/Schema";
import { clsx } from "clsx";

export default function OrdersPage({ host }: { host: string }) {
  const [orders, setOrders] = useState<Array<WebSale> | null>(null);
  const [selectedOrder, selectOrder] = useState<WebSale | null>(null);
  useEffect(() => {
    async function getOrders() {
      const res = await fetch("/userapi/getorders", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: new URLSearchParams({
          token: host,
        }),
      });
      if (res.ok) {
        const prods: Array<WebSale> = await res.json();
        setOrders(prods);
      } else {
        console.error(await res.json());
        console.error(res);
      }
    }
    getOrders();
  }, [location.pathname, host]);
  return (
    <div className="h-[85dvh] w-full lg:pl-[8dvw] lg:pr-[8dvw] lg:pt-[4dvh] lg:pb-[4dvh] flex flex-row justify-evenly">
      <div className="flex flex-col overflow-scroll gap-4">
        {orders?.map((order, index) => (
          <div
            key={order.date ? order.date.valueOf() : index}
            className="lg:w-140 lg:h-52 lg:min-h-52 min-h-40 h-40 bg-sky-100 flex flex-row items-center cursor-pointer transition hover:scale-105 duration-120 ease-out hover:bg-sky-200"
          >
            <div className={clsx("bg-red-700 grid h-full w-32")} />
          </div>
        ))}
      </div>
      <div className={clsx("flex flex-col h-full w-3/5 bg-purple-200")}></div>
    </div>
  );
}
