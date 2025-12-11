import { RiVisaLine, RiMastercardFill } from "react-icons/ri";
import { FaApplePay, FaGooglePay } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { Card, Text } from "@gravity-ui/uikit";

interface IPayCard {
  label: string;
  imgUrl: string;
  endPoint: string;
  programName: string;
  price: string;
}

export default function PayCard({
  label,
  imgUrl,
  endPoint,
  programName,
  price,
}: IPayCard) {
  const navigate = useNavigate();

  return (
    <Card
      type="action"
      className="w-80 h-64 bg-[#0967E1] text-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border-0 overflow-hidden"
      onClick={() => {
        navigate(`./${endPoint}`, {
          state: {
            programName: programName,
            price: price,
          },
        });
      }}
      role="button"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`./${endPoint}`, {
            state: {
              programName: programName,
              price: price,
            },
          });
        }
      }}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <Text className="text-white font-bold text-[20px]">
            {label}
          </Text>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <img
            src={imgUrl}
            alt="logo pay way"
            className="h-24 w-auto object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="mt-4 h-20 flex items-center">
          <div className="bg-[#89BAFB99] p-2 rounded-2xl text-center w-full h-full flex flex-col justify-center">
            <div className="text-white/80 text-[15px] mb-1">Банковские карты</div>
            <div className="flex flex-row justify-center gap-3 items-center h-6">
              <RiMastercardFill className="text-white text-2xl" />
              <RiVisaLine className="text-white text-2xl" />
              <FaApplePay className="text-white text-2xl" />
              <FaGooglePay className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
