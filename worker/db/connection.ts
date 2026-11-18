import { DurableObject } from "cloudflare:workers";
import { genSaltSync, hashSync } from "bcryptjs";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import {
  type Db,
  MongoClient,
  ObjectId,
  UUID,
  type PullOperator,
  type Document,
} from "mongodb";
import type { CartProd, ClothingData } from "../schema/items.ts";
import type { SaleReview, WebSale } from "../schema/sales.ts";
import type { SessionData, TokenResponse, UserData } from "../schema/users.ts";

export class MongoDBConnection extends DurableObject<Env> {
  private client!: MongoClient;
  private db!: Db;
  private MP_ACCESS!: string;
  private JWT_SEC!: string;
  // @ts-ignore
  private ADMIN_FID!: string;
  private FRONT_END!: string;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      if (import.meta.env.MODE === "production" || env.CF_ENV == "production") {
        // @ts-ignore
        this.client = new MongoClient(await env.DBPROD_URL.get());
        // @ts-ignore
        this.db = this.client.db("bebella_store");
        // @ts-ignore
        this.MP_ACCESS = await env.MP_ACCESS.get();
        // @ts-ignore
        this.JWT_SEC = await env.JWT_SEC.get();
        // @ts-ignore
        this.ADMIN_FID = await env.ADMIN_FID.get();
      } else {
        // @ts-ignore
        this.client = new MongoClient(env.DBPROD_URL);
        // @ts-ignore
        this.db = this.client.db("bebella_store");
        // @ts-ignore
        this.MP_ACCESS = env.MP_ACCESS;
        // @ts-ignore
        this.JWT_SEC = env.JWT_SEC;
        // @ts-ignore
        this.ADMIN_FID = env.ADMIN_FID;
      }
      this.FRONT_END = "https://bebellaboutique.com";
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

  async get_items_lim(limit: number, iter: number, mod?: string, cat?: string) {
    const in_limit = Math.min(limit, 50);
    const cat_exp = (categ?: string) => {
      if (!categ) {
        return {};
      }
      const search_reg = new RegExp(`.*${categ}.*`, "gi");
      const query = { category: search_reg };
      return query;
    };
    await this.client.connect();
    const results = await this.db
      .collection("items")
      .find<ClothingData>(cat_exp(cat), {
        sort: mod === "latest" ? { date: -1 } : {},
        limit: in_limit,
        batchSize: in_limit,
        singleBatch: true,
        skip: in_limit * (iter - 1),
      })
      .toArray();
    return JSON.stringify(results);
  }

