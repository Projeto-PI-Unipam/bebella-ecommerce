import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { ReceiptIcon } from "@phosphor-icons/react/dist/csr/Receipt";
import { TShirtIcon } from "@phosphor-icons/react/dist/csr/TShirt";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { ImageSquareIcon } from "@phosphor-icons/react/dist/csr/ImageSquare";
import logo from "../assets/img/logo-horizontal-svg.svg";
import {
  type ProdutoAdmin,
  type PedidoAdmin,
  type ItemApi,
  type VendaApi,
  paraProduto,
  paraPedido,
  chamarApi,
  enviarArquivo,
} from "./admin/dados.ts";
import { ItemMenu } from "./admin/componentes.tsx";
import "../assets/fonts/fonts.css";
import Inicio from "./admin/Inicio.tsx";
import Produtos from "./admin/Produtos.tsx";
import ProdutoForm from "./admin/ProdutoForm.tsx";
import Pedidos from "./admin/Pedidos.tsx";
import PedidoDetalhe from "./admin/PedidoDetalhe.tsx";
import ConteudoLoja from "./admin/Conteudo.tsx";

// Painel da loja (/painel). Este arquivo monta o menu, carrega os dados e
// define as rotas; cada tela fica no seu arquivo em src/pages/admin.

export default function AdminPage({ host }: { host: string | null }) {
  const token = host;
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [erroPedidos, setErroPedidos] = useState<string | null>(null);
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
      setErroPedidos(null);
      // Produtos e pedidos são pedidos juntos, e um erro em um não esconde o outro.
      const [resProdutos, resPedidos] = await Promise.allSettled([
        chamarApi("/admin/getproducts", "POST", { auth_token: token }),
        chamarApi("/admin/orders", "POST", { auth_token: token }),
      ]);
      if (resProdutos.status === "fulfilled") {
        setProdutos(
          ((resProdutos.value.total ?? []) as ItemApi[]).map(paraProduto),
        );
      } else {
        setErro((resProdutos.reason as Error).message);
      }
      if (resPedidos.status === "fulfilled") {
        setPedidos(((resPedidos.value ?? []) as VendaApi[]).map(paraPedido));
      } else {
        setErroPedidos((resPedidos.reason as Error).message);
      }
      setCarregando(false);
    }
    carregar();
  }, [token]);

  function corpoProduto(p: ProdutoAdmin) {
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
      status: p.status,
    };
  }

  // A lista sempre usa o produto que o servidor devolve depois de salvar.
  async function salvarProduto(p: ProdutoAdmin, novo: boolean) {
    if (novo) {
      const criado = (await chamarApi(
        "/admin/products/new",
        "POST",
        corpoProduto(p),
      )) as ItemApi;
      setProdutos([paraProduto(criado), ...produtos]);
      avisar("Produto cadastrado");
    } else {
      const salvo = (await chamarApi("/admin/products/update", "PATCH", {
        ...corpoProduto(p),
        id: p.db_id,
      })) as ItemApi;
      setProdutos(
        produtos.map((x) => (x.db_id === p.db_id ? paraProduto(salvo) : x)),
      );
      avisar("Produto salvo");
    }
  }

  async function arquivarProduto(id: string) {
    const produto = produtos.find((p) => p.db_id === id);
    if (!produto) return;
    const salvo = (await chamarApi("/admin/products/update", "PATCH", {
      ...corpoProduto({ ...produto, status: "Arquivado" }),
      id: id,
    })) as ItemApi;
    setProdutos(produtos.map((p) => (p.db_id === id ? paraProduto(salvo) : p)));
    avisar("Produto arquivado");
  }

  async function enviarFoto(arquivo: File): Promise<string> {
    const dados = (await enviarArquivo("/admin/upload", token, arquivo)) as {
      name: string;
    };
    return dados.name;
  }

  async function atualizarPedido(p: PedidoAdmin) {
    await chamarApi("/admin/orders/update", "PATCH", {
      auth_token: token,
      id: p.id,
      status: p.status,
      tracking_code: p.rastreio,
    });
    setPedidos(pedidos.map((x) => (x.id === p.id ? p : x)));
    avisar("Pedido atualizado");
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
        {carregando && !erro && (
          <p className="m-0 text-[15px] text-[#6b6b6b]">
            Carregando dados da loja…
          </p>
        )}
        {erro && (
          <p
            role="alert"
            className="m-0 rounded-md bg-[#fcebea] px-4 py-3 text-sm text-[#a3261f]"
          >
            {erro}
          </p>
        )}
        {!carregando && !erro && (
          <Routes>
            <Route
              index
              element={
                <Inicio
                  produtos={produtos}
                  pedidos={pedidos}
                  erroPedidos={erroPedidos}
                />
              }
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
                  enviarFoto={enviarFoto}
                />
              }
            />
            <Route
              path="produtos/:id"
              element={
                <ProdutoForm
                  produtos={produtos}
                  salvar={salvarProduto}
                  enviarFoto={enviarFoto}
                />
              }
            />
            <Route
              path="pedidos"
              element={<Pedidos pedidos={pedidos} erro={erroPedidos} />}
            />
            <Route
              path="conteudo"
              element={
                <ConteudoLoja
                  token={token}
                  avisar={avisar}
                  enviarFoto={enviarFoto}
                />
              }
            />
            <Route
              path="pedidos/:id"
              element={
                <PedidoDetalhe
                  pedidos={pedidos}
                  erro={erroPedidos}
                  atualizar={atualizarPedido}
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
          className="fixed right-6 bottom-6 m-0 rounded-md bg-neutral-900 px-4 py-2.5 text-sm text-white"
        >
          {aviso}
        </p>
      )}
    </div>
  );
}
