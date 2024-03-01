import { WiTime4 } from "react-icons/wi";
import { MdOutlineCheck } from "react-icons/md";
import Lightning from "./../../assets/lightning.svg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ICard {
  time: number;
  title: string;
  value: string;
  services: string[];
  price: number;
  bgColor?: string;
}

export default function ProgramCard({
  bgColor,
  time,
  title,
  services,
  price,
  value,
}: ICard) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div
      onClick={() => navigate(`/programs/${value}`)}
      className={`flex flex-col snap-start justify-between min-w-[210px] min-h-[600px] rounded-3xl text-white-500 shadow-[0px_20px_40px_15px_rgba(0,0,0,0.3)] px-6 ${
        bgColor ? bgColor : "bg-primary "
      }`}
    >
      <div className=" ">
        <div className=" flex items-center justify-start gap-3 pt-5">
          <WiTime4 className={`${bgColor ? bgColor : "bg-primary"} text-6xl`} />
          <p className=" font-inter-semibold text-2xl">
            {time} {t("мин.")}
          </p>
        </div>
        <p className=" font-inter-semibold text-2xl mt-8">{t(`${title}`)}</p>
        <ul className=" mt-4 font-inter-regular">
          {services.map((service, index) => (
            <li key={index} className="flex items-center gap-3">
              <MdOutlineCheck />
              <p className=" pb-1">{t(`${service}`)}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className=" flex flex-col justify-center items-center">
        <div className="flex flex-row items-center justify-between min-w-[180px] min-h-[80px] bg-white-500 w-full mb-6 rounded-3xl py-3">
          <div className=" flex flex-col justify-between h-full pl-4">
            <p className=" text-black text-[12px] font-inter-medium">
              {t("Ваш СashBack")}
            </p>
            <p className="text-left text-black text-[20px] font-inter-semibold">
              10%
            </p>
            <p className=" text-black text-[10px] font-inter-light ">
              {t("От вашей мойки")}
            </p>
          </div>
          <img src={Lightning} alt="lightning" className=" size-[75px]" />
        </div>
        <p
          className={`min-w-[180px] text-5xl font-inter-semibold bg-gradient-to-t py-5 rounded-3xl mb-3 ${
            bgColor ? " from-black to-gray-500" : "from-primary to-secondary"
          }  `}
        >
          {price} {t("р.")}
        </p>
      </div>
    </div>
  );
}
