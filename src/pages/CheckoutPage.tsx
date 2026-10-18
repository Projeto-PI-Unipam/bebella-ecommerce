import { useEffect, useEffectEvent, useState } from "react";
import "../assets/fonts/fonts.css";
import SavedCard, { savedCardHeight } from "../components/SavedCard";
import type { CartItem, ShippingAddress } from "../database/Schema";
import { fmt_price } from "../database/Utils";
import { clsx } from "clsx/lite";

const test_addy: ShippingAddress = {
  city: "Patos de Minas",
  state: "MG",
  cost: 10,
  phone: 34998752310,
  number: 2,
  street: "Rua Gabriel Pereira",
  receiver: "José",
  zip_code: 38700054,
  complement: "Ap 301",
};

export default function CheckoutPage({ host }: { host: string | null }) {
  const [itemAmount, countItems] = useState(0);
  const [cartProds, setProds] = useState<Array<CartItem> | null>(null);
  const [cep, cepSet] = useState<number | null>(null);
  const [chosenShipping, setShipping] = useState<any>(null);
  const [availableShippings, setAvailableShips] = useState([10, 20, 30, 40]); //useState([]);
  const [hiddenTopics, toggleHide] = useState<Array<number>>([]);
  const [totalPrice, setTotal] = useState<number | null>(null);
  const [shipAddress, setAddress] = useState<ShippingAddress>(test_addy);
  function cepFmt(): string {
    if (!cep) {
      return "";
    }
    const cepStr = cep.toString();
    if (cepStr.length > 5) {
      if (cepStr.length === 8) {
        console.log("completed!");
      }
      return `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`;
    } else {
      return cepStr;
    }
  }

  function toggleItem(index: number): void {
    if (hiddenTopics.includes(index)) {
      toggleHide(hiddenTopics.filter((elem) => elem !== index));
    } else {
      toggleHide(hiddenTopics.concat([index]));
    }
  }

  const doCheckout = useEffectEvent(async () => {
    if (cartProds === null) {
      return;
    }
    const items_mapped = cartProds!.map((c) => {
      return { prod_id: c._id!, quantity: c.amount, size: c.size };
    });
    const checkout_fetch = async () =>
      await fetch("/userapi/checkout", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          products: items_mapped,
          user: host,
          address: shipAddress,
        }),
      });
    let initial_res = await checkout_fetch();
    let fmt_res: any = undefined;
    const checkout_test = async () => {
      if (initial_res.ok) {
        const jres = await initial_res.json();
        fmt_res = jres;
      } else {
        if ((await initial_res.text()).includes("generate a response")) {
          initial_res = await checkout_fetch();
          await checkout_test();
        } else {
          console.error(initial_res);
          return;
        }
      }
    };
    await checkout_test();
    console.log(fmt_res);
    if (fmt_res) {
      location.replace(fmt_res.checkout_url);
    }
    return;
  });

  useEffect(() => {
    async function getCartItems() {
      if (!host) {
        return;
      }
      const endpoint = "/userapi/getcart";
      const res = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: new URLSearchParams({
          token: host || "",
        }),
      });
      if (res.ok) {
        const items: Array<CartItem> = await res.json();
        if (items && items.length && items.length >= 1) {
          setProds(items);
          countItems(items.length);
          const total = items.reduce(
            (acc, elem) => acc + elem.amount * elem.item.price,
            0,
          );
          setTotal(total);
        }
      }
    }
    getCartItems();
    return;
  }, [location.pathname, location.href, host]);

  return (
    <div className="w-full not-lg:min-h-dvh lg:h-dvh bg-neutral-1000 font-[Prompt] text-md text-neutral-800 lg:pt-8 lg:pb-8 flex lg:flex-row not-lg:flex-col not-lg:pb-0 not-lg:mb-0 not-lg:pt-4 not-lg:items-center lg:justify-between overflow-x-hidden max-w-dvw">
      <div
        className={clsx(
          `lg:w-2/3 lg:ml-12 bg-transparent not-lg:min-w-dvw not-lg:transition not-lg:duration-140`,
          hiddenTopics.includes(0) ? "not-lg:h-14" : "",
        )}
      >
        <div
          className="w-full h-14 bg-neutral-200 flex flex-col justify-around items-start pl-4 pr-4 pt-0.75 pb-0.75"
          onClick={() => toggleItem(0)}
        >
          <span className="-mb-1 pb-0 leading-none">
            {"Sacola de Compras".toUpperCase()}
          </span>
          {cartProds !== null && (
            <span className="font-light text-neutral-600 mt-0 pt-0 leading-none">
              {`${itemAmount} ${itemAmount === 1 ? "Item" : "Itens"}`.toUpperCase()}
            </span>
          )}
        </div>
        <div
          className="flex flex-col w-full h-[32dvh] lg:h-[85dvh] lg:max-h-[85dvh] overflow-y-scroll overflow-x-hidden lg:overscroll-contain not-lg:overscroll-auto bg-sky-400 scrollbar-thumb-neutral-50 scrollbar-track-neutral-400 focus:scrollbar-thumb-neutral-600 active:scrollbar-thumb-rose-400 lg:min-h-[85dvh]"
          style={{
            maxHeight: itemAmount === 1 ? `${savedCardHeight * 4}px` : "unset",
            height: hiddenTopics.includes(0) ? 0 : "32dvh",
          }}
        >
          <ul>
            {cartProds !== null &&
              cartProds.length > 0 &&
              cartProds.map((_, i) => (
                <li>
                  <SavedCard key={i + 1} ind={i + 1} />
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col lg:w-1/4 h-full lg:mr-12 items-center lg:gap-[8dvh]">
        <div className="bg-purple-600 w-full mb-1.5 not-lg:mt-4 not-lg:min-w-dvw not-lg:h-fit">
          <div
            className="lg:h-14 h-12 w-full bg-neutral-200 flex flex-row justify-between items-center pl-4 pr-4"
            onClick={() => toggleItem(1)}
          >
            <span className="pb-1 lg:text-lg text-md">
              {"Entrega".toUpperCase()}
            </span>
            {chosenShipping && hiddenTopics.includes(1) && (
              <span className="pb-1 text-md lg:collapse">
                {`${chosenShipping /*.provider.toUpperCase() || ""*/}`}
              </span>
            )}
          </div>
          <div
            className={clsx(
              "h-16 w-full bg-sky-500 flex flex-col justify-around items-center pl-4 pr-4 lg:min-h-16 not-lg:min-h-0",
              hiddenTopics.includes(1) || !(itemAmount > 0) ? "0px" : "48px",
              hiddenTopics.includes(1) ? "overflow-hidden" : "overflow-auto",
            )}
          >
            <div className="flex flex-row justify-evenly items-center h-fit -mb-2 w-full">
              <span>{"CEP:"}</span>
              <input
                className="w-2/3 min-w-20 h-8 rounded-2xl bg-neutral-200 box-border border-neutral-400 pl-2 pr-2"
                type="text"
                maxLength={9}
                value={cepFmt()}
                onChange={(event) =>
                  cepSet(parseInt(event.target.value.replace(/[\D]/g, "")) || 0)
                }
              />
            </div>
            <a
              className="text-sm self-end h-fit w-fit cursor-pointer hover:underline hover:italic decoration-[#f6bebf]"
              target="_blank"
              href="https://buscacepinter.correios.com.br"
            >
              <span>{"Não sabe seu CEP?"}</span>
            </a>
          </div>
          <div
            className="lg:h-[30dvh] lg:min-h-[30dvh] w-full bg-sky-400 overflow-scroll lg:overscroll-contain not-lg:overscroll-auto not-lg:min-w-dvw flex"
            style={{
              height:
                hiddenTopics.includes(1) || !(itemAmount > 0) ? "0px" : "30dvh",
              overflow: hiddenTopics.includes(1) ? "hidden" : "scroll",
            }}
          >
            <ul
              className="flex flex-col w-full h-full justify-start items-center"
              style={{ overflow: hiddenTopics.includes(1) ? "hidden" : "auto" }}
            >
              {availableShippings.toSorted().map((v, i) => (
                <li key={i + 1}>
                  <div
                    className={`h-18 lg:w-[18dvw] not-lg:w-[80dvw] mb-1 mt-1 bg-neutral-100 flex flex-row items-center pl-8 pr-8 rounded-2xl border-2 has-checked:border-neutral-400 not-has-checked:border-neutral-100 box-border has-checked:bg-rose-100 transition duration-140 ease-out has-checked:scale-110 has-checked:mb-2 has-checked:mt-2 ${i === 0 ? "mt-3" : ""} cursor-pointer`}
                    onClick={() => setShipping(i)}
                  >
                    <input
                      className="h-1/4 w-1/8 mr-4 cursor-pointer"
                      type="radio"
                      value={v}
                      name="shipping_radio"
                      checked={chosenShipping /*?.index*/ === i || false}
                    />
                    <div className="w-2/3 h-fit flex flex-col font-[Prompt] cursor-pointer">
                      <div>
                        <label className="row-span-1 col-span-1 text-lg font-medium cursor-pointer">
                          {"PAC"}
                        </label>
                        <label className="row-span-1 col-span-1 text-lg font-medium mr-2 cursor-pointer">
                          {":"}
                        </label>
                        <label className="row-span-1 col-span-1 text-lg cursor-pointer">
                          {"R$ 18,80"}
                        </label>
                      </div>
                      <label className="col-span-2 row-span-1 text-sm cursor-pointer">
                        {"5-9 dias úteis"}
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-full lg:min-h-[20dvh] not-lg:mt-4 not-lg:h-fit bg-purple-600">
          <div
            className="lg:h-14 not-lg:h-12 not-lg:min-w-dvw w-full bg-neutral-200 flex flex-row justify-between items-center pl-4 pr-4"
            onClick={() => toggleItem(2)}
          >
            <span className="pb-1 lg:text-lg text-md">
              {"Resumo".toUpperCase()}
            </span>
            {totalPrice && chosenShipping && hiddenTopics.includes(2) && (
              <span className="pb-1 text-md lg:collapse">
                {`Total: ${fmt_price(totalPrice + chosenShipping.price) || ""}`}
              </span>
            )}
          </div>
          <div
            //className="h-[10dvh] w-full bg-sky-500 flex flex-col justify-evenly items-start"
            className={clsx(
              "h-[10dvh] w-full bg-sky-500 flex flex-col justify-evenly items-start",
              hiddenTopics.includes(2) || !(itemAmount > 0)
                ? "not-lg:collapse not-lg:max-h-0"
                : "not-lg:h-visible",
            )}
          >
            {totalPrice && (
              <div className="h-fit w-full flex flex-row justify-between pl-4 pr-4 items-center">
                <span>{`Valor do Carrinho:`}</span>
                <span>{`${fmt_price(totalPrice || 0)}`}</span>
              </div>
            )}
            {chosenShipping && (
              <div className="h-fit w-full flex flex-row justify-between pl-4 pr-4 items-center">
                <span>{`Valor do Frete:`}</span>
                <span>{`${fmt_price(totalPrice || 0)}`}</span>
              </div>
            )}
          </div>
          <div
            className={clsx(
              "h-[6dvh] w-full bg-sky-400",
              hiddenTopics.includes(2) || !(itemAmount > 0)
                ? "not-lg:collapse not-lg:max-h-0"
                : "not-lg:h-visible",
            )}
          >
            {totalPrice && chosenShipping && (
              <div className="h-full w-full flex flex-row justify-between pl-4 pr-4 items-center">
                <span>{`Valor Total:`}</span>
                <span>{`${fmt_price(totalPrice + chosenShipping.price || 0)}`}</span>
              </div>
            )}
          </div>
        </div>
        <div
          className="lg:w-1/2 h-14 rounded-2xl not-lg:w-3/5 not-lg:mt-12 not-lg:mb-12 not-lg:pb-0 bg-rose-200 flex flex-col justify-center items-center shadow-rose-950 shadow-md transition duration-100 active:shadow-xs lg:hover:shadow-sm lg:active:shadow-2xs cursor-pointer"
          onClick={() => doCheckout()}
        >
          <span className="text-lg">{"Continuar".toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
