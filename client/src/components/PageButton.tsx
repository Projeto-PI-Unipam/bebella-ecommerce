import "../assets/fonts/fonts.css";

const backgroundActive = "#f6bebf";
const activeBorder = "#d49c9d";
const activeBorderRGB = [144, 64, 112];

export function PageNavIndicator({
  label,
  visibility,
  hspace,
  setter,
}: {
  label: number;
  visibility: boolean;
  hspace: number;
  setter: Function;
}) {
  return (
    <button
      style={{
        cursor: "text",
        width: "32px",
        height: "40px",
        marginLeft: hspace,
        marginRight: hspace,
        borderRadius: "8px",
        backgroundColor: backgroundActive,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: activeBorder,
        boxShadow: `4px 3px 5px rgba(94, 14, 72, 0.6)`,
        display: "flex",
        alignItems: "anchor-center",
        justifyContent: "center",
        visibility: visibility ? "visible" : "hidden",
      }}
    >
      <span
        style={{
          textAlign: "center",
          fontFamily: "Boston Angel",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "28px",
          color: "#702626",
        }}
      >
        {label}
      </span>
    </button>
  );
}

export function PageNavButton({
  label,
  visibility,
  setter,
}: {
  label: string;
  visibility: boolean;
  setter: Function;
}) {
  return (
    <button
      style={{
        cursor: "pointer",
        width: "24px",
        height: "32px",
        borderRadius: "6px",
        backgroundColor: backgroundActive,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: activeBorder,
        boxShadow: `4px 3px 5px rgba(94, 14, 72, 0.6)`,
        display: "flex",
        alignItems: "anchor-center",
        justifyContent: "center",
        visibility: visibility ? "visible" : "hidden",
      }}
      onClick={() => setter()}
    >
      <span
        style={{
          marginBottom: "3px",
          textAlign: "center",
          fontFamily: "Boston Angel",
          fontWeight: 500,
          fontStyle: "normal",
          fontSize: "36px",
          color: "#702626",
        }}
      >
        {label}
      </span>
    </button>
  );
}
