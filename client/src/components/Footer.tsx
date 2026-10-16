import BLarge from "../assets/img/logo-horizontal-svg.svg";
import "../assets/fonts/fonts.css";
import { WhatsappLogoIcon } from "@phosphor-icons/react/dist/csr/WhatsappLogo";
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/csr/InstagramLogo";

export default function Footer() {
  const ico_size = 44;
  return (
    <div className="collapse lg:visible w-full h-56 bg-[#f6bebf] flex flex-row pt-3 pb-3 pl-12 pr-32 justify-between items-center font-[Prompt] text-lg text-neutral-800 font-light not-lg:max-h-0 not-lg:pb-0 not-lg:mb-0 max-w-dvw">
      <div className="w-1/4 min-w-90 flex flex-row h-full">
        <div className="w-1/4 max-w-15 flex flex-col h-full justify-evenly items-start pt-2 pb-2">
          <WhatsappLogoIcon
            className="cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-0.5"
            color="#98263e"
            weight="duotone"
            size={ico_size}
          />
          <InstagramLogoIcon
            className="cursor-pointer transition delay-8 duration-140 ease-out hover:scale-110 hover:-translate-y-0.5"
            color="#98263e"
            weight="duotone"
            size={ico_size}
          />
        </div>
        <div className="w-full h-full flex flex-col items-start justify-center">
          <img src={BLarge} className="w-auto h-11 mb-3" />
          <span className="font-normal">
            {"Bebella Boutique".toUpperCase()}
          </span>
          <span className="font-normal">{"CNPJ: 41.841.235/0001-93"}</span>
          <span>{"R. Iguaçu, 340 - Santa Terezinha"}</span>
          <span>{"Patos de Minas, MG - 38.700-338"}</span>
        </div>
      </div>
      <div className="h-full w-1/12 min-w-40 flex flex-col justify-center items-start">
        <span className="font-normal mb-1">{"Área do Cliente"}</span>
        <span
          className="hover:text-red-400 cursor-pointer"
          onClick={() => location.assign(location.origin + "/login")}
        >
          {"Minha Conta"}
        </span>
        <span
          className="hover:text-red-400 cursor-pointer"
          onClick={() => location.assign(location.origin + "/usuario/pedidos")}
        >
          {"Meus Pedidos"}
        </span>
        <span
          className="hover:text-red-400 cursor-pointer"
          onClick={() => location.assign(location.origin + "/usuario/carrinho")}
        >
          {"Meu Carrinho"}
        </span>
        <span
          className="hover:text-red-400 cursor-pointer"
          onClick={() =>
            location.assign(location.origin + "/usuario/favoritos")
          }
        >
          {"Meus Favoritos"}
        </span>
      </div>
      <div className="h-full w-1/10 min-w-52 flex flex-col justify-center items-start">
        <span className="font-normal mb-1">{"Ajuda"}</span>
        <span>{"Troca e Devoluções"}</span>
        <span>{"Prazo de Entrega"}</span>
        <span>{"Guia de Medidas"}</span>
        <span>{"Formas de Pagamento"}</span>
      </div>
      <div className="h-full w-1/11 min-w-44 flex flex-col justify-center items-start">
        <span className="font-normal mb-1">{"Contato"}</span>
        <span>{"(34) 99709-7816"}</span>
        <span>{"(34) 99941-1133"}</span>
        <span>{"(34) 99804-8844"}</span>
        <span>{"bebellaboutiqueb@gmail.com"}</span>
      </div>
    </div>
  );
}
