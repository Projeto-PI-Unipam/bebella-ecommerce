import { Link } from "react-router-dom";
import "./ProductListPage.css";
import "../assets/fonts/fonts.css";

export default function ProductListPage() {
  return (
    <div className="lista-page">
      <div className="lista-conteudo">
        <div className="lista-breadcrumb">
          <Link to="/">INÍCIO</Link>
          <span>/</span>
          <span>NOVIDADES</span>
        </div>

        <div className="lista-topo">
          <div>
            <h1>NOVIDADES</h1>
            <span className="lista-total">42 produtos</span>
          </div>
          <label className="lista-ordenar">
            Ordenar por:
            <select defaultValue="recentes">
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </label>
        </div>

        <div className="lista-filtros">
          <div className="lista-filtro ativo">Todos</div>
          <div className="lista-filtro">Vestidos</div>
          <div className="lista-filtro">Blusas</div>
          <div className="lista-filtro">Calças</div>
          <div className="lista-filtro">Bolsas</div>
          <div className="lista-filtro">Acessórios</div>
        </div>

        <div className="lista-grade">
          <div className="lista-card">
            <div className="foto" />
            <p>Colete em crochê</p>
            <span>R$ 350,99</span>
          </div>
          <div className="lista-card">
            <div className="foto" />
            <p>Vestido floral</p>
            <span>R$ 200,00</span>
          </div>
          <div className="lista-card">
            <div className="foto" />
            <p>Conjunto linho</p>
            <span>R$ 260,00</span>
          </div>
          <div className="lista-card">
            <div className="foto" />
            <p>Blusa ombro a ombro</p>
            <span>R$ 149,90</span>
          </div>
          <div className="lista-card">
            <div className="foto" />
            <p>Calça pantalona</p>
            <span>R$ 229,90</span>
          </div>
          <div className="lista-card">
            <div className="foto" />
            <p>Bolsa de palha</p>
            <span>R$ 189,90</span>
          </div>
          <div className="lista-card">
            <div className="foto" />
            <p>Vestido midi</p>
            <span>R$ 279,90</span>
          </div>
          <div className="lista-card">
            <div className="foto" />
            <p>Camisa de linho</p>
            <span>R$ 169,90</span>
          </div>
        </div>

        <div className="lista-paginas">
          <div className="lista-pagina ativo">1</div>
          <div className="lista-pagina">2</div>
          <div className="lista-pagina">3</div>
          <div className="lista-pagina">&rsaquo;</div>
        </div>
      </div>
    </div>
  );
}