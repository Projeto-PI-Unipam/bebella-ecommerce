import { useEffect, useState } from "react";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import {
  conteudo_padrao,
  type HomeContent,
  image_url,
} from "../../database/ConteudoHome.ts";
import { chamarApi } from "./dados.ts";
import { botaoPrincipal, botaoSecundario, cartao, campo } from "./estilos.ts";
import { AvisoServidor, Cabecalho } from "./componentes.tsx";

export default function ConteudoLoja({
  token,
  avisar,
  enviarFoto,
}: {
  token: string | null;
  avisar: (mensagem: string) => void;
  enviarFoto: (arquivo: File) => Promise<string>;
}) {
  const [conteudo, setConteudo] = useState<HomeContent>(conteudo_padrao);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState<boolean>(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);

  useEffect(() => {
    chamarApi("/items/home", "GET")
      .then((dados: HomeContent | null) => {
        if (dados) setConteudo(dados);
      })
      .catch(() =>
        setErroCarga(
          "Não foi possível carregar o conteúdo publicado. Recarregue a página para tentar de novo.",
        ),
      )
      .finally(() => setCarregando(false));
  }, []);

  async function trocarFoto(arquivo: File | undefined) {
    if (!arquivo) return;
    setErroFoto(null);
    setEnviandoFoto(true);
    try {
      mudarCampanha("image", await enviarFoto(arquivo));
    } catch (e) {
      setErroFoto((e as Error).message);
    }
    setEnviandoFoto(false);
  }

  function mudarCampanha(campo: keyof HomeContent["campaign"], valor: string) {
    setConteudo({
      ...conteudo,
      campaign: { ...conteudo.campaign, [campo]: valor },
    });
  }

  function mudarBanner(campo: keyof HomeContent["banner"], valor: string) {
    setConteudo({
      ...conteudo,
      banner: { ...conteudo.banner, [campo]: valor },
    });
  }

  function mudarNewsletter(
    campo: keyof HomeContent["newsletter"],
    valor: string,
  ) {
    setConteudo({
      ...conteudo,
      newsletter: { ...conteudo.newsletter, [campo]: valor },
    });
  }

  function mudarBeneficio(
    i: number,
    campo: "highlight" | "text",
    valor: string,
  ) {
    setConteudo({
      ...conteudo,
      benefits: conteudo.benefits.map((b, j) =>
        j === i ? { ...b, [campo]: valor } : b,
      ),
    });
  }

  async function publicar() {
    setErro(null);
    setSalvando(true);
    try {
      await chamarApi("/admin/home", "PATCH", {
        auth_token: token,
        content: conteudo,
      });
      avisar("Conteúdo publicado na loja");
    } catch (e) {
      setErro((e as Error).message);
    }
    setSalvando(false);
  }

  if (carregando) {
    return <p className="m-0 text-[15px] text-[#6b6b6b]">Carregando…</p>;
  }

  // Sem o conteúdo atual, publicar poderia apagar o que está na home.
  if (erroCarga) {
    return (
      <>
        <Cabecalho
          titulo="Conteúdo da loja"
          sub="Textos e foto da página inicial. A loja só muda quando você publica."
        />
        <AvisoServidor mensagem={erroCarga} />
      </>
    );
  }

  const secao = `${cartao} flex flex-col gap-4 p-5`;
  const rotulo = "flex min-w-0 flex-col gap-2 text-sm font-medium";
  const foto = image_url(conteudo.campaign.image);

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
          onClick={publicar}
          disabled={salvando}
          className={`${botaoPrincipal} disabled:opacity-60`}
        >
          <CheckIcon size={18} />
          {salvando ? "Publicando…" : "Publicar na loja"}
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
              Banner da campanha
            </h2>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={conteudo.show_campaign}
                onChange={(e) =>
                  setConteudo({ ...conteudo, show_campaign: e.target.checked })
                }
                className="h-[18px] w-[18px] accent-neutral-900"
              />
              Mostrar a campanha na home
            </label>
            <label className={rotulo}>
              Selo
              <input
                value={conteudo.campaign.tag}
                maxLength={60}
                placeholder="COLEÇÃO PRIMAVERA 2026"
                onChange={(e) => mudarCampanha("tag", e.target.value)}
                className={campo}
              />
            </label>
            <label className={rotulo}>
              Título
              <input
                value={conteudo.campaign.title}
                maxLength={80}
                onChange={(e) => mudarCampanha("title", e.target.value)}
                className={campo}
              />
            </label>
            <label className={rotulo}>
              Texto
              <textarea
                rows={3}
                value={conteudo.campaign.text}
                maxLength={240}
                onChange={(e) => mudarCampanha("text", e.target.value)}
                className={`${campo} h-auto resize-y py-3 leading-relaxed`}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={rotulo}>
                Texto do botão
                <input
                  value={conteudo.campaign.button}
                  maxLength={30}
                  onChange={(e) => mudarCampanha("button", e.target.value)}
                  className={campo}
                />
              </label>
              <label className={rotulo}>
                Botão leva para
                <input
                  value={conteudo.campaign.link}
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
                  {!conteudo.campaign.image
                    ? "Nenhuma foto enviada"
                    : /^(data|blob):/.test(conteudo.campaign.image)
                      ? "Foto enviada"
                      : conteudo.campaign.image}
                </span>
                <label className={`${botaoSecundario} cursor-pointer`}>
                  <UploadSimpleIcon size={18} aria-hidden="true" />
                  {enviandoFoto
                    ? "Enviando…"
                    : conteudo.campaign.image
                      ? "Trocar foto"
                      : "Enviar foto"}
                  <input
                    id="foto-campanha"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={enviandoFoto}
                    onChange={(e) => trocarFoto(e.target.files?.[0])}
                  />
                </label>
              </div>
              {erroFoto && (
                <span
                  role="alert"
                  className="text-xs font-normal text-[#a3261f]"
                >
                  {erroFoto}
                </span>
              )}
              <span className="text-xs font-normal text-[#6b6b6b]">
                A foto aparece à direita, ocupando a maior parte do banner. Foto
                na horizontal funciona melhor.
              </span>
            </div>
          </section>

          <section className={secao}>
            <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
              Faixa de benefícios
            </h2>
            {conteudo.benefits.map((b, i) => (
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
            <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
              Banner do meio
            </h2>
            <label className={rotulo}>
              Título
              <input
                value={conteudo.banner.title}
                maxLength={80}
                onChange={(e) => mudarBanner("title", e.target.value)}
                className={campo}
              />
            </label>
            <label className={rotulo}>
              Texto
              <input
                value={conteudo.banner.text}
                maxLength={200}
                onChange={(e) => mudarBanner("text", e.target.value)}
                className={campo}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={rotulo}>
                Texto do botão
                <input
                  value={conteudo.banner.button}
                  maxLength={30}
                  onChange={(e) => mudarBanner("button", e.target.value)}
                  className={campo}
                />
              </label>
              <label className={rotulo}>
                Botão leva para
                <input
                  value={conteudo.banner.link}
                  placeholder="/category?s=Vestidos"
                  onChange={(e) => mudarBanner("link", e.target.value)}
                  className={campo}
                />
              </label>
            </div>
          </section>

          <section className={secao}>
            <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
              Newsletter
            </h2>
            <label className={rotulo}>
              Título
              <input
                value={conteudo.newsletter.title}
                maxLength={80}
                onChange={(e) => mudarNewsletter("title", e.target.value)}
                className={campo}
              />
            </label>
            <label className={rotulo}>
              Texto
              <input
                value={conteudo.newsletter.text}
                maxLength={200}
                onChange={(e) => mudarNewsletter("text", e.target.value)}
                className={campo}
              />
            </label>
          </section>
        </div>

        <section className={`${secao} min-w-0 flex-[1_1_300px]`}>
          <h2 className="m-0! font-[Prompt]! text-base! font-medium! tracking-normal! text-neutral-900!">
            Prévia do banner
          </h2>
          {conteudo.show_campaign ? (
            <div className="flex overflow-hidden rounded-lg border border-[#e2dedb] bg-[#f8eeeb]">
              <div className="flex w-[38%] flex-col justify-center gap-1 p-3">
                <span className="text-[9px] tracking-widest text-[#6b3a44]">
                  {conteudo.campaign.tag}
                </span>
                <span className="text-sm leading-tight font-medium">
                  {conteudo.campaign.title}
                </span>
                <span className="mt-1 self-start rounded-sm bg-[#f6bebf] px-2 py-1 text-[9px] font-medium whitespace-nowrap">
                  {conteudo.campaign.button}
                </span>
              </div>
              <div className="relative h-[150px] w-[62%]">
                {foto ? (
                  <img
                    src={foto}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[50%_8%]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#edeae8] text-xs text-[#6b6b6b]">
                    Em espera
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
