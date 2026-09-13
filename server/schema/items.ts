import { ObjectId } from "mongodb";
import db from "../db/connection.ts";

export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];

export interface ClothingData {
  id: ObjectId;
  name: string;
  brand: string;
  category: string;
  size_data: size[];
  description?: string;
  in_stock: number;
  price: number;
  pic_url?: string;
}

const db_coll = db.collection("items");

export async function addItem(new_item: ClothingData) {
  try {
    await db_coll.insertOne(new_item).catch(console.dir);
    return;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function changeItem(update: ClothingData) {
  try {
    await db_coll.updateOne(
      { _id: { $eq: update.id } },
      {
        $set: update,
      },
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function countItems() {
  try {
    const getRes = await db_coll.countDocuments({});
    return getRes;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
