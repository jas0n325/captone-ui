import * as React from "react";
import { Alert, InteractionManager, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInputMask } from "react-native-masked-text";
import Menu, { MenuItem } from "react-native-material-menu";
import { connect } from 'react-redux';

import { Money } from "@aptos-scp/scp-component-business-core";
import { CurrencyConverter } from "@aptos-scp/scp-component-currency-conversion";
import { QualificationError} from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  ExchangeRateEntryType,
  GiftCertificateState,
  I18nTaxFreeConfig,
  IAuthCategoryNoneCash,
  ILabel,
  isStoredValueCardServiceAvailable,
  isStoredValueCertificateServiceAvailable,
  ITEM_CANCEL_LINE_TYPE,
  ITenderDisplayLine,
  Order,
  ReceiptCategory,
  ReceiptTypeAllowedTransactionType,
  SSF_TENDER_OVER_MAX_AMOUNT_I18N_CODE,
  SSF_TENDER_SOFT_MAX_AMOUNT_I18N_CODE,
  START_EXCHANGE_RATE_ENTRY_EVENT,
  TenderAuthCategory,
  TenderDenominationRoundings,
  TENDER_REFUND_LINE_TYPE,
  ValueCardAction,
  ValueCertificateAction
} from "@aptos-scp/scp-component-store-selling-features";
import { TenderSubType, TenderType, ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";
import { FulfillmentType } from "@aptos-scp/scp-types-commerce-transaction";
import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";

import I18n from "../../../../config/I18n";
import { AppState, RetailLocationsState, SettingsState } from "../../../reducers";
import { PendingPaymentMode } from "../../../reducers/pendingPayment";
import Theme from "../../../styles";
import FeeLineList from "../../common/FeeLineList";
import { RenderSelectOptions } from "../../common/FieldValidation";
import Header from "../../common/Header";
import { InputType } from "../../common/Input";
import LoyaltyMembershipList from "../../common/LoyaltyMembershipList";
import OriginalTendersFooter from "../../common/presentational/OriginalTendersFooter";
import TenderLineList from "../../common/TenderLineList";
import ToastPopUp from "../../common/ToastPopUp";
import {
  displayLinesHasType,
  getCurrencyMask,
  getMaxTenderInputCharacters,
  getTestIdProperties,
  GiftCertificateAction,
  ITextInputMoneyMaskOptions,
  printAmount,
  printAmountDue,
  updateScroll
} from "../../common/utilities";
import {
  getDenominationRoundings,
  getValidatedRoundedPrice
} from "../../common/utilities/denominationRoundingUtils";
import { popTo } from "../../common/utilities/navigationUtils";
import VectorIcon from "../../common/VectorIcon";
import { getDisplayLoyaltyBalancesWithoutRTP } from "../../customer/CustomerUtilities";
import { CommonPaymentProps } from "../interfaces";
import PaymentDeviceSelection from "../PaymentDeviceSelection";
import {
  didStoredValueCardSessionStateChange,
  didStoredValueCertSessionStateChange,
  fullTaxInvoiceText,
  getAmount,
  getMappedTenderType,
  getOriginalTenderRefundableAmount,
  getRoundedBalanceLabel,
  IOriginalTender,
  IOriginalTransactionDetails,
  isCustomerRequiredForTender,
  isRefund,
  ITenderType
} from "../PaymentDevicesUtils";
import PaymentOptions from "../PaymentOptions";
import TenderButtons from "../TenderButtons";
import { paymentStyles } from "./styles";
import OfflineNotice from "../../common/OfflineNotice";

interface DispatchProps {}

interface StateProps {
  pendingPaymentMode: PendingPaymentMode;
  retailLocations: RetailLocationsState;
  i18nLocation: string;
}

export interface PaymentPhoneProps extends CommonPaymentProps {
  handleRedeemPayment: (inputValue: string, tenderAuthCategory: TenderAuthCategory, originalTender?: IOriginalTender,
                        tenderType?: string, subtype?: string) => void;
  settings: SettingsState;
  isInitialCashDrawerOnStartup: boolean;
}

interface Props extends DispatchProps, PaymentPhoneProps, StateProps {}

interface State {
  tenderAmount: string;
  showTempInfoPopUp: boolean;
  tenderAmountString: string;
  showOtherTendersMenu: boolean;
  isTenderInput: boolean;
  errorMessage: string;
  showTenderVoidPopup: boolean;
  lastAppliedTenderAuthCategory: string;
  lastAppliedTenderIds: string[];
  softMaxProceed: boolean;
  waitingOnCustomer: boolean;
  originalTender: IOriginalTender;
  redeemPayment: boolean;
  foreignTenderType: ITenderType;
  manualEntryForeignTender: ITenderType;
  isExchangeRateManualEntry: boolean;
  enteredExchangeRate: string;
  subType: TenderSubType;
  isScrolling: boolean;
}

class Payment extends React.Component<Props, State> {
  private styles: any;
  private currencyMask: ITextInputMoneyMaskOptions;
  private tenderInputMaxLength: number;
  private valueCertificateTenderName: string;
  private valueCertificatePluralTenderName: string;
  private storedValueServiceEnabled: boolean;
  private storedCreditServiceEnabled: boolean;
  private testID: string;
  private displayLoyaltyBalancesWithoutRTP: boolean;
  private customer: Customer;
  private menu: any;
  private exchangeRate: ExchangeRate;
  private convertedAmount: Money;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(paymentStyles());
    this.testID = "Payment";

    this.props.activeTenders.sort(
      (t1, t2): number => {
        if (t1.tenderId < t2.tenderId) {
          return -1;
        } else {
          if (t1.tenderId > t2.tenderId) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    );
    const valueCertificateTender = this.props.activeTenders.find(
      (aTender) => (aTender.tenderAuthCategory === TenderAuthCategory.LoyaltyVoucherService)
    );

    this.currencyMask = getCurrencyMask(this.props.currency);
    this.tenderInputMaxLength = getMaxTenderInputCharacters(this.currencyMask);

    if (!!valueCertificateTender) {
      this.valueCertificateTenderName = valueCertificateTender.tenderName;
      this.valueCertificatePluralTenderName = valueCertificateTender.pluralTenderName;
    }

    this.storedValueServiceEnabled = isStoredValueCardServiceAvailable(this.props.configuration,
      this.props.businessState.stateValues.get("StoredValueCardSession.state"),
      isRefund(this.props.stateValues) ? ValueCardAction.Issue : ValueCardAction.Redeem);

    this.storedCreditServiceEnabled = isStoredValueCertificateServiceAvailable(this.props.configuration,
      this.props.businessState.stateValues.get("StoredValueCertificateSession.state"), undefined,
      isRefund(this.props.stateValues) ? ValueCertificateAction.Issue : ValueCertificateAction.Redeem);

    this.customer = this.props.stateValues.get("transaction.customer");
    this.displayLoyaltyBalancesWithoutRTP = getDisplayLoyaltyBalancesWithoutRTP(props.configuration, this.customer);

    this.state = {
      tenderAmount: this.props.balanceDue,
      showTempInfoPopUp: false,
      tenderAmountString: undefined,
      showOtherTendersMenu: false,
      isTenderInput: false,
      errorMessage: undefined,
      showTenderVoidPopup: !!props.tenderVoidMessage,
      lastAppliedTenderAuthCategory: undefined,
      lastAppliedTenderIds: undefined,
      softMaxProceed: false,
      waitingOnCustomer: false,
      originalTender: undefined,
      redeemPayment: false,
      foreignTenderType: undefined,
      manualEntryForeignTender: undefined,
      isExchangeRateManualEntry: false,
      enteredExchangeRate: undefined,
      subType: undefined,
      isScrolling: false
    };

    this.setExchangeRateInstance = this.setExchangeRateInstance.bind(this);
    this.getConvertedAmountForApplyPayment = this.getConvertedAmountForApplyPayment.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.isInitialCashDrawerOnStartup) {
      const giftCertificateState : GiftCertificateState = this.props.stateValues.get("CashDrawerSession.giftCertificateState");
      if (giftCertificateState?.action === GiftCertificateAction.Refund &&
        this.props.stateValues.get("CashDrawerSession.isOpen")) {
          const originalTender = this.state.originalTender;
          this.applyValueCertificatePayment(originalTender, ValueCertSubType.GiftCertificate);
      }
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  public componentDidUpdate(prevProps: Props, prevState: State): void {

    if (this.state.waitingOnCustomer && this.props.pendingPaymentMode !== prevProps.pendingPaymentMode) {

      if (this.props.pendingPaymentMode === PendingPaymentMode.WaitingOnPayment)  {
        this.props.navigation.dispatch(popTo("payment"));
        if (this.props.businessState.stateValues.get("transaction.customer")) {
          this.props.updatePendingPayment(PendingPaymentMode.Completed);
          this.setState({waitingOnCustomer: false});
          this.applyValueCertificatePayment(this.state.originalTender, this.state.subType);
        } else {
          // Customer required and not provided
          // moving to PendingPaymentMode.Completed because we could not proceed with payment.
          this.props.updatePendingPayment(PendingPaymentMode.Completed);
        }
      }
    }

    if (didStoredValueCardSessionStateChange(prevProps.businessState && prevProps.stateValues,
        this.props.businessState.stateValues)) {
      this.storedValueServiceEnabled = isStoredValueCardServiceAvailable(this.props.configuration,
          this.props.businessState.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Redeem);
    }
    if (didStoredValueCertSessionStateChange(prevProps.businessState && prevProps.stateValues,
        this.props.businessState.stateValues)) {
      this.storedCreditServiceEnabled = isStoredValueCertificateServiceAvailable(this.props.configuration,
          this.props.businessState.stateValues.get("StoredValueCertificateSession.state"), undefined,
          isRefund(this.props.stateValues) ? ValueCertificateAction.Issue : ValueCertificateAction.Redeem);
    }

    if (prevProps.balanceDue !== this.props.balanceDue) {
      this.setState({
        tenderAmount: this.props.balanceDue,
        foreignTenderType: undefined,
        manualEntryForeignTender: undefined,
        isExchangeRateManualEntry: false,
        enteredExchangeRate: undefined,
        errorMessage: undefined
      });
    }

    if (prevProps.displayInfo.tenderDisplayLines.length !== this.props.displayInfo.tenderDisplayLines.length) {
      if (prevProps.displayInfo.tenderDisplayLines.length < this.props.displayInfo.tenderDisplayLines.length) {
        this.setState({ softMaxProceed: false });
        const lastTenderDisplayLineCopy = ([] as ITenderDisplayLine[])
            .concat(this.props.displayInfo.tenderDisplayLines).pop();

        if (lastTenderDisplayLineCopy.tenderAuthCategory === TenderAuthCategory.PaymentDevice ||
            lastTenderDisplayLineCopy.tenderAuthCategory === TenderAuthCategory.GiftDevice) {
          this.setState({
            showTempInfoPopUp: true,
            tenderAmountString: printAmount(lastTenderDisplayLineCopy.tenderAmount) + " " +
                (lastTenderDisplayLineCopy.lineType === TENDER_REFUND_LINE_TYPE ? I18n.t("cardRefundedTempInfo")
                : I18n.t("cardChargedTempInfo"))
          });
        }
      }
    }

    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress &&
      this.props.businessState.error instanceof QualificationError &&
      this.props.businessState.error.localizableMessage) {
      if (this.props.businessState.error.localizableMessage.i18nCode === SSF_TENDER_OVER_MAX_AMOUNT_I18N_CODE) {
        this.setState({errorMessage: I18n.t(SSF_TENDER_OVER_MAX_AMOUNT_I18N_CODE)});
      } else if (this.props.businessState.error.localizableMessage.i18nCode === SSF_TENDER_SOFT_MAX_AMOUNT_I18N_CODE) {
        const tenderId = this.props.businessState.error.localizableMessage.parameters?.get("tenderId");
        setTimeout(() => Alert.alert(I18n.t("softMaxTenderAmountTitle"), this.getExceedSoftMaxAmountMsg(tenderId), [
          {text: I18n.t("cancel"), style: "cancel"},
          {text: I18n.t("proceed"), onPress: this.onSoftMaxProceed}
        ], { cancelable: false }), 500);
      }
    }

    if (this.state.foreignTenderType && this.state.foreignTenderType !== prevState.foreignTenderType &&
        (this.isEnteringExchangeRate || !this.state.isExchangeRateManualEntry)) {
      const exchangeRate = this.props.exchangeRates?.find((rate: ExchangeRate) => rate.from === this.state.foreignTenderType?.currencyCode);
      const convertedAmount = this.props.getConvertedAmountFromBalanceDue(this.state.foreignTenderType?.currencyCode, exchangeRate);
      this.setExchangeRateInstance(exchangeRate, convertedAmount);
    } else if (!this.state.foreignTenderType && this.convertedAmount) {
      this.setExchangeRateInstance();
    }

    if (this.state.enteredExchangeRate && !isNaN(Number(this.state.enteredExchangeRate)) &&
        Number(this.state.enteredExchangeRate) > 0 && this.state.enteredExchangeRate !== prevState.enteredExchangeRate) {
      const exchangeRate: ExchangeRate = {
        to: this.props.currency,
        from: this.state.foreignTenderType?.currencyCode,
        exchangeRate: this.state.enteredExchangeRate
      }
      const convertedAmount = this.props.getConvertedAmountFromBalanceDue(this.state.foreignTenderType?.currencyCode, exchangeRate);
      this.setExchangeRateInstance(exchangeRate, convertedAmount);
    } else if ((!this.state.enteredExchangeRate || isNaN(Number(this.state.enteredExchangeRate))
        || Number(this.state.enteredExchangeRate) <= 0) && this.state.enteredExchangeRate !== prevState.enteredExchangeRate) {
      this.setExchangeRateInstance(undefined, undefined, "0");
    }

    if (this.businessOperationCompletedSuccessfully(prevProps)) {
      if (this.props.businessState.eventType === START_EXCHANGE_RATE_ENTRY_EVENT) {
        const isExchangeRateManualEntry = this.manualExchangeRateEntryType === ExchangeRateEntryType.WhenMissing &&
            this.currencyCodeHasMissingRate(this.state.manualEntryForeignTender?.currencyCode);
        const tenderAmount = isExchangeRateManualEntry
            ? new Money("0", this.state.manualEntryForeignTender?.currencyCode).amount
            : this.state.tenderAmount;
        this.setState({
          isExchangeRateManualEntry,
          foreignTenderType: this.state.manualEntryForeignTender,
          manualEntryForeignTender: undefined,
          tenderAmount
        });
      }
    }
  }

  public setExchangeRateInstance(
    exchangeRate?: ExchangeRate,
    convertedAmount?: Money,
    tenderAmount?: string
  ): void {
    this.currencyMask = getCurrencyMask(convertedAmount?.currency || this.props.currency);
    this.exchangeRate = exchangeRate;
    this.convertedAmount = convertedAmount;

    if (tenderAmount) {
      this.setState({ tenderAmount });
    } else if (convertedAmount) {
      this.setState({ tenderAmount: convertedAmount.round().amount });
    }
  }

  // tslint:disable-next-line: cyclomatic-complexity
  public render(): JSX.Element {
    const inputEditable = this.isEnteringExchangeRate || !this.state.isExchangeRateManualEntry;

    return (
      <View style={this.styles.root}>
        { this.renderHeader() }
        <OfflineNotice isScrolling={this.state.isScrolling}/>
        <KeyboardAwareScrollView onScrollEndDrag={this.handleScroll.bind(this)}
         contentContainerStyle={this.styles.fill} keyboardShouldPersistTaps={"handled"}>
          <View style={this.styles.topSection}>
            {
              this.state.isExchangeRateManualEntry &&
              <View style={this.styles.exchangeRateEntry}>
                <TextInput
                  style={[this.styles.balanceInput]}
                  value={this.state.enteredExchangeRate}
                  placeholder={I18n.t("conversionRate")}
                  placeholderTextColor={this.styles.placeholderStyle.color}
                  keyboardType={InputType.numeric}
                  returnKeyType="done"
                  onFocus={() => {
                    this.props.uiInteractionDetected();
                  }}
                  onBlur={() => {
                    this.props.uiInteractionDetected();
                  }}
                  onChangeText={(text: string) => {
                    this.props.uiInteractionDetected();
                    this.setState({ enteredExchangeRate: text })
                  }}
                  onSubmitEditing={() => {
                    this.props.uiInteractionDetected();
                  }}
                />
                <Text style={[this.styles.exchangeRate, this.styles.enteredExchangeRate]}>
                  {`1 ${this.state.foreignTenderType?.currencyCode} = ${this.state.enteredExchangeRate || ""} ${!!this.state.enteredExchangeRate ? this.props.currency : ""}`}
                </Text>
              </View>
            }
            <View style={this.styles.paymentTextArea}>
              <Text
                style={this.styles.totalDueTitle}
                {...getTestIdProperties(this.testID, "totalDueTitle-text")}>
                  {this.getTotalDueText()}
              </Text>
              <Text
                style={this.styles.totalDueAmount}
                {...getTestIdProperties(this.testID, "totalDueAmount-text")}>
                {
                  this.props.stateValues.get("transaction.balanceDue") && !this.convertedAmount &&
                  !this.state.isExchangeRateManualEntry &&
                  printAmountDue(
                    this.props.stateValues.get("transaction.balanceDue"),
                    isRefund(this.props.stateValues) && this.originalTransactionHasForeignTenders
                  )
                }
                {
                  this.props.stateValues.get("transaction.balanceDue") && this.convertedAmount &&
                  (!this.state.isExchangeRateManualEntry || this.isEnteringExchangeRate) &&
                  printAmountDue(this.convertedAmount)
                }
                {
                  this.props.stateValues.get("transaction.balanceDue") && this.state.isExchangeRateManualEntry &&
                  !this.state.enteredExchangeRate && !inputEditable && "..."
                }
              </Text>
            </View>
            {!isRefund(this.props.stateValues) &&
              <View style={this.styles.paymentTitle}>
                <Text style={this.styles.paymentLabel}>{I18n.t("paymentAmount")}</Text>
              </View>
            }
            {!isRefund(this.props.stateValues) &&
              <TextInputMask
                style={[this.styles.balanceInput, this.state.errorMessage ?
                  this.styles.inputTextError : {}, !inputEditable && this.styles.disabledInput]}
                value={this.state.tenderAmount}
                type={"money"}
                options={this.currencyMask}
                placeholder={I18n.t("enterPaymentAmount")}
                placeholderTextColor={this.styles.placeholderStyle.color}
                keyboardType={InputType.numeric}
                returnKeyType={"done"}
                onFocus={() => {
                  this.props.uiInteractionDetected();
                  this.onChangeText("");
                  this.setState({isTenderInput : true});
                }}
                onBlur={() => {
                  this.props.uiInteractionDetected();
                  this.onBlur();
                }}
                onChangeText={(text: string) => {
                  this.props.uiInteractionDetected();
                  this.onChangeText(text);
                }}
                onSubmitEditing={() => {
                  this.props.uiInteractionDetected();
                  this.onBlur();
                }}
                maxLength={this.tenderInputMaxLength}
                editable={inputEditable}
              />
            }
            {this.state.errorMessage &&
              <Text
                style={this.styles.errorStyle}
                {...getTestIdProperties(this.testID, "errorMessage-text")}>
                  {this.state.errorMessage}
              </Text>
            }
            {
              this.state.foreignTenderType && this.exchangeRate && !this.state.isExchangeRateManualEntry &&
              <Text style={this.styles.exchangeRate}>
                {`1 ${this.state.foreignTenderType.currencyCode} = ${this.exchangeRate?.exchangeRate} ${this.props.currency}`}
              </Text>
            }
            <TenderButtons
              testID={this.testID}
              styles={this.styles}
              activeTenderGroups={this.props.activeTenderGroups}
              disablePaymentScreenButtons={this.props.disablePaymentScreenButtons}
              businessState={this.props.businessState}
              allowsRefundOriginalTenders={this.props.allowsRefundOriginalTenders}
              stateValues={this.props.stateValues}
              cardsAreDisabled={this.primaryDeviceIsNotAvailable}
              giftCardsAreDisabled={this.giftCardsAreDisabled}
              storeCreditIsDisabled={this.storeCreditIsDisabled}
              walletsAreDisabled={this.walletsAreDisabled}
              nonIntegratedAreDisabled={this.nonIntegratedAreDisabled}
              onApplyPayment={this.onApplyPayment.bind(this)}
              onApplyValueCertificatePayment={this.onApplyValueCertificatePayment.bind(this)}
              onApplyWalletPayment={this.onApplyWalletPayment.bind(this)}
              onLoyaltyVoucher={this.onLoyaltyVoucher.bind(this)}
              showOtherTendersMenu={this.state.showOtherTendersMenu}
              onApplyOtherPayment={this.onApplyOtherPayment.bind(this)}
              onApplyGCPayment={this.onApplyGCPayment.bind(this)}
              valueCertificateTenderName={this.valueCertificateTenderName}
              valueCertificatePluralTenderName={this.valueCertificatePluralTenderName}
              configuration={this.props.configuration}
              getRoundingBalanceDueTender={this.getRoundingBalanceDueTender.bind(this)}
              displayMoreTenderButtons={false}
              originalTransactionDetails={this.props.originalTransactionDetails}
              originalTenders={this.props.originalTenders}
              originalUnreferencedTenders={this.props.originalUnreferencedTenders}
              foreignTenderType={this.state.foreignTenderType}
              exchangeRates={this.props.exchangeRates}
              activeTenders={this.props.activeTenders}
            />
          </View>
          <View style={[this.styles.bottomSection, this.hasRefundedTenders() && this.styles.topBorder]}>
            {
              this.hasRefundedTenders() &&
              <Text
                style={this.styles.sectionTitleText} numberOfLines={1} ellipsizeMode={"tail"}
                {...getTestIdProperties(this.testID, "refundedTenders-text")}>
                {I18n.t("refunded")}
              </Text>
            }
            <TenderLineList
                allowTenderVoid={true}
                preventScroll={true}
                tenderDisplayLines={this.props.displayInfo.tenderDisplayLines}
            />
            { //Use unfiltered originalTransactionDetails to show all original tenders
              this.props.businessState.stateValues.get("TenderSession.originalTransactionDetails") &&
              this.props.businessState.stateValues.get("TenderSession.originalTransactionDetails").length > 0 &&
              <OriginalTendersFooter
                style={this.styles.footerArea}
                originalTransactions={this.props.businessState.stateValues.get("TenderSession.originalTransactionDetails")}/>
            }
            <View style={this.styles.detailsArea}>
              <View style={this.styles.detailsSide}>
                { this.renderDetailTitle("subTotalCaps") }
                { this.renderDetailTitle("totalTaxCaps") }
                { this.renderDetailTitle("feeCaps") }
                { this.renderDetailTitle("discountsCaps") }
                { this.renderShippingTitle() && this.renderDetailTitle("shippingCaps")}
                { this.props.hasDonations && this.renderDetailTitle("donationCaps") }
                { this.renderDetailTitle("totalCaps") }
                { this.renderDetailTitle("totalTenderedCaps") }
              </View>
              <View style={[this.styles.detailsSide, this.styles.detailsRightSide]}>
                { this.renderDetailValue(this.props.stateValues.get("transaction.subTotal"), "subTotal") }
                { this.renderDetailValue(this.props.stateValues.get("transaction.tax"), "tax") }
                { this.renderDetailValue(this.props.stateValues.get("transaction.totalFee"), "totalFee") }
                { this.renderDetailValue(this.props.stateValues.get("transaction.totalSavings"), "totalSavings") }
                { this.renderShippingTitle() && this.renderDetailValue(this.props.stateValues.get("transaction.shippingFee"), "shippingFee") }
                { this.props.hasDonations &&
                    this.renderDetailValue(this.props.stateValues.get("transaction.donation"), "donation") }
                { this.renderDetailValue(this.props.stateValues.get("transaction.total"), "total") }
                { this.renderDetailValue(this.props.stateValues.get("transaction.totalTendered"), "totalTendered") }
              </View>
            </View>
            {this.props.displayInfo.transactionFeeDisplayLines &&
              <FeeLineList
                preventScroll={true}
                feeDisplayLines={this.props.displayInfo.transactionFeeDisplayLines}
              />
            }
            { this.customer?.loyaltyMemberships && ((this.props.loyaltyMembershipActivities &&
              this.props.loyaltyMembershipActivities.length > 0) || this.displayLoyaltyBalancesWithoutRTP) &&
              <LoyaltyMembershipList
                  estimated={true}
                  preventScroll={true}
                  loyaltyActivities={this.props.loyaltyMembershipActivities}
                  configuration={this.props.configuration}
                  loyaltyMemberships={this.customer && this.customer.loyaltyMemberships}
                  displayLoyaltyBalancesWithoutRTP={this.displayLoyaltyBalancesWithoutRTP}
              />
            }
          </View>
        </KeyboardAwareScrollView>
        { this.renderToast() }
        {
          (this.props.showOfflineOptions || this.props.showRetryAuthorization || this.state.showOtherTendersMenu) &&
          <PaymentOptions
            retryOnlyAuthMode={this.props.showRetryAuthorization}
            onOfflineAuthorization={this.handleOfflineAuthorization.bind(this)}
            cancelOffline={this.cancelOffline.bind(this)}
            onRetry={this.retryAuthorization.bind(this)}
            onGiftCard={this.onApplyGCPayment.bind(this)}
            onApplyValueCertificatePayment={this.onApplyValueCertificatePayment.bind(this)}
            onWallet={this.onApplyWalletPayment.bind(this)}
            onLoyaltyVoucher={this.onLoyaltyVoucher.bind(this)}
            cancelTendersMenu={this.cancelTendersMenu.bind(this)}
            showOtherTenderOptions={this.state.showOtherTendersMenu}
            giftCardDisabled={this.giftCardsAreDisabled}
            storeCreditIsDisabled={this.storeCreditIsDisabled}
            walletDisabled={this.walletsAreDisabled}
            valueCertificateTenderName={this.valueCertificateTenderName}
            activeTenderGroups={this.props.activeTenderGroups}
            disablePaymentScreenButtons={this.props.disablePaymentScreenButtons}
            businessState={this.props.businessState}
            stateValues={this.props.stateValues}
            cardsAreDisabled={this.primaryDeviceIsNotAvailable}
            giftCardsAreDisabled={this.giftCardsAreDisabled}
            walletsAreDisabled={this.walletsAreDisabled}
            nonIntegratedAreDisabled={this.nonIntegratedAreDisabled}
            onApplyPayment={this.onApplyPayment.bind(this)}
            valueCertificatePluralTenderName={this.valueCertificatePluralTenderName}
            getRoundingBalanceDueTender={this.getRoundingBalanceDueTender.bind(this)}
            originalTransactionDetails={this.props.originalTransactionDetails}
            originalTenders={this.props.originalTenders}
            originalUnreferencedTenders={this.props.originalUnreferencedTenders}
            activeTenders={this.props.activeTenders}
            exchangeRates={this.props.exchangeRates}
          />
        }
        {
          this.props.showPaymentDeviceSelection &&
          <PaymentDeviceSelection
              onApplyPaymentDeviceSelected={this.props.onApplyPaymentDeviceSelected}
              paymentDevicesOptions={this.getPaymentDevicesOptions()}
              resetPaymentDeviceSelection={this.props.resetPaymentDeviceSelection}/>
        }
        {
          this.props.tenderVoidMessage && this.state.showTenderVoidPopup &&
          <ToastPopUp textToDisplay={this.props.tenderVoidMessage} hidePopUp={this.hideTenderVoidPopup}/>
        }
      </View>
    );
  }

  public renderHeader(): JSX.Element {
    const hasCancelledItems = displayLinesHasType(this.props.displayInfo, ITEM_CANCEL_LINE_TYPE);
    const pageTitle: string = isRefund(this.props.stateValues) ? I18n.t("refund") : I18n.t("payment");
    if (hasCancelledItems) {
      return (
        <Header
          testID={this.testID}
          title = {pageTitle}
          backButton={{
            title: I18n.t("void"),
            action: this.props.disablePaymentScreenButtons ? () => { return; } : this.props.onVoidTransaction
          }}
          rightButton={this.getRightButton()}
       />
      );
    } else {
      return (
        <Header
          testID={this.testID}
          title = {pageTitle}
          backButton={{
            name: "Back",
            action: this.onHeaderBack
          }}
          rightButton={this.getRightButton()}
       />
      );
    }
  }

  public onHeaderBack = () => {
    if (this.props.disablePaymentScreenButtons) {
      return;
    } else if (this.state.foreignTenderType) {
      this.setExchangeRateInstance(undefined, undefined, this.props.balanceDue);
      this.setState({
        isTenderInput: false,
        foreignTenderType: undefined,
        manualEntryForeignTender: undefined,
        isExchangeRateManualEntry: false,
        enteredExchangeRate: undefined,
        errorMessage: undefined
      });
    } else {
      this.props.onEditTransaction();
    }
  }

  public renderToast = (): React.ReactNode => (
    this.state.showTempInfoPopUp &&
    <ToastPopUp
      textToDisplay={this.state.tenderAmountString}
      hidePopUp={this.hideTempInfoPopUp.bind(this)}
    />
  )

  private getPaymentDevicesOptions(): RenderSelectOptions[] {
    if (this.props.deviceSelectTenderAuthCategory === TenderAuthCategory.Wallet) {
      return this.props.walletPaymentDevices;
    }
    return this.props.primaryPaymentDevices;
  }

  private getExceedSoftMaxAmountMsg(tenderId: string): string {
    const tenderValuesDefinitions: IAuthCategoryNoneCash[] = this.props.configuration &&
        this.props.configuration.getTendersValues().tenderDefinitions;
    const tenderData: IAuthCategoryNoneCash  = tenderValuesDefinitions
      && tenderValuesDefinitions.find((tender: IAuthCategoryNoneCash) => {
        return tender.tenderType === TenderType.Cash && tender.tenderId === tenderId;
      });
    const i18nLables: ILabel = tenderData.exceedsSoftMaximumMessage;
    return i18nLables && I18n.t(i18nLables.i18nCode, { defaultValue: i18nLables.default }) ||
        I18n.t("softMaxTenderAmountMessage");
  }

  private renderShippingTitle(): boolean {
    const order = this.props.stateValues.has("transaction.order") && this.props.stateValues.get("transaction.order");
    if (order && Order.getFulfillmentGroupByType(order, FulfillmentType.shipToCustomer)) {
      return true;
    }
    return false;
  }

  private getRoundingBalanceDueTender(tenderId: string, balanceDue?: Money): TenderDenominationRoundings {
    const currencyTender = this.props.configuration.getTendersValues()?.
        tenderDefinitions?.find((tender: any) => tender.tenderId === tenderId)?.currencyCode;
    let inputAmount: Money;
    const currency = currencyTender || this.props.currency;

    if (this.state.tenderAmount && parseFloat(getAmount(this.state.tenderAmount)) !== 0 && currency) {
      inputAmount = Money.fromIMoney({amount: getAmount(this.state.tenderAmount), currency});
    }

    const roundedBalanceDue: TenderDenominationRoundings[] = !this.state.isTenderInput ?
        getDenominationRoundings(this.props.configuration,
        (balanceDue ||
        inputAmount ||
        this.props.businessState.stateValues.get("transaction.balanceDue"))) :
        undefined;
    return roundedBalanceDue && tenderId &&
        roundedBalanceDue.find((tender) => tender.tenderId === tenderId);
  }

  private getTotalDueText(): string {
    return isRefund(this.props.stateValues) ? I18n.t("refundDueCaps") :
        I18n.t("totalDueCaps");
  }

  private hasRefundedTenders(): boolean {
    return isRefund(this.props.stateValues) && this.props.displayInfo.tenderDisplayLines &&
        this.props.displayInfo.tenderDisplayLines.length > 0;
  }

  private onChangeText(tenderAmount: string): void {
    this.setState({tenderAmount});
  }

  private onBlur(): void {
    if (this.state.tenderAmount.trim().length === 0 ||
        Number.parseFloat(getAmount(this.state.tenderAmount)) === 0) {
      let {balanceDue} = this.props;
      if (this.state.foreignTenderType) {
        balanceDue =
            this.props.getConvertedAmountFromBalanceDue(this.exchangeRate?.from, this.exchangeRate).round().amount;
      }
      this.onChangeText(balanceDue);
    }
  }

  private get isPrimaryPaymentDeviceAvailable(): boolean {
    return this.props.primaryPaymentDevices.length > 0;
  }

  private get isNonIntegratedDeviceAvailable(): boolean {
    return this.props.nonIntegratedPaymentDevices && this.props.nonIntegratedPaymentDevices.length > 0;
  }

  private get isWalletDeviceAvailable(): boolean {
    return this.props.walletPaymentDevices.length > 0;
  }

  private get isGiftAvailable(): boolean {
    return this.props.primaryGiftDevices.length > 0 || this.storedValueServiceEnabled;
  }

  private get storeCreditIsDisabled(): boolean {
    return !this.storedCreditServiceEnabled;
  }

  public get primaryDeviceIsNotAvailable(): boolean {
    return !this.isPrimaryPaymentDeviceAvailable || this.props.disablePaymentScreenButtons;
  }

  public get nonIntegratedAreDisabled(): boolean {
    return !this.isNonIntegratedDeviceAvailable || this.props.disablePaymentScreenButtons;
  }

  private get walletsAreDisabled(): boolean {
    return !this.isWalletDeviceAvailable || this.props.disablePaymentScreenButtons;
  }

  private get giftCardsAreDisabled(): boolean {
    return !this.isGiftAvailable || this.props.disablePaymentScreenButtons;
  }

  private get manualExchangeRateEntryType(): ExchangeRateEntryType {
    const functionalBehavior = this.props.configuration?.getFunctionalBehaviorValues();
    return functionalBehavior?.foreignCurrencyBehaviors?.allowExchangeRateEntry || ExchangeRateEntryType.Never;
  }

  private get isEnteringExchangeRate(): boolean {
    return this.state.isExchangeRateManualEntry && !!this.state.enteredExchangeRate &&
        !isNaN(Number(this.state.enteredExchangeRate)) && parseFloat(this.state.enteredExchangeRate) > 0;
  }

  private get originalTransactionHasForeignTenders(): boolean {
    let hasForeignTenders: boolean = false;
    const originalTransactions = this.props.businessState.stateValues.get("TenderSession.originalTransactionDetails");

    if (originalTransactions?.length > 0) {
      hasForeignTenders = originalTransactions.some((transaction: IOriginalTransactionDetails) => {
        return transaction.originalTenders?.some((tender: IOriginalTender) => tender.isForeignTender);
      });
    }

    return hasForeignTenders;
  }

  private onSelectTender(newValue: RenderSelectOptions): void {
    const selectedTenderAuthCategory: string = this.props.activeTenders.find(
      (aTender) => (aTender.tenderId === newValue.code)
    ).tenderAuthCategory;
    let roundedAmount: Money;
    if (selectedTenderAuthCategory === TenderAuthCategory.None) {
      const roundedBalanceDueTender: TenderDenominationRoundings = this.getRoundingBalanceDueTender(newValue.code);
      roundedAmount = roundedBalanceDueTender && roundedBalanceDueTender.roundedValue ?
          roundedBalanceDueTender.roundedValue : undefined;
    }
    this.onApplyPayment(selectedTenderAuthCategory, [newValue.code], roundedAmount);
  }

  private onSoftMaxProceed = (): void => {
    this.setState({softMaxProceed: true}, () =>
        this.onApplyPayment(this.state.lastAppliedTenderAuthCategory, this.state.lastAppliedTenderIds, undefined));
  }

  private getConvertedAmountForApplyPayment(amount: string): string {
    return CurrencyConverter.convert(amount, this.exchangeRate?.to, this.exchangeRate?.exchangeRate, false).round().amount;
  }

  private getExchangeRateForForeignTender(tender: ITenderType): { isExchangeRateManualEntry: boolean; tenderAmount: string } {
    const isExchangeRateManualEntry = this.manualExchangeRateEntryType === ExchangeRateEntryType.WhenMissing &&
        this.currencyCodeHasMissingRate(tender?.currencyCode);
    const tenderAmount = isExchangeRateManualEntry && tender?.currencyCode
        ? new Money("0", tender.currencyCode).amount
        : this.state.tenderAmount;

    return {isExchangeRateManualEntry, tenderAmount}
  }

  private getShouldUpdateAmountForForeignTender(tenderId: string): boolean {
    return this.exchangeRate && this.state.foreignTenderType?.tenderId === tenderId;
  }

  private showPaymentTenderOptions(tenderIds: string[]): void {
    this.props.sceneTitle("reasonCodeList", "payment");
    const tenderOptions: RenderSelectOptions[] = this.getTenderOptions(tenderIds);
    this.props.navigation.push("reasonCodeList", {
      options: tenderOptions,
      onOptionChosen: this.onSelectTender.bind(this)
    });
  }

  private onApplyPayment(tenderAuthCategory: string, tenderIds: string[], roundedAmount?: Money,
                         originalTender?: IOriginalTender): void {
    const tenderType: string = getMappedTenderType(originalTender);
    if (tenderIds?.length > 1) {
      this.showPaymentTenderOptions(tenderIds);
    } else {
      let roundedErrorMessage;
      let subType;
      const tenderId: string = tenderIds?.length > 0 && tenderIds[0];
      if (!tenderAuthCategory && tenderId) {
        const tenderById = this.props.activeTenders.find(
          (aTender) => (aTender.tenderId === tenderId));
        tenderAuthCategory = tenderById && tenderById.tenderAuthCategory;
        subType = tenderById && tenderById.subType;
      }

      const originalAmount: string = this.getOriginalAmount(originalTender, roundedAmount);

      let amount: string = this.getCurrentTenderAmount(roundedAmount, originalAmount);
      let foreignTenderAmount: Money;

      if (this.getShouldUpdateAmountForForeignTender(tenderId)) {
        foreignTenderAmount = Money.fromIMoney({amount, currency: this.exchangeRate?.from});
        amount = this.getConvertedAmountForApplyPayment(amount);
      }

      const validationChanges = getValidatedRoundedPrice(this.props.configuration, tenderId,
          amount, this.props.currency, roundedAmount, foreignTenderAmount);

      const tender: ITenderType = this.props.activeTenders.find((aTender) => (aTender.tenderId === tenderId));
      if (tender?.isForeignTender && this.state.foreignTenderType !== tender) {
        this.setState({ isTenderInput: false });
        const { isExchangeRateManualEntry, tenderAmount } = this.getExchangeRateForForeignTender(tender);

        if (isExchangeRateManualEntry) {
          const exchangeRate: ExchangeRate = {
            to: this.props.currency,
            from: tender?.currencyCode,
            exchangeRate: undefined
          };

          this.setState({ manualEntryForeignTender: tender }, () => this.props.startExchangeRateEntry(exchangeRate));
        } else {
          this.setState({ foreignTenderType: tender, isExchangeRateManualEntry, tenderAmount });
        }
      } else {
        this.setState({ isTenderInput: validationChanges.isTenderInput });
        if (!validationChanges.invalidAmountMessage) {
          if (this.isEnteringExchangeRate || !this.state.isExchangeRateManualEntry) {
            switch (tenderAuthCategory) {
              case TenderAuthCategory.GiftDevice:
              case TenderAuthCategory.StoredValueCardService:
                this.onApplyGCPayment(originalTender);
                break;
              case TenderAuthCategory.StoredValueCertificateService:
                this.onApplyValueCertificatePayment(originalTender, (subType as TenderSubType));
                break;
              case TenderAuthCategory.LoyaltyVoucherService:
                this.onLoyaltyVoucher(this.valueCertificateTenderName);
                break;
              default:
                this.props.onApplyPayment(tenderAuthCategory, tenderId, amount, originalAmount, this.state.softMaxProceed,
                  undefined, originalTender?.originalTransactionReferences, undefined, undefined, undefined, undefined,
                  undefined, tenderType, undefined, {
                    foreignTenderAmount,
                    exchangeRateValue: this.exchangeRate?.exchangeRate,
                    exchangeRateManuallyEntered: this.state.isExchangeRateManualEntry
                  });
                break;
            }
          }
        } else {
          roundedErrorMessage = validationChanges.invalidAmountMessage;
        }
      }
      this.setState(
        {
          errorMessage: roundedErrorMessage,
          showOtherTendersMenu: false,
          lastAppliedTenderAuthCategory: tenderAuthCategory,
          lastAppliedTenderIds: tenderIds
        });
    }
  }

  private getCurrentTenderAmount(roundedAmount: Money, originalAmount: string): string {
    return (roundedAmount && getAmount(roundedAmount.amount)) || originalAmount || getAmount(this.state.tenderAmount);
  }

  private getOriginalAmount(originalTender: IOriginalTender, roundedAmount: Money): string {
    const originalRefundableAmount = (originalTender?.showReference || originalTender?.isMappedTender) &&
        getOriginalTenderRefundableAmount(originalTender, this.props.stateValues.get("transaction.balanceDue").abs(),
        this.props.originalTransactionDetails);
    let originalAmount: string;
    if (originalTender) {
      originalAmount = originalRefundableAmount && getAmount(originalRefundableAmount.amount) ||
          getAmount(this.state.tenderAmount);
    }
    return originalAmount;
  }

  private currencyCodeHasMissingRate(currency: string): boolean {
    return !this.props.exchangeRates?.some((exchangeRate: ExchangeRate) => exchangeRate.from === currency);
  }

  private onApplyGCPayment(originalTender: IOriginalTender): void {
    const tenderType: string = getMappedTenderType(originalTender);
    this.setState({showOtherTendersMenu: false});
    const originalRefundableAmount = originalTender &&
        (originalTender.showReference || originalTender.isMappedTender) &&
        getOriginalTenderRefundableAmount(originalTender, this.props.stateValues.get("transaction.balanceDue").abs(),
            this.props.originalTransactionDetails);
    const amount: string = (originalRefundableAmount && getAmount(originalRefundableAmount.amount)) ||
        getAmount(this.state.tenderAmount);
    this.props.handleRedeemPayment(amount, this.storedValueServiceEnabled ?
        TenderAuthCategory.StoredValueCardService : TenderAuthCategory.GiftDevice, originalTender, tenderType);
  }

  private onApplyValueCertificatePayment(originalTender: IOriginalTender, subType: TenderSubType): void {
    this.setState({showOtherTendersMenu: false, originalTender, subType});
    this.props.updatePendingPayment(PendingPaymentMode.WaitingOnCustomer);
    if (isRefund(this.props.stateValues) && isCustomerRequiredForTender(TenderType.ValueCertificate,
        subType, TenderAuthCategory.StoredValueCertificateService,
        this.props.settings.diContainer, getAmount(this.state.tenderAmount), this.props.currency,
        this.props.stateValues.get("transaction.balanceDue"), this.props.settings.configurationManager) &&
        !this.props.businessState.stateValues.get("transaction.customer")) {
      this.setState( {waitingOnCustomer: true, originalTender});
      this.props.navigation.push("customer", {
        isTransactionStarting: false,
        assignCustomer: true,
        backNavigationTitle: I18n.t("payment"),
        onExit: () => {
          // Customer event executed or completed
          // mode will be updated depending on processing, simply return to payment
          this.props.navigation.dispatch(popTo("payment"));
        },
        onCancel: () => {
          // User selected back
          // Return to payment screen we will not be able to redeem
          this.props.updatePendingPayment(PendingPaymentMode.Completed);
          this.props.navigation.dispatch(popTo("payment"));
        }
      });
    } else {
      this.applyValueCertificatePayment(originalTender, subType);
    }
  }

  private applyValueCertificatePayment(originalTender: IOriginalTender, subType: TenderSubType): void {
    this.props.updatePendingPayment(PendingPaymentMode.Completed);
    const tenderType: string = originalTender && originalTender.isMappedTender && originalTender.tenderType;
    const originalRefundableAmount = originalTender &&
        (originalTender.showReference || originalTender.isMappedTender) &&
        getOriginalTenderRefundableAmount(originalTender, this.props.stateValues.get("transaction.balanceDue").abs(),
            this.props.originalTransactionDetails);
    const amount: string = (originalRefundableAmount && getAmount(originalRefundableAmount.amount)) ||
        getAmount(this.state.tenderAmount);
    if (isRefund(this.props.stateValues)) {
      this.props.onApplyPayment(TenderAuthCategory.StoredValueCertificateService, originalTender && originalTender.tenderId, amount,
          amount, this.state.softMaxProceed, undefined, originalTender && originalTender.originalTransactionReferences, undefined,
          undefined, undefined, undefined, undefined, tenderType, subType);
    } else {
      this.setState({redeemPayment: true});
      this.props.handleRedeemPayment(amount, TenderAuthCategory.StoredValueCertificateService, originalTender,
          tenderType, subType);
    }
  }

  private onApplyWalletPayment(originalTender: IOriginalTender): void {
    this.setState({showOtherTendersMenu: false});
    if (originalTender) {
      this.onApplyPayment(originalTender.tenderAuthCategory, [originalTender.tenderId], undefined, originalTender);
    } else {
      this.props.handleRedeemPayment(getAmount(this.state.tenderAmount), TenderAuthCategory.Wallet);
    }
  }

  private onApplyOtherPayment(): void {
    this.setState({showOtherTendersMenu: true});
  }

  private renderDetailTitle(textToTranslate: string): JSX.Element {
    return (
      <Text
        style={this.styles.detailsText}
        adjustsFontSizeToFit
        numberOfLines={1}
        {...getTestIdProperties(this.testID, `${textToTranslate}-text`)}>
          {I18n.t(textToTranslate)}
      </Text>
    );
  }

  private renderDetailValue(amount: Money, name: string): JSX.Element {
    return (
      <Text
        style={this.styles.detailsText}
        adjustsFontSizeToFit
        numberOfLines={1}
        {...getTestIdProperties(this.testID, `${name}-text`)}>
          {printAmount(amount)}
      </Text>
    );
  }

  private hideTempInfoPopUp(): void {
    this.setState({
      showTempInfoPopUp: false,
      tenderAmountString: undefined
    });
  }

  private hideTenderVoidPopup = (): void => {
    this.setState({ showTenderVoidPopup: false });
  }

  private retryAuthorization(): void {
    this.props.handleRetryAuthorization();
  }

  private handleOfflineAuthorization(): void {
    this.props.handleOfflineOptions();
  }

  private cancelOffline(): void {
    this.props.handleCancelOfflineAuthorization();
  }

  private onLoyaltyVoucher(tenderName: string): void {
    this.setState({ showOtherTendersMenu: false });
    this.props.onLoyaltyVoucher(tenderName, this.valueCertificatePluralTenderName || tenderName);
  }

  private cancelTendersMenu(): void {
    this.setState({showOtherTendersMenu: false});
  }

  private fullTaxInvoiceVisible(typeChoicesConfig: any, i18nTaxFreeConfig: I18nTaxFreeConfig): boolean {
    const fullTaxInvoiceAllowedFor = typeChoicesConfig?.fullTaxInvoiceAllowedFor;

    if (typeChoicesConfig?.fullTaxInvoice &&
        (i18nTaxFreeConfig?.mixWithInvoiceAllowed !== false ||
        !this.props.businessState.stateValues.get("taxRefundSession.documentIdentifier")) &&
        (fullTaxInvoiceAllowedFor === ReceiptTypeAllowedTransactionType.Both ||
        fullTaxInvoiceAllowedFor === ReceiptTypeAllowedTransactionType.Original ||
        fullTaxInvoiceAllowedFor === undefined)) {
      return this.props.receiptCategoryForReturnWithTransaction &&
          this.props.receiptCategoryForReturnWithTransaction !== ReceiptCategory.Invoice ? false : true;
    }
    return false;
  }

  private getTenderOptions(tenderIds: string[]): RenderSelectOptions[] {
    return tenderIds?.map((id: string): RenderSelectOptions => {
      const activeTender: ITenderType = this.props.activeTenders.find(
        (aTender: any) => (aTender.tenderId === id)
      );
      let description: string;
      let disabled: boolean = false;
      const configLabel: ILabel = activeTender?.tenderLabel;
      const tenderDescription: string = configLabel && I18n.t(configLabel.i18nCode,
          {defaultValue: configLabel.default});

      let localiseDesc: string;
      if (activeTender.isForeignTender) {
        const hasMissingRate: boolean = this.currencyCodeHasMissingRate(activeTender?.currencyCode);
        disabled = this.manualExchangeRateEntryType === ExchangeRateEntryType.Never && hasMissingRate;

        if (hasMissingRate) {
          description = I18n.t("noRates");
        } else {
          description = undefined;
        }
        localiseDesc = tenderDescription;
        return { code: id, localiseDesc, description, disabled };
      } else {
        const roundedBalanceDueTender: TenderDenominationRoundings = this.getRoundingBalanceDueTender(id);
        const labelSuffix: string = getRoundedBalanceLabel(roundedBalanceDueTender);
        if (tenderDescription) {
          localiseDesc = tenderDescription;
        } else {
          localiseDesc = I18n.t("cash");
        }
        if (labelSuffix) {
          description = labelSuffix;
        }
        return {code: id, localiseDesc, description};
      }
    });
  }

  private getRightButton(): JSX.Element | { title: string; action: () => void } {
    const typeChoicesConfig = this.props.configuration.getFunctionalBehaviorValues().receipt?.typeChoices;
    const i18nLocation = this.props.i18nLocation;
    const i18nTaxFreeConfig: I18nTaxFreeConfig = i18nLocation && this.props.configuration.getI18nCountryConfigValues(i18nLocation).taxFree;
    return this.fullTaxInvoiceVisible(typeChoicesConfig, i18nTaxFreeConfig) ? this.getKebabMenu(typeChoicesConfig) : undefined;
  }

  private getKebabMenu(typeChoicesConfig: any): JSX.Element {
    return (
      <View>
        <Menu
          ref={this.setMenuRef}
          button={
            <TouchableOpacity style={this.styles.menuIcon} onPress={() => this.showMenu()} >
              <VectorIcon
                  name={"Kebab"}
                  fill={this.styles.menuIcon.color}
                  height={this.styles.menuIcon.fontSize}
                />
            </TouchableOpacity>}
        >
          <MenuItem onPress={this.handleInvoice}> {fullTaxInvoiceText(typeChoicesConfig)}</MenuItem>
        </Menu>
      </View>);
  }

  private handleInvoice = (): void => {
    this.hideMenu();
    InteractionManager.runAfterInteractions(this.props.handleTaxCustomerAssignment);
  }

  private setMenuRef = (ref: any) => {
    this.menu = ref;
  }

  private hideMenu = (): void => {
    this.menu.hide();
  }

  private showMenu = (): void => {
    this.menu.show();
  }

  private businessOperationCompletedSuccessfully(prevProps: Props): boolean {
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress) {
      return !this.props.businessState.error;
    }
  }

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    retailLocations: state.retailLocations,
    pendingPaymentMode: state.pendingPayment?.mode,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<StateProps, DispatchProps, PaymentPhoneProps>(mapStateToProps)(Payment);
