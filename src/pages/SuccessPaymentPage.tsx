import NavigationButton from "../components/buttons/NavigationButton";
import Logo from "../assets/Logo-white.svg";
import WhiteBack from "../assets/exit_to_app_white.svg";
import CheckMark from "../assets/Success_perspective_matte 1.svg";
import Sally from "../assets/Saly-22.svg";
import { useEffect, useState } from "react";
import { secondsToTime } from "../util";

export default function SuccessPaymentPage() {
  const [isBusy, setIsBusy] = useState<number>(10);
  const [wasBusy, setWasBusy] = useState<boolean>(false);

  useEffect(() => {
    let interval = 0;
    if (isBusy > 0) {
      setWasBusy(true);
      interval = setInterval(() => {
        setIsBusy((prevTime) => {
          if (prevTime > 0) {
            prevTime -= 1;
          } else {
            prevTime = 0;
          }
          return prevTime;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <section className=" bg-primary h-screen w-screen">
      <div className=" w-full flex justify-between py-8 px-8">
        <img
          src={Logo}
          alt="Logo"
          className={`min-w-[173px] min-h-[71px] max-w-[173px] max-h-[71px]`}
        />

        <NavigationButton
          label={
            <img
              src={WhiteBack}
              alt="Back"
              className={`min-w-[69px] min-h-[68px] max-w-[69px] max-h-[68px]`}
            />
          }
        />
      </div>
      <div className={` flex flex-col items-center`}>
        <img
          src={CheckMark}
          alt="check mark"
          className=" min-w-[200px] min-h-[200px] max-w-[200px] max-h-[200px]"
        />
        <p className=" text-white-500 text-[6.5rem] font-inter-medium">
          {isBusy === 0 && wasBusy ? "“Бокс свободен”" : "“Успешно”"}
        </p>
        {isBusy === 0 && (
          <p className=" font-montserrat-regular text-[2rem] text-white-500">
            Можете проезжать в бокс!
          </p>
        )}

        {isBusy >= 0 && (
          <div>
            <img
              src="http://qrcoder.ru/code/?test+check+success&4&0"
              title="QR код"
              alt="QR code"
              className=" object-contain rounded-3xl min-w-[200px] min-h-[200px] max-w-[200px] max-h-[200px] mt-14"
            />
            <p className=" font-montserrat-regular text-[1.5rem] text-white-500 mt-14">
              Ваш чек
            </p>
          </div>
        )}

        {isBusy ? (
          <div className=" mt-10 text-white-500 text-[4rem]">
            <p className=" font-inter-semibold">Бокс освободится через:</p>
            <p className=" font-inter-semibold">{secondsToTime(isBusy)}</p>
          </div>
        ) : (
          <img
            src={Sally}
            alt="sally"
            className=" min-w-[55rem] min-h-[55rem] max-w-[55rem] max-h-[55rem] object-contain mt-5"
          />
        )}
      </div>
    </section>
  );
}
