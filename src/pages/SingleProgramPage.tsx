import { PAYS } from "../pays-data";
import PayCard from "../components/cards/PayCard";
import { useTranslation } from "react-i18next";
import { Clock } from "@gravity-ui/icons";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { Icon, Text } from "@gravity-ui/uikit";
import useStore from "../components/state/store";

export default function SingleProgramPage() {
  const { t } = useTranslation();

  // const { data: paymentMethods, error: paymentMethodsError, isLoading: paymentMethodsLoading } = useSWR<IPaymentMethod[]>(
  //   '/payment-methods',
  //   getPaymentMethods,
  //   {
  //     revalidateOnFocus: false,
  //     errorRetryCount: 2,
  //   }
  // );

  const { selectedProgram } = useStore();
  const { attachemntUrl } = useMediaCampaign();

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-100">
      {/* Video Section - 40% of screen height */}
      <MediaCampaign attachemntUrl={attachemntUrl}/>

      {/* Content Section - 60% of screen height */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Controls */}
        <HeaderWithLogo />

        {/* Main Content Area */}
        <div className="flex-1 px-7">
          {selectedProgram && (
            <div className="flex flex-col h-full">
              {/* Program Title */}
              <div className="text-center mb-8 flex-col items-center">
                {/* Large Program Title */}
                <div className="text-gray-900 font-bold text-3xl mb-6">
                  {t(`${selectedProgram.name}`)}
                </div>
                
                {/* Duration Badge */}
                <div className="inline-flex items-center gap-3 bg-blue-100 px-6 py-2 rounded-full mb-4">
                  <Icon data={Clock} size={24} className="text-blue-600" />
                  <Text className="text-blue-800 font-semibold text-xl">
                    {selectedProgram.duration} {t("мин.")}
                  </Text>
                </div>
                
                {/* Description */}
                <div className="text-gray-600 text-sm">
                  {t(`${selectedProgram.description}`)}
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
                      programName={selectedProgram.name}
                      price={selectedProgram.price}
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
