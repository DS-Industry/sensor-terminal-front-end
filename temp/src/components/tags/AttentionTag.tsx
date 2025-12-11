import Fire from "./../../assets/Fire_perspective_matte.svg";

export default function AttentionTag({
  label,
  additionalStyles,
  icon,
}: {
  label: string;
  additionalStyles?: string;
  icon?: string;
}) {
  return (
    <div
      className={` flex flex-row w-[350px] min-h-fit items-center shadow-[0px_10px_20px_5px_rgba(0,0,0,0.4)]  bg-gradient-to-t from-blue-200 to-white-500 rounded-[3rem] px-3 py-1 ${
        additionalStyles && additionalStyles
      } `}
    >
      <img
        src={icon ? icon : Fire}
        alt="fire"
        className=" min-h-[40px] min-w-[40px]"
      />
      <p className=" font-inter-semibold   text-left">{label}</p>
    </div>
  );
}
