import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import { type ShippingInfo, type WebSale } from "./sales.ts";
import { type CartProd } from "./items.ts";

dotenv.config();

export interface UserData {
  _id?: ObjectId;
  func_id?: number;
  name: string;
  email: string;
  phone: string;
  hash: string;
  salt: string;
  birth_date: Date;
  picture_url?: string;
  wishlist_ids?: string[];
  cart_products?: CartProd[];
  order_addresses?: ShippingInfo[];
  past_orders?: WebSale[];
}

export interface TokenResponse {
  id: ObjectId;
  email: string;
  name: string;
  func: number;
  exp: number;
  iat: number;
}

export interface SessionData {
  _id: ObjectId;
  user_email: string;
  type: string;
  code_salt: string;
  code_hash: string;
  date: Date;
}