  async get_count(precise?: boolean) {
    await this.client.connect();
    const coll = this.db.collection("items");
    const count =
      precise && precise === true
        ? await coll.countDocuments()
        : await coll.estimatedDocumentCount();
    return JSON.stringify(count);
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
      .findOne<UserData>({ _id: new ObjectId(sale.buyer_id) }))!;
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
    const sales_detailed: Array<WebSale> = [];
    let iter = 0;
    let timeout = 200;
    while (iter < sales.length) {
      const sale = sales[iter];
      await new Promise((r) => setTimeout(r, timeout));
      const sale_detes = await fetch(
        `https://api.mercadopago.com/v1/orders/${sale.payment_db_id!}`,
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

  async user_exists(user_email: string, returning: string) {
    const ret = JSON.parse(returning);
    const user = await this.db.collection("users").findOne({
      email: user_email,
    });
    if (user === null) {
      return JSON.stringify(false);
    } else {
      if (ret) {
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
    birth: string,
    user_phone: string,
  ) {
    const test_exist = await this.db
      .collection("users")
      .find({ email: user_email })
      .toArray();
    console.log(test_exist);
    if (test_exist && test_exist.length === 0) {
      const new_salt = genSaltSync(16);
      const new_hashpass = hashSync(password, new_salt);
      const new_user: UserData = {
        _id: new ObjectId(),
        func_id: 165,
        name: name,
        email: user_email,
        phone: user_phone,
        birth_date: new Date(birth),
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

  async put_cart(user_sid: string, item: string) {
    const item_struct = JSON.parse(item);
    await this.db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(user_sid) },
        { $push: { cart_products: item_struct } },
      );
  }

  async rm_cart(user_sid: string, item_sid: string) {
    const item_struct = await this.db
      .collection("items")
      .findOne<ClothingData>({ _id: new ObjectId(item_sid) });
    if (!item_struct) {
      return;
    }
    await this.db
      .collection("users")
      .updateOne({ _id: new ObjectId(user_sid) }, {
        $pull: { cart_products: item_struct },
      } as unknown as PullOperator<Document>);
  }

  async ch_cart(user_sid: string, new_cart: string) {
    const cart: CartProd[] = JSON.parse(new_cart);
    const state = await this.db
      .collection("users")
      .findOne<UserData>({ _id: new ObjectId(user_sid) });
    if (!state || !state.cart_products) {
      return;
    }
    const new_user = { ...state, cart_products: cart };
    await this.db
      .collection("users")
      .findOneAndReplace({ _id: new ObjectId(user_sid) }, new_user);
  }

  async send_mail(
    prefix: string,
    dest_enc: string,
    subject: string,
    html_enc: string,
    text: string,
  ) {
    const res = await this.env.EMAIL!.send({
      to: decodeURI(dest_enc),
      from: `${prefix}@mail.bebellaboutique.com`,
      subject: subject,
      html: decodeURI(html_enc),
      text: text,
    });
    return res;
  }

  async put_session(type: string, mail_enc: string) {
    await this.client.connect();
    const mail_dec = decodeURI(mail_enc);
    /* const exist_prom = this.db
      .collection("sessions")
      .find({ user_email: mail_dec })
      .toArray(); */
    const salt = genSaltSync(12);
    const code = randomBytes(8).toString("hex").toUpperCase().slice(0, 8);
    const hash = pbkdf2Sync(code, salt, 30000, 64, "sha512").toString("hex");
    console.log(hash);
    const session: SessionData = {
      _id: new ObjectId(),
      type: type,
      user_email: mail_dec,
      code_salt: salt,
      code_hash: hash,
      date: new Date(),
    };
    const prefix =
      type === "new"
        ? "welcome"
        : type === "recover"
          ? "recovery"
          : type === "2fa"
            ? "authentication"
            : "account";
    const subject =
      type === "new"
        ? "Código para criação de conta na Bebella Boutique"
        : type === "recover"
          ? "Código para recuperação de senha na Bebella Boutique"
          : type === "2fa"
            ? "Código para confirmação de acesso na Bebella Boutique"
            : "Código de confirmação Bebella Boutique";
    const text =
      type === "new"
        ? `Bem vindo à Bebella Boutique! Use o código a seguir para poder completar a criação da sua conta: ${code}`
        : type === "recover"
          ? `Esqueceu sua senha? Use o código a seguir para recuperar seu acesso à Bebella Boutique: ${code}`
          : type === "2fa"
            ? `Para fazer login na Bebella Boutique, confirme seu acesso utilizando o código a seguir: ${code}`
            : `Confirme seu acesso à Bebella Boutique com o código a seguir: ${code}`;
    const html =
      type === "new"
        ? `<h1>Bem vindo à Bebella Boutique!</h1> <p>Use o código a seguir para poder completar a criação da sua conta:</p> <br><strong>${code}</strong>`
        : type === "recover"
          ? `<h1>Esqueceu sua senha?</h1> <p>Use o código a seguir para recuperar seu acesso à Bebella Boutique:</p> <br><strong>${code}</strong>`
          : type === "2fa"
            ? `<h1>Confirme seu acesso</h1> <p>Para fazer login na Bebella Boutique, confirme seu acesso utilizando o código a seguir:</p> <br><strong>${code}</strong>`
            : `<h1>Confirme seu acesso à Bebella Boutique</h1> <p>Verifique seu login com o código a seguir:</p> <strong>${code}</strong>`;
    // @ts-ignore
    const _mail_res = await this.send_mail(
      prefix,
      mail_enc,
      subject,
      encodeURI(html),
      text,
    );
    /* const existing = await exist_prom;
    if (existing && existing.length >= 1) {
      for (const session of existing) {
        await this.db
          .collection("sessions")
          .findOneAndDelete({ _id: session._id });
        console.log("del", session);
      }
    } */
    console.log(session);
    await this.db.collection("sessions").insertOne(session);
  }

  async check_session(mail_enc: string, input_code: string) {
    const mail_dec = decodeURI(mail_enc);
    const session = await this.db
      .collection("sessions")
      .find<SessionData>(
        { user_email: mail_dec },
        { sort: { date: -1 }, limit: 1 },
      )
      .toArray();
    if (!session || session.length === 0) {
      return false;
    }
    const inp_hash = pbkdf2Sync(
      input_code.trim().toUpperCase(),
      session[0].code_salt,
      30000,
      64,
      "sha512",
    ).toString("hex");
    const encoder = new TextEncoder();
    const check = timingSafeEqual(
      encoder.encode(session[0].code_hash),
      encoder.encode(inp_hash),
    );
    console.log(check);
    return check;
  }
}
