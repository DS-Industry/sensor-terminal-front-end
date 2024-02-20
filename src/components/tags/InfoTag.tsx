import CheckMark from "./../../assets/Success_perspective_matte 1.svg";

export default function InfoTag({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className=" text-white-600 text-start font-inter-medium mb-2">
        {label}
      </p>
      <div className="flex justify-between items-center min-h-10 w-[170px] bg-white-500 rounded-2xl px-3">
        <p className=" font-inter-bold text-xl">{value}</p>
        <img
          src={CheckMark}
          alt="checkmark"
          className=" size-10 min-h-[40px]"
        />
      </div>
    </div>
  );
}
