import { ObjectId } from "mongodb";

//import { type UserData } from "./schema/users.ts";
import { type ClothingData, type size } from "./schema/items.ts";
import { type ShippingInfo } from "./schema/sales.ts";

interface Env {
  ADMIN_FID: SecretsStoreSecret;
  DBPROD_URL: SecretsStoreSecret;
  JWT_SEC: SecretsStoreSecret;
  MP_ACCESS: SecretsStoreSecret;
  ASSETS: Fetcher;
  MONGODB_CONNECTION: DurableObjectNamespace<MongoDBConnection>;
}

import { MongoDBConnection } from "./db/connection.ts";

export default {
  async fetch(req: Request, env): Promise<Response> {
    const mongo_id = env.MONGODB_CONNECTION.idFromName("mongodb-connection");
    const db = env.MONGODB_CONNECTION.get(mongo_id, { locationHint: "sam" });

    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" && req.method === "GET") {
      return new Response(JSON.stringify("ok!"));
    }

    if (path === "/items/all" && req.method === "GET") {
      try {
        let results = JSON.parse(await db.get_all_items()) as Array<
          ClothingData[] | number
        >;
        return new Response(JSON.stringify(results), { status: 200 });
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
        const results = JSON.parse(await db.search_categories(search)) as Array<
          ClothingData[] | number
        >;
        return new Response(JSON.stringify(results), { status: 200 });
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
        const results = JSON.parse(await db.search_items(search)) as Array<
          ClothingData[] | number
        >;
        return new Response(JSON.stringify(results), { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify("Erro ao buscar itens"), {
          status: 503,
        });
      }
    }

    if (path.startsWith("/items/view/") && req.method === "GET") {
      try {
        const prod_id = path.replace("/items/view/", "");
        const query = JSON.parse(await db.fetch_item(prod_id));
        if (!query || !query._id) {
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
        const user_fid = JSON.parse(
          (await db.auth_user(body.auth_token)) || "{}",
        );
        if (user_fid && user_fid.func === parseInt(await env.ADMIN_FID.get())) {
          if (path === body.category && body.category.length >= 1) {
          } else {
            const db_data = JSON.parse(await db.get_all_items());
            const full_data = db_data[0] as ClothingData[];
            const db_count = db_data[1] as number;
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
              productsCount: db_count,
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
      const user_res = JSON.parse(
        (await db.user_exists(user_email, true)) || "{}",
      );
      if (user_res === false || !user_res) {
        return new Response(JSON.stringify(false), { status: 206 });
      } else {
        const salt = user_res.salt;
        return new Response(JSON.stringify(salt), {
          status: 200,
        });
      }
    }

    if (path === "/userapi/parsetoken" && req.method === "POST") {
      try {
        const token = (await req.formData()).values().next().value;
        const user_fid = JSON.parse(
          (await db.auth_user(token.replaceAll(/['"]/g, ""))) || "{}",
        );
        if (user_fid && user_fid.id) {
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
        if (!data) return new Response(null, { status: 401 });
        const body = {
          email: data.next().value,
          password: data.next().value,
        };
        if (!body) return new Response(null, { status: 401 });
        if (body.email && body.password) {
          const result = JSON.parse(
            (await db.login_user(body.email, body.password)) || "{}",
          );
          if (!result || !result._id) {
            return new Response(null, { status: 406 });
          } else if (typeof result === "string") {
            if (!(result.includes("Senha") || result.includes("encontrado"))) {
              console.error(result);
            }
            return new Response(JSON.stringify(result), { status: 406 });
          } else {
            const new_token = await db.gen_token(result);
            return new Response(JSON.stringify(new_token), { status: 200 });
          }
        } else {
          return new Response(null, { status: 406 });
        }
      } catch (err: any) {
        return new Response(err, { status: 406 });
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
        const new_user = JSON.parse(
          (await db.add_user(
            body.name,
            body.email,
            body.password,
            body.birth_date,
            body.phone,
          )) || "{}",
        );
        if (new_user && new_user._id) {
          return new Response(JSON.stringify(new_user!), { status: 200 });
        } else {
          return new Response(null, { status: 400 });
        }
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
        const authed_data = JSON.parse((await db.auth_user(token)) || "{}");
        if (!authed_data || !authed_data.id) {
          return new Response(
            JSON.stringify(
              "Usuário não autenticado ou com sessão expirada. Por favor, faça login novamente.",
            ),
            { status: 403 },
          );
        }
        const user_db = JSON.parse(await db.fetch_user(await authed_data!.id));
        if (!user_db || !user_db._id) {
          return new Response(null, { status: 406 });
        }
        const prods = await user_db.cart_products;
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
        const user_prof = JSON.parse((await db.auth_user(body.user)) || "{}");
        if (!user_prof || !user_prof.id) {
          return new Response("Não foi possível autenticar o usuário.", {
            status: 403,
          });
        }
        const items: Array<any> = [];
        for (const p of body.products) {
          const item_detes = await db
            .fetch_item(p.prod_id)
            .then((res: string) => {
              const item_parsed = JSON.parse(res) as ClothingData;
              console.log(item_parsed);
              return {
                _id: p.prod_id,
                amount: p.quantity,
                item: item_parsed,
                size: p.size,
              };
            });
          items.push(item_detes);
        }
        const total = await items.reduce(
          (acc, elem) => acc + elem.amount * elem.item.price,
          0,
        );
        const buy_res = JSON.parse(
          (await db.register_sale(
            JSON.stringify({
              amount: total,
              products: items,
              buyer_id: new ObjectId(user_prof.id),
              address: body.address,
            }),
          )) || "{}",
        );
        if (buy_res) {
          return new Response(JSON.stringify(buy_res), { status: 200 });
        } else {
          return new Response(JSON.stringify(buy_res), { status: 503 });
        }
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
        const user = JSON.parse((await db.auth_user(token)) || "{}");
        if (!user || !user.id) {
          return new Response("Usuário não encontrado", { status: 406 });
        } else {
          const sales = JSON.parse(await db.fetch_sales(user!!.id));
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
        const user_fid = JSON.parse(
          (await db.auth_user(body.auth_token)) || "{}",
        );
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
          await db.add_item(new_item);
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
        const user_fid = JSON.parse(
          (await db.auth_user(body.auth_token)) || "{}",
        );
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
          await db.change_item(updated_item);
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

    return new Response(JSON.stringify("Não encontrado."));
  },
} satisfies ExportedHandler<Env>;

export { MongoDBConnection };
