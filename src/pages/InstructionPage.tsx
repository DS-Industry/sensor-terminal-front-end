import InstructionLayout from "../layouts/InstructionLayout";
import Arrow from "./../assets/up-window.svg";
import Car from "./../assets/car-bottom-wash.svg";
import Stop from "./../assets/red-close.svg";
import Cycle from "./../assets/cycle.svg";
import AttentionTag from "../components/tags/AttentionTag";
import Fire from "./../assets/Fire_perspective_matte.svg";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function InstructionPage() {
  const { t, i18n } = useTranslation();
  console.log(i18n.language);
  const navigate = useNavigate();
  
  return (
    <InstructionLayout>
      <div className=" px-20">
        <h1 className=" font-inter-bold text-5xl my-14">{t("Инструкция")}</h1>
        <ul className=" flex flex-col gap-11">
          <li className=" flex flex-row items-start justify-between gap-3">
            <p className=" text-4xl font-inter-bold text-primary">1</p>
            <img
              src={Arrow}
              alt="up window"
              className=" size-[75px] min-h-[75px] max-h-[75px] min-w-[75px] max-w-[75px]"
            />

            <p className=" font-inter-bold text-2xl text-left ml-5">
              <Trans i18nKey="instrutction_step1">
                Закройте окна. Когда загорится индикатор –
                <span className=" text-green-500"> зеленая стрелка</span>, не
                спеша заезжайте в бокс.
              </Trans>
            </p>
          </li>
          <li className=" flex flex-row items-start justify-between gap-1">
            <p className=" text-4xl font-inter-bold text-primary">2</p>
            <img
              src={Car}
              alt="car-bottom-wash"
              className=" size-[100px] min-h-[100px] max-h-[100px] min-w-[100px] max-w-[100px]"
            />
            <p className=" font-inter-bold text-2xl text-left ml-5">
              <Trans i18nKey={"instrutction_step2"}>
                Перед началом основной мойки в программах стандарт и премиум,
                при въезде в бокс, вода подается на днище машины.
              </Trans>

              <p className=" mt-5">
                <Trans i18nKey={"instrutction_step2_2"}>
                  <span className=" hidden">.</span>
                  <span className=" text-primary">
                    Медленно проезжайте{" "}
                  </span>{" "}
                  над зоной распыления воды, чтобы помыть днище машины и диски.
                </Trans>
              </p>
            </p>
          </li>
          <li className=" flex flex-row items-start justify-between gap-3">
            <p className=" text-4xl font-inter-bold text-primary">3</p>
            <img
              src={Stop}
              alt="stop"
              className=" size-[75px] min-h-[75px] max-h-[75px] min-w-[75px] max-w-[75px]"
            />
            <p className=" font-inter-bold text-2xl text-left ml-5">
              <Trans i18nKey={"instrutction_step3"}>
                Когда мойка днища завершится, можете проехать дальше в центр
                бокса. Расположите автомобиль по центру бокса, зеленая стрелка
                сменится на красный крест, начнется основная мойка.
              </Trans>
            </p>
          </li>
          <li className=" flex flex-row items-start justify-between gap-3">
            <p className=" text-4xl font-inter-bold text-primary">4</p>
            <img
              src={Cycle}
              alt="cycle"
              className=" size-[75px] min-h-[75px] max-h-[75px] min-w-[75px] max-w-[75px]"
            />
            <p className=" font-inter-bold text-2xl text-left ml-5">
              <Trans i18nKey={"instrutction_step4"}>
                Консоли, подающие воду и моющие средства, пройдут необходимое
                количество циклов вокруг автомобиля, согласно выбранной
                программе.
              </Trans>
            </p>
          </li>
          <li className=" flex flex-row items-start justify-between gap-3">
            <p className=" text-4xl font-inter-bold text-primary">5</p>
            <img
              src={Arrow}
              alt="up window"
              className=" size-[75px] min-h-[75px] max-h-[75px] min-w-[75px] max-w-[75px]"
            />
            <p className=" font-inter-bold text-2xl text-left ml-5">
              <Trans i18nKey={"instrutction_step5"}>
                По окончании мойки загорится зеленая стрелка. Мойка окончена,
                можно выезжать.
              </Trans>
            </p>
          </li>
          <button
            className="fixed right-8 bottom-8 px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50"
            onClick={() => navigate("/")}
            style={{ backgroundColor: "#0B68E1" }}
            >
            <div className="flex items-center justify-center gap-2">
              {t("Далее")}
            </div>
          </button>
        </ul>
        <AttentionTag
          label={t("Не перемещайте автомобиль во время мойки!")}
          additionalStyles={` absolute right-10 ${
            i18n.language === "en"
              ? "bottom-[21rem]"
              : i18n.language === "uz"
              ? " bottom-[23rem]"
              : "bottom-[24rem]"
          } text-red-400 `}
        />
      </div>
      <div
        className={` px-16 flex flex-row  items-center rounded-[3rem] bg-primary py-5 ${
          i18n.language === "en" ? "mt-6" : "mt-14"
        }`}
      >
        <img src={Fire} alt="fire" className=" min-h-[56px] min-w-[56px]" />
        <div>
          <p className=" text-left font-inter-regular text-2xl ml-10 text-white-500">
            {t("Для того чтобы начать следующий цикл мойки,")}
          </p>
          <p className=" text-left font-inter-regular text-2xl ml-10 text-white-500">
            {t("необходимо в обязательном порядке выехать из поста!")}
          </p>
        </div>
      </div>
    </InstructionLayout>
  );
}
