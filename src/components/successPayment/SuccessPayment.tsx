import QRCode from "react-qr-code";
import CheckMark from "../../assets/Success_perspective_matte 1.svg";
import useStore from "../state/store";
import { Spin } from "@gravity-ui/uikit";
import { useEffect, useState } from "react";

export default function SuccessPayment() {
  const { bankCheck } = useStore();
  const [isCheckLoading, setIsCheckLoading] = useState(!bankCheck);

  useEffect(() => {
    // Если чек уже есть, не показываем загрузку
    if (bankCheck) {
      setIsCheckLoading(false);
    } else {
      // Если чека нет, показываем загрузку максимум 10 секунд
      const timeout = setTimeout(() => {
        setIsCheckLoading(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [bankCheck]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex flex-col items-center">
        <img
          src={CheckMark}
          alt="check mark"
          className="min-w-[160px] min-h-[160px] max-w-[160px] max-h-[160px] mb-2"
        />
        <p className="text-gray-800 text-6xl font-semibold mb-12">
          Успешно
        </p>

        {isCheckLoading ? (
          <div className="flex flex-col items-center">
            <Spin size="xl" />
            <p className="text-gray-600 text-xl font-medium mt-4">
              Формирование чека...
            </p>
          </div>
        ) : bankCheck ? (
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mb-4 p-4 shadow-lg">
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={bankCheck}
                viewBox="0 0 256 256"
              />
            </div>
            <p className="text-gray-600 text-xl font-medium">
              Ваш чек
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-600 text-xl font-medium">
              Чек не сформирован
            </p>
          </div>
        )}
      </div>
    </div>
  );
}