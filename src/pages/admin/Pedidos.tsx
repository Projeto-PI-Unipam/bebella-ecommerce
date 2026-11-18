import { useState } from "react";
import { Link } from "react-router-dom";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { to_currency } from "../../database/Schema.tsx";
import {
  type StatusPedido,
  type PedidoAdmin,
  etapasPedido,
  totalPedido,
} from "./dados.ts";
import { cartao, th, td } from "./estilos.ts";
import {
  Badge,
  Cabecalho,
  AvisoServidor,
  Filtros,
  Busca,
} from "./componentes.tsx";

export default function Pedidos({
  pedidos,
  erro,
}: {
  pedidos: PedidoAdmin[];
  erro: string | null;
}) {
  const [filtro, setFiltro] = useState<string>("Todos");
  const [busca, setBusca] = useState<string>("");

  if (erro) {
    return (
      <>
        <Cabecalho
          titulo="Pedidos"
          sub="Acompanhe as vendas e atualize o andamento de cada pedido"
        />
        <AvisoServidor mensagem={erro} />
      </>
    );
  }

  const grupos: Record<string, StatusPedido[]> = {
    Todos: etapasPedido.concat("Cancelado"),
    "A enviar": ["Pago", "Separando"],
    Enviados: ["Enviado"],
    Concluídos: ["Entregue"],
    Cancelados: ["Cancelado"],
  };

  const lista = pedidos.filter(
    (p) =>
      grupos[filtro].includes(p.status) &&
      (String(p.numero).includes(busca) ||
        p.cliente.nome.toLowerCase().includes(busca.toLowerCase())),
  );

  const resumo: [string, StatusPedido][] = [
    ["Aguardando pagamento", "Aguardando pagamento"],
    ["Pagos, para separar", "Pago"],
    ["Em separação", "Separando"],
    ["Enviados", "Enviado"],
  ];

  return (
    <>
      <Cabecalho
        titulo="Pedidos"
        sub="Acompanhe as vendas e atualize o andamento de cada pedido"
      />

      <section
        aria-label="Resumo por etapa"
        className={`${cartao} grid grid-cols-2 lg:grid-cols-4`}
      >
        {resumo.map(([texto, status], n) => (
          <div
            key={texto}
            className={`flex flex-col gap-1 px-5 py-4 ${n > 0 ? "border-l border-[#edeae8]" : ""} ${n > 1 ? "max-lg:border-t" : ""} ${n === 2 ? "max-lg:border-l-0" : ""}`}
          >
            <span className="text-[13px] text-[#6b6b6b]">{texto}</span>
            <span className="text-2xl font-medium tabular-nums">
              {pedidos.filter((p) => p.status === status).length}
            </span>
          </div>
        ))}
      </section>

      <section className={`${cartao} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-[#e2dedb] px-5 py-4">
          <Filtros
            ativo={filtro}
            mudar={setFiltro}
            opcoes={Object.keys(grupos).map((g) => ({
              valor: g,
              texto: g,
              total: pedidos.filter((p) => grupos[g].includes(p.status)).length,
            }))}
          />
          <Busca
            valor={busca}
            mudar={setBusca}
            placeholder="Número do pedido ou cliente"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr>
                <th scope="col" className={th}>
                  Pedido
                </th>
                <th scope="col" className={th}>
                  Cliente
                </th>
                <th scope="col" className={th}>
                  Data
                </th>
                <th scope="col" className={th}>
                  Itens
                </th>
                <th scope="col" className={th}>
                  Total
                </th>
                <th scope="col" className={th}>
                  Pagamento
                </th>
                <th scope="col" className={th}>
                  Status
                </th>
                <th scope="col" className={th}>
                  <span className="sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className={`${td} py-10 text-center text-[#6b6b6b]`}
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
              {lista.map((p) => {
                const qtd = p.itens.reduce((s, i) => s + i.quantidade, 0);
                return (
                  <tr key={p.id}>
                    <td className={td}>
                      <Link
                        to={`/painel/pedidos/${p.id}`}
                        className="font-medium text-[#98263e]! no-underline"
                      >
                        #{p.numero}
                      </Link>
                    </td>
                    <td className={td}>{p.cliente.nome || "—"}</td>
                    <td className={`${td} text-[#6b6b6b]`}>
                      {p.data ? p.data.toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className={`${td} text-[#6b6b6b]`}>
                      {qtd} {qtd === 1 ? "item" : "itens"}
                    </td>
                    <td className={`${td} tabular-nums`}>
                      {to_currency(totalPedido(p))}
                    </td>
                    <td className={`${td} text-[#6b6b6b]`}>
                      {p.pagamento || "—"}
                      {p.parcelas > 1 ? ` ${p.parcelas}x` : ""}
                    </td>
                    <td className={td}>
                      <Badge texto={p.status} />
                    </td>
                    <td className={`${td} text-right`}>
                      <Link
                        to={`/painel/pedidos/${p.id}`}
                        aria-label={`Abrir pedido ${p.numero}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-900! hover:bg-[#f5f4f3]"
                      >
                        <CaretRightIcon size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
