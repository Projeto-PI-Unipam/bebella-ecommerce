import type { ObjectId } from "bson";

export const bucket = "https://cdn.bebellaboutique.com";

export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];
export const def_discount = 0.28;
export function fmt_discount(discount: number): string {
  return `-${(discount * 100).toFixed(0)}%`;
}
export function before_discount(price: number, discount: number): number {
  return price / (1 - discount);
}
export function apply_discount(price: number, discount: number): number {
  return price - price * discount;
}
export const upfront_discount = 0.12;
export function to_currency(amount: number): string {
  return `R$ ${amount.toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

export interface ClothesModel {
  _id: ObjectId;
  db_id: string;
  name: string;
  brand: string;
  category: string;
  size_data: size[];
  description?: string;
  in_stock: number;
  pic_url?: string[];
  price: number;
  dimensions: number[];
  weight: number;
}

export interface CartItem {
  _id: ObjectId;
  amount: number;
  item: ClothesModel;
  size: size;
}

export interface ShippingAddress {
  street?: string;
  number?: number;
  complement?: string;
  city?: string;
  state?: string;
  zip_code?: number;
  receiver?: string;
  phone?: number;
  cost?: number;
}

export interface SaleReview {
  stars: number;
  body: string;
  review_date: Date;
}

export interface WebSale {
  _id: ObjectId;
  amount: number;
  products: CartItem[];
  address: ShippingAddress;
  status?: string;
  payment?: string;
  installments?: number;
  review?: SaleReview;
  date?: Date;
  buyer_id: ObjectId;
  payment_db_id?: string;
}
