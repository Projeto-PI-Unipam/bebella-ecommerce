import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

import { MongoClient, ServerApiVersion, Db, Collection } from "mongodb";
import { UUID } from "bson";
//import { BSON } from "mongodb";

export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];

export interface ClothesSize {
  sname: size;
  stock: number;
}

export interface ClothesModel {
  name: string;
  brand?: string;
  category: string;
  size_data: ClothesSize[];
  description: string;
  in_stock: number;
  pic_url: string;
}

dotenv.config({
  path: path.resolve(process.cwd(), `.env`),
});

const envSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid address"),
});

const envRes = envSchema.safeParse(process.env);

if (!envRes.success) {
  console.error("Invalid environment configuration:");
  console.error(z.treeifyError(envRes.error));
  process.exit(1);
}

export const env = envRes.data;

const mclient = new MongoClient(env.DATABASE_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  pkFactory: { createPk: () => new UUID().toBinary() },
});

export async function connectMongo() {
  try {
    await mclient.connect();
  } finally {
    const response = mclient.db("mongoc0");
    console.log("Connected to database");
    return response;
  }
}

export const database = connectMongo().catch(console.dir);

export async function createCollection(db: Db, collName: string) {
  const newColl = await db.createCollection(collName).catch(console.dir);
  return newColl;
}

export async function addItem(coll: Collection, item: ClothesModel) {
  const addResult = await coll.insertOne(item).catch(console.dir);
  return addResult;
}

export async function getTotal(coll: Collection) {
  const getRes = await coll.countDocuments({});
  return getRes;
}

//export async function queryCollection(coll: Collection) {}
