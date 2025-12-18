import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import { EOrderStatus } from "../components/state/order/orderSlice";
import BoxImage from "../assets/бокс.webp";
import CarImage from "../assets/car.webp";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import { navigateToWashing } from "../utils/navigation";
import { logger } from "../util/logger";

const SUCCESS_PAGE_URL = "SuccessPage.webp";

export default function SuccessPaymentPage() {
  const navigate = useNavigate();
  const { setIsLoading, order, queuePosition } = useStore();
  const { attachemntUrl, mediaStatus } = useMediaCampaign(SUCCESS_PAGE_URL);
  
  const [displayText, setDisplayText] = useState("Можете проезжать в бокс!");

  useEffect(() => {
    setIsLoading(false);
    setDisplayText("Можете проезжать в бокс!");
  }, [setIsLoading]);

  useEffect(() => {
    if (order?.status === EOrderStatus.COMPLETED) {
      logger.info('[SuccessPaymentPage] Order status is COMPLETED, redirecting to main');
      navigate("/");
      return;
    }

    // Redirect to washing page after 10 seconds (only if order is not COMPLETED)
    const redirectTimer = setTimeout(() => {
      if (order?.status !== EOrderStatus.COMPLETED) {
        logger.info('[SuccessPaymentPage] 10 seconds elapsed, redirecting to washing page');
        navigateToWashing(navigate);
      }
    }, 10000);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [order?.status, navigate]);

  return (
    <div className="flex flex-col h-[1920px] w-screen bg-gray-100 bg-[#0045FF] overflow-hidden">
      
        <MediaCampaign attachemntUrl={attachemntUrl} mediaStatus={mediaStatus} />
      
      <div className="flex-1 flex flex-col items-start justify-center bg-[#0045FF] relative overflow-hidden min-h-0">
        <div className="flex flex-col items-center gap-6 z-10 p-6">
          <div className="bg-[#89BAFB4D] rounded-3xl px-12 py-8">
            <h1 className="text-white text-6xl font-bold flex items-center justify-center gap-3">
              {displayText}
              <span className="text-white text-5xl"></span>
            </h1>
          </div>
          
          {queuePosition === null || queuePosition === 0 ? <div className="bg-[#89BAFB4D] rounded-2xl px-8 py-4 flex items-center gap-3">
            <div className="w-4 h-4 bg-[#15FF00] rounded-full flex-shrink-0"></div>
            <p className="text-white text-2xl font-semibold">
              Оплата успешна!
            </p>
          </div> : null}
        </div>

        <div className="relative w-full h-[600px] flex items-end justify-end pr-0 overflow-hidden">
          <div className="absolute -bottom-45 left-0 z-20 car-drive-animation">
            <img
              src={CarImage}
              alt="Car"
              className="w-auto h-[800px] md:h-[800px] object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="relative z-99 w-full -bottom-30 flex items-end justify-end pr-0 overflow-hidden">
            <img
              src={BoxImage}
              alt="Car wash box"
              className="h-full max-h-[900px] object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
