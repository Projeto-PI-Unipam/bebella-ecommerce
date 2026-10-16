export function fmt_price(orig: number): string {
  return `R$${orig.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
