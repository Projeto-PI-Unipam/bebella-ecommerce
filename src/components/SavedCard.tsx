import "../assets/fonts/fonts.css";

export const savedCardHeight = 40;
export default function SavedCard({ ind }: { ind?: any }) {
  return (
    <div
      className={`w-full lg:h-72 h-${savedCardHeight} ${ind % 2 == 0 ? "bg-yellow-200" : "bg-red-200"}`}
    >
      <div></div>
    </div>
  );
}
