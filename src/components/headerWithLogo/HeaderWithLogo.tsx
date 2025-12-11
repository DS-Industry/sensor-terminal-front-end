import { Card, Icon } from '@gravity-ui/uikit';
import { ArrowLeft } from "@gravity-ui/icons";
import ClientLogo from "../logo/Logo";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import useStore from '../state/store';
import { logger } from '../../util/logger';

interface IHeaderWithLogoProps {
  isMainPage?: boolean;
  backButtonClick?: () => void;
  disableBackConfirmation?: boolean;
}

export default function HeaderWithLogo(props: IHeaderWithLogoProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    openBackConfirmationModal,
    setBackConfirmationCallback
  } = useStore();

  const handleBackClick = () => {
    logger.debug("[HeaderWithLogo] Нажали назад");

    if (props.backButtonClick) {
      logger.debug("[HeaderWithLogo] Есть пропс backButtonClick");
      openBackConfirmationModal();

      setBackConfirmationCallback(() => {
        if (props.backButtonClick) {
          props.backButtonClick();
        }
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <Card className="mx-7 my-5 p-4 shadow-lg border-0">
      <div className="flex justify-between items-center">
        <ClientLogo />
        <div className="flex items-center gap-4">
          {props.isMainPage
            ? <>
              <button
                className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
                onClick={() => navigate("/instruction")}
                style={{ backgroundColor: "#0B68E1" }}
              >
                Инструкция
              </button>
            </>
            :
            <button
              className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
              onClick={handleBackClick}
              style={{ backgroundColor: "#0B68E1" }}
            >
              <div className="flex items-center gap-2">
                <Icon data={ArrowLeft} size={20} />
                {t("Назад")}
              </div>
            </button>
          }
        </div>
      </div>
    </Card>
  );
}