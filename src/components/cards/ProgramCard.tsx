import { Card, Icon, Text } from "@gravity-ui/uikit";
import { ArrowRight } from "@gravity-ui/icons";
import { Clock, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useStore from "../state/store";
import { IProgram } from "../../api/types/program";
import { logger } from "../../util/logger";

export default function ProgramCard(program: IProgram) {
  const navigate = useNavigate();

  const { setOrderProgramId, setSelectedProgram } = useStore.getState();

  return (
    <div className="w-80" style={{ display: 'flex', alignSelf: 'stretch' }}>
      <Card 
        type="action" 
        className="w-full bg-white rounded-[20px] shadow-xl overflow-hidden flex flex-col border-0" 
        style={{
          boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
          borderRadius: "20px",
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      onClick={() => {
        logger.debug(`ProgramCard: Selected program ${program.id}`);
        setOrderProgramId(program.id);
        setSelectedProgram(program);
        navigate(`/programs/${program.id}`)
      }}
      role="button"
      aria-label={`Выбрать программу ${program.name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOrderProgramId(program.id);
          setSelectedProgram(program);
          navigate(`/programs/${program.id}`)
        }
      }}
    >
      <div 
        className="flex-1 min-h-96 p-4 relative flex flex-col"
        style={{
          background: 'linear-gradient(to right, #0967E1, #D632EC)'
        }}
      >
        {/* Animated blurred shapes */}
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
              <span className="text-sm font-medium text-white">{program.duration} мин.</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-5 text-balance leading-tight text-white whitespace-nowrap text-center">{program.name}</h2>

          <div className="flex-1 min-h-0">
            <ul className="space-y-2">
              {program.functions && program.functions.split(", ").map((service, index) => (
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

      <div className="flex-shrink-0 p-6 bg-white">
        <div className="mb-6 text-center">
          <span className="text-6xl font-bold text-gray-900 tracking-tight">{Number(program.price)}</span>
          <span className="text-2xl text-gray-500 ml-1">₽</span>
        </div>

        <div className="flex items-center justify-between p-3 cursor-pointer animate-pulse">
          <Text className="text-black-800">Выбрать программу</Text>
          <Icon data={ArrowRight} size={18} className="text-gray-600" />
        </div>
      </div>
    </Card>
    </div>
  )
}