import express, { type Request, type Response, type Express } from "express";
import { ObjectId } from "mongodb";
import cors from "cors";
//import passport from "passport";
import {
  //LocalStrategy,
  loginUser,
  genToken,
  userExists,
  addUser,
  type TokenResponse,
  authUser,
} from "./schema/users.ts";
import bodyParser from "body-parser";

import { type UserData } from "./schema/users.ts";
import {
  type ClothingData,
  type size,
  addItem,
  changeItem,
  countItems,
  //countItems,
} from "./schema/items.ts";
import db from "./db/connection.ts";

const items_db = db.collection("items");
const users_db = db.collection("users");

const PORT = process.env.PORT;
const app: Express = express();
const jsonParser = bodyParser.json();
const encodedParser = bodyParser.urlencoded();

app.use(cors());
app.use(express.json());
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
    let count = await countItems();
    res.status(200).send([results, count]);
  } catch (err) {
    console.error(err);
    res.status(503).send("Erro ao buscar itens");
  }
});

app.get("/items/all", async (_: Request, res: Response) => {
  try {
    let results = await items_db.find({}).toArray();
    let count = await countItems();
    res.status(200).send([results, count]);
  } catch (err) {
    console.error(err);
    res.status(503).send("Erro ao buscar itens");
  }
});

app.get("/items/search/:searchTerm", async (req: Request, res: Response) => {
  try {
    const search_reg = new RegExp(`${req.params.searchTerm}.+`, "i");
    let results = await items_db
      .find({ $or: [{ name: search_reg }, { brand: search_reg }] })
      .toArray();
    let count = await countItems();
    res.status(200).send([results, count]);
  } catch (err) {
    console.error(err);
    res.status(503).send("Erro ao pesquisar itens");
  }
});

app.get(
  "/view/product/:productId",
  async (req: Request<{ productId: string }>, res: Response) => {
    try {
      let collection = db.collection("items");
      let prod_id = req.params.productId;
      let query = collection.find({
        _id: { $eq: new ObjectId(prod_id) },
      }).toArray;
      if (!query || query.length === 0) {
        res.status(404).send("Produto não encontrado");
      } else {
        res.status(200).send(query);
      }
    } catch (err) {
      console.error(err);
    }
  },
);

app.post(
  "/admin/getproducts",
  encodedParser,
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
            productsCount: await countItems(),
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
    const user_res = await userExists(req.params.email, false);
    if (user_res === true) {
      res.status(200).send(true);
    } else {
      res.status(204).send(false);
    }
  },
);

app.post(
  "/userapi/parsetoken",
  encodedParser,
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
  encodedParser,
  async (req: Request<{ email: string; password: string }>, res: Response) => {
    try {
      if (req.body && req.body.email && req.body.password) {
        const result = await loginUser(req.body.email, req.body.password);
        if (!result || !result.id) {
          res.status(406).send(res);
        } else {
          const new_token = genToken(result);
          res.status(200).send(new_token);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Senha") || err.message.includes("encontrado")) {
        res.status(406).send(err);
      } else {
        res.status(503).send(err);
      }
    }
  },
);

app.post(
  "/userapi/register",
  encodedParser,
  async (
    req: Request<{
      name: string;
      email: string;
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
      );
      res.status(200).send(new_user!);
    } catch (err) {
      console.error(err);
      res.status(503).send(err);
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
      pic_url?: string;
    }>,
    res: Response,
  ) {
    try {
      const user_fid: TokenResponse | undefined = authUser(
        req.params.auth_token,
      );
      if (user_fid && user_fid.func === parseInt(process.env.ADMIN_FID!)) {
        const new_item: ClothingData = {
          id: new ObjectId(),
          name: req.params.name,
          brand: req.params.brand,
          category: req.params.category,
          size_data: req.params.size_data,
          description: req.params.description,
          in_stock: req.params.in_stock,
          price: req.params.price,
          pic_url: req.params.pic_url,
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
      pic_url?: string;
    }>,
    res: Response,
  ) {
    try {
      const user_fid: TokenResponse | undefined = authUser(
        req.params.auth_token,
      );
      if (user_fid && user_fid.func === parseInt(process.env.ADMIN_FID!)) {
        const updated_item: ClothingData = {
          id: new ObjectId(req.params.id),
          name: req.params.name,
          brand: req.params.brand,
          category: req.params.category,
          size_data: req.params.size_data,
          description: req.params.description,
          in_stock: req.params.in_stock,
          pic_url: req.params.pic_url,
          price: req.params.price,
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
