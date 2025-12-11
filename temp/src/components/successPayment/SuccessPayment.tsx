import QRCode from "react-qr-code";
import CheckMark from "../../assets/Success_perspective_matte 1.svg";
import useStore from "../state/store";
import { Spin, Icon } from "@gravity-ui/uikit";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "@gravity-ui/icons";
import { useRobotStart } from "../../hooks/payment/useRobotStart";

export default function SuccessPayment() {
  const navigate = useNavigate();
  const { bankCheck, order, timeUntilRobotStart } = useStore();
  const { handleStartRobot } = useRobotStart({
    orderId: order?.id,
    navigate,
  });

  const [isCheckLoading, setIsCheckLoading] = useState(!bankCheck);

  useEffect(() => {
    if (bankCheck) {
      setIsCheckLoading(false);
    } else {
      const timeout = setTimeout(() => {
        setIsCheckLoading(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [bankCheck]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#EEE]">
      <div className="flex flex-col items-center">

        {isCheckLoading ? (
          <>  
            <img
              src={CheckMark}
              alt="check mark"
              className="min-w-[160px] min-h-[160px] max-w-[160px] max-h-[160px] mb-2"
              loading="lazy"
              decoding="async"
            />
            <p className="text-gray-800 text-6xl font-semibold mb-12">
              Успешно
            </p>
            <div className="flex flex-col items-center">
              <Spin size="xl" />
              <p className="text-gray-600 text-xl font-medium mt-4">
                Формирование чека...
              </p>
            </div>
          </>
        ) : bankCheck ? (
          <>
            <div className="flex flex-col items-center">
              <div className="w-[282px] h-[282px] bg-white rounded-2xl flex items-center justify-center mb-4 p-4 shadow-lg">
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={bankCheck}
                  viewBox="0 0 256 256"
                />
              </div>
              <p className="text-gray-600 text-xl font-medium mb-8">
                Ваш чек
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                className="w-[420px] h-[58px] px-12 py-5 rounded-full bg-blue-600 text-white font-semibold text-[20px] transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                onClick={handleStartRobot}
                disabled={!order?.id}
                aria-label="Запустить мойку"
              >
                Запустить мойку
              </button>
              {timeUntilRobotStart > 0 && (
                <div className="flex items-center gap-2 text-gray-600 text-lg">
                  <Icon data={Clock} size={20} />
                  <span>Автоматический запуск через {timeUntilRobotStart} сек...</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>  
            <img
              src={CheckMark}
              alt="check mark"
              className="min-w-[160px] min-h-[160px] max-w-[160px] max-h-[160px] mb-2"
              loading="lazy"
              decoding="async"
            />
            <p className="text-gray-800 text-6xl font-semibold mb-12">
              Успешно
            </p>
            <div className="flex flex-col items-center mb-8">
              <p className="text-gray-600 text-xl font-medium">
                Чек не сформирован
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                className="w-[420px] h-[58px] px-12 py-5 rounded-full bg-blue-600 text-white font-semibold text-[20px] transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                onClick={handleStartRobot}
                disabled={!order?.id}
                aria-label="Запустить мойку"
              >
                Запустить мойку
              </button>
              {timeUntilRobotStart > 0 && (
                <div className="flex items-center gap-2 text-gray-600 text-lg">
                  <Icon data={Clock} size={20} />
                  <span>Автоматический запуск через {timeUntilRobotStart} сек...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}