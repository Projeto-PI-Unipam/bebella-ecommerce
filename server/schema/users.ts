import { genSaltSync, hashSync } from "bcryptjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import db from "../db/connection.ts";
import dotenv from "dotenv";
import { type WebSale } from "./sales.ts";
import { type CartProd } from "./items.ts";

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

const db_coll = db.collection("users");

export async function userExists(user_email: string, returning: boolean) {
  try {
    const user = await db_coll.findOne<UserData>({
      email: { $eq: user_email },
    });
    if (user === null) {
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
    const new_salt = genSaltSync(16);
    const new_hash = hashSync(password, new_salt);
    return [new_salt, new_hash];
    //await db_coll.updateOne(query, { $set: {hash: new_hash, salt: new_salt}});
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* async function checkPassword(user_email: string, password: string) {
  try {
    const obj = await db_coll.findOne<UserData>({ email: { $eq: user_email } });
    // const hash_try = compareSync(password, obj!.hash);
    //return hash_try;
  } catch (err) {
    console.error(err);
    throw err;
  }
} */

export function genToken(user_data: UserData) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);
  return jwt.sign(
    {
      id: user_data._id,
      email: user_data.email,
      name: user_data.name,
      func: user_data.func_id || 165,
      exp: Math.round(expiry.getTime() / 1000),
    },
    process.env.JWT_SEC!,
  );
}

export async function addUser(
  name: string,
  user_email: string,
  password: string,
  birth: Date,
  user_phone: string,
) {
  try {
    const test_exist = await db_coll
      .find({ email: { $eq: user_email } })
      .toArray();
    if (test_exist && test_exist.length === 0) {
      const new_salt = genSaltSync(16);
      const new_hashpass = hashSync(password, new_salt);
      const new_user: UserData = {
        _id: new ObjectId(),
        func_id: 165,
        name: name,
        email: user_email,
        phone: user_phone,
        birth_date: birth,
        hash: new_hashpass,
        salt: new_salt,
      };
      await db.collection("users").insertOne(new_user);
      return genToken(new_user);
    }
  } catch (err: any) {
    if (!err.errmsg.includes("duplicate")) {
      console.error(err);
      throw err;
    }
  }
}

export interface TokenResponse {
  id: ObjectId;
  email: string;
  name: string;
  func: number;
  exp: number;
  iat: number;
}

export function authUser(user_token: string) {
  if (user_token && user_token.length > 1) {
    try {
      const res: TokenResponse | undefined = jwt.verify(
        user_token,
        process.env.JWT_SEC!,
      ) as TokenResponse;
      return res;
    } catch (err) {
      console.error(err);
    }
  }
}

export async function loginUser(user_email: string, password: string) {
  try {
    if (user_email.length >= 1 && password.length >= 1) {
      const result = await db_coll.findOne<UserData>({
        email: { $eq: user_email },
      });
      if (result?.email) {
        if (password === result!.hash) {
          return result;
        } else {
          throw new Error("Senha incorreta");
        }
      } else {
        throw new Error("Não foi encontrado usuário com essas informações");
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
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
