import { type Collection } from "mongodb";
import mongoose from "mongoose";

export type size = string | number;
export const sizes = ["PP", "P", "M", "G", "GG"];

const clothes_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: String,
  category: {
    type: String,
    required: true,
  },
  size_data: {
    type: [{ s_name: String, s_stock: Number }],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  in_stock: {
    type: Number,
    required: true,
  },
  pic_url: {
    type: String,
    required: true,
  },
});

const ClothesModel = mongoose.model("ClothesModel", clothes_schema);

export async function addItem(coll: Collection, item: typeof ClothesModel) {
  const addResult = await coll.insertOne(item).catch(console.dir);
  return addResult;
}

export async function getTotal(coll: Collection) {
  const getRes = await coll.countDocuments({});
  return getRes;
}

//export async function queryCollection(coll: Collection) {}
