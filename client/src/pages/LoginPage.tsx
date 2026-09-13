import { useState } from "react";
import "./LoginPage.css";
import logoHorizontal from "../assets/img/logo-horizontal-svg.svg";
import "../assets/fonts/fonts.css";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  return (
    <div className="login-page">
      <div className="login-padrao"></div>
      <div className="login-conteudo">
        <img src={logoHorizontal} alt="Bebella Boutique" className="logo" />
        <h1
          className="login-titulo"
          style={{
            fontSize: "calc(2.5rem + 1svw)",
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
              fontSize: "calc(2.5rem + 1svw)",
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
        <p
          className="login-subtitulo"
          style={{
            display: "flex",
            fontWeight: 500,
            color: "#000",
            fontFamily: "Prompt",
            marginTop: "0px",
            paddingTop: "0px",
          }}
        >
          digite um e-mail para continuar
        </p>
        <form>
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
          <div
            style={{
              fontFamily: "Prompt",
              fontWeight: 500,
              fontSize: "0.8rem",
            }}
          >
            <button type="submit" className="login-botao">
              {"OK"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
