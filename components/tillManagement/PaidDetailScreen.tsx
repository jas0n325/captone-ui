import { last } from "lodash";
import * as React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Orientation from "react-native-orientation-locker";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { Field, FormErrors, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  DeviceIdentity,
  IConfigurationManager,
  UiInput,
  UIINPUT_SOURCE_BARCODE,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import {
  CashDrawerSessionState,
  CONFIRM_CASH_DRAWER_CLOSED_EVENT,
  getFeatureAccessConfig,
  IReasonCodeList,
  ITillDisplayLine,
  PAID_IN_EVENT,
  PAID_OUT_EVENT,
  PAID_SIGNATURE_EVENT,
  ReceiptCategory,
  SYNC_STATE_EVENT,
  UiInputKey,
  UsageType,
  VOID_TENDER_CONTROL_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { IAttachment, ITenderControlTransaction } from "@aptos-scp/scp-types-commerce-transaction";

import {
  getTitle18nCode,
  getVoidMessage18nCode,
  getVoidTitle18nCode
} from "../common/utilities/tillManagementUtilities";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  businessOperation,
  clearPaidOutTransactionsResult,
  dataEvent,
  DataEventType,
  dismissAlertModal,
  displayToast,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  DataEventState,
  TransactionsState,
  UiState,
  UI_MODE_PAID_OPERATION
} from "../../reducers";
import Theme from "../../styles";
import {AlertModalButton} from "../common/AlertModal";
import BaseView from "../common/BaseView";
import {
  compareRenderSelectOptions,
  CurrencyInput,
  renderReasonSelect,
  RenderSelectOptions,
  renderTextInputField
} from "../common/FieldValidation";
import Header from "../common/Header";
import Spinner from "../common/Spinner";
import { popTo } from "../common/utilities/navigationUtils";
import ReceiptOptionForm from "../receipt/ReceiptOptionForm";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { PaidDetailScreenProps } from "./interfaces";
import LinkToTransaction from "./LinkToTransaction";
import PaidAddReceipt, { ImageData } from "./PaidAddReceipt";
import PaidSignatureCapture from "./PaidSignatureCapture";
import { tillDetailStyles, tillVarianceReasonStyles } from "./styles";
import VectorIcon from "../common/VectorIcon";

interface PaidTransferAmountForm {
  transferAmount: string;
  reasonCode: RenderSelectOptions;
  comment: string;
}

interface StateProps {
  businessState: BusinessState;
  cashDrawerState: CashDrawerSessionState;
  configManager: IConfigurationManager;
  retailLocationCurrency: string;
  deviceIdentity: DeviceIdentity;
  transactionsState: TransactionsState;
  uiState: UiState;
  incomingDataEvent: DataEventState;
}

interface DispatchProps {
  alert: AlertRequest;
  dismissAlertModal: ActionCreator;
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  dataEventRequest: ActionCreator;
  clearSearchResult: ActionCreator;
  displayToastAction: ActionCreator;
}

interface Props extends PaidDetailScreenProps, StateProps, DispatchProps, NavigationScreenProps<"paidDetail"> {}

interface State {
  capturedData: PaidTransferAmountForm;
  successMessage: string;
  needToPrint: boolean;
  paidEventAlertShowing: boolean;
  showSignatureScreen: boolean;
  returnFromSignature: boolean;
  voidStarted: boolean;
  linkToPaidOut: boolean;
  transactionReference?: ITenderControlTransaction;
  dataEventType?: DataEventType;
  addReceiptLink: boolean;
  addReceiptDescription: string;
  paidOutMaxAmount: Money;
  exceedsPaidOutMaxAmountError: boolean;
}

class PaidDetailScreen extends React.Component<Props & InjectedFormProps<PaidTransferAmountForm, Props> &
    FormInstance<PaidTransferAmountForm, undefined>, State> {
  private transferAmountInputRef: any;
  private styles: any;
  private reasonStyle: any;
  private reasonCodeListType: string;
  private reasons: RenderSelectOptions[];
  private paidEventWasSent: boolean = false;
  private checkedCashDrawerStatus: boolean = false;
  private displayLinkToPaidOut: boolean;
  private displayAddReceipt: boolean;
  private signatureRequired: boolean;
  private paidReceiptAttachements: IAttachment[];
  private userComments: string;
  private imageData: ImageData[] = [];
  private maximumAttachments: number;

  public constructor(props: Props & InjectedFormProps<PaidTransferAmountForm, Props> &
      FormInstance<PaidTransferAmountForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(tillDetailStyles());
    this.reasonStyle = Theme.getStyles(tillVarianceReasonStyles());

    const featureConfig = getFeatureAccessConfig(props.configManager, props.eventType);
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
    this.signatureRequired = !!featureConfig.signatureRequired ?
        featureConfig.signatureRequired : featureConfig.signatureRequired === undefined ;
    this.displayLinkToPaidOut = props.eventType === PAID_IN_EVENT &&
        !!featureConfig.linkToPaidOut && featureConfig.linkToPaidOut !== UsageType.NotUsed;
    this.displayAddReceipt = !!featureConfig.addReceipt && featureConfig.addReceipt !== UsageType.NotUsed;
    const paidOutMaxAmount = props.eventType === PAID_OUT_EVENT && featureConfig && featureConfig.maximumAmount;
    this.maximumAttachments = featureConfig && featureConfig.maximumAttachments ? featureConfig.maximumAttachments: 3;

    this.state = {
      capturedData: undefined,
      successMessage: undefined,
      needToPrint: false,
      paidEventAlertShowing: false,
      showSignatureScreen: false,
      returnFromSignature: false,
      voidStarted: false,
      linkToPaidOut: false,
      transactionReference: undefined,
      dataEventType: undefined,
      addReceiptLink: false,
      addReceiptDescription: undefined,
      paidOutMaxAmount: paidOutMaxAmount && new Money(paidOutMaxAmount, this.props.retailLocationCurrency),
      exceedsPaidOutMaxAmountError: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_PAID_OPERATION);
    this.transferAmountInputRef.focus();
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    const { inProgress, stateValues } = this.props.businessState;
    const transactionClosed: boolean = prevProps.businessState.inProgress && !inProgress &&
        !!stateValues.get("transaction.closed");

    /**
     * Phone uses separate screen for printer selection, must wait for that screen to pop away before moving to success,
     * Use state.needToPrint on phone only to distinguish that.
     */
    const moveToBasket: boolean = !this.state.voidStarted && (Theme.isTablet && transactionClosed) ||
        (!Theme.isTablet &&
            (prevState.needToPrint !== this.state.needToPrint && !this.state.needToPrint));

    if (moveToBasket) {
      this.moveToBasket();
    }

    const alertWasHidden: boolean = prevState.paidEventAlertShowing && !this.state.paidEventAlertShowing;

    const checkWhenVoidStarted: boolean = !prevState.voidStarted && this.state.voidStarted ||
        (alertWasHidden && this.state.voidStarted);

    if (!this.checkedCashDrawerStatus && !this.paidEventWasSent &&
      (!!this.state.capturedData || checkWhenVoidStarted)) {
      this.checkCashDrawerStatus();
    }

    this.checkAndHandleCashDrawerClosed(prevProps);

    this.handleBusinessEventFinishedProcessing(prevProps);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        { this.renderHeader() }
        {
          !this.state.addReceiptLink &&
          <View style={this.styles.root}>
            {
              !this.state.needToPrint && !this.state.showSignatureScreen && !this.state.linkToPaidOut &&
              !this.state.addReceiptLink &&
              <View>
                <View style={this.styles.inputPanel}>
                  <CurrencyInput
                    name="transferAmount"
                    onRef={(ref: any) => this.transferAmountInputRef = ref}
                    blurOnSubmit={false}
                    placeholder={I18n.t("amount")}
                    currency={this.props.retailLocationCurrency}
                    style={this.styles.textInput}
                    errorStyle={this.styles.textInputError}
                  />
                </View>
                {
                  this.state.exceedsPaidOutMaxAmountError &&
                  <View>
                    <Text style={this.styles.inputErrorText}>
                      {I18n.t("amountLimit")}
                    </Text>
                  </View>
                }
                {
                  this.reasons &&
                  <Field
                    name={"reasonCode"}
                    component={renderReasonSelect}
                    errorStyle={this.reasonStyle.errorText}
                    placeholder={I18n.t("reasonCode")}
                    reasons={this.reasons}
                    style={this.reasonStyle.reasonCodeInput}
                  />
                }
                <View style={this.reasonStyle.commentHeader}>
                  <Field
                    name={`comment`}
                    component={renderTextInputField}
                    placeholder={I18n.t("comments")}
                    style={this.reasonStyle.field}
                    inputStyle={this.reasonStyle.inputField}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
                {
                  (this.displayLinkToPaidOut || this.displayAddReceipt) &&
                  <View>
                    <View style={this.styles.additionalDetailsHeader}>
                      <Text style={this.styles.additionalDetailsHeaderText}>
                        {I18n.t("additionalDetails")}
                      </Text>
                    </View>
                    <ScrollView>
                      {
                        this.displayAddReceipt &&
                        this.renderAdditionalDetailsButton(() => {
                          if (!this.state.addReceiptLink) {
                            this.setState({ addReceiptLink: true });
                          }
                        }, "addReceipt", this.imageData.length > 0 && this.imageCount())
                      }
                      {
                        this.displayLinkToPaidOut &&
                        this.renderAdditionalDetailsButton(() => {
                          if (!this.state.linkToPaidOut) {
                            this.props.clearSearchResult();
                            this.setState({ linkToPaidOut: true });
                          }
                        }, "linkToPaidOut",
                            this.state.transactionReference &&
                            `${this.state.transactionReference.transactionNumber}`,
                            () => {
                              if (this.state.transactionReference) {
                                this.setState({transactionReference: undefined});
                              }
                            }
                        )
                      }
                    </ScrollView>
                  </View>
                }
              </View>
            }
            {
              this.state.needToPrint &&
              <ReceiptOptionForm
                styles={this.styles.root}
                eventTypeForReceipt={this.props.eventType}
                providedReceiptCategory={ReceiptCategory.PaidOperation}
                onClose={this.receiptOptionFormOnClose}
                navigation={this.props.navigation}
              />
            }
            {
              this.state.linkToPaidOut &&
              <LinkToTransaction
                updateUiMode={this.props.updateUiMode}
                uiState={this.props.uiState}
                onTransactionChosen={this.onTransactionChosen.bind(this)}
                transactionsState={this.props.transactionsState}
                dataEventType={this.props.incomingDataEvent.eventType}
              />
            }
            {
              this.state.showSignatureScreen &&
              <PaidSignatureCapture onSignatureReceived={this.onSignatureReceived.bind(this)}/>
            }
          </View>
        }
        {
          this.state.returnFromSignature && !Theme.isTablet &&
          <Spinner size={0} containerStyle={this.styles.spinnerContainer}/>
        }
        {
          this.state.addReceiptLink &&
          <PaidAddReceipt
            handleAddReceipt={this.handleAddReceipt.bind(this)}
            handleCancelLinkAddReceipt={this.handleCancelLinkAddReceipt.bind(this)}
            imageData={this.imageData}
            userComments={this.userComments}
            maximumAttachments={this.maximumAttachments}
          />
        }
      </BaseView>
    );
  }

  private imageCount(): string {
    return `${this.imageData.length} ${this.imageData.length > 1 ? "images" : "image" }`;
  }

  private handleCancelLinkToPaidOut(): void {
    if (this.state.linkToPaidOut) {
      this.setState({ linkToPaidOut: false });
    }
  }

  private handleCancelLinkAddReceipt(): void {
    if (this.state.addReceiptLink) {
      this.setState({ addReceiptLink: false });
    }
  }

  private moveToBasket(): void {
    const isPaidIn = this.props.eventType === PAID_IN_EVENT;
    this.props.displayToastAction(I18n.t( isPaidIn ? "paidInSuccess" : "paidOutSuccess"));
    this.props.navigation.dispatch(popTo("main"));
  }
  private renderHeader = (): JSX.Element => {
    const { handleSubmit } = this.props;
    if (this.state.showSignatureScreen) {
      return (
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("printReceipts.signature")}
          renderInSingleLine={true}
        />
      );
    } else if (this.state.linkToPaidOut) {
      return (
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("linkToPaidOut")}
          renderInSingleLine={false}
          backButton={{
            name: "Back",
            action: this.handleCancelLinkToPaidOut.bind(this)
          }}
        />
      );
    } else if (!this.state.addReceiptLink) {
      return (
        <Header
          isVisibleTablet={Theme.isTablet}
          title= {(Theme.isTablet && this.state.needToPrint ) ? I18n.t("receipt") :
              I18n.t(getTitle18nCode(this.props.eventType))}
          backButton={!this.state.needToPrint && {
            name: "Back",
            title: Theme.isTablet ? I18n.t("tillManagement") : undefined,
            action: this.startVoidTransactionProcess
          }}
          rightButton={!this.state.needToPrint && {
            title: I18n.t("proceed"),
            action: handleSubmit((data: PaidTransferAmountForm) => this.onSaveData(data))
          }}
        />
      );
    }
  }

  private renderAdditionalDetailsButton = (
    buttonAction: () => void,
    buttonTextTranslationCode: string,
    additionalInfo?: string,
    handleVoidAction?: () => void
  ): JSX.Element => {
    return (
      <View>
        <TouchableOpacity style={this.styles.additionalDetailsButton} onPress={buttonAction} >
          <View style={this.styles.additionalDetailsButtonContents}>
            <View>
              <Text style={additionalInfo ?
                  this.styles.additionalDetailsButtonSubText : this.styles.additionalDetailsButtonText}>
                {I18n.t(buttonTextTranslationCode)}
              </Text>
              { additionalInfo && <Text style={this.styles.additionalDetailsButtonText}>{additionalInfo}</Text> }
            </View>
            <View style={this.styles.additionalDetailsButtonIconArea}>
              {
                additionalInfo && handleVoidAction &&
                <View style={this.styles.voidIconArea}>
                  <TouchableOpacity style={this.styles.voidIcon} onPress={handleVoidAction} >
                    <VectorIcon
                      name="Clear"
                      height={this.styles.icon.fontSize}
                      width={this.styles.icon.fontSize}
                      fill={this.styles.icon.color}
                      stroke={this.styles.icon.color}
                    />
                  </TouchableOpacity>
                </View>
              }
              <Text style={this.styles.additionalDetailsButtonText}>{">"}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  private handleProgressEvent(): void {
    const { eventType } = this.props.businessState;
    if (eventType === VOID_TENDER_CONTROL_TRANSACTION_EVENT) {
      this.props.navigation.pop();
    } else if (!this.signatureRequired) {
      this.handlePrintProgress(true);
    } else {
      if (eventType === SYNC_STATE_EVENT) {
        const tillDisplayLine: ITillDisplayLine = last(this.props.businessState?.displayInfo?.tillDisplayLines);
        if (!!tillDisplayLine?.hasSignature) {
          this.handlePrintProgress();
        } else {
          this.handleSignature();
        }
      } else {
        this.handleSignature();
      }
    }
  }

  private handleSignature(): void {
    if (!this.state.returnFromSignature && !this.state.voidStarted) {
      if (!this.state.showSignatureScreen) {
        this.setState({showSignatureScreen: true});
      }
      if (!Theme.isTablet) {
        const rotationHandler = () => {
          Orientation.getOrientation((orientation: string) => {
            if (orientation === "PORTRAIT") {
              Orientation.lockToLandscapeRight();
            }
          });
        };
        setTimeout(rotationHandler, 150);
      }
    }
  }

  private onSignatureReceived(encoded: string, encodedDataPoints: string): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("signature", encoded));
    uiInputs.push(new UiInput("signaturePoints", encodedDataPoints));
    uiInputs.push(new UiInput("eventType", this.props.eventType));
    this.props.performBusinessOperation(this.props.deviceIdentity, PAID_SIGNATURE_EVENT, uiInputs);

    this.handlePrintProgress(true);
  }

  private handleAddReceipt(paidReceiptAttachements: IAttachment[], userComments: string, imageData: ImageData[]): void {
    if (this.state.addReceiptLink) {
      this.paidReceiptAttachements = paidReceiptAttachements;
      this.userComments = userComments;
      this.imageData = imageData;
      this.setState({ addReceiptLink: false});
    }
  }

  private onTransactionChosen(transactionReference: ITenderControlTransaction,
                              dataEventType: DataEventType = DataEventType.KeyedData): void {
    this.setState({transactionReference, dataEventType, linkToPaidOut: false});
  }

  private handlePrintProgress = (ignoreSignature: boolean = false): void  => {
    if (this.signatureRequired) {
      if (!Theme.isTablet) {
        const rotationHandler = () => {
          Orientation.lockToPortrait();
        };
        setTimeout(rotationHandler, 150);
      }
    }
    const { eventType } = this.props.businessState;
    if (eventType === this.props.eventType) {
      this.setState({ needToPrint: true, showSignatureScreen: false, returnFromSignature: true });
    } else if (eventType === SYNC_STATE_EVENT) {
      const tillDisplayLine: ITillDisplayLine = last(this.props.businessState?.displayInfo?.tillDisplayLines);
      if (!!tillDisplayLine?.hasSignature || ignoreSignature) {
        this.setState({ needToPrint: true, showSignatureScreen: false, returnFromSignature: true });
      }
    } else {
      this.setState({showSignatureScreen: false, returnFromSignature: true });
    }
  }

  private receiptOptionFormOnClose = (): void => {
    if (!Theme.isTablet) {
      this.props.navigation.dispatch(popTo("paidDetail"));
      this.setState({ needToPrint: false });
    }
  }

  private checkAndHandleCashDrawerClosed(prevProps: Props): void {
    const cashDrawerStatusEventFinished: boolean = this.checkedCashDrawerStatus &&
        this.cashDrawerStateIsWaiting(prevProps) && !this.cashDrawerStateIsWaiting(this.props);

    const shouldSubmitEvent: boolean = prevProps.cashDrawerState !== CashDrawerSessionState.Closed &&
        this.props.cashDrawerState === CashDrawerSessionState.Closed && !this.paidEventWasSent &&
        (!!this.state.capturedData || this.state.voidStarted);

    if (shouldSubmitEvent) {
      if (this.state.paidEventAlertShowing) {
        this.props.dismissAlertModal();
      }
      this.paidEventWasSent = true;

      if (this.state.voidStarted) {
        this.voidTransaction();
      } else {
        this.submitPaidEvent(this.state.capturedData);
      }
    } else if (cashDrawerStatusEventFinished && this.props.cashDrawerState !== CashDrawerSessionState.Closed) {
      this.showConfirmDrawerClosedAlert();
    }
  }

  private cashDrawerStateIsWaiting(providedProps: Props): boolean {
    return providedProps.cashDrawerState === CashDrawerSessionState.WaitingForDrawerClosedResponse;
  }

  private showConfirmDrawerClosedAlert(): void {
    this.showAlert(
        I18n.t("closeDrawerTitle"),
        I18n.t(this.props.eventType === PAID_IN_EVENT ? "closeDrawerMessage" : "closeDrawerMessage"),
        [{ text: I18n.t("ok"), onPress: this.getAlertOnPress() }]
    );
  }

  private onSaveData(data: PaidTransferAmountForm): void {
    if(data && data.transferAmount && (!this.reasons || !!data.reasonCode)) {
      if (this.state.paidOutMaxAmount && new Money(data.transferAmount,
          this.props.retailLocationCurrency).gt(this.state.paidOutMaxAmount)) {
        this.setState({ exceedsPaidOutMaxAmountError: true });
        return;
      }
      this.setState({ capturedData: Object.assign({}, data) });
      this.paidEventWasSent = false;
    }
  }

  private showAlert(title: string, message: string, buttons: AlertModalButton[], defaultButtonIndex?: number): void {
    this.setState(
        { paidEventAlertShowing: true },
        () => this.props.alert(title, message, buttons, { cancelable: false, defaultButtonIndex })
    );
  }

  private getAlertOnPress = (paidEventMethod?: () => void): () => void => {
    return (): void => {
      this.checkedCashDrawerStatus = false;
      this.setState({ paidEventAlertShowing: false });

      if (paidEventMethod) {
        paidEventMethod();
      }
    };
  }

  private checkCashDrawerStatus = (): void => {
    if (this.props.cashDrawerState !== CashDrawerSessionState.Closed) {
      this.checkedCashDrawerStatus = true;
      this.props.performBusinessOperation(this.props.deviceIdentity, CONFIRM_CASH_DRAWER_CLOSED_EVENT, [
        new UiInput(UiInputKey.CASH_DRAWER_KEY, this.props.cashDrawerKey)
      ]);
    } else {
      this.handleProgressEvent();
    }
  }

  private handleBusinessEventFinishedProcessing(prevProps: Props): void {
    const prevInProgress: boolean = prevProps.businessState.inProgress;

    const { inProgress } = this.props.businessState;

    if (prevInProgress && !inProgress && prevProps.cashDrawerState === CashDrawerSessionState.Closed) {
      this.handleProgressEvent();
    }
  }

  private submitPaidEvent(data: PaidTransferAmountForm): void {
    const paidAmount = new Money(data.transferAmount, this.props.retailLocationCurrency);
    const inputs: UiInput[] = [
      new UiInput(UiInputKey.CASH_DRAWER_KEY, this.props.cashDrawerKey, undefined, this.props.inputSource),
      new UiInput(UiInputKey.PAID_AMOUNT, paidAmount)
    ];
    if (data.comment) {
      inputs.push(new UiInput(UiInputKey.REASON_COMMENT, data.comment));
    }
    if (this.reasonCodeListType) {
      inputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE, this.reasonCodeListType));
      if (data.reasonCode) {
        inputs.push(new UiInput(UiInputKey.REASON_CODE, data.reasonCode.code));
        inputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION, data.reasonCode.description));
      }
    }
    if (this.state.transactionReference) {
      inputs.push(new UiInput(UiInputKey.PAID_OUT_REFERENCE, this.state.transactionReference, undefined,
          this.state.dataEventType === DataEventType.ScanData ? UIINPUT_SOURCE_BARCODE : UIINPUT_SOURCE_KEYBOARD));
    }
    if(this.paidReceiptAttachements) {
      if(this.userComments) {
        inputs.push(new UiInput(UiInputKey.PAID_USER_COMMENTS, this.userComments));
      }
      inputs.push(new UiInput(UiInputKey.ATTACHMENTS, this.paidReceiptAttachements));
    }
    this.props.performBusinessOperation(this.props.deviceIdentity, this.props.eventType, inputs);
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
    this.props.performBusinessOperation(this.props.deviceIdentity, VOID_TENDER_CONTROL_TRANSACTION_EVENT, []);
  }

}

