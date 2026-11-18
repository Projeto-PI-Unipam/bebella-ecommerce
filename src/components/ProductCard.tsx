import { type ClothesModel, to_currency } from "../database/Schema.tsx";

export default function ProductCard({ item }: { item: ClothesModel }) {
  return (
    <div
      key={item.db_id}
      className="inline-flex flex-col w-96 h-118 rounded-2xl bg-rose-100 object-cover"
      onClick={() =>
        location.assign(location.origin + "/product/" + item.db_id)
      }
    >
      <div className="flex w-full h-10/11 rounded-t-2xl justify-center content-center items-start overflow-hidden">
        <ul className="w-full h-full overflow-hidden">
          <li className="w-full h-full overflow-hidden">
            <img
              className="inline-block w-full h-auto rounded-t-2xl self-start justify-center overflow-hidden object-cover"
              alt="product-showcase"
              src={"https://cdn.bebellaboutique.com/" + item.pic_url![0]}
            />
          </li>
        </ul>
      </div>
      <div className="flex flex-row w-full h-2/11 rounded-b-2xl">
        <div className="w-2/3 h-full flex flex-col rounded-bl-2xl overflow-hidden content-center justify-center">
          <span className="h-full text-pretty font-[Prompt] text-center self-start p-4 pt-5 text-lg text-neutral-800 text-ellipsis">
            {item.name}
          </span>
        </div>
        <div className="w-1/3 h-full flex flex-col justify-center content-center rounded-br-2xl">
          <span className="h-full text-pretty font-[Prompt] self-end text-center p-4 pt-5 text-lg text-neutral-800">
            {to_currency(item.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
