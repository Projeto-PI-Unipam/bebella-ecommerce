import patternBg from "../assets/img/pattern_cut.png";
import { type ClothesModel, to_currency } from "../database/Schema.tsx";
import {
  conteudo_padrao,
  desconto_pix,
  type HomeContent,
  image_url,
} from "../database/ConteudoHome.ts";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import "../assets/fonts/fonts.css";
import { type FormEvent, useEffect, useRef, useState } from "react";

// Espaço que não quebra linha entre "R$" e o valor.
function preco(valor: number) {
  return to_currency(valor).replace(" ", "\u00a0");
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
      className="flex min-w-0 flex-col gap-3 rounded-md text-neutral-800! no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#98263e]"
    >
      <span className="relative block aspect-3/4 overflow-hidden rounded-md bg-[#f4efed]">
        {foto && (
          <img
            src={foto}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 motion-safe:hover:scale-[1.03]"
          />
        )}
        <SeloEstoque estoque={item.in_stock} />
      </span>
      <span className="flex flex-col gap-1">
        <span className="line-clamp-2 text-[15px] leading-snug">
          {item.name}
        </span>
        <span className="text-base font-medium">{preco(item.price)}</span>
        <span className="text-[13px] font-medium text-[#98263e]">
          {preco(item.price * (1 - desconto_pix))} no Pix
        </span>
        <span className="text-[13px] text-[#6b6461]">
          ou 6x de {preco(item.price / 6)} sem juros
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
      <h2 className="m-0! font-[Prompt]! text-xl! font-medium! tracking-wide! text-balance text-neutral-800! md:text-2xl!">
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

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Newsletter({ titulo, texto }: { titulo: string; texto: string }) {
  const [email, setEmail] = useState<string>("");
  const [estado, setEstado] = useState<"parado" | "enviando" | "ok">("parado");
  const [erro, setErro] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  async function cadastrar(e: FormEvent) {
    e.preventDefault();
    const valor = email.trim();
    if (!emailValido.test(valor)) {
      setErro("Digite um e-mail válido, como nome@email.com.");
      campo.current?.focus();
      return;
    }
    setErro(null);
    setEstado("enviando");
    try {
      const res = await fetch("/items/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: valor }),
      });
      if (!res.ok) throw new Error();
      setEstado("ok");
      setEmail("");
    } catch {
      setEstado("parado");
      setErro("Não conseguimos cadastrar agora. Tente de novo em instantes.");
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2.5 px-4 py-14 text-center md:py-24">
      <h2 className="m-0! font-[Prompt]! text-xl! font-medium! tracking-normal! text-balance text-neutral-800! md:text-2xl!">
        {titulo}
      </h2>
      <p className="text-sm text-pretty text-[#6b6461] md:text-[15px]">
        {texto}
      </p>
      <form
        noValidate
        onSubmit={cadastrar}
        className="mt-3 flex w-full max-w-[520px] flex-col gap-2.5 md:flex-row"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Seu e-mail
        </label>
        <input
          ref={campo}
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (estado === "ok") setEstado("parado");
          }}
          aria-invalid={erro ? true : undefined}
          aria-describedby="newsletter-retorno"
          placeholder="nome@email.com…"
          className="h-12 flex-1 rounded-full border border-[#e3c9c4] bg-white px-5 text-[15px] text-neutral-800 outline-none focus-visible:border-[#98263e] focus-visible:ring-2 focus-visible:ring-[#98263e]/15 aria-invalid:border-[#8a2b2b]"
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="h-12 cursor-pointer rounded-full bg-[#f6bebf] px-7 text-sm font-medium tracking-wide text-neutral-800 hover:bg-[#f2aeb0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#98263e] disabled:cursor-default disabled:opacity-70"
        >
          {estado === "enviando" ? "CADASTRANDO…" : "CADASTRAR E-MAIL"}
        </button>
      </form>
      <p
        id="newsletter-retorno"
        aria-live="polite"
        className={`m-0 min-h-5 text-sm ${erro ? "text-[#8a2b2b]" : "text-[#2c6243]"}`}
      >
        {erro ?? (estado === "ok" ? "Pronto! Seu e-mail foi cadastrado." : "")}
      </p>
    </section>
  );
}

// Faixa de benefícios logo abaixo da navbar. No computador mostra todos numa
// linha; no celular mostra um por vez, com setas para trocar (sem troca
// automática).
function Beneficio({ b }: { b: HomeContent["benefits"][number] }) {
  return (
    <>
      <strong className="font-bold text-white">{b.highlight}</strong>{" "}
      {b.text.replace("R$ ", "R$\u00a0")}
    </>
  );
}

