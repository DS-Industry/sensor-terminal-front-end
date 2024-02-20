import { RiMastercardLine, RiVisaLine } from "react-icons/ri";
import { FaApplePay, FaGooglePay } from "react-icons/fa6";
import Lightning from "./../../assets/lightning.svg";
import { useNavigate } from "react-router-dom";

interface IPayCard {
  payType: "bankCard" | "cash" | "app";
  label: string;
  imgUrl: string;
  endPoint: string;
  programName: string;
  price: number;
  programUrl: string;
}

export default function PayCard({
  payType,
  label,
  imgUrl,
  endPoint,
  programName,
  price,
  programUrl,
}: IPayCard) {
  const navigate = useNavigate();

  console.log(programName, price);

  return (
    <div
      onClick={() =>
        navigate(`./${endPoint}`, {
          state: {
            programName: programName,
            price: price,
            promoUrl: programUrl,
          },
        })
      }
      className=" flex flex-col items-start justify-between bg-primary p-5 rounded-3xl text-white-500 min-w-[200px] max-w-[200px] min-h-[230px] shadow-[0px_20px_60px_35px_rgba(0,0,0,0.3)]"
    >
      <img
        src={imgUrl}
        alt="logo pay way"
        className=" h-[70px] w-fit object-cover"
      />
      <p className=" font-inter-semibold text-xl text-left pl-2">{label}</p>
      {payType === "bankCard" && (
        <div className=" flex flex-row justify-evenly w-full">
          <RiMastercardLine className=" fill-white-500 text-3xl" />
          <RiVisaLine className=" text-3xl" />
          <FaApplePay className=" text-3xl" />
          <FaGooglePay className=" text-3xl" />
        </div>
      )}
      {payType === "cash" && (
        <div>
          <p className=" font-inter-light text-xs text-left">Купюры</p>
          <p className=" font-inter-semibold">50, 100, 200</p>
        </div>
      )}
      {payType === "app" && (
        <div className=" flex justify-between w-full">
          <div>
            <p className=" font-inter-light text-xs text-left">Ваш cashBack</p>
            <p className=" font-inter-semibold text-left">+10%</p>
          </div>
          <img src={Lightning} alt="lightning" className=" size-[40px]" />
        </div>
      )}
    </div>
  );
}
