import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";

import { IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";
import {
  FAST_DISCOUNT_EVENT,
  isStoredValueCardServiceAvailable,
  isStoredValueCertificateServiceAvailable,
  ValueCardAction,
  ValueCertificateAction
} from "@aptos-scp/scp-component-store-selling-features";
import { IPaymentStatus, ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import { giftCardIssueIdAvailable } from "../giftCard/GiftCardUtilities";
import {
  completedTenderAuthorization,
  didStoredValueCardSessionStateChange,
  didStoredValueCertSessionStateChange,
  getIsGiftCardDeviceFilter,
  getPaymentDevicesAsRenderSelect,
  tenderAuthorizationInProgress
} from "../payment/PaymentDevicesUtils";
import ActionButton from "./ActionButton";
import ActionPanel from "./ActionPanel";
import { RenderSelectOptions } from "./FieldValidation";
import { notInTransactionActionPanelStyle } from "./styles";
import { getFeatureAccessConfig } from "./utilities/configurationUtils";
import { giftCertificateIssueIdAvailable } from "../valueCertificate/ValueCertificateUtilities";


interface StateProps {
  businessEventError: Error;
  businessEventInProgress: boolean;
  isResumeSaleVisible: boolean;
  isResumeSaleEnabled: boolean;
  isReturnVisible: boolean;
  isReturnEnabled: boolean;
  isGiftCardIssueVisible: boolean;
  isGiftCardIssueEnabled: boolean;
  isGiftCertificateIssueVisible: boolean;
  isGiftCertificateIssueEnabled: boolean;
  isFastDiscountVisible: boolean;
  isFastDiscountEnabled: boolean;
  isNonMerchVisible: boolean;
  isNonMerchEnabled: boolean;
  paymentStatus: Map<string, IPaymentStatus>;
  settings: SettingsState;
  stateValues: Map<string, any>;
}

interface Props extends StateProps {
  onGiftCardIssue: () => void;
  onGiftCertificateIssue: () => void;
  onResumeOfSuspendedTransactions: () => void;
  onEnterReturnMode: () => void;
  onFastDiscount: () => void;
  onNonMerch: () => void;
}

interface State {
  isGiftCardAvailable: boolean;
  disableCardButtonsAuthSessInProgress: boolean;
  isGiftCertificateAvailable: boolean;
}

class NotInTransactionActionPanel extends React.PureComponent<Props, State> {
  private styles: any;
  private isGiftCardDevice: (paymentStatus: IPaymentStatus) => boolean = undefined;
  private isGiftCardIssueIdAvailable: boolean;
  private fastDiscountFeature: any;
  private giftServiceEnabled: boolean;
  private valueCertificateServiceEnabled: boolean;
  private isGiftCertificateIssueIdAvailable: boolean;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(notInTransactionActionPanelStyle());
    let giftCardDevices: RenderSelectOptions[];
    if (!this.isGiftCardDevice) {
      const peripheralsConfig: IConfigurationValues = this.props.settings.configurationManager &&
          this.props.settings.configurationManager.getPeripheralsValues();
      if (peripheralsConfig) {
        try {
          this.isGiftCardDevice = getIsGiftCardDeviceFilter(this.props.settings.configurationManager,
              this.props.settings.deviceIdentity.deviceId);
        } catch (error) {
          this.isGiftCardDevice = (paymentStatus: IPaymentStatus): boolean => true;
        }
        giftCardDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isGiftCardDevice);
      }
    }
    this.giftServiceEnabled =
        isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
          this.props.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Issue) ||
        isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
          this.props.stateValues.get("StoredValueCardSession.state"), ValueCardAction.AddValue);
    this.isGiftCardIssueIdAvailable = giftCardIssueIdAvailable(props.settings.configurationManager);

    this.valueCertificateServiceEnabled = isStoredValueCertificateServiceAvailable(
        this.props.settings.configurationManager,
        this.props.stateValues.get("StoredValueCertificateSession.state"), ValueCertSubType.GiftCertificate,
        ValueCertificateAction.Issue);
    this.isGiftCertificateIssueIdAvailable = giftCertificateIssueIdAvailable(this.props.settings.configurationManager);

    this.state = {
      disableCardButtonsAuthSessInProgress: tenderAuthorizationInProgress(
          this.props.stateValues.get("TenderAuthorizationSession.state")),
      isGiftCardAvailable: this.giftServiceEnabled || giftCardDevices?.length > 0,
      isGiftCertificateAvailable: this.valueCertificateServiceEnabled
    };
    this.fastDiscountFeature = getFeatureAccessConfig(props.settings.configurationManager,
        FAST_DISCOUNT_EVENT);
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (!this.giftServiceEnabled && this.props.paymentStatus !== prevProps.paymentStatus) {
      const giftCardDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isGiftCardDevice);
      const giftCardDeviceAvailable = giftCardDevices?.length > 0;
      this.setState({isGiftCardAvailable: giftCardDeviceAvailable});
    }

    if (completedTenderAuthorization(prevProps.stateValues.get("TenderAuthorizationSession.state"),
          this.props.stateValues.get("TenderAuthorizationSession.state")) ||
          (prevProps.businessEventInProgress && !this.props.businessEventInProgress && this.props.businessEventError)) {
      this.setState({disableCardButtonsAuthSessInProgress: false});
    }

    if (didStoredValueCardSessionStateChange(prevProps.stateValues, this.props.stateValues)) {
      this.giftServiceEnabled = isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
          this.props.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Issue) ||
          isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
          this.props.stateValues.get("StoredValueCardSession.state"), ValueCardAction.AddValue);
      this.setState({isGiftCardAvailable: this.giftServiceEnabled});
    }

    if (didStoredValueCertSessionStateChange(prevProps.stateValues, this.props.stateValues)) {
      this.valueCertificateServiceEnabled = isStoredValueCertificateServiceAvailable(
          this.props.settings.configurationManager,
          this.props.stateValues.get("StoredValueCertificateSession.state"), ValueCertSubType.GiftCertificate,
          ValueCertificateAction.Issue);
      this.setState( {isGiftCertificateAvailable: this.valueCertificateServiceEnabled});
    }
  }

  public render(): JSX.Element {
    return (
      <ActionPanel>
        { this.props.isReturnVisible &&
          <ActionButton style={Theme.isTablet && this.styles.btnActionNotInTransaction}
                        icon={{icon: "Returns", size: this.styles.btnActionIcon.fontSize}}
                        title={I18n.t("returnTransaction")}
                        titleStyle={this.styles.btnActionText}
                        allowTextWrap={true}
                        onPress={this.props.onEnterReturnMode}
                        disabled={!this.props.isReturnEnabled}/>
        }
        { this.props.isResumeSaleVisible &&
          <ActionButton style={Theme.isTablet && this.styles.btnActionNotInTransaction}
                        icon={{icon: "Resume", size: this.styles.btnActionIcon.fontSize}}
                        title={I18n.t("resumeTransaction")}
                        titleStyle={this.styles.btnActionText}
                        allowTextWrap={true}
                        onPress={this.props.onResumeOfSuspendedTransactions}
                        disabled={!this.props.isResumeSaleEnabled || !this.terminalIsOpen}/>
        }
        { this.props.isGiftCardIssueVisible &&
          <ActionButton style={Theme.isTablet && this.styles.btnActionNotInTransaction}
                        icon={{icon: "GiftCard", size: this.styles.btnActionIcon.fontSize}}
                        title={I18n.t("giftCard")}
                        titleStyle={this.styles.btnActionText}
                        allowTextWrap={true}
                        onPress={this.props.onGiftCardIssue}
                        disabled={this.giftCardsAreDisabled || !this.terminalIsOpen}/>
        }
        { this.props.isGiftCertificateIssueVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionNotInTransaction}
                      icon={{icon: "GiftCertificate", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("giftCertificate")}
                      titleStyle={this.styles.btnActionText}
                      allowTextWrap={true}
                      onPress={this.props.onGiftCertificateIssue}
                      disabled={this.giftCertificatesAreDisabled || !this.terminalIsOpen}/>
        }
        { this.props.isFastDiscountVisible &&
          <ActionButton style={Theme.isTablet && this.styles.btnActionNotInTransaction}
                        icon={{icon: "FastDiscount", size: this.styles.btnActionIcon.fontSize}}
                        title={this.fastDiscountFeature.discountNameDisplayText[I18n.currentLocale()]
                          || I18n.t("fastDiscount")}
                        titleStyle={this.styles.btnActionText}
                        allowTextWrap={true}
                        onPress={this.props.onFastDiscount}
                        disabled={!this.props.isFastDiscountEnabled}/>
        }
        { this.props.isNonMerchVisible &&
          <ActionButton style={Theme.isTablet && this.styles.btnActionNotInTransaction}
                        icon={{icon: "NonMerch", size: this.styles.btnActionIcon.fontSize}}
                        title={I18n.t("nonMerch")}
                        titleStyle={this.styles.btnActionText}
                        allowTextWrap={true}
                        onPress={this.props.onNonMerch}
                        disabled={!this.props.isNonMerchEnabled}/>
        }
        { this.styles.lastBtn && <View style={this.styles.lastBtn} /> }
      </ActionPanel>
    );
  }

  private get giftCardsAreDisabled(): boolean {
    return !this.state.isGiftCardAvailable || !this.isGiftCardIssueIdAvailable ||
        !this.props.isGiftCardIssueEnabled || this.state.disableCardButtonsAuthSessInProgress;
  }

  private get giftCertificatesAreDisabled(): boolean {
    return !this.state.isGiftCertificateAvailable || !this.isGiftCertificateIssueIdAvailable ||
        !this.props.isGiftCertificateIssueEnabled || this.state.disableCardButtonsAuthSessInProgress;
  }

  private get terminalIsOpen(): boolean {
    return this.props.stateValues.get("TerminalSession.isOpen");
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessEventError: state.businessState.error,
    businessEventInProgress: state.businessState.inProgress,
    isReturnVisible: state.uiState.featureActionButtonProps.isReturnVisible,
    isReturnEnabled: state.uiState.featureActionButtonProps.isReturnEnabled,
    isResumeSaleVisible: state.uiState.featureActionButtonProps.isResumeSaleVisible,
    isResumeSaleEnabled: state.uiState.featureActionButtonProps.isResumeSaleEnabled,
    isGiftCardIssueVisible: state.uiState.featureActionButtonProps.isGiftCardIssueVisible,
    isGiftCardIssueEnabled: state.uiState.featureActionButtonProps.isGiftCardIssueEnabled,
    isGiftCertificateIssueVisible: state.uiState.featureActionButtonProps.isGiftCertificateIssueVisible,
    isGiftCertificateIssueEnabled: state.uiState.featureActionButtonProps.isGiftCertificateIssueEnabled,
    isFastDiscountVisible: state.uiState.featureActionButtonProps.isFastDiscountVisible,
    isFastDiscountEnabled: state.uiState.featureActionButtonProps.isFastDiscountEnabled,
    isNonMerchVisible: state.uiState.featureActionButtonProps.isNonMerchVisible,
    isNonMerchEnabled: state.uiState.featureActionButtonProps.isNonMerchEnabled,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    settings: state.settings,
    stateValues: state.businessState && state.businessState.stateValues
  };
};

export default connect(mapStateToProps)(NotInTransactionActionPanel);
