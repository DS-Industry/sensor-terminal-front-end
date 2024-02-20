import { useLocation, useNavigate } from "react-router-dom";
import VideoLayout from "../layouts/VideoLayout";
import { useEffect, useState } from "react";
import Lightning from "../assets/lightning.svg";
import WifiBlue from "../assets/blue_wifi.svg";
import WifiPayCard from "../assets/wifi_paycard.svg";
import WifiPromoCard from "../assets/wifi_promocard.svg";
import PromoCard from "../assets/promo_card.svg";
import AttentionTag from "../components/tags/AttentionTag";
import Profile from "../assets/profile.svg";

export default function AppCardPayPage() {
  const { state } = useLocation();
  const [payType, setPayType] = useState<string>("");
  const [isCardRead, setIsCardRead] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!state || (state && (!state.programName || !state.price))) {
      navigate("/");
    }
    console.log(state);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPayType(event.currentTarget.value);
    setIsCardRead(true);
  };

  useEffect(() => {
    let timeOutId = 0;
    if (isCardRead) {
      timeOutId = setTimeout(() => {
        setIsCardRead(false);
      }, 5000);
    }
    return () => clearTimeout(timeOutId);
  }, [isCardRead]);

  return (
    <VideoLayout programUrl={state.promoUrl}>
      {payType === "" && (
        <div className=" flex flex-col items-center">
          <h1 className=" font-inter-bold text-[2.8rem] mt-7">
            Выберите способ оплаты
          </h1>
          <p className=" font-montserrat-regular mt-10 text-[1rem]">
            Для оплаты одним из способов необходимо будет приложить карту
            лояльности
          </p>
          <div className=" flex flex-row mt-10 gap-10 min-h-[500px]">
            <div className=" flex flex-col justify-between bg-primary p-7 text-white-500 max-w-[300px] min-w-[300px] rounded-[40px] ">
              <p className=" text-left text-[18px] pr-[5rem]">
                Спишите свои баллы
              </p>
              <div>
                <p className=" font-inter-semibold text-left mb-5 text-[32px]">
                  Баллами
                </p>
                <p className=" font-inter-semibold text-left text-[20px] mb-14">
                  Оплатите мойку баллами с карты
                </p>
                <button
                  onClick={handleClick}
                  value="points"
                  className=" font-inter-medium text-black px-8 py-2  bg-gradient-to-t from-blue-100 to-white-500 rounded-3xl shadow-[0px_10px_20px_0px_rgba(0,0,0,0.3)]"
                >
                  Оплатить
                </button>
              </div>
            </div>
            <div className=" flex flex-col justify-between bg-primary p-7 text-white-500 max-w-[300px] min-w-[300px] rounded-[40px]">
              <div className=" flex flex-row justify-between">
                <div>
                  <p className=" text-left">Ваш CashBack</p>
                  <p className=" font-inter-bold text-[32px] text-left">+10%</p>
                  <p className=" text-[12px] text-left">От этой мойки</p>
                </div>
                <img
                  src={Lightning}
                  alt="lightning"
                  className=" object-cover"
                />
              </div>
              <div>
                <p className=" font-inter-semibold text-left mb-5 text-[32px]">
                  СashBack
                </p>
                <p className=" font-inter-semibold text-left text-[20px] mb-7">
                  Вы получите CashBack от внесенной вами суммы
                </p>
                <button
                  onClick={handleClick}
                  value="cashback"
                  className=" font-inter-medium px-8 py-2 text-black  bg-gradient-to-t from-blue-100 to-white-500 rounded-3xl shadow-[0px_10px_20px_0px_rgba(0,0,0,0.3)]"
                >
                  Оплатить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isCardRead && (
        <div className=" flex flex-col items-center min-h-full">
          <p className=" font-inter-bold text-[2.8rem] mt-7 px-[15rem]">
            Приложите карту лояльности
          </p>
          <div className=" w-full h-full min-h-full flex items-center justify-center mt-[6.5rem]">
            <img src={WifiBlue} alt="wifi blue" className=" size-[400px]" />
          </div>
          <img
            src={PromoCard}
            alt="card promo"
            className=" absolute size-[500px] bottom-[-3rem] right-[10rem]"
          />
        </div>
      )}
      {payType === "points" && !isCardRead && (
        <div className=" flex flex-row justify-between px-[5rem] gap-10">
          <div>
            <p className=" text-left font-inter-bold text-[3.5rem]">
              Для списания баллов приложите карту повторно
            </p>
            <img
              src={WifiPromoCard}
              alt="wifi paycard"
              className="absolute size-[400px]"
            />
          </div>
          <div className=" bg-primary min-w-[350px] min-h-[700px] rounded-3xl flex flex-col justify-between shadow-[0px_20px_40px_15px_rgba(0,0,0,0.3)]">
            <div className="h-full">
              <div className=" h-full flex flex-col justify-between py-8 ">
                <div className=" px-5 border-b-4 border-b-blue-650 pb-[5rem]">
                  <img src={Profile} alt="profile" className=" mb-8" />
                  <p className=" font-inter-bold text-2xl text-white-500 text-left mb-5">
                    Ваш баланс:
                  </p>
                  <p
                    className={` text-5xl text-white-500 font-inter-semibold bg-gradient-to-t py-8 rounded-3xl from-primary to-secondary `}
                  >
                    {state.price} р.
                  </p>
                </div>
                <div className=" px-5">
                  <div className=" mt-10 flex flex-row gap-3 text-white-500 font-inter-light text-base opacity-80 text-left mb-7">
                    <p>Программа:</p>
                    <p className=" font-inter-bold">{state.programName}</p>
                  </div>
                  <p className=" font-inter-bold text-2xl text-white-500 text-left mb-5">
                    К оплате:
                  </p>
                  <p
                    className={` text-5xl text-white-500 font-inter-semibold bg-gradient-to-t py-8 rounded-3xl from-primary to-secondary `}
                  >
                    110 р.
                  </p>
                </div>
              </div>
            </div>
            <div className=" absolute bottom-[44.9rem] right-[4rem]">
              <AttentionTag
                label={"Приложите карту для списания баллов!"}
                additionalStyles={` max-w-[300px] text-red-400`}
              />
            </div>
          </div>
        </div>
      )}
      {payType === "cashback" && !isCardRead && (
        <div className=" flex flex-row justify-between px-[5rem] gap-[10rem]">
          <div>
            <h1 className=" text-gray-500 font-inter-bold text-[3rem] text-left pl-1">
              Оплатите
            </h1>
            <p className=" text-left font-inter-bold text-[2rem] pl-2">
              Приложите банковскую карту
            </p>
            <img
              src={WifiPayCard}
              alt="wifi paycard"
              className=" size-[250px] object-contain mt-10"
            />
            <p className=" text-left font-inter-bold text-[2rem] pl-2">
              <span className=" text-primary">Или</span> внесите купюры в
              купюроприемник
            </p>
            <p className=" text-left pl-2 mt-2">
              Принимаются купюры номиналом:
            </p>
            <p className=" text-center px-[20px] max-w-[275px] py-[10px] text-[1.5rem] rounded-2xl bg-gray-500 font-inter-bold text-green-600 mt-4">
              50 / 100 / 200
            </p>
          </div>
          <div className=" bg-primary min-w-[350px] min-h-[700px] rounded-3xl flex flex-col justify-between shadow-[0px_20px_40px_15px_rgba(0,0,0,0.3)] mt-5">
            <div className="h-full">
              <div className=" h-full flex flex-col justify-between py-8 ">
                <div className=" px-5 border-b-4 border-b-blue-650 pb-[5rem]">
                  <div className=" flex flex-row justify-between">
                    <div className=" text-white-500">
                      <p className=" text-left">Ваш CashBack</p>
                      <p className=" font-inter-bold text-[32px] text-left">
                        +10%
                      </p>
                      <p className=" text-[12px] text-left">От этой мойки</p>
                    </div>
                    <img
                      src={Lightning}
                      alt="lightning"
                      className=" object-cover"
                    />
                  </div>
                  <p className=" font-inter-bold text-2xl text-white-500 text-left mb-5 mt-10">
                    К оплате:
                  </p>
                  <p
                    className={` text-5xl text-white-500 font-inter-semibold bg-gradient-to-t py-8 rounded-3xl from-primary to-secondary `}
                  >
                    {state.price} р.
                  </p>
                </div>
                <div className=" px-5">
                  <p className=" font-inter-bold text-2xl text-white-500 text-left mb-5">
                    Внесено:
                  </p>
                  <p
                    className={` text-5xl text-white-500 font-inter-semibold bg-gradient-to-t py-8 rounded-3xl from-primary to-secondary `}
                  >
                    110 р.
                  </p>
                </div>
              </div>
            </div>
            <div className=" absolute bottom-[17rem] right-[4rem]">
              <AttentionTag
                label={"Терминал сдачу не выдает!"}
                additionalStyles={` max-w-[210px] text-red-400`}
              />
            </div>
            <div>
              <button className=" font-inter-medium px-8 py-2 mb-7 bg-gradient-to-t from-blue-100 to-white-500 rounded-3xl shadow-[0px_10px_20px_0px_rgba(0,0,0,0.3)]">
                Оплатить
              </button>
            </div>
          </div>
        </div>
      )}
    </VideoLayout>
  );
}