const form = reduxForm<PaidTransferAmountForm, Props>({
  form: "paidTransferAmount",
  enableReinitialize: true,
  validate: (values: PaidTransferAmountForm) => {
    const errors: FormErrors<PaidTransferAmountForm>
        = { transferAmount: undefined, reasonCode: undefined, comment: undefined };

    if (!values.transferAmount || Number.parseFloat(values.transferAmount) === 0) {
      errors.transferAmount = I18n.t("required", {field : I18n.t("amount")});
    }
    if (!values.reasonCode || !values.reasonCode.code) {
      errors.reasonCode = I18n.t("required", { field: I18n.t("reasonCode") });
    }
    return errors;
  },
  initialValues: {
    transferAmount: undefined,
    reasonCode: undefined,
    comment: undefined
  }
})(PaidDetailScreen);

const mapStateToProps = (state: AppState): StateProps => {

  return {
    businessState: state.businessState,
    cashDrawerState: state.businessState && state.businessState.stateValues &&
        state.businessState.stateValues.get("CashDrawerSession.state"),
    configManager: state.settings.configurationManager,
    retailLocationCurrency: state.settings.retailLocationCurrency,
    deviceIdentity: state.settings.deviceIdentity,
    transactionsState: state.transactions,
    incomingDataEvent: state.dataEvent,
    uiState: state.uiState
  };
};

const mapDispatchToProps: DispatchProps = {
  clearSearchResult: clearPaidOutTransactionsResult.request,
  alert: alert.request,
  dismissAlertModal: dismissAlertModal.request,
  performBusinessOperation: businessOperation.request,
  dataEventRequest: dataEvent.request,
  updateUiMode: updateUiMode.request,
  displayToastAction: displayToast.request
};

export default connect(mapStateToProps, mapDispatchToProps)(withMappedNavigationParams<typeof form>()(form));
