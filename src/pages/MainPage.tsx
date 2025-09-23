import "./../App.css";
import ProgramCard from "../components/cards/ProgramCard";
import { useTranslation } from "react-i18next";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { usePrograms } from "../hooks/usePrograms";

export default function MainPage() {
  const { t } = useTranslation();
  const { programs } = usePrograms();
  const { attachemntUrl } = useMediaCampaign();

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
            {programs && (
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
                    {programs.map((item) => (
                      <ProgramCard
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        description={item.description}
                        duration={item.duration}
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
