import { UUID } from "bson";
import { type Collection } from "mongodb";

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
  id: UUID;
  user_id: UUID;
  item_id: UUID;
  status: number;
  pay_method: number;
  installments: number;
  date: Date;
  shipment: ShippingInfo;
  cost: number;
  review: SaleReview | null;
}

export async function register_sale(coll: Collection, sale: WebSale) {
  try {
    await coll.insertOne(sale);
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
