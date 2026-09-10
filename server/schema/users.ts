import { randomBytes, pbkdf2Sync } from "node:crypto";
import { Strategy } from "passport-local";
import { ObjectId } from "mongodb";
//import { Schema, model, Model } from "mongoose";
import jwt from "jsonwebtoken";
import db from "../db/connection.ts";
import dotenv from "dotenv";

dotenv.config();

export interface UserData {
  id?: ObjectId;
  name: string;
  email: string;
  hash: string;
  salt: string;
  birth_date: Date;
  picture_url?: string;
  wishlist_ids?: string[];
  cart_products?: string[];
  order_addresses?: string[];
  past_orders?: string[];
}

const db_coll = db.collection("users");

export async function userExists(user_email: string, returning: boolean) {
  try {
    const user = await db_coll.findOne({ email: { $eq: user_email } });
    if (!user) {
      return false;
    } else {
      if (returning) {
        return user;
      } else {
        return true;
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function hashPassword(password: string) {
  try {
    const new_salt = randomBytes(16).toString("hex");
    const new_hash = pbkdf2Sync(
      password,
      new_salt,
      2400,
      64,
      "sha256",
    ).toString("hex");
    return [new_salt, new_hash];
    //await db_coll.updateOne(query, { $set: {hash: new_hash, salt: new_salt}});
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function checkPassword(user_email: string, password: string) {
  try {
    const obj = await db_coll.findOne<UserData>({ email: { $eq: user_email } });
    const hash_try = pbkdf2Sync(
      password,
      obj!.salt,
      2400,
      64,
      "sha256",
    ).toString("hex");
    return hash_try === obj!.hash;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function genToken(user_data: UserData) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);
  return jwt.sign(
    {
      _id: user_data.id,
      email: user_data.email,
      name: user_data.name,
      exp: Math.round(expiry.getTime() / 1000),
    },
    process.env.JWT_SEC!,
  );
}

export async function addUser(
  name: string,
  email: string,
  password: string,
  birth: Date,
) {
  try {
    const new_salt = randomBytes(16).toString("hex");
    const new_hashpass = pbkdf2Sync(
      password,
      new_salt,
      2400,
      64,
      "sha256",
    ).toString("hex");
    const new_user: UserData = {
      id: new ObjectId(),
      name: name,
      email: email,
      birth_date: birth,
      hash: new_hashpass,
      salt: new_salt,
    };
    await db.collection("users").insertOne(new_user);
  } catch (err) {
    console.error(err);
  }
}

export const LocalStrategy = new Strategy(
  {
    usernameField: "email",
  },
  async function (username, password, done) {
    try {
      const result = await db_coll.findOne<UserData>({
        email: { $eq: username },
      });
      if (result?.id) {
        if (await checkPassword(username, password)) {
          return done(null, result);
        } else {
          return done(null, false, {
            message: "wrong_password",
          });
        }
      } else {
        return done(null, false, {
          message: "no_user_found",
        });
      }
    } catch (err) {
      console.error(err);
      return done(null, false, { message: "error_db" });
    }
  },
);
