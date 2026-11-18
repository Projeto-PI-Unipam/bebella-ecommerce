import { NavLink } from "react-router-dom";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import {
  type StatusProduto,
  type StatusPedido,
  corStatus,
  urlFoto,
} from "./dados.ts";

export function Badge({ texto }: { texto: StatusProduto | StatusPedido }) {
  const apagado = texto === "Arquivado" || texto === "Cancelado";
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm whitespace-nowrap ${apagado ? "text-[#8a8a8a]" : "text-neutral-900"}`}
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 flex-none rounded-full"
        style={{ background: corStatus[texto] }}
      ></span>
      {texto}
    </span>
  );
}

export function Foto({
  src,
  tamanho = "h-12 w-12",
}: {
  src?: string;
  tamanho?: string;
}) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={`${tamanho} flex-none rounded bg-[#edeae8]`}
      ></div>
    );
  }
  return (
    <img
      src={urlFoto(src)}
      alt=""
      className={`${tamanho} flex-none rounded object-cover`}
    />
  );
}

export function Cabecalho({
  titulo,
  sub,
  children,
}: {
  titulo: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0! font-[Prompt]! text-2xl! font-medium! tracking-normal! text-neutral-900!">
          {titulo}
        </h1>
        <p className="m-0 text-sm text-[#6b6b6b]">{sub}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </header>
  );
}

export function AvisoServidor({ mensagem }: { mensagem: string }) {
  return (
    <p
      role="alert"
      className="m-0 rounded-lg border border-[#e2dedb] bg-white px-4 py-3.5 text-sm text-[#6b6b6b]"
    >
      {mensagem}
    </p>
  );
}

export function Filtros<T extends string>({
  opcoes,
  ativo,
  mudar,
}: {
  opcoes: { valor: T; texto: string; total: number }[];
  ativo: T;
  mudar: (v: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filtrar por status"
      className="flex flex-wrap gap-x-6 border-b border-[#e2dedb]"
    >
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={ativo === o.valor}
          onClick={() => mudar(o.valor)}
          className={`-mb-px cursor-pointer border-b-2 pt-1 pb-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${
            ativo === o.valor
              ? "border-neutral-900 font-medium text-neutral-900!"
              : "border-transparent text-[#6b6b6b]! hover:text-neutral-900!"
          }`}
        >
          {o.texto}
          <span className="ml-1.5 text-xs text-[#8a8a8a] tabular-nums">
            {o.total}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Busca({
  valor,
  mudar,
  placeholder,
}: {
  valor: string;
  mudar: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex h-10 min-w-0 flex-[1_1_220px] items-center gap-2 rounded-md border border-[#cfcac7] bg-white px-3 text-[#6b6b6b] focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900">
      <MagnifyingGlassIcon size={16} aria-hidden="true" />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={valor}
        onChange={(e) => mudar(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900! outline-none"
      />
    </label>
  );
}

export function ItemMenu({
  para,
  icone,
  texto,
  contador,
}: {
  para: string;
  icone: React.ReactNode;
  texto: string;
  contador?: number;
}) {
  return (
    <NavLink
      to={para}
      end={para === "/painel"}
      className={({ isActive }) =>
        `flex min-h-10 items-center gap-3 rounded-md px-3 text-sm no-underline focus-visible:outline-2 focus-visible:outline-neutral-900 ${
          isActive
            ? "bg-[#f6bebf]/55 font-medium text-neutral-900!"
            : "text-[#3d3d3d]! hover:bg-[#f5f4f3]"
        }`
      }
    >
      <span className="flex flex-none">{icone}</span>
      <span className="whitespace-nowrap">{texto}</span>
      {contador ? (
        <span className="ml-auto rounded bg-neutral-900 px-1.5 py-px text-xs font-medium text-white! tabular-nums">
          {contador}
        </span>
      ) : null}
    </NavLink>
  );
}