function FaixaBeneficios({
  beneficios,
}: {
  beneficios: HomeContent["benefits"];
}) {
  const [atual, setAtual] = useState<number>(0);
  const total = beneficios.length;
  if (total === 0) return null;
  const mostrar = beneficios[atual % total];
  const ir = (passo: number) => setAtual((i) => (i + passo + total) % total);
  const seta =
    "flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full text-[#e9e4e2] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white md:hidden";

  return (
    <div className="bg-[#2b2b2b] text-xs tracking-[0.07em] text-[#e9e4e2] uppercase">
      <div className="mx-auto flex h-[38px] max-w-7xl items-center justify-center px-2">
        {total > 1 && (
          <button
            type="button"
            onClick={() => ir(-1)}
            aria-label="Benefício anterior"
            className={seta}
          >
            <CaretLeftIcon size={14} aria-hidden="true" />
          </button>
        )}
        <p aria-live="polite" className="m-0 flex-1 text-center md:hidden">
          <Beneficio b={mostrar} />
        </p>
        {total > 1 && (
          <button
            type="button"
            onClick={() => ir(1)}
            aria-label="Próximo benefício"
            className={`${seta} order-last`}
          >
            <CaretRightIcon size={14} aria-hidden="true" />
          </button>
        )}
        <ul className="m-0 hidden list-none items-center gap-3.5 p-0 md:flex">
          {beneficios.map((b, i) => (
            <li key={i} className="flex items-center gap-3.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-[#6b6461]">
                  ·
                </span>
              )}
              <span>
                <Beneficio b={b} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [newHighlights, setNewHl] = useState<ClothesModel[]>([]);
  const [mostSoldHl, setSoldHl] = useState<ClothesModel[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [conteudo, setConteudo] = useState<HomeContent>(conteudo_padrao);

  useEffect(() => {
    async function getSelect(mod: "latest" | "selling") {
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
    }
    // Novidades e mais vendidos são pedidos juntos, não um depois do outro.
    Promise.all([getSelect("latest"), getSelect("selling")])
      .catch((err) => console.error(err))
      .finally(() => setCarregando(false));
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
      <FaixaBeneficios beneficios={conteudo.benefits} />

      {conteudo.show_campaign && (
        <section className="flex w-full flex-col bg-[#f8eeeb] md:h-[440px] md:flex-row">
          <div className="flex flex-col items-start justify-center gap-3.5 px-4 py-7 md:w-[38%] md:px-12 md:py-10 lg:px-16">
            <span className="text-xs tracking-[0.12em] text-[#6b3a44] md:text-[13px]">
              {conteudo.campaign.tag}
            </span>
            <h1 className="m-0! font-[Prompt]! text-3xl! leading-tight! font-medium! tracking-normal! text-balance text-neutral-800! md:text-[40px]!">
              {conteudo.campaign.title}
            </h1>
            <p className="max-w-[360px] text-[15px] leading-relaxed text-[#4a4542]">
              {conteudo.campaign.text}
            </p>
            <a
              href={conteudo.campaign.link || "#novidades"}
              className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f6bebf] px-7 text-sm font-medium tracking-wide text-neutral-800! no-underline md:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#98263e]"
            >
              {conteudo.campaign.button}
            </a>
          </div>
          <div className="relative order-first h-[340px] md:order-none md:h-full md:w-[62%]">
            {fotoCampanha ? (
              <img
                src={fotoCampanha}
                alt={conteudo.campaign.title}
                fetchPriority="high"
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
                href={"/category?s=" + encodeURIComponent(c.nome)}
                className="group relative block aspect-3/4 overflow-hidden rounded-md bg-[#f4efed] text-white! no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#98263e]"
              >
                {c.foto && (
                  <img
                    src={c.foto}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
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
            <h2 className="m-0! font-[Prompt]! text-xl! font-medium! tracking-normal! text-balance text-neutral-800! md:text-[26px]!">
              {conteudo.banner.title}
            </h2>
            <span className="text-sm text-[#4a4542] md:text-[15px]">
              {conteudo.banner.text}
            </span>
          </div>
          <a
            href={conteudo.banner.link || "#novidades"}
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium tracking-wide text-neutral-800! no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#98263e]"
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

      <Newsletter
        titulo={conteudo.newsletter.title}
        texto={conteudo.newsletter.text}
      />
    </div>
  );
}
