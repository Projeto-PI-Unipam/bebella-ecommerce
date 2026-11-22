import {
  type ClothesModel,
  def_installments,
  to_currency,
  upfront_discount,
} from "../database/Schema.tsx";

export default function ProductCard({ item }: { item: ClothesModel }) {
  return (
    <div
      key={item.db_id}
      className="flex w-full min-w-0 cursor-pointer flex-col gap-3 self-start text-neutral-800"
      onClick={() =>
        location.assign(location.origin + "/product/" + item.db_id)
      }
    >
      <div className="aspect-3/4 w-full overflow-hidden rounded-md bg-[#f4efed]">
        <img
          className="h-full w-full object-cover transition-transform duration-300 motion-safe:hover:scale-[1.03]"
          alt={item.name}
          src={"https://cdn.bebellaboutique.com/" + item.pic_url![0]}
        />
      </div>
      <div className="flex flex-col gap-1 text-left">
        <span className="line-clamp-2 min-h-[2lh] font-[Prompt] text-[15px] leading-snug">
          {item.name}
        </span>
        <span className="font-[Prompt] text-base font-medium">
          {to_currency(item.price)}
        </span>
        <span className="font-[Prompt] text-[13px] font-medium text-[#98263e]">
          {to_currency(item.price * (1 - upfront_discount))} no Pix
        </span>
        <span className="font-[Prompt] text-[13px] text-[#6b6461]">
          ou {def_installments}x de {to_currency(item.price / def_installments)}{" "}
          sem juros
        </span>
      </div>
    </div>
  );
}
