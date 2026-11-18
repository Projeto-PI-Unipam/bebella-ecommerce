// Botões e campos seguem o padrão da loja: cantos pequenos, texto em caixa
// alta no botão e o rosa da marca só na ação principal.
const foco =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900";

export const botaoPrincipal = `inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#f6bebf] px-4 text-[13px] font-medium tracking-[0.06em] text-neutral-900! uppercase no-underline hover:bg-[#f0aeb0] disabled:cursor-default disabled:opacity-60 ${foco}`;
export const botaoSecundario = `inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#cfcac7] bg-white px-4 text-[13px] font-medium tracking-[0.06em] text-neutral-900! uppercase no-underline hover:bg-[#f5f4f3] disabled:cursor-default disabled:opacity-60 ${foco}`;
export const cartao = "rounded-lg border border-[#e2dedb] bg-white";
export const campo =
  "box-border h-10 w-full rounded-md border border-[#cfcac7] bg-white px-3 text-sm text-neutral-900! outline-none focus-visible:border-neutral-900 focus-visible:ring-1 focus-visible:ring-neutral-900";
export const th =
  "whitespace-nowrap bg-[#faf9f8] px-4 py-2.5 text-left text-xs font-medium tracking-[0.06em] text-[#6b6b6b] uppercase";
export const td =
  "border-t border-[#edeae8] px-4 py-3 text-sm whitespace-nowrap";
