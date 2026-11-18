import { useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ObjectId } from "bson";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { ReceiptIcon } from "@phosphor-icons/react/dist/csr/Receipt";
import { TShirtIcon } from "@phosphor-icons/react/dist/csr/TShirt";
import { ImageSquareIcon } from "@phosphor-icons/react/dist/csr/ImageSquare";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { PrinterIcon } from "@phosphor-icons/react/dist/csr/Printer";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import logo from "../assets/img/logo-horizontal-svg.svg";
import "../assets/fonts/fonts.css";
import {
  type ClothesModel,
  type size,
  sizes,
  to_currency,
} from "../database/Schema.tsx";

type StatusProduto = "Ativo" | "Rascunho" | "Arquivado";

type StatusPedido =
  | "Aguardando pagamento"
  | "Pago"
  | "Separando"
  | "Enviado"
  | "Entregue"
  | "Cancelado";

interface Produto extends ClothesModel {
  status: StatusProduto;
}

interface ItemPedido {
  nome: string;
  tamanho: string;
  quantidade: number;
  preco: number;
  foto?: string;
}

interface Pedido {
  id: string;
  numero: string;
  cliente: { nome: string; email: string; telefone: string };
  endereco: { rua: string; complemento: string; cidade: string; cep: string };
  data: Date;
  itens: ItemPedido[];
  frete: number;
  pagamento: string;
  parcelas: number;
  status: StatusPedido;
  rastreio: string;
}

interface ConteudoHome {
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

const categorias = [
  "Vestidos",
  "Conjuntos",
  "Blazer",
  "Blusas",
  "Camisas",
  "Calças",
  "Bolsas",
];

const produtosTeste: Produto[] = [
  {
    _id: new ObjectId("6aeb95eeba574bd5f0a81d41"),
    db_id: "6aeb95eeba574bd5f0a81d41",
    name: "Vestido Linho Marrante Branco",
    brand: "Bebella",
    category: "Vestidos",
    size_data: ["P", "M", "G"],
    description: "Vestido Linho Marrante, na cor branca.",
    in_stock: 8,
    price: 99.9,
    pic_url: [],
    dimensions: [30, 25, 5],
    weight: 0.4,
    status: "Ativo",
  },
];

const pedidosTeste: Pedido[] = [
  {
    id: "1048",
    numero: "1048",
    cliente: {
      nome: "Augusto",
      email: "augusto@unipam.edu.br",
      telefone: "(34) 99812-4410",
    },
    endereco: {
      rua: "Rua Cleide Lina Machado",
      complemento: "",
      cidade: "Patos de Minas, MG",
      cep: "38700-000",
    },
    data: new Date(),
    itens: [
      {
        nome: "Vestido Linho Marrante Branco",
        tamanho: "M",
        quantidade: 1,
        preco: 99.9,
      },
    ],
    frete: 18.5,
    pagamento: "Pix",
    parcelas: 1,
    status: "Pago",
    rastreio: "",
  },
];

const conteudoTeste: ConteudoHome = {
  show_campaign: true,
  campaign: {
    tag: "COLEÇÃO PRIMAVERA 2026",
    title: "Leveza para os dias de sol",
    text: "Vestidos e conjuntos em linho para usar do dia à noite.",
    button: "VER COLEÇÃO",
    link: "/category?s=Vestidos",
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
    link: "/category?s=Vestidos",
  },
  newsletter: {
    title: "Ganhe 10% OFF na primeira compra",
    text: "Cadastre seu e-mail e receba novidades e ofertas antes de todo mundo.",
  },
};

const etapasPedido: StatusPedido[] = [
  "Aguardando pagamento",
  "Pago",
  "Separando",
  "Enviado",
  "Entregue",
];

const corStatus: Record<StatusProduto | StatusPedido, string> = {
  Ativo: "#2f8a52",
  Rascunho: "#a8a29e",
  Arquivado: "#d4d0cd",
  "Aguardando pagamento": "#a8a29e",
  Pago: "#d99a00",
  Separando: "#d99a00",
  Enviado: "#3b82c4",
  Entregue: "#2f8a52",
  Cancelado: "#d4d0cd",
};

function totalPedido(p: Pedido) {
  return (
    p.itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0) + p.frete
  );
}

