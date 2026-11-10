import { Link } from "react-router-dom";
import "./ProductPage.css";
import "../assets/fonts/fonts.css";
import clsx from "clsx";
import { useContext, useEffect, useEffectEvent, useState } from "react";
import { AuthContext } from "../App.tsx";
import {
  apply_discount,
  before_discount,
  bucket,
  type ClothesModel,
  def_discount,
  fmt_discount,
  type size,
  to_currency,
  upfront_discount,
  type CartItem,
} from "../database/Schema";

export default function ProductPage({
  host,
  putState,
}: {
  host?: string;
  putState: React.ActionDispatch<any>;
}) {
  const [item, setItem] = useState<ClothesModel | null>(null);
  const [chosenSize, setSize] = useState<size | null>(null);
  const [pictureIndex, setPicture] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [buttonDisplay, setButton] = useState<string>("normal");

  useEffect(() => {
    async function getItem() {
      const path = location.pathname.split("/");
      if (!(path.length > 3)) {
        location.replace(location.origin + "/search");
        return;
      }
      const item_id = path[2];
      console.log(item_id);
      const res = await fetch(`/items/view/${item_id}`, {
        method: "GET",
      });
      if (res.ok) {
        const prod = await res.json();
        setItem(prod);
        return;
      } else {
        console.error(res);
        location.replace(location.origin + "/search");
        return;
      }
    }
    getItem();
  }, [location.href, location.pathname]);

  const user = useContext(AuthContext);

  const cart_put = useEffectEvent(async () => {
    if (!chosenSize || !quantity) {
      return;
    }
    if (!host || !user) {
      location.assign(
        location.origin + `/login?dir=${location.pathname.replace("/", "")}`,
      );
      return;
    }
    setButton("pending");
    const cart_prod: CartItem = {
      item: item!,
      size: chosenSize!,
      amount: quantity,
    };
    const res = await fetch("/userapi/addcart", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        item: cart_prod,
        token: host!,
      }),
    });
    if (res.ok) {
      putState({
        type: "add_cart",
        data: cart_prod,
      });
      setButton("added");
      await new Promise((r) => setTimeout(r, 5000));
      setButton("normal");
    } else {
      console.error(res);
    }
  });

  return item === null ? (
    <></>
  ) : (
    <div className="produto-page">
      <div className="produto-conteudo">
        <div className="produto-breadcrumb">
          <Link to="/">INÍCIO</Link>
          <>/</>
          <Link to={`/${item!.category.toLocaleLowerCase()}`}>
            {item!.category.toLocaleUpperCase()}
          </Link>
          <>/</>
          <span>{item!.name.toLocaleUpperCase()}</span>
        </div>

        <div className="produto-principal">
          <div className="flex flex-col gap-5 overflow-y-scroll overflow-x-hidden scrollbar-none">
            {item!.pic_url
              ? item!.pic_url.map((pic, index) => (
                  <div
                    onClick={() => setPicture(index)}
                    className={clsx(
                      "w-30 border-2 border-solid border-transparent aspect-4/5 object-cover bg-[#e5e5e5] transition duration-100 ease-in delay-20 cursor-pointer",
                      index === pictureIndex
                        ? "border-[#f6bebf] scale-108"
                        : "",
                    )}
                  >
                    <img
                      className="w-full h-full"
                      src={bucket + `/${pic}`}
                      alt={`product-thumbnail-${index + 1}`}
                    />
                  </div>
                ))
              : null}
          </div>
          <div className="w-120" />

          <div className="produto-info">
            <h1>{item!.name}</h1>

            <div className="produto-preco-bloco">
              <div className="produto-preco-linha">
                <s>{to_currency(before_discount(item!.price, def_discount))}</s>
                <span className="produto-desconto">
                  {fmt_discount(def_discount)}
                </span>
              </div>
              <span className="produto-preco">
                {to_currency(apply_discount(item!.price, upfront_discount))}
              </span>
              <span className="produto-parcelas">
                {`ou 4x de ${to_currency(item!.price / 4)} sem juros`}
              </span>
            </div>

            <div className="produto-grupo">
              <span>Tamanho</span>
              <div className="produto-tamanhos">
                {item!.size_data.map((s) => (
                  <div
                    key={s}
                    onClick={() => setSize(s)}
                    className={clsx(
                      "flex item!s-center justify-center w-10 h-10 border border-solid border-[#f5f5f5] rounded-md bg-[#f5f5f5] cursor-pointer transition ease-in duration-75",
                      chosenSize === s
                        ? "border-[#f6bebf] bg-[#ffe4e6] scale-108"
                        : "",
                    )}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {false && (
              <div className="produto-grupo">
                <span>
                  Cor: <strong>Branco</strong>
                </span>
                <div className="produto-cores">
                  <div className="produto-cor preto" />
                  <div className="produto-cor branco ativa" />
                  <div className="produto-cor bege" />
                </div>
              </div>
            )}

            <div className="produto-compra">
              <div className="produto-quantidade">
                <span
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-2xl text-center w-11 hover:text-rose-400 text-neutral-800 select-none"
                >
                  {"-"}
                </span>
                <span className="text-sm text-center w-9">
                  {quantity.toString()}
                </span>
                <span
                  onClick={() =>
                    setQuantity(Math.min(quantity + 1, item!.in_stock))
                  }
                  className="text-2xl text-center w-11 hover:text-rose-400 text-neutral-800 select-none"
                >
                  {"+"}
                </span>
              </div>
              <button
                onClick={() => cart_put()}
                type="button"
                className="produto-comprar"
              >
                {buttonDisplay === "normal"
                  ? "COMPRAR"
                  : buttonDisplay === "pending"
                    ? "..."
                    : "ADICIONADO!"}
              </button>
            </div>

            {item!.description && (
              <div className="produto-descricao">
                <h2>SOBRE ESSE PRODUTO</h2>
                <p>{item!.description!}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="produto-novidades">
        <div className="produto-novidades-topo">
          <h2>NOVIDADES</h2>
          <Link to="/search">VER TUDO</Link>
        </div>
        <div className="produto-grade">
          <div className="produto-card">
            <div className="foto" />
            <p>Vestido em linho</p>
            <span>R$ 350,99</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Vestido nude</p>
            <span>R$ 200,00</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Conjunto linho</p>
            <span>R$ 260,00</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Blusa ombro a ombro</p>
            <span>R$ 149,90</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Blusa bebella</p>
            <span>R$ 200,00</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Colete em crochê</p>
            <span>R$ 350,99</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Conjunto rosa</p>
            <span>R$ 229,90</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Camisa malha canelada</p>
            <span>R$ 189,90</span>
          </div>
        </div>
      </div>
    </div>
  );
}
