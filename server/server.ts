import express, { type Request, type Response, type Express } from "express";
import { ObjectId } from "mongodb";
import cors from "cors";
import passport from "passport";
import {
  LocalStrategy,
  genToken,
  userExists,
  addUser,
} from "./schema/users.ts";

const PORT = process.env.PORT;
const app: Express = express();

app.use(cors());
app.use(express.json());

import { type UserData } from "./schema/users.ts";
import db from "./db/connection.ts";

passport.use(LocalStrategy);

app.get("/", async (_: Request, res: Response) => {
  let collection = db.collection("items");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

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
        res.status(404).send("Product not found");
      } else {
        res.status(200).send(query);
      }
    } catch (err) {
      console.error(err);
    }
  },
);

app.use(passport.initialize());

app.post(
  "/userapi/check",
  async (req: Request<{ email: string }>, res: Response) => {
    const user_res = await userExists(req.params.email, false);
    if (user_res === true) {
      res.status(200).send(true);
    } else {
      res.status(404).send(false);
    }
  },
);

app.post(
  "/userapi/login",
  async (
    req: Request<{ name: string; email: string; password: string }>,
    res: Response,
  ) => {
    passport.authenticate(
      LocalStrategy,
      async (err: any, user: UserData, _: any) => {
        if (err) {
          res.status(404).json(err);
        } else {
          const token = await genToken(user);
          res.status(200).send(token);
        }
      },
    )(req, res);
  },
);

app.post(
  "/userapi/register",
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
      await addUser(
        req.params.name,
        req.params.email,
        req.params.password,
        req.params.birth_date,
      );
      res.status(200).send("user_created");
    } catch (err) {
      console.error(err);
      res.status(503).send(err);
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
