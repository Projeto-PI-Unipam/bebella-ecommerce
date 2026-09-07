import { hash, compare } from "bcryptjs";
import { type Collection } from "mongodb";
import { UUID } from "bson";
import { randomUUID } from "node:crypto";

export interface UserData {
  id: UUID;
  token: string;
  username: string;
  hashpass: string;
  //picture_url: string;
  wishlist_ids: string[];
  cart_ids: string[];
  //addresses: string[];
  //past_orders: string[];
}

export type AuthStatus = boolean | UserData;

async function addUser(coll: Collection, username: string, password: string) {
  try {
    let new_hashpass = await hash(password, 10);
    const new_user = {
      id: randomUUID,
      token: "",
      username: username,
      hashpass: new_hashpass,
      //picture_url: string;
      wishlist_ids: [],
      cart_ids: [],
      //addresses: string[];
      //past_orders: string[];
    };
    await coll.insertOne(new_user).catch(console.dir);
    return new_user;
  } catch (error) {
    throw error;
  }
}

async function checkUser(coll: Collection, username: string, password: string) {
  const res = await coll.findOne<UserData>({ username: `${username}` });
  if (!res) {
    /*const e = new NoUserError(`Não foi encontrado usuário para: ${username}`);
    throw e;*/
    console.error(`Não foi encontrado usuário para: ${username}`);
  } else {
    try {
      const result = await compare(password, res.hashpass);
      if (result === true) {
        return res;
      } else {
        /*const e = new WrongPassError("A senha informada está incorreta.");
        throw e;*/
        console.error("Senha incorreta");
      }
    } catch (error) {
      /*throw new Error(
        "Erro ao fazer a verificação da senha. Por favor, entre em contato com o suporte.",
      );*/
      console.error(error);
    }
  }
}

/*
class NoUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoUserError";
    Object.setPrototypeOf(this, NoUserError.prototype);
  }
}

class WrongPassError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WrongPassError";
    Object.setPrototypeOf(this, WrongPassError.prototype);
  }
}

const mclient = new MongoClient(env.DATABASE_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  pkFactory: { createPk: () => new UUID().toBinary() },
});

async function connectMongo() {
  try {
    await mclient.connect();
    const response = mclient.db("userdb").collection("users");
    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function LoginPage({ setter }: { setter: Function }) {
  const [typedName, updateName] = useState("");
  const [typedPass, updatePass] = useState("");

  const database = await connectMongo().catch((e) => handleFailure(e));

  async function handleLogin(username: string, password: string) {
    if (username == "" && password == "") {
      handleFailure(Error("Necessário preencher usuário e senha!"));
    }
    try {
      const result = await checkUser(database!, username, password);
      setter(result);
      return result;
    } catch (error) {
      if (error instanceof NoUserError) {
        addUser(database!, username, password);
      }
      handleFailure(error as Error);
    }
  }

  function handleFailure(error: Error) {
    alert(typeof error + " " + error.message);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form onSubmit={() => handleLogin(typedName, typedPass)}>
        <label>
          <p>E-mail:</p>
          <input
            type="text"
            onChange={(uname) => updateName(uname.target.value)}
          />
        </label>
        <label>
          <p>Senha:</p>
          <input
            type="password"
            onChange={(pass) => updatePass(pass.target.value)}
          />
        </label>
        <div>
          <button type="submit" onClick={setter()}>
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}

function LogInOutButton() {}

function NewAccount() {}

function CheckLogin() {}

function VerifyStatus() {}

function GetProfileData() {}

function LoadWishItems() {}

function LoadCartItems() {}

function LogOut() {}*/
