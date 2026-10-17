//import { authUser } from "./schema/users.ts";

export default {
  async fetch(req: Request, _: Env): Promise<Response> {
    const url = new URL(req.url);

    if ((url.pathname = "/userapi/getcart")) {
      try {
        console.log("ok!");
        console.log(JSON.parse(decodeURIComponent(await req.text())));
        return new Response("ok");
        /* const authed_data = authUser(req.body?.token);
      if (!authed_data) {
        res
          .status(403)
          .send(
            new Error(
              "Usuário não autenticado ou com sessão expirada. Por favor, faça login novamente.",
            ),
          );
        res.end();
      }
      const user = (await users_db.findOne({
        _id: new ObjectId(authed_data!.id),
      })) as UserData;
      const prods = user.cart_products;
      res.status(200).send(JSON.stringify(prods));
      res.end(); */
      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify("No!"));
        /* res.status(500).send(err);
      res.end(); */
      }
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
