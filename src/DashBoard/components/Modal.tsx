import { useEffect } from "react";
import type { ReactNode } from "react";
import { Close } from "./Icons";

interface ModalProps {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ titulo, onClose, children }: ModalProps) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  return (
    <div className="modal__fundo" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal__topo">
          <h2>{titulo}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <Close />
          </button>
        </div>
        <div className="modal__corpo">{children}</div>
      </div>
    </div>
  );
}
