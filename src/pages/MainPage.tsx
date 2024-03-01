import "./../App.css";
import VideoLayout from "../layouts/VideoLayout";
import { PROGRAMS } from "../fake-data";
import Stop from "../assets/block.svg";
import { useEffect, useState } from "react";
import { secondsToTime } from "../util";
import ProgramCard from "../components/cards/ProgramCard";
import { Trans, useTranslation } from "react-i18next";

export default function MainPage() {
  const divider = 4;
  const initTime = 180;
  const programs = Object.entries(PROGRAMS);
  const [time, setTime] = useState(initTime);
  const [percentage, setPercentage] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    const percentageInterval = setInterval(() => {
      const onePercentDivideTwo = 100 / (initTime * divider);
      setPercentage((prevPersentage) =>
        prevPersentage < 100 ? prevPersentage + onePercentDivideTwo : 100
      );
    }, 1000 / divider);

    return () => {
      clearInterval(percentageInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <VideoLayout isFisrtPage>
      <h1 className=" text-black font-inter-bold text-5xl mb-16">
        {t("Выберите программу")}
      </h1>
      <div
        className={`w-full pb-10  ${
          programs.length > 4 && " snap-x overflow-x-scroll scroll-p-40"
        }`}
      >
        <div
          className={`flex flex-row justify-center gap-5 ${
            programs.length > 4 ? "min-w-fit" : " w-full"
          } `}
        >
          {programs.map(([key, program], index) => (
            <ProgramCard
              key={index}
              time={program.time}
              title={program.title}
              services={program.services}
              price={program.price}
              value={key}
              bgColor={index + 1 === programs.length ? "bg-black" : ""}
            />
          ))}
        </div>
      </div>

      {time > 0 && (
        <div className=" mt-5 flex w-full items-center">
          <img src={Stop} alt="stop" className=" size-[50px]" />
          <div className=" text-left w-full min-h-[50px]">
            <p>
              <Trans
                i18nKey="Бокс осводится через"
                values={{ time: secondsToTime(time) }}
              >
                Бокс осводится через
                <span
                  className="text-red-500 min-w-fit w-10 max-w-[150px]"
                  data-i18n="time"
                />
              </Trans>
            </p>
            <div className=" min-h-3 w-full bg-gray-500 rounded-lg">
              <div className="relative h-full">
                <div
                  className={`absolute top-0 left-0 rounded-lg  min-h-3 bg-blue-500 animate-pulse`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </VideoLayout>
  );
}
