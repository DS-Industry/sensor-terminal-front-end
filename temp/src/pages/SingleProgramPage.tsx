import { PAYS } from "../pays-data";
import PayCard from "../components/cards/PayCard";
import { Clock } from "@gravity-ui/icons";
import { Check } from "lucide-react";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { Icon, Text, Card } from "@gravity-ui/uikit";
import useStore from "../components/state/store";
import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gazpromHeader from "../assets/gazprom-step-2-header.webp";

const IDLE_TIMEOUT = 30000;

export default function SingleProgramPage() {
  const navigate = useNavigate();
  const { selectedProgram } = useStore();
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!idleTimeoutRef.current) {
      idleTimeoutRef.current = setTimeout(handleFinish, IDLE_TIMEOUT);
    }

    return () => {
      clearIdleTimeout();
    };
  }, [handleFinish]);


  return (
    <div className="flex flex-col h-[1024px] w-[1280px] bg-gray-200 overflow-hidden">
      <div className="w-full flex-shrink-0 h-64">
        <img 
          src={gazpromHeader} 
          alt="Header" 
          className="w-full h-full object-cover"
          decoding="async"
        />
      </div>

      <div className="flex-1 flex flex-col bg-gray-200 overflow-hidden" style={{ height: 'calc(1024px - 256px)' }}>

        <HeaderWithLogo title="Выберите способ оплаты" />

        <div className="flex-1 px-7 pb-7 overflow-hidden">
          {selectedProgram && (
            <div className="flex flex-col h-full">

              <div className="flex flex-row gap-6 justify-center items-center">
                <div className="w-80 flex-shrink-0">
                  <Card className="bg-white rounded-3xl shadow-xl overflow-hidden border-0 h-full"  style={{
                      borderRadius: "20px",
                      boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    <div 
                      className="p-6 pb-8 relative min-h-[280px] overflow-hidden"
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
                      
                      <div className="relative z-10">
                        <div className="flex">
                        <div className="shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 self-start bg-[#5292FF]">
                            <Icon data={Clock} size={18} className="text-white" />
                            <Text className="text-white font-semibold text-sm">
                              {selectedProgram.duration} мин.
                            </Text>
                          </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-5 text-white leading-tight text-center">
                          {selectedProgram.name}
                        </h2>

                        <div className="space-y-2.5 mt-4">
                          {selectedProgram.functions && selectedProgram.functions.split(", ").map((service, index) => (
                            <div key={index} className="flex items-center gap-2.5">
                              <Check size={18} className="text-white flex-shrink-0 stroke-[3]" />
                              <Text className="text-white font-medium text-sm leading-relaxed">
                                {service}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-9 bg-white text-center">
                      <div className="mb-4">
                        <span className="text-6xl font-bold text-gray-900 tracking-tight">
                          {Number(selectedProgram.price)}
                        </span>
                        <span className="text-2xl text-gray-500 ml-1 font-semibold">
                          ₽
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Check size={18} className="text-green-500 flex-shrink-0 stroke-[3]" />
                        <Text className="text-[#008618] font-semibold text-sm">
                          Выбранная программа
                        </Text>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex-1 max-w-4xl">
                  <div className="flex justify-center items-center gap-6">
                    {PAYS.map((pay) => (
                      <PayCard
                        key={pay.endPoint}
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
  );
}
