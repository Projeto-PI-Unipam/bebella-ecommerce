import { ObjectId } from "mongodb";
import db from "../db/connection.ts";

export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];

export interface ClothingData {
  id?: ObjectId;
  name: string;
  brand: string;
  category: string;
  size_data: size[];
  description?: string;
  in_stock: number;
  pic_url?: string;
}

const db_coll = db.collection("items");

export async function addItem(
  name: string,
  brand: string,
  category: string,
  size_data: size[],
  in_stock: number,
  description?: string,
  pic_url?: string,
) {
  try {
    const new_item: ClothingData = {
      id: new ObjectId(),
      name: name,
      brand: brand,
      category: category,
      size_data: size_data,
      description: description,
      in_stock: in_stock,
      pic_url: pic_url,
    };
    await db_coll.insertOne(new_item).catch(console.dir);
    return;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getTotal() {
  try {
    const getRes = await db_coll.countDocuments({});
    return getRes;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
