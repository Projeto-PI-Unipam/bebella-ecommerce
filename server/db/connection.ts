import { MongoClient } from "mongodb";

const uri = process.env.DBPROD_URL || "";
const client = new MongoClient(uri);

try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("Succesfully pinged the database.");
} catch (err) {
  console.error(err);
}

let db = client.db("bebella_store");

export default db;
