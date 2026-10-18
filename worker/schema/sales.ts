import { ObjectId } from "mongodb";
import { type CartProd } from "./items.ts";

export interface ShippingInfo {
  street: string;
  number: number;
  complement?: string;
  city: string;
  state: string;
  zip_code: number;
  receiver: string;
  phone: number;
  cost: number;
}

export interface SaleReview {
  stars: number;
  body: string;
  review_date: Date;
}

export interface WebSale {
  _id?: ObjectId;
  amount: number;
  products: CartProd[];
  address: ShippingInfo;
  status?: string; //SaleStatus;
  payment?: string; //PaymentMethod;
  installments?: number;
  review?: SaleReview;
  date?: Date;
  buyer_id: ObjectId;
  payment_db_id?: string;
  pay_state?: any;
}
