import { PackageIcon, TrashIcon, TruckIcon } from "@phosphor-icons/react";
import "./CartPage.css";
import "../assets/fonts/fonts.css";

export default function CartPage() {
  return (
    <div className="carrinho-page">
      <div className="carrinho-conteudo">
        <div>
          <div className="carrinho-faixa">
            <span>SACOLA DE COMPRAS</span>
            <small>1 ITEM</small>
          </div>

          <div className="carrinho-item">
            <div className="carrinho-foto" />
            <div className="carrinho-detalhes">
              <h1>Colete em crochê</h1>
              <div className="carrinho-linha">
                <span>Cor:</span>
                <span>Branco</span>
              </div>
              <div className="carrinho-linha">
                <span>Tamanho:</span>
                <select defaultValue="G">
                  <option>P</option>
                  <option>M</option>
                  <option>G</option>
                </select>
              </div>
              <span className="carrinho-preco">R$350,90</span>
              <div className="carrinho-quantidade">
                <span>-</span>
                <span>1</span>
                <span>+</span>
              </div>
            </div>
            <TrashIcon className="carrinho-lixeira" size={22} />
          </div>

          <div className="carrinho-frete">
            <div>
              <h2>
                <TruckIcon size={22} /> Calcule o frete
              </h2>
              <p>Informe seu CEP para ver as opções de entrega disponíveis</p>
              <div className="carrinho-cep">
                <input type="text" placeholder="Digite seu CEP" />
                <button type="button">CALCULAR</button>
              </div>
              <p>Não sabe seu CEP? Consulte aqui</p>
            </div>
            <div className="carrinho-opcoes">
              <h2>Frete para 00000-000</h2>
              <div className="carrinho-opcao">
                <span className="carrinho-radio ativo" />
                <div>
                  <span>PAC</span>
                  <small>0 a 0 dias úteis</small>
                </div>
                <span>R$00,00</span>
              </div>
              <div className="carrinho-opcao">
                <span className="carrinho-radio" />
                <div>
                  <span>SEDEX</span>
                  <small>0 a 0 dias úteis</small>
                </div>
                <span>R$00,00</span>
              </div>
            </div>
          </div>

          <div className="carrinho-troca">
            <h2>
              <PackageIcon size={22} /> Troca e devoluções
            </h2>
            <p>
              Você pode solicitar a troca ou devolução do seu produto dentro do
              prazo informado pela loja, desde que a peça esteja sem sinais de
              uso, com etiquetas e em perfeitas condições.
            </p>
          </div>
        </div>

        <div>
          <div className="carrinho-faixa">
            <span>RESUMO</span>
          </div>
          <div className="carrinho-resumo-linha">
            <span>Subtotal (1 item)</span>
            <span>R$350,90</span>
          </div>
          <div className="carrinho-resumo-linha">
            <span>Frete</span>
            <span>R$00,00</span>
          </div>
          <div className="carrinho-total">
            <div className="carrinho-resumo-linha">
              <strong>TOTAL</strong>
              <strong>R$350,90</strong>
            </div>
            <small>em até 4x sem juros no cartão</small>
          </div>
          <button type="button" className="carrinho-finalizar">
            FINALIZAR COMPRA
          </button>
        </div>
      </div>
    </div>
  );
}