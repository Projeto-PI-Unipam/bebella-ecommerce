import type {
  Categoria,
  FormaPagamento,
  Pedido,
  Produto,
  StatusEstoque,
  StatusPedido,
  Tamanho,
} from "./types";

                                   
export const CATEGORIAS: Categoria[] = ["Vestido", "Blusa", "Conjunto", "Calça", "Calçado", "Acessório"];

export const FILTROS_CATEGORIA: { label: string; valor: Categoria | null }[] = [
  { label: "Todos", valor: null },
  { label: "Vestidos", valor: "Vestido" },
  { label: "Blusas", valor: "Blusa" },
  { label: "Calças", valor: "Calça" },
  { label: "Calçados", valor: "Calçado" },
  { label: "Acessórios", valor: "Acessório" },
];

export const TAMANHOS: Tamanho[] = ["P", "M", "G"];
export const LIMITE_ESTOQUE_BAIXO = 5;                                    
export const STATUS_PEDIDO: StatusPedido[] = ["Pendente", "Pago", "Enviado", "Entregue", "Cancelado"];
export const FORMAS_PAGAMENTO: FormaPagamento[] = ["Pix", "Cartão", "Boleto", "Dinheiro"];

                                   
export const brl = (n: number): string =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

                               
export const formatarData = (iso: string): string => iso.split("-").reverse().join("/");

                                            
export const isoDia = (diasAtras = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// ---------- Regras de negócio ----------
export const statusEstoque = (un: number): StatusEstoque => {
  if (un <= 0) return "Esgotado";
  if (un <= LIMITE_ESTOQUE_BAIXO) return "Estoque baixo";
  return "Em estoque";
};

// Preço que o cliente realmente paga (promocional, se existir)
export const precoFinal = (p: Produto): number => (p.precoPromo ? p.precoPromo : p.preco);

// Pedidos que contam como venda (cancelados ficam de fora)
export const vendasValidas = (pedidos: Pedido[]): Pedido[] =>
  pedidos.filter((p) => p.status !== "Cancelado");

export const somar = (pedidos: Pedido[]): number => pedidos.reduce((t, p) => t + p.valor, 0);

// ---------- Dados de exemplo ----------
// Troque o campo "imagem" pelo caminho da foto (ex.: "/img/blusa-rosa.jpg")
export const PRODUTOS_INICIAIS: Produto[] = [
  { id: 1, nome: "Blusa Laço Rosa", categoria: "Blusa", preco: 350.99, precoPromo: null, estoque: 18, tamanhos: ["P", "M", "G"], imagem: "" },
  { id: 2, nome: "Vestido Midi Bege", categoria: "Vestido", preco: 200, precoPromo: null, estoque: 32, tamanhos: ["P", "M", "G"], imagem: "" },
  { id: 3, nome: "Conjunto Linho", categoria: "Conjunto", preco: 260, precoPromo: 200, estoque: 4, tamanhos: ["P", "M"], imagem: "" },
  { id: 4, nome: "Colete em Crochê", categoria: "Blusa", preco: 350.99, precoPromo: null, estoque: 12, tamanhos: ["P", "M", "G"], imagem: "" },
  { id: 5, nome: "Vestido Floral", categoria: "Vestido", preco: 250.99, precoPromo: null, estoque: 9, tamanhos: ["P", "M", "G"], imagem: "" },
];

export const PEDIDOS_INICIAIS: Pedido[] = [
  { numero: 1042, cliente: "Maria", pagamento: "Pix", produtoId: 4, produto: "Colete em Crochê", categoria: "Blusa", tamanho: "M", quantidade: 1, valor: 350.99, data: isoDia(0), status: "Pendente" },
  { numero: 1041, cliente: "Julia", pagamento: "Cartão", produtoId: 5, produto: "Vestido Floral", categoria: "Vestido", tamanho: "P", quantidade: 2, valor: 250.99, data: isoDia(1), status: "Entregue" },
  { numero: 1040, cliente: "Maria", pagamento: "Pix", produtoId: 3, produto: "Conjunto Linho", categoria: "Conjunto", tamanho: "G", quantidade: 1, valor: 350.99, data: isoDia(0), status: "Pago" },
  { numero: 1039, cliente: "Maria", pagamento: "Pix", produtoId: 2, produto: "Vestido Midi Bege", categoria: "Vestido", tamanho: "P", quantidade: 1, valor: 550.99, data: isoDia(2), status: "Enviado" },
  { numero: 1037, cliente: "Juliana", pagamento: "Cartão", produtoId: 5, produto: "Vestido Floral", categoria: "Vestido", tamanho: "P", quantidade: 2, valor: 250.99, data: isoDia(3), status: "Pendente" },
];
