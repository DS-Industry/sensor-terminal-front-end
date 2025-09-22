import "./../App.css";
import { useEffect, useState } from "react";
import ProgramCard from "../components/cards/ProgramCard";
import { useTranslation } from "react-i18next";
import useStore from "../components/state/store";
import { PROGRAMS } from "../fake-data";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";

export default function MainPage() {
  const divider = 4;
  const initTime = 180;
  const programs = Object.entries(PROGRAMS);
  const [time, setTime] = useState(initTime);
  const [percentage, setPercentage] = useState(0);
  const { t, i18n } = useTranslation();
  const {setOrder} = useStore.getState();

  // const { data: programs, error, isLoading } = useSWR<IProgram[]>(
  //   'getPrograms', 
  //   getPrograms,  
  //   {
  //     revalidateOnFocus: false, 
  //     revalidateOnReconnect: true, 
  //   }
  // );

  const { attachemntUrl } = useMediaCampaign();

  useEffect(() => {
    setOrder({});
  }, [])
  // const [displayPrograms, setDisplayPrograms] = useState<IProgram[]>([]);

  // useEffect(() => {
  //   if (programs) {
  //     setDisplayPrograms(programs);
  //   }
  // }, [programs]);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-200">
      {/* Video Section - 40% of screen height */}
      <MediaCampaign attachemntUrl={attachemntUrl}/>
      
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
                {t("Выберите программу")}
              </div>
            </div>

            {/* Program Cards Section */}
            <div className="flex-1 flex flex-col justify-center">
              <div
                className={`w-full ${
                  programs.length > 4 && "snap-x overflow-x-scroll scroll-p-40"
                }`}
              >
                <div
                  className={`flex flex-row justify-center gap-6 ${
                    programs.length > 4 ? "min-w-fit" : "w-full"
                  }`}
                >
                  {programs.map(([key, program], index) => (
                    <ProgramCard
                      key={index}
                      time={program.time}
                      title={program.title}
                      services={program.services}
                      price={program.price}
                      value={key}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
