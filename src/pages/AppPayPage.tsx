import { useLocation, useNavigate } from "react-router-dom";
import VideoLayout from "../layouts/VideoLayout";
import { useEffect } from "react";
import Sally from "../assets/Saly-24.svg";
import GooglePlay from "../assets/Frame.svg";
import AppStore from "../assets/Frame_apple.svg";
import AttentionTag from "../components/tags/AttentionTag";
import Bell from "../assets/Bell_perspective_matte.svg";
import { useTranslation } from "react-i18next";

export default function AppPayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!state || (state && (!state.programName || !state.price))) {
      navigate("/");
    }

    console.log(state);
  }, []);
  return (
    <VideoLayout programUrl={state.promoUrl}>
      <div className=" flex flex-row justify-between gap-10 px-20 mt-10">
        <div className=" text-left font-inter-semibold text-[32px] pt-10">
          <p className=" text-primary">1</p>
          <p className="">{t("Откройте мобильное приложение “Мой-ка!DS”")}</p>
          <p className=" text-primary mt-10">2</p>
          <p>{t("Просканируйте QR-код в мобильном приложении")}</p>
        </div>
        <div className=" flex flex-col items-center bg-primary rounded-[40px] min-w-[350px] min-h-[700px] pt-14 shadow-[0px_20px_60px_35px_rgba(0,0,0,0.3)]">
          <p className=" px-16 font-inter-regular text-white-500 text-[18px]">
            {t("Приложение “Мой-ка!DS” можно скачать:")}
          </p>
          <div className=" flex mt-8">
            <img
              src={AppStore}
              alt="apps"
              className=" bg-primary p-1 w-[125px]"
            />
            <img
              src={GooglePlay}
              alt="apps"
              className=" bg-primary p-1 w-[125px]"
            />
          </div>
          <img
            src={Sally}
            alt="app"
            className=" absolute max-w-[400px] pt-10 object-contain"
          />
          <AttentionTag
            label={t("Следуйте инструкции в приложении")}
            additionalStyles=" absolute min-w-[14.9rem] max-w-[16rem] bottom-[31.8rem] right-[11.2rem] text-[14px] text-blue-700 justify-between px-0"
            icon={Bell}
          />
        </div>
      </div>
    </VideoLayout>
  );
}
