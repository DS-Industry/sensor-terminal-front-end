import NavigationButton from "../components/buttons/NavigationButton";
import Logo from "../assets/Logo-white.svg";
import WhiteBack from "../assets/exit_to_app_white.svg";
import Emoji from "../assets/emoji-sad.svg";
import Sally from "../assets/Saly-2.svg";

export default function ErrorPaymentPage() {
  return (
    <section className=" bg-primary h-screen w-screen">
      <div className=" w-full flex justify-between py-8 px-8">
        <img
          src={Logo}
          alt="Logo"
          className={`min-w-[173px] min-h-[71px] max-w-[173px] max-h-[71px]`}
        />

        <NavigationButton
          label={
            <img
              src={WhiteBack}
              alt="Back"
              className={`min-w-[69px] min-h-[68px] max-w-[69px] max-h-[68px]`}
            />
          }
        />
      </div>
      <div className={` flex flex-col items-center`}>
        <img src={Emoji} className=" mt-10" />
        <p className=" font-inter-bold text-white-500 text-[6rem] px-[7rem] mt-20">
          Недостаточно
        </p>
        <p className=" font-inter-bold text-white-500 text-[6rem] px-[7rem]">
          баллов
        </p>
        <p className=" font-inter-bold text-white-500 text-[6rem] px-[7rem]">
          для оплаты
        </p>
        <img
          src={Sally}
          alt="sally"
          className=" min-w-[50rem] min-h-[50rem] max-w-[10rem] max-h-[5rem] object-cover mt-5"
        />
      </div>
      <div>
        <button className=" font-inter-medium text-[1.5rem] px-10 py-2 bg-gradient-to-t from-blue-100 to-white-500 rounded-3xl shadow-[0px_10px_20px_0px_rgba(0,0,0,0.3)]">
          Понятно
        </button>
      </div>
    </section>
  );
}
