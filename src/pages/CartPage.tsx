import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { TruckIcon } from "@phosphor-icons/react/dist/csr/Truck";
import "./CartPage.css";
import "../assets/fonts/fonts.css";
import { useEffect, useEffectEvent, useState } from "react";
import {
  to_currency,
  type CartItem,
  type ClothesModel,
} from "../database/Schema.tsx";
import { ObjectId } from "bson";

export default function CartPage({
  host,
  putState,
}: {
  host: string | null;
  putState: React.ActionDispatch<any>;
}) {
  const [cartItems, setCart] = useState<CartItem[] | null>(null);
  const [toggle, toggleEffect] = useState<boolean>(false);

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
      const item = cartItems!.find((c) => c._id.toString() === item_id);
      if (!item) {
        return;
      }
      console.log("fetching");
      const res = await fetch("/userapi/modcart", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          token: host!,
          operation: change,
          item_sid: item_id,
        }),
      });

      if (res.ok) {
        console.log("fetched");
        const index = cartItems.findIndex(
          (p) => p.item._id.toString() === item_id,
        );
        console.log(cartItems[0].item._id);
        console.log(index);
        console.log(item_id);
        const upd_set = cartItems;
        console.log(upd_set);
        if (change === "increase") {
          upd_set[index].amount += 1;
          setCart(upd_set);
        } else if (change === "decrease") {
          const upd_set = cartItems;
          upd_set[index].amount -= 1;
          setCart(upd_set);
        } else {
          setCart(cartItems.filter((c) => c !== item));
        }
        console.log(cartItems);
      } else {
        console.error(res);
      }
    },
  );

  return (
    <div className="font-[Prompt] text-neutral-800 bg-neutral-50 tracking-normal! text-left mb-20 min-h-[62dvh]">
      <div className="carrinho-conteudo">
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
            {(cartItems || []).map((prod, index) => (
              <div
                className="relative flex gap-5 px-0 py-8 border-b border-b-neutral-300"
                key={index}
              >
                <div className="w-32 h-auto object-cover bg-neutral-200">
                  <img className="w-32 h-auto object-cover bg-neutral-200" />
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
                  onClick={() => changeCart("remove", prod.item._id.toString())}
                />
              </div>
            ))}
          </div>

          <div className="carrinho-frete">
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
            <span>{`Subtotal (1 item)`}</span>
            <span>{`R$350,90`}</span>
          </div>
          <div className="carrinho-resumo-linha">
            <span>{`Frete`}</span>
            <span>{`R$00,00`}</span>
          </div>
          <div className="carrinho-total">
            <div className="carrinho-resumo-linha">
              <strong>{`TOTAL`}</strong>
              <strong>{`R$350,90`}</strong>
            </div>
            <small>{"em até 4x sem juros no cartão"}</small>
          </div>
          <button type="button" className="carrinho-finalizar">
            {"FINALIZAR COMPRA"}
          </button>
        </div>
      </div>
    </div>
  );
}
