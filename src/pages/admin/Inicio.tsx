import { Link } from "react-router-dom";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { to_currency } from "../../database/Schema.tsx";
import {
  type ProdutoAdmin,
  type PedidoAdmin,
  totalPedido,
  dataCurta,
} from "./dados.ts";
import { botaoPrincipal, botaoSecundario, cartao, th, td } from "./estilos.ts";
import { Badge, Foto, Cabecalho } from "./componentes.tsx";

export default function Inicio({
  produtos,
  pedidos,
  erroPedidos,
}: {
  produtos: ProdutoAdmin[];
  pedidos: PedidoAdmin[];
  erroPedidos: string | null;
}) {
  const ativos = produtos.filter((p) => p.status === "Ativo");
  const estoqueBaixo = ativos.filter((p) => p.in_stock <= 3);
  const agora = new Date();
  const pagos = pedidos.filter(
    (p) =>
      p.status !== "Cancelado" &&
      p.status !== "Aguardando pagamento" &&
      p.data !== null &&
      p.data.getMonth() === agora.getMonth() &&
      p.data.getFullYear() === agora.getFullYear(),
  );
  const vendas = pagos.reduce((soma, p) => soma + totalPedido(p), 0);
  const aEnviar = pedidos.filter(
    (p) => p.status === "Pago" || p.status === "Separando",
  );

  const indicadores = [
    {
      texto: "Vendas no mês",
      valor: erroPedidos ? "—" : to_currency(vendas),
      nota: erroPedidos
        ? "Pedidos indisponíveis"
        : `${pagos.length} pedidos pagos`,
    },
    {
      texto: "Pedidos a enviar",
      valor: erroPedidos ? "—" : String(aEnviar.length),
      nota: erroPedidos ? "Pedidos indisponíveis" : "Pagos e aguardando envio",
    },
    {
      texto: "Estoque baixo",
      valor: String(estoqueBaixo.length),
      nota: "3 unidades ou menos",
    },
    {
      texto: "Produtos ativos",
      valor: String(ativos.length),
      nota: "Visíveis na loja",
    },
  ];

  return (
    <>
      <Cabecalho titulo="Início" sub="Resumo da loja">
        <Link to="/painel/pedidos" className={botaoSecundario}>
          Ver pedidos
        </Link>
        <Link to="/painel/produtos/novo" className={botaoPrincipal}>
          <PlusIcon size={16} aria-hidden="true" />
          Novo produto
        </Link>
      </Cabecalho>

      <section
        aria-label="Indicadores"
        className={`${cartao} grid grid-cols-2 lg:grid-cols-4`}
      >
        {indicadores.map((i, n) => (
          <div
            key={i.texto}
            className={`flex flex-col gap-1 px-5 py-4 ${n > 0 ? "border-l border-[#edeae8]" : ""} ${n > 1 ? "max-lg:border-t" : ""} ${n === 2 ? "max-lg:border-l-0" : ""}`}
          >
            <span className="text-[13px] text-[#6b6b6b]">{i.texto}</span>
            <span className="text-2xl font-medium tabular-nums">{i.valor}</span>
            <span className="text-xs text-[#8a8a8a]">{i.nota}</span>
          </div>
        ))}
      </section>

      <section className={`${cartao} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3.5">
          <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
            Pedidos recentes
          </h2>
          <Link
            to="/painel/pedidos"
            className="inline-flex items-center gap-1 text-sm text-[#98263e]! no-underline"
          >
            Ver todos
            <CaretRightIcon size={16} />
          </Link>
        </div>
        {erroPedidos ? (
          <p className="m-0 border-t border-[#edeae8] px-4 py-3.5 text-sm text-[#6b6b6b]">
            {erroPedidos}
          </p>
        ) : pedidos.length === 0 ? (
          <p className="m-0 border-t border-[#edeae8] px-4 py-3.5 text-sm text-[#6b6b6b]">
            Nenhum pedido ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
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
                    Total
                  </th>
                  <th scope="col" className={th}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedidos.slice(0, 5).map((p) => (
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
                      {dataCurta(p.data)}
                    </td>
                    <td className={`${td} tabular-nums`}>
                      {to_currency(totalPedido(p))}
                    </td>
                    <td className={td}>
                      <Badge texto={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={`${cartao} px-4 py-4`}>
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
            Estoque baixo
          </h2>
          <Link
            to="/painel/produtos"
            className="text-sm text-[#98263e]! no-underline"
          >
            Repor estoque
          </Link>
        </div>
        <ul className="m-0 list-none p-0">
          {estoqueBaixo.length === 0 && (
            <li className="py-3 text-sm text-[#6b6b6b]">
              Nenhum produto com estoque baixo.
            </li>
          )}
          {estoqueBaixo.map((p) => (
            <li
              key={p.db_id}
              className="flex items-center gap-3.5 border-t border-[#edeae8] py-3"
            >
              <Foto src={p.pic_url?.[0]} tamanho="h-11 w-11" />
              <Link
                to={`/painel/produtos/${p.db_id}`}
                className="flex-1 text-sm font-medium text-neutral-900! no-underline"
              >
                {p.name}
              </Link>
              <span className="whitespace-nowrap text-sm font-medium text-[#a3261f]">
                {p.in_stock === 0 ? "Esgotado" : `${p.in_stock} un.`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
