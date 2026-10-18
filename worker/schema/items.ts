import { ObjectId } from "mongodb";

export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];

export interface ClothingData {
  _id?: ObjectId;
  name: string;
  brand: string;
  category: string;
  size_data: size[];
  description?: string;
  in_stock: number;
  price: number;
  pic_url?: string[];
  dimensions: number[];
  weight: number;
}

export interface CartProd {
  _id?: ObjectId;
  item: ClothingData;
  amount: number;
  size: size;
}
