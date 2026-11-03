import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Navbar from "./components/Navbar";
import Topbar from "../components/Topbar";
import VisaoGeral from "./pages/VisaoGeral";
import Produtos from "./pages/Produtos";
import Pedidos from "./pages/Pedidos";
import { PRODUTOS_INICIAIS, PEDIDOS_INICIAIS } from "./data";
import type { Aba, Pedido, Produto } from "./types";
import "./styles.css";

                                                                              
function useGuardado<T>(chave: string, inicial: T): [T, Dispatch<SetStateAction<T>>] {
  const [valor, setValor] = useState<T>(() => {
    try {
      const salvo = localStorage.getItem(chave);
      return salvo ? (JSON.parse(salvo) as T) : inicial;
    } catch {
      return inicial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
                                                            
    }
  }, [chave, valor]);
  return [valor, setValor];
}

export default function App({ host }: { host: string | boolean | null }) {
  const [aba, setAba] = useState<Aba>("visao");
  const [produtos, setProdutos] = useGuardado<Produto[]>("bebella:produtos", PRODUTOS_INICIAIS);
  const [pedidos, setPedidos] = useGuardado<Pedido[]>("bebella:pedidos", PEDIDOS_INICIAIS);
  const [busca, setBusca] = useState("");

                                                       
  const buscarNaBarra = (texto: string) => {
    setBusca(texto);
    setAba("produtos");
  };

  return (
    <div className="dashboard-shell">
      <Topbar host={host} />
      <Navbar aba={aba} onChange={setAba} onBuscar={buscarNaBarra} />

      {aba === "visao" && <VisaoGeral produtos={produtos} pedidos={pedidos} onIrPara={setAba} />}
      {aba === "produtos" && (
        <Produtos produtos={produtos} setProdutos={setProdutos} busca={busca} setBusca={setBusca} />
      )}
      {aba === "pedidos" && (
        <Pedidos pedidos={pedidos} setPedidos={setPedidos} produtos={produtos} busca={busca} />
      )}
    </div>
  );
}
