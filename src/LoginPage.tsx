// import { hash, compare } from "bcrypt";
//import { useState, createContext, useContext } from "react";
export default function LoginPage() {
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
                        type="text"
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
