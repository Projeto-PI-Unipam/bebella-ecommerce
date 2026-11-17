import patternBg from "../assets/img/pattern_cut.png";
import {
  bucket,
  type ClothesModel,
  to_currency,
} from "../database/Schema.tsx";
import "../assets/fonts/fonts.css";
import { useEffect, useState } from "react";

// Conteúdo da home (campanha, benefícios, banner e newsletter).
// Esses textos aparecem enquanto o painel não publica nada em /items/home.
interface HomeContent {
  show_campaign: boolean;
  campaign: {
    tag: string;
    title: string;
    text: string;
    button: string;
    link: string;
    image: string;
  };
  benefits: { highlight: string; text: string }[];
  banner: { title: string; text: string; button: string; link: string };
  newsletter: { title: string; text: string };
}

const default_home_content: HomeContent = {
  show_campaign: true,
  campaign: {
    tag: "EM ESPERA",
    title: "Em espera",
    text: "Em espera",
    button: "EM ESPERA",
    link: "",
    image: "",
  },
  benefits: [
    { highlight: "Frete grátis", text: "acima de R$ 299" },
    { highlight: "5% OFF", text: "no Pix" },
    { highlight: "Até 6x sem juros", text: "no cartão" },
    { highlight: "Troca grátis", text: "em 30 dias" },
  ],
  banner: {
    title: "5% OFF no Pix em toda a loja",
    text: "O desconto já aparece no pagamento. Parcele no cartão em até 6x sem juros.",
    button: "APROVEITAR",
    link: "",
  },
  newsletter: {
    title: "Ganhe 10% OFF na primeira compra",
    text: "Cadastre seu e-mail e receba novidades e ofertas antes de todo mundo.",
  },
};

const pix_discount = 0.05;

function image_url(name?: string): string | undefined {
  if (!name) return undefined;
  if (/^(https?:|blob:|data:|\/)/.test(name)) return name;
  return `${bucket}/${name}`;
}

function idDoProduto(p: ClothesModel) {
  return p.db_id || String(p._id);
}

function SeloEstoque({ estoque }: { estoque: number }) {
  if (estoque > 3) return null;
  return (
    <span className="absolute top-2 left-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#98263e]">
      {estoque === 0 ? "Esgotado" : "Últimas unidades"}
    </span>
  );
}

function CardProduto({ item }: { item: ClothesModel }) {
  const foto = image_url(item.pic_url?.[0]);
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
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        )}
        <SeloEstoque estoque={item.in_stock} />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-[15px] leading-snug">{item.name}</span>
        <span className="text-base font-medium">{to_currency(item.price)}</span>
        <span className="text-[13px] font-medium text-[#98263e]">
          {to_currency(item.price * (1 - pix_discount))} no Pix
        </span>
        <span className="text-[13px] text-[#6b6461]">
          ou 6x de {to_currency(item.price / 6)} sem juros
        </span>
      </span>
    </a>
  );
}

