import NavigationButton from "../components/buttons/NavigationButton";
import Logo from "../assets/Logo-white.svg";
import WhiteBack from "../assets/exit_to_app_white.svg";
import Emoji from "../assets/emoji-sad.svg";
import Sally from "../assets/Saly-2.webp";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import { useEffect, useRef } from "react";

const IDLE_TIMEOUT = 30000;

export default function ErrorPaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { errorText, setIsLoading } = useStore();
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFinish = () => {
    navigate("/");
  }

  const clearIdleTimeout = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }

  useEffect(() => {
      setIsLoading(false);

      if (!idleTimeoutRef.current) {
        idleTimeoutRef.current = setTimeout(handleFinish, IDLE_TIMEOUT);
      }
  
      return () => {
        clearIdleTimeout();
      };
    }, []);

  return (
    <section className="flex flex-col justify-center bg-primary h-screen w-screen bg-[#0045FF]">
      <div className="flex flex-col items-center">
        <img src={Emoji} className=" mt-10" />

        <p className="text-white text-[104px] font-semibold mb-12">
          {errorText ? t(errorText) : t("Ошибка запуска робота")}
        </p>

        <img
          src={Sally}
          alt="sally"
          className=" min-w-[50rem] min-h-[50rem] max-w-[10rem] max-h-[5rem] object-cover mt-5"
        />
      </div>

      <button
        className="fixed right-8 bottom-8 px-8 py-4 rounded-3xl text-[#0B68E1] bg-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50"
        onClick={() => {
          handleFinish();
        }}
        style={{ backgroundColor: "" }}
      >
        <div className="flex items-center justify-center gap-2">
          {t("Завершить")}
        </div>
      </button>
    </section>
  );
}
