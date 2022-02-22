import {ScreenAction} from "../common/utilities";

export interface LandingScreenProps {
  appLogo: any;
  isCustomerSearchAvailable: () => boolean;
  isOrderInquiryEnabled: () => boolean;
  isGiftCardEnabled: () => boolean;
  isStoreOperationsEnabled: () => boolean;
  onMenuToggle: () => void;
  onScreenAction: (screenAction: ScreenAction) => void;
}
