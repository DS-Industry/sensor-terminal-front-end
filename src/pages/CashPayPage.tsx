import Cash from "./../assets/cash.svg";
import VideoLayout from "../layouts/VideoLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AttentionTag from "../components/tags/AttentionTag";
import { useTranslation } from "react-i18next";

export default function CashPayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!state || (state && (!state.programName || !state.price))) {
      navigate("/");
    }

    console.log(state);
  }, []);

  return (
    <VideoLayout programUrl={state.promoUrl}>
      <div className="flex flex-row mt-10 px-20 justify-between">
        <div className=" max-w-[300px]">
          <h1 className=" text-5xl text-left font-inter-semibold text-gray-600 mb-14">
            {t("Оплата Наличными")}
          </h1>
          <h2 className="text-left font-inter-semibold text-3xl mb-5">
            {t("Внесите купюры в купюроприемник")}
          </h2>
          <p className=" text-left w-fit">
            {t("Принимаются купюры номиналом:")}
          </p>
          <p className=" text-left w-fit px-16 py-3 bg-green-400 font-inter-bold text-white-500 text-xl mt-3 rounded-2xl">
            50 / 100 / 200
          </p>
          <div className=" absolute mt-10 min-h-[160px] min-w-[270px] bg-primary rounded-t-2xl z-20 flex justify-center items-end">
            <div className=" min-h-[30px] min-w-[220px] bg-gray-500 z-30"></div>
          </div>
          <div className="  mt-[200px] min-h-[75px] min-w-[270px] max-w-[270px] bg-primary rounded-b-2xl z-20 flex justify-center items-start">
            <div className=" min-h-[30px] min-w-[220px] bg-gray-500 z-10"></div>
          </div>
          <img
            src={Cash}
            alt="card"
            className=" absolute bottom-[2rem] left-[5.6rem] size-[350px] p-0 m-0 object-fit -rotate-90 z-10"
          />
        </div>
        <div className=" bg-primary min-w-[350px] min-h-[700px] rounded-3xl px-5 flex flex-col justify-between shadow-[0px_20px_40px_15px_rgba(0,0,0,0.3)]">
          <div className="">
            <div className=" mt-10 flex flex-row gap-3 text-white-500 font-inter-light text-base opacity-80 text-left mb-7">
              <p>{t("Программа")}:</p>
              <p className=" font-inter-bold">{t(`${state.programName}`)}</p>
            </div>
            <div className=" h-full flex flex-col justify-between gap-10 mt-10">
              <div>
                <p className=" font-inter-bold text-2xl text-white-500 text-left mb-5">
                  {t("К оплате")}:
                </p>
                <p
                  className={` text-5xl text-white-500 font-inter-semibold bg-gradient-to-t py-5 rounded-3xl mb-3 from-primary to-secondary `}
                >
                  {state.price} {t("р.")}
                </p>
              </div>
              <div>
                <p className=" font-inter-bold text-2xl text-white-500 text-left mb-5">
                  {t("Внесено")}:
                </p>
                <p
                  className={` text-5xl text-white-500 font-inter-semibold bg-gradient-to-t py-5 rounded-3xl mb-3 from-primary to-secondary `}
                >
                  110 {t("р.")}
                </p>
              </div>
            </div>
          </div>
          <div>
            <button className=" font-inter-medium px-8 py-2 mb-7 bg-gradient-to-t from-blue-100 to-white-500 rounded-3xl shadow-[0px_10px_20px_0px_rgba(0,0,0,0.3)]">
              {t("Оплатить")}
            </button>
          </div>
          <div className=" absolute bottom-[21rem] right-[4rem]">
            <AttentionTag
              label={t("Терминал сдачу не выдает!")}
              additionalStyles={`${
                i18n.language === "en" ? "max-w-[250px]" : "max-w-[200px]"
              } text-red-400`}
            />
          </div>
        </div>
      </div>
    </VideoLayout>
  );
}
