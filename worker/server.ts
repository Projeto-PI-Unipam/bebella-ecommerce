import { ObjectId } from "mongodb";
import {
  loginUser,
  genToken,
  userExists,
  addUser,
  type TokenResponse,
  authUser,
} from "./schema/users.ts";

import { type UserData } from "./schema/users.ts";
import {
  type ClothingData,
  type size,
  addItem,
  changeItem,
} from "./schema/items.ts";
import db from "./db/connection.ts";
import {
  fetch_sales,
  register_sale,
  type ShippingInfo,
} from "./schema/sales.ts";

const items_db = db.collection("items");
const users_db = db.collection("users");

export default {
  async fetch(req: Request, env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" && req.method === "GET") {
      return new Response(JSON.stringify("ok!"));
    }

    if (path === "/browse" && req.method === "GET") {
      try {
        let results = await items_db.find({}).toArray();
        let count = await items_db.estimatedDocumentCount();
        return new Response(JSON.stringify([results, count]), { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify("Erro ao buscar itens"), {
          status: 503,
        });
      }
    }

    if (path === "/items/all" && req.method === "GET") {
      try {
        let results = await items_db.find({}).toArray();
        let count = await items_db.estimatedDocumentCount();
        return new Response(JSON.stringify([results, count]), { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify("Erro ao buscar itens"), {
          status: 503,
        });
      }
    }

    if (path.startsWith("/items/category/") && req.method === "GET") {
      try {
        const search = path.replace("/items/category/", "");
        const search_reg = new RegExp(`.*${search}.*`, `gi`);
        const query = { category: search_reg };
        const results = await items_db.find(query).toArray();
        const count = await items_db.countDocuments(query);
        return new Response(JSON.stringify([results, count]), { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify("Erro ao buscar itens"), {
          status: 503,
        });
      }
    }

    if (path.startsWith("/items/search/") && req.method === "GET") {
      try {
        const search = path.replace("/items/search/", "");
        const search_reg = new RegExp(`.*${search}.*`, "gi");
        const query = { $or: [{ name: search_reg }, { brand: search_reg }] };
        const results = await items_db.find(query).toArray();
        const count = await items_db.countDocuments(query);
        return new Response(JSON.stringify([results, count]), { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify("Erro ao buscar itens"), {
          status: 503,
        });
      }
    }

    if (path.startsWith("/view/product/") && req.method === "GET") {
      try {
        const collection = db.collection("items");
        const prod_id = path.replace("/view/product/", "");
        const query = await collection.findOne({
          _id: { $eq: new ObjectId(prod_id) },
        });
        if (!query) {
          return new Response(JSON.stringify("Produto não encontrado"), {
            status: 404,
          });
        } else {
          return new Response(JSON.stringify(query), { status: 200 });
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (path === "/admin/getproducts" && req.method === "POST") {
      try {
        const body = await req.json<any>();
        const user_fid: TokenResponse | undefined = authUser(body.auth_token);
        if (user_fid && user_fid.func === parseInt(await env.ADMIN_FID.get())) {
          if (path === body.category && body.category.length >= 1) {
          } else {
            const full_data = await items_db.find<ClothingData>({}).toArray();
            const datapoints = {
              //totalSold: //todo: this must look in the sales database
              // totalOutValue: //todo: see whether it's necessary to add buy_price parameter to clothes
              /*totalInValue: full_data
              .map((d) => d.price)
              .reduce((acc, n) => acc + n) * //todo: sales_db,*/
              //mostSold: //todo: sales_db
              //mostSoldInCat:
              //mostProfitable:
              lowStockProducts: full_data.filter(
                (d) => d.in_stock <= 10, //req.body.stockWarn,
              ),
              total: full_data, //todo: remove this
              //monthlySoldPoints:
              //monthlyOutPoints:
              //monthlyInPoints:
              productsCount: await items_db.estimatedDocumentCount(),
            };
            return new Response(JSON.stringify(datapoints), { status: 200 });
          }
        } else {
          return new Response(JSON.stringify("Usuário não autorizado"), {
            status: 401,
          });
        }
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), { status: 503 });
      }
    }

    if (path === "/userapi/check" && req.method === "POST") {
      const user_email = (await req.formData()).values().next().value;
      if (!user_email) return new Response(null);
      const user_res = await userExists(user_email, true);
      if (user_res === false) {
        return new Response(JSON.stringify(false), { status: 206 });
      } else {
        return new Response(JSON.stringify((user_res as UserData).salt), {
          status: 200,
        });
      }
    }

    if (path === "/userapi/parsetoken" && req.method === "POST") {
      try {
        const token = (await req.formData()).values().next().value;
        const user_fid: TokenResponse | undefined = authUser(
          token.replaceAll(/['"]/g, ""),
        );
        if (user_fid) {
          return new Response(null, { status: 204 });
        } else {
          return new Response(null, { status: 406 });
        }
      } catch (err) {
        return new Response(null, { status: 406 });
      }
    }

    if (path === "/userapi/login" && req.method === "POST") {
      try {
        const data = (await req.formData()).values();
        const body = {
          email: data.next().value,
          password: data.next().value,
        };
        if (body.email && body.password) {
          const result = await loginUser(body.email, body.password);
          if (!result || !result._id) {
            return new Response(null, { status: 406 });
          } else {
            const new_token = genToken(result);
            return new Response(JSON.stringify(new_token), { status: 200 });
          }
        } else {
          return new Response(null, { status: 406 });
        }
      } catch (err: any) {
        if (
          path === err.message.includes("Senha") ||
          err.message.includes("encontrado")
        ) {
          return new Response(JSON.stringify(err), { status: 406 });
        } else {
          console.error(err);
          return new Response(JSON.stringify(err), { status: 406 });
        }
      }
    }

    if (path === "/userapi/register" && req.method === "POST") {
      const data = (await req.formData()).values();
      const body = {
        name: data.next().value,
        email: data.next().value,
        password: data.next().value,
        birth_date: data.next().value,
        phone: data.next().value,
      };
      try {
        const new_user = await addUser(
          body.name,
          body.email,
          body.password,
          body.birth_date,
          body.phone,
        );
        return new Response(JSON.stringify(new_user!), { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), { status: 503 });
      }
    }

    if (path === "/userapi/getcart" && req.method === "POST") {
      try {
        const data = await req.formData();
        if (!data) {
          return new Response(null);
        }
        const token = data.values()?.next()?.value || null;
        if (!token) {
          return new Response(null);
        }
        const authed_data = authUser(token);
        if (!authed_data) {
          return new Response(
            JSON.stringify(
              "Usuário não autenticado ou com sessão expirada. Por favor, faça login novamente.",
            ),
            { status: 403 },
          );
        }
        const user_db = await users_db.findOne({
          _id: new ObjectId(authed_data!.id),
        });
        if (!user_db) {
          return new Response(null, { status: 406 });
        }
        const prods = user_db.cart_products;
        return new Response(JSON.stringify(prods), { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), { status: 503 });
      }
    }

    if (path === "/userapi/checkout" && req.method === "POST") {
      try {
        const body = await req.json<{
          products: {
            prod_id: string;
            quantity: number;
            size: number | string;
          }[];
          user: string;
          address: ShippingInfo;
        }>();
        const user_prof = authUser(body.user);
        if (!user_prof) {
          return new Response("Não foi possível autenticar o usuário.", {
            status: 403,
          });
        }
        const items: Array<any> = [];
        for (const p of body.products) {
          const item_detes = await items_db
            .findOne<ClothingData>({ _id: new ObjectId(p.prod_id) })
            .then((res) => {
              console.log(res);
              return {
                _id: p.prod_id,
                amount: p.quantity,
                item: res,
                size: p.size,
              };
            });
          items.push(item_detes);
        }
        const total = await items.reduce(
          (acc, elem) => acc + elem.amount * elem.item.price,
          0,
        );
        const buy_res = await register_sale({
          amount: total,
          products: items,
          buyer_id: new ObjectId(user_prof.id),
          address: body.address,
        });
        return new Response(JSON.stringify(buy_res), { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), { status: 503 });
      }
    }

    if (path === "/userapi/getorders" && req.method === "POST") {
      try {
        const data = await req.formData();
        if (!data) {
          return new Response(null);
        }
        const token = data.values()?.next()?.value || null;
        if (!token) {
          return new Response(null);
        }
        const user = authUser(token);
        if (!user) {
          return new Response("Usuário não encontrado", { status: 406 });
        } else {
          const sales = await fetch_sales(new ObjectId(user!!.id));
          return new Response(JSON.stringify(sales), { status: 200 });
        }
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), { status: 500 });
      }
    }

    if (path === "/admin/products/new" && req.method === "POST") {
      try {
        const body = await req.json<{
          name: string;
          brand: string;
          category: string;
          size_data: size[];
          in_stock: number;
          price: number;
          auth_token: string;
          description?: string;
          pic_url?: string[];
          dimensions: number[];
          weight: number;
        }>();
        const user_fid: TokenResponse | undefined = authUser(body.auth_token);
        if (user_fid && user_fid.func === parseInt(await env.ADMIN_FID.get())) {
          const new_item: ClothingData = {
            _id: new ObjectId(),
            name: body.name,
            brand: body.brand,
            category: body.category,
            size_data: body.size_data,
            description: body.description,
            in_stock: body.in_stock,
            price: body.price,
            pic_url: body.pic_url,
            dimensions: body.dimensions,
            weight: body.weight,
          };
          await addItem(new_item);
          return new Response(JSON.stringify(new_item), { status: 200 });
        } else {
          return new Response(JSON.stringify("Usuário não autorizado"), {
            status: 401,
          });
        }
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), { status: 503 });
      }
    }

    if (path === "/admin/products/update" && req.method === "PATCH") {
      try {
        const body = await req.json<{
          id: string;
          name: string;
          brand: string;
          category: string;
          size_data: size[];
          in_stock: number;
          price: number;
          auth_token: string;
          description?: string;
          pic_url?: string[];
          dimensions: number[];
          weight: number;
        }>();
        const user_fid: TokenResponse | undefined = authUser(body.auth_token);
        if (user_fid && user_fid.func === parseInt(await env.ADMIN_FID.get())) {
          const updated_item: ClothingData = {
            _id: new ObjectId(body.id),
            name: body.name,
            brand: body.brand,
            category: body.category,
            size_data: body.size_data,
            description: body.description,
            in_stock: body.in_stock,
            pic_url: body.pic_url,
            price: body.price,
            dimensions: body.dimensions,
            weight: body.weight,
          };
          await changeItem(updated_item);
          return new Response(JSON.stringify(updated_item), { status: 200 });
        } else {
          return new Response(JSON.stringify("Usuário não autorizado"), {
            status: 401,
          });
        }
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), { status: 503 });
      }
    }

    /* const acceptablePaths = [
      "/",
      "/items/all",
      "/userapi/check",
      "/userapi/login",
      "/userapi/register",
      "/userapi/parsetoken",
      "/userapi/getcart",
      "/userapi/getorders",
      "/orders",
      "/cart",
      "/highlights",
    ]; */

    //if (!acceptablePaths.some((p) => p === path)) {
    return new Response(JSON.stringify("Não encontrado."));
    //}
  },
} satisfies ExportedHandler<Env>;
