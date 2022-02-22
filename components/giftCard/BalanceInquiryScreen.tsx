import * as React from "react";
import { Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  UiInput,
  UIINPUT_SOURCE_BARCODE,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import {
   BALANCE_INQUIRY_EVENT,
   BALANCE_INQUIRY_RECEIPT_EVENT,
   EXIT_ATTENDANT_MODE_EVENT,
   ReceiptCategory,
   ReceiptState,
   ReceiptType,
   TenderAuthCategory,
   UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { IAuthorizationResponse, TenderType } from "@aptos-scp/scp-types-commerce-devices";

import i18n from "../../../config/I18n";
import {
  ActionCreator,
  balanceInquiry as balanceInquiryOperation,
  businessOperation,
  dataEvent,
  DataEventType,
  feedbackNoteAction,
  IKeyListenerData,
  sceneTitle,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BalanceInquiryState,
  BusinessState,
  DataEventState,
  FeedbackNoteState,
  SettingsState,
  UiState,
  UI_MODE_BALANCE_INQUIRY,
  UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION,
  UI_MODE_RECEIPT_PRINTER_CHOICE,
  UI_MODE_WAITING_TO_CLOSE
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { RenderSelectOptions } from "../common/FieldValidation";
import { popTo } from "../common/utilities/navigationUtils";
import {
  getIsGiftCardDeviceFilter,
  getPaymentDevicesAsRenderSelect
} from "../payment/PaymentDevicesUtils";
import { inTransaction } from "../selfCheckout/common/constants";
import { selfCheckoutConfigured } from "../selfCheckout/utilities/SelfCheckoutStateCheck";
import { NavigationScreenProps } from "../StackNavigatorParams";
import BalanceInquiry from "./BalanceInquiry";
import { BalanceInquiryScreenProps } from "./interfaces";
import { balanceInquiryScreenStyles } from "./styles";


interface StateProps {
  balanceInquiry: BalanceInquiryState;
  businessState: BusinessState;
  dataEventState: DataEventState;
  deviceIdentity: DeviceIdentity;
  feedbackNoteState: FeedbackNoteState;
  paymentStatus: Map<string, any>;
  settings: SettingsState;
  uiState: UiState;
  uiMode: string;
}

interface DispatchProps {
  sceneTitle: ActionCreator;
  businessOperation: ActionCreator;
  clearFeedbackNoteState: ActionCreator;
  dataEventSuccess: ActionCreator;
  balanceInquiryOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends BalanceInquiryScreenProps, StateProps, DispatchProps, NavigationScreenProps<"balanceInquiry"> {}

interface State {
  showReceiptOptions: boolean;
  selectedTenderType: TenderType;
  feedbackNote: FeedbackNoteState;
  authResponse: IAuthorizationResponse;
  backFromResult: boolean;
  backFromBalanceInquiryList: boolean;
}

class BalanceInquiryScreen extends React.Component<Props, State> {
  private styles: any;
  private primaryGiftDevices: RenderSelectOptions[];

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(balanceInquiryScreenStyles());

    let selectedTenderType: TenderType = undefined;
    if (!(this.props.isGiftCardAvailable && this.props.isValueCertAvailable)) {
      if (this.props.isValueCertAvailable) {
        selectedTenderType = TenderType.ValueCertificate;
      } else {
        selectedTenderType = TenderType.Gift;
      }
    }

    this.primaryGiftDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus,
        getIsGiftCardDeviceFilter(this.props.settings.configurationManager,
        this.props.settings.deviceIdentity.deviceId));

    this.state = {
      showReceiptOptions: false,
      selectedTenderType,
      feedbackNote: undefined,
      authResponse: this.props.balanceInquiry && this.props.balanceInquiry.authResponse,
      backFromResult: false,
      backFromBalanceInquiryList: false
    };
  }

  public componentDidMount(): void {
    if (!this.state.selectedTenderType) {
      this.props.updateUiMode(UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION);
      this.props.sceneTitle("reasonCodeList", "balanceInquiry");
      this.props.navigation.push("reasonCodeList", {
        options: [
          {
            code: TenderType.Gift,
            description: i18n.t("giftCard")
          },
          {
            code: TenderType.ValueCertificate,
            description: i18n.t("valueCertificate")
          }
        ],
        onOptionChosen: this.onSelectTender.bind(this),
        onClose: () => {this.setState({backFromBalanceInquiryList: true});}
      });
    } else {
      this.props.updateUiMode(UI_MODE_BALANCE_INQUIRY);
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.businessState.stateValues.get("ReceiptSession.state") !==
        this.props.businessState.stateValues.get("ReceiptSession.state")) {
      const receiptSessionState = this.props.businessState.stateValues.get("ReceiptSession.state");
      //Close the input form after printer status is received.
      if (receiptSessionState === ReceiptState.Completed) {
        this.state.backFromResult ? this.setState({backFromResult: false}) : this.closeOnAction();
      }
    }

    if (prevProps.feedbackNoteState !== this.props.feedbackNoteState && this.props.feedbackNoteState.message) {
      this.setState({feedbackNote: this.props.feedbackNoteState});
      this.props.clearFeedbackNoteState();
    }

    if (prevProps.dataEventState !== this.props.dataEventState && this.props.dataEventState.data &&
          (this.props.dataEventState.eventType === DataEventType.ScanData ||
          this.props.dataEventState.eventType === DataEventType.KeyListenerData)) {
      this.handleBalanceInquiry(this.props.dataEventState.data.data ||
          (this.props.dataEventState.data as IKeyListenerData).inputText, false, true);
      // Clear the props
      this.props.dataEventSuccess(this.props.dataEventState, false);
    }

    if (prevProps.balanceInquiry && this.props.balanceInquiry &&
        prevProps.balanceInquiry.authResponse !== this.props.balanceInquiry.authResponse ) {
      this.setState({authResponse: this.props.balanceInquiry.authResponse});
    }

    if (!prevState.backFromBalanceInquiryList && this.state.backFromBalanceInquiryList) {
      this.setState({backFromBalanceInquiryList: false});
      this.closeScreen();
    }

    if (this.props.uiMode !== UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION && this.state.backFromResult) {
      this.props.updateUiMode(UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION);
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
    //reset the Balance Inquiry response in the state
    this.props.balanceInquiryOperation(undefined);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <BalanceInquiry
          balanceInquiryResponse={this.state.authResponse}
          balanceInquiryPrinting={this.state.showReceiptOptions}
          businessState={this.props.businessState}
          accountNumber={this.props.balanceInquiry && this.props.balanceInquiry.authResponse ?
              this.props.balanceInquiry.authResponse.cardNumber ||
              this.props.balanceInquiry.authResponse.valueCertificateNumber : ""}
          onPrint={this.handlePrintReceipt}
          onSave={this.handleBalanceInquiry}
          primaryGiftDevices={this.primaryGiftDevices}
          settings={this.props.settings}
          selectedTenderType={this.state.selectedTenderType}
          handleClose={this.handleCancel}
          handleBack={this.handleBack.bind(this)}
          showReceiptOptions={this.state.showReceiptOptions}
          feedbackNote={this.state.feedbackNote}
          navigation={this.props.navigation}
          hideBackButton = {this.hideBackButton()}
        />
      </BaseView>
    );
  }

  private hideBackButton = (): boolean => {
    return (this.props.uiMode === UI_MODE_RECEIPT_PRINTER_CHOICE ||
        this.props.uiMode === UI_MODE_WAITING_TO_CLOSE);
  }

  private onSelectTender(newValue: RenderSelectOptions): void {
    this.props.updateUiMode(UI_MODE_BALANCE_INQUIRY);
    this.setState({selectedTenderType: newValue.code as TenderType});
  }

  private handleBalanceInquiry = (inputValue: string, useSwipe?: boolean, isScan?: boolean): void => {
    if ((!inputValue || inputValue.trim().length === 0) && !useSwipe) {
      return;
    }

    const uiInputs: UiInput[] = [];

    if (this.state.selectedTenderType === TenderType.ValueCertificate) {
      uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME,
          TenderAuthCategory.StoredValueCertificateService));
      uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_NUMBER, inputValue,
          isScan ? UIINPUT_SOURCE_BARCODE : UIINPUT_SOURCE_KEYBOARD));
    } else {
      if (!useSwipe) {
        uiInputs.push(new UiInput(UiInputKey.REDEEM_CARD_NUMBER, inputValue,
            isScan ? UIINPUT_SOURCE_BARCODE : UIINPUT_SOURCE_KEYBOARD));
      }
    }

    this.props.businessOperation(this.props.deviceIdentity, BALANCE_INQUIRY_EVENT, uiInputs);
    Keyboard.dismiss();
  }

  private handlePrintReceipt = (receiptType: ReceiptType): void => {
    if (this.props.uiState.isAllowed(BALANCE_INQUIRY_RECEIPT_EVENT)) {
      if (receiptType !== ReceiptType.None) {
        this.setState({showReceiptOptions: true});
      } else {
        this.handleCancel();
      }
    } else {
      this.closeOnAction();
    }
  }

  private handleCancel = (): void => {
    if (this.props.balanceInquiry && this.props.balanceInquiry.authResponse &&
          this.props.uiState.isAllowed(BALANCE_INQUIRY_RECEIPT_EVENT)) {
      const uiInputs: UiInput[] = [];
      uiInputs.push(new UiInput(UiInputKey.RECEIPT_CATEGORY, ReceiptCategory.BalanceInquiry));
      uiInputs.push(new UiInput(UiInputKey.RECEIPT_TYPE, ReceiptType.None));
      this.props.businessOperation(this.props.deviceIdentity, BALANCE_INQUIRY_RECEIPT_EVENT, uiInputs);
    }
    this.closeScreen();
  }

  private closeOnAction(): void {
    const stateValues = this.props.businessState && this.props.businessState.stateValues;
    if (selfCheckoutConfigured(this.props) && !inTransaction(stateValues)) {
      this.props.businessOperation(this.props.settings.deviceIdentity, EXIT_ATTENDANT_MODE_EVENT, []);
    } else {
      this.closeScreen();
    }
  }

  private handleBack(): void {
    if (this.state.authResponse) {
      if (this.props.uiState.isAllowed(BALANCE_INQUIRY_RECEIPT_EVENT)) {
        const uiInputs: UiInput[] = [];
        uiInputs.push(new UiInput(UiInputKey.RECEIPT_CATEGORY, ReceiptCategory.BalanceInquiry));
        uiInputs.push(new UiInput(UiInputKey.RECEIPT_TYPE, ReceiptType.None));
        this.props.businessOperation(this.props.deviceIdentity, BALANCE_INQUIRY_RECEIPT_EVENT, uiInputs);
      } else {
        this.props.updateUiMode(UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION);
      }
      this.setState({
        authResponse: undefined,
        feedbackNote: undefined,
        showReceiptOptions: false,
        backFromResult: true
      });
      this.props.balanceInquiryOperation(undefined);
    } else {
      this.closeScreen();
    }
  }

  private closeScreen(): void {
    this.props.navigation.dispatch(popTo("main"));
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    balanceInquiry: state.balanceInquiry,
    businessState: state.businessState,
    dataEventState: state.dataEvent,
    deviceIdentity: state.settings.deviceIdentity,
    feedbackNoteState: state.feedbackNote,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    settings: state.settings,
    uiMode: state.uiState.mode,
    uiState: state.uiState
  };
}

const mapDispatchToProps: DispatchProps = {
  businessOperation: businessOperation.request,
  balanceInquiryOperation: balanceInquiryOperation.success,
  clearFeedbackNoteState: feedbackNoteAction.success,
  dataEventSuccess: dataEvent.success,
  sceneTitle: sceneTitle.request,
  updateUiMode: updateUiMode.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof BalanceInquiryScreen>()(BalanceInquiryScreen));
