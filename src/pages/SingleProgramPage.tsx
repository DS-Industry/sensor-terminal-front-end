import { useNavigate, useParams } from "react-router-dom";
import VideoLayout from "../layouts/VideoLayout";
import { PAYS, PROGRAMS } from "../fake-data";
import { useEffect } from "react";
import { WiTime4 } from "react-icons/wi";
import PayCard from "../components/cards/PayCard";

export default function SingleProgramPage() {
  const { program } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!program) navigate("/");
  }, []);

  return (
    <VideoLayout programUrl={`${program && PROGRAMS[program].promoUrl}`}>
      {program && (
        <div className=" flex flex-col items-center">
          <h1 className=" font-inter-bold text-5xl mb-14">
            {PROGRAMS[program].title}
          </h1>
          <h2 className=" font-montserrat-regular mb-10">
            {PROGRAMS[program].description}
          </h2>
          <div className=" flex items-center mb-16 ">
            <WiTime4 className=" text-5xl" />
            <p className=" font-inter-bold text-2xl ">
              {PROGRAMS[program].time} мин.
            </p>
          </div>
          <h2 className=" text-5xl font-inter-bold mb-16">
            Выберите способ оплаты
          </h2>
          <div className=" flex flex-row justify-evenly w-full">
            {PAYS.map((pay, index) => (
              <PayCard
                key={index}
                payType={pay.type}
                label={pay.label}
                imgUrl={pay.imgUrl}
                endPoint={pay.endPoint}
                programName={PROGRAMS[program].title}
                price={PROGRAMS[program].price}
                programUrl={`${program && PROGRAMS[program].promoUrl}`}
              />
            ))}
          </div>
        </div>
      )}
    </VideoLayout>
  );
}
