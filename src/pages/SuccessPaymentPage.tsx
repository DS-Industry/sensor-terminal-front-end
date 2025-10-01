import NavigationButton from "../components/buttons/NavigationButton";
import Logo from "../assets/Logo-white.svg";
import WhiteBack from "../assets/exit_to_app_white.svg";
import CheckMark from "../assets/Success_perspective_matte 1.svg";
import Sally from "../assets/Saly-22.svg";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const IDLE_TIMEOUT = 30000;

export default function SuccessPaymentPage() {
  const { t } = useTranslation();

  const navigate = useNavigate();

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
    if (!idleTimeoutRef.current) {
      idleTimeoutRef.current = setTimeout(handleFinish, IDLE_TIMEOUT);
    }

    return () => {
      clearIdleTimeout();
    };
  }, []);

  return (
    <section className="bg-primary h-screen w-screen bg-[#0045FF] flex flex-col justify-center">
      {/* <div className="w-full flex justify-between py-8 px-8">
        <img
          src={Logo}
          alt="Logo"
          className="min-w-[173px] min-h-[71px] max-w-[173px] max-h-[71px]"
        />
        <NavigationButton
          label={
            <img
              src={WhiteBack}
              alt="Back"
              className="min-w-[69px] min-h-[68px] max-w-[69px] max-h-[68px]"
            />
          }
        />
      </div> */}
      <div className="flex flex-col items-center">
        <img
          src={CheckMark}
          alt="check mark"
          className="min-w-[200px] min-h-[200px] max-w-[200px] max-h-[200px]"
        />

        <p className="text-white text-[124px] font-semibold mb-12">
          {t("Проезжайте в бокс!")}
        </p>

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

        <img
          src={Sally}
          alt="sally"
          className="min-w-[55rem] min-h-[55rem] max-w-[55rem] max-h-[55rem] object-contain mt-5"
        />
      </div>
    </section>
  );
}
