import { MercadoPagoConfig } from "mercadopago";

const access = process.env.MP_ACCESS || "";
const pay = new MercadoPagoConfig({ accessToken: access });
export default pay;
