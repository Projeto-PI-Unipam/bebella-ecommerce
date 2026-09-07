import express, { type Request, type Response, type Express } from "express";
import cors from "cors";

const PORT = process.env.PORT;
const app: Express = express();

app.use(cors());
app.use(express.json());

import db from "./db/connection.ts";

app.get("/", async (_: Request, res: Response) => {
  let collection = db.collection("restaurants");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

app.get("/browse", async (_: Request, res: Response) => {
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
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
