import { type ClothesModel } from "../database/Schema";
import { fmt_price } from "../database/Utils";

export default function ProductCard({ item }: { item: ClothesModel }) {
  return (
    <div
      key={item.db_id}
      className="inline-flex flex-col w-108 h-192 rounded-2xl bg-rose-100"
    >
      <div className="flex w-full h-10/11 rounded-t-2xl justify-center content-center bg-rose-100 overflow-hidden">
        <ul className="w-full h-full">
          <li className="w-full h-full">
            <img
              className="inline-flex h-174.5 w-108 rounded-t-2xl self-center justify-center overflow-hidden"
              src={item.pic_url[0]}
            />
          </li>
        </ul>
      </div>
      <div className="flex flex-row w-full h-1/11 rounded-b-2xl">
        <div className="w-2/3 h-full flex flex-col rounded-bl-2xl overflow-hidden content-center justify-center">
          <span className="h-full text-pretty font-[Prompt] text-center self-start p-4 pt-5 text-lg text-neutral-800 text-ellipsis">
            {item.name}
          </span>
        </div>
        <div className="w-1/3 h-full flex flex-col justify-center content-center rounded-br-2xl">
          <span className="h-full text-pretty font-[Prompt] self-end text-center p-4 pt-5 text-lg text-neutral-800">
            {fmt_price(item.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
