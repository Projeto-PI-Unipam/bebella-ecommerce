import { ObjectId } from "bson";

export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];

export interface ClothesModel {
  id: ObjectId;
  db_id: string;
  name: string;
  brand: string;
  category: string;
  size_data: size[];
  description?: string;
  in_stock: number;
  pic_url?: string[];
  price: number;
}

export interface CartItem {
  id: ObjectId;
  amount: number;
  size: size;
}
