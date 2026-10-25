import { useState } from "react";
import type { FormEvent } from "react";
import { Search, Menu } from "./Icons";
import type { Aba } from "../types";

const ABAS: [Aba, string][] = [
  ["visao", "Vis\u00e3o Geral"],
  ["produtos", "Produtos"],
  ["pedidos", "Pedidos"],
];

interface NavbarProps {
  aba: Aba;
  onChange: (aba: Aba) => void;
  onBuscar: (texto: string) => void;
}

export default function Navbar({ aba, onChange, onBuscar }: NavbarProps) {
  const [q, setQ] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  const buscar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const texto = q.trim();
    if (texto) onBuscar(texto);
  };

  return (
    <section className="dashboard-subnav" aria-label="Ferramentas do dashboard">
      <button
        type="button"
        className="dashboard-subnav__menu"
        aria-label={menuAberto ? "Fechar navega\u00e7\u00e3o" : "Abrir navega\u00e7\u00e3o"}
        aria-expanded={menuAberto}
        onClick={() => setMenuAberto((aberto) => !aberto)}
      >
        <Menu width={22} height={22} />
      </button>

      <nav className={"dashboard-subnav__links" + (menuAberto ? " aberto" : "")} aria-label="Se\u00e7\u00f5es do dashboard">
        {ABAS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={aba === id ? "ativo" : ""}
            aria-current={aba === id ? "page" : undefined}
            onClick={() => {
              onChange(id);
              setMenuAberto(false);
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <form className="dashboard-subnav__search" onSubmit={buscar} role="search">
        <button type="submit" aria-label="Buscar no dashboard">
          <Search width={18} height={18} />
        </button>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar no dashboard"
          aria-label="Buscar no dashboard"
        />
      </form>
    </section>
  );
}
