import { useTranslation } from "react-i18next";
import { Card, Button, Icon, Text } from "@gravity-ui/uikit";
import { ArrowRight } from "@gravity-ui/icons";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useStore from "../state/store";
import { IProgram } from "../../api/types/program";

export default function ProgramCard(program: IProgram) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { order, setOrderProgramId, setSelectedProgram } = useStore.getState();

  return (
    <Card type="action" className="w-80 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border-0"
      onClick={() => {
        console.log("order:", order);
        setOrderProgramId(program.id);
        setSelectedProgram(program);
        navigate(`/programs/${program.id}`)
      }}
    >
      <div className="flex-shrink-0 h-96 p-6 relative flex flex-col bg-gradient-to-br from-blue-500 to-blue-600">
        {/* Duration Badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 self-start bg-white/20 backdrop-blur-sm border border-white/10">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">{program.duration} мин.</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 text-balance leading-tight text-white">{t(`${program.name}`)}</h2>

        {/* Service List - No scroll needed with bigger header */}
        <div className="flex-1">
          <ul className="space-y-3">
            {program.description.split(", ").map((service, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-white" />
                <span className="text-sm font-medium text-white">{t(`${service}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative dots */}
        <div className="absolute top-6 right-6 flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>
      </div>

      <div className="flex-shrink-0 p-6 bg-white">
        {/* Cashback Section */}
        <div className="flex items-center justify-between mb-6 p-4 bg-orange-50/80 rounded-2xl border border-orange-100/50">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1 font-medium">{t("Ваш CashBack")}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">10%</span>
            </div>
            <p className="text-xs text-gray-500">{t("От вашей мойки")}</p>
          </div>

          {/* Orange Circle Graphic */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 rounded-full shadow-lg opacity-90" />
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full shadow-md" />
            <div className="absolute top-2 left-2 w-3 h-3 bg-white/30 rounded-full" />
          </div>
        </div>

        <div className="mb-6 text-center">
          <span className="text-6xl font-bold text-gray-900 tracking-tight">{Number(program.price)}</span>
          <span className="text-2xl text-gray-500 ml-1">{t("р.")}</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between p-3 cursor-pointer animate-pulse">
          <Text className="text-black-800">{t("Выбрать программу")}</Text>
          <Icon data={ArrowRight} size={18} className="text-gray-600" />
        </div>


      </div>
    </Card>
  )

}