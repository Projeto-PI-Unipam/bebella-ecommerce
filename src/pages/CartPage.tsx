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
      ? null
      : user!.order_addresses![0],
  );
  const [toggle, toggleEffect] = useState<boolean>(false);

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
                      >
                        {"-"}
                      </span>
                      <span>{prod.amount}</span>
                      <span
                        onClick={() =>
                          changeCart("increase", prod.item._id.toString())
                        }
                      >
                        {"+"}
                      </span>
                    </div>
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
                  <input type="text" placeholder="Digite seu CEP" />
                  <button type="button">{"CALCULAR"}</button>
                </div>
                <p>{"Não sabe seu CEP? Consulte aqui"}</p>
              </div>
              <div className="carrinho-opcoes">
                <h2>{"Frete para 00000-000"}</h2>
                <div className="carrinho-opcao">
                  <span className="carrinho-radio ativo" />
                  <div>
                    <span>{`PAC`}</span>
                    <small>{`0 a 0 dias úteis`}</small>
                  </div>
                  <span>{`R$00,00`}</span>
                </div>
                <div className="carrinho-opcao">
                  <span className="carrinho-radio" />
                  <div>
                    <span>{`SEDEX`}</span>
                    <small>{`0 a 0 dias úteis`}</small>
                  </div>
                  <span>{`R$00,00`}</span>
                </div>
              </div>
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
              <span>{to_currency(shipCost || 0)}</span>
            </div>
            <div className="carrinho-total">
              <div className="carrinho-resumo-linha">
                <strong>{`TOTAL`}</strong>
                <strong>{to_currency(cartTotal + (shipCost || 0))}</strong>
              </div>
              <small>{`em até ${def_installments}x sem juros no cartão`}</small>
            </div>
            <button
              type="button"
              className="carrinho-finalizar"
              onClick={() =>
                window.location.assign(window.location.origin + "/checkout")
              }
            >
              {"FINALIZAR COMPRA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
