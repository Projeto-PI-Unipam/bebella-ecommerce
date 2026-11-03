import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Modal from "../components/Modal";
import { Pencil } from "../components/Icons";
import {
  STATUS_PEDIDO,
  FORMAS_PAGAMENTO,
  TAMANHOS,
  brl,
  formatarData,
  isoDia,
  precoFinal,
  somar,
  vendasValidas,
} from "../data";
import type {
  DadosPedido,
  FormaPagamento,
  Pedido,
  Produto,
  SetState,
  StatusPedido,
  Tamanho,
} from "../types";

const CLASSE_STATUS: Record<StatusPedido, string> = {
  Pendente: "pill pill--laranja",
  Pago: "pill pill--azul",
  Enviado: "pill pill--roxo",
  Entregue: "pill pill--verde",
  Cancelado: "pill pill--vermelho",
};

                                                                       
interface FormPedido {
  cliente: string;
  pagamento: FormaPagamento;
  produtoId: number;
  tamanho: Tamanho;
  quantidade: number | string;
  status: StatusPedido;
}

type Erros = Partial<Record<"cliente" | "produto" | "quantidade", string>>;

interface PedidoFormProps {
  inicial?: Pedido;
  produtos: Produto[];
  onSalvar: (dados: DadosPedido) => void;
}

function PedidoForm({ inicial, produtos, onSalvar }: PedidoFormProps) {
  const [f, setF] = useState<FormPedido>({
    cliente: inicial?.cliente ?? "",
    pagamento: inicial?.pagamento ?? "Pix",
    produtoId: inicial?.produtoId ?? produtos[0]?.id ?? 0,
    tamanho: inicial?.tamanho ?? "M",
    quantidade: inicial?.quantidade ?? 1,
    status: inicial?.status ?? "Pendente",
  });
  const [erros, setErros] = useState<Erros>({});

  const set = (campo: "cliente" | "quantidade") => (e: ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [campo]: e.target.value });

  const produto = produtos.find((p) => p.id === f.produtoId);
  const tamanhos: Tamanho[] = produto?.tamanhos.length ? produto.tamanhos : TAMANHOS;
  const quantidade = Number(f.quantidade);
  const total = produto ? precoFinal(produto) * (quantidade || 0) : 0;

  const salvar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const novos: Erros = {};
    if (!f.cliente.trim()) novos.cliente = "Informe o nome da cliente.";
    if (!produto && !inicial) novos.produto = "Cadastre um produto antes de criar pedidos.";
    if (!Number.isInteger(quantidade) || quantidade < 1) novos.quantidade = "A quantidade mínima é 1.";
    setErros(novos);
    if (Object.keys(novos).length) return;

                                                             
    const mudouItem = !inicial || inicial.produtoId !== f.produtoId || inicial.quantidade !== quantidade;

    onSalvar({
      cliente: f.cliente.trim(),
      pagamento: f.pagamento,
      produtoId: produto?.id ?? inicial?.produtoId ?? 0,
      produto: produto?.nome ?? inicial?.produto ?? "",
      categoria: produto?.categoria ?? inicial?.categoria ?? "Blusa",
      tamanho: tamanhos.includes(f.tamanho) ? f.tamanho : tamanhos[0],
      quantidade,
      status: f.status,
      valor: mudouItem && produto ? total : inicial?.valor ?? 0,
    });
  };

  return (
    <form className="form" onSubmit={salvar} noValidate>
      <label className="campo">
        <span>Cliente</span>
        <input value={f.cliente} onChange={set("cliente")} placeholder="Ex.: Maria" autoFocus />
        {erros.cliente && <small className="erro">{erros.cliente}</small>}
      </label>

      <label className="campo">
        <span>Produto</span>
        <select value={f.produtoId} onChange={(e) => setF({ ...f, produtoId: Number(e.target.value) })}>
          {inicial && !produto && <option value={inicial.produtoId}>{inicial.produto} (removido)</option>}
          {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} — {brl(precoFinal(p))}</option>)}
        </select>
        {erros.produto && <small className="erro">{erros.produto}</small>}
      </label>

      <div className="form__linha">
        <label className="campo">
          <span>Tamanho</span>
          <select value={f.tamanho} onChange={(e) => setF({ ...f, tamanho: e.target.value as Tamanho })}>
            {tamanhos.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="campo">
          <span>Quantidade</span>
          <input type="number" min="1" step="1" value={f.quantidade} onChange={set("quantidade")} />
          {erros.quantidade && <small className="erro">{erros.quantidade}</small>}
        </label>
      </div>

      <div className="form__linha">
        <label className="campo">
          <span>Pagamento</span>
          <select value={f.pagamento} onChange={(e) => setF({ ...f, pagamento: e.target.value as FormaPagamento })}>
            {FORMAS_PAGAMENTO.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="campo">
          <span>Status</span>
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as StatusPedido })}>
            {STATUS_PEDIDO.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div className="form__rodape">
        <small className="dica">{produto ? `Valor do pedido: ${brl(total)}` : ""}</small>
        <button type="submit" className="btn btn--cheio">Salvar</button>
      </div>
    </form>
  );
}

