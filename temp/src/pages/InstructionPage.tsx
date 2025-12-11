import InstructionLayout from "../layouts/InstructionLayout";
import Arrow from "./../assets/up-window.svg";
import Car from "./../assets/car-icon-instruction.webp";
import Stop from "./../assets/red-close.svg";
import Cycle from "./../assets/cycle.svg";
import CheckMark from "./../assets/Success_perspective_matte 1.svg";
import CarInstruction from "./../assets/car-instruction.svg";

export default function InstructionPage() {
  
  return (
    <InstructionLayout>
      <div className="bg-white h-full w-full overflow-hidden">
        <div className="flex flex-row gap-8 px-12 py-6 h-full">
          <div className="flex-1 overflow-hidden flex flex-col">
            <ul className="flex flex-col gap-4 flex-1 justify-between">
              <li className="flex flex-row items-start gap-4 flex-shrink-0">
                <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#0B68E1] text-white text-lg font-inter-bold flex-shrink-0 mt-1">
                  1
                </div>
                <img
                  src={CheckMark}
                  alt="checkmark"
                  className="w-12 h-12 flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <p className="text-lg text-left text-black flex-1" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  Выберите программу мойки и произведите оплату удобным для Вас способом
                </p>
              </li>

              <li className="flex flex-row items-start gap-4 flex-shrink-0">
                <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#0B68E1] text-white text-lg font-inter-bold flex-shrink-0 mt-1">
                  2
                </div>
                <img
                  src={Arrow}
                  alt="arrow"
                  className="w-12 h-12 flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <p className="text-lg text-left flex-1" style={{ fontSize: '18px', color: '#000000', lineHeight: '1.4' }}>
                  Закройте окна. Начинайте движение, после того, как на цифровом табло загорится надпись <span className="font-bold" style={{ color: '#00B600', fontSize: '20px', display: 'inline' }}>ПРОЕЗЖАЙТЕ В БОКС</span>
                </p>
              </li>

              <li className="flex flex-row items-start gap-4 flex-shrink-0">
                <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#0B68E1] text-white text-lg font-inter-bold flex-shrink-0 mt-1">
                  3
                </div>
                <img
                  src={Car}
                  alt="car"
                  className="w-12 h-12 flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <p className="text-lg text-left flex-1" style={{ fontSize: '18px', color: '#000000', lineHeight: '1.4' }}>
                  Перед началом основной мойки в программах Стандарт и Премиум, при въезде в бокс, вода подается на днище машины. <span className="font-bold" style={{ color: '#0967E1', fontSize: '20px', display: 'inline' }}>МЕДЛЕННО ПРОЕЗЖАЙТЕ</span> над зоной распыления воды, чтобы помыть днище машины и диски
                </p>
              </li>

              <li className="flex flex-row items-start gap-4 flex-shrink-0">
                <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#0B68E1] text-white text-lg font-inter-bold flex-shrink-0 mt-1">
                  4
                </div>
                <img
                  src={Stop}
                  alt="stop"
                  className="w-12 h-12 flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <p className="text-lg text-left text-black flex-1" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  Когда мойка днища завершится, проезжайте дальше в центр бокса. Расположите автомобиль по центру бокса. Когда на цифровом табло загорится надпись «Стоп» - завершите движение Заглушите двигатель
                </p>
              </li>

              <li className="flex flex-row items-start gap-4 flex-shrink-0">
                <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#0B68E1] text-white text-lg font-inter-bold flex-shrink-0 mt-1">
                  5
                </div>
                <img
                  src={Cycle}
                  alt="cycle"
                  className="w-12 h-12 flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <p className="text-lg text-left text-black flex-1" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  Консоли, подающие воду и моющие средства, пройдут необходимое количество циклов вокруг автомобиля, согласно выбранной программе
                </p>
              </li>

              <li className="flex flex-row items-start gap-4 flex-shrink-0">
                <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#0B68E1] text-white text-lg font-inter-bold flex-shrink-0 mt-1">
                  6
                </div>
                <img
                  src={Arrow}
                  alt="arrow"
                  className="w-12 h-12 flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <p className="text-lg text-left text-black flex-1" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                  По окончании мойки следуйте указаниям на цифровом табло и голосовым сигналам, можете выезжть из бокса
                </p>
              </li>
            </ul>
          </div>

          <div className="w-72 flex-shrink-0 flex flex-col items-center">
            <img
              src={CarInstruction}
              alt="car diagram"
              className="w-full h-auto mb-4 max-h-[400px] object-contain"
              style={{
                filter: "grayscale(100%)"
              }}
              loading="lazy"
              decoding="async"
            />
            <div className="flex flex-col gap-2 w-full">
              <div>
                <p className="text-start font-bold text-lg">
                  Ширина: до 2,6 м
                </p>
              </div>
              <div>
                <p className="text-start font-bold text-lg">
                  Длина: до 6,25 м
                </p>
              </div>
              <div>
                <p className="text-start font-bold text-lg">
                  Высота: до 2 м
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </InstructionLayout>
  );
}
