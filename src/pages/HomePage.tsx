import patternBg from "../assets/img/pattern_cut.png";
import { bucket, type ClothesModel, to_currency } from "../database/Schema.tsx";
import "../assets/fonts/fonts.css";
import { useEffect, useState } from "react";

interface ConteudoHome {
  beneficios: string[];
  campanha: {
    selo: string;
    titulo: string;
    texto: string;
    botao: string;
    imagem: string | null;
  };
  banner: { titulo: string; texto: string; botao: string };
  newsletter: { titulo: string; texto: string };
}

const conteudoProvisorio: ConteudoHome = {
  beneficios: ["Em espera", "Em espera", "Em espera", "Em espera"],
  campanha: {
    selo: "EM ESPERA",
    titulo: "Em espera",
    texto: "Em espera",
    botao: "EM ESPERA",
    imagem: null,
  },
  banner: { titulo: "Em espera", texto: "Em espera", botao: "EM ESPERA" },
  newsletter: { titulo: "Em espera", texto: "Em espera" },
};

function idDoProduto(p: ClothesModel) {
  return p.db_id || String(p._id);
}

function fotoDoProduto(p: ClothesModel) {
  const foto = p.pic_url?.[0];
  return foto ? `${bucket}/${foto}` : undefined;
}

function CardProduto({ item }: { item: ClothesModel }) {
  const foto = fotoDoProduto(item);
  return (
    <a
      href={"/product/" + idDoProduto(item)}
      className="flex min-w-0 flex-col gap-3 text-neutral-800! no-underline"
    >
      <span className="relative block aspect-3/4 overflow-hidden rounded-md bg-[#f4efed]">
        {foto && (
          <img
            src={foto}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-[15px] leading-snug">{item.name}</span>
        <span className="text-base font-medium">{to_currency(item.price)}</span>
        <span className="text-[13px] text-[#6b6461]">
          6x de {to_currency(item.price / 6)} sem juros
        </span>
      </span>
    </a>
  );
}

function TituloSecao({ titulo }: { titulo: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <h2 className="m-0! font-[Prompt]! text-xl! font-medium! tracking-wide! text-neutral-800! md:text-2xl!">
        {titulo}
      </h2>
    </div>
  );
}

function GradeProdutos({ itens }: { itens: ClothesModel[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-6">
      {itens.map((p) => (
        <CardProduto key={idDoProduto(p)} item={p} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [newHighlights, setNewHl] = useState<ClothesModel[]>([]);
  const [mostSoldHl, setSoldHl] = useState<ClothesModel[]>([]);
  const conteudo = conteudoProvisorio;

  useEffect(() => {
    async function getSelect(mod: string, done: boolean) {
      const res = await fetch("/items/get", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          limit: 4,
          page: 1,
          mod: mod,
        }),
      });
      if (res.ok) {
        const items: ClothesModel[] = await res.json();
        if (mod === "latest") {
          setNewHl(items);
        } else if (mod === "selling") {
          setSoldHl(items);
        }
      } else {
        console.error(res);
      }
      if (done) {
        return;
      } else {
        return await getSelect("selling", true);
      }
    }
    getSelect("latest", false);
  }, []);

  const categorias: { nome: string; foto?: string }[] = [];
  for (const p of [...newHighlights, ...mostSoldHl]) {
    if (p.category && !categorias.some((c) => c.nome === p.category)) {
      categorias.push({ nome: p.category, foto: fotoDoProduto(p) });
    }
  }

  return (
    <div className="flex w-full flex-col bg-white text-left font-[Prompt] text-neutral-800">
      <div className="bg-[#fdf1ee] px-4 py-2.5 text-[13px] text-[#4a4542]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-1 text-center">
          {conteudo.beneficios.map((b, i) => (
            <span key={i} className={i > 1 ? "hidden md:inline" : ""}>
              {b}
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl md:px-10 md:pt-8">
        <div className="flex flex-col-reverse overflow-hidden bg-[#f8eeeb] md:min-h-[520px] md:flex-row md:rounded-md">
          <div className="flex flex-col items-start justify-center gap-4 px-4 py-8 md:w-1/2 md:px-14 md:py-14">
            <span className="text-xs tracking-[0.12em] text-[#6b3a44] md:text-[13px]">
              {conteudo.campanha.selo}
            </span>
            <h1 className="m-0! font-[Prompt]! text-4xl! leading-tight! font-medium! tracking-normal! text-neutral-800! md:text-5xl!">
              {conteudo.campanha.titulo}
            </h1>
            <p className="max-w-[400px] text-[15px] leading-relaxed text-[#4a4542] md:text-[17px]">
              {conteudo.campanha.texto}
            </p>
            <div className="mt-2 flex w-full flex-wrap items-center gap-6 md:w-auto">
              <a
                href="#novidades"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f6bebf] px-7 text-sm font-medium tracking-wide text-neutral-800! no-underline md:w-auto"
              >
                {conteudo.campanha.botao}
              </a>
            </div>
          </div>
          <div className="relative h-[420px] md:h-auto md:w-1/2">
            {conteudo.campanha.imagem ? (
              <img
                src={conteudo.campanha.imagem}
                alt={conteudo.campanha.titulo}
                className="absolute inset-0 h-full w-full object-cover object-[55%_20%]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#e8d9cc] px-6 text-center text-sm text-[#6b6461]">
                Em espera
              </div>
            )}
          </div>
        </div>
      </section>

      {newHighlights.length > 0 && (
        <section
          id="novidades"
          className="mx-auto w-full max-w-7xl px-4 pt-12 md:px-10 md:pt-20"
        >
          <TituloSecao titulo="NOVIDADES" />
          <GradeProdutos itens={newHighlights} />
        </section>
      )}

      {categorias.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pt-12 md:px-10 md:pt-20">
          <TituloSecao titulo="COMPRE POR CATEGORIA" />
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {categorias.slice(0, 3).map((c) => (
              <a
                key={c.nome}
                href={"/category?q=" + c.nome.toLocaleLowerCase()}
                className="relative block aspect-3/4 overflow-hidden rounded-md bg-[#f4efed] text-white! no-underline"
              >
                {c.foto && (
                  <img
                    src={c.foto}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[50%_30%]"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent to-black/45"></span>
                <span className="absolute bottom-2 left-2 text-xs font-medium tracking-wide md:bottom-5 md:left-5 md:text-base">
                  {c.nome.toUpperCase()}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="relative mt-12 overflow-hidden bg-[#f6bebf] md:mt-20">
        <img
          src={patternBg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -right-10 w-52 -translate-y-1/2 opacity-20 md:right-0 md:w-90"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-11">
          <div className="flex flex-col gap-1.5">
            <span className="text-xl font-medium md:text-[26px]">
              {conteudo.banner.titulo}
            </span>
            <span className="text-sm text-[#4a4542] md:text-[15px]">
              {conteudo.banner.texto}
            </span>
          </div>
          <a
            href="/ofertas"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium tracking-wide text-neutral-800! no-underline"
          >
            {conteudo.banner.botao}
          </a>
        </div>
      </section>

      {mostSoldHl.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pt-12 md:px-10 md:pt-20">
          <TituloSecao titulo="MAIS VENDIDOS" />
          <GradeProdutos itens={mostSoldHl} />
        </section>
      )}

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2.5 px-4 py-14 text-center md:py-24">
        <h2 className="m-0! font-[Prompt]! text-xl! font-medium! tracking-normal! text-neutral-800! md:text-2xl!">
          {conteudo.newsletter.titulo}
        </h2>
        <p className="text-sm text-[#6b6461] md:text-[15px]">
          {conteudo.newsletter.texto}
        </p>
        <div className="mt-3 flex w-full max-w-[520px] flex-col gap-2.5 md:flex-row">
          <input
            type="email"
            aria-label="Seu e-mail"
            placeholder="Seu melhor e-mail"
            className="h-12 flex-1 rounded-full border border-[#e3c9c4] bg-white px-5 text-[15px] text-neutral-800 outline-none"
          />
          <button
            type="button"
            className="h-12 cursor-pointer rounded-full bg-[#f6bebf] px-7 text-sm font-medium tracking-wide text-neutral-800"
          >
            CADASTRAR
          </button>
        </div>
      </section>
    </div>
  );
}
