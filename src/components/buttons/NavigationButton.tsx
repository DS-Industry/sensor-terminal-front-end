import { useNavigate } from "react-router-dom";

export default function NavigationButton({
  label,
}: {
  label: string | React.ReactNode;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof label === "string") {
      navigate("/instruction");
    } else navigate("/");
  };

  return (
    <button
      onClick={handleClick}
      className={`${
        typeof label === "string" &&
        "text-lg bg-gradient-to-t from-primary to-blue-650 px-5 py-2 rounded-3xl text-white-500 font-inter-semibold shadow-[0px_10px_20px_5px_rgba(0,0,0,0.3)] h-fit "
      }`}
    >
      {label}
    </button>
  );
}
