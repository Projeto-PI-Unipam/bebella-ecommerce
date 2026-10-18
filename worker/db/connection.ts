import { DurableObject } from "cloudflare:workers";
import { Db, MongoClient, UUID, ObjectId } from "mongodb";
import type { ClothingData } from "../schema/items.ts";
import type { WebSale, SaleReview } from "../schema/sales.ts";
import { type TokenResponse, type UserData } from "../schema/users.ts";
import jwt from "jsonwebtoken";
import { genSaltSync, hashSync } from "bcryptjs";

export class MongoDBConnection extends DurableObject<Env> {
  private client!: MongoClient;
  private db!: Db;
  private MP_ACCESS!: string;
  private JWT_SEC!: string;
  //private ADMIN_FID!: string;
  private FRONT_END!: string;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.client = new MongoClient(await env.DBPROD_URL.get());
      this.db = this.client.db("bebella_store");
      this.MP_ACCESS = await env.MP_ACCESS.get();
      this.JWT_SEC = await env.JWT_SEC.get();
      //this.ADMIN_FID = await env.ADMIN_FID.get();
      this.FRONT_END = "http://localhost:5173";
    });
    Object.setPrototypeOf(this, MongoDBConnection.prototype);
  }

  async get_all_items() {
    await this.client.connect();
    const results = await this.db
      .collection("items")
      .find<ClothingData>({})
      .toArray();
    const count = await this.db.collection("items").estimatedDocumentCount();
    return JSON.stringify([results, count]);
  }

  async search_items(searchTerm: string) {
    await this.client.connect();
    const search_reg = new RegExp(`.*${searchTerm}.*`, "gi");
    const query = { $or: [{ name: search_reg }, { brand: search_reg }] };
    const results = await this.db
      .collection("items")
      .find<ClothingData>(query)
      .toArray();
    const count = await this.db.collection("items").countDocuments(query);
    return JSON.stringify([results, count]);
  }

  async search_categories(categoryTerm: string) {
    await this.client.connect();
    const search_reg = new RegExp(`.*${categoryTerm}.*`, "gi");
    const query = { category: search_reg };
    const results = await this.db
      .collection("items")
      .find<ClothingData>(query)
      .toArray();
    const count = await this.db.collection("items").countDocuments(query);
    return JSON.stringify([results, count]);
  }

  async fetch_item(prod_id: string) {
    await this.client.connect();
    const query = await this.db.collection("items").findOne<ClothingData>({
      _id: { $eq: new ObjectId(prod_id) },
    });
    return JSON.stringify(query);
  }

  async add_item(new_item: ClothingData): Promise<void> {
    await this.client.connect();
    await this.db.collection("items").insertOne(new_item);
    return;
  }

  async change_item(update: ClothingData) {
    await this.db.collection("items").updateOne(
      { _id: { $eq: update._id } },
      {
        $set: update,
      },
    );
  }

  async register_sale(jsale: string) {
    const sale = JSON.parse(jsale) as WebSale;
    console.log(sale);
    const buyer = (await this.db
      .collection("users")
      .findOne<UserData>({ _id: new ObjectId(sale.buyer_id) }))!!;
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
        Authorization: `Bearer ${this.MP_ACCESS || ""}`,
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
            success_url: this.FRONT_END + "/orders" || "",
            failure_url: this.FRONT_END + "/orders" || "",
            pending_url: this.FRONT_END + "/orders" || "",
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
    console.log(out_res);
    if (out_res.ok) {
      const response: any = await out_res.json();
      console.log(response);
      await this.db.collection("sales").insertOne({
        ...sale,
        payment_db_id: response.id,
        date: new Date(),
      });
      return JSON.stringify(response);
    } else {
      console.error(out_res);
    }
  }

  async fetch_sales(user_sid: string) {
    //const user = await this.db.collection("users").findOne({ _id: user_id });
    const sales = (
      await this.db
        .collection("sales")
        .find<WebSale>({ buyer_id: new ObjectId(user_sid) })
        .toArray()
    ).filter((r: WebSale) => typeof r.payment_db_id === "string");
    let sales_detailed: Array<WebSale> = [];
    let iter = 0;
    let timeout = 200;
    while (iter < sales.length) {
      const sale = sales[iter];
      await new Promise((r) => setTimeout(r, timeout));
      const sale_detes = await fetch(
        `https://api.mercadopago.com/v1/orders/${sale.payment_db_id!!}`,
        {
          headers: {
            Authorization: `Bearer ${this.MP_ACCESS}`,
          },
          method: "GET",
        },
      );
      if (sale_detes.ok) {
        const fmt_detes = await sale_detes.json();
        const new_sale = { ...sale, pay_state: fmt_detes };
        sales_detailed.push(new_sale);
        iter += 1;
      } else {
        if (sale_detes.status === 429) {
          timeout *= 2;
        }
      }
    }
    return JSON.stringify(sales_detailed);
  }

  async add_review(sale: WebSale, review: SaleReview) {
    await this.db.collection("sales").updateOne(
      { id: sale._id },
      {
        $set: {
          review: review,
        },
      },
    );
    return;
  }

  async fetch_user(user_sid: string) {
    const user_db = await this.db.collection("users").findOne({
      _id: new ObjectId(user_sid),
    });
    return JSON.stringify(user_db);
  }

  async user_exists(user_email: string, returning: boolean) {
    const user = await this.db.collection("users").findOne<UserData>({
      email: { $eq: user_email },
    });
    if (user === null) {
      return JSON.stringify(false);
    } else {
      if (returning) {
        return JSON.stringify(user);
      } else {
        return JSON.stringify(true);
      }
    }
  }

  async hash_password(password: string) {
    const new_salt = genSaltSync(16);
    const new_hash = hashSync(password, new_salt);
    return JSON.stringify([new_salt, new_hash]);
  }

  /* async function checkPassword(user_email: string, password: string) {
  try {
    const obj = await this.db.collection("users").findOne<UserData>({ email: { $eq: user_email } });
    // const hash_try = compareSync(password, obj!.hash);
    //return hash_try;
  } catch (err) {
    console.error(err);
    throw err;
  }
} */

  gen_token(user_data: UserData) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    const token = jwt.sign(
      {
        id: user_data._id,
        email: user_data.email,
        name: user_data.name,
        func: user_data.func_id || 165,
        exp: Math.round(expiry.getTime() / 1000),
      },
      this.JWT_SEC!,
    );
    return token;
  }

  async add_user(
    name: string,
    user_email: string,
    password: string,
    birth: Date,
    user_phone: string,
  ) {
    const test_exist = await this.db
      .collection("users")
      .find({ email: { $eq: user_email } })
      .toArray();
    if (test_exist && test_exist.length === 0) {
      const new_salt = genSaltSync(16);
      const new_hashpass = hashSync(password, new_salt);
      const new_user: UserData = {
        _id: new ObjectId(),
        func_id: 165,
        name: name,
        email: user_email,
        phone: user_phone,
        birth_date: birth,
        hash: new_hashpass,
        salt: new_salt,
      };
      await this.db.collection("users").insertOne(new_user);
      const res = this.gen_token(new_user);
      return res;
    }
  }

  auth_user(user_token: string) {
    if (user_token && user_token.length > 1) {
      const res: TokenResponse | undefined = jwt.verify(
        user_token,
        this.JWT_SEC!,
      ) as TokenResponse;
      return JSON.stringify(res);
    }
  }

  async login_user(user_email: string, password: string) {
    if (user_email.length >= 1 && password.length >= 1) {
      const result = await this.db.collection("users").findOne<UserData>({
        email: { $eq: user_email },
      });
      if (result?.email) {
        if (password === result!.hash) {
          return JSON.stringify(result);
        } else {
          return "Senha incorreta";
        }
      } else {
        return "Não foi encontrado usuário com essas informações";
      }
    }
  }
}
