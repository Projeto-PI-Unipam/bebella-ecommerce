import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { hash } from "bcryptjs";
import "./LoginPage.css";
import logoHorizontal from "../assets/img/logo-horizontal-svg.svg";
import "../assets/fonts/fonts.css";
import { saveToken } from "../App";

export default function LoginPage({
  redirect,
  setter,
}: {
  redirect?: string;
  setter: Function;
}) {
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [showPass, toggleShow] = useState<boolean>(false);
  const [salt, setSalt] = useState<string | null>(null);
  const [status, setStatus] = useState<number>(0);
  const [isPending, setPending] = useState<boolean>(false);
  if (redirect) {
    location.replace(
      location.origin + ("/login?dir=" + redirect.replace("/", "")),
    );
  }
  const tryLogin = useEffectEvent(async () => {
    setPending(true);
    const hashpass = await hash(pass, salt || "");
    const endpoint = "/userapi/login";
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        email: email,
        password: hashpass,
      }),
    });
    if (response.status === 200) {
      const token = await response.json();
      saveToken(token);
      setter(token);
      location.assign(location.origin + location.search.replace("?dir=", "/"));
    } else if (response.status === 406) {
      alert("Dados incorretos. Verifique a senha inserida!");
    } else {
      console.error(response.statusText);
    }
    setPending(false);
    return;
  });
  const checkUser = useEffectEvent(async () => {
    setPending(true);
    const endpoint = "/userapi/check";
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        email: email,
      }),
    });
    if (!response.ok) {
      console.error(response.statusText);
    } else {
      if (response.status === 200) {
        const res_salt: string = await response.json();
        setSalt(res_salt);
        setStatus(1);
      } else if (response.status === 206) {
        setStatus(2);
      }
    }
    setPending(false);
    return;
  });
  /* const createUser = useEffectEvent(async () => {
  }); */
  const handle_keys = useCallback((event: KeyboardEvent) => {
    if (event.key === "Enter" && ["@", "."].every((s) => email.includes(s))) {
      checkUser();
    }
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", handle_keys);
    return () => {
      document.removeEventListener("keydown", handle_keys);
    };
  }, [handle_keys]);

  if (!location.href.includes("/login")) {
    return <></>;
  }
  return (
    <div className="login-page">
      <div className="login-padrao"></div>
      <div className="login-conteudo">
        <img src={logoHorizontal} alt="Bebella Boutique" className="logo" />
        <div style={{ visibility: status === 0 ? "visible" : "hidden" }}>
          <h1
            className="login-titulo"
            style={{
              fontSize: "calc(2rem + 0.8svw)",
              fontWeight: 500,
              margin: "0 0 8px auto",
              lineHeight: "calc(1.5rem + 3svh)",
              wordSpacing: "-0.4dvw",
              fontFamily: "Prompt",
              color: "#000",
              justifySelf: "flex-start",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: "calc(2rem + 0.8svw)",
                fontWeight: 500,
                margin: "0 0 8px 0",
                lineHeight: "calc(1.5rem + 3svh)",
                fontFamily: "Prompt",
                wordSpacing: "1px",
                color: "#f6bebf",
                justifySelf: "flex-start",
                textAlign: "left",
              }}
            >
              Entre
            </span>
            <br /> ou crie sua conta
          </h1>
          <br />
          <p
            className="login-subtitulo"
            style={{
              display: "flex",
              fontWeight: 500,
              color: "#000",
              fontFamily: "Prompt",
              marginTop: "0px",
              paddingTop: "0px",
              fontSize: "calc(1rem + 0.5svh)",
            }}
          >
            digite um e-mail para continuar
          </p>
          {/*<form>*/}
          <label>
            <p
              style={{
                display: "flex",
                color: "#000",
                fontFamily: "Prompt",
                marginTop: "0px",
                paddingTop: "4dvh",
                textIndent: 4,
              }}
            >
              e-mail*
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: "#fff",
                width: "100%",
                height: "calc(1.5rem + 3svh)",
                boxSizing: "border-box",
                border: "1px solid #f6bebf",
                borderRadius: "12px",
                fontFamily: "Prompt",
                fontSize: "calc(0.75rem + 1svh)",
                color: "#000",
              }}
            />
          </label>
          <div
            style={{
              fontFamily: "Prompt",
              width: "calc(15rem + 5dvw)",
              color: "#000",
              textAlign: "left",
              paddingTop: "2dvh",
              paddingBottom: "2dvh",
              textWrap: "wrap",
              breakInside: "avoid",
            }}
          >
            <p className="login-termos">
              {"Ao clicar em continuar, afirmo que concordo com a "}
              <a href="#">{"Política de Privacidade"}</a>
              {" e os "}
              <a href="#">{"Termos de Uso"}</a>
              {" da Bebella Boutique."}
            </p>
          </div>
          <div className="flex flex-row items-center justify-end">
            <button
              type="button"
              className="font-[Prompt] rounded-2xl border-2 border-solid border-[#f6bebf] w-28 h-12 justify-self-end bg-[#f6bebf] text-md font-medium text-neutral-800"
              id="botaoContinuar"
              onClick={() => checkUser()}
            >
              <span className="pl-2 pr-2">{"Continuar".toUpperCase()}</span>
            </button>
          </div>
          {/*</form>*/}
        </div>
        <div style={{ visibility: status === 1 ? "visible" : "hidden" }}>
          {/*pagina de login com senha*/}
          <input
            type="password"
            onChange={(event) => setPass(event.target.value)}
            value={pass}
            style={{
              background: "#fff",
              width: "100%",
              height: "calc(1.5rem + 3svh)",
              boxSizing: "border-box",
              border: "1px solid #f6bebf",
              borderRadius: "12px",
              fontFamily: "Prompt",
              fontSize: "calc(0.75rem + 1svh)",
              color: "#000",
            }}
          />
          <button
            type="button"
            className="login-botao"
            id="botaoContinuar"
            onClick={() => tryLogin()}
          >
            {"Logar"}
          </button>
        </div>

        <div style={{ visibility: status === 2 ? "visible" : "hidden" }}>
          {/*pagina de criar conta*/}
        </div>
      </div>
    </div>
  );
}
