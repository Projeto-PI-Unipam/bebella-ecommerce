git push origin devimport { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Modal from "../components/Modal";
import { Search, Pencil, Trash } from "../components/Icons";
import {
  CATEGORIAS,
  FILTROS_CATEGORIA,
  TAMANHOS,
  LIMITE_ESTOQUE_BAIXO,
  brl,
  statusEstoque,
} from "../data";
import type { Categoria, DadosProduto, Produto, SetState, StatusEstoque, Tamanho } from "../types";

const POR_PAGINA = 3;

const CLASSE_STATUS: Record<StatusEstoque, string> = {
  "Em estoque": "pill pill--verde",
  "Estoque baixo": "pill pill--laranja",
  Esgotado: "pill pill--vermelho",
};

function Miniatura({ produto }: { produto: Produto }) {
  if (produto.imagem) return <img className="foto foto--lista" src={produto.imagem} alt={produto.nome} />;
  return <div className="foto foto--lista foto--vazia">{produto.nome[0]}</div>;
}

                                                                        
                                                                
interface FormProduto {
  nome: string;
  categoria: Categoria;
  preco: number | string;
  precoPromo: number | string | null;
  estoque: number | string;
  tamanhos: Tamanho[];
  imagem: string;
}

type CampoTexto = "nome" | "preco" | "precoPromo" | "estoque" | "imagem";
type Erros = Partial<Record<"nome" | "preco" | "precoPromo" | "estoque" | "tamanhos", string>>;

interface ProdutoFormProps {
  inicial?: Produto;
  onSalvar: (dados: DadosProduto) => void;
}

function ProdutoForm({ inicial, onSalvar }: ProdutoFormProps) {
  const [f, setF] = useState<FormProduto>({
    nome: inicial?.nome ?? "",
    categoria: inicial?.categoria ?? "Blusa",
    preco: inicial?.preco ?? "",
    precoPromo: inicial?.precoPromo ?? "",
    estoque: inicial?.estoque ?? 1,
    tamanhos: inicial?.tamanhos ?? ["P"],
    imagem: inicial?.imagem ?? "",
  });
  const [erros, setErros] = useState<Erros>({});

  const set = (campo: CampoTexto) => (e: ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [campo]: e.target.value });

  const alternarTamanho = (t: Tamanho) =>
    setF({
      ...f,
      tamanhos: f.tamanhos.includes(t) ? f.tamanhos.filter((x) => x !== t) : [...f.tamanhos, t],
    });

  const salvar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const preco = Number(f.preco);
    const promo = f.precoPromo === "" || f.precoPromo === null ? null : Number(f.precoPromo);
    const estoque = Number(f.estoque);
    const novos: Erros = {};

    if (!f.nome.trim()) novos.nome = "Informe o nome do produto.";
    if (!(preco > 0)) novos.preco = "Informe um preço maior que zero.";
    if (promo !== null && !(promo > 0 && promo < preco)) novos.precoPromo = "A promoção deve ser menor que o preço.";
    if (!Number.isInteger(estoque) || estoque < 0) novos.estoque = "Use um número inteiro (0 ou mais).";
    if (f.tamanhos.length === 0) novos.tamanhos = "Escolha ao menos um tamanho.";

    setErros(novos);
    if (Object.keys(novos).length) return;

    onSalvar({
      nome: f.nome.trim(),
      categoria: f.categoria,
      preco,
      precoPromo: promo,
      estoque,
      tamanhos: TAMANHOS.filter((t) => f.tamanhos.includes(t)),
      imagem: f.imagem.trim(),
    });
  };

  return (
    <form className="form" onSubmit={salvar} noValidate>
      <label className="campo">
        <span>Nome do Produto</span>
        <input value={f.nome} onChange={set("nome")} placeholder="Ex.: Colete em Crochê" autoFocus />
        {erros.nome && <small className="erro">{erros.nome}</small>}
      </label>

      <label className="campo">
        <span>Categoria</span>
        <select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value as Categoria })}>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <div className="form__linha">
        <label className="campo">
          <span>Preço (R$)</span>
          <input type="number" step="0.01" min="0" value={f.preco} onChange={set("preco")} placeholder="00,00" />
          {erros.preco && <small className="erro">{erros.preco}</small>}
        </label>
        <label className="campo">
          <span>Preço Promocional (Opcional)</span>
          <input type="number" step="0.01" min="0" value={f.precoPromo ?? ""} onChange={set("precoPromo")} />
          {erros.precoPromo && <small className="erro">{erros.precoPromo}</small>}
        </label>
      </div>

      <div className="form__linha">
        <label className="campo">
          <span>Estoque (Unidades)</span>
          <input type="number" min="0" step="1" value={f.estoque} onChange={set("estoque")} />
          {erros.estoque && <small className="erro">{erros.estoque}</small>}
        </label>
        <div className="campo">
          <span>Tamanhos</span>
          <div className="tamanhos">
            {TAMANHOS.map((t) => (
              <button
                type="button"
                key={t}
                className={f.tamanhos.includes(t) ? "ativo" : ""}
                aria-pressed={f.tamanhos.includes(t)}
                onClick={() => alternarTamanho(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {erros.tamanhos && <small className="erro">{erros.tamanhos}</small>}
        </div>
      </div>

      <label className="campo">
        <span>Imagem (endereço da foto, opcional)</span>
        <input value={f.imagem} onChange={set("imagem")} placeholder="/img/colete.jpg" />
      </label>

      <div className="form__rodape">
        <small className="dica">
          Status automático: {statusEstoque(Number(f.estoque) || 0)} (estoque baixo com {LIMITE_ESTOQUE_BAIXO} un. ou menos)
        </small>
        <button type="submit" className="btn btn--cheio">Salvar</button>
      </div>
    </form>
  );
}

                               
interface ProdutosProps {
  produtos: Produto[];
  setProdutos: SetState<Produto[]>;
  busca: string;
  setBusca: (texto: string) => void;
}

export default function Produtos({ produtos, setProdutos, busca, setBusca }: ProdutosProps) {
  const [filtro, setFiltro] = useState<Categoria | null>(null);
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState<{ produto?: Produto } | null>(null);

  const termo = busca.toLowerCase();
  const filtrados = produtos.filter(
    (p) =>
      (!filtro || p.categoria === filtro) &&
      `${p.nome} ${p.categoria}`.toLowerCase().includes(termo)
  );

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const baixos = produtos.filter((p) => p.estoque > 0 && p.estoque <= LIMITE_ESTOQUE_BAIXO).length;

  const salvar = (dados: DadosProduto) => {
    if (!modal) return;
    const editando = modal.produto;
    if (editando) {
      setProdutos((lista) => lista.map((p) => (p.id === editando.id ? { ...p, ...dados } : p)));
    } else {
      const id = Math.max(0, ...produtos.map((p) => p.id)) + 1;
      setProdutos((lista) => [{ id, ...dados }, ...lista]);
    }
    setModal(null);
  };

  const excluir = (p: Produto) => {
    if (window.confirm(`Excluir "${p.nome}"? Essa ação não pode ser desfeita.`)) {
      setProdutos((lista) => lista.filter((x) => x.id !== p.id));
    }
  };

  const mudarFiltro = (v: Categoria | null) => {
    setFiltro(v);
    setPagina(1);
  };

  return (
    <main className="pagina">
      <p className="resumo">
        {produtos.length} produtos cadastrados · {baixos} com estoque baixo
      </p>

      <div className="barra-acoes">
        <label className="busca-lista">
          <Search width={16} height={16} />
          <input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar por nome ou categoria"
          />
        </label>

        {FILTROS_CATEGORIA.map((f) => (
          <button
            key={f.label}
            className={"btn btn--filtro" + (filtro === f.valor ? " ativo" : "")}
            onClick={() => mudarFiltro(f.valor)}
          >
            {f.label}
          </button>
        ))}

        <button className="btn btn--cheio" onClick={() => setModal({})}>+ Novo produto</button>
      </div>

      <div className="tabela">
        <div className="tabela__cab produtos-grade">
          <span>Produto</span><span>Categoria</span><span>Preço</span><span>Estoque</span><span>Status</span><span />
        </div>

        {visiveis.map((p) => {
          const status = statusEstoque(p.estoque);
          return (
            <div key={p.id} className="tabela__linha produtos-grade">
              <div className="produto-celula">
                <Miniatura produto={p} />
                <span>{p.nome}</span>
              </div>
              <span>{p.categoria}</span>
              <span className="preco">
                {p.precoPromo ? (
                  <>
                    {brl(p.precoPromo)}
                    <s>{brl(p.preco)}</s>
                  </>
                ) : (
                  brl(p.preco)
                )}
              </span>
              <span>{p.estoque} un.</span>
              <span><em className={CLASSE_STATUS[status]}>{status}</em></span>
              <span className="acoes">
                <button className="icon-btn icon-btn--caixa" aria-label={`Editar ${p.nome}`} onClick={() => setModal({ produto: p })}><Pencil /></button>
                <button className="icon-btn icon-btn--caixa" aria-label={`Excluir ${p.nome}`} onClick={() => excluir(p)}><Trash /></button>
              </span>
            </div>
          );
        })}

        {visiveis.length === 0 && (
          <p className="vazio vazio--tabela">
            {produtos.length === 0
              ? "Nenhum produto cadastrado. Clique em “+ Novo produto” para começar."
              : "Nenhum produto encontrado com esse filtro ou busca."}
          </p>
        )}

        <div className="tabela__rodape">
          <span>Mostrando {visiveis.length} de {filtrados.length} produtos</span>
          <div className="paginacao">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === paginaAtual ? "ativo" : ""} onClick={() => setPagina(n)}>{n}</button>
            ))}
            <button
              aria-label="Próxima página"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPagina(paginaAtual + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <Modal titulo={modal.produto ? "Editar Produto" : "Novo Produto"} onClose={() => setModal(null)}>
          <ProdutoForm inicial={modal.produto} onSalvar={salvar} />
        </Modal>
      )}
    </main>
  );
}
