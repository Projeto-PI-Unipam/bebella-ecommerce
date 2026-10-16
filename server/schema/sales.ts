import { ObjectId, UUID } from "mongodb";
import { type CartProd } from "./items.ts";
import db from "../db/connection.ts";
import { type UserData } from "./users.ts";

const db_coll = db.collection("sales");
const user_coll = db.collection("users");

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
  status?: string; //SaleStatus;
  payment?: string; //PaymentMethod;
  installments?: number;
  review?: SaleReview;
  date?: Date;
  buyer_id: ObjectId;
  payment_db_id?: string;
}

export async function register_sale(sale: WebSale) {
  try {
    const buyer = (await user_coll.findOne<UserData>({ _id: sale.buyer_id }))!!;
    const phone_array = [buyer.phone.slice(1, 3), buyer.phone.split(/\s/)[1]];
    /*const prod_dimensions = sale.products.map((p) => p.item.dimensions);
    const max_len = prod_dimensions.toSorted((a, b) => a[0] - b[0]);
    const max_dep = prod_dimensions.toSorted((a, b) => a[1] - b[1]);
    const total_height = prod_dimensions.reduce(
      (acc, elem) => acc + elem[2],
      0,
    );
    const total_weight = sale.products
      .map((p) => p.item.weight)
      .reduce((acc, elem) => acc + elem, 0);
    const fmt_zip = ({ zip = sale.address.zip_code.toString() }) =>
      `${zip.slice(0, 5)}-${zip.slice(5)}`; */
    const out_res = await fetch("https://api.mercadopago.com/v1/orders", {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Idempotency-Key": new UUID().toJSON(),
        Authorization: `Bearer ${process.env.MP_ACCESS || ""}`,
      },
      method: "POST",
      body: JSON.stringify({
        type: "online",
        external_reference: new UUID().toJSON(),
        total_amount: sale.amount.toString(),
        processing_mode: "manual",
        capture_mode: "automatic_async",
        config: {
          online: {
            auto_return: "approved",
            success_url: process.env.FRONT_END + "/orders" || "",
            failure_url: process.env.FRONT_END + "/orders" || "",
            pending_url: process.env.FRONT_END + "/orders" || "",
          },
        },
        payer: {
          first_name: buyer.name.split(/\s/)[0],
          email: buyer.email,
          phone: { area_code: phone_array[0], number: phone_array[1] },
        },
        items: sale.products.map((p) => {
          return {
            title: `${p.item.brand}: ${p.item.name}`,
            quantity: p.amount,
            unit_price: p.item.price.toString(),
            category_id: p.item.category.toLowerCase().replace(/\s/g, "_"),
          };
        }),
      }),
    });
    if (out_res.ok) {
      const response = await out_res.json();
      await db_coll.insertOne({
        ...sale,
        payment_db_id: response.id,
        date: new Date(),
      });
      return response;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function fetch_sales(user_id: ObjectId) {
  try {
    //const user = await user_coll.findOne({ _id: user_id });
    const sales = await db_coll.find({ buyer_id: user_id }).toArray();
    return sales;
  } catch (err) {
    console.error(err);
    throw err;
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
