import express, {
  type Request,
  type Response,
  type Express,
  type NextFunction,
} from "express";
import { ObjectId } from "mongodb";
import cors from "cors";
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
  type CartProd,
} from "./schema/items.ts";
import db from "./db/connection.ts";
import {
  fetch_sales,
  register_sale,
  type ShippingInfo,
} from "./schema/sales.ts";
import { assert } from "console";

const items_db = db.collection("items");
const users_db = db.collection("users");

const PORT = process.env.PORT;
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/*app.use(function (err: any, _: any, res: any, next: any) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Token de autenticação inválido");
  } else {
    next(err);
  }
});*/

//passport.use(LocalStrategy);

app.get("/", async (_: Request, res: Response) => res.send("ok"));

/* app.get("/browse", async (_: Request, res: Response) => {
  try {
    let collection = db.collection("restaurants");
    let query = {
      borough: "Queens",
      name: { $regex: "Moon", $options: "i" },
    };
    let results = await collection.find(query).toArray();
    res.send(results).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error finding restaurants to browse");
  }
}); */

app.get("/browse", async (_: Request, res: Response) => {
  try {
    let results = await items_db.find({}).toArray();
    let count = await items_db.estimatedDocumentCount();
    res.status(200).send([results, count]);
  } catch (err) {
    console.error(err);
    res.status(503).send("Erro ao buscar itens");
  }
});

app.get("/items/all", async (_: Request, res: Response) => {
  try {
    let results = await items_db.find({}).toArray();
    let count = await items_db.estimatedDocumentCount();
    res.status(200).send(JSON.stringify([results, count]));
  } catch (err) {
    console.error(err);
    res.status(503).send("Erro ao buscar itens");
  }
});

app.get(
  "/items/category/:categoryTerm",
  async (req: Request, res: Response) => {
    try {
      const search_reg = new RegExp(`.*${req.params.categoryTerm}.*`, `gi`);
      const query = { category: search_reg };
      const results = await items_db.find(query).toArray();
      const count = await items_db.countDocuments(query);
      res.status(200).send(JSON.stringify([results, count]));
    } catch (err) {
      console.error(err);
      res.status(503).send("Erro ao filtrar categorias");
    }
  },
);

app.get("/items/search/:searchTerm", async (req: Request, res: Response) => {
  try {
    const search_reg = new RegExp(`.*${req.params.searchTerm}.*`, "gi");
    const query = { $or: [{ name: search_reg }, { brand: search_reg }] };
    const results = await items_db.find(query).toArray();
    const count = await items_db.countDocuments(query);
    res.status(200).send(JSON.stringify([results, count]));
  } catch (err) {
    console.error(err);
    res.status(503).send("Erro ao pesquisar itens");
  }
});

app.get(
  "/view/product/:productId",
  async (req: Request<{ productId: string }>, res: Response) => {
    try {
      const collection = db.collection("items");
      const prod_id = req.params.productId;
      const query = collection.find({
        _id: { $eq: new ObjectId(prod_id) },
      }).toArray;
      if (!query || query.length === 0) {
        res.status(404).send("Produto não encontrado");
      } else {
        res.status(200).send(JSON.stringify(query));
      }
    } catch (err) {
      console.error(err);
    }
  },
);

