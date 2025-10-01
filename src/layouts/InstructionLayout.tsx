import { useState } from "react";
import NavigationButton from "../components/buttons/NavigationButton";
import AttentionTag from "../components/tags/AttentionTag";
import InfoTag from "../components/tags/InfoTag";
import Car from "./../assets/car-instruction.svg";
import WhiteBack from "./../assets/exit_to_app_white.svg";
import Logo from "./../assets/Logo-white.svg";
import { useTranslation } from "react-i18next";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@radix-ui/react-menubar";
import { IoLanguageSharp } from "react-icons/io5";
import { LANGUAGES } from "../components/hard-data";
import i18n from "../i18n";

export default function InstructionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsloading] = useState<number>(0);
  const { t } = useTranslation();
  return (
    <main className=" w-screen min-h-screen">
      <div className=" flex flex-col justify-center items-center min-h-[500px] w-full bg-primary ">
        <div className=" w-full flex justify-between py-8 px-8">
          <div
            className={`min-w-[173px] min-h-[71px] rounded-xl bg-secondary animate-pulse ${
              isLoading < 3 ? "block" : "hidden"
            } `}
          ></div>
          <img
            src={Logo}
            alt="Logo"
            className={`${isLoading < 3 ? " hidden" : "block"} `}
            onLoad={() =>
              setIsloading((prevLoading) => {
                prevLoading += 1;
                return prevLoading;
              })
            }
          />
          <div className=" flex items-center gap-10">
            {/* <Menubar className=" border-0">
              <MenubarMenu>
                <MenubarTrigger className="text-lg bg-gradient-to-t from-primary to-blue-650 px-5 py-2 rounded-3xl text-white-500 font-inter-semibold shadow-[0px_10px_20px_5px_rgba(0,0,0,0.3)] h-fit ">
                  <IoLanguageSharp className=" text-3xl" />
                </MenubarTrigger>
                <MenubarContent className=" bg-white border-0 max-w-[150px] min-w-[150px] p-0 rounded-2xl mt-5">
                  {Object.entries(LANGUAGES).map(([key, lng]) => (
                    <MenubarItem
                      key={key}
                      className=" bg-white-500 text-primary w-full  text-xl my-1 rounded-3xl first:mt-0 last:mb-0"
                      onClick={() => i18n.changeLanguage(key)}
                    >
                      <p className=" w-full text-center"> {lng.label}</p>
                    </MenubarItem>
                  ))}
                </MenubarContent>
              </MenubarMenu>
            </Menubar> */}
            <NavigationButton
              label={
                <>
                  <img
                    src={WhiteBack}
                    alt="Back"
                    className={`${isLoading < 3 ? " hidden" : "block"} `}
                    onLoad={() =>
                      setIsloading((prevLoading) => {
                        prevLoading += 1;
                        return prevLoading;
                      })
                    }
                  />
                  <div
                    className={` min-w-[69px] min-h-[68px] bg-secondary animate-pulse rounded-xl ${
                      isLoading < 3 ? "block" : "hidden"
                    } `}
                  ></div>
                </>
              }
            />
          </div>
        </div>
        <p className=" font-inter-semibold text-white-500 text-5xl mb-20">
          {t("Габариты авто")}
        </p>
        <div className=" w-1/3 flex flex-row justify-evenly gap-5 mb-20">
          <InfoTag label={t("Высота")} value={`${t("до")} 2 м`} />
          <InfoTag label={t("Длина")} value={`${t("до")} 6.25 м`} />
          <InfoTag label={t("Ширина")} value={`${t("до")} 6 м`} />
        </div>
        <div className=" min-h-[387px] max-h-[387px] mb-5">
          <img
            src={Car}
            alt="car"
            onLoad={() =>
              setIsloading((prevLoading) => {
                prevLoading += 1;
                return prevLoading;
              })
            }
            className={` ${isLoading < 3 ? " hidden" : "block"} min-h-[387px]`}
          />
          <div
            className={`min-h-[400px] min-w-[770px] mb-5 bg-secondary opacity-70 animate-pulse rounded-3xl ${
              isLoading < 3 ? "block" : "hidden"
            }`}
          ></div>
        </div>

        <div className=" w-full flex justify-end mb-6 pr-8">
          <AttentionTag
            label={t("Не рекомендуется мыть автомобили с панорамной крышей!")}
            additionalStyles=" text-red-400 px-2 min-w-[20rem]"
          />
        </div>
      </div>
      <div>{children}</div>
    </main>
  );
}
