import { useEffect, useState } from "react";
import { type WebSale, type SaleReview } from "../database/Schema";

export default function OrdersPage({ host }: { host: string }) {
  const [orders, setOrders] = useState<Array<WebSale> | null>(null);
  useEffect(() => {
    async function getOrders() {
      const res = await fetch(
        import.meta.env.VITE_ENDPOINT + "/userapi/getorders",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            token: host,
          }),
        },
      );
      if (res.ok) {
        const prods = await res.json();
        setOrders(prods);
      } else {
        console.error(res);
      }
    }
    getOrders();
  }, [location.pathname, host]);
  return (
    <div className="h-[85dvh] w-full lg:pl-[8dvw] lg:pr-[8dvw] lg:pt-[4dvh] lg:pb-[4dvh]">
      {orders?.map((order) => (
        <div
          key={order.date.toISOString() || order._id.toHexString()}
          className="lg:w-[30dvw] h-40 bg-sky-100"
        ></div>
      ))}
    </div>
  );
}
