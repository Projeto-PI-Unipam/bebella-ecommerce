import { ObjectId } from "bson";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { type size, sizes, to_currency } from "../../database/Schema.tsx";
import {
  type StatusProduto,
  type ProdutoAdmin,
  categorias,
  urlFoto,
} from "./dados.ts";
import { botaoPrincipal, botaoSecundario, cartao, campo } from "./estilos.ts";
import { Cabecalho } from "./componentes.tsx";

export default function ProdutoForm({
  produtos,
  salvar,
  enviarFoto,
}: {
  produtos: ProdutoAdmin[];
  salvar: (p: ProdutoAdmin, novo: boolean) => Promise<void>;
  enviarFoto: (arquivo: File) => Promise<string>;
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
  const [salvando, setSalvando] = useState<boolean>(false);
  const [enviandoFoto, setEnviandoFoto] = useState<boolean>(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const campoArquivo = useRef<HTMLInputElement>(null);

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
    status,
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

  async function subirFotos(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    setErroFoto(null);
    setEnviandoFoto(true);
    try {
      const nomes: string[] = [];
      for (const arquivo of Array.from(arquivos)) {
        nomes.push(await enviarFoto(arquivo));
      }
      setFotos((atuais) => [
        ...atuais,
        ...nomes.filter((n) => !atuais.includes(n)),
      ]);
    } catch (e) {
      setErroFoto((e as Error).message);
    }
    setEnviandoFoto(false);
    if (campoArquivo.current) campoArquivo.current.value = "";
  }

  function alternarTamanho(t: size) {
    setTamanhos(
      tamanhos.includes(t) ? tamanhos.filter((x) => x !== t) : [...tamanhos, t],
    );
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
          status: status,
        },
        !existente,
      );
      navigate("/painel/produtos");
    } catch (e) {
      setErro((e as Error).message);
      setSalvando(false);
    }
  }

  const secao = `${cartao} flex flex-col gap-4 p-5`;
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
          className="m-0 rounded-md bg-[#fcebea] px-4 py-3 text-sm text-[#a3261f]"
        >
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <section className={secao}>
            <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
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
              <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
                Fotos
              </h2>
              <p className="mt-1 mb-0 text-[13px] text-[#6b6b6b]">
                A primeira foto é a que aparece na vitrine.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {fotos.map((f, i) => (
                <div key={f} className="relative">
                  <img
                    src={urlFoto(f)}
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
            <div className="flex flex-wrap gap-2.5">
              <label className={`${botaoPrincipal} cursor-pointer`}>
                <UploadSimpleIcon size={18} aria-hidden="true" />
                {enviandoFoto ? "Enviando…" : "Enviar fotos"}
                <input
                  ref={campoArquivo}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  disabled={enviandoFoto}
                  onChange={(e) => subirFotos(e.target.files)}
                />
              </label>
            </div>
            {erroFoto && (
              <p role="alert" className="m-0 text-[13px] text-[#a3261f]">
                {erroFoto}
              </p>
            )}
          </section>

          <section className={secao}>
            <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
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
              <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
                Envio
              </h2>
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
            <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
              Status
            </h2>
            {(
              [
                ["Ativo", "Aparece na loja para as clientes"],
                ["Rascunho", "Salvo, mas escondido da loja"],
                ["Arquivado", "Fora da loja, mantido no histórico"],
              ] as [StatusProduto, string][]
            ).map(([s, desc]) => (
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
            <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
              Como vai aparecer na loja
            </h2>
            <div className="overflow-hidden rounded-2xl border border-[#e2dedb] bg-rose-100">
              {fotos[0] ? (
                <img
                  src={urlFoto(fotos[0])}
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
