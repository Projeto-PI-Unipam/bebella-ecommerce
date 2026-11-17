import { ObjectId } from "bson";
import { type MouseEvent, useEffect, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { ReceiptIcon } from "@phosphor-icons/react/dist/csr/Receipt";
import { TShirtIcon } from "@phosphor-icons/react/dist/csr/TShirt";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { ImageSquareIcon } from "@phosphor-icons/react/dist/csr/ImageSquare";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import logo from "../assets/img/logo-horizontal-svg.svg";
import {
  bucket,
  type ClothesModel,
  type size,
  sizes,
  to_currency,
} from "../database/Schema.tsx";
import "../assets/fonts/fonts.css";

// Painel da loja. Por enquanto usa só as rotas de admin que já existem no
// worker: /admin/getproducts, /admin/products/new e /admin/products/update.
// Pedidos e conteúdo da home entram quando o back tiver as rotas deles.

const categorias = [
  "Vestidos",
  "Conjuntos",
  "Blazer",
  "Blusas",
  "Camisas",
  "Calças",
  "Bolsas",
];

interface ItemApi extends Omit<ClothesModel, "_id" | "db_id"> {
  _id: string;
}

function paraProduto(i: ItemApi): ClothesModel {
  return {
    ...i,
    _id: new ObjectId(i._id),
    db_id: i._id,
    size_data: i.size_data ?? [],
    pic_url: i.pic_url ?? [],
    dimensions: i.dimensions ?? [0, 0, 0],
    weight: i.weight ?? 0,
    in_stock: i.in_stock ?? 0,
  };
}

function urlFoto(nome?: string) {
  if (!nome) return undefined;
  if (/^(https?:|blob:|data:|\/)/.test(nome)) return nome;
  return `${bucket}/${nome}`;
}

async function chamarApi(
  caminho: string,
  metodo: "POST" | "PATCH",
  corpo: object,
) {
  const res = await fetch(caminho, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  if (res.status === 401)
    throw new Error("Sua conta não tem acesso ao painel.");
  if (!res.ok)
    throw new Error("Não foi possível falar com o servidor. Tente de novo.");
  return res.status === 204 ? null : res.json();
}

function Foto({
  src,
  tamanho = "h-12 w-12",
}: {
  src?: string;
  tamanho?: string;
}) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={`${tamanho} flex-none rounded-[10px] bg-[#e8d9cc]`}
      ></div>
    );
  }
  return (
    <img
      src={urlFoto(src)}
      alt=""
      className={`${tamanho} flex-none rounded-[10px] object-cover`}
    />
  );
}

function Cabecalho({
  titulo,
  sub,
  children,
}: {
  titulo: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="m-0! text-3xl! font-medium! font-[Prompt]! text-neutral-800! tracking-tight!">
          {titulo}
        </h1>
        <p className="m-0 text-[15px] text-[#6b6461]">{sub}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </header>
  );
}

const botaoPrincipal =
  "inline-flex h-11 items-center gap-2 rounded-full bg-[#98263e] px-5 text-sm font-medium text-white! no-underline hover:bg-[#7d1f33] cursor-pointer";
const botaoSecundario =
  "inline-flex h-11 items-center gap-2 rounded-full border border-[#f0d9d4] bg-white px-5 text-sm text-neutral-800! no-underline hover:bg-[#fdf1ee] cursor-pointer";
const cartao = "rounded-[18px] border border-[#f0d9d4] bg-white";
const campo =
  "box-border h-11 w-full rounded-xl border border-[#f0d9d4] bg-white px-4 text-[15px] text-neutral-800! outline-none focus-visible:border-[#98263e] focus-visible:ring-2 focus-visible:ring-[#98263e]/15";
const th =
  "whitespace-nowrap bg-[#fffaf8] px-5 py-3.5 text-left text-[13px] font-medium text-[#6b6461]";
const td = "border-t border-[#f6e6e2] px-5 py-3.5 text-sm";

