import { Link } from "react-router-dom";
import "./ProductPage.css";
import "../assets/fonts/fonts.css";

export default function ProductPage() {
  return (
    <div className="produto-page">
      <div className="produto-conteudo">
        <div className="produto-breadcrumb">
          <Link to="/">INÍCIO</Link>
          <span>/</span>
          <span>COLETE EM CROCHÊ</span>
        </div>

        <div className="produto-principal">
          <div className="produto-miniaturas">
            <div className="produto-miniatura ativa" />
            <div className="produto-miniatura" />
            <div className="produto-miniatura" />
          </div>
          <div className="produto-imagem" />

          <div className="produto-info">
            <h1>Colete em crochê</h1>

            <div className="produto-preco-bloco">
              <div className="produto-preco-linha">
                <s>R$499,00</s>
                <span className="produto-desconto">-28%</span>
              </div>
              <span className="produto-preco">R$350,99</span>
              <span className="produto-parcelas">4x de R$87,74 sem juros</span>
            </div>

            <div className="produto-grupo">
              <span>Tamanho</span>
              <div className="produto-tamanhos">
                <div className="produto-tamanho">P</div>
                <div className="produto-tamanho ativo">M</div>
                <div className="produto-tamanho">G</div>
              </div>
            </div>

            <div className="produto-grupo">
              <span>
                Cor: <strong>Branco</strong>
              </span>
              <div className="produto-cores">
                <div className="produto-cor preto" />
                <div className="produto-cor branco ativa" />
                <div className="produto-cor bege" />
              </div>
            </div>

            <div className="produto-compra">
              <div className="produto-quantidade">
                <span>-</span>
                <span>1</span>
                <span>+</span>
              </div>
              <button type="button" className="produto-comprar">
                COMPRAR
              </button>
            </div>

            <div className="produto-descricao">
              <h2>SOBRE ESSE PRODUTO</h2>
              <p>
                Delicado, sofisticado e versátil, o Colete em Crochê é a peça
                perfeita para complementar seus looks com charme e
                personalidade. Confeccionado em crochê, possui design leve e
                atemporal, ideal para diferentes ocasiões.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="produto-novidades">
        <div className="produto-novidades-topo">
          <h2>NOVIDADES</h2>
          <Link to="/search">VER TUDO</Link>
        </div>
        <div className="produto-grade">
          <div className="produto-card">
            <div className="foto" />
            <p>Vestido em linho</p>
            <span>R$ 350,99</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Vestido nude</p>
            <span>R$ 200,00</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Conjunto linho</p>
            <span>R$ 260,00</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Blusa ombro a ombro</p>
            <span>R$ 149,90</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Blusa bebella</p>
            <span>R$ 200,00</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Colete em crochê</p>
            <span>R$ 350,99</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Conjunto rosa</p>
            <span>R$ 229,90</span>
          </div>
          <div className="produto-card">
            <div className="foto" />
            <p>Camisa malha canelada</p>
            <span>R$ 189,90</span>
          </div>
        </div>
      </div>
    </div>
  );
}