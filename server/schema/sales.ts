import { ObjectId, Timestamp } from "mongodb";
import { type CartProd } from "./items.ts";
import db from "../db/connection.ts";

const db_coll = db.collection("sales");

/* enum SaleStatus {
  PaymentPending,
  ShipmentPending,
  Shipped,
  Completed,
  Disputing,
  Reviewed,
  RefundPending,
  Refunded,
  BackShipPending,
  BackShipped,
  Cancelled,
}

enum PaymentMethod {
  Pix,
  CreditCard,
  DebitCard,
  Billet,
} */

interface ShippingInfo {
  address: string;
  receiver: string;
  phone: number;
  cost: number;
}

interface SaleReview {
  stars: number;
  body: string;
  review_date: Date;
}

export interface WebSale {
  _id?: ObjectId;
  amount: number;
  products: CartProd[];
  address: ShippingInfo;
  status: string; //SaleStatus;
  payment: string; //PaymentMethod;
  installments: number;
  review?: SaleReview;
  date?: Timestamp;
}

export async function register_sale(sale: WebSale) {
  try {
    await db_coll.insertOne(sale);
  } catch (err) {
    console.error(err);
  }
}

export async function add_review(sale: WebSale, review: SaleReview) {
  try {
    await db_coll.updateOne(
      { id: sale._id },
      {
        $set: {
          review: review,
        },
      },
    );
  } catch (err) {
    console.error(err);
  }
}

/*
 const sale_status = [
  "Pagamento Pendente",
  "Em Separação",
  "Enviado",
  "Completo",
  "Em Disputa",
  "Processo de Reembolso",
  "Reembolsado",
  "Cancelado",
];

const pay_methods = ["Pix", "Cartão de Débito", "Cartão de Crédito", "Boleto"];
*/
