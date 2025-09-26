import { Button, Card, Icon, DropdownMenu } from '@gravity-ui/uikit';
import { ArrowLeft, Globe } from "@gravity-ui/icons";
import ClientLogo from "../logo/Logo";
import { LANGUAGES } from "../hard-data";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import useStore from '../state/store';

interface IHeaderWithLogoProps {
  isMainPage?: boolean;
  backButtonClick?: () => void;
}

export default function HeaderWithLogo(props: IHeaderWithLogoProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { insertedAmount } = useStore();

  return (
    <Card className="mx-7 my-5 p-4 shadow-lg border-0">
      <div className="flex justify-between items-center">
        <ClientLogo />
        <div className="flex items-center gap-4">
          {props.isMainPage
            ? <>
              <button
                className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg" onClick={() => navigate("/instruction")}
                style={{ backgroundColor: "#0B68E1" }}
              >
                Инструкция
              </button>
            </>
            : <>
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
              <button
                className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
                onClick={() => {
                  if (insertedAmount === 0) {
                    if (props.backButtonClick) {
                      props.backButtonClick();
                    } else {
                      navigate('/');
                    }
                  }
                }}
                style={{ backgroundColor: "#0B68E1" }}
              >
                <div className="flex items-center gap-2">
                  <Icon data={ArrowLeft} size={20} />
                  {t("Назад")}
                </div>
              </button>
            </>
          }
        </div>
      </div>
    </Card>
  );
}           