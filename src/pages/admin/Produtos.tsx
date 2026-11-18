import { useState } from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { to_currency } from "../../database/Schema.tsx";
import { type StatusProduto, type ProdutoAdmin, categorias } from "./dados.ts";
import { botaoPrincipal, cartao, th, td } from "./estilos.ts";
import { Badge, Foto, Cabecalho, Filtros, Busca } from "./componentes.tsx";

export default function Produtos({
  produtos,
  arquivar,
}: {
  produtos: ProdutoAdmin[];
  arquivar: (id: string) => Promise<void>;
}) {
  const [filtro, setFiltro] = useState<"Todos" | StatusProduto>("Todos");
  const [busca, setBusca] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("Todas");
  const [erro, setErro] = useState<string | null>(null);

  async function arquivarProduto(p: ProdutoAdmin) {
    if (!window.confirm(`Arquivar "${p.name}"? Ele sai da loja.`)) return;
    setErro(null);
    try {
      await arquivar(p.db_id);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const lista = produtos.filter(
    (p) =>
      (filtro === "Todos" || p.status === filtro) &&
      (categoria === "Todas" || p.category === categoria) &&
      p.name.toLowerCase().includes(busca.toLowerCase()),
  );

  const contar = (s: StatusProduto) =>
    produtos.filter((p) => p.status === s).length;

  return (
    <>
      <Cabecalho
        titulo="Produtos"
        sub="Cadastre, edite e controle o estoque das peças da loja"
      >
        <Link to="/painel/produtos/novo" className={botaoPrincipal}>
          <PlusIcon size={18} />
          Novo produto
        </Link>
      </Cabecalho>

      {erro && (
        <p
          role="alert"
          className="m-0 rounded-md bg-[#fcebea] px-4 py-3 text-sm text-[#a3261f]"
        >
          {erro}
        </p>
      )}

      <section className={`${cartao} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-[#e2dedb] px-5 py-4">
          <Filtros
            ativo={filtro}
            mudar={setFiltro}
            opcoes={[
              { valor: "Todos", texto: "Todos", total: produtos.length },
              { valor: "Ativo", texto: "Ativos", total: contar("Ativo") },
              {
                valor: "Rascunho",
                texto: "Rascunho",
                total: contar("Rascunho"),
              },
              {
                valor: "Arquivado",
                texto: "Arquivados",
                total: contar("Arquivado"),
              },
            ]}
          />
          <div className="flex flex-wrap gap-2.5">
            <Busca
              valor={busca}
              mudar={setBusca}
              placeholder="Buscar por nome"
            />
            <label className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              Categoria
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="h-10 rounded-md border border-[#cfcac7] bg-white px-3 text-sm text-neutral-900! focus-visible:outline-2 focus-visible:outline-neutral-900"
              >
                <option>Todas</option>
                {categorias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr>
                <th scope="col" className={th}>
                  Produto
                </th>
                <th scope="col" className={th}>
                  Categoria
                </th>
                <th scope="col" className={th}>
                  Tamanhos
                </th>
                <th scope="col" className={th}>
                  Preço
                </th>
                <th scope="col" className={th}>
                  Estoque
                </th>
                <th scope="col" className={th}>
                  Status
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className={`${td} py-10 text-center text-[#6b6b6b]`}
                  >
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
              {lista.map((p) => (
                <tr key={p.db_id}>
                  <td className={td}>
                    <div className="flex items-center gap-3.5">
                      <Foto src={p.pic_url?.[0]} />
                      <Link
                        to={`/painel/produtos/${p.db_id}`}
                        className="font-medium whitespace-normal text-neutral-900! no-underline"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className={td}>{p.category}</td>
                  <td className={`${td} text-[#6b6b6b]`}>
                    {p.size_data.join(", ")}
                  </td>
                  <td className={`${td} tabular-nums`}>
                    {to_currency(p.price)}
                  </td>
                  <td
                    className={`${td} ${p.in_stock <= 3 ? "font-medium text-[#a3261f]" : ""}`}
                  >
                    {p.in_stock === 0 ? "Esgotado" : `${p.in_stock} un.`}
                  </td>
                  <td className={td}>
                    <Badge texto={p.status} />
                  </td>
                  <td className={td}>
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/painel/produtos/${p.db_id}`}
                        aria-label={`Editar ${p.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-900! hover:bg-[#f5f4f3]"
                      >
                        <PencilSimpleIcon size={18} />
                      </Link>
                      {p.status !== "Arquivado" && (
                        <button
                          type="button"
                          onClick={() => arquivarProduto(p)}
                          aria-label={`Arquivar ${p.name}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-neutral-900! hover:bg-[#f5f4f3]"
                        >
                          <ArchiveIcon size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
