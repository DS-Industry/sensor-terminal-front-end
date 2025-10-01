import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import CheckMark from "../../assets/Success_perspective_matte 1.svg";
import useStore from "../state/store";

export default function SuccessPayment() {
  const { t } = useTranslation();
  const { bankCheck } = useStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex flex-col items-center">
        <img
          src={CheckMark}
          alt="check mark"
          className="min-w-[160px] min-h-[160px] max-w-[160px] max-h-[160px] mb-2"
        />
        <p className="text-gray-800 text-6xl font-semibold mb-12">
          {t("Успешно")}
        </p>

        {bankCheck && (
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
              {t("Ваш чек")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}