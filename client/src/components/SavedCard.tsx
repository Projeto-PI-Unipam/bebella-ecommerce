import "../assets/fonts/fonts.css";

export default function SavedCard({ ind }: { ind?: any }) {
  return (
    <div
      className={`w-full lg:h-72 h-108 ${ind % 2 == 0 ? "bg-yellow-200" : "bg-red-200"}`}
    >
      <div></div>
    </div>
  );
}
