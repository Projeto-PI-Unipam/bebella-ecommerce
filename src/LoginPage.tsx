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
            <form >
                <label>
                    <p>E-mail:</p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label>
                    <p>Senha:</p>
                    <input
                        type="password"
                    />
                </label>
                <div>
                    <button type="submit">
                        Entrar
                    </button>
                </div>
            </form>
        </div>
    );
}

// function LogInOutButton() {}
