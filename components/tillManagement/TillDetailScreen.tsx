import { last } from "lodash";
import Moment from "moment";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { Field, FormErrors, FormInstance, formValueSelector, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { DeviceIdentity, IConfigurationManager, QualificationError, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  AccountabilityMode,
  CashDrawerSessionState,
  CONFIRM_CASH_DRAWER_CLOSED_EVENT,
  getFeatureAccessConfig,
  IAuthCategoryNoneCash,
  IReasonCodeList,
  ITenderAuthCategory,
  ITillDisplayLine,
  RADIX,
  ReceiptCategory,
  SAFE_TO_TILL_EVENT,
  SYNC_STATE_EVENT,
  TILL_AUDIT_EVENT,
  TILL_COUNT_EVENT,
  TILL_IN_EVENT,
  TILL_OUT_EVENT,
  TILL_RECONCILIATION_EVENT,
  TILL_TO_BANK_EVENT,
  TILL_TO_SAFE_EVENT,
  UiInputKey,
  VOID_TENDER_CONTROL_TRANSACTION_EVENT,
  VOID_TILL_CONTROL_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { IExpectedTender } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { ActionCreator, alert, AlertRequest, businessOperation, dismissAlertModal, displayToast } from "../../actions";
import { AppState, BusinessState } from "../../reducers";
import Theme from "../../styles";
import { AlertModalButton } from "../common/AlertModal";
import BaseView from "../common/BaseView";
import { Denomination } from "../common/CurrencyCalculator";
import {
  compareRenderSelectOptions,
  CurrencyInput,
  RenderSelectOptions,
  renderTextInputField
} from "../common/FieldValidation";
import Header from "../common/Header";
import { getStoreLocale, getStoreLocaleCurrencyOptions, getCashTenderData, ICurrencyData } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import {
  getConfirmDrawerClosed18nCode,
  getPlaceholder18nCode,
  getSuccessful18nCode,
  getTitle18nCode,
  getVoidMessage18nCode,
  getVoidTitle18nCode
} from "../common/utilities/tillManagementUtilities";
import VectorIcon from "../common/VectorIcon";
import ReceiptOptionForm from "../receipt/ReceiptOptionForm";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { CurrencyDenominator, TillDetailScreenProps, VarianceAmount } from "./interfaces";
import { tillDetailStyles } from "./styles";
import { isMultiCurrency } from './constants';

enum currencyType {
  notes = "notes",
  coins = "coins"
}

interface TillTransferAmountForm {
  sealBagKey?: string;
}

interface StateProps {
  state: AppState;
  businessState: BusinessState;
  cashDrawerState: CashDrawerSessionState;
  configManager: IConfigurationManager;
  currentScreenName: string;
  deviceIdentity: DeviceIdentity;
  retailLocationCurrency: string;
  sealBagKey?: string;
}

interface DispatchProps {
  alert: AlertRequest;
  dismissAlertModal: ActionCreator;
  performBusinessOperation: ActionCreator;
  displayToastAction: ActionCreator;
}

interface Props extends TillDetailScreenProps, StateProps, DispatchProps, NavigationScreenProps<"tillDetail"> {}

interface State {
  capturedData: TillTransferAmountForm;
  expectedAmounts: IExpectedTender[];
  expectedFloatAmounts: IExpectedTender[];
  currencyData: ICurrencyData[]
  needToPrint: boolean;
  tillEventAlertShowing: boolean;
  transferAmountsFromCalculator: CurrencyDenominator[];
  varianceComment: string;
  varianceReason: RenderSelectOptions;
  voidStarted: boolean;
  waitingConfirmation: boolean;
  updateBalance: boolean;
  skipVarianceScreen: boolean;
  hasFloatAmountError: boolean;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.tillManagement.TillDetailScreen");

class TillDetailScreen extends React.Component<Props & InjectedFormProps<TillTransferAmountForm, Props> &
    FormInstance<TillTransferAmountForm, undefined>, State> {
  private denominationCountRequired: boolean;
  private blindCountAllowed: boolean;
  private maintainFloatInTill: boolean;
  private allowFloatAmountManualUpdate: boolean;
  private captureCommentForCountVarianceAllowed: boolean;
  private acceptableVariance: Money;
  private reasonCodeListType: string;
  private reasons: RenderSelectOptions[];
  private styles: any;
  private notes: Denomination[][];
  private coins: Denomination[][];
  private tillEventWasSent: boolean = false;
  private businessDayDate: Date;
  private printReceipt: boolean;
  private eventDateTime: Date;

  public constructor(props: Props & InjectedFormProps<TillTransferAmountForm, Props> &
      FormInstance<TillTransferAmountForm, undefined>) {
    super(props);

    this.eventDateTime = undefined;

    const featureConfig = getFeatureAccessConfig(props.configManager, props.eventType);
    this.printReceipt = !!featureConfig.printReceipt ? featureConfig.printReceipt :
        featureConfig.printReceipt === undefined;
    this.denominationCountRequired = featureConfig && featureConfig.denominationCountRequired;
    this.blindCountAllowed = featureConfig && featureConfig.allowBlindCount;
    this.maintainFloatInTill = featureConfig && featureConfig.maintainFloatInTill;
    this.allowFloatAmountManualUpdate = !!featureConfig.allowFloatAmountManualUpdate ? featureConfig.allowFloatAmountManualUpdate :
        featureConfig.allowFloatAmountManualUpdate === undefined;
    this.captureCommentForCountVarianceAllowed = featureConfig?.captureCommentForCountVariance !== undefined ?
        featureConfig?.captureCommentForCountVariance : true;

    const initialFormData = { ...props.initialValues }
    const currencyData = getCurrencyData(props);
    currencyData.forEach((currencyItem: ICurrencyData, index) => {
      Object.assign(initialFormData, {
        [`transferAmounts${index}`]: undefined
      });
    });

    props.initialize(initialFormData);
    const expectedAmounts = this.getExpectedAmounts(props, currencyData);
    const expectedFloatAmounts = this.getExpectedFloatAmounts(props);
    const functionalBehaviorsConfig = props.configManager.getFunctionalBehaviorValues()
    const storeOperationsBehaviors = functionalBehaviorsConfig && functionalBehaviorsConfig.storeOperationsBehaviors;
    const acceptableVarianceConfig: string = storeOperationsBehaviors && storeOperationsBehaviors.acceptableTillVariance;

    if (featureConfig && featureConfig.reasonCodeListType) {
      this.reasonCodeListType = featureConfig.reasonCodeListType;

      const configuredReasonCodes: IReasonCodeList = props.configManager.getReasonCodesValues()
          .reasonCodeLists[this.reasonCodeListType].reasonCodeDefinitions;
      // Using those, build selection list (Sorted in ascending order of reason code name)
      this.reasons = Object.keys(configuredReasonCodes)
          .map((aReasonCode: string): RenderSelectOptions => {
            return {
              code: aReasonCode,
              description: configuredReasonCodes[aReasonCode].name
            };
          })
          .sort((reason1, reason2): number => {
            return compareRenderSelectOptions (reason1, reason2);
          });
    }
    const notes: Denomination[][] = [];
    const coins: Denomination[][] = [];
    this.acceptableVariance = acceptableVarianceConfig && new Money(
      acceptableVarianceConfig,
      this.props.retailLocationCurrency
    ).abs();
    currencyData.forEach((currencyItem: ICurrencyData) => {
      notes.push(this.getCurrencyDenomination(currencyItem.currencyCode, currencyType.notes));
      coins.push(this.getCurrencyDenomination(currencyItem.currencyCode, currencyType.coins));
    });

    this.notes = notes;
    this.coins = coins;

    const stateValues = props.businessState.stateValues;
    this.businessDayDate = stateValues && stateValues.get("TerminalSession.lastActiveBusinessDay");
    const convertedAmounts = expectedAmounts.map((expectedAmount: IExpectedTender) => {
      return expectedAmount && ({
        tenderId: expectedAmount.tenderId,
        amount: expectedAmount.amount && new Money(expectedAmount.amount.amount, expectedAmount.amount.currency)
      });
    });

    const convertedExpectedFloatAmounts = expectedFloatAmounts && expectedFloatAmounts.map((expectedFloatAmount: IExpectedTender) => {
      return expectedFloatAmount && ({
        tenderId: expectedFloatAmount.tenderId,
        amount: expectedFloatAmount.amount && new Money(expectedFloatAmount.amount.amount, expectedFloatAmount.amount.currency)
      });
    });

    this.state = {
      capturedData: undefined,
      expectedAmounts: convertedAmounts,
      expectedFloatAmounts: convertedExpectedFloatAmounts,
      needToPrint: false,
      tillEventAlertShowing: undefined,
      transferAmountsFromCalculator: [],
      varianceComment: undefined,
      varianceReason: undefined,
      voidStarted: false,
      currencyData,
      waitingConfirmation: false,
      updateBalance: false,
      skipVarianceScreen: false,
      hasFloatAmountError: false
    };

    this.styles = Theme.getStyles(tillDetailStyles());
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    const { inProgress, stateValues } = this.props.businessState;
    const transactionClosed: boolean = prevProps.businessState.inProgress && !inProgress &&
        !!stateValues?.get("transaction.closed");

    /**
     * Phone uses separate screen for printer selection, must wait for that screen to pop away before moving to success,
     * Use state.needToPrint on phone only to distinguish that.
     */
    const moveToNextScreen: boolean = !this.state.voidStarted && (Theme.isTablet && transactionClosed) ||
        (!Theme.isTablet && prevState.needToPrint !== this.state.needToPrint && !this.state.needToPrint);

    if (moveToNextScreen) {
     this.moveToNextScreen();
    }

    this.handleAlertAndFormDataChanges(prevState);

    this.checkAndHandleCashDrawerClosed(prevProps);

    this.handleBusinessEventFinishedProcessing(prevProps);
  }

  public render(): JSX.Element {
    const { handleSubmit } = this.props;
    const locale = getStoreLocale();
    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={(Theme.isTablet && this.state.needToPrint && this.printReceipt) ?
              I18n.t("receipt") : I18n.t(getTitle18nCode(this.props.eventType))}
          backButton={!this.state.needToPrint ? {
            name: "Back",
            title: Theme.isTablet ? I18n.t("tillManagement") : undefined,
            action: this.startVoidTransactionProcess
          } : <View />}
          rightButton={!this.state.needToPrint ? {
            title: I18n.t("proceed"),
            action: handleSubmit((data: TillTransferAmountForm) => this.onSaveData(data))
          } : <View />}
        />
        <KeyboardAwareScrollView contentContainerStyle={this.styles.contentContainer}>
          {
            !this.state.needToPrint && (
              <View>
                { this.renderTransferHeader(locale) }
                { this.state.currencyData.map((currencyItem: ICurrencyData, index) => this.renderTransferForm(index, locale)) }
              </View>
            )
          }
          {
            this.state.needToPrint &&
            <ReceiptOptionForm
              styles={this.styles.root}
              eventTypeForReceipt={this.props.eventType}
              providedReceiptCategory={ReceiptCategory.Till}
              onClose={this.receiptOptionFormOnClose}
              navigation={this.props.navigation}
            />
          }
        </KeyboardAwareScrollView>
      </BaseView>
    );
  }

  private renderTransferForm(index: number, locale: string): JSX.Element {
    const localeCurrencyOptions = getStoreLocaleCurrencyOptions();
    return (
      <View style={[this.styles.amount, index > 0 ? this.styles.amountSeparator : {}]}>
        <Text style={this.styles.tenderNameText}>
          {this.state.currencyData[index].tenderName}
        </Text>
        {
          this.isTillToBankEvent() &&
          this.renderExpectedDepositText(locale, localeCurrencyOptions, index)
        }
        {
          !this.denominationCountRequired &&
          <View>
            <View style={[this.styles.inputPanel]}>
              <CurrencyInput
                name={"transferAmounts" + index}
                blurOnSubmit={false}
                persistPlaceholder={true}
                placeholder={I18n.t(getPlaceholder18nCode(this.props.eventType))}
                currency={this.state.currencyData[index].currencyCode}
                style={this.styles.inputField}
                inputStyle={this.styles.inputErrorField}
                placeholderSentenceCase={false}
                errorStyle={this.styles.inputError}
                onChange={(text: string) => this.handleOnChange(text, index)}
                onEndEditing={() => this.onEndEditingTransferAmount(index)}
                onSubmitEditing={this.props.eventType !== TILL_OUT_EVENT &&
                    this.props.handleSubmit((data: TillTransferAmountForm) => this.onSaveData(data))}
              />
              <View style={this.styles.calculatorContainer}>
                <TouchableOpacity
                  style={this.styles.calculator}
                  onPress={() => this.loadCalculator(index)}
                >
                  <VectorIcon
                    name="Calculator"
                    fill={this.styles.calculatorIcon.color}
                    height={this.styles.calculatorIcon.fontSize}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        {
          this.denominationCountRequired &&
          <View style={this.styles.amount}>
            <TouchableOpacity
              style={[this.styles.buttonRow]}
              onPress={() => this.loadCalculator(index)}
            >
              <View>
                <Text style={this.styles.amountText}>
                  {I18n.t(getPlaceholder18nCode(this.props.eventType))}
                </Text>
                {
                  this.state.transferAmountsFromCalculator[index] &&
                  this.state.transferAmountsFromCalculator[index].total &&
                  <Text style={this.styles.textTitle}>
                    {new Money(
                      this.state.transferAmountsFromCalculator[index].total,
                      this.props.retailLocationCurrency).toLocaleString(getStoreLocale()
                        , getStoreLocaleCurrencyOptions() )}
                  </Text>
                }
              </View>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </TouchableOpacity>
            <Field
              name={"transferAmounts" + index}
              component={renderTextInputField}
              style={this.styles.hidden}
              inputStyle={this.styles.hidden}
              errorStyle={this.styles.inputError}
            />
          </View>
        }
        {
          this.showExpectedAmount(index) &&
          !this.isTillToBankEvent() &&
          <View>
            <Text style={[this.styles.expectedAmountText]}>
            { `${I18n.t("expected")}: ` }
            {
              this.state.expectedAmounts[index]?.amount
                ? Money.fromIMoney(this.state.expectedAmounts[index].amount).toLocaleString(locale, localeCurrencyOptions)
                : I18n.t("n/a")
            }
          </Text>
        </View>
      }
      {
        this.isTillToBankEvent() &&
        index === 0 &&
        this.renderTillToBankInput()
      }
      {
        this.maintainFloatInTill && !this.state.currencyData[index].isForeignTender &&
        this.renderFloatAmountForm(index, locale)
      }
    </View>
    );
  }

  private renderFloatAmountForm(index: number, locale: string): JSX.Element {
    const localeCurrencyOptions = getStoreLocaleCurrencyOptions();
    const countedAmount = this.getCountedAmountFromForm(index).toLocaleString(locale, localeCurrencyOptions);

    return (
      <View style={[this.styles.amount, index > 0 ? this.styles.amountSeparator : {}]}>
        <View style={[this.styles.inputPanel]}>
          <CurrencyInput
            name={"floatAmounts" + index}
            blurOnSubmit={false}
            persistPlaceholder={true}
            placeholder={I18n.t("float")}
            editable={this.allowFloatAmountManualUpdate}
            currency={this.state.currencyData[index].currencyCode}
            style={this.styles.inputField}
            placeholderSentenceCase={false}
            onChange={(text: string) => this.setState({hasFloatAmountError: false})}
            errorStyle={this.styles.inputError}
          />
        </View>
        {
          <View>
            <Text style={[this.styles.expectedAmountText]}>
              { `${I18n.t("expected")}: ` }
              {
                this.state.expectedFloatAmounts && this.state.expectedFloatAmounts[index]?.amount
                  ? Money.fromIMoney(this.state.expectedFloatAmounts[index].amount).toLocaleString(locale, localeCurrencyOptions)
                  : I18n.t("n/a")
              }
            </Text>
          </View>
        }
        { this.state.hasFloatAmountError &&
          <View style={this.styles.inputErrorMessage}>
            <Text style={this.styles.inputError}>
              {I18n.t("floatMaximumExceededError", { maxAmount: countedAmount })}
            </Text>
          </View>
        }
      <View style={this.styles.dividerInputText} />
    </View>
    );
  }

  private renderTransferHeader(locale: string): JSX.Element {
    const format = I18n.t("date.format", {locale});
    return (
      <View style={this.styles.header}>
          {
            <View style={this.styles.textRow}>
              <Text style={this.styles.textTitle}>{`${I18n.t("drawerID")}:`}</Text>
              <Text style={this.styles.textValue}>{this.props.cashDrawerKey}</Text>
            </View>
          }
          {
            this.props.eventType === TILL_TO_BANK_EVENT &&
            <View style={this.styles.textRow}>
              <Text style={this.styles.textTitle}>{`${I18n.t("businessDay")}:`}</Text>
              <Text style={this.styles.textValue}>{Moment(this.businessDayDate).format(format)}</Text>
            </View>
          }
          {
            this.showCaution() &&
            !this.isTillToBankEvent() &&
            <View style={this.styles.cautionPanel}>
              <View style={this.styles.cautionIconPadding}>
                <VectorIcon
                  name={"CautionDiamond"}
                  fill={this.styles.cautionIcon.color}
                  height={this.styles.cautionIcon.fontSize}
                />
              </View>
              <Text style={this.styles.cautionText}>
                {I18n.t("expectedAmountUnavailable")}
              </Text>
            </View>
          }
        </View>
    )
  }

  private renderTillToBankInput(): JSX.Element {
    return (
      <View style={this.styles.amount}>
        <View style={[this.styles.inputPanel]}>
          <Field
            name="sealBagKey"
            placeholder={I18n.t("sealBagKey")}
            style={this.styles.inputField}
            inputStyle={this.styles.inputErrorField}
            errorStyle={this.styles.inputError}
            component={renderTextInputField}
            onSubmitEditing={this.props.handleSubmit((data: TillTransferAmountForm) => this.onSaveData(data))}
          />
        </View>
      </View>
    );
  }

  private renderExpectedDepositText(locale: string, localeCurrencyOptions: object, index: number): JSX.Element {
    return (
      <View style={this.styles.amount}>
        <View style={this.styles.alternateHeader}>
          <View style={this.styles.textRow}>
            <Text style={this.styles.textTitle}>{`${I18n.t("expectedDeposit")}:`}</Text>
            {
              <Text style={this.styles.textValue}>
                {
                  this.state.expectedAmounts?.length > 0 && this.state.expectedAmounts[index]?.amount
                      ? Money.fromIMoney(this.state.expectedAmounts[index].amount).toLocaleString(locale, localeCurrencyOptions)
                      : I18n.t("n/a")
                }
              </Text>
            }
          </View>
        </View>
      </View>
    );
  }

  private formattedAmount(transferAmount: string, tenderId: string): IExpectedTender {
    return {
      tenderId,
      amount: {
        amount: transferAmount,
        currency: this.props.retailLocationCurrency
      }
    };
  }

  private showExpectedAmount(index: number): boolean {
    return !this.isSafeToTillOrTillToSafe() && ((this.isTillIn(this.props) && !!this.state.expectedAmounts[index]) ||
        (!this.isTillIn(this.props) && !this.blindCountAllowed));
  }

  private showCaution(): boolean {
    return !this.isSafeToTillOrTillToSafe() && this.state.expectedAmounts?.length < 1 && !this.isTillIn(this.props);
  }

  private isTillToBankEvent(): boolean {
    return this.props.eventType === TILL_TO_BANK_EVENT;
  }

  private getCurrencyDenomination(retailLocationKey: string, type: string): Denomination[] {
    const denomination: Denomination[] = [];
    this.props.configManager.getI18nCurrencyDenomination()[retailLocationKey]
      .denomination[type].map((item: any, i: number) => {
        denomination.push({value: item.value, qty: 0, total: 0.00, index: i});
      });
    return denomination;
  }

  private getTransferAmountFromCalculator(amount: string, index: number): void {
    const locale = getStoreLocale();
    const decimalPrecision: number = Number.parseInt(I18n.t("currency.format.precision", { locale }), RADIX);
    if (decimalPrecision === 0 || decimalPrecision === undefined) {
      const splitedAmount: any = amount.split(".");
      this.props.change("transferAmounts" + index, splitedAmount[0]);
    } else {
      this.props.change("transferAmounts" + index, amount);
    }
    setTimeout(() => {
      this.onEndEditingTransferAmount(index);
    }, 200);
  }

  private loadCalculator = (index: number): void => {
    this.props.navigation.push("currencyCalculator", {
      eventType: this.props.eventType,
      currency: this.state.currencyData[index].currencyCode,
      amount: this.state.transferAmountsFromCalculator[index],
      notes: this.notes[index],
      coins: this.coins[index],
      onExit: (transferAmountFromCalculator: CurrencyDenominator) => {
        const stateTransferAmount = this.state.transferAmountsFromCalculator;
        stateTransferAmount[index] = transferAmountFromCalculator;
        this.setState({ transferAmountsFromCalculator: stateTransferAmount });
        this.getTransferAmountFromCalculator(transferAmountFromCalculator.total.amount, index);
        this.props.navigation.pop();
      }
    });
  }

  private onEndEditingTransferAmount(index: number): void {
    const selector = formValueSelector("tillTransferAmount");
    const transferAmountFormVal = selector(this.props.state, 'transferAmounts'+ index);
    const expectedAmount: IExpectedTender = this.getExpectedFloatTender(index, this.state.currencyData[index]);
    const expectedAmountAsMoney: Money = Money.fromIMoney(expectedAmount.amount);
    const transferAmountAsMoney: Money = new Money(transferAmountFormVal || "0",
        this.state.currencyData[index].currencyCode);
    if(transferAmountAsMoney.gte(expectedAmountAsMoney)) {
      this.props.change("floatAmounts"+ index, expectedAmountAsMoney.amount);
    } else {
      this.props.change("floatAmounts"+ index, transferAmountAsMoney.amount);
    }
  }

  private handleOnChange(text: string, index: number): void {
    if (this.state.transferAmountsFromCalculator[index] && !this.state.waitingConfirmation) {
      this.setState(
        { waitingConfirmation: true },
        () => this.props.alert(
          I18n.t("updateAmountTitle"),
          I18n.t("updateAmountMessage"),
          [
            {
              text: I18n.t("cancel"),
              style: "cancel",
              onPress: () => {
                const currentCalculatorValue = this.state.transferAmountsFromCalculator[index];
                this.setState({ waitingConfirmation: false });
                this.getTransferAmountFromCalculator(currentCalculatorValue.total.amount, index);
              }
            },
            {
              text: I18n.t("continue"),
              onPress: () => {
                this.setState((prevState) => {
                  return {
                    transferAmountsFromCalculator: [
                      ...prevState.transferAmountsFromCalculator.slice(0, index),
                      ...prevState.transferAmountsFromCalculator.slice(index + 1)
                    ],
                    waitingConfirmation: false
                  }
                })
              }
            }
          ], { cancelable: false }
        )
      );
    }
  }

  private moveToBasket(): void {
    this.props.displayToastAction(I18n.t(getSuccessful18nCode(this.props.eventType)));
    this.props.navigation.dispatch(popTo("main"));
  }

  private getCountedAmountFromForm(index: number): Money {
    const selector = formValueSelector("tillTransferAmount");
    const countedAmountFormVal = selector(this.props.state, 'transferAmounts'+ index);
    const countedAmountAsMoney: Money = new Money(countedAmountFormVal || "0",
        this.state.currencyData[index].currencyCode);
    return countedAmountAsMoney;
  }

  private getFloatAmountFromForm(index: number): Money {
    const selector = formValueSelector("tillTransferAmount");
    const floatAmountFormVal = selector(this.props.state, 'floatAmounts'+ index);
    const floatAmountAsMoney: Money = new Money(floatAmountFormVal || "0",
        this.state.currencyData[index].currencyCode);
    return floatAmountAsMoney;
  }

  private onSaveData(data: TillTransferAmountForm): void {
    if (!!this.maintainFloatInTill) {
      this.state.currencyData.forEach((currencyItem: ICurrencyData, index: number) => {
        if (!currencyItem.isForeignTender) {
          const floatAmount: Money = this.getFloatAmountFromForm(index);
          const transferAmount: Money = this.getCountedAmountFromForm(index);
          if (floatAmount.isNotZero && floatAmount.gt(transferAmount)) {
            this.setState({hasFloatAmountError: true})
          } else {
            this.setState({ capturedData: Object.assign({}, data) });
            this.tillEventWasSent = false;
          }
          return;
        }
      });
    } else {
      this.setState({ capturedData: Object.assign({}, data) });
      this.tillEventWasSent = false;
    }
  }

  private submitTillEvent(index: number, comment?: string,
                          reasonCodeListType?: string, varianceReason?: RenderSelectOptions,
                          varianceChecked?: boolean): void {
    const inputs: UiInput[] = [
      new UiInput(UiInputKey.CASH_DRAWER_KEY, this.props.cashDrawerKey, undefined, this.props.inputSource)
    ];
    const transferTender: IExpectedTender = this.getTransferAmount(index);
    const expectedTender = this.state.expectedAmounts?.length > 0 &&
        this.state.expectedAmounts[index]?.tenderId === transferTender?.tenderId ? this.state.expectedAmounts[index] :
        this.state.expectedAmounts?.find((tender: IExpectedTender) => {
          return tender?.tenderId === transferTender.tenderId;
        });
    const expectedAmount = expectedTender?.amount;
    const transferAmount: Money = transferTender?.amount && Money.fromIMoney(transferTender.amount);
    inputs.push(new UiInput(UiInputKey.TENDER_ID, this.state.currencyData[index].tenderId));
    inputs.push(new UiInput(UiInputKey.TILL_KEY, this.props.cashDrawerKey));
    const tillEventsToAdjustActualAmount: string[] =
        [TILL_IN_EVENT, TILL_OUT_EVENT, TILL_COUNT_EVENT, TILL_RECONCILIATION_EVENT, TILL_AUDIT_EVENT];
    if (!tillEventsToAdjustActualAmount.includes(this.props.eventType)) {
      inputs.push(new UiInput(UiInputKey.TILL_TRANSFER_AMOUNT, transferAmount));
    } else {
      inputs.push(new UiInput(UiInputKey.TILL_ACTUAL_AMOUNT, transferAmount));
      inputs.push(new UiInput(UiInputKey.TILL_ADJUST_TO_ACTUAL_AMOUNT,
          this.props.eventType === TILL_AUDIT_EVENT ? this.state.updateBalance : true));
      if (this.props.eventType === TILL_OUT_EVENT) {
        const isForeignTender: boolean = this.state.currencyData[index].isForeignTender;
        if (!!this.maintainFloatInTill && !isForeignTender) {
          const actualFloatAmount: Money = this.getFloatAmount(index);
          if (!!actualFloatAmount) {
            inputs.push(new UiInput(UiInputKey.TILL_FLOAT_AMOUNT, actualFloatAmount));
          }
        }
      }
    }
    if (expectedAmount || this.noExpectedAmountInTillAudit()) {
      if (expectedAmount) {
        inputs.push(new UiInput(UiInputKey.TILL_EXPECTED_AMOUNT, expectedAmount));
        inputs.push(new UiInput(UiInputKey.TILL_VARIANCE_AMOUNT, transferAmount.minus(Money.fromIMoney(expectedAmount)).toIMoney()));
      } else {
        inputs.push(new UiInput(UiInputKey.TILL_EXPECTED_AMOUNT, expectedAmount));
      }
      if (comment) {
        inputs.push(new UiInput(UiInputKey.TILL_VARIANCE_COMMENT, comment));
      }
      if (reasonCodeListType) {
        inputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE, reasonCodeListType));
        if (varianceReason) {
          inputs.push(new UiInput(UiInputKey.REASON_CODE, varianceReason.code));
          inputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION, varianceReason.description));
        }
      }
    } else {
      inputs.push(new UiInput(UiInputKey.TILL_EXPECTED_AMOUNT, expectedAmount));
    }

    if (this.props.sealBagKey) {
      inputs.push(new UiInput(UiInputKey.SEAL_BAG_KEY, this.props.sealBagKey));
    }

    if (varianceChecked) {
      inputs.push(new UiInput(UiInputKey.TILL_VARIANCE_CHECKED, true));
    }

    if (!this.eventDateTime) {
      this.eventDateTime = new Date();
    }

    inputs.push(new UiInput(UiInputKey.DATE_TIME, this.eventDateTime));

    this.props.performBusinessOperation(this.props.deviceIdentity, this.props.eventType, inputs);
  }

  private goToVarianceReasonScreen = (showReasons: boolean = true): void => {
    this.props.navigation.push("varianceReason", {
      eventType: this.props.eventType,
      reasons: showReasons ? this.reasons : undefined,
      onSave: (comment: string, varianceReason: RenderSelectOptions) => this.setState({
        varianceComment: comment,
        varianceReason: Object.assign({}, varianceReason)
      })
    });
  }

  private tillWithAcceptableVariance(index: number): void {
    this.submitTillEvent(index);
  }

  private tillWithVariance(index: number): void {
    this.submitTillEvent(index, this.state.varianceComment,
        this.reasonCodeListType, this.state.varianceReason, true);
  }

  private tillNoVariance(index: number): void {
    const transferTender: IExpectedTender = this.getTransferAmount(index);
    if (this.props.eventType === TILL_AUDIT_EVENT && this.state.expectedAmounts?.length > 0 &&
        this.state.expectedAmounts[index]?.amount && transferTender?.amount &&
        Money.fromIMoney(this.state.expectedAmounts[index].amount).ne(Money.fromIMoney(transferTender.amount))) {
      this.submitTillEvent(index, undefined, undefined, undefined, true);
    } else {
      this.submitTillEvent(index);
    }
  }

  private getTransferAmount(index: number): IExpectedTender {
    if (!!this.state.capturedData?.["transferAmounts" + index] || index === 0) {
      return {
        tenderId: this.state.currencyData[index].tenderId,
        amount: new Money(this.state.capturedData?.["transferAmounts" + index] || "0",
            this.state.currencyData[index].currencyCode)
      };
    } else {
      return undefined;
    }
  }

  private getFloatAmount(index: number): Money {
    if (!!this.state.capturedData?.["floatAmounts" + index]) {
      return new Money(this.state.capturedData?.["floatAmounts" + index] || "0",
          this.state.currencyData[index].currencyCode);
    } else {
      return undefined;
    }
  }

  private handleAlertAndFormDataChanges(prevState: State): void {
    const tillAmountWasRecorded: boolean = prevState.capturedData !== this.state.capturedData &&
                                             !!this.state.capturedData;

    const alertWasHidden: boolean = prevState.tillEventAlertShowing && !this.state.tillEventAlertShowing;

    const varianceDetailsChanged: boolean = prevState.varianceReason !== this.state.varianceReason;

    const closeDrawerAlertHiddenOnVarianceScreen: boolean = alertWasHidden &&
        (this.props.currentScreenName === "varianceReason" || this.ignoreVarianceScreen);

    const shouldCheckCashDrawerStatus: boolean =  this.shouldCheckCashDrawerStatus(tillAmountWasRecorded,
          alertWasHidden, varianceDetailsChanged, closeDrawerAlertHiddenOnVarianceScreen, prevState);

    const shouldShowVarianceScreen: boolean = this.shouldShowVarianceScreen(tillAmountWasRecorded);

    if (shouldShowVarianceScreen) {
      this.props.navigation.push("tillVariance", {
        eventType: this.props.eventType,
        noExpectedAmountInTillAudit: this.props.eventType === TILL_AUDIT_EVENT && this.noExpectedAmountInTillAudit(),
        varianceAmounts: this.getVarianceAmounts(),
        onTillAuditContinue: () => {
          if (this.captureCommentForCountVarianceAllowed) {
            this.goToVarianceReasonScreen(false);
          } else {
            this.setState({ skipVarianceScreen: true });
          }
        },
        onProceed: this.props.eventType === TILL_TO_SAFE_EVENT ?
            () => this.setState({ tillEventAlertShowing: false, skipVarianceScreen: true }) : this.goToVarianceReasonScreen,
        onUpdateBalance: () => this.setState({ updateBalance: true }, this.goToVarianceReasonScreen),
        onExit: () => {
          this.props.navigation.pop();
        }
      });
    } else if (shouldCheckCashDrawerStatus) {
      this.checkCashDrawerStatus();
    }
  }

  private shouldCheckCashDrawerStatus(tillAmountWasRecorded: boolean, alertWasHidden: boolean,
                                      varianceDetailsChanged: boolean, closeDrawerAlertHiddenOnVarianceScreen: boolean,
                                      prevState: State): boolean {
    const checkWhenNoVariance: boolean = !this.tillAmountHasVariance && (tillAmountWasRecorded || alertWasHidden);
    const checkWhenVariance: boolean = this.tillAmountHasVariance && (varianceDetailsChanged ||
        closeDrawerAlertHiddenOnVarianceScreen);
    const checkWhenAcceptableVariance: boolean = this.tillAmountHasVariance &&
        this.isVarianceAcceptable && (tillAmountWasRecorded || alertWasHidden);
    const checkWhenVoidStarted: boolean = !prevState.voidStarted && this.state.voidStarted ||
        (alertWasHidden && this.state.voidStarted);
    const ignoreVariance: boolean = this.ignoreVarianceScreen &&
        prevState.skipVarianceScreen !== this.state.skipVarianceScreen;
    return (checkWhenNoVariance || checkWhenVariance || checkWhenAcceptableVariance  ||
        checkWhenVoidStarted || ignoreVariance) && !this.tillEventWasSent;
  }

  private shouldShowVarianceScreen(tillAmountWasRecorded: boolean): boolean {
    return tillAmountWasRecorded && this.tillAmountHasVariance && !this.isVarianceAcceptable;
  }

  private noExpectedAmountInTillAudit(): boolean {
    return this.state.expectedAmounts.length < 1 && (this.props.eventType === TILL_AUDIT_EVENT);
  }

  private getLocalCurrencyIndexAndData(): { localCurrencyIndex: number; localCurrencyData: ICurrencyData } {
    let localCurrencyIndex: number;
    const localCurrencyData: ICurrencyData = this.state.currencyData.find((currency: ICurrencyData, index: number) => {
      localCurrencyIndex = index;
      return currency.tenderId === this.props.configManager.getTendersValues().defaultTenderId;
    });
    if (localCurrencyData && localCurrencyIndex >= 0) {
      return {localCurrencyIndex, localCurrencyData};
    } else {
      logger.info(
        "Local currency data could not be found.",
        {
          metaData: new Map<string, any>([
            ["defaultTenderId", this.props.configManager.getTendersValues().defaultTenderId],
            ["currencyData", this.state.currencyData]
          ])
        }
      );
      return { localCurrencyIndex: -1, localCurrencyData: undefined };
    }
  }

  private getVarianceAmounts(): Array<VarianceAmount> {
    if (this.blindCountAllowed) {
      return undefined;
    }

    const varianceAmounts: Array<VarianceAmount> = [];

    this.state.currencyData.forEach((currencyData: ICurrencyData, index: number) => {
      const transferAmount: IExpectedTender = this.getTransferAmount(index);
      const expectedAmount = this.getExpectedTender(index, currencyData);

      if (transferAmount?.amount && expectedAmount?.amount) {
        const transferAmountAsMoney: Money = Money.fromIMoney(transferAmount.amount);
        const expectedAmountAsMoney: Money = Money.fromIMoney(expectedAmount.amount);

        const hasAmounts: boolean = !!expectedAmountAsMoney && !!transferAmountAsMoney;
        const currenciesAreEqual: boolean = hasAmounts && expectedAmountAsMoney.currency === transferAmountAsMoney.currency;

        if (currenciesAreEqual && (!this.acceptableVariance ||
            currencyData.tenderId !== this.props.configManager.getTendersValues().defaultTenderId ||
            expectedAmountAsMoney.minus(transferAmountAsMoney).abs().gt(this.acceptableVariance))) {
          if (transferAmountAsMoney.ne(expectedAmountAsMoney)) {
            varianceAmounts.push({
              amount: transferAmountAsMoney.minus(expectedAmountAsMoney),
              tenderName: currencyData.tenderName,
              overUnder: transferAmountAsMoney.gt(expectedAmountAsMoney) ? "over" : "under"
            })
          }
        }
      }
    });

    return varianceAmounts;
  }

  private checkAndHandleCashDrawerClosed(prevProps: Props): void {
    const cashDrawerStatusEventFinished: boolean = this.cashDrawerStateIsWaiting(prevProps) &&
                                                   !this.cashDrawerStateIsWaiting(this.props);

    const shouldSubmitEvent: boolean =
        this.props.cashDrawerState === CashDrawerSessionState.Closed &&
        !this.tillEventWasSent &&
        (this.varianceCheckComplete || this.state.voidStarted);

    if(this.tillEventWasSent && this.state.voidStarted && !this.handleFloatAmountSupervisorOverride()){
      this.voidTransaction();
      this.setState({ voidStarted: false });
    }

    if (shouldSubmitEvent) {
      if (this.state.tillEventAlertShowing) {
        this.props.dismissAlertModal();
      }

      this.tillEventWasSent = true;

      if (this.state.voidStarted) {
        this.voidTransaction();
      } else {
        let exitVarianceScreen = false;
        this.state.currencyData.forEach((currencyItem: ICurrencyData, index: number) => {
          if (this.getTransferAmount(index)) {
            if (this.tillAmountHasVariance && this.isVarianceAcceptable) {
              this.tillWithAcceptableVariance(index);
            } else if (this.tillAmountHasVariance && !this.ignoreVarianceScreen) {
              exitVarianceScreen = true;
              this.tillWithVariance(index);
            } else {
              this.setState({ skipVarianceScreen: false }, () => this.tillNoVariance(index));
            }
          }
        });
        if (exitVarianceScreen) {
          this.props.navigation.dispatch(popTo("tillDetail")); // Need to pop out of variance reason screen.
        }
      }
    } else if (cashDrawerStatusEventFinished) {
      this.showConfirmDrawerClosedAlert();
    }
  }

  private cashDrawerStateIsWaiting(providedProps: Props): boolean {
    return providedProps.cashDrawerState === CashDrawerSessionState.WaitingForDrawerClosedResponse;
  }

  private showConfirmDrawerClosedAlert(): void {
    this.showAlert(
      I18n.t("closeDrawerTitle"),
      I18n.t(getConfirmDrawerClosed18nCode(this.props.eventType)),
      [{ text: I18n.t("ok"), onPress: this.getAlertOnPress() }]
    );
  }

  private showAlert(title: string, message: string, buttons: AlertModalButton[], defaultButtonIndex?: number): void {
    this.setState(
      { tillEventAlertShowing: true },
      () => this.props.alert(title, message, buttons, { cancelable: false, defaultButtonIndex })
    );
  }

  private getAlertOnPress = (tillInEventMethod?: () => void): () => void => {
    return (): void => {
      this.setState({ tillEventAlertShowing: false });

      if (tillInEventMethod) {
        tillInEventMethod();
      }
    };
  }

  private checkCashDrawerStatus = (): void => {
    if (this.props.cashDrawerState !== CashDrawerSessionState.Closed) {
      this.props.performBusinessOperation(this.props.deviceIdentity, CONFIRM_CASH_DRAWER_CLOSED_EVENT, [
        new UiInput(UiInputKey.CASH_DRAWER_KEY, this.props.cashDrawerKey)
      ]);
    } else {
      this.handleProgressEvent();
    }
  }

  private get ignoreVarianceScreen(): boolean {
    return (this.state.skipVarianceScreen &&
        ((this.props.eventType === TILL_AUDIT_EVENT && !this.captureCommentForCountVarianceAllowed) ||
            this.props.eventType === TILL_TO_SAFE_EVENT));
  }

  private getExpectedTender(index: number, currencyItem: ICurrencyData): IExpectedTender {
    const initialExpected: IExpectedTender = this.state.expectedAmounts?.[index];
    return initialExpected && initialExpected.amount?.currency === currencyItem?.currencyCode ? initialExpected :
        this.state.expectedAmounts.find((amount: IExpectedTender) => amount?.tenderId === currencyItem?.tenderId);
  }

  private getExpectedFloatTender(index: number, currencyItem: ICurrencyData): IExpectedTender {
    const initialExpected: IExpectedTender = this.state.expectedFloatAmounts?.[index];
    return initialExpected && initialExpected.amount?.currency === currencyItem?.currencyCode ? initialExpected :
        this.state.expectedAmounts.find((amount: IExpectedTender) => amount?.tenderId === currencyItem?.tenderId);
  }

  //TODO: whether there is a variance is a business rule that should be applied by the domain layer. DSS-12443
  private get tillAmountHasVariance(): boolean {
    let result: boolean = false;
    if (this.props.eventType === TILL_TO_SAFE_EVENT) {
      this.state.currencyData.forEach((currencyItem: ICurrencyData, index: number) => {
        const expectedTender: IExpectedTender = this.getExpectedTender(index, currencyItem);
        const expectedAmount: Money = expectedTender?.amount && Money.fromIMoney(expectedTender.amount);
        const transferTender: IExpectedTender = this.getTransferAmount(index);
        const transferAmount: Money = transferTender?.amount && Money.fromIMoney(transferTender.amount);

        if (expectedAmount && transferAmount?.gt(expectedAmount)) {
          result = true;
        }
      })
    } else if (this.noExpectedAmountInTillAudit()) {
      this.state.currencyData.forEach((currencyItem: ICurrencyData, index: number) => {
        if (this.getTransferAmount(index)) {
          result = true;
        }
      });
    } else {
      this.state.currencyData.forEach((currencyItem: ICurrencyData, index: number) => {
        const expectedTender: IExpectedTender = this.getExpectedTender(index, currencyItem);
        const expectedAmount: Money = expectedTender?.amount && Money.fromIMoney(expectedTender.amount);
        const transferTender: IExpectedTender = this.getTransferAmount(index);
        const transferAmount: Money = transferTender?.amount && Money.fromIMoney(transferTender.amount);

        if (expectedAmount && transferAmount?.ne(expectedAmount)) {
          result = true;
        }
      })
    }
    return result;
  }

  //TODO: whether there is an acceptable variance is a business rule that should be applied by the domain layer. DSS-12443
  private get isVarianceAcceptable(): boolean {
    const isValidTillEvent: boolean = this.props.eventType === TILL_IN_EVENT ||
        this.props.eventType === TILL_OUT_EVENT || this.props.eventType === TILL_AUDIT_EVENT ||
        this.props.eventType === TILL_COUNT_EVENT || this.props.eventType === TILL_RECONCILIATION_EVENT;
    if (isValidTillEvent) {
      if (this.noExpectedAmountInTillAudit()) {
        return false;
      }

      const { localCurrencyIndex, localCurrencyData } = this.getLocalCurrencyIndexAndData();

      const transferTender: IExpectedTender = this.getTransferAmount(localCurrencyIndex);
      const transferAmount: Money = transferTender?.amount && Money.fromIMoney(transferTender.amount);
      const expectedTender: IExpectedTender = this.getExpectedTender(localCurrencyIndex, localCurrencyData);
      const expectedAmount: Money = expectedTender?.amount && Money.fromIMoney(expectedTender.amount);

      if (expectedAmount && transferAmount && expectedAmount.currency === transferAmount.currency) {
        const isNotAcceptable: boolean = this.acceptableVariance && expectedAmount.minus(transferAmount).abs().gt(this.acceptableVariance);
        if (isNotAcceptable || (!this.acceptableVariance && expectedAmount.minus(transferAmount).isNotZero())) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  }

  private get varianceCheckComplete(): boolean {
    return !!this.state.capturedData && (this.ignoreVarianceScreen || !this.tillAmountHasVariance ||
        !!this.state.varianceReason || !!this.isVarianceAcceptable);
  }

  private handleBusinessEventFinishedProcessing(prevProps: Props): void {
    const prevInProgress: boolean = prevProps.businessState.inProgress;

    const { inProgress } = this.props.businessState;

    if (prevInProgress && !inProgress) {
      this.handleProgressEvent();
    }
  }

  private handleProgressEvent(): void {
    const { eventType } = this.props.businessState;

    if (eventType === this.props.eventType && this.handleFloatAmountSupervisorOverride()) {
      this.setState({ needToPrint: true });
    } else if (eventType === VOID_TILL_CONTROL_TRANSACTION_EVENT ||
          eventType === VOID_TENDER_CONTROL_TRANSACTION_EVENT) {
      this.props.navigation.pop();
    } else if (eventType === SYNC_STATE_EVENT) {
      const tillDisplayLine: ITillDisplayLine = last(this.props.businessState?.displayInfo?.tillDisplayLines);
      if (tillDisplayLine?.hasDetails && this.handleFloatAmountSupervisorOverride()) {
        this.setState({ needToPrint: true });
      }
    }
  }

  private handleFloatAmountSupervisorOverride (): boolean {
    const error: QualificationError = this.props.businessState.error as QualificationError;
    if (this.maintainFloatInTill && this.allowFloatAmountManualUpdate){
      if (error && error.requiredInputs && error.requiredInputs.find((item) => item === UiInputKey.SUPERVISOR_OVERRIDE)){
        return false;
      }
    }
    return true;
  }

  private receiptOptionFormOnClose = (): void => {
    if (!Theme.isTablet) {
      this.props.navigation.dispatch(popTo("tillDetail"));
      this.setState({ needToPrint: false });
    }
  }

  private startVoidTransactionProcess = (): void => {
    if (!this.state.needToPrint) {
      this.props.alert(
        I18n.t(getVoidTitle18nCode(this.props.eventType)),
        I18n.t(getVoidMessage18nCode(this.props.eventType)),
        [
          { text: I18n.t("okCaps"), onPress: () => this.setState({ voidStarted: true }) },
          { text: I18n.t("cancel"), style: "cancel" }
        ],
        { defaultButtonIndex: 0, cancellable: true }
      );
    }
  }

  private voidTransaction(): void {
    this.props.performBusinessOperation(this.props.deviceIdentity,
        this.isSafeToTillOrTillToSafe() ?
        VOID_TENDER_CONTROL_TRANSACTION_EVENT : VOID_TILL_CONTROL_TRANSACTION_EVENT, []);
  }

  private getExpectedFloatAmount(configManager: IConfigurationManager): IAuthCategoryNoneCash {
    const tenderDef: ITenderAuthCategory[] = configManager.getTendersValues() &&
        configManager.getTendersValues().tenderDefinitions;
    const tenderWithFloatAmount: IAuthCategoryNoneCash =
        tenderDef.find((tender: any) => tender.expectedFloatAmount !== undefined);
    return tenderWithFloatAmount;
  }

  private isTillIn(props: Props): boolean {
    return (props.eventType === TILL_IN_EVENT);
  }

  private isSafeToTillOrTillToSafe(): boolean {
    return this.props.eventType === SAFE_TO_TILL_EVENT || this.props.eventType === TILL_TO_SAFE_EVENT;
  }

  private getExpectedAmounts(props: Props, currencyData: ICurrencyData[]): IExpectedTender[] {
    const tenderConfigs: IAuthCategoryNoneCash = this.getExpectedFloatAmount(props.configManager);
    const expectedTenders: IExpectedTender[] = props.businessState?.stateValues?.get("CashDrawerSession.expectedAmounts");
    let expectedAmounts: IExpectedTender[];

    switch (props.eventType) {
      case TILL_IN_EVENT:
        expectedAmounts = [(tenderConfigs && this.formattedAmount(tenderConfigs.expectedFloatAmount, tenderConfigs.tenderId))] || [];
        break;
      case TILL_OUT_EVENT:
      case TILL_TO_BANK_EVENT:
      case TILL_RECONCILIATION_EVENT:
      case TILL_AUDIT_EVENT:
      case TILL_COUNT_EVENT:
        const accountabilityMode: AccountabilityMode = props.businessState.stateValues &&
            props.businessState.stateValues.get("TerminalSession.accountabilityMode");

        if (accountabilityMode === AccountabilityMode.Terminal) {
          const tenderBalanceAmounts: IExpectedTender[] = [];
          const tenderBalances = props.businessState.stateValues &&
              props.businessState.stateValues.get("TillSession.tenderBalances");
          if (currencyData?.length && tenderBalances?.length) {
            currencyData.forEach(currencyItem => {
              tenderBalanceAmounts.push(tenderBalances.find((tender: any) => tender.tenderId === currencyItem.tenderId));
            });
          }
          expectedAmounts = tenderBalanceAmounts;
        } else {
          const matchingAmounts: IExpectedTender[] = [];
          if (currencyData?.length && expectedTenders?.length) {
            currencyData.forEach(currencyItem => {
              matchingAmounts.push(expectedTenders.find((tender: IExpectedTender) => tender.tenderId === currencyItem.tenderId));
            });
          }

          expectedAmounts = matchingAmounts;
        }
        break;
      case TILL_TO_SAFE_EVENT:
        expectedAmounts = [];
        expectedTenders?.forEach((expectedTender: IExpectedTender) => {
          const tenderAsMoney: Money = expectedTender?.amount && Money.fromIMoney(expectedTender.amount);
          if (tenderAsMoney && !tenderAsMoney.isZero()) {
            expectedAmounts.push(expectedTender);
          }
        });
        break;
      default:
        expectedAmounts = [];
        break;
    }

    return expectedAmounts;
  }

  private getExpectedFloatAmounts(props: Props): IExpectedTender[] {
    let expectedAmounts: IExpectedTender[];
    if(props.eventType === TILL_OUT_EVENT) {
      const tenderConfigs: IAuthCategoryNoneCash = this.getExpectedFloatAmount(props.configManager);
      expectedAmounts = [(tenderConfigs && this.formattedAmount(tenderConfigs.expectedFloatAmount, tenderConfigs.tenderId))] || [];
    }
    return expectedAmounts;
  }

  private moveToNextScreen(): void {
    if (this.isSafeToTillOrTillToSafe() || this.props.eventType === TILL_AUDIT_EVENT) {
      this.moveToBasket();
      return;
    }

    const behaviorsConfig = this.props.configManager.getFunctionalBehaviorValues().storeOperationsBehaviors;
    const moveToTillToBankAfterTillReconciliationConfig =
          behaviorsConfig && behaviorsConfig.moveToTillToBankAfterTillReconciliation;

    const getTransferAmounts = () => {
      const transferAmounts: IExpectedTender[] = [];
      this.state.currencyData.forEach((currencyData: ICurrencyData, index: number) => {
        const transferAmount = this.getTransferAmount(index);
        if (transferAmount) {
          transferAmounts.push(transferAmount);
        }
      });
      return transferAmounts;
    }

    if (moveToTillToBankAfterTillReconciliationConfig && this.props.eventType === TILL_RECONCILIATION_EVENT) {
      this.props.navigation.replace("scanDrawer", {
        eventType: TILL_TO_BANK_EVENT,
        previousCashDrawerKey: this.props.cashDrawerKey,
        continueWithPreviousDrawer: true,
        expectedAmount: getTransferAmounts(),
        previousAlternateKey: this.props.alternateKey,
        inputSource: this.props.inputSource
      });
      return;
    }

    this.props.navigation.replace("tillSuccess", {
      eventType: this.props.eventType,
      startup: this.props.startup,
      actualAmount: getTransferAmounts(),
      cashDrawerKey: this.props.cashDrawerKey,
      inputSource: this.props.inputSource,
      alternateKey: this.props.alternateKey
    });
  }
}

const form = reduxForm<TillTransferAmountForm, Props>({
  form: "tillTransferAmount",
  validate: (values: TillTransferAmountForm, props: Props) => {
    let errors: FormErrors<TillTransferAmountForm> = {};

    Object.keys(values).every((key: string) => {
      if (key !== "sealBagKey") {
        const value = values[key];
        const isTillToSafe: boolean = props.eventType === TILL_TO_SAFE_EVENT;
        const isSafeToTill: boolean = props.eventType === SAFE_TO_TILL_EVENT;

        if ((!value || Number.parseFloat(value) === 0) && (isTillToSafe || isSafeToTill)) {
          errors[key] = I18n.t("required", {field: I18n.t("amount")});
          return true;
        }
        errors = {};
        return false;
      }
      return true;
    });

    if (values.sealBagKey === undefined && props.eventType === TILL_TO_BANK_EVENT) {
      errors.sealBagKey = I18n.t("required", {field: I18n.t("sealBagKey")});
    }
    return errors;
  },
  initialValues: {
    sealBagKey: undefined
  }
})(TillDetailScreen);

function getCurrencyData(props: Props): ICurrencyData[] {
  let currencyData = getCashTenderData(props.configManager, props.retailLocationCurrency);

  //Restricts form to single field if it's not on the list
  if (!isMultiCurrency(props.eventType)) {
    //TODO: for Till In MVP, we are using the defaultTenderId (for now),
    // Assuming that would be set as cash - default tender for the store
    const defaultId = props.configManager.getTendersValues().defaultTenderId;
    currencyData = currencyData.filter((currencyItem) => {
      return currencyItem.tenderId === defaultId;
    })
  }

  return currencyData;
}

const mapStateToProps = (state: AppState): StateProps => {
  const selector = formValueSelector("tillTransferAmount");

  return {
    state,
    businessState: state.businessState,
    cashDrawerState: state.businessState?.stateValues?.get("CashDrawerSession.state"),
    configManager: state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity,
    retailLocationCurrency: state.settings.retailLocationCurrency,
    sealBagKey: selector(state, "sealBagKey"),
    currentScreenName: getCurrentRouteNameWithNavigationRef()
  };
};

const mapDispatchToProps: DispatchProps = {
  alert: alert.request,
  dismissAlertModal: dismissAlertModal.request,
  performBusinessOperation: businessOperation.request,
  displayToastAction: displayToast.request
};

export default connect(mapStateToProps, mapDispatchToProps)(withMappedNavigationParams<typeof form>()(form));
