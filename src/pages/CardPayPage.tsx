import VideoLayout from "../layouts/VideoLayout";
import Wifi from "./../assets/wifi.svg";
import Card from "./../assets/card-big.svg";
import Mir from "./../assets/mir-logo 1.svg";
import { FaApplePay, FaGooglePay } from "react-icons/fa6";
import { RiMastercardLine, RiVisaLine } from "react-icons/ri";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CardPayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state || (state && (!state.programName || !state.price))) {
      navigate("/");
    }

    console.log(state);
  }, []);

  return (
    <VideoLayout programUrl={state.promoUrl}>
      <div className="flex flex-row mt-10 px-20 justify-between">
        <div className=" max-w-[400px]">
          <h1 className=" text-5xl text-left font-inter-semibold text-gray-600 mb-14">
            Оплата картой
          </h1>
          <h2 className="text-left font-inter-semibold text-3xl mb-20">
            Приложите банковскую карту для оплаты
          </h2>
          <img src={Wifi} alt="wifi" className=" size-[280px]" />
          <img
            src={Card}
            alt="card"
            className=" absolute bottom-[5rem] left-[11rem] size-[350px] p-0 m-0 object-contain"
          />
        </div>
        <div className=" bg-primary min-w-[300px] min-h-[700px] rounded-3xl px-5 flex flex-col justify-between shadow-[0px_20px_40px_15px_rgba(0,0,0,0.3)]">
          <div className=" flex flex-col justify-center items-center mt-10">
            <RiMastercardLine className=" text-white-500 text-[5rem]" />
            <RiVisaLine className=" text-white-500 text-[5rem]" />
            <img src={Mir} alt="world" className=" size-[5rem]" />
            <FaGooglePay className=" text-white-500 text-[5rem]" />
            <FaApplePay className=" text-white-500 text-[5rem]" />
          </div>
          <div>
            <div className=" flex flex-row gap-3 text-white-500 font-inter-light text-base opacity-80 text-left mb-7">
              <p>Программа:</p>
              <p className=" font-inter-bold">{state.programName}</p>
            </div>
            <div>
              <p className=" font-inter-bold text-2xl text-white-500 text-left mb-5">
                К оплате:
              </p>
              <p
                className={` text-5xl text-white-500 font-inter-semibold bg-gradient-to-t py-5 rounded-3xl mb-3 from-primary to-secondary `}
              >
                {state.price} р.
              </p>
            </div>
          </div>
        </div>
      </div>
    </VideoLayout>
  );
}
