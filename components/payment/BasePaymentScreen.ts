import * as React from "react";
import { Keyboard } from "react-native";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DI_TYPES as CORE_DI_TYPES,
  IConfigurationManager,
  IConfigurationValues,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_TENDER_EVENT,
  CANCEL_PARTIAL_AUTHORIZATION_EVENT,
  CANCEL_TENDER_SESSION_EVENT,
  ITenderGroup,
  RETRY_AUTHORIZATION_EVENT,
  TenderAuthCategory,
  TenderType,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { IPaymentStatus } from "@aptos-scp/scp-types-commerce-devices";

import { ActionCreator } from "../../actions";
import { BusinessState, SettingsState } from "../../reducers";
import { RenderSelectOptions } from "../common/FieldValidation";
import {
  getActiveTenderGroups,
  getActiveTenders,
  getActiveTenderTypes,
  getIsGiftCardDeviceFilter,
  getPaymentDevicesAsRenderSelect,
  IOriginalTransactionRefundReference,
  ITenderType,
  makePaymentDeviceTypeFilter
} from "./PaymentDevicesUtils";
import { IForeignTender } from "./interfaces";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.payment.BasePaymentScreen");

export interface BasePaymentScreenStateProps {
  businessState: BusinessState;
  paymentStatus: Map<string, IPaymentStatus>;
  settings: SettingsState;
}

export interface BasePaymentScreenDispatchProps {
  performBusinessOperation: ActionCreator;
}

export interface BasePaymentScreenProps extends BasePaymentScreenStateProps, BasePaymentScreenDispatchProps {}

export interface BasePaymentScreenState {
  tenderAmount: string;
  tenderAuthCategory: string;
  tenderId: string;
  tenderType: string;
  references: IOriginalTransactionRefundReference[];
  showPaymentDeviceSelection: boolean;
  offlineOptionsOn: boolean;
  retryAuthorizationOn: boolean;
  useFirstDeviceOnly: boolean;
}

