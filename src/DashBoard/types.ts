import type { Dispatch, SetStateAction } from "react";

export type Categoria = "Vestido" | "Blusa" | "Conjunto" | "Calça" | "Calçado" | "Acessório";
export type Tamanho = "P" | "M" | "G";
export type StatusPedido = "Pendente" | "Pago" | "Enviado" | "Entregue" | "Cancelado";
export type FormaPagamento = "Pix" | "Cartão" | "Boleto" | "Dinheiro";
export type StatusEstoque = "Em estoque" | "Estoque baixo" | "Esgotado";
export type Aba = "visao" | "produtos" | "pedidos";

export interface Produto {
  id: number;
  nome: string;
  categoria: Categoria;
  preco: number;
  precoPromo: number | null;
  estoque: number;
  tamanhos: Tamanho[];
  imagem: string;
}

                                                               
export type DadosProduto = Omit<Produto, "id">;

export interface Pedido {
  numero: number;
  cliente: string;
  pagamento: FormaPagamento;
  produtoId: number;
  produto: string;
  categoria: Categoria;
  tamanho: Tamanho;
  quantidade: number;
  valor: number;
  data: string;                
  status: StatusPedido;
}

                                                                           
export type DadosPedido = Omit<Pedido, "numero" | "data">;

export type SetState<T> = Dispatch<SetStateAction<T>>;
