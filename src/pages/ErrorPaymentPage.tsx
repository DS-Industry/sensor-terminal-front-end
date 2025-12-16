import Emoji from "../assets/emoji-sad.svg";
import Sally from "../assets/Saly-2.webp";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import { useEffect, useRef } from "react";

const IDLE_TIMEOUT = 5000;

export default function ErrorPaymentPage() {
  const navigate = useNavigate();
  const { errorCode, setIsLoading } = useStore();
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

  const getErrorDisplayText = () => {
    switch (errorCode) {
      case 1001:
        return "Ошибка приема наличных средств. Воспользуйтесь другим способом оплаты.";
      case 1002:
        return "Ошибка безналичной оплаты. Воспользуйтесь другим способом оплаты.";
      case 1003:
        return "Ошибка оплаты картой лояльности. Воспользуйтесь другим способом оплаты.";
      case 1004:
        return "Ошибка запуска оборудования";
      default:
        return errorCode ? String(errorCode) : "Ошибка запуска робота";
    }
  };

  return (
    <section className="flex flex-col justify-center bg-primary h-screen w-screen bg-[#0045FF]">
      <div className="flex flex-col items-center justify-center flex-1">
        <img src={Emoji} className="mb-8" />

        <p className={`text-white font-semibold mb-12 text-cente leading-snug max-w-5xl text-6xl px-8`}>
          {getErrorDisplayText()}
        </p>

          <img
            src={Sally}
            alt="sally"
            className="min-w-[50rem] min-h-[50rem] max-w-[10rem] max-h-[5rem] object-cover mb-12"
          />

        <button
          className="px-16 mt-10 py-6 rounded-3xl text-[#0B68E1] bg-white font-semibold text-2xl transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
          onClick={handleFinish}
        >
          <div className="flex items-center justify-center gap-2">
            Закрыть
          </div>
        </button>
      </div>
    </section>
  );
}