// ---------- Página ----------
interface PedidosProps {
  pedidos: Pedido[];
  setPedidos: SetState<Pedido[]>;
  produtos: Produto[];
  busca: string;
}

type FiltroStatus = "Todos" | StatusPedido;
const FILTROS: FiltroStatus[] = ["Todos", "Pendente", "Pago", "Enviado", "Entregue", "Cancelado"];

export default function Pedidos({ pedidos, setPedidos, produtos, busca }: PedidosProps) {
  const [filtro, setFiltro] = useState<FiltroStatus>("Todos");
  const [modal, setModal] = useState<{ pedido?: Pedido } | null>(null);

  const hoje = isoDia(0);
  const novosHoje = pedidos.filter((p) => p.data === hoje).length;
  const paraEnviar = pedidos.filter((p) => p.status === "Pendente" || p.status === "Pago").length;
  const vendas = somar(vendasValidas(pedidos));

  const termo = busca.toLowerCase();
  const lista = [...pedidos]
    .sort((a, b) => b.numero - a.numero)
    .filter(
      (p) =>
        (filtro === "Todos" || p.status === filtro) &&
        `${p.numero} ${p.cliente} ${p.produto}`.toLowerCase().includes(termo)
    );

  const salvar = (dados: DadosPedido) => {
    if (!modal) return;
    const editando = modal.pedido;
    if (editando) {
      setPedidos((l) => l.map((p) => (p.numero === editando.numero ? { ...p, ...dados } : p)));
    } else {
      const numero = Math.max(1000, ...pedidos.map((p) => p.numero)) + 1;
      setPedidos((l) => [{ numero, data: isoDia(0), ...dados }, ...l]);
    }
    setModal(null);
  };

  return (
    <main className="pagina">
      <h1>Pedidos</h1>

      <div className="stats">
        <div className="card card--destaque"><span className="card__rotulo">Novos Hoje</span><strong className="card__numero">{novosHoje}</strong></div>
        <div className="card card--destaque"><span className="card__rotulo">Para Enviar</span><strong className="card__numero">{paraEnviar}</strong></div>
        <div className="card card--destaque card--larga"><span className="card__rotulo">Vendas (sem cancelados)</span><strong className="card__numero">{brl(vendas)}</strong></div>
      </div>

      <div className="barra-acoes">
        {FILTROS.map((s) => (
          <button
            key={s}
            className={"btn btn--filtro" + (filtro === s ? " ativo" : "")}
            onClick={() => setFiltro(s)}
          >
            {s}
          </button>
        ))}
        <button className="btn btn--cheio" onClick={() => setModal({})}>+ Novo pedido</button>
      </div>

      <div className="tabela">
        <div className="tabela__cab pedidos-grade">
          <span>Pedidos</span><span>Cliente</span><span>Produto</span><span>Data</span><span>Valor</span><span>Status</span><span />
        </div>

        {lista.map((p) => (
          <div key={p.numero} className="tabela__linha pedidos-grade">
            <span>#{p.numero}</span>
            <span>{p.cliente}<small>{p.pagamento}</small></span>
            <span>{p.produto}<small>Tam. {p.tamanho} · {p.quantidade} Unid.</small></span>
            <span>{formatarData(p.data)}</span>
            <span>{brl(p.valor)}</span>
            <span><em className={CLASSE_STATUS[p.status]}>{p.status}</em></span>
            <span className="acoes">
              <button className="icon-btn" aria-label={`Editar pedido ${p.numero}`} onClick={() => setModal({ pedido: p })}><Pencil /></button>
            </span>
          </div>
        ))}

        {lista.length === 0 && (
          <p className="vazio vazio--tabela">
            {pedidos.length === 0
              ? "Nenhum pedido ainda. Clique em “+ Novo pedido” para registrar o primeiro."
              : "Nenhum pedido encontrado com esse status ou busca."}
          </p>
        )}
      </div>

      {modal && (
        <Modal titulo={modal.pedido ? `Editar Pedido #${modal.pedido.numero}` : "Novo Pedido"} onClose={() => setModal(null)}>
          <PedidoForm inicial={modal.pedido} produtos={produtos} onSalvar={salvar} />
        </Modal>
      )}
    </main>
  );
}
