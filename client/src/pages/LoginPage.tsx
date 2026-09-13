import { useState } from "react";
import './LoginPage.css';
import logoHorizontal from './assets/icons/logo-horizontal-svg.svg';
export default function LoginPage() {
    const [email, setEmail] = useState("");
    return (
        <div className="login-page">
            <div className="login-padrao"></div>
            <div className="login-conteudo">
                <img src={logoHorizontal} alt="Bebella Boutique" className='logo' />
                <h1 className='login-titulo'>
                    <span>Entre</span> ou crie sua conta
                </h1>
                <p className="login-subtitulo">digite um e-mail para continuar</p>
                <form>
                    <label>
                        <p>e-mail*</p>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                        />
                    </label>
                    <p className="login-termos">
                        Ao clicar em continuar, afirmo que concordo com a
                    </p>
                    <p
                        className="login-termos-1">
                        <a href="#">Política de privacidade</a> e os <a href="#">Termos de uso</a>
                    </p>
                    <p
                        className="login-termos-2">
                        da Bebella Boutique.
                    </p>
                    <div className="login-botao">
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>
        </div >
    );
}