function dataCurta(d: Date) {
  return (
    d.toLocaleDateString("pt-BR") +
    ", " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

const foco =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900";
const botaoPrincipal = `inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#f6bebf] px-4 text-[13px] font-medium tracking-[0.06em] text-neutral-900! uppercase no-underline hover:bg-[#f0aeb0] disabled:cursor-default disabled:opacity-60 ${foco}`;
const botaoSecundario = `inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#cfcac7] bg-white px-4 text-[13px] font-medium tracking-[0.06em] text-neutral-900! uppercase no-underline hover:bg-[#f5f4f3] disabled:cursor-default disabled:opacity-60 ${foco}`;
const cartao = "rounded-lg border border-[#e2dedb] bg-white";
const campo =
  "box-border h-10 w-full rounded-md border border-[#cfcac7] bg-white px-3 text-sm text-neutral-900! outline-none focus-visible:border-neutral-900 focus-visible:ring-1 focus-visible:ring-neutral-900";
const th =
  "whitespace-nowrap bg-[#faf9f8] px-4 py-2.5 text-left text-xs font-medium tracking-[0.06em] text-[#6b6b6b] uppercase";
const td = "border-t border-[#edeae8] px-4 py-3 text-sm whitespace-nowrap";
const titulo2 =
  "m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!";
const linkVoltar =
  "inline-flex items-center gap-2 self-start text-sm text-[#98263e]! no-underline";

function Status({ texto }: { texto: StatusProduto | StatusPedido }) {
  const apagado = texto === "Arquivado" || texto === "Cancelado";
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm whitespace-nowrap ${apagado ? "text-[#8a8a8a]" : "text-neutral-900"}`}
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 flex-none rounded-full"
        style={{ background: corStatus[texto] }}
      ></span>
      {texto}
    </span>
  );
}

function Foto({
  src,
  tamanho = "h-12 w-12",
}: {
  src?: string;
  tamanho?: string;
}) {
  if (!src)
    return (
      <div
        aria-hidden="true"
        className={`${tamanho} flex-none rounded bg-[#edeae8]`}
      ></div>
    );
  return (
    <img
      src={src}
      alt=""
      className={`${tamanho} flex-none rounded object-cover`}
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
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0! font-[Prompt]! text-2xl! font-medium! tracking-normal! text-neutral-900!">
          {titulo}
        </h1>
        <p className="m-0 text-sm text-[#6b6b6b]">{sub}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </header>
  );
}

function Abas({
  opcoes,
  ativo,
  mudar,
}: {
  opcoes: { valor: string; texto: string; total: number }[];
  ativo: string;
  mudar: (v: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filtrar por status"
      className="flex flex-wrap gap-x-6 border-b border-[#e2dedb]"
    >
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={ativo === o.valor}
          onClick={() => mudar(o.valor)}
          className={`-mb-px cursor-pointer border-b-2 pt-1 pb-2.5 text-sm ${foco} ${
            ativo === o.valor
              ? "border-neutral-900 font-medium text-neutral-900!"
              : "border-transparent text-[#6b6b6b]! hover:text-neutral-900!"
          }`}
        >
          {o.texto}
          <span className="ml-1.5 text-xs text-[#8a8a8a] tabular-nums">
            {o.total}
          </span>
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
    <label className="flex h-10 min-w-0 flex-[1_1_220px] items-center gap-2 rounded-md border border-[#cfcac7] bg-white px-3 text-[#6b6b6b] focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900">
      <MagnifyingGlassIcon size={16} aria-hidden="true" />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={valor}
        onChange={(e) => mudar(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900! outline-none"
      />
    </label>
  );
}

function ItemMenu({
  para,
  icone,
  texto,
  contador,
}: {
  para: string;
  icone: React.ReactNode;
  texto: string;
  contador?: number;
}) {
  return (
    <NavLink
      to={para}
      end={para === "/painel"}
      className={({ isActive }) =>
        `flex min-h-10 items-center gap-3 rounded-md px-3 text-sm no-underline ${foco} ${
          isActive
            ? "bg-[#f6bebf]/55 font-medium text-neutral-900!"
            : "text-[#3d3d3d]! hover:bg-[#f5f4f3]"
        }`
      }
    >
      <span className="flex flex-none">{icone}</span>
      <span className="whitespace-nowrap">{texto}</span>
      {contador ? (
        <span className="ml-auto rounded bg-neutral-900 px-1.5 py-px text-xs font-medium text-white! tabular-nums">
          {contador}
        </span>
      ) : null}
    </NavLink>
  );
}

function Inicio({
  produtos,
  pedidos,
}: {
  produtos: Produto[];
  pedidos: Pedido[];
}) {
  const ativos = produtos.filter((p) => p.status === "Ativo");
  const estoqueBaixo = ativos.filter((p) => p.in_stock <= 3);
  const agora = new Date();
  const pagos = pedidos.filter(
    (p) =>
      p.status !== "Cancelado" &&
      p.status !== "Aguardando pagamento" &&
      p.data.getMonth() === agora.getMonth() &&
      p.data.getFullYear() === agora.getFullYear(),
  );
  const vendas = pagos.reduce((soma, p) => soma + totalPedido(p), 0);
  const aEnviar = pedidos.filter(
    (p) => p.status === "Pago" || p.status === "Separando",
  );

  const indicadores = [
    {
      texto: "Vendas no mês",
      valor: to_currency(vendas),
      nota: `${pagos.length} pedidos pagos`,
    },
    {
      texto: "Pedidos a enviar",
      valor: String(aEnviar.length),
      nota: "Pagos e aguardando envio",
    },
    {
      texto: "Estoque baixo",
      valor: String(estoqueBaixo.length),
      nota: "3 unidades ou menos",
    },
    {
      texto: "Produtos ativos",
      valor: String(ativos.length),
      nota: "Visíveis na loja",
    },
  ];

  return (
    <>
      <Cabecalho titulo="Início" sub="Resumo da loja">
        <Link to="/painel/pedidos" className={botaoSecundario}>
          Ver pedidos
        </Link>
        <Link to="/painel/produtos/novo" className={botaoPrincipal}>
          <PlusIcon size={16} aria-hidden="true" />
          Novo produto
        </Link>
      </Cabecalho>

      <section
        aria-label="Indicadores"
        className={`${cartao} grid grid-cols-2 lg:grid-cols-4`}
      >
        {indicadores.map((i, n) => (
          <div
            key={i.texto}
            className={`flex flex-col gap-1 px-5 py-4 ${n > 0 ? "border-l border-[#edeae8]" : ""} ${n > 1 ? "max-lg:border-t" : ""} ${n === 2 ? "max-lg:border-l-0" : ""}`}
          >
            <span className="text-[13px] text-[#6b6b6b]">{i.texto}</span>
            <span className="text-2xl font-medium tabular-nums">{i.valor}</span>
            <span className="text-xs text-[#8a8a8a]">{i.nota}</span>
          </div>
        ))}
      </section>

      <section className={`${cartao} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3.5">
          <h2 className={titulo2}>Pedidos recentes</h2>
          <Link
            to="/painel/pedidos"
            className="inline-flex items-center gap-1 text-sm text-[#98263e]! no-underline"
          >
            Ver todos
            <CaretRightIcon size={16} />
          </Link>
        </div>
        {pedidos.length === 0 ? (
          <p className="m-0 border-t border-[#edeae8] px-4 py-3.5 text-sm text-[#6b6b6b]">
            Nenhum pedido ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={th}>
                    Pedido
                  </th>
                  <th scope="col" className={th}>
                    Cliente
                  </th>
                  <th scope="col" className={th}>
                    Data
                  </th>
                  <th scope="col" className={th}>
                    Total
                  </th>
                  <th scope="col" className={th}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedidos.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td className={td}>
                      <Link
                        to={`/painel/pedidos/${p.id}`}
                        className="font-medium text-[#98263e]! no-underline"
                      >
                        #{p.numero}
                      </Link>
                    </td>
                    <td className={td}>{p.cliente.nome}</td>
                    <td className={`${td} text-[#6b6b6b]`}>
                      {dataCurta(p.data)}
                    </td>
                    <td className={`${td} tabular-nums`}>
                      {to_currency(totalPedido(p))}
                    </td>
                    <td className={td}>
                      <Status texto={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={`${cartao} px-4 py-4`}>
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className={titulo2}>Estoque baixo</h2>
          <Link
            to="/painel/produtos"
            className="text-sm text-[#98263e]! no-underline"
          >
            Repor estoque
          </Link>
        </div>
        <ul className="m-0 list-none p-0">
          {estoqueBaixo.length === 0 && (
            <li className="py-3 text-sm text-[#6b6b6b]">
              Nenhum produto com estoque baixo.
            </li>
          )}
          {estoqueBaixo.map((p) => (
            <li
              key={p.db_id}
              className="flex items-center gap-3.5 border-t border-[#edeae8] py-3"
            >
              <Foto src={p.pic_url?.[0]} tamanho="h-11 w-11" />
              <Link
                to={`/painel/produtos/${p.db_id}`}
                className="flex-1 text-sm font-medium text-neutral-900! no-underline"
              >
                {p.name}
              </Link>
              <span className="text-sm font-medium whitespace-nowrap text-[#a3261f]">
                {p.in_stock === 0 ? "Esgotado" : `${p.in_stock} un.`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Produtos({
  produtos,
  arquivar,
}: {
  produtos: Produto[];
  arquivar: (id: string) => void;
}) {
  const [filtro, setFiltro] = useState<string>("Todos");
  const [busca, setBusca] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("Todas");

  const lista = produtos.filter(
    (p) =>
      (filtro === "Todos" || p.status === filtro) &&
      (categoria === "Todas" || p.category === categoria) &&
      p.name.toLowerCase().includes(busca.toLowerCase()),
  );
  const contar = (s: StatusProduto) =>
    produtos.filter((p) => p.status === s).length;

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
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-[#e2dedb] px-5 py-4">
          <Abas
            ativo={filtro}
            mudar={setFiltro}
            opcoes={[
              { valor: "Todos", texto: "Todos", total: produtos.length },
              { valor: "Ativo", texto: "Ativos", total: contar("Ativo") },
              {
                valor: "Rascunho",
                texto: "Rascunho",
                total: contar("Rascunho"),
              },
              {
                valor: "Arquivado",
                texto: "Arquivados",
                total: contar("Arquivado"),
              },
            ]}
          />
          <div className="flex flex-wrap gap-2.5">
            <Busca
              valor={busca}
              mudar={setBusca}
              placeholder="Buscar por nome"
            />
            <label className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              Categoria
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={`h-10 rounded-md border border-[#cfcac7] bg-white px-3 text-sm text-neutral-900! ${foco}`}
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
          <table className="w-full min-w-[880px] border-collapse">
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
                <th scope="col" className={th}>
                  Status
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
                    colSpan={7}
                    className={`${td} py-10 text-center text-[#6b6b6b]`}
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
                        className="font-medium whitespace-normal text-neutral-900! no-underline"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className={td}>{p.category}</td>
                  <td className={`${td} text-[#6b6b6b]`}>
                    {p.size_data.join(", ")}
                  </td>
                  <td className={`${td} tabular-nums`}>
                    {to_currency(p.price)}
                  </td>
                  <td
                    className={`${td} ${p.in_stock <= 3 ? "font-medium text-[#a3261f]" : ""}`}
                  >
                    {p.in_stock === 0 ? "Esgotado" : `${p.in_stock} un.`}
                  </td>
                  <td className={td}>
                    <Status texto={p.status} />
                  </td>
                  <td className={td}>
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/painel/produtos/${p.db_id}`}
                        aria-label={`Editar ${p.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-900! hover:bg-[#f5f4f3]"
                      >
                        <PencilSimpleIcon size={18} />
                      </Link>
                      {p.status !== "Arquivado" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Arquivar "${p.name}"? Ele sai da loja.`,
                              )
                            )
                              arquivar(p.db_id);
                          }}
                          aria-label={`Arquivar ${p.name}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-neutral-900! hover:bg-[#f5f4f3]"
                        >
                          <ArchiveIcon size={18} />
                        </button>
                      )}
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
  produtos: Produto[];
  salvar: (p: Produto, novo: boolean) => void;
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
      ? [0, 1, 2].map((i) =>
          String(existente.dimensions[i] ?? "").replace(".", ","),
        )
      : ["", "", ""],
  );
  const [fotos, setFotos] = useState<string[]>(existente?.pic_url ?? []);
  const [status, setStatus] = useState<StatusProduto>(
    existente?.status ?? "Ativo",
  );
  const [erro, setErro] = useState<string | null>(null);
  const campoArquivo = useRef<HTMLInputElement>(null);

  function escolherFotos(arquivos: FileList | null) {
    if (!arquivos) return;
    const novas = Array.from(arquivos).map((a) => URL.createObjectURL(a));
    setFotos([...fotos, ...novas]);
    if (campoArquivo.current) campoArquivo.current.value = "";
  }

  function alternarTamanho(t: size) {
    setTamanhos(
      tamanhos.includes(t) ? tamanhos.filter((x) => x !== t) : [...tamanhos, t],
    );
  }

  function enviar() {
    const precoNum = parseFloat(preco.replace(",", "."));
    const estoqueNum = parseInt(estoque);
    if (!nome.trim()) return setErro("Digite o nome do produto.");
    if (isNaN(precoNum) || precoNum <= 0)
      return setErro("Digite um preço válido.");
    if (isNaN(estoqueNum) || estoqueNum < 0)
      return setErro("Digite a quantidade em estoque.");
    if (tamanhos.length === 0) return setErro("Escolha pelo menos um tamanho.");
    const novoId = existente?._id ?? new ObjectId();
    salvar(
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
        status: status,
      },
      !existente,
    );
    navigate("/painel/produtos");
  }

  const secao = `${cartao} flex flex-col gap-4 p-5`;
  const rotulo = "flex flex-col gap-2 text-sm font-medium";
  const opcoesStatus: { s: StatusProduto; desc: string }[] = [
    { s: "Ativo", desc: "Aparece na loja para as clientes" },
    { s: "Rascunho", desc: "Salvo, mas escondido da loja" },
    { s: "Arquivado", desc: "Fora da loja, mantido no histórico" },
  ];

  return (
    <>
      <Link to="/painel/produtos" className={linkVoltar}>
        <ArrowLeftIcon size={18} />
        Voltar para produtos
      </Link>
      <Cabecalho
        titulo={existente ? "Editar produto" : "Novo produto"}
        sub="Preencha as informações da peça e salve para publicar na loja"
      >
        <Link to="/painel/produtos" className={botaoSecundario}>
          Cancelar
        </Link>
        <button type="button" onClick={enviar} className={botaoPrincipal}>
          <CheckIcon size={18} />
          Salvar produto
        </button>
      </Cabecalho>

      {erro && (
        <p
          role="alert"
          className="m-0 rounded-md bg-[#fcebea] px-4 py-3 text-sm text-[#a3261f]"
        >
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <section className={secao}>
            <h2 className={titulo2}>Informações</h2>
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
              <h2 className={titulo2}>Fotos</h2>
              <p className="mt-1 mb-0 text-[13px] text-[#6b6b6b]">
                A primeira foto é a que aparece na vitrine.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {fotos.map((f, i) => (
                <div key={f} className="relative">
                  <img
                    src={f}
                    alt={`Foto ${i + 1} do produto`}
                    className="block h-[120px] w-[120px] rounded-md object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-white px-1.5 py-px text-[11px] font-medium">
                      Principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setFotos(fotos.filter((x) => x !== f))}
                    aria-label={`Remover foto ${i + 1}`}
                    className="absolute top-1.5 right-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-white text-sm hover:bg-[#f5f4f3]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <label className={`${botaoPrincipal} cursor-pointer self-start`}>
              <UploadSimpleIcon size={18} aria-hidden="true" />
              Enviar fotos
              <input
                ref={campoArquivo}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => escolherFotos(e.target.files)}
              />
            </label>
          </section>

          <section className={secao}>
            <h2 className={titulo2}>Preço e estoque</h2>
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
                    className={`inline-flex h-10 min-w-14 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-sm ${tamanhos.includes(s) ? "border-neutral-900 font-medium" : "border-[#cfcac7] bg-white"}`}
                  >
                    <input
                      type="checkbox"
                      checked={tamanhos.includes(s)}
                      onChange={() => alternarTamanho(s)}
                      className="m-0 h-4 w-4 accent-neutral-900"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className={secao}>
            <div>
              <h2 className={titulo2}>Envio</h2>
              <p className="mt-1 mb-0 text-[13px] text-[#6b6b6b]">
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
            <h2 className={titulo2}>Status</h2>
            {opcoesStatus.map(({ s, desc }) => (
              <label
                key={s}
                className={`flex cursor-pointer gap-3 rounded-md border px-3.5 py-3 ${status === s ? "border-neutral-900" : "border-[#e2dedb] bg-white"}`}
              >
                <input
                  type="radio"
                  name="status"
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="mt-0.5 h-[18px] w-[18px] accent-neutral-900"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{s}</span>
                  <span className="text-[13px] text-[#6b6b6b]">{desc}</span>
                </span>
              </label>
            ))}
          </section>

          <section className={secao}>
            <h2 className={titulo2}>Como vai aparecer na loja</h2>
            <div className="overflow-hidden rounded-2xl border border-[#e2dedb] bg-rose-100">
              {fotos[0] ? (
                <img
                  src={fotos[0]}
                  alt=""
                  className="block h-[220px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[220px] items-center justify-center bg-[#edeae8] text-sm text-[#6b6b6b]">
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

function Pedidos({ pedidos }: { pedidos: Pedido[] }) {
  const [filtro, setFiltro] = useState<string>("Todos");
  const [busca, setBusca] = useState<string>("");

  const grupos: Record<string, StatusPedido[]> = {
    Todos: etapasPedido.concat("Cancelado"),
    "A enviar": ["Pago", "Separando"],
    Enviados: ["Enviado"],
    Concluídos: ["Entregue"],
    Cancelados: ["Cancelado"],
  };

  const lista = pedidos.filter(
    (p) =>
      grupos[filtro].includes(p.status) &&
      (p.numero.includes(busca) ||
        p.cliente.nome.toLowerCase().includes(busca.toLowerCase())),
  );

  const resumo: [string, StatusPedido][] = [
    ["Aguardando pagamento", "Aguardando pagamento"],
    ["Pagos, para separar", "Pago"],
    ["Em separação", "Separando"],
    ["Enviados", "Enviado"],
  ];

  return (
    <>
      <Cabecalho
        titulo="Pedidos"
        sub="Acompanhe as vendas e atualize o andamento de cada pedido"
      />

      <section
        aria-label="Resumo por etapa"
        className={`${cartao} grid grid-cols-2 lg:grid-cols-4`}
      >
        {resumo.map(([texto, status], n) => (
          <div
            key={texto}
            className={`flex flex-col gap-1 px-5 py-4 ${n > 0 ? "border-l border-[#edeae8]" : ""} ${n > 1 ? "max-lg:border-t" : ""} ${n === 2 ? "max-lg:border-l-0" : ""}`}
          >
            <span className="text-[13px] text-[#6b6b6b]">{texto}</span>
            <span className="text-2xl font-medium tabular-nums">
              {pedidos.filter((p) => p.status === status).length}
            </span>
          </div>
        ))}
      </section>

      <section className={`${cartao} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-[#e2dedb] px-5 py-4">
          <Abas
            ativo={filtro}
            mudar={setFiltro}
            opcoes={Object.keys(grupos).map((g) => ({
              valor: g,
              texto: g,
              total: pedidos.filter((p) => grupos[g].includes(p.status)).length,
            }))}
          />
          <Busca
            valor={busca}
            mudar={setBusca}
            placeholder="Número do pedido ou cliente"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr>
                <th scope="col" className={th}>
                  Pedido
                </th>
                <th scope="col" className={th}>
                  Cliente
                </th>
                <th scope="col" className={th}>
                  Data
                </th>
                <th scope="col" className={th}>
                  Itens
                </th>
                <th scope="col" className={th}>
                  Total
                </th>
                <th scope="col" className={th}>
                  Pagamento
                </th>
                <th scope="col" className={th}>
                  Status
                </th>
                <th scope="col" className={th}>
                  <span className="sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className={`${td} py-10 text-center text-[#6b6b6b]`}
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
              {lista.map((p) => {
                const qtd = p.itens.reduce((s, i) => s + i.quantidade, 0);
                return (
                  <tr key={p.id}>
                    <td className={td}>
                      <Link
                        to={`/painel/pedidos/${p.id}`}
                        className="font-medium text-[#98263e]! no-underline"
                      >
                        #{p.numero}
                      </Link>
                    </td>
                    <td className={td}>{p.cliente.nome}</td>
                    <td className={`${td} text-[#6b6b6b]`}>
                      {p.data.toLocaleDateString("pt-BR")}
                    </td>
                    <td className={`${td} text-[#6b6b6b]`}>
                      {qtd} {qtd === 1 ? "item" : "itens"}
                    </td>
                    <td className={`${td} tabular-nums`}>
                      {to_currency(totalPedido(p))}
                    </td>
                    <td className={`${td} text-[#6b6b6b]`}>
                      {p.pagamento}
                      {p.parcelas > 1 ? ` ${p.parcelas}x` : ""}
                    </td>
                    <td className={td}>
                      <Status texto={p.status} />
                    </td>
                    <td className={`${td} text-right`}>
                      <Link
                        to={`/painel/pedidos/${p.id}`}
                        aria-label={`Abrir pedido ${p.numero}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-900! hover:bg-[#f5f4f3]"
                      >
                        <CaretRightIcon size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function PedidoDetalhe({
  pedidos,
  atualizar,
}: {
  pedidos: Pedido[];
  atualizar: (p: Pedido) => void;
}) {
  const { id } = useParams();
  const pedido = pedidos.find((p) => p.id === id);
  const [status, setStatus] = useState<StatusPedido>(pedido?.status ?? "Pago");
  const [rastreio, setRastreio] = useState<string>(pedido?.rastreio ?? "");

  if (!pedido) {
    return (
      <>
        <Link to="/painel/pedidos" className={linkVoltar}>
          <ArrowLeftIcon size={18} />
          Voltar para pedidos
        </Link>
        <p className="text-[15px] text-[#6b6b6b]">Pedido não encontrado.</p>
      </>
    );
  }

  const atual = etapasPedido.indexOf(pedido.status);
  const total = totalPedido(pedido);

  const salvar = () => {
    if (
      status === "Cancelado" &&
      pedido.status !== "Cancelado" &&
      !window.confirm(`Cancelar o pedido #${pedido.numero}?`)
    )
      return;
    atualizar({ ...pedido, status: status, rastreio: rastreio.trim() });
  };

  const blocos: [string, string[]][] = [
    [
      "CLIENTE",
      [pedido.cliente.nome, pedido.cliente.email, pedido.cliente.telefone],
    ],
    [
      "ENDEREÇO DE ENTREGA",
      [
        pedido.endereco.rua,
        pedido.endereco.complemento,
        pedido.endereco.cidade,
        `CEP ${pedido.endereco.cep}`,
      ].filter(Boolean),
    ],
    [
      "PAGAMENTO",
      [
        pedido.pagamento,
        pedido.parcelas > 1
          ? `${pedido.parcelas}x de ${to_currency(total / pedido.parcelas)}`
          : "",
      ].filter(Boolean),
    ],
  ];

  return (
    <>
      <Link to="/painel/pedidos" className={linkVoltar}>
        <ArrowLeftIcon size={18} />
        Voltar para pedidos
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0! font-[Prompt]! text-2xl! font-medium! tracking-normal! text-neutral-900!">
              Pedido #{pedido.numero}
            </h1>
            <Status texto={pedido.status} />
          </div>
          <p className="m-0 text-[15px] text-[#6b6b6b]">
            Feito em {dataCurta(pedido.data)} · {pedido.pagamento}
            {pedido.parcelas > 1 ? ` em ${pedido.parcelas}x` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className={botaoSecundario}
        >
          <PrinterIcon size={18} />
          Imprimir
        </button>
      </header>

      {pedido.status !== "Cancelado" && (
        <section className={`${cartao} p-5`}>
          <h2 className={`${titulo2} mb-4!`}>Andamento</h2>
          <ol className="m-0 flex list-none flex-wrap gap-4 p-0">
            {etapasPedido.map((e, i) => (
              <li
                key={e}
                className="flex flex-[1_1_120px] flex-col items-start gap-2.5"
              >
                {i < atual || (i === atual && e === "Entregue") ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white!">
                    <CheckIcon size={13} weight="bold" aria-hidden="true" />
                  </span>
                ) : i === atual ? (
                  <span className="box-border h-6 w-6 rounded-full border-2 border-neutral-900 bg-[#f6bebf]"></span>
                ) : (
                  <span className="box-border h-6 w-6 rounded-full border-2 border-[#cfcac7] bg-white"></span>
                )}
                <span
                  className={`text-sm ${i <= atual ? "font-medium" : "text-[#6b6b6b]"}`}
                >
                  {e}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <section className={`${cartao} min-w-0 flex-[999_1_480px] p-5`}>
          <h2 className={`${titulo2} mb-1.5!`}>Itens do pedido</h2>
          <ul className="m-0 list-none p-0">
            {pedido.itens.map((i) => (
              <li
                key={i.nome + i.tamanho}
                className="flex items-center gap-4 border-t border-[#edeae8] py-3.5"
              >
                <Foto src={i.foto} tamanho="h-16 w-16" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-medium">{i.nome}</span>
                  <span className="text-[13px] text-[#6b6b6b]">
                    Tam. {i.tamanho} · {i.quantidade} un.
                  </span>
                </div>
                <span className="text-[15px] whitespace-nowrap">
                  {to_currency(i.preco * i.quantidade)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 mb-0 grid grid-cols-[minmax(0,1fr)_auto] gap-y-2 border-t border-[#e2dedb] pt-3.5 text-sm">
            <dt className="text-[#6b6b6b]">Subtotal</dt>
            <dd className="m-0 text-right">
              {to_currency(total - pedido.frete)}
            </dd>
            <dt className="text-[#6b6b6b]">Frete</dt>
            <dd className="m-0 text-right">
              {pedido.frete === 0 ? "Grátis" : to_currency(pedido.frete)}
            </dd>
            <dt className="pt-1.5 text-base font-medium">Total</dt>
            <dd className="m-0 pt-1.5 text-right text-base font-medium">
              {to_currency(total)}
            </dd>
          </dl>
        </section>

        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
          <section className={`${cartao} flex flex-col gap-4 p-5`}>
            <h2 className={titulo2}>Atualizar pedido</h2>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusPedido)}
                className={campo}
              >
                {etapasPedido.concat("Cancelado").map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Código de rastreio
              <input
                value={rastreio}
                onChange={(e) => setRastreio(e.target.value)}
                placeholder="Ex.: AA123456789BR"
                className={campo}
              />
            </label>
            <button type="button" onClick={salvar} className={botaoPrincipal}>
              <CheckIcon size={18} />
              Salvar alterações
            </button>
          </section>

          <section className={`${cartao} px-4 py-1`}>
            {blocos.map(([titulo, linhas]) => (
              <div
                key={titulo}
                className="flex flex-col gap-1 border-t border-[#edeae8] py-4 first:border-t-0"
              >
                <span className="text-xs tracking-[0.08em] text-[#6b6b6b]">
                  {titulo}
                </span>
                {linhas.map((l, i) => (
                  <span
                    key={l}
                    className={`text-sm ${i === 0 ? "font-medium" : "text-[#6b6b6b]"}`}
                  >
                    {l}
                  </span>
                ))}
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}

function ConteudoLoja({
  conteudo,
  publicar,
}: {
  conteudo: ConteudoHome;
  publicar: (c: ConteudoHome) => void;
}) {
  const [rascunho, setRascunho] = useState<ConteudoHome>(conteudo);

  function mudarCampanha(campo: keyof ConteudoHome["campaign"], valor: string) {
    setRascunho({
      ...rascunho,
      campaign: { ...rascunho.campaign, [campo]: valor },
    });
  }
  function mudarBanner(campo: keyof ConteudoHome["banner"], valor: string) {
    setRascunho({
      ...rascunho,
      banner: { ...rascunho.banner, [campo]: valor },
    });
  }
  function mudarNewsletter(
    campo: keyof ConteudoHome["newsletter"],
    valor: string,
  ) {
    setRascunho({
      ...rascunho,
      newsletter: { ...rascunho.newsletter, [campo]: valor },
    });
  }
  function mudarBeneficio(
    i: number,
    campo: "highlight" | "text",
    valor: string,
  ) {
    setRascunho({
      ...rascunho,
      benefits: rascunho.benefits.map((b, j) =>
        j === i ? { ...b, [campo]: valor } : b,
      ),
    });
  }

  const secao = `${cartao} flex flex-col gap-4 p-5`;
  const rotulo = "flex min-w-0 flex-col gap-2 text-sm font-medium";
  const c = rascunho.campaign;

  return (
    <>
      <Cabecalho
        titulo="Conteúdo da loja"
        sub="Textos e foto da página inicial. A loja só muda quando você publica."
      >
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={botaoSecundario}
        >
          <ArrowSquareOutIcon size={18} />
          Ver a home
        </a>
        <button
          type="button"
          onClick={() => publicar(rascunho)}
          className={botaoPrincipal}
        >
          <CheckIcon size={18} />
          Publicar na loja
        </button>
      </Cabecalho>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <section className={secao}>
            <h2 className={titulo2}>Banner da campanha</h2>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={rascunho.show_campaign}
                onChange={(e) =>
                  setRascunho({ ...rascunho, show_campaign: e.target.checked })
                }
                className="h-[18px] w-[18px] accent-neutral-900"
              />
              Mostrar a campanha na home
            </label>
            <label className={rotulo}>
              Selo
              <input
                value={c.tag}
                maxLength={60}
                onChange={(e) => mudarCampanha("tag", e.target.value)}
                className={campo}
              />
            </label>
            <label className={rotulo}>
              Título
              <input
                value={c.title}
                maxLength={80}
                onChange={(e) => mudarCampanha("title", e.target.value)}
                className={campo}
              />
            </label>
            <label className={rotulo}>
              Texto
              <textarea
                rows={3}
                value={c.text}
                maxLength={240}
                onChange={(e) => mudarCampanha("text", e.target.value)}
                className={`${campo} h-auto resize-y py-3 leading-relaxed`}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={rotulo}>
                Texto do botão
                <input
                  value={c.button}
                  maxLength={30}
                  onChange={(e) => mudarCampanha("button", e.target.value)}
                  className={campo}
                />
              </label>
              <label className={rotulo}>
                Botão leva para
                <input
                  value={c.link}
                  placeholder="/category?s=Vestidos"
                  onChange={(e) => mudarCampanha("link", e.target.value)}
                  className={campo}
                />
              </label>
            </div>
            <div className={rotulo}>
              <span>Foto</span>
              <div className="flex flex-wrap gap-2.5">
                <span className="flex min-w-0 flex-[1_1_220px] items-center truncate text-sm font-normal text-[#6b6b6b]">
                  {c.image ? "Foto escolhida" : "Nenhuma foto enviada"}
                </span>
                <label className={`${botaoSecundario} cursor-pointer`}>
                  <UploadSimpleIcon size={18} aria-hidden="true" />
                  {c.image ? "Trocar foto" : "Enviar foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];
                      if (arquivo)
                        mudarCampanha("image", URL.createObjectURL(arquivo));
                    }}
                  />
                </label>
              </div>
              <span className="text-xs font-normal text-[#6b6b6b]">
                A foto aparece à direita, ocupando a maior parte do banner. Foto
                na horizontal funciona melhor.
              </span>
            </div>
          </section>

          <section className={secao}>
            <h2 className={titulo2}>Faixa de benefícios</h2>
            {rascunho.benefits.map((b, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <label className={rotulo}>
                  Destaque {i + 1}
                  <input
                    value={b.highlight}
                    maxLength={40}
                    onChange={(e) =>
                      mudarBeneficio(i, "highlight", e.target.value)
                    }
                    className={campo}
                  />
                </label>
                <label className={rotulo}>
                  Complemento {i + 1}
                  <input
                    value={b.text}
                    maxLength={60}
                    onChange={(e) => mudarBeneficio(i, "text", e.target.value)}
                    className={campo}
                  />
                </label>
              </div>
            ))}
          </section>

          <section className={secao}>
            <h2 className={titulo2}>Banner do meio</h2>
            <label className={rotulo}>
              Título
              <input
                value={rascunho.banner.title}
                maxLength={80}
                onChange={(e) => mudarBanner("title", e.target.value)}
                className={campo}
              />
            </label>
            <label className={rotulo}>
              Texto
              <input
                value={rascunho.banner.text}
                maxLength={200}
                onChange={(e) => mudarBanner("text", e.target.value)}
                className={campo}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={rotulo}>
                Texto do botão
                <input
                  value={rascunho.banner.button}
                  maxLength={30}
                  onChange={(e) => mudarBanner("button", e.target.value)}
                  className={campo}
                />
              </label>
              <label className={rotulo}>
                Botão leva para
                <input
                  value={rascunho.banner.link}
                  placeholder="/category?s=Vestidos"
                  onChange={(e) => mudarBanner("link", e.target.value)}
                  className={campo}
                />
              </label>
            </div>
          </section>

          <section className={secao}>
            <h2 className={titulo2}>Newsletter</h2>
            <label className={rotulo}>
              Título
              <input
                value={rascunho.newsletter.title}
                maxLength={80}
                onChange={(e) => mudarNewsletter("title", e.target.value)}
                className={campo}
              />
            </label>
            <label className={rotulo}>
              Texto
              <input
                value={rascunho.newsletter.text}
                maxLength={200}
                onChange={(e) => mudarNewsletter("text", e.target.value)}
                className={campo}
              />
            </label>
          </section>
        </div>

        <section className={`${secao} min-w-0 flex-[1_1_300px]`}>
          <h2 className={titulo2}>Prévia do banner</h2>
          {rascunho.show_campaign ? (
            <div className="flex overflow-hidden rounded-lg border border-[#e2dedb] bg-[#f8eeeb]">
              <div className="flex w-[38%] flex-col justify-center gap-1 p-3">
                <span className="text-[9px] tracking-widest text-[#6b3a44]">
                  {c.tag}
                </span>
                <span className="text-sm leading-tight font-medium">
                  {c.title}
                </span>
                <span className="mt-1 self-start rounded-sm bg-[#f6bebf] px-2 py-1 text-[9px] font-medium whitespace-nowrap">
                  {c.button}
                </span>
              </div>
              <div className="relative h-[150px] w-[62%]">
                {c.image ? (
                  <img
                    src={c.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[50%_8%]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#edeae8] text-xs text-[#6b6b6b]">
                    Sem foto
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="m-0 text-sm text-[#6b6b6b]">
              A campanha está escondida da home.
            </p>
          )}
        </section>
      </div>
    </>
  );
}

export default function AdminPage({ host }: { host: string | null }) {
  const [produtos, setProdutos] = useState<Produto[]>(produtosTeste);
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosTeste);
  const [conteudo, setConteudo] = useState<ConteudoHome>(conteudoTeste);
  const [aviso, setAviso] = useState<string | null>(null);

  function avisar(mensagem: string) {
    setAviso(mensagem);
    setTimeout(() => setAviso(null), 3000);
  }

  function salvarProduto(p: Produto, novo: boolean) {
    if (novo) {
      setProdutos([p, ...produtos]);
      avisar("Produto cadastrado");
    } else {
      setProdutos(produtos.map((x) => (x.db_id === p.db_id ? p : x)));
      avisar("Produto salvo");
    }
  }

  function arquivarProduto(id: string) {
    setProdutos(
      produtos.map((p) => (p.db_id === id ? { ...p, status: "Arquivado" } : p)),
    );
    avisar("Produto arquivado");
  }

  function atualizarPedido(p: Pedido) {
    setPedidos(pedidos.map((x) => (x.id === p.id ? p : x)));
    avisar("Pedido atualizado");
  }

  function publicarConteudo(c: ConteudoHome) {
    setConteudo(c);
    avisar("Conteúdo publicado na loja");
  }

  const aEnviar = pedidos.filter(
    (p) => p.status === "Pago" || p.status === "Separando",
  ).length;

  return (
    <div className="flex min-h-svh flex-wrap bg-[#f5f4f3] text-left font-[Prompt] text-neutral-900!">
      <nav
        aria-label="Menu do painel"
        className="box-border flex max-w-full flex-[1_1_220px] flex-col gap-0.5 border-r border-[#e2dedb] bg-white px-3 py-6"
      >
        <Link to="/painel" className="block px-2.5 pb-1.5">
          <img src={logo} alt="Bebella Boutique" className="block w-[150px]" />
        </Link>
        <span className="px-3 pb-5 text-[11px] tracking-[0.12em] text-[#6b6b6b]">
          PAINEL DA LOJA
        </span>
        <ItemMenu
          para="/painel"
          icone={<HouseIcon size={18} />}
          texto="Início"
        />
        <ItemMenu
          para="/painel/pedidos"
          icone={<ReceiptIcon size={18} />}
          texto="Pedidos"
          contador={aEnviar || undefined}
        />
        <ItemMenu
          para="/painel/produtos"
          icone={<TShirtIcon size={18} />}
          texto="Produtos"
        />
        <ItemMenu
          para="/painel/conteudo"
          icone={<ImageSquareIcon size={18} />}
          texto="Conteúdo da loja"
        />
        <div className="min-h-8 flex-1"></div>
        <a
          href="/"
          className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm text-[#3d3d3d]! no-underline hover:bg-[#f5f4f3]"
        >
          <ArrowSquareOutIcon size={18} />
          <span>Ver a loja</span>
        </a>
      </nav>

      <main className="box-border flex min-w-0 flex-[999_1_560px] flex-col gap-5 px-4 pt-6 pb-12 md:px-8 md:pt-8">
        <Routes>
          <Route
            index
            element={<Inicio produtos={produtos} pedidos={pedidos} />}
          />
          <Route
            path="produtos"
            element={
              <Produtos produtos={produtos} arquivar={arquivarProduto} />
            }
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
            element={<ProdutoForm produtos={produtos} salvar={salvarProduto} />}
          />
          <Route path="pedidos" element={<Pedidos pedidos={pedidos} />} />
          <Route
            path="pedidos/:id"
            element={
              <PedidoDetalhe pedidos={pedidos} atualizar={atualizarPedido} />
            }
          />
          <Route
            path="conteudo"
            element={
              <ConteudoLoja conteudo={conteudo} publicar={publicarConteudo} />
            }
          />
          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Routes>
      </main>

      {aviso && (
        <p
          role="status"
          className="fixed right-6 bottom-6 m-0 rounded-md bg-neutral-900 px-4 py-2.5 text-sm text-white"
        >
          {aviso}
        </p>
      )}
    </div>
  );
}
