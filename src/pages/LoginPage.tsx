import { useCallback, useEffect, useState } from "react";
import "./LoginPage.css";
import logoHorizontal from "../assets/img/logo-horizontal-svg.svg";
import "../assets/fonts/fonts.css";

export default function LoginPage({
    redirect,
}: {
    redirect?: string;
    setter: Function;
}) {
    const [email, setEmail] = useState<string>("");
    const [pass, setPass] = useState<string>("");
    const [showPass, toggleShow] = useState<boolean>(false);
    const [status, setStatus] = useState<number>(2);
    const [erro, setErro] = useState<string | null>(null);

    const [codigo, setCodigo] = useState<string>("");
    const [nome, setNome] = useState<string>("");
    const [sobrenome, setSobrenome] = useState<string>("");
    const [nascimento, setNascimento] = useState<string>("");
    const [novaSenha, setNovaSenha] = useState<string>("");
    const [confirmaSenha, setConfirmaSenha] = useState<string>("");

    useEffect(() => {
        if (redirect) {
            location.replace(
                location.origin + ("/login?dir=" + redirect.replace("/", "")),
            );
        }
    }, [redirect]);

    function voltarParaEmail() {
        setStatus(0);
        setErro(null);
        setPass("");
    }

    function continuar() {
        if (!["@", "."].every((s) => email.includes(s))) {
            setErro("Digite um e-mail válido.");
            return;
        }
        setErro(null);
        setStatus(1);
    }

    function confirmarSenha() {
        if (pass.length < 1) {
            setErro("Digite sua senha.");
            return;
        }
        setErro(null);
    }

    function criarConta() {
        if (!codigo || !nome || !sobrenome || !nascimento) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }
        setErro(null);
    }

    function salvarSenha() {
        if (!codigo) {
            setErro("Digite o código que enviamos para o seu e-mail.");
            return;
        }
        if (novaSenha.length < 8) {
            setErro("A senha precisa ter pelo menos 8 caracteres.");
            return;
        }
        if (novaSenha !== confirmaSenha) {
            setErro("As senhas não conferem.");
            return;
        }
        setErro(null);
    }

    const handle_keys = useCallback(
        (event: KeyboardEvent) => {
            if (event.key !== "Enter") return;
            if (status === 0) {
                continuar();
            } else if (status === 1) {
                confirmarSenha();
            } else if (status === 2) {
                criarConta();
            } else if (status === 3) {
                salvarSenha();
            }
        },
        [status, email, pass, codigo, nome, sobrenome, nascimento, novaSenha, confirmaSenha],
    );

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

                {status === 0 && (
                    <div className="flex flex-col gap-4 text-left">
                        <h1 className="font-[Prompt] text-[calc(2rem+0.8svw)] font-medium leading-tight text-black">
                            <span className="text-[#f6bebf]">Entre</span>
                            <br /> ou crie sua conta
                        </h1>

                        <p className="font-[Prompt] text-[calc(1rem+0.5svh)] font-medium text-black">
                            digite um e-mail para continuar
                        </p>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="email" className="font-[Prompt] text-black">
                                e-mail*
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                            />
                        </div>

                        {erro && (
                            <p className="font-[Prompt] text-sm text-red-700">{erro}</p>
                        )}

                        <p className="max-w-[500px] font-[Prompt] text-black">
                            Ao clicar em continuar, afirmo que concordo com a{" "}
                            <a href="#" className="font-[Prompt] text-[#f6bebf] underline">
                                Política de Privacidade
                            </a>{" "}
                            e os{" "}
                            <a href="#" className="font-[Prompt] text-[#f6bebf] underline">
                                Termos de Uso
                            </a>{" "}
                            da Bebella Boutique.
                        </p>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={continuar}
                                className="h-12 rounded-2xl border-2 border-[#f6bebf] bg-[#f6bebf] px-6 font-[Prompt] font-medium text-neutral-800"
                            >
                                CONTINUAR
                            </button>
                        </div>
                    </div>
                )}

                {status === 1 && (
                    <div className="flex flex-col gap-4 text-left">
                        <h1 className="font-[Prompt] text-[calc(2rem+0.8svw)] font-medium leading-tight text-black">
                            Confirme a senha para continuar
                        </h1>

                        <p className="font-[Prompt] text-black">
                            {email}{" "}
                            <button
                                type="button"
                                onClick={voltarParaEmail}
                                className="font-[Prompt] text-[#f6bebf] underline"
                            >
                                (alterar)
                            </button>
                        </p>

                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="Senha*"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 pr-24 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow(!showPass)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 font-[Prompt] text-sm text-neutral-600"
                            >
                                {showPass ? "ocultar" : "mostrar"}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setStatus(3);
                                setErro(null);
                            }}
                            className="self-start font-[Prompt] text-black underline"
                        >
                            esqueceu sua senha?
                        </button>

                        {erro && (
                            <p className="font-[Prompt] text-sm text-red-700">{erro}</p>
                        )}

                        <button
                            type="button"
                            onClick={confirmarSenha}
                            className="h-12 w-full rounded-2xl border-2 border-[#f6bebf] bg-[#f6bebf] font-[Prompt] font-medium text-neutral-800"
                        >
                            Confirmar
                        </button>
                    </div>
                )}

                {status === 2 && (
                    <div className="flex flex-col gap-4 text-left">
                        <h1 className="font-[Prompt] text-[calc(2rem+0.8svw)] font-medium leading-tight text-black">
                            Certo, vamos criar a sua conta na{" "}
                            <span className="text-[#f6bebf]">Bebella Boutique.</span>
                        </h1>

                        <p className="font-[Prompt] text-black">
                            enviamos um código para
                            <br />
                            {email}{" "}
                            <button
                                type="button"
                                onClick={voltarParaEmail}
                                className="font-[Prompt] text-[#f6bebf] underline"
                            >
                                (alterar)
                            </button>
                        </p>

                        <div className="flex flex-col items-start gap-1">
                            <input
                                placeholder="código"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                            />
                            <button
                                type="button"
                                className="font-[Prompt] text-sm text-black underline"
                            >
                                reenviar código
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <input
                                placeholder="nome*"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                            />
                            <input
                                placeholder="sobrenome*"
                                value={sobrenome}
                                onChange={(e) => setSobrenome(e.target.value)}
                                className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="nascimento" className="font-[Prompt] text-black">
                                data de nascimento*
                            </label>
                            <input
                                id="nascimento"
                                type="date"
                                value={nascimento}
                                onChange={(e) => setNascimento(e.target.value)}
                                max={new Date().toISOString().slice(0, 10)}
                                className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                            />
                        </div>

                        {erro && (
                            <p className="font-[Prompt] text-sm text-red-700">{erro}</p>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={criarConta}
                                className="h-12 rounded-2xl border-2 border-[#f6bebf] bg-[#f6bebf] px-6 font-[Prompt] font-medium text-neutral-800"
                            >
                                Criar conta
                            </button>
                        </div>
                    </div>
                )}

                {status === 3 && (
                    <div className="flex flex-col gap-4 text-left">
                        <h1 className="font-[Prompt] text-[calc(2rem+0.8svw)] font-medium leading-tight text-black">
                            Verifique seu e-mail e insira uma nova senha.
                        </h1>

                        <p className="font-[Prompt] text-black">
                            enviamos um código para
                            <br />
                            {email}{" "}
                            <button
                                type="button"
                                onClick={voltarParaEmail}
                                className="font-[Prompt] text-[#f6bebf] underline"
                            >
                                (alterar)
                            </button>
                        </p>

                        <div className="flex flex-col items-start gap-1">
                            <input
                                placeholder="código"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                            />
                            <button
                                type="button"
                                className="font-[Prompt] text-sm text-black underline"
                            >
                                reenviar código
                            </button>
                        </div>

                        <input
                            type="password"
                            placeholder="nova senha*"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                        />

                        <input
                            type="password"
                            placeholder="confirmar senha*"
                            value={confirmaSenha}
                            onChange={(e) => setConfirmaSenha(e.target.value)}
                            className="box-border h-[calc(1.5rem+3svh)] w-full rounded-xl border border-[#f6bebf] bg-white px-3 font-[Prompt] text-[calc(0.75rem+1svh)] text-black outline-none"
                        />

                        {erro && (
                            <p className="font-[Prompt] text-sm text-red-700">{erro}</p>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={salvarSenha}
                                className="h-12 rounded-2xl border-2 border-[#f6bebf] bg-[#f6bebf] px-6 font-[Prompt] font-medium text-neutral-800"
                            >
                                salvar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
