import * as React from "react";
import { Alert, View } from "react-native";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  IConfigurationManager,
  IConfigurationValues,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  FAST_DISCOUNT_EVENT,
  GIFT_RECEIPT_TRANSACTION_EVENT,
  GiftReceiptMode,
  IDisplayInfo,
  isStoredValueCardServiceAvailable,
  isStoredValueCertificateServiceAvailable,
  ITEM_ORDER_LINE_TYPE,
  ITEM_SALE_LINE_TYPE,
  UiInputKey,
  ValueCardAction, ValueCertificateAction
} from "@aptos-scp/scp-component-store-selling-features";
import { IPaymentStatus, ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import { giftCardIssueIdAvailable } from "../giftCard/GiftCardUtilities";
import {
  didStoredValueCardSessionStateChange,
  didStoredValueCertSessionStateChange,
  getIsGiftCardDeviceFilter,
  getPaymentDevicesAsRenderSelect
} from "../payment/PaymentDevicesUtils";
import { dispatchWithNavigationRef } from "../RootNavigation";
import ActionButton from "./ActionButton";
import ActionPanel from "./ActionPanel";
import { RenderSelectOptions } from "./FieldValidation";
import { inTransactionActionPanelStyle } from "./styles";
import {
  displayLinesHasType,
  IDiscountGroupInformation,
  IDiscountGroups,
  IFeatureActionButtonProps
} from "./utilities";
import { getFeatureAccessConfig } from "./utilities/configurationUtils";
import { popTo } from "./utilities/navigationUtils";
import { giftCertificateIssueIdAvailable } from "../valueCertificate/ValueCertificateUtilities";

interface StateProps {
  configManager: IConfigurationManager;
  deviceIdentity: DeviceIdentity;
  displayInfo: IDisplayInfo;
  featureActionButtonProps: IFeatureActionButtonProps;
  paymentStatus: Map<string, IPaymentStatus>;
  stateValues: Map<string, any>;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
  horizontal: boolean;
  returnMode: boolean;
  mixedBasketAllowed: boolean;
  isTenderLineAvailable?: boolean;
  onEnterReturnMode: () => void;
  onSuspendTransaction: () => void;
  onAssignSalesperson: () => void;
  onCoupon: () => void;
  onTransactionDiscount: () => void;
  onFastDiscount: () => void;
  onGiftCardIssue: () => void;
  onGiftCertificateIssue: () => void;
  onTransactionTaxScreen: () => void;
  onVoidTransaction: () => void;
  onNonMerch: () => void;
  onLottery: () => void;
  onPreConfiguredDiscounts: (transactionDiscountGroup: any) => void;
}

interface State {
  isGiftCardAvailable: boolean;
  isGiftCardIssueIdAvailable: boolean;
  isGiftCertificateAvailable: boolean;
  isGiftCertificateIssueIdAvailable: boolean;
}

class InTransactionActionPanel extends React.PureComponent<Props, State> {
  private styles: any;
  private isGiftCardDevice: (paymentStatus: IPaymentStatus) => boolean = undefined;
  private fastDiscountFeature: any;
  private giftServiceEnabled: boolean;
  private valueCertificateServiceEnabled: boolean;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(inTransactionActionPanelStyle());

    this.fastDiscountFeature = getFeatureAccessConfig(props.configManager,
        FAST_DISCOUNT_EVENT);

    this.state = {
      isGiftCardAvailable: undefined,
      isGiftCardIssueIdAvailable: undefined,
      isGiftCertificateAvailable: undefined,
      isGiftCertificateIssueIdAvailable: undefined
    };
  }

  public componentDidMount(): void {
    let giftCardDevices: RenderSelectOptions[];
    this.giftServiceEnabled = isStoredValueCardServiceAvailable(
        this.props.configManager, this.props.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Issue) ||
        isStoredValueCardServiceAvailable(this.props.configManager,
            this.props.stateValues.get("StoredValueCardSession.state"), ValueCardAction.AddValue);

    if (!this.isGiftCardDevice) {
      const peripheralsConfig: IConfigurationValues = this.props.configManager &&
          this.props.configManager.getPeripheralsValues();
      if (peripheralsConfig) {
        try {
          this.isGiftCardDevice = getIsGiftCardDeviceFilter(this.props.configManager,
              this.props.deviceIdentity.deviceId);
        } catch (error) {
          this.isGiftCardDevice = (): boolean => true;
        }
        giftCardDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isGiftCardDevice);
      }
    }

    const GiftCardIssueIdAvailable: boolean = giftCardIssueIdAvailable(this.props.configManager);

    this.valueCertificateServiceEnabled = isStoredValueCertificateServiceAvailable(this.props.configManager,
        this.props.stateValues.get("StoredValueCertificateSession.state"), ValueCertSubType.GiftCertificate,
        ValueCertificateAction.Issue);

    this.setState({
      isGiftCardAvailable: this.giftServiceEnabled || giftCardDevices?.length > 0,
      isGiftCardIssueIdAvailable: GiftCardIssueIdAvailable,
      isGiftCertificateAvailable: this.valueCertificateServiceEnabled,
      isGiftCertificateIssueIdAvailable: giftCertificateIssueIdAvailable(this.props.configManager)
    });
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.giftServiceEnabled && this.props.paymentStatus !== prevProps.paymentStatus) {
      const giftCardDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isGiftCardDevice);
      const giftCardDeviceAvailable = giftCardDevices?.length > 0;
      this.setState({isGiftCardAvailable: giftCardDeviceAvailable});
    }

    if (didStoredValueCardSessionStateChange(prevProps.stateValues, this.props.stateValues)) {
      this.giftServiceEnabled = isStoredValueCardServiceAvailable(this.props.configManager,
          this.props.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Issue) ||
          isStoredValueCardServiceAvailable(this.props.configManager,
          this.props.stateValues.get("StoredValueCardSession.state"), ValueCardAction.AddValue);
      this.setState({isGiftCardAvailable: this.giftServiceEnabled});
    }

    if (didStoredValueCertSessionStateChange(prevProps.stateValues, this.props.stateValues)) {
      this.valueCertificateServiceEnabled = isStoredValueCertificateServiceAvailable(this.props.configManager,
          this.props.stateValues.get("StoredValueCertificateSession.state"), ValueCertSubType.GiftCertificate,
          ValueCertificateAction.Issue);
      this.setState( {isGiftCertificateAvailable: this.valueCertificateServiceEnabled});
    }
  }

  public render(): JSX.Element {
    const visibleActionButtons: React.ReactNode[] = this.getVisibleActionButtons();
    const lastRowButtonCount: number = visibleActionButtons.length % 3;
    return (
      <ActionPanel>
        { // Add invisible button when in return mode and mixedBasketAllowed is true so the bottom panel has height
          !Theme.isTablet && this.props.stateValues.get("ItemHandlingSession.isReturning") &&
          (visibleActionButtons.length === 0) &&
          <View style={this.styles.btnAction} />
        }
        { visibleActionButtons }
        { // Add an invisible button to make sure it is always aligned to the left if it happens to have two
          // buttons on a row
          lastRowButtonCount >= 1 && this.styles.lastBtn &&
          <View style={this.styles.lastBtn} />
        }
        { // Add another invisible buttons to make sure it is always aligned to the left if it happens to have just one
          // button on a row
          lastRowButtonCount === 1 && this.styles.lastBtn &&
          <View style={this.styles.lastBtn} />
        }
      </ActionPanel>
    );
  }

  private getVisibleActionButtons(): JSX.Element[] {
    const transactionDiscountGroupings: IDiscountGroups = this.props.configManager
        .getDiscountsValues().discountsUI?.transactionDiscountGroupings;

    let preConfiguredDiscounts: JSX.Element[] = [];
    if (transactionDiscountGroupings) {
      const groups: IDiscountGroupInformation[] = Object.values(transactionDiscountGroupings);
      preConfiguredDiscounts = groups.map((group) => this.getPreConfiguredDiscountButton(group));
    }

    if (this.props.returnMode && this.props.mixedBasketAllowed) {
      return [];
    }
    if (this.props.returnMode) {
      return [
        this.getSuspendTransactionButton(),
        this.getVoidTransactionButton()
      ];
    }
    return [
      this.getReturnButton(),
      this.getAssignSalespersonButton(),
      this.getCouponButton(),
      this.getApplyTransactionDiscountButton(),
      this.getMarkGiftReceiptTransactionButton(),
      this.getFastDiscountButton(),
      this.getSellGiftCardButton(),
      this.getSellGiftCertificateButton(),
      this.getSuspendTransactionButton(),
      this.getTransactionTaxButton(),
      this.getVoidTransactionButton(),
      this.getNonMerchButton(),
      this.getLotteryButton(),
      ...preConfiguredDiscounts
    ].filter((element) => !!element);
  }

  private getReturnButton(): JSX.Element {
    const hasSaleItems = displayLinesHasType(this.props.displayInfo, ITEM_SALE_LINE_TYPE);
    const hasOrderItems = displayLinesHasType(this.props.displayInfo, ITEM_ORDER_LINE_TYPE);
    const returnDisabled = !this.props.featureActionButtonProps.isReturnEnabled ||
        (!this.props.mixedBasketAllowed && hasSaleItems) || hasOrderItems;

    return !this.props.returnMode && this.props.featureActionButtonProps.isReturnVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                  icon={{icon: "Returns", size: this.styles.btnActionIcon.fontSize}}
                  title={I18n.t("returnTransaction")}
                  allowTextWrap={true}
                  titleStyle={this.styles.btnActionText}
                  onPress={this.props.onEnterReturnMode}
                  disabled={returnDisabled}/>;
  }

  private getCouponButton(): JSX.Element {
    return this.reviewCouponsVisible(this.props.configManager) &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "CouponDiscount", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("coupons")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      disabled={!this.props.featureActionButtonProps.isCouponEnabled}
                      onPress={this.props.onCoupon}/>;
  }

  private reviewCouponsVisible(configurationManager: IConfigurationManager): boolean {
    try {
      return !!configurationManager.getFunctionalBehaviorValues().couponBehaviors.reviewCouponsInTransaction;
    } catch (error) {
      return false;
    }
  }

  private getAssignSalespersonButton(): JSX.Element {
    return this.props.featureActionButtonProps.isAssignSalespersonTransactionVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "Salesperson", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("salesperson")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      disabled={!this.props.featureActionButtonProps.isAssignSalespersonTransactionEnabled}
                      onPress={this.props.onAssignSalesperson}/>;
  }

  private getApplyTransactionDiscountButton(): JSX.Element {
    return this.props.featureActionButtonProps.isTransactionDiscountVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "Discount", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("discounts")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      disabled={!this.props.featureActionButtonProps.isTransactionDiscountEnabled}
                      onPress={this.props.onTransactionDiscount} />;
  }

  private getFastDiscountButton(): JSX.Element {
    return this.props.featureActionButtonProps.isFastDiscountVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "FastDiscount", size: this.styles.btnActionIcon.fontSize}}
                      title={this.fastDiscountFeature.discountNameDisplayText[I18n.currentLocale()]
                        || I18n.t("fastDiscount")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      disabled={!this.props.featureActionButtonProps.isFastDiscountEnabled}
                      onPress={this.props.onFastDiscount} />;
  }

  private getMarkGiftReceiptTransactionButton(): JSX.Element {
    return this.props.featureActionButtonProps.isMarkGiftReceiptTransactionVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "GiftReceipt", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("giftReceipt")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      disabled={!this.props.featureActionButtonProps.isMarkGiftReceiptTransactionEnabled}
                      onPress={this.handleGiftReceipt}/>;
  }

  private getSellGiftCardButton(): JSX.Element {
    return this.props.featureActionButtonProps.isGiftCardIssueVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "GiftCard", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("giftCard")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      onPress={this.props.onGiftCardIssue}
                      disabled={
                        !this.state.isGiftCardAvailable ||
                        !this.state.isGiftCardIssueIdAvailable ||
                        !this.props.featureActionButtonProps.isGiftCardIssueEnabled
                      }/>;
  }

  private getSellGiftCertificateButton(): JSX.Element {
    return this.props.featureActionButtonProps.isGiftCertificateIssueVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "GiftCertificate", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("giftCertificate")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      onPress={this.props.onGiftCertificateIssue}
                      disabled={
                        !this.state.isGiftCertificateAvailable ||
                        !this.state.isGiftCertificateIssueIdAvailable ||
                        !this.props.featureActionButtonProps.isGiftCertificateIssueEnabled
                      }/>;
  }

  private getTransactionTaxButton(): JSX.Element {
    return (this.props.featureActionButtonProps.isTransactionTaxExemptVisible
              || this.props.featureActionButtonProps.isTransactionTaxOverrideVisible) &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "TaxExempt", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("tax")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      onPress={this.props.onTransactionTaxScreen}
                      disabled={!(this.props.featureActionButtonProps.isTransactionTaxExemptEnabled
                        || this.props.featureActionButtonProps.isTransactionTaxOverrideEnabled)
                        || this.props.isTenderLineAvailable} />;
  }

  private getSuspendTransactionButton(): JSX.Element {
    const hasOrderItems = displayLinesHasType(this.props.displayInfo, ITEM_ORDER_LINE_TYPE);
    return this.props.featureActionButtonProps.isSuspendTransactionVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "Suspend", size: this.styles.btnActionIcon.fontSize}}
                      title={I18n.t("suspend")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      onPress={this.props.onSuspendTransaction}
                      disabled={!this.props.featureActionButtonProps.isSuspendTransactionEnabled || hasOrderItems }/>;
  }

  private getVoidTransactionButton(): JSX.Element {
    return this.props.featureActionButtonProps.isVoidTransactionVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "Void", size: this.styles.btnActionIcon.fontSize}}
                      disabled={!this.props.featureActionButtonProps.isVoidTransactionEnabled}
                      title={I18n.t("voidTransaction")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      onPress={this.props.onVoidTransaction}/>;
  }

  private getNonMerchButton(): JSX.Element {
    return this.props.featureActionButtonProps.isNonMerchVisible &&
        <ActionButton style={Theme.isTablet && this.styles.btnActionInTransaction}
                      icon={{icon: "NonMerch", size: this.styles.btnActionIcon.fontSize}}
                      disabled={!this.props.featureActionButtonProps.isNonMerchEnabled}
                      title={I18n.t("nonMerch")}
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      onPress={this.props.onNonMerch}/>;
  }

  private getLotteryButton(): JSX.Element {
    return this.props.featureActionButtonProps.isLotteryVisible &&
        <ActionButton style={this.styles.btnActionInTransaction}
                      icon={{icon: "Lottery", size: this.styles.btnActionIcon.fontSize}}
                      disabled={!this.props.featureActionButtonProps.isLotteryEnabled}
                      title={I18n.t("lottery")}
                      allowTextWrap={false}
                      titleStyle={this.styles.btnActionText}
                      onPress={this.props.onLottery}/>;
  }

  private getPreConfiguredDiscountButton(transactionGroup: IDiscountGroupInformation): JSX.Element {
    return this.props.featureActionButtonProps.isPreConfiguredDiscountsVisible &&
        <ActionButton style={this.styles.btnActionInTransaction}
                      icon={{icon: "FastDiscount", size: this.styles.btnActionIcon.fontSize}}
                      disabled={!this.props.featureActionButtonProps.isPreConfiguredDiscountsEnabled}
                      title={I18n.t(transactionGroup.groupButtonText.i18nCode,
                          {defaultValue: transactionGroup.groupButtonText.default})
                      }
                      allowTextWrap={true}
                      titleStyle={this.styles.btnActionText}
                      onPress={() => this.props.onPreConfiguredDiscounts(transactionGroup)}/>;
  }

  private handleGiftReceipt = (): void => {
    const giftTransaction: boolean = this.props.stateValues && this.props.stateValues.get("transaction.giftReceipt");
    const giftMode: GiftReceiptMode = this.props.stateValues &&
        this.props.stateValues.get("transaction.giftReceiptMode");
    if (giftTransaction) {
      this.onGiftReceiptMode(GiftReceiptMode.None);
    } else if (giftMode && giftMode !== GiftReceiptMode.None) {
      this.onGiftReceiptMode(giftMode);
    } else {
      Alert.alert(I18n.t("giftReceipt"), I18n.t("giftReceiptTitle"),
        [
          { text: I18n.t("cancel"), style: "cancel" },
          {
            text: I18n.t("single"),
            onPress: () => this.onGiftReceiptMode(GiftReceiptMode.Shared)
          },
          {
            text: I18n.t("multiple"),
            onPress: () => this.onGiftReceiptMode(GiftReceiptMode.Individual)
          }
        ],
        { cancelable: false }
      );
    }
  }

  private onGiftReceiptMode(giftReceiptMode: GiftReceiptMode): void {
    this.props.performBusinessOperation(this.props.deviceIdentity, GIFT_RECEIPT_TRANSACTION_EVENT, [
      new UiInput(UiInputKey.GIFT_RECEIPT_MODE, giftReceiptMode)
    ]);

    if (!Theme.isTablet) {
      dispatchWithNavigationRef(popTo("main"));
    }
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    configManager: state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity,
    displayInfo: state.businessState.displayInfo,
    featureActionButtonProps: state.uiState.featureActionButtonProps,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    stateValues: state.businessState && state.businessState.stateValues
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(InTransactionActionPanel);
