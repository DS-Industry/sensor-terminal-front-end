import gazpromHeader from "../assets/gazprom-step-2-header.webp";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";


export default function InstructionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <main className="h-[1024px] w-[1280px] bg-white overflow-hidden flex flex-col">
      <div className="w-full flex-shrink-0 h-64">
        <img 
          src={gazpromHeader} 
          alt="Header" 
          className="w-full h-full object-cover"
          decoding="async"
        />
      </div>
      <div className="flex-shrink-0">
        <HeaderWithLogo title="Инструкция" isInstructionPage={true} /> 
      </div>
      <div className="flex-1 overflow-hidden min-h-0">{children}</div>
    </main>
  );
}
