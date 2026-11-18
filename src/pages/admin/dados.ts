import { ObjectId } from "bson";
import {
  bucket,
  type ClothesModel,
  type size,
} from "../../database/Schema.tsx";

// Tipos, conversão dos dados do servidor e chamadas às rotas /admin.

export type StatusProduto = "Ativo" | "Rascunho" | "Arquivado";

export type StatusPedido =
  | "Aguardando pagamento"
  | "Pago"
  | "Separando"
  | "Enviado"
  | "Entregue"
  | "Cancelado";

export interface ProdutoAdmin extends ClothesModel {
  status: StatusProduto;
}

export interface ItemPedido {
  nome: string;
  tamanho: string;
  quantidade: number;
  preco: number;
  foto?: string;
}

export interface PedidoAdmin {
  id: string;
  numero: string;
  cliente: { nome: string; email: string; telefone: string };
  endereco: { rua: string; complemento: string; cidade: string; cep: string };
  data: Date | null;
  itens: ItemPedido[];
  frete: number;
  pagamento: string;
  parcelas: number;
  status: StatusPedido;
  rastreio: string;
}

export const etapasPedido: StatusPedido[] = [
  "Aguardando pagamento",
  "Pago",
  "Separando",
  "Enviado",
  "Entregue",
];

// Cor do ponto ao lado do status: amarelo no que falta enviar, azul em
// trânsito, verde no que deu certo e cinza no resto.
export const corStatus: Record<StatusProduto | StatusPedido, string> = {
  Ativo: "#2f8a52",
  Rascunho: "#a8a29e",
  Arquivado: "#d4d0cd",
  "Aguardando pagamento": "#a8a29e",
  Pago: "#d99a00",
  Separando: "#d99a00",
  Enviado: "#3b82c4",
  Entregue: "#2f8a52",
  Cancelado: "#d4d0cd",
};

export const categorias = [
  "Vestidos",
  "Conjuntos",
  "Blazer",
  "Blusas",
  "Camisas",
  "Calças",
  "Bolsas",
];

export interface ItemApi extends Omit<ClothesModel, "_id" | "db_id"> {
  _id: string;
  status?: StatusProduto;
}

export interface VendaApi {
  _id: string;
  amount: number;
  products: { amount: number; size: size; item: ItemApi }[];
  address?: {
    street?: string;
    number?: number;
    complement?: string;
    city?: string;
    state?: string;
    zip_code?: number | string;
    receiver?: string;
    cost?: number;
  };
  status?: string;
  payment?: string;
  installments?: number;
  date?: string;
  tracking_code?: string;
  buyer: { name: string; email: string; phone: string } | null;
}

export function paraProduto(i: ItemApi): ProdutoAdmin {
  return {
    ...i,
    _id: new ObjectId(i._id),
    db_id: i._id,
    size_data: i.size_data ?? [],
    pic_url: i.pic_url ?? [],
    dimensions: i.dimensions ?? [0, 0, 0],
    weight: i.weight ?? 0,
    in_stock: i.in_stock ?? 0,
    status: i.status ?? "Ativo",
  };
}

export function paraPedido(v: VendaApi): PedidoAdmin {
  const end = v.address ?? {};
  const status = (etapasPedido as string[])
    .concat("Cancelado")
    .includes(v.status ?? "")
    ? (v.status as StatusPedido)
    : "Aguardando pagamento";
  return {
    id: v._id,
    numero: v._id.slice(-6).toUpperCase(),
    cliente: {
      nome: v.buyer?.name ?? end.receiver ?? "",
      email: v.buyer?.email ?? "",
      telefone: v.buyer?.phone ?? "",
    },
    endereco: {
      rua: [end.street, end.number].filter(Boolean).join(", "),
      complemento: end.complement ?? "",
      cidade: [end.city, end.state].filter(Boolean).join(", "),
      cep: end.zip_code
        ? String(end.zip_code)
            .padStart(8, "0")
            .replace(/^(\d{5})(\d{3})$/, "$1-$2")
        : "",
    },
    data: v.date ? new Date(v.date) : null,
    itens: v.products.map((p) => ({
      nome: p.item.name,
      tamanho: String(p.size),
      quantidade: p.amount,
      preco: p.item.price,
      foto: p.item.pic_url?.[0],
    })),
    frete: end.cost ?? 0,
    pagamento: v.payment ?? "",
    parcelas: v.installments ?? 0,
    status: status,
    rastreio: v.tracking_code ?? "",
  };
}

export function urlFoto(nome?: string) {
  if (!nome) return undefined;
  if (/^(https?:|blob:|data:|\/)/.test(nome)) return nome;
  return `${bucket}/${nome}`;
}

// Converte a resposta do servidor em dados ou em um erro com mensagem pra
// mostrar na tela. Em 400 o servidor manda o motivo em texto.
async function lerResposta(res: Response) {
  if (res.status === 401)
    throw new Error("Sua conta não tem acesso ao painel.");
  if (res.status === 400) {
    const motivo = await res.json().catch(() => null);
    throw new Error(
      typeof motivo === "string" ? motivo : "Confira os dados e tente de novo.",
    );
  }
  if (!res.ok)
    throw new Error("Não foi possível falar com o servidor. Tente de novo.");
  return res.status === 204 ? null : res.json();
}

export async function chamarApi(
  caminho: string,
  metodo: "GET" | "POST" | "PATCH",
  corpo?: object,
) {
  const res = await fetch(caminho, {
    method: metodo,
    headers: corpo ? { "Content-Type": "application/json" } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  return lerResposta(res);
}

export async function enviarArquivo(
  caminho: string,
  token: string | null,
  arquivo: File,
) {
  const corpo = new FormData();
  corpo.append("auth_token", token ?? "");
  corpo.append("file", arquivo);
  const res = await fetch(caminho, { method: "POST", body: corpo });
  return lerResposta(res);
}

export function totalPedido(p: PedidoAdmin) {
  return (
    p.itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0) + p.frete
  );
}

export function dataCurta(d: Date | null) {
  if (!d) return "—";
  return (
    d.toLocaleDateString("pt-BR") +
    ", " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}
