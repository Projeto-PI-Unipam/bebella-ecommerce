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
  def_installments,
} from "../database/Schema.tsx";
import { ObjectId } from "bson";
import ProductCard from "../components/ProductCard.tsx";

interface Suggestions {
  related: ClothesModel[];
  newest: ClothesModel[];
}

export default function ProductPage({
  host,
  putState,
}: {
  host: string | null;
  putState: React.ActionDispatch<any>;
}) {
  const [item, setItem] = useState<ClothesModel | null>(null);
  const [suggestions, setSuggests] = useState<Suggestions | null>(null);
  const [chosenSize, setSize] = useState<size | null>(null);
  const [pictureIndex, setPicture] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [buttonDisplay, setButton] = useState<string>("normal");

  useEffect(() => {
    async function getSuggests() {
      const rres = await fetch(`/items/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 5,
          page: 1,
          mod: "newest",
          cat: item?.category,
        }),
      });
      const nres = await fetch(`/items/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 5,
          page: 1,
          mod: "newest",
        }),
      });
      if (nres.ok && rres.ok) {
        const nbody: ClothesModel[] = await nres.json();
        const rbody: ClothesModel[] = await rres.json();
        setSuggests({
          newest: nbody.filter((s) => s._id !== item!._id).slice(0, 4),
          related: rbody.filter((s) => s._id !== item!._id).slice(0, 4),
        });
        console.log({ newest: nbody, related: rbody });
        return;
      } else {
        if (!nres.ok) {
          console.error(nres);
        }
        if (!rres.ok) {
          console.error(rres);
        }
        return;
      }
    }
    getSuggests();
  }, [item]);

  useEffect(() => {
    async function getItem() {
      const path = location.pathname.split("/");
      if (!(path.length > 2)) {
        location.replace(location.origin);
        return;
      }
      const item_id = path[2];
      const res = await fetch(`/items/view?id=${item_id}`, {
        method: "GET",
      });
      if (res.ok) {
        const prod = await res.json();
        setItem(prod);
        return;
      } else {
        console.error(res);
        //location.replace(location.origin + "/search");
        return;
      }
    }
    getItem();
  }, [location.href, location.pathname]);

  const user = useContext(AuthContext);

  const cart_put = useEffectEvent(async () => {
    if (!chosenSize || !quantity || !item) {
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
      _id: new ObjectId(),
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
      await new Promise((r) => setTimeout(r, 10000));
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
          <Link to="/">{"INÍCIO"}</Link>
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
                    key={index}
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
          <div className="w-120 h-auto bg-red-300">
            {item && item.pic_url && (
              <img
                className="w-full h-full"
                src={bucket + `/${item!.pic_url![pictureIndex]}`}
              />
            )}
          </div>

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
                {`ou ${def_installments}x de ${to_currency(item!.price / def_installments)} sem juros`}
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
                      "flex items-center justify-center w-10 h-10 border border-solid border-[#f5f5f5] rounded-md bg-[#f5f5f5] cursor-pointer transition ease-in duration-75",
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

            {item && item.description && (
              <div className="produto-descricao">
                <h2>SOBRE ESSE PRODUTO</h2>
                <p>{item!.description!}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {suggestions && (
        <>
          <div className="pl-6 pr-6 mt-20">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-2xl">{"RELACIONADOS"}</h2>
              <span
                className="text-sm text-rose-400 cursor-pointer transition hover:scale-110"
                onClick={() =>
                  window.location.assign(
                    window.location.origin + `/category?s=${item.category}`,
                  )
                }
              >
                {"VER CATEGORIA"}
              </span>
            </div>
            <div className="w-full h-auto flex flex-row items-center justify-start gap-6">
              {suggestions.related.map((sg) => (
                <ProductCard item={sg} key={sg._id.toString()} />
              ))}
            </div>
          </div>
          <div className="pb-0 pl-6 pr-6 mt-20">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-2xl">{"NOVIDADES"}</h2>
              <span
                className="text-sm text-rose-400 cursor-pointer transition hover:scale-110"
                onClick={() => window.location.assign(window.location.origin)}
              >
                {"PÁGINA INICIAL"}
              </span>
            </div>
            <div className="w-full h-auto flex flex-row items-center justify-start gap-6">
              {suggestions.newest.map((sg) => (
                <ProductCard item={sg} key={sg._id.toString()} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
