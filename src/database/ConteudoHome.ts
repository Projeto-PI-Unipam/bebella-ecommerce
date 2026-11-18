import { bucket } from "./Schema.tsx";

// Conteúdo da home (campanha, benefícios, banner e newsletter).
// Usado pela home e pelo painel. Esses textos aparecem enquanto o painel
// não publica nada em /items/home.
export interface HomeContent {
  show_campaign: boolean;
  campaign: {
    tag: string;
    title: string;
    text: string;
    button: string;
    link: string;
    image: string;
  };
  benefits: { highlight: string; text: string }[];
  banner: { title: string; text: string; button: string; link: string };
  newsletter: { title: string; text: string };
}

export const conteudo_padrao: HomeContent = {
  show_campaign: true,
  campaign: {
    tag: "EM ESPERA",
    title: "Em espera",
    text: "Em espera",
    button: "EM ESPERA",
    link: "",
    image: "",
  },
  benefits: [
    { highlight: "Frete grátis", text: "acima de R$ 299" },
    { highlight: "5% OFF", text: "no Pix" },
    { highlight: "Até 6x sem juros", text: "no cartão" },
    { highlight: "Troca grátis", text: "em 30 dias" },
  ],
  banner: {
    title: "5% OFF no Pix em toda a loja",
    text: "O desconto já aparece no pagamento. Parcele no cartão em até 6x sem juros.",
    button: "APROVEITAR",
    link: "",
  },
  newsletter: {
    title: "Ganhe 10% OFF na primeira compra",
    text: "Cadastre seu e-mail e receba novidades e ofertas antes de todo mundo.",
  },
};

export const desconto_pix = 0.05;

export function image_url(name?: string): string | undefined {
  if (!name) return undefined;
  if (/^(https?:|blob:|data:|\/)/.test(name)) return name;
  return `${bucket}/${name}`;
}
