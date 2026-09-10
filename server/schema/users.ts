import { randomBytes, pbkdf2Sync } from "node:crypto";
import { Strategy } from "passport-local";
import { Schema, model, Model } from "mongoose";
import { sign } from "jsonwebtoken";
import db from "../db/connection";
import dotenv from "dotenv";

dotenv.config();

export interface UserData {
  name: string;
  email: string;
  hash: string;
  salt: string;
  picture_url: string;
  wishlist_ids: string[];
  cart_products: string[];
  order_addresses: string[];
  past_orders: string[];
}

interface UserStatics extends Model<UserData> {}

interface UserMethods extends Model<UserData> {
  setPassword(password: string): void;
  checkPassword(password: string): boolean;
  genToken(): string;
}

const user_schema = new Schema<UserData, UserStatics, UserMethods>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture_url: String,
  wishlist_ids: Array<String>,
  cart_products: Array<String>,
  order_addresses: Array<String>,
  past_orders: Array<String>,
  hash: String,
  salt: String,
});

user_schema.method("setPassword", function setPassword(password: string) {
  this.salt = randomBytes(16).toString("hex");
  this.hash = pbkdf2Sync(password, this.salt, 2400, 64, "sha256").toString(
    "hex",
  );
});

user_schema.method("checkPassword", function checkPassword(password: string) {
  const hash = pbkdf2Sync(password, this.salt, 2400, 64, "sha256").toString(
    "hex",
  );
  return this.hash === hash;
});

user_schema.method("genToken", function genToken() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);

  return sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: Math.round(expiry.getTime() / 1000),
    },
    process.env.JWT_SEC!,
  );
});

export const UserModel = model("UserModel", user_schema);

export const addUser = async function (
  name: string,
  email: string,
  password: string,
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
    db.collection("users").insertOne(
      new UserModel({
        name: name,
        email: email,
        hash: new_hashpass,
        salt: new_salt,
      }),
    );
  } catch (err) {
    console.error(err);
  }
};

export const LocalStrategy = new Strategy(
  {
    usernameField: "email",
  },
  async function (username, password, done) {
    try {
      const result = await UserModel.findOne({ email: username }).exec();
      if (result?._id) {
        if (!result.checkPassword(password)) {
          return done(null, false, {
            message: "wrong_password",
          });
        } else {
          return done(null, result);
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