app.post(
  "/admin/getproducts",
  async (
    req: Request<{ auth_token: string; stockWarn?: number; category?: string }>,
    res: Response,
  ) => {
    try {
      const user_fid: TokenResponse | undefined = authUser(req.body.auth_token);
      if (user_fid && user_fid.func === parseInt(process.env.ADMIN_FID!)) {
        if (req.body.category && req.body.category.length >= 1) {
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
          res.status(200).send(datapoints);
          return;
        }
      } else {
        res.status(401).send("Usuário não autorizado");
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(503).send(err);
    }
  },
);

app.post(
  "/userapi/check",
  async (req: Request<{ email: string }>, res: Response) => {
    const user_res = await userExists(req.body.email, true);
    if (user_res === false) {
      res.status(206).send(false);
    } else {
      res.status(200).send(JSON.stringify((user_res as UserData).salt));
    }
  },
);

app.post(
  "/userapi/parsetoken",
  async (req: Request<{ token: string }>, res: Response) => {
    try {
      const user_fid: TokenResponse | undefined = authUser(
        req.body.token.replaceAll(/['"]/g, ""),
      );
      if (user_fid) {
        res.status(204).send();
      } else {
        res.status(406).send();
      }
    } catch (err) {
      res.status(406).send(err);
    }
  },
);

app.post(
  "/userapi/login",
  async (req: Request<{ email: string; password: string }>, res: Response) => {
    try {
      if (req.body && req.body.email && req.body.password) {
        const result = await loginUser(req.body.email, req.body.password);
        if (!result || !result._id) {
          res.status(406).send();
        } else {
          const new_token = genToken(result);
          res.status(200).send(JSON.stringify(new_token));
        }
      }
    } catch (err: any) {
      if (err.message.includes("Senha") || err.message.includes("encontrado")) {
        res.status(406).send(JSON.stringify(err));
      } else {
        console.error(err);
        res.status(503).send(JSON.stringify(err));
      }
    }
  },
);

app.post(
  "/userapi/register",
  async (
    req: Request<{
      name: string;
      email: string;
      phone: string;
      password: string;
      birth_date: Date;
    }>,
    res: Response,
  ) => {
    try {
      const new_user = await addUser(
        req.body.name,
        req.body.email,
        req.body.password,
        req.body.birth_date,
        req.body.phone,
      );
      res.status(200).send(new_user!);
    } catch (err) {
      console.error(err);
      res.status(503).send(err);
    }
  },
);

app.post(
  "/userapi/getcart",
  async (req: Request<{ token: string }>, res: Response) => {
    try {
      const authed_data = authUser(req.body.token);
      if (!authed_data) {
        res
          .status(403)
          .send(
            new Error(
              "Usuário não autenticado ou com sessão expirada. Por favor, faça login novamente.",
            ),
          );
      }
      const user = (await users_db.findOne({
        _id: new ObjectId(authed_data!.id),
      })) as UserData;
      const prods = user.cart_products;
      res.status(200).send(JSON.stringify(prods));
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  },
);

app.post(
  "/userapi/checkout",
  async (
    req: Request<{
      products: { prod_id: string; quantity: number; size: number | string }[];
      user: string;
      address: ShippingInfo;
    }>,
    res: Response,
  ) => {
    try {
      const user_prof = authUser(req.body.user)!!;
      console.log(req.body.products);
      const items: Array<any> = [];
      for (const p of req.body.products) {
        console.log(p);
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
      console.log(items);
      const total = await items.reduce(
        (acc, elem) => acc + elem.amount * elem.item.price,
        0,
      );
      const buy_res = await register_sale({
        amount: total,
        products: items,
        buyer_id: new ObjectId(user_prof.id),
        address: req.body.address,
      });
      console.log(buy_res);
      res.status(200).send(JSON.stringify(buy_res));
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  },
);

app.post(
  "/userapi/getorders",
  async (req: Request<{ token: string }>, res: Response) => {
    try {
      const user = authUser(req.body.token);
      if (!user) {
        throw new Error("Usuário não encontrado");
      } else {
        const sales = await fetch_sales(new ObjectId(user!!.id));
        res.status(200).send(JSON.stringify(sales));
      }
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  },
);

app.post(
  "/admin/products/new",
  async function (
    req: Request<{
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
    }>,
    res: Response,
  ) {
    try {
      const user_fid: TokenResponse | undefined = authUser(req.body.auth_token);
      if (user_fid && user_fid.func === parseInt(process.env.ADMIN_FID!)) {
        const new_item: ClothingData = {
          _id: new ObjectId(),
          name: req.body.name,
          brand: req.body.brand,
          category: req.body.category,
          size_data: req.body.size_data,
          description: req.body.description,
          in_stock: req.body.in_stock,
          price: req.body.price,
          pic_url: req.body.pic_url,
          dimensions: req.body.dimensions,
          weight: req.body.weight,
        };
        await addItem(new_item);
        res.status(200).send(new_item);
      } else {
        res.status(401).send("Usuário não autorizado");
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(503).send(err);
    }
  },
);

app.patch(
  "/admin/products/update",
  async function (
    req: Request<{
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
    }>,
    res: Response,
  ) {
    try {
      const user_fid: TokenResponse | undefined = authUser(req.body.auth_token);
      if (user_fid && user_fid.func === parseInt(process.env.ADMIN_FID!)) {
        const updated_item: ClothingData = {
          _id: new ObjectId(req.body.id),
          name: req.body.name,
          brand: req.body.brand,
          category: req.body.category,
          size_data: req.body.size_data,
          description: req.body.description,
          in_stock: req.body.in_stock,
          pic_url: req.body.pic_url,
          price: req.body.price,
          dimensions: req.body.dimensions,
          weight: req.body.weight,
        };
        await changeItem(updated_item);
        res.status(200).send(updated_item);
      } else {
        res.status(401).send("Usuário não autorizado");
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(503).send(err);
    }
  },
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send("Não encontrado.");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