export default abstract class BasePaymentScreen<P extends BasePaymentScreenProps, S extends BasePaymentScreenState>
    extends React.Component<P, S> {
  protected activeTenders: ITenderType[];
  protected allowsRefundOriginalTenders: ITenderType[];
  protected activeTenderGroups: ITenderGroup[];
  protected primaryPaymentDevices: RenderSelectOptions[] = undefined;
  protected nonIntegratedPaymentDevices: RenderSelectOptions[] = undefined;
  protected primaryGiftDevices: RenderSelectOptions[] = undefined;
  protected walletPaymentDevices: RenderSelectOptions[] = undefined;
  protected isPrimaryPaymentDevices: (status: IPaymentStatus) => boolean = undefined;
  protected isNonIntegratedPaymentDevice: (status: IPaymentStatus) => boolean = undefined;
  protected isPrimaryGiftDevice: (status: IPaymentStatus) => boolean = undefined;
  protected isWalletPaymentDevice: (status: IPaymentStatus) => boolean = undefined;
  protected softMaxProceed: boolean;

  public constructor(props: P) {
    super(props);

    const tenders = getActiveTenders(this.props.settings.diContainer,
        this.props.businessState.stateValues.get("transaction.accountingCurrency"),
        this.props.businessState.stateValues.get("transaction.total"),
        this.props.businessState.displayInfo);
    this.activeTenders = getActiveTenderTypes(this.props.settings.diContainer,
        this.props.businessState.stateValues.get("transaction.accountingCurrency"),
        this.props.businessState.stateValues.get("transaction.total"),
        this.props.businessState.displayInfo);
    this.activeTenderGroups =
        getActiveTenderGroups(this.props.settings.diContainer,
        this.props.businessState.stateValues.get("transaction.accountingCurrency"),
        this.props.businessState.stateValues.get("transaction.total"),
        this.props.businessState.displayInfo,
        tenders,
        this.props.businessState.stateValues.get("TenderSession.originalTransactionDetails"));

    const refundOriginalTenders = TenderType.getActiveSuggestedRefundTenders(this.props.settings.diContainer,
        this.props.businessState.stateValues.get("transaction.accountingCurrency"));
    this.allowsRefundOriginalTenders = [];
    refundOriginalTenders.forEach((aTender: TenderType) => {
      this.allowsRefundOriginalTenders.push(
        {
          tenderAuthCategory: aTender.tenderAuthCategory,
          tenderId: aTender.id,
          tenderName: aTender.tenderName,
          pluralTenderName: aTender.pluralTenderName,
          tenderLabel: aTender.tenderLabel,
          tenderType: aTender.tenderTypeName,
          pinRules: aTender.pinRules,
          allowRefund: aTender.allowRefund
        }
      );
    });

    const peripheralsConfig: IConfigurationValues = this.props.settings.diContainer
         .get<IConfigurationManager>(CORE_DI_TYPES.IConfigurationManager).getPeripheralsValues();
    let primaryDeviceId: string | string[] = [];
    try {
      primaryDeviceId =
        peripheralsConfig.paymentType.primaryDevicesByTerminalId &&
        peripheralsConfig.paymentType.primaryDevicesByTerminalId[this.props.settings.deviceIdentity.deviceId]
        || peripheralsConfig.paymentType.primaryDeviceId;

      this.isPrimaryPaymentDevices = makePaymentDeviceTypeFilter(primaryDeviceId);

    } catch (error) {
      // todo: how do we want to handle misconfigured peripherals?
      this.isPrimaryPaymentDevices = (): boolean => true;
    }

    this.primaryPaymentDevices =
        getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isPrimaryPaymentDevices);

    try {
      this.isPrimaryGiftDevice = getIsGiftCardDeviceFilter(this.props.settings.configurationManager,
            this.props.settings.deviceIdentity.deviceId);

    } catch (error) {
      // todo: how do we want to handle misconfigured peripherals?
      this.isPrimaryGiftDevice = (): boolean => true;
    }

    this.primaryGiftDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isPrimaryGiftDevice);

    try {
      const walletDeviceId: string | string[] = peripheralsConfig.paymentType.walletDeviceId ||
          primaryDeviceId;

      this.isWalletPaymentDevice = makePaymentDeviceTypeFilter(walletDeviceId);

    } catch (error) {
      // todo: how do we want to handle misconfigured peripherals?
      this.isWalletPaymentDevice = (): boolean => true;
    }
    this.walletPaymentDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isWalletPaymentDevice);

    try {
      const nonIntegratedDeviceId: string | string[] = peripheralsConfig.paymentType.nonIntegratedDeviceId;
      this.isNonIntegratedPaymentDevice = makePaymentDeviceTypeFilter(nonIntegratedDeviceId);
      this.nonIntegratedPaymentDevices = nonIntegratedDeviceId &&
          getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isNonIntegratedPaymentDevice);
    } catch (error) {
      // todo: how do we want to handle misconfigured peripherals?
      this.isNonIntegratedPaymentDevice = (): boolean => true;
    }
  }

  public abstract render(): JSX.Element;

  // FIXME: An object should be passed here since there is too much optional params being used
  protected handlePayment(tenderAuthCategory: string, tenderId: string, tenderAmount?: string,
                          originalTenderAmount?: string, valueCertificateNumber?: string, cardNumber?: string,
                          cardSource?: string, pin?: string, references?: IOriginalTransactionRefundReference[],
                          giftCardRefund?: boolean, useSwipe?: boolean, existingCard?: boolean,
                          tenderType?: string, tenderSubType?: string, foreignTender?: IForeignTender): void {
    const initializedPrimaryPaymentDevices: number = this.primaryPaymentDevices.length;
    const initializedWalletDevice: number = this.walletPaymentDevices && this.walletPaymentDevices.length;
    if (this.state.useFirstDeviceOnly ||
        (initializedPrimaryPaymentDevices === 1 && tenderAuthCategory === TenderAuthCategory.PaymentDevice)) {
      this.performTenderPayment(tenderAuthCategory, tenderId, tenderAmount, originalTenderAmount, this.primaryPaymentDevices[0].code,
          undefined, cardNumber, cardSource, pin, references,
          undefined, undefined, undefined, tenderType);
    } else if (initializedPrimaryPaymentDevices && tenderAuthCategory === TenderAuthCategory.PaymentDevice) {
      this.setState({tenderAuthCategory, tenderAmount, tenderId, references, tenderType});

      this.setState({ showPaymentDeviceSelection: true });
    } else if (tenderAuthCategory === TenderAuthCategory.NonIntegratedDevice) {
      this.performTenderPayment(tenderAuthCategory, tenderId, tenderAmount, originalTenderAmount,
          this.nonIntegratedPaymentDevices[0].code, undefined, undefined, undefined, undefined, references, undefined,
          undefined, undefined, tenderType);
    } else if (tenderAuthCategory === TenderAuthCategory.Wallet) {
      if (initializedWalletDevice === 1) {
        this.performTenderPayment(tenderAuthCategory, tenderId, tenderAmount, originalTenderAmount,
            this.walletPaymentDevices[0].code, undefined, cardNumber, cardSource, pin, references, undefined, undefined,
            undefined, tenderType);
      } else {
        this.setState({tenderAuthCategory, tenderAmount, tenderId, references, tenderType});
        this.setState({showPaymentDeviceSelection: true});
      }
     } else {
      this.performTenderPayment(tenderAuthCategory, tenderId, tenderAmount, originalTenderAmount, undefined,
          valueCertificateNumber, cardNumber, cardSource, pin, references, giftCardRefund, useSwipe, existingCard,
          tenderType, tenderSubType, foreignTender);
    }
  }

  protected onApplyPaymentDeviceSelected(deviceId: string): void {
    this.setState({ showPaymentDeviceSelection: false });
    this.performTenderPayment(this.state.tenderAuthCategory, this.state.tenderId, this.state.tenderAmount, undefined,
        deviceId, undefined, undefined, undefined, undefined, this.state.references, undefined, undefined, undefined,
        this.state.tenderType);
  }

  protected handleCancelAuthorization(): void {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, CANCEL_TENDER_SESSION_EVENT, []);
    this.setState({offlineOptionsOn: false, retryAuthorizationOn: false});
  }

  protected handleCancelPartialAuthorization(): void {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, CANCEL_PARTIAL_AUTHORIZATION_EVENT, []);
    this.setState({offlineOptionsOn: false, retryAuthorizationOn: false});
  }

  protected handleRetryAuthorization(): void {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, RETRY_AUTHORIZATION_EVENT, []);
    this.setState({offlineOptionsOn: false, retryAuthorizationOn: false});
  }

  private performTenderPayment(tenderAuthCategory: string, tenderId: string, tenderAmount?: string,
                               originalTenderAmount?: string, deviceId?: string, valueCertificateNumber?: string,
                               cardNumber?: string, cardSource?: string, pin?: string,
                               references?: IOriginalTransactionRefundReference[], giftcardRefund?: boolean,
                               useSwipe?: boolean, existingCard?: boolean, tenderType?: string,
                               tenderSubType?: string, foreignTender?: IForeignTender): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME, tenderAuthCategory));
    if (tenderId) {
      uiInputs.push(new UiInput(UiInputKey.TENDER_ID, tenderId));
    }
    if (tenderAmount) {
      uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, tenderAmount));
    }
    if (originalTenderAmount) {
      uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT_ORIGINAL, originalTenderAmount));
    }
    if (tenderType) {
      uiInputs.push(new UiInput(UiInputKey.MAPPED_REFUND_TENDER_TYPE_NAME, tenderType))
    }
    if (valueCertificateNumber) {
      uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_NUMBER, valueCertificateNumber));
    }
    if (pin) {
      uiInputs.push(new UiInput(UiInputKey.GIFT_CARD_PIN, pin));
    }
    if (references) {
      uiInputs.push(new UiInput(UiInputKey.ORIGINAL_TRANSACTION_LINE_REFERENCES, references));
    }

    uiInputs.push(new UiInput(UiInputKey.SOFT_MAX_PROCEED, this.softMaxProceed));

    if (tenderSubType) {
      uiInputs.push(new UiInput(UiInputKey.TENDER_SUB_TYPE, tenderSubType));
    }

    if (foreignTender) {
      if (foreignTender.foreignTenderAmount) {
        uiInputs.push(new UiInput(UiInputKey.FOREIGN_TENDER_AMOUNT, foreignTender.foreignTenderAmount));
      }
      if (foreignTender.exchangeRateValue) {
        uiInputs.push(new UiInput(UiInputKey.EXCHANGE_RATE_VALUE, foreignTender.exchangeRateValue));
      }
      if (foreignTender.exchangeRateManuallyEntered) {
        uiInputs.push(new UiInput(UiInputKey.IS_MANUAL_EXCHANGE_RATE_ENTRY, foreignTender.exchangeRateManuallyEntered));
      }
    }

    if (giftcardRefund) {
      if (!useSwipe) {
        uiInputs.push(new UiInput("cardNumber", cardNumber, "string", cardSource));
      } else {
        uiInputs.push(new UiInput("giftCardIssueSwipe", true));
      }

      uiInputs.push(new UiInput(UiInputKey.EXISTING_GIFT_CARD, existingCard));

      const primaryGiftDeviceId: string = this.primaryGiftDevices && this.primaryGiftDevices.length === 1 &&
          this.primaryGiftDevices[0].code;
      if (primaryGiftDeviceId) {
        uiInputs.push(new UiInput(UiInputKey.AUTHORIZATION_DEVICE_ID, primaryGiftDeviceId));
      }
    } else {
      if (cardNumber) {
        uiInputs.push(new UiInput(UiInputKey.REDEEM_CARD_NUMBER, cardNumber, undefined, cardSource));
      }

      if (deviceId) {
        uiInputs.push(new UiInput(UiInputKey.AUTHORIZATION_DEVICE_ID, deviceId));
      }
    }

    logger.debug(() => `In performTenderPayment: Calling performBusinessOperation with ${APPLY_TENDER_EVENT}`,
        {metaData: new Map([["uiInputs", uiInputs]])});
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, APPLY_TENDER_EVENT, uiInputs);

    Keyboard.dismiss();
  }
}
