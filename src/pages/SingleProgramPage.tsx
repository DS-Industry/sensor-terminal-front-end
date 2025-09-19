import { useNavigate, useParams } from "react-router-dom";
import { PAYS, PROGRAMS } from "../fake-data";
import { LANGUAGES, VIDEO_TYPES } from "../components/hard-data";
import { useEffect, useState } from "react";
import PayCard from "../components/cards/PayCard";
import { useTranslation } from "react-i18next";
import { Text, Button, Card, Icon, DropdownMenu } from '@gravity-ui/uikit';
import { ArrowLeft, Clock, Globe } from "@gravity-ui/icons";
import Logo from "../assets/Logo.svg";

export default function SingleProgramPage() {
  const { program } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // const { data: currentProgram, error: programError, isLoading: programLoading } = useSWR<IProgram | null>(
  //   programId ? `/programs/${programId}` : null, 
  //   () => programId ? getProgramById(programId) : null, 
  //   {
  //     revalidateOnFocus: false,
  //     errorRetryCount: 2,
  //   }
  // );

  // const { data: paymentMethods, error: paymentMethodsError, isLoading: paymentMethodsLoading } = useSWR<IPaymentMethod[]>(
  //   '/payment-methods',
  //   getPaymentMethods,
  //   {
  //     revalidateOnFocus: false,
  //     errorRetryCount: 2,
  //   }
  // );

  const [attachemntUrl] = useState<{
    baseUrl: string;
    programUrl: string;
  }>({
    baseUrl: `${import.meta.env.VITE_ATTACHMENT_BASE_URL}`,
    programUrl: program ? PROGRAMS[program]?.promoUrl || '' : '',
  });

  useEffect(() => {
    if (!program) navigate("/");
  }, [program, navigate]);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-100">
      {/* Video Section - 40% of screen height */}
      <div className="h-[40vh] w-full flex justify-center items-center relative overflow-hidden">
        <iframe
          src={`/test_video_sensor_terminal.mp4`}
          allow="autoplay"
          id="video"
          className="hidden"
        />
        {program && attachemntUrl.programUrl && VIDEO_TYPES.some((ext: string) =>
          attachemntUrl.programUrl.endsWith(ext)
        ) ? (
          <video
            className="w-full h-full object-cover"
            width="320"
            height="240"
            autoPlay
            loop
            muted
          >
            <source src={attachemntUrl.programUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : program && attachemntUrl.programUrl ? (
          <img
            src={attachemntUrl.programUrl}
            alt="Program Image"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={`${attachemntUrl.baseUrl}`}
            alt="Promotion img"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content Section - 60% of screen height */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Controls */}
        <Card className="mx-7 my-5 p-4 shadow-lg border-0">
          <div className="flex justify-between items-center">
            <img src={Logo} alt="Logo" className="h-12" />
            <div className="flex items-center gap-4">
              {/* Language Dropdown */}
              <DropdownMenu
                items={Object.entries(LANGUAGES).map(([key, lng]) => ({
                  action: () => i18n.changeLanguage(key),
                  text: (lng as { label: string }).label,
                }))}
              >
                <Button
                  view="action"
                  size="l"
                  className="px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <Icon data={Globe} size={20} />
                </Button>
              </DropdownMenu>

              {/* Back Button */}
              <button
                className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
                onClick={() => navigate("/")}
                style={{ backgroundColor: "#0B68E1" }}
              >
                <div className="flex items-center gap-2">
                  <Icon data={ArrowLeft} size={20} />
                  {t("Назад")}
                </div>
              </button>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="flex-1 px-7">
          {program && (
            <div className="flex flex-col h-full">
              {/* Program Title */}
              <div className="text-center mb-8 flex-col items-center">
                {/* Large Program Title */}
                <div className="text-gray-900 font-bold text-3xl mb-6">
                  {t(`${PROGRAMS[program].title}`)}
                </div>
                
                {/* Duration Badge */}
                <div className="inline-flex items-center gap-3 bg-blue-100 px-6 py-2 rounded-full mb-4">
                  <Icon data={Clock} size={24} className="text-blue-600" />
                  <Text className="text-blue-800 font-semibold text-xl">
                    {PROGRAMS[program].time} {t("мин.")}
                  </Text>
                </div>
                
                {/* Description */}
                <div className="text-gray-600 text-sm">
                  {t(`${PROGRAMS[program].description}`)}
                </div>
              </div>

              {/* Payment Selection */}
              <div className=" mt-3.5 flex flex-col justify-center">

                {/* Payment Cards */}
                <div className="grid grid-cols-2 gap-6 justify-items-center max-w-2xl mx-auto">
                  {PAYS.map((pay, index) => (
                    <PayCard
                      key={index}
                      payType={pay.type}
                      label={pay.label}
                      imgUrl={pay.imgUrl}
                      endPoint={pay.endPoint}
                      programName={PROGRAMS[program].title}
                      price={PROGRAMS[program].price}
                      programUrl={`${program && PROGRAMS[program].promoUrl}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
