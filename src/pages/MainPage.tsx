import "./../App.css";
import Stop from "../assets/block.svg";
import { useEffect, useState } from "react";
import { secondsToTime } from "../util";
import ProgramCard from "../components/cards/ProgramCard";
import { Trans, useTranslation } from "react-i18next";
import { Text, Button, Card, Icon, DropdownMenu } from '@gravity-ui/uikit';
import { Globe } from "@gravity-ui/icons";
import Logo from "../assets/Logo.svg";
import { LANGUAGES, VIDEO_TYPES } from "../components/hard-data";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import { PROGRAMS } from "../fake-data";
import useSWR from 'swr';
import { IProgram } from "../api/types/program";
import { getPrograms } from "../api/services/program";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import ClientLogo from "../components/logo/Logo";

export default function MainPage() {
  const divider = 4;
  const initTime = 180;
  const programs = Object.entries(PROGRAMS);
  const [time, setTime] = useState(initTime);
  const [percentage, setPercentage] = useState(0);
  const { t, i18n } = useTranslation();
  const {setOrder} = useStore.getState();

  const navigate = useNavigate();

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
        <Card className="mx-7 my-5 p-4 shadow-lg border-0">
          <div className="flex justify-between items-center">
            <ClientLogo />
            <div className="flex items-center gap-4">
              {/* Language Dropdown */}
             

              {/* Navigation Button */}
              <button
                className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg" onClick={() => navigate("/instruction")}
                style={{ backgroundColor: "#0B68E1" }}
          >
            Инструкция
          </button>
            </div>
          </div>
        </Card>

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
