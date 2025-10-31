import CheckMark from "../assets/Success_perspective_matte 1.svg";
import Sally from "../assets/Saly-22.webp";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import { EOrderStatus } from "../components/state/order/orderSlice";

// const IDLE_TIMEOUT = 30000;

export default function SuccessPaymentPage() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { setIsLoading, order } = useStore();
  
  const [displayText, setDisplayText] = useState("Проезжайте в бокс!");

  const handleFinish = () => {
    navigate("/");
  }

  useEffect(() => {
    if (order?.status === EOrderStatus.COMPLETED) {
      handleFinish();
    }
  }, [order]);

  useEffect(() => {
    setIsLoading(false);

    const textTimer = setTimeout(() => {
      setDisplayText("Идет мойка");
    }, 10000);

    return () => {
      clearTimeout(textTimer);
    };
  }, []);

  return (
    <section className="bg-primary h-screen w-screen bg-[#0045FF] flex flex-col justify-center">
      <div className="flex flex-col items-center">
        <img
          src={CheckMark}
          alt="check mark"
          className="min-w-[200px] min-h-[200px] max-w-[200px] max-h-[200px]"
        />

        <p className="text-white text-[124px] font-semibold mb-12">
          {t(displayText)}
        </p>

        <img
          src={Sally}
          alt="sally"
          className="min-w-[55rem] min-h-[55rem] max-w-[55rem] max-h-[55rem] object-contain mt-5"
        />
      </div>
    </section>
  );
}
