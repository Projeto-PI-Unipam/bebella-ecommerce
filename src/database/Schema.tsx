import { ObjectId } from "bson";

export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];

export interface ClothesModel {
  _id?: ObjectId;
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
  _id?: ObjectId;
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
  _id?: ObjectId;
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
