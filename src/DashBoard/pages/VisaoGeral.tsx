import { brl, isoDia, somar, vendasValidas, precoFinal } from "../data";
import type { Aba, Pedido, Produto } from "../types";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface ImagemProps {
  produto?: { nome: string; imagem?: string };
  className?: string;
}

function Imagem({ produto, className = "" }: ImagemProps) {
  if (produto?.imagem) {
    return <img className={"foto " + className} src={produto.imagem} alt={produto.nome} />;
  }
  return <div className={"foto foto--vazia " + className}>{produto?.nome?.[0] ?? "?"}</div>;
}

interface GraficoProps {
  valores: number[];
  rotulos: string[];
}

                                                
function Grafico({ valores, rotulos }: GraficoProps) {
  const W = 260;
  const H = 90;
  const max = Math.max(...valores, 1);
  const pts = valores.map((v, i): [number, number] => [
    (i / (valores.length - 1)) * W,
    H - 8 - (v / max) * (H - 24),
  ]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return (
    <div className="grafico">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Vendas dos últimos 7 dias">
        <path d={d} fill="none" stroke="var(--vinho)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="grafico__rotulos">
        {rotulos.map((r, i) => <span key={i}>{r}</span>)}
      </div>
    </div>
  );
}

interface VisaoGeralProps {
  produtos: Produto[];
  pedidos: Pedido[];
  onIrPara: (aba: Aba) => void;
}

export default function VisaoGeral({ produtos, pedidos, onIrPara }: VisaoGeralProps) {
  const hoje = isoDia(0);
  const validos = vendasValidas(pedidos);

  const novosHoje = pedidos.filter((p) => p.data === hoje).length;
  const vendasHoje = somar(validos.filter((p) => p.data === hoje));

  // últimos 7 dias (do mais antigo para hoje)
  const ultimos = Array.from({ length: 7 }, (_, i) => isoDia(6 - i));
  const valores = ultimos.map((dia) => somar(validos.filter((p) => p.data === dia)));
  const rotulos = ultimos.map((dia) => DIAS[new Date(dia + "T00:00:00").getDay()]);

  // vendas por categoria (%)
  const porCategoria: Record<string, number> = {};
  validos.forEach((p) => {
    porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + p.valor;
  });
  const totalVendas = somar(validos) || 1;
  const categorias = Object.entries(porCategoria)
    .map(([nome, total]) => ({ nome, pct: (total / totalVendas) * 100 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  const destaques = produtos.slice(0, 4);
  const recentes = [...pedidos].sort((a, b) => b.numero - a.numero).slice(0, 3);

  const dataExtenso = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="pagina visao">
      <section className="visao__topo">
        <h1>Bem vinda, Kátia</h1>
        <p className="data-extenso">{dataExtenso.charAt(0).toUpperCase() + dataExtenso.slice(1)}</p>
      </section>

      <div className="visao__grade">
        <div className="visao__coluna">
          <div className="linha">
            <div className="card card--destaque">
              <span className="card__rotulo">Pedidos</span>
              <strong className="card__numero">{novosHoje}</strong>
              <span className="card__legenda">Novos Hoje</span>
            </div>

            <div className="card card--grande">
              <span className="card__rotulo">Vendas de Hoje</span>
              <div className="vendas-hoje">
                <strong className="card__valor">{brl(vendasHoje)}</strong>
                <Grafico valores={valores} rotulos={rotulos} />
              </div>
            </div>
          </div>

          <div className="linha">
            <div className="card card--grande">
              <div className="card__cabecalho">
                <span className="card__rotulo">Produtos em Destaque</span>
                <button className="link" onClick={() => onIrPara("produtos")}>Ver Catálogo</button>
              </div>
              <div className="destaques">
                {destaques.map((p) => (
                  <figure key={p.id}>
                    <Imagem produto={p} />
                    <figcaption>
                      <span>{p.categoria}</span>
                      <b>{brl(precoFinal(p))}</b>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="card card--grande">
              <span className="card__rotulo">Vendas por Categoria (%)</span>
              {categorias.length === 0 ? (
                <p className="vazio">Ainda não há vendas para mostrar.</p>
              ) : (
                <div className="barras">
                  {categorias.map((c) => (
                    <div key={c.nome} className="barra">
                      <span className="barra__pct">{Math.round(c.pct)}%</span>
                      <div className="barra__preenchimento" style={{ height: `${Math.max(c.pct, 6) * 1.2}px` }} />
                      <span className="barra__nome">{c.nome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="card recentes">
          <div className="card__cabecalho">
            <span className="card__rotulo">Pedidos Recentes</span>
            <button className="link" onClick={() => onIrPara("pedidos")}>Ver Todos</button>
          </div>
          <div className="recentes__cab">
            <span>Produtos</span><span>Categoria</span><span>Valor</span>
          </div>
          {recentes.map((p) => {
            const produto = produtos.find((x) => x.id === p.produtoId);
            return (
              <div key={p.numero} className="recentes__linha">
                <div>
                  <Imagem produto={produto ?? { nome: p.produto }} className="foto--media" />
                  <span>{p.produto}</span>
                </div>
                <span>{p.categoria}</span>
                <span>{brl(p.valor)}</span>
              </div>
            );
          })}
          {recentes.length === 0 && <p className="vazio">Nenhum pedido ainda.</p>}
        </aside>
      </div>
    </main>
  );
}
