import { ObjectId, Collection } from "mongodb";
import db from "./connection";

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

const db_coll = db.collection("items");

// should encrypt
interface ShippingInfo {
  address: string;
  receiver: string;
  phone: number;
  cost: number;
}

interface SaleReview {
  stars: number;
  body: string;
  date: Date;
}

interface WebSale {
  id: ObjectId;
  user_id: ObjectId;
  item_id: ObjectId;
  status: number;
  pay_method: number;
  installments: number;
  date: Date;
  shipment: ShippingInfo;
  cost: number;
  review?: SaleReview;
}

export async function register_sale(sale: WebSale) {
  try {
    await db_coll.insertOne(sale);
  } catch (err) {
    console.error(err);
  }
}

export async function add_review(
  coll: Collection,
  sale: WebSale,
  review: SaleReview,
) {
  try {
    await coll.updateOne(
      { id: sale.id },
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
