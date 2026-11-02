import { ObjectId } from "bson";
import ProductCard from "../components/ProductCard";
import { type ClothesModel, type size, sizes } from "../database/Schema";
import patternBg from "../assets/img/pattern_cut.png";
import testProduct from "../assets/img/test_product.png";
import testProduct2 from "../assets/img/test_product_2.png";
import "../assets/fonts/fonts.css";

function produtoTeste(
  nome: string,
  preco: number,
  foto: string,
): ClothesModel {
  return {
    db_id: new ObjectId().toString(),
    name: nome,
    brand: "Bebella",
    category: "Primavera",
    size_data: sizes as size[],
    description: "Produto de teste",
    in_stock: 5,
    pic_url: [foto],
    price: preco,
    dimensions: [30, 20, 5],
    weight: 300,
  };
}

const novidades = [
  produtoTeste("Vestido em linho", 350.99, testProduct),
  produtoTeste("Vestido nude", 200.0, testProduct2),
  produtoTeste("Conjunto linho", 260.0, testProduct),
  produtoTeste("Blusa ombro a ombro", 149.9, testProduct2),
];

const maisVendidos = [
  produtoTeste("Conjunto linho", 200.0, testProduct2),
  produtoTeste("Colete em crochê", 350.99, testProduct),
  produtoTeste("Conjunto rosa", 229.9, testProduct2),
  produtoTeste("Camisa malha canelada", 189.9, testProduct),
];

const beneficios = [
  ["Frete grátis", "acima de R$ 299 para todo o Brasil"],
  ["5% OFF no Pix", "desconto direto no pagamento"],
  ["Até 6x sem juros", "no cartão de crédito"],
  ["Troca fácil", "primeira troca grátis em 30 dias"],
];

const categorias = ["Camisas", "Calças", "Bolsas", "Vestidos"];

export default function HomePage() {
  return (
    <div className="w-full flex flex-col bg-white font-[Prompt] text-neutral-800">
      <section className="relative w-full h-[420px] flex flex-row overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundRepeat: "repeat",
            backgroundSize: "260px auto",
          }}
        ></div>

        <div className="relative z-10 flex w-2/3 flex-col justify-center pl-16">
          <span className="text-sm tracking-[0.2em] text-neutral-600">
            {"Coleção Primavera 2026".toUpperCase()}
          </span>
          <h1 className="mt-4 text-6xl font-light leading-[1.1] text-neutral-800">
            Leveza que
            <br />
            floresce
          </h1>
          <p className="mt-6 text-base text-neutral-700">
            Crochê, linho e tons delicados para a estação mais leve do ano.
          </p>
          <div className="mt-8 flex flex-row gap-4">
            <button
              type="button"
              className="h-12 rounded-full bg-[#f6bebf] px-8 text-sm font-medium tracking-wide text-neutral-800"
            >
              {"Ver coleção".toUpperCase()}
            </button>
            <button
              type="button"
              className="h-12 rounded-full border-2 border-neutral-300 bg-white px-8 text-sm font-medium tracking-wide text-neutral-800"
            >
              {"Ver ofertas".toUpperCase()}
            </button>
          </div>
        </div>

        <div className="relative z-10 flex w-1/3 items-center justify-center bg-[#e8d9cc] text-sm text-neutral-600">
          imagem da campanha
        </div>
      </section>

      <section className="flex w-full flex-row items-center justify-evenly bg-[#fdf1ee] py-6">
        {beneficios.map((b) => (
          <div
            key={b[0]}
            className="flex flex-1 flex-col items-center border-r border-[#f0d9d4] px-4 text-center last:border-r-0"
          >
            <span className="text-sm font-medium text-neutral-800">{b[0]}</span>
            <span className="mt-1 text-xs text-neutral-600">{b[1]}</span>
          </div>
        ))}
      </section>

      <section className="w-full px-16 pt-16">
        <div className="flex flex-row items-end justify-between">
          <h2 className="text-2xl font-normal tracking-[0.1em] text-neutral-800">
            {"Novidades".toUpperCase()}
          </h2>
          <span className="cursor-pointer text-sm text-[#d89a9c] hover:text-[#98263e]">
            {"Ver tudo".toUpperCase()}
          </span>
        </div>
        <div className="mt-8 flex flex-row gap-8 overflow-x-auto pb-4">
          {novidades.map((p) => (
            <ProductCard key={p.db_id} item={p} />
          ))}
        </div>
      </section>

      <section className="w-full px-16 pt-16">
        <div className="flex flex-row items-end justify-between">
          <h2 className="text-2xl font-normal tracking-[0.1em] text-neutral-800">
            {"Compre por categoria".toUpperCase()}
          </h2>
          <span className="cursor-pointer text-sm text-[#d89a9c] hover:text-[#98263e]">
            {"Ver todas".toUpperCase()}
          </span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {categorias.map((c) => (
            <div
              key={c}
              className="flex h-56 cursor-pointer flex-col justify-end overflow-hidden rounded-lg"
              style={{
                backgroundImage: `url(${patternBg})`,
                backgroundRepeat: "repeat",
                backgroundSize: "140px auto",
              }}
            >
              <div className="flex flex-row items-center justify-between bg-[#f6bebf] px-4 py-3">
                <span className="text-sm font-medium tracking-wide text-neutral-800">
                  {c.toUpperCase()}
                </span>
                <span className="text-xs text-neutral-700">
                  Ver produtos →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 flex w-full flex-row items-center justify-between bg-[#f8cdd0] px-16 py-12">
        <div className="flex flex-col">
          <h2 className="text-3xl font-normal text-neutral-800">
            5% OFF no Pix em toda a loja
          </h2>
          <p className="mt-3 text-sm text-neutral-700">
            O desconto já aparece no pagamento. Parcele no cartão em até 6x sem
            juros.
          </p>
        </div>
        <button
          type="button"
          className="h-12 rounded-full border-2 border-neutral-300 bg-white px-10 text-sm font-medium tracking-wide text-neutral-800"
        >
          {"Aproveitar".toUpperCase()}
        </button>
      </section>

      <section className="w-full px-16 pt-16">
        <div className="flex flex-row items-end justify-between">
          <h2 className="text-2xl font-normal tracking-[0.1em] text-neutral-800">
            {"Mais vendidos".toUpperCase()}
          </h2>
          <span className="cursor-pointer text-sm text-[#d89a9c] hover:text-[#98263e]">
            {"Ver tudo".toUpperCase()}
          </span>
        </div>
        <div className="mt-8 flex flex-row gap-8 overflow-x-auto pb-4">
          {maisVendidos.map((p) => (
            <ProductCard key={p.db_id} item={p} />
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col items-center px-16 py-20">
        <h2 className="text-3xl font-normal text-neutral-800">
          Ganhe 10% OFF na primeira compra
        </h2>
        <p className="mt-3 text-sm text-neutral-700">
          Cadastre seu e-mail e receba novidades e ofertas antes de todo mundo.
        </p>
        <div className="mt-8 flex flex-row gap-4">
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            className="h-12 w-80 rounded-full border border-[#f6bebf] bg-white px-5 text-sm text-neutral-800 outline-none"
          />
          <button
            type="button"
            className="h-12 rounded-full bg-[#f6bebf] px-8 text-sm font-medium tracking-wide text-neutral-800"
          >
            {"Cadastrar".toUpperCase()}
          </button>
        </div>
      </section>
    </div>
  );
}
