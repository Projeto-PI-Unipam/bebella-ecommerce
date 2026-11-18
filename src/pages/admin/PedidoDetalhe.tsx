import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { PrinterIcon } from "@phosphor-icons/react/dist/csr/Printer";
import { to_currency } from "../../database/Schema.tsx";
import {
  type StatusPedido,
  type PedidoAdmin,
  etapasPedido,
  totalPedido,
  dataCurta,
} from "./dados.ts";
import { botaoPrincipal, botaoSecundario, cartao, campo } from "./estilos.ts";
import { Badge, Foto, AvisoServidor } from "./componentes.tsx";

export default function PedidoDetalhe({
  pedidos,
  erro: erroPedidos,
  atualizar,
}: {
  pedidos: PedidoAdmin[];
  erro: string | null;
  atualizar: (p: PedidoAdmin) => Promise<void>;
}) {
  const { id } = useParams();
  const pedido = pedidos.find((p) => p.id === id);
  const [status, setStatus] = useState<StatusPedido>(pedido?.status ?? "Pago");
  const [rastreio, setRastreio] = useState<string>(pedido?.rastreio ?? "");
  const [salvo, setSalvo] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!pedido) {
    return (
      <>
        <Link
          to="/painel/pedidos"
          className="inline-flex items-center gap-2 self-start text-sm text-[#98263e]! no-underline"
        >
          <ArrowLeftIcon size={18} />
          Voltar para pedidos
        </Link>
        {erroPedidos ? (
          <AvisoServidor mensagem={erroPedidos} />
        ) : (
          <p className="text-[15px] text-[#6b6b6b]">Pedido não encontrado.</p>
        )}
      </>
    );
  }

  const atual = etapasPedido.indexOf(pedido.status);
  const total = totalPedido(pedido);

  async function salvar() {
    if (
      status === "Cancelado" &&
      pedido!.status !== "Cancelado" &&
      !window.confirm(`Cancelar o pedido #${pedido!.numero}?`)
    ) {
      return;
    }
    setErro(null);
    try {
      await atualizar({
        ...pedido!,
        status: status,
        rastreio: rastreio.trim(),
      });
      setSalvo(true);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <>
      <Link
        to="/painel/pedidos"
        className="inline-flex items-center gap-2 self-start text-sm text-[#98263e]! no-underline"
      >
        <ArrowLeftIcon size={18} />
        Voltar para pedidos
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0! font-[Prompt]! text-2xl! font-medium! tracking-normal! text-neutral-900!">
              Pedido #{pedido.numero}
            </h1>
            <Badge texto={pedido.status} />
          </div>
          <p className="m-0 text-[15px] text-[#6b6b6b]">
            Feito em {dataCurta(pedido.data)}
            {pedido.pagamento ? ` · ${pedido.pagamento}` : ""}
            {pedido.parcelas > 1 ? ` em ${pedido.parcelas}x` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className={botaoSecundario}
        >
          <PrinterIcon size={18} />
          Imprimir
        </button>
      </header>

      {pedido.status !== "Cancelado" && (
        <section className={`${cartao} p-5`}>
          <h2 className="mt-0! mb-4! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
            Andamento
          </h2>
          <ol className="m-0 flex list-none flex-wrap gap-4 p-0">
            {etapasPedido.map((e, i) => (
              <li
                key={e}
                className="flex flex-[1_1_120px] flex-col items-start gap-2.5"
              >
                {i < atual || (i === atual && e === "Entregue") ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white!">
                    <CheckIcon size={13} weight="bold" aria-hidden="true" />
                  </span>
                ) : i === atual ? (
                  <span className="box-border h-6 w-6 rounded-full border-2 border-neutral-900 bg-[#f6bebf]"></span>
                ) : (
                  <span className="box-border h-6 w-6 rounded-full border-2 border-[#cfcac7] bg-white"></span>
                )}
                <span
                  className={`text-sm ${i <= atual ? "font-medium" : "text-[#6b6b6b]"}`}
                >
                  {e}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <section className={`${cartao} min-w-0 flex-[999_1_480px] p-5`}>
          <h2 className="mt-0! mb-1.5! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
            Itens do pedido
          </h2>
          <ul className="m-0 list-none p-0">
            {pedido.itens.map((i) => (
              <li
                key={i.nome + i.tamanho}
                className="flex items-center gap-4 border-t border-[#edeae8] py-3.5"
              >
                <Foto src={i.foto} tamanho="h-16 w-16" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-medium">{i.nome}</span>
                  <span className="text-[13px] text-[#6b6b6b]">
                    Tam. {i.tamanho} · {i.quantidade} un.
                  </span>
                </div>
                <span className="whitespace-nowrap text-[15px]">
                  {to_currency(i.preco * i.quantidade)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 mb-0 grid grid-cols-[minmax(0,1fr)_auto] gap-y-2 border-t border-[#e2dedb] pt-3.5 text-sm">
            <dt className="text-[#6b6b6b]">Subtotal</dt>
            <dd className="m-0 text-right">
              {to_currency(total - pedido.frete)}
            </dd>
            <dt className="text-[#6b6b6b]">Frete</dt>
            <dd className="m-0 text-right">
              {pedido.frete === 0 ? "Grátis" : to_currency(pedido.frete)}
            </dd>
            <dt className="pt-1.5 text-base font-medium">Total</dt>
            <dd className="m-0 pt-1.5 text-right text-base font-medium">
              {to_currency(total)}
            </dd>
          </dl>
        </section>

        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
          <section className={`${cartao} flex flex-col gap-4 p-5`}>
            <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
              Atualizar pedido
            </h2>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Status
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as StatusPedido);
                  setSalvo(false);
                }}
                className={campo}
              >
                {etapasPedido.concat("Cancelado").map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Código de rastreio
              <input
                value={rastreio}
                onChange={(e) => {
                  setRastreio(e.target.value);
                  setSalvo(false);
                }}
                placeholder="Ex.: AA123456789BR"
                className={campo}
              />
            </label>
            <button
              type="button"
              onClick={salvar}
              className={`${botaoPrincipal} justify-center`}
            >
              <CheckIcon size={18} />
              Salvar alterações
            </button>
            {salvo && (
              <p role="status" className="m-0 text-sm text-[#2c6243]">
                Alterações salvas.
              </p>
            )}
            {erro && (
              <p role="alert" className="m-0 text-sm text-[#a3261f]">
                {erro}
              </p>
            )}
          </section>

          <section className={`${cartao} px-4 py-1`}>
            {[
              [
                "CLIENTE",
                [
                  pedido.cliente.nome,
                  pedido.cliente.email,
                  pedido.cliente.telefone,
                ].filter(Boolean),
              ],
              [
                "ENDEREÇO DE ENTREGA",
                [
                  pedido.endereco.rua,
                  pedido.endereco.complemento,
                  pedido.endereco.cidade,
                  pedido.endereco.cep && `CEP ${pedido.endereco.cep}`,
                ].filter(Boolean),
              ],
              [
                "PAGAMENTO",
                [
                  pedido.pagamento,
                  pedido.parcelas > 1
                    ? `${pedido.parcelas}x de ${to_currency(total / pedido.parcelas)}`
                    : "",
                ].filter(Boolean),
              ],
            ].map(([titulo, linhas]) => (
              <div
                key={titulo as string}
                className="flex flex-col gap-1 border-t border-[#edeae8] py-4 first:border-t-0"
              >
                <span className="text-xs tracking-[0.08em] text-[#6b6b6b]">
                  {titulo}
                </span>
                {(linhas as string[]).map((l, i) => (
                  <span
                    key={l}
                    className={`text-sm ${i === 0 ? "font-medium" : "text-[#6b6b6b]"}`}
                  >
                    {l}
                  </span>
                ))}
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