function Filtros<T extends string>({
  opcoes,
  ativo,
  mudar,
}: {
  opcoes: { valor: T; texto: string; total: number }[];
  ativo: T;
  mudar: (v: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filtrar por estoque"
      className="flex flex-wrap gap-2"
    >
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={ativo === o.valor}
          onClick={() => mudar(o.valor)}
          className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm ${
            ativo === o.valor
              ? "border-neutral-800 bg-neutral-800 text-white!"
              : "border-[#f0d9d4] bg-white text-neutral-800!"
          }`}
        >
          {o.texto}
          <span className="text-xs">{o.total}</span>
        </button>
      ))}
    </div>
  );
}

function Busca({
  valor,
  mudar,
  placeholder,
}: {
  valor: string;
  mudar: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex h-11 min-w-0 flex-[1_1_220px] items-center gap-2.5 rounded-full border border-[#f0d9d4] bg-white px-4 text-[#6b6461] focus-within:border-[#98263e] focus-within:ring-2 focus-within:ring-[#98263e]/15">
      <MagnifyingGlassIcon size={18} />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={valor}
        onChange={(e) => mudar(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800! outline-none"
      />
    </label>
  );
}

function ItemMenu({
  para,
  icone,
  texto,
  contador,
  emBreve,
}: {
  para: string;
  icone: React.ReactNode;
  texto: string;
  contador?: number;
  emBreve?: boolean;
}) {
  return (
    <NavLink
      to={para}
      end={para === "/painel"}
      className={({ isActive }) =>
        `flex min-h-[46px] items-center gap-3 rounded-xl px-3.5 text-[15px] no-underline ${
          isActive
            ? "bg-[#f6bebf] font-medium text-neutral-800!"
            : "text-[#4a4542]! hover:bg-[#fdf1ee]"
        }`
      }
    >
      <span className="flex flex-none">{icone}</span>
      <span className="whitespace-nowrap">{texto}</span>
      {contador ? (
        <span className="ml-auto flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#98263e] px-1.5 text-xs font-medium text-white!">
          {contador}
        </span>
      ) : null}
      {emBreve ? (
        <span className="ml-auto whitespace-nowrap rounded-full bg-[#efece9] px-2 py-0.5 text-[11px] leading-4 text-[#6b6461]">
          em breve
        </span>
      ) : null}
    </NavLink>
  );
}

function Inicio({ produtos }: { produtos: ClothesModel[] }) {
  const estoqueBaixo = produtos.filter((p) => p.in_stock <= 3);
  const esgotados = produtos.filter((p) => p.in_stock === 0);
  const pecas = produtos.reduce((soma, p) => soma + p.in_stock, 0);

  const indicadores = [
    {
      texto: "Produtos cadastrados",
      valor: String(produtos.length),
      nota: "Total no catálogo",
      icone: <TShirtIcon size={18} />,
    },
    {
      texto: "Peças em estoque",
      valor: String(pecas),
      nota: "Somando todos os produtos",
      icone: <PackageIcon size={18} />,
    },
    {
      texto: "Estoque baixo",
      valor: String(estoqueBaixo.length),
      nota: "3 unidades ou menos",
      icone: <WarningIcon size={18} />,
    },
    {
      texto: "Esgotados",
      valor: String(esgotados.length),
      nota: "Sem nenhuma unidade",
      icone: <WarningIcon size={18} />,
    },
  ];

  return (
    <>
      <Cabecalho titulo="Olá, bem-vinda de volta" sub="Resumo da loja">
        <Link to="/painel/produtos" className={botaoSecundario}>
          Ver produtos
        </Link>
        <Link to="/painel/produtos/novo" className={botaoPrincipal}>
          <PlusIcon size={18} />
          Novo produto
        </Link>
      </Cabecalho>

      <section aria-label="Indicadores" className="flex flex-wrap gap-4">
        {indicadores.map((i) => (
          <div
            key={i.texto}
            className={`${cartao} flex flex-[1_1_220px] flex-col gap-2.5 px-6 py-5`}
          >
            <div className="flex items-center justify-between text-sm text-[#6b6461]">
              <span>{i.texto}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf1ee] text-[#98263e]!">
                {i.icone}
              </span>
            </div>
            <span className="text-3xl font-medium">{i.valor}</span>
            <span className="text-[13px] text-[#6b6461]">{i.nota}</span>
          </div>
        ))}
      </section>

      <section className={`${cartao} px-6 py-5`}>
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="m-0! text-lg! font-medium! font-[Prompt]! text-neutral-800!">
            Estoque baixo
          </h2>
          <Link
            to="/painel/produtos"
            className="text-sm text-[#98263e]! no-underline"
          >
            Repor estoque
          </Link>
        </div>
        <ul className="m-0 list-none p-0">
          {estoqueBaixo.length === 0 && (
            <li className="py-3 text-sm text-[#6b6461]">
              Nenhum produto com estoque baixo.
            </li>
          )}
          {estoqueBaixo.map((p) => (
            <li
              key={p.db_id}
              className="flex items-center gap-3.5 border-t border-[#f6e6e2] py-3"
            >
              <Foto src={p.pic_url?.[0]} tamanho="h-11 w-11" />
              <Link
                to={`/painel/produtos/${p.db_id}`}
                className="flex-1 text-sm font-medium text-neutral-800! no-underline"
              >
                {p.name}
              </Link>
              <span className="whitespace-nowrap text-sm font-medium text-[#8a2b2b]">
                {p.in_stock === 0 ? "Esgotado" : `${p.in_stock} un.`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

type FiltroEstoque = "Todos" | "Baixo" | "Esgotado";

function Produtos({ produtos }: { produtos: ClothesModel[] }) {
  const [filtro, setFiltro] = useState<FiltroEstoque>("Todos");
  const [busca, setBusca] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("Todas");

  const naFaixa = (p: ClothesModel, f: FiltroEstoque) =>
    f === "Todos" ||
    (f === "Baixo" && p.in_stock > 0 && p.in_stock <= 3) ||
    (f === "Esgotado" && p.in_stock === 0);

  const lista = produtos.filter(
    (p) =>
      naFaixa(p, filtro) &&
      (categoria === "Todas" || p.category === categoria) &&
      p.name.toLowerCase().includes(busca.toLowerCase()),
  );

  const contar = (f: FiltroEstoque) =>
    produtos.filter((p) => naFaixa(p, f)).length;

  return (
    <>
      <Cabecalho
        titulo="Produtos"
        sub="Cadastre, edite e controle o estoque das peças da loja"
      >
        <Link to="/painel/produtos/novo" className={botaoPrincipal}>
          <PlusIcon size={18} />
          Novo produto
        </Link>
      </Cabecalho>

      <section className={`${cartao} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-[#f0d9d4] px-5 py-4">
          <Filtros
            ativo={filtro}
            mudar={setFiltro}
            opcoes={[
              { valor: "Todos", texto: "Todos", total: produtos.length },
              {
                valor: "Baixo",
                texto: "Estoque baixo",
                total: contar("Baixo"),
              },
              {
                valor: "Esgotado",
                texto: "Esgotados",
                total: contar("Esgotado"),
              },
            ]}
          />
          <div className="flex flex-wrap gap-2.5">
            <Busca
              valor={busca}
              mudar={setBusca}
              placeholder="Buscar por nome"
            />
            <label className="flex items-center gap-2 text-sm text-[#6b6461]">
              Categoria
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="h-11 rounded-full border border-[#f0d9d4] bg-white px-3.5 text-sm text-neutral-800!"
              >
                <option>Todas</option>
                {categorias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th scope="col" className={th}>
                  Produto
                </th>
                <th scope="col" className={th}>
                  Categoria
                </th>
                <th scope="col" className={th}>
                  Tamanhos
                </th>
                <th scope="col" className={th}>
                  Preço
                </th>
                <th scope="col" className={th}>
                  Estoque
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className={`${td} py-10 text-center text-[#6b6461]`}
                  >
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
              {lista.map((p) => (
                <tr key={p.db_id}>
                  <td className={td}>
                    <div className="flex items-center gap-3.5">
                      <Foto src={p.pic_url?.[0]} />
                      <Link
                        to={`/painel/produtos/${p.db_id}`}
                        className="font-medium text-neutral-800! no-underline"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className={td}>{p.category}</td>
                  <td className={`${td} text-[#6b6461]`}>
                    {p.size_data.join(", ")}
                  </td>
                  <td className={`${td} tabular-nums`}>{to_currency(p.price)}</td>
                  <td
                    className={`${td} tabular-nums ${p.in_stock <= 3 ? "font-medium text-[#8a2b2b]" : ""}`}
                  >
                    {p.in_stock === 0 ? "Esgotado" : `${p.in_stock} un.`}
                  </td>
                  <td className={td}>
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/painel/produtos/${p.db_id}`}
                        aria-label={`Editar ${p.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-800! hover:bg-[#fdf1ee]"
                      >
                        <PencilSimpleIcon size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function ProdutoForm({
  produtos,
  salvar,
}: {
  produtos: ClothesModel[];
  salvar: (p: ClothesModel, novo: boolean) => Promise<void>;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const existente = produtos.find((p) => p.db_id === id);

  const [nome, setNome] = useState<string>(existente?.name ?? "");
  const [marca, setMarca] = useState<string>(existente?.brand ?? "Bebella");
  const [categoria, setCategoria] = useState<string>(
    existente?.category ?? categorias[0],
  );
  const [descricao, setDescricao] = useState<string>(
    existente?.description ?? "",
  );
  const [preco, setPreco] = useState<string>(
    existente ? existente.price.toFixed(2).replace(".", ",") : "",
  );
  const [estoque, setEstoque] = useState<string>(
    existente ? String(existente.in_stock) : "",
  );
  const [tamanhos, setTamanhos] = useState<size[]>(existente?.size_data ?? []);
  const [peso, setPeso] = useState<string>(
    existente ? String(existente.weight).replace(".", ",") : "",
  );
  const [medidas, setMedidas] = useState<string[]>(
    existente
      ? [0, 1, 2].map((i) => String(existente.dimensions[i] ?? "").replace(".", ","))
      : ["", "", ""],
  );
  const [fotos, setFotos] = useState<string[]>(existente?.pic_url ?? []);
  const [erro, setErro] = useState<string | null>(null);
  const [novaFoto, setNovaFoto] = useState<string>("");
  const [salvando, setSalvando] = useState<boolean>(false);

  // Guarda como o formulário abriu pra saber se tem alteração sem salvar.
  const retrato = JSON.stringify([
    nome,
    marca,
    categoria,
    descricao,
    preco,
    estoque,
    tamanhos,
    peso,
    medidas,
    fotos,
  ]);
  const [retratoInicial] = useState<string>(retrato);
  const alterado = retrato !== retratoInicial && !salvando;

  useEffect(() => {
    if (!alterado) return;
    const segurar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", segurar);
    return () => window.removeEventListener("beforeunload", segurar);
  }, [alterado]);

  function sairDoFormulario(e: MouseEvent) {
    if (
      alterado &&
      !window.confirm("Você tem alterações sem salvar. Sair mesmo assim?")
    )
      e.preventDefault();
  }

  function alternarTamanho(t: size) {
    setTamanhos(
      tamanhos.includes(t) ? tamanhos.filter((x) => x !== t) : [...tamanhos, t],
    );
  }

  function adicionarFoto() {
    const nomeFoto = novaFoto.trim();
    if (!nomeFoto || fotos.includes(nomeFoto)) return;
    setFotos([...fotos, nomeFoto]);
    setNovaFoto("");
  }

  async function enviar() {
    const precoNum = parseFloat(preco.replace(",", "."));
    const estoqueNum = parseInt(estoque);
    if (!nome.trim()) return setErro("Digite o nome do produto.");
    if (isNaN(precoNum) || precoNum <= 0)
      return setErro("Digite um preço válido.");
    if (isNaN(estoqueNum) || estoqueNum < 0)
      return setErro("Digite a quantidade em estoque.");
    if (tamanhos.length === 0) return setErro("Escolha pelo menos um tamanho.");
    setErro(null);
    setSalvando(true);
    const novoId = existente?._id ?? new ObjectId();
    try {
      await salvar(
        {
          _id: novoId,
          db_id: novoId.toString(),
          name: nome.trim(),
          brand: marca.trim(),
          category: categoria,
          size_data: sizes.filter((s) => tamanhos.includes(s)),
          description: descricao,
          in_stock: estoqueNum,
          pic_url: fotos,
          price: precoNum,
          dimensions: medidas.map((m) => parseFloat(m.replace(",", ".")) || 0),
          weight: parseFloat(peso.replace(",", ".")) || 0,
        },
        !existente,
      );
      navigate("/painel/produtos");
    } catch (e) {
      setErro((e as Error).message);
      setSalvando(false);
    }
  }

  const secao = `${cartao} flex flex-col gap-4 p-6`;
  const rotulo = "flex flex-col gap-2 text-sm font-medium";

  return (
    <>
      <Link
        to="/painel/produtos"
        onClick={sairDoFormulario}
        className="inline-flex items-center gap-2 self-start text-sm text-[#98263e]! no-underline"
      >
        <ArrowLeftIcon size={18} />
        Voltar para produtos
      </Link>
      <Cabecalho
        titulo={existente ? "Editar produto" : "Novo produto"}
        sub="Preencha as informações da peça e salve para publicar na loja"
      >
        {alterado ? (
          <span className="self-center text-[13px] text-[#8a5a00]">
            Alterações não salvas
          </span>
        ) : null}
        <Link
          to="/painel/produtos"
          onClick={sairDoFormulario}
          className={botaoSecundario}
        >
          Cancelar
        </Link>
        <button
          type="button"
          onClick={enviar}
          disabled={salvando}
          className={`${botaoPrincipal} disabled:opacity-60`}
        >
          <CheckIcon size={18} />
          {salvando ? "Salvando…" : "Salvar produto"}
        </button>
      </Cabecalho>

      {erro && (
        <p
          role="alert"
          className="m-0 rounded-xl bg-[#f7e1e1] px-4 py-3 text-sm text-[#8a2b2b]"
        >
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <section className={secao}>
            <h2 className="m-0! text-lg! font-medium! font-[Prompt]! text-neutral-800!">
              Informações
            </h2>
            <label className={rotulo}>
              Nome do produto
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={campo}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={rotulo}>
                Marca
                <input
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className={campo}
                />
              </label>
              <label className={rotulo}>
                Categoria
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={campo}
                >
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className={rotulo}>
              Descrição
              <textarea
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={`${campo} h-auto resize-y py-3 leading-relaxed`}
              />
            </label>
          </section>

          <section className={secao}>
            <div>
              <h2 className="m-0! text-lg! font-medium! font-[Prompt]! text-neutral-800!">
                Fotos
              </h2>
              <p className="mt-1 mb-0 text-[13px] text-[#6b6461]">
                Digite o nome do arquivo que está no CDN (ex.:
                vestido-linho.jpg). A primeira foto é a que aparece na vitrine.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {fotos.map((f, i) => (
                <div key={f} className="relative">
                  <img
                    src={urlFoto(f)}
                    alt={`Foto ${i + 1} do produto`}
                    className="block h-[120px] w-[120px] rounded-[14px] object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-0.5 text-xs font-medium">
                      Principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setFotos(fotos.filter((x) => x !== f))}
                    aria-label={`Remover foto ${i + 1}`}
                    className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <label className="flex min-w-0 flex-[1_1_260px] items-center gap-2.5 rounded-xl border border-[#f0d9d4] bg-white px-4 text-[#6b6461] focus-within:border-[#98263e] focus-within:ring-2 focus-within:ring-[#98263e]/15">
                <ImageSquareIcon size={20} />
                <span className="sr-only">Nome do arquivo da foto</span>
                <input
                  value={novaFoto}
                  onChange={(e) => setNovaFoto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") adicionarFoto();
                  }}
                  placeholder="nome-da-foto.jpg"
                  className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-neutral-800 outline-none"
                />
              </label>
              <button
                type="button"
                onClick={adicionarFoto}
                className={botaoSecundario}
              >
                <PlusIcon size={18} />
                Adicionar foto
              </button>
            </div>
          </section>

          <section className={secao}>
            <h2 className="m-0! text-lg! font-medium! font-[Prompt]! text-neutral-800!">
              Preço e estoque
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <label className={rotulo}>
                Preço (R$)
                <input
                  inputMode="decimal"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0,00"
                  className={campo}
                />
              </label>
              <label className={rotulo}>
                Quantidade em estoque
                <input
                  inputMode="numeric"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  className={campo}
                />
              </label>
            </div>
            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
              <legend className="mb-2.5 text-sm font-medium">
                Tamanhos disponíveis
              </legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <label
                    key={s}
                    className={`inline-flex h-11 min-w-14 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 text-sm ${tamanhos.includes(s) ? "border-[#f6bebf] bg-[#f6bebf] font-medium" : "border-[#f0d9d4] bg-white"}`}
                  >
                    <input
                      type="checkbox"
                      checked={tamanhos.includes(s)}
                      onChange={() => alternarTamanho(s)}
                      className="m-0 h-4 w-4 accent-[#98263e]"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className={secao}>
            <div>
              <h2 className="m-0! text-lg! font-medium! font-[Prompt]! text-neutral-800!">
                Envio
              </h2>
              <p className="mt-1 mb-0 text-[13px] text-[#6b6461]">
                Usado para calcular o frete
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <label className={rotulo}>
                Peso (kg)
                <input
                  inputMode="decimal"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  className={campo}
                />
              </label>
              {["Comprimento (cm)", "Largura (cm)", "Altura (cm)"].map(
                (r, i) => (
                  <label key={r} className={rotulo}>
                    {r}
                    <input
                      inputMode="decimal"
                      value={medidas[i]}
                      onChange={(e) =>
                        setMedidas(
                          medidas.map((m, j) => (j === i ? e.target.value : m)),
                        )
                      }
                      className={campo}
                    />
                  </label>
                ),
              )}
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <section className={secao}>
            <h2 className="m-0! text-lg! font-medium! font-[Prompt]! text-neutral-800!">
              Como vai aparecer na loja
            </h2>
            <div className="overflow-hidden rounded-2xl border border-[#f0d9d4] bg-rose-100">
              {fotos[0] ? (
                <img
                  src={urlFoto(fotos[0])}
                  alt=""
                  className="block h-[220px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[220px] items-center justify-center bg-[#e8d9cc] text-sm text-[#6b6461]">
                  Sem foto
                </div>
              )}
              <div className="flex flex-col gap-1 px-4 py-3.5">
                <span className="text-[15px] font-medium">
                  {nome || "Nome do produto"}
                </span>
                <span className="text-[15px]">
                  {to_currency(parseFloat(preco.replace(",", ".")) || 0)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function EmBreve({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <>
      <Cabecalho titulo={titulo} sub={texto} />
      <section
        className={`${cartao} flex flex-col items-start gap-3 px-6 py-8`}
      >
        <span className="rounded-full bg-[#efece9] px-3 py-1 text-[13px] text-[#4f4946]">
          Em breve
        </span>
        <p className="m-0 text-[15px] text-[#6b6461]">
          Essa parte do painel ainda está em desenvolvimento.
        </p>
        <Link to="/painel/produtos" className={botaoSecundario}>
          Ir para produtos
        </Link>
      </section>
    </>
  );
}

export default function AdminPage({ host }: { host: string | null }) {
  // O login salva o token com aspas. As rotas do back tiram as aspas antes de
  // validar, mas as de /admin não, então mandamos o token já limpo.
  const token = host ? host.replaceAll(/['"]/g, "") : null;
  const [produtos, setProdutos] = useState<ClothesModel[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function avisar(mensagem: string) {
    setAviso(mensagem);
    setTimeout(() => setAviso(null), 3000);
  }

  useEffect(() => {
    if (!token) return;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const dados = await chamarApi("/admin/getproducts", "POST", {
          auth_token: token,
        });
        setProdutos(((dados.total ?? []) as ItemApi[]).map(paraProduto));
      } catch (e) {
        setErro((e as Error).message);
      }
      setCarregando(false);
    }
    carregar();
  }, [token]);

  function corpoProduto(p: ClothesModel) {
    return {
      auth_token: token,
      name: p.name,
      brand: p.brand,
      category: p.category,
      size_data: p.size_data,
      in_stock: p.in_stock,
      price: p.price,
      description: p.description,
      pic_url: p.pic_url,
      dimensions: p.dimensions,
      weight: p.weight,
    };
  }

  async function salvarProduto(p: ClothesModel, novo: boolean) {
    if (novo) {
      const criado = await chamarApi(
        "/admin/products/new",
        "POST",
        corpoProduto(p),
      );
      setProdutos([paraProduto(criado as ItemApi), ...produtos]);
      avisar("Produto cadastrado");
    } else {
      await chamarApi("/admin/products/update", "PATCH", {
        ...corpoProduto(p),
        id: p.db_id,
      });
      setProdutos(produtos.map((x) => (x.db_id === p.db_id ? p : x)));
      avisar("Produto salvo");
    }
  }

  return (
    <div className="flex min-h-svh flex-wrap bg-[#fdf1ee] text-left font-[Prompt] text-neutral-800!">
      <nav
        aria-label="Menu do painel"
        className="box-border flex max-w-full flex-[1_1_220px] flex-col gap-1.5 border-r border-[#f0d9d4] bg-white px-4.5 py-7"
      >
        <Link to="/painel" className="block px-2.5 pb-1.5">
          <img src={logo} alt="Bebella Boutique" className="block w-[150px]" />
        </Link>
        <span className="px-3 pb-4 text-xs tracking-[0.12em] text-[#6b6461]">
          PAINEL DA LOJA
        </span>
        <ItemMenu
          para="/painel"
          icone={<HouseIcon size={20} />}
          texto="Início"
        />
        <ItemMenu
          para="/painel/pedidos"
          icone={<ReceiptIcon size={20} />}
          texto="Pedidos"
          emBreve
        />
        <ItemMenu
          para="/painel/produtos"
          icone={<TShirtIcon size={20} />}
          texto="Produtos"
        />
        <ItemMenu
          para="/painel/conteudo"
          icone={<ImageSquareIcon size={20} />}
          texto="Conteúdo"
          emBreve
        />
        <div className="min-h-8 flex-1"></div>
        <a
          href="/"
          className="flex min-h-[46px] items-center gap-3 rounded-xl px-3.5 text-[15px] text-[#4a4542]! no-underline hover:bg-[#fdf1ee]"
        >
          <ArrowSquareOutIcon size={20} />
          <span>Ver a loja</span>
        </a>
      </nav>

      <main className="box-border flex min-w-0 flex-[999_1_560px] flex-col gap-6 px-4 pt-7 pb-12 md:px-10 md:pt-9">
        {carregando && !erro && (
          <p className="m-0 text-[15px] text-[#6b6461]">
            Carregando dados da loja…
          </p>
        )}
        {erro && (
          <p
            role="alert"
            className="m-0 rounded-xl bg-[#f7e1e1] px-4 py-3 text-sm text-[#8a2b2b]"
          >
            {erro}
          </p>
        )}
        {!carregando && !erro && (
          <Routes>
            <Route index element={<Inicio produtos={produtos} />} />
            <Route
              path="produtos"
              element={<Produtos produtos={produtos} />}
            />
            <Route
              path="produtos/novo"
              element={
                <ProdutoForm
                  key="novo"
                  produtos={produtos}
                  salvar={salvarProduto}
                />
              }
            />
            <Route
              path="produtos/:id"
              element={
                <ProdutoForm produtos={produtos} salvar={salvarProduto} />
              }
            />
            <Route
              path="pedidos/*"
              element={
                <EmBreve
                  titulo="Pedidos"
                  texto="Acompanhe os pedidos e atualize o status de envio"
                />
              }
            />
            <Route
              path="conteudo"
              element={
                <EmBreve
                  titulo="Conteúdo da loja"
                  texto="Campanha, faixa de benefícios e banners da página inicial"
                />
              }
            />
            <Route path="*" element={<Navigate to="/painel" replace />} />
          </Routes>
        )}
      </main>

      {aviso && (
        <p
          role="status"
          className="fixed right-6 bottom-6 m-0 rounded-xl bg-neutral-800 px-5 py-3 text-sm text-white shadow-lg"
        >
          {aviso}
        </p>
      )}
    </div>
  );
}
