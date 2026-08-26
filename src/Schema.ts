import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

import { MongoClient, ServerApiVersion } from "mongodb";
import { BSON } from "mongodb";

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
});

export async function connectMongo() {
  try {
    await mclient.connect();
    const response = mclient.db("mongoc0");
    console.log("Connected to database");
    return response;
  } finally {
    await mclient.close();
  }
}

export const database = connectMongo().catch(console.dir);
export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];

export class ClothesSize {
  sname: size;
  stock: number;

  constructor(sname: size, stock: number) {
    this.sname = sname;
    this.stock = stock;
  }
}

export class ClothesModel {
  name: string;
  brand?: string;
  category: string;
  size_data: ClothesSize[];
  description: string;
  in_stock: number;
  pic_url: string;

  constructor(
    name: string,
    category: string,
    size_data: ClothesSize[],
    description: string,
    in_stock: number,
    pic_url: string,
    brand?: string,
  ) {
    this.name = name;
    this.brand = brand;
    this.category = category;
    this.size_data = size_data;
    this.description = description;
    this.in_stock = in_stock;
    this.pic_url = pic_url;
  }
}
