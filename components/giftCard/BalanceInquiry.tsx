import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import {
  isStoredValueCardServiceAvailable,
  isStoredValueCertificateServiceAvailable,
  ReceiptCategory,
  ReceiptType
} from "@aptos-scp/scp-component-store-selling-features";
import { IAuthorizationResponse, ResponseCodes, TenderType, ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import { BusinessState, FeedbackNoteState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import { renderInputField, RenderSelectOptions } from "../common/FieldValidation";
import { InputType } from "../common/Input";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import {
  businessEventCompletedWithError,
  completedTenderAuthorization,
  tenderAuthorizationInProgress
} from "../payment/PaymentDevicesUtils";
import ReceiptOptionForm from "../receipt/ReceiptOptionForm";
import { balanceInquiryStyles } from "./styles";
import Header, { HeaderButton } from "../common/Header";
import FeedbackNote from "../common/FeedbackNote";
import { NavigationProp } from "../StackNavigatorParams";
import { popTo } from "../common/utilities/navigationUtils";
import { cameraScannerInputStyles } from "../common/styles";

export interface BalanceInquiryForm {
  accountNumber: string;
}

interface Props {
  balanceInquiryResponse: IAuthorizationResponse;
  balanceInquiryPrinting: boolean;
  businessState: BusinessState;
  accountNumber: string;
  primaryGiftDevices: RenderSelectOptions[];
  onSave: (giftCardNumber: string, giftCardButton?: boolean) => void;
  onPrint: (receiptType: ReceiptType) => void;
  handleClose: () => void;
  handleBack: () => void;
  settings: SettingsState;
  selectedTenderType: TenderType;
  showReceiptOptions: boolean;
  feedbackNote?: FeedbackNoteState;
  navigation: NavigationProp;
  hideBackButton: boolean;
}

interface State {
  isStoredValueServiceEnabled: boolean;
}

class BalanceInquiry extends React.Component<Props & InjectedFormProps<BalanceInquiryForm, Props> &
    FormInstance<BalanceInquiryForm, Props>, State> {
  private styles: any;
  private inputStyles: any;
  private disableCardButtonsAuthSessInProgress: boolean;

  public constructor(props: Props & InjectedFormProps<BalanceInquiryForm, Props> &
      FormInstance<BalanceInquiryForm, Props>) {
    super(props);

    this.disableCardButtonsAuthSessInProgress = tenderAuthorizationInProgress(
        this.props.businessState.stateValues.get("TenderAuthorizationSession.state"));

    const isStoredValueServiceEnabled = this.props.selectedTenderType === TenderType.Gift ?
        isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
        this.props.businessState.stateValues.get("StoredValueCardSession.state")) :
        isStoredValueCertificateServiceAvailable(this.props.settings.configurationManager,
        this.props.businessState.stateValues.get("StoredValueCertificateSession.state"),
        ValueCertSubType.GiftCertificate);
    this.state = {
      isStoredValueServiceEnabled
    };

    this.styles = Theme.getStyles(balanceInquiryStyles());
    this.inputStyles = Theme.getStyles(cameraScannerInputStyles());
  }

  public componentDidMount(): void {
    this.props.initialize({ accountNumber : this.props.accountNumber });
  }

  public componentDidUpdate(prevProps: Props): void {
    if (completedTenderAuthorization(prevProps.businessState.stateValues.get("TenderAuthorizationSession.state"),
          this.props.businessState.stateValues.get("TenderAuthorizationSession.state")) ||
          businessEventCompletedWithError(prevProps.businessState, this.props.businessState)) {
      this.disableCardButtonsAuthSessInProgress = false;
      this.forceUpdate();
    }
    if (this.props.selectedTenderType !== prevProps.selectedTenderType) {
      this.setState({isStoredValueServiceEnabled: this.props.selectedTenderType === TenderType.Gift ?
          isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
          this.props.businessState.stateValues.get("StoredValueCardSession.state")) :
          isStoredValueCertificateServiceAvailable(this.props.settings.configurationManager,
          this.props.businessState.stateValues.get("StoredValueCertificateSession.state"),
          ValueCertSubType.GiftCertificate)});
    }
  }

  public render(): JSX.Element {
    return (
      <>
        <Header
          title={I18n.t("balanceInquiry")}
          backButton={this.getBackButton()}
          rightButton={
            {
              title: this.props.balanceInquiryResponse ? I18n.t("close") : I18n.t("balance"),
              action: this.props.balanceInquiryResponse ? this.props.handleClose : this.props.submit
            }
          }
          isVisibleTablet={Theme.isTablet}
        />
      <KeyboardAwareScrollView contentContainerStyle={this.styles.root}>
        {
          !this.props.balanceInquiryResponse &&
          this.renderFormAndControls()
        }
        {
          this.props.balanceInquiryResponse &&
          this.renderResultsWithControls()
        }
      </KeyboardAwareScrollView>
    </>
    );
  }

  private renderFormAndControls(): JSX.Element {
    const inputStyles = this.inputStyles;
    return (
      <>
        <Field
          name="accountNumber"
          clearText={false}
          component={renderInputField}
          style={inputStyles.inputPanel}
          inputStyle={inputStyles.inputField}
          inputContainerStyle={inputStyles.transparentBackground}
          onSubmitEditing={() => this.props.submit()}
          placeholder ={I18n.t(this.props.selectedTenderType === TenderType.ValueCertificate ?
              "valueCertificateNumber" : "giftCardNumber")}
          secureTextEntry={true}
          settings={this.props.settings}
          keyboardType={this.props.selectedTenderType === TenderType.ValueCertificate ?
            "numbers-and-punctuation" : InputType.numeric}
          inputType={this.props.selectedTenderType === TenderType.ValueCertificate ?
            InputType.text : InputType.numeric}
          errorStyle={inputStyles.inputError}
          placeholderStyle={inputStyles.placeholderStyle}
          cameraIcon={{
            icon: "Camera",
            size: inputStyles.cameraIcon.fontSize,
            color: inputStyles.cameraIcon.color,
            position: "right",
            style: inputStyles.cameraIconPanel
          }}
        />
        <View style={this.styles.buttonContainer}>
          {!this.state.isStoredValueServiceEnabled &&
            <TouchableOpacity
              onPress={() => {this.disableCardButtonsAuthSessInProgress = true;
                              this.props.onSave(undefined, true); }}
              disabled={this.swipeIsDisabled}
              style={[this.styles.closeButton, this.swipeIsDisabled && this.styles.btnDisabled]}
            >
              <Text style={[this.styles.btnSecondayText, this.swipeIsDisabled && this.styles.btnTextDisabled]}>
                {I18n.t("swipe")}
              </Text>
            </TouchableOpacity>
          }
        </View>
      </>
    );
  }

  private renderResultsWithControls(): JSX.Element {

    return (
      <>
        <View style={this.styles.resultsArea}>
          { this.props.feedbackNote &&
            <FeedbackNote
              style={this.styles}
              message={this.props.feedbackNote.message}
              messageType={this.props.feedbackNote.messageType}
              messageTitle={I18n.t("balanceInquiryUnsuccessful")}
            />
          }
          {this.props.balanceInquiryResponse && this.props.balanceInquiryResponse.balance &&
              this.props.balanceInquiryResponse.responseCode === ResponseCodes.Approved  &&
            <View style={this.styles.balanceTextArea}>
              <Text style={this.styles.balanceTitle}>{I18n.t("balance")}</Text>
              <Text style={this.styles.balanceAmount}>
                {this.props.balanceInquiryResponse.balance.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
              </Text>
            </View>
          }
          { this.props.accountNumber &&
            <View style={this.styles.textResultsArea}>
              <Text style={this.styles.descriptionTitle}>
                {this.getResultDescriptionTitle()}
              </Text>
              <Text style={this.styles.descriptionText}>{maskAccountNumber(this.props.accountNumber)}</Text>
            </View>
          }
        </View>
        { this.props.balanceInquiryResponse && this.props.balanceInquiryResponse.balance &&
            this.props.balanceInquiryResponse.responseCode === ResponseCodes.Approved &&
          <View style={this.styles.receiptOptionsArea}>
            <ReceiptOptionForm
              providedReceiptCategory={ReceiptCategory.BalanceInquiry}
              onClose={this.popToMain}
              styles={this.styles.receiptFormStyles}
              navigation={this.props.navigation}
            />
          </View>
        }
      </>
    );
  }

  private getBackButton = (): HeaderButton => {
    if (this.props.balanceInquiryResponse && this.props.hideBackButton) {
        return <View/>
    } else {
      return {
        name: "Back",
        title: Theme.isTablet && !this.props.balanceInquiryResponse && I18n.t("basket"),
        action: () => {
          if (!this.props.showReceiptOptions) {
            this.props.handleBack();
            this.props.reset();
          }
        }
      }
    }
  }

  private getResultDescriptionTitle(): string {
    const valueCertSubType = this.props.balanceInquiryResponse.subType;
    if (this.props.selectedTenderType === TenderType.ValueCertificate) {
      if (valueCertSubType === ValueCertSubType.StoreCredit) {
        return I18n.t("storeCreditNumber");
      } else if(valueCertSubType === ValueCertSubType.GiftCertificate) {
        return I18n.t("giftCertificateNumber");
      } else {
        return  I18n.t("valueCertificateNumber");
      }
    } else {
      return I18n.t("giftCardNumber");
    }
  }

  private get isPrimaryGiftDeviceAvailable(): boolean {
    return this.props.primaryGiftDevices.length > 0;
  }

  private get swipeIsDisabled(): boolean {
    return !this.isPrimaryGiftDeviceAvailable || this.disableCardButtonsAuthSessInProgress;
  }

  private popToMain = () => {
    this.props.navigation.dispatch(popTo("main"));
  }
}

function maskAccountNumber(accountNumber?: string): string {
  if (accountNumber && accountNumber.length > 4) {
    return `${I18n.t("accountNumberMask")}${accountNumber.substring(accountNumber.length - 4)}`;
  }
  return accountNumber;
}

export default reduxForm<BalanceInquiryForm, Props>({
  form: "balanceInquiry",
  validate : (values: any) => {
    const errors: { accountNumber: string } = { accountNumber: undefined };
    if (!values.accountNumber) {
      errors.accountNumber = I18n.t("required");
    }
    return errors;
  },
  initialValues: { accountNumber: undefined },
  onSubmit: (data: BalanceInquiryForm, dispatch: Dispatch<any>, props: Props) => {
    props.onSave(data.accountNumber);
    Keyboard.dismiss();
  }
})(BalanceInquiry);