function CardEsqueleto() {
  return (
    <div className="flex min-w-0 flex-col gap-3" aria-hidden="true">
      <span className="block aspect-3/4 animate-pulse rounded-md bg-[#f4efed]"></span>
      <span className="h-4 w-3/4 animate-pulse rounded bg-[#f4efed]"></span>
      <span className="h-4 w-1/3 animate-pulse rounded bg-[#f4efed]"></span>
    </div>
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

function GradeProdutos({
  itens,
  carregando,
}: {
  itens: ClothesModel[];
  carregando: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-6">
      {carregando
        ? [0, 1, 2, 3].map((i) => <CardEsqueleto key={i} />)
        : itens.map((p) => <CardProduto key={idDoProduto(p)} item={p} />)}
    </div>
  );
}

export default function HomePage() {
  const [newHighlights, setNewHl] = useState<ClothesModel[]>([]);
  const [mostSoldHl, setSoldHl] = useState<ClothesModel[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [conteudo, setConteudo] = useState<HomeContent>(default_home_content);

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
    getSelect("latest", false).finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    fetch("/items/home")
      .then((res) => (res.ok ? res.json() : null))
      .then((dados: HomeContent | null) => {
        if (dados) setConteudo(dados);
      })
      .catch((err) => console.error(err));
  }, []);

  const categorias: { nome: string; foto?: string }[] = [];
  for (const p of [...newHighlights, ...mostSoldHl]) {
    if (p.category && !categorias.some((c) => c.nome === p.category)) {
      categorias.push({ nome: p.category, foto: image_url(p.pic_url?.[0]) });
    }
  }

  const fotoCampanha = image_url(conteudo.campaign.image);

  return (
    <div className="flex w-full flex-col bg-white text-left font-[Prompt] text-neutral-800">
      <div className="bg-[#fdf1ee] px-4 py-3 text-[13px] text-[#2b2b2b] md:text-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-1 text-center">
          {conteudo.benefits.map((b, i) => (
            <span key={i} className={i > 1 ? "hidden md:inline" : ""}>
              <strong className="font-bold text-[#98263e]">
                {b.highlight}
              </strong>{" "}
              {b.text}
            </span>
          ))}
        </div>
      </div>

      {conteudo.show_campaign && (
        <section className="flex w-full flex-col bg-[#f8eeeb] md:h-[440px] md:flex-row">
          <div className="flex flex-col items-start justify-center gap-3.5 px-4 py-7 md:w-[38%] md:px-12 md:py-10 lg:px-16">
            <span className="text-xs tracking-[0.12em] text-[#6b3a44] md:text-[13px]">
              {conteudo.campaign.tag}
            </span>
            <h1 className="m-0! font-[Prompt]! text-3xl! leading-tight! font-medium! tracking-normal! text-neutral-800! md:text-[40px]!">
              {conteudo.campaign.title}
            </h1>
            <p className="max-w-[360px] text-[15px] leading-relaxed text-[#4a4542]">
              {conteudo.campaign.text}
            </p>
            <a
              href={conteudo.campaign.link || "#novidades"}
              className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f6bebf] px-7 text-sm font-medium tracking-wide text-neutral-800! no-underline md:w-auto"
            >
              {conteudo.campaign.button}
            </a>
          </div>
          <div className="relative order-first h-[340px] md:order-none md:h-full md:w-[62%]">
            {fotoCampanha ? (
              <img
                src={fotoCampanha}
                alt={conteudo.campaign.title}
                className="absolute inset-0 h-full w-full object-cover object-[50%_8%]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#e8d9cc] px-6 text-center text-sm text-[#6b6461]">
                Em espera
              </div>
            )}
          </div>
        </section>
      )}

      {(carregando || newHighlights.length > 0) && (
        <section
          id="novidades"
          className="mx-auto w-full max-w-7xl px-4 pt-12 md:px-10 md:pt-20"
        >
          <TituloSecao titulo="NOVIDADES" />
          <GradeProdutos itens={newHighlights} carregando={carregando} />
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
                className="group relative block aspect-3/4 overflow-hidden rounded-md bg-[#f4efed] text-white! no-underline"
              >
                {c.foto && (
                  <img
                    src={c.foto}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-transform duration-300 group-hover:scale-[1.03]"
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
              {conteudo.banner.title}
            </span>
            <span className="text-sm text-[#4a4542] md:text-[15px]">
              {conteudo.banner.text}
            </span>
          </div>
          <a
            href={conteudo.banner.link || "#novidades"}
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium tracking-wide text-neutral-800! no-underline"
          >
            {conteudo.banner.button}
          </a>
        </div>
      </section>

      {(carregando || mostSoldHl.length > 0) && (
        <section className="mx-auto w-full max-w-7xl px-4 pt-12 md:px-10 md:pt-20">
          <TituloSecao titulo="MAIS VENDIDOS" />
          <GradeProdutos itens={mostSoldHl} carregando={carregando} />
        </section>
      )}

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2.5 px-4 py-14 text-center md:py-24">
        <h2 className="m-0! font-[Prompt]! text-xl! font-medium! tracking-normal! text-neutral-800! md:text-2xl!">
          {conteudo.newsletter.title}
        </h2>
        <p className="text-sm text-[#6b6461] md:text-[15px]">
          {conteudo.newsletter.text}
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
