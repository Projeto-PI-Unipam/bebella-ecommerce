import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { TruckIcon } from "@phosphor-icons/react/dist/csr/Truck";
import "./CartPage.css";
import "../assets/fonts/fonts.css";
import { useContext, useEffect, useEffectEvent, useState } from "react";
import {
  bucket,
  def_installments,
  type ShippingAddress,
  to_currency,
  type CartItem,
  type ClothesModel,
} from "../database/Schema.tsx";
import { ObjectId } from "bson";
import { AuthContext } from "../App.tsx";
import clsx from "clsx";

const test_costs = [
  { name: "PAC", price: 18.99, tstart: 9, tend: 16 },
  { name: "SEDEX", price: 38.9, tstart: 4, tend: 7 },
];

const test_addy: ShippingAddress = {
  city: "Patos de Minas",
  state: "MG",
  phone: 34998752310,
  number: 2,
  street: "Rua Gabriel Pereira",
  receiver: "José",
  zip_code: 38700054,
  complement: "Ap 301",
};

export default function CartPage({
  host,
  putState,
}: {
  host: string | null;
  putState: React.ActionDispatch<any>;
}) {
  const user = useContext(AuthContext);
  const [cartItems, setCart] = useState<CartItem[] | null>(null);
  const [shipCost, setShip] = useState<number | null>(null);
  const [shipZip, setZip] = useState<number | null>(null);
  const [address, setAddress] = useState<ShippingAddress | null>(
    !user || !user?.order_addresses || !user?.order_addresses?.length
      ? /*null*/ test_addy
      : user!.order_addresses![0],
  );
  const [toggle, toggleEffect] = useState<boolean>(false);
  const [chosenShipping, setShipping] = useState<any>();

  const cartTotal = !cartItems
    ? 0.0
    : cartItems.reduce((acc, elem) => acc + elem.item.price * elem.amount, 0.0);

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
          token: host!,
        }),
      });
      if (res.ok) {
        const items: Array<CartItem> = await res.json();
        if (items && items.length && items.length >= 1) {
          setCart(items);
        }
        putState({
          type: "set_cart",
          data: items,
        });
      }
    }
    getCartItems();
    return;
  }, [toggle]);

  const changeCart = useEffectEvent(
    async (change: "increase" | "decrease" | "remove", item_id: string) => {
      if (!host || !cartItems) {
        return;
      }
      let item = cartItems.find((c) => c.item._id.toString() === item_id);
      if (!item) {
        return;
      }
      if (change === "increase" && item.amount >= item.item.in_stock) {
        return;
      }
      if (change === "decrease" && item.amount <= 1) {
        return;
      }
      let new_cart: CartItem[] = [];
      if (change === "increase") {
        item.amount += 1;
        new_cart = [
          ...cartItems!.filter((p) => p.item._id.toString() !== item_id),
          item,
        ];
      }
      if (change === "decrease") {
        item.amount -= 1;
        new_cart = [
          ...cartItems!.filter((p) => p.item._id.toString() !== item_id),
          item,
        ];
      }
      if (change === "remove") {
        new_cart = cartItems!.filter((p) => p.item._id.toString() !== item_id);
      }
      const res = await fetch("/userapi/modcart", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          token: host!,
          newcart: new_cart,
        }),
      });

      if (res.ok) {
        setCart(new_cart);
      } else {
        console.error(res);
      }
    },
  );

  const doCheckout = useEffectEvent(async () => {
    if (cartItems === null || !chosenShipping) {
      return;
    }
    const items_mapped = cartItems!.map((c) => {
      return { prod_id: c.item._id, quantity: c.amount, size: c.size };
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
          address: { ...address, cost: chosenShipping.price },
        }),
      });
    let initial_res = await checkout_fetch();
    let fmt_res: any;
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

  return (
    <div className="font-[Prompt] text-neutral-800 tracking-normal! text-left mb-20 min-h-[62dvh]">
      {cartItems && (
        <div className="carrinho-conteudo grid grid-cols-[1fr_17rem] gap-24 items-start max-w-6xl mt-12 ml-auto mr-auto mb-0 pl-6 pr-6 pt-0 pb-0">
          <div>
            <div className="carrinho-faixa">
              <span>{"SACOLA DE COMPRAS"}</span>
              {cartItems && cartItems.length >= 1 && (
                <small>
                  {`${cartItems.length.toString()} ${cartItems.length === 1 ? "ITEM" : "ITENS"}`}
                </small>
              )}
            </div>
            <div className="flex flex-col overflow-x-hidden overflow-y-scroll">
              {(cartItems || []).map((prod) => (
                <div
                  className="relative flex gap-5 px-0 py-8 border-b border-b-neutral-300"
                  key={prod._id.toString()}
                >
                  <div className="w-32 h-40 object-cover bg-neutral-200">
                    {prod.item.pic_url && (
                      <img
                        className="w-32 h-40 object-cover bg-neutral-200"
                        src={`${bucket}/${prod.item.pic_url[0]}`}
                      />
                    )}
                  </div>
                  <div className="carrinho-detalhes">
                    <h1 className="tracking-wide! font-normal font-[Prompt] text-3xl! pb-">
                      {prod.item.name}
                    </h1>
                    <div className="carrinho-linha">
                      <span>Tamanho:</span>
                      <select defaultValue={prod.size.toString()}>
                        {prod.item.size_data.map((s, i) => (
                          <option key={i}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <span className="carrinho-preco">
                      {to_currency(prod.item.price)}
                    </span>
                    <div className="carrinho-quantidade">
                      <span
                        onClick={() =>
                          changeCart("decrease", prod.item._id.toString())
                        }
                        className={clsx(
                          prod.amount <= 1 &&
                            "text-neutral-300 cursor-default!",
                        )}
                      >
                        {"-"}
                      </span>
                      <span>{prod.amount}</span>
                      <span
                        onClick={() =>
                          changeCart("increase", prod.item._id.toString())
                        }
                        className={clsx(
                          prod.amount >= prod.item.in_stock &&
                            "text-neutral-300 cursor-default!",
                        )}
                      >
                        {"+"}
                      </span>
                    </div>
                    {prod.amount >= prod.item.in_stock && (
                      <span className="text-sm text-[#98263e]">
                        {prod.item.in_stock === 1
                          ? "Só temos 1 unidade em estoque."
                          : `Só temos ${prod.item.in_stock} unidades em estoque.`}
                      </span>
                    )}
                  </div>
                  <TrashIcon
                    className="carrinho-lixeira"
                    size={22}
                    onClick={() =>
                      changeCart("remove", prod.item._id.toString())
                    }
                  />
                </div>
              ))}
            </div>

            <div className="carrinho-frete grid mt-8 border-px border-neutral-200 border-solid text-sm grid-cols-2">
              <div>
                <h2>
                  <TruckIcon size={22} />
                  {"Calcule o frete"}
                </h2>
                <p>
                  {"Informe seu CEP para ver as opções de entrega disponíveis"}
                </p>
                <div className="carrinho-cep">
                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    value={shipZip ? shipZip.toString() : ""}
                    onChange={(ev) => setZip(parseInt(ev.target.value))}
                  />
                  <button type="button">{"CALCULAR"}</button>
                </div>
                <p>{"Não sabe seu CEP? Consulte aqui"}</p>
              </div>
              {shipZip && shipZip.toString().length > 7 && (
                <div className="carrinho-opcoes">
                  <h2>{`Frete para ${shipZip}`}</h2>
                  {test_costs.map((sh) => (
                    <div
                      className="carrinho-opcao cursor-pointer"
                      onClick={() => setShipping(sh)}
                    >
                      <span
                        className={clsx(
                          "carrinho-radio transition hover:scale-107 duration-110 ease-in cursor-pointer",
                          chosenShipping &&
                            chosenShipping.name === sh.name &&
                            "scale-107 ativo",
                        )}
                      />
                      <div>
                        <span>{sh.name}</span>
                        <small>{`${sh.tstart} a ${sh.tend} dias úteis`}</small>
                      </div>
                      <span>{to_currency(sh.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {false && (
              <div className="carrinho-troca">
                <h2>
                  <PackageIcon size={22} /> Troca e devoluções
                </h2>
                <p>
                  {
                    "Você pode solicitar a troca ou devolução do seu produto dentro do prazo informado pela loja, desde que a peça esteja sem sinais de uso, com etiquetas e em perfeitas condições."
                  }
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="carrinho-faixa">
              <span>{"RESUMO"}</span>
            </div>
            <div className="carrinho-resumo-linha">
              <span>{`Subtotal (${cartItems.length} ${cartItems.length === 1 ? "Item" : "Itens"})`}</span>
              <span>{to_currency(cartTotal)}</span>
            </div>
            <div className="carrinho-resumo-linha">
              <span>{`Frete`}</span>
              <span>{to_currency(chosenShipping?.price || 0)}</span>
            </div>
            <div className="carrinho-total">
              <div className="carrinho-resumo-linha">
                <strong>{`TOTAL`}</strong>
                <strong>
                  {to_currency(cartTotal + (chosenShipping?.price || 0))}
                </strong>
              </div>
              <small>{`em até ${def_installments}x sem juros no cartão`}</small>
            </div>
            <button
              type="button"
              className="carrinho-finalizar"
              onClick={() => doCheckout()}
            >
              {"FINALIZAR COMPRA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
