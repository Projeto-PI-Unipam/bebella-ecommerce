// import { hash, compare } from "bcrypt";
import { useState } from "react";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <h1>
                <span>Entre</span> ou crie sua conta
            </h1>
            <p>digite um e-mail para continuar</p>
            <form>
                <label>
                    <p>e-mail*</p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <p>
                    Ao clicar em próximo, afirmo que concordo com a{" "}
                    <a href="#">Política de privacidade</a> e os{" "}
                    <a href="#">Termos de uso</a> da Bebella Boutique.
                </p>
                <div>
                    <button type="submit">Continuar</button>
                </div>
            </form>
        </div>
    );
}

