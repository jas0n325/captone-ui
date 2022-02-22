import * as React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { FISCAL_DOCUMENT_NO_EVENT, UiInputKey } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator,
        businessOperation,
        ReceiptPrinter,
        updateUiMode } from "../../actions";
import { AppState,
        BusinessState,
        UI_MODE_STORE_OPERATION } from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import FeedbackNote from "../common/FeedbackNote";
import Header from "../common/Header";
import Input, { InputType } from "../common/Input";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { FiscalPrinterEnterDocumentNumberScreenProps } from "./interface";
import { fiscalPrinterScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  configuredPrinters: ReceiptPrinter[];
  chosenPrinterId: string;
  selectedPrinterSerialNumber: string;
}
interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}
interface Props extends FiscalPrinterEnterDocumentNumberScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"fiscalPrinterEnterDocument"> {}
interface State {
  inputValue: string;
  businessState: BusinessState;
}
class FiscalPrinterEnterDocumentNumberScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(fiscalPrinterScreenStyles());
    this.state = {
      inputValue: "",
      businessState: this.props.businessState
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_STORE_OPERATION);
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
      this.handleStateChanged(prevProps);
 }

  public render(): JSX.Element {
      return (
        <BaseView style={this.styles.fill}>
          <Header
              isVisibleTablet={Theme.isTablet}
              title={I18n.t("receipt")}
              backButton={{
                name: "Back",
                title: Theme.isTablet && I18n.t("receipt"),
                action: this.backButtonAction
              }}
              rightButton={{
                title: I18n.t("done"),
                action: () => this.doneButtonAction()
              }}
          />
            <KeyboardAwareScrollView contentContainerStyle={this.styles.root}>
            {
              this.renderTenderInDetails()
            }
          </KeyboardAwareScrollView>
        </BaseView>
    );
  }

  private renderTenderInDetails(): JSX.Element {
    return (
        <View style={this.styles.feedBackNote}>
            <FeedbackNote message={I18n.t("enterDocumentNumberTitle")}
              style={this.styles}
              messageType = {FeedbackNoteType.Info}
            />
            <View style = { Theme.isTablet ? this.styles.actions : this.styles.documentNumberTextArea}>
                <Input
                    inputType={InputType.text}
                    style={this.styles.inputPanel}
                    inputStyle={this.styles.inputField}
                    value={this.state.inputValue}
                    showCamera={false}
                    onChangeText={this.updateInput.bind((this))}
                    placeholder={I18n.t("documentNumber")}
                    placeholderSentenceCase={false}
                    maxLength = {9}
                    autoCapitalize={"none"}
                />
            </View>
        </View>
    );
  }

  private updateInput = (text: string) => {
    text = text.split("-").join("");
    text = text.match(new RegExp('.{1,4}', 'g')).join("-");
    this.setState({ inputValue: text });
  }

  private handleStateChanged(prevProps: Props): void {
    const stateValues = this.props.businessState.stateValues;
    const transactionClosed: boolean = prevProps.businessState.inProgress && !this.props.businessState.inProgress &&
        !!stateValues.get("transaction.closed");
    if (transactionClosed) {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private backButtonAction = (): void => {
    this.props.navigation.pop();
  }

  private doneButtonAction = (): void => {
    const uiInputs: Array<UiInput> = [];
      if (this.props.selectedPrinterSerialNumber){
        uiInputs.push(new UiInput(UiInputKey.PRINTER_SERIAL_NUMBER, this.props.selectedPrinterSerialNumber));
      }
    if (this.state.inputValue) {
      uiInputs.push(new UiInput(UiInputKey.FISCAL_NUMBER , this.state.inputValue));
    }
    this.props.performBusinessOperation(this.props.deviceIdentity, FISCAL_DOCUMENT_NO_EVENT, uiInputs);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    deviceIdentity: state.settings.deviceIdentity,
    businessState: state.businessState,
    configuredPrinters: state.receipt.configuredPrinters,
    chosenPrinterId: state.receipt.chosenPrinterId,
    selectedPrinterSerialNumber: state.receipt.selectedPrinterSerialNumber
  };
};

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof FiscalPrinterEnterDocumentNumberScreen>()
    (FiscalPrinterEnterDocumentNumberScreen));
