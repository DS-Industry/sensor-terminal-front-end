import { PAYS } from "../pays-data";
import PayCard from "../components/cards/PayCard";
import { Check, Clock } from "lucide-react";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { Text, Card } from "@gravity-ui/uikit";
import useStore from "../components/state/store";
import { useEffect, useRef, useState, useCallback } from "react";
import { loyaltyCheck } from "../api/services/payment";
import { EPaymentMethod } from "../components/state/order/orderSlice";
import { useNavigate } from "react-router-dom";
import { logger } from "../util/logger";

const IDLE_TIMEOUT = 30000;

const SINGLE_PAGE_URL = "SinglePage.webp";

export default function SingleProgramPage() {
  const navigate = useNavigate();
  const { selectedProgram, setIsLoyalty, isLoyalty } = useStore();
  const { attachemntUrl, mediaStatus } = useMediaCampaign(SINGLE_PAGE_URL);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkLoyalty = async() => {
    try {
      const isLoyalty = await loyaltyCheck();
      const loyaltyStatus = isLoyalty.loyalty_status;    
      setIsLoyalty(loyaltyStatus);
      setLoyaltyLoading(false);
    } catch (error) {
      logger.error("Ошибка при проверке лояльности", error);
    } finally {
      setLoyaltyLoading(false);
    }
  }

  const handleFinish = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const clearIdleTimeout = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    checkLoyalty();

    if (!idleTimeoutRef.current) {
      idleTimeoutRef.current = setTimeout(handleFinish, IDLE_TIMEOUT);
    }

    return () => {
      clearIdleTimeout();
    };
  }, [handleFinish]);

  const filteredPays = PAYS.filter(pay => {
    // Всегда исключаем MOBILE_PAYMENT
    if (pay.type === EPaymentMethod.MOBILE_PAYMENT) {
      return false;
    }
    // Если isLoyalty равно false, исключаем LOYALTY
    if (!isLoyalty && pay.type === EPaymentMethod.LOYALTY) {
      return false;
    }
    // В остальных случаях показываем карточку
    return true;
  });

  logger.debug("filteredPays", filteredPays);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-[#EEEEEE]">
      <MediaCampaign attachemntUrl={attachemntUrl} mediaStatus={mediaStatus}/>
      
      <div className="flex-1 flex flex-col">
        <HeaderWithLogo title="Выберите способ оплаты" />

        <div className="flex-1 px-7 pb-7">
          <div className="flex flex-col h-full">
          {selectedProgram && (
            <div className="flex flex-col h-full  mt-10">

              <div className="flex flex-row gap-6 justify-center items-center">
                <div className="w-80 flex-shrink-0" style={{ display: 'flex', alignSelf: 'stretch' }}>
                  <Card 
                    className="w-full bg-white rounded-[20px] shadow-xl overflow-hidden flex flex-col border-0 h-full" 
                    style={{
                      boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
                      borderRadius: "20px",
                      flex: '1 1 auto',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div 
                      className="flex-1 min-h-96 p-4 relative flex flex-col"
                      style={{
                        background: 'linear-gradient(to right, #0967E1, #D632EC)'
                      }}
                    >
                      <div 
                        className="absolute rounded-full opacity-70 blur-3xl animated-blob-1"
                        style={{
                          background: '#D632EC',
                          width: '320px',
                          height: '320px',
                          top: '5%',
                          left: '50%',
                          animation: 'blobMove1 6s ease-in-out infinite',
                          willChange: 'transform',
                        }}
                      />
                      <div 
                        className="absolute rounded-full opacity-70 blur-3xl animated-blob-2"
                        style={{
                          background: '#47BDF0',
                          width: '360px',
                          height: '360px',
                          bottom: '5%',
                          left: '5%',
                          animation: 'blobMove2 8s ease-in-out infinite',
                          willChange: 'transform',
                        }}
                      />
                      
                      <div className="relative z-10 flex flex-col flex-1">
                        <div className="flex justify-start mb-6">
                          <div className="shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-[#5292FF]">
                            <Clock className="w-4 h-4 text-white" />
                            <span className="text-sm font-medium text-white">{selectedProgram.duration} мин.</span>
                          </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-5 text-balance leading-tight text-white whitespace-nowrap text-center">{selectedProgram.name}</h2>

                        <div className="flex-1 min-h-0">
                          <ul className="space-y-2">
                            {selectedProgram.functions && selectedProgram.functions.split(", ").map((service, index) => (
                              <li key={index} className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-white flex-shrink-0" strokeWidth={3} />
                                <span className="text-sm font-medium text-white text-start">{service}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="absolute top-6 right-6 flex gap-1.5 z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      </div>
                    </div>

                    <div className="flex-shrink-0 p-6 bg-white text-center">
                      <div className="mb-6">
                        <span className="text-6xl font-bold text-gray-900 tracking-tight">{Number(selectedProgram.price)}</span>
                        <span className="text-2xl text-gray-500 ml-1">₽</span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" strokeWidth={3} />
                        <Text className="text-[#008618] font-semibold text-sm">
                          Выбранная программа
                        </Text>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex-1 max-w-4xl">
                  <div className="flex flex-wrap justify-center items-center gap-6">
                    {!loyaltyLoading && filteredPays.map((pay) => (
                      <PayCard
                        key={pay.endPoint}
                        payType={pay.type}
                        label={pay.label}
                        imgUrl={pay.imgUrl}
                        endPoint={pay.endPoint}
                        programName={selectedProgram.name}
                        price={selectedProgram.price}
                      />
                    ))}
                  </div>
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
