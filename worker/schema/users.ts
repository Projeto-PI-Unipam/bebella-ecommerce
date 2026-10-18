import { genSaltSync, hashSync } from "bcryptjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import db from "../db/connection.ts";
import dotenv from "dotenv";
import { type WebSale } from "./sales.ts";
import { type CartProd } from "./items.ts";
import { env } from "cloudflare:workers";

dotenv.config();

export interface UserData {
  _id?: ObjectId;
  func_id?: number;
  name: string;
  email: string;
  phone: string;
  hash: string;
  salt: string;
  birth_date: Date;
  picture_url?: string;
  wishlist_ids?: string[];
  cart_products?: CartProd[];
  order_addresses?: string[][];
  past_orders?: WebSale[];
}

export interface TokenResponse {
  id: ObjectId;
  email: string;
  name: string;
  func: number;
  exp: number;
  iat: number;
}

/* export const LocalStrategy = new Strategy(
  {
    usernameField: "email",
  },
  async function (username, password, done) {
    try {
      console.log(username);
      const result = await db_coll.findOne<UserData>({
        email: { $eq: username },
      });
      console.log(result);
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
); */
