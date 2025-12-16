import "./../App.css";
import ProgramCard from "../components/cards/ProgramCard";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { usePrograms } from "../hooks/usePrograms";
import { useEffect } from "react";
import useStore from "../components/state/store";
import { EOrderStatus } from "../components/state/order/orderSlice";
import { startRobot } from "../api/services/payment";
import { useNavigate } from "react-router-dom";
import { logger } from "../util/logger";

const MAIN_PAGE_URL = "MainPage.webp";

export default function MainPage() {
  const { programs } = usePrograms();
  const { attachemntUrl, mediaStatus } = useMediaCampaign(MAIN_PAGE_URL);
  const { order, clearOrder, setInsertedAmount, setIsLoading } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearOrder();
    setInsertedAmount(0);
    setIsLoading(false);
  }, [])

  useEffect(() => {
    if (order?.status === EOrderStatus.PAYED) {
      logger.info("Оплата мобильным приложением", order);

      if (order.id) {
        startRobot(order.id);
        navigate('/success');
      }
    }
  }, [order])

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-200">
      {/* Video Section - 40% of screen height */}
      <MediaCampaign attachemntUrl={attachemntUrl} mediaStatus={mediaStatus}/>
      
      {/* Content Section - 60% of screen height */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Controls */}
        <HeaderWithLogo isMainPage={true}/> 

        {/* Main Content Area */}
        <div className="flex-1 px-7 pb-7">
          <div className="flex flex-col h-full">
            
            {/* Title Section */}
            <div className="mb-8">
              <div className="text-gray-900 font-bold text-4xl text-center">
                Выберите программу
              </div>
            </div>

            {/* Program Cards Section */}
            {programs && (
              <div className="flex-1 flex flex-col justify-center">
                <div
                  className={`w-full snap-x`}
                >
                  <div
                    className={`flex flex-row justify-center gap-6 w-full`}
                  >
                    {programs.map((item) => (
                      <ProgramCard
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        description={item.description}
                        duration={item.duration}
                        functions={item.functions}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
