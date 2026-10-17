import { MongoClient } from "mongodb";
import { env } from "cloudflare:workers";

const uri = await env.DBPROD_URL.get();
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
