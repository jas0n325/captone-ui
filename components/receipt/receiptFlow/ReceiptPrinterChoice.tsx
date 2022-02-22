import * as React from "react";
import { ActivityIndicator, Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  fiscalConfigValidationRequired,
  IN_NO_SALE_TRANSACTION_WAITING,
  POST_VOID_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { PrinterType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../../config/I18n";
import {
  ActionCreator,
  clearReceiptAlert,
  getPrintersFromSearch,
  ReceiptPrinter,
  setChosenPrinterId,
  updateUiMode
} from "../../../actions";
import { AppState, UiState, UI_MODE_RECEIPT_PRINTER_CHOICE, UI_MODE_WAITING_TO_CLOSE } from "../../../reducers";
import Theme from "../../../styles";
import BaseView from "../../common/BaseView";
import Header, { HeaderButton } from "../../common/Header";
import Input from "../../common/Input";
import Spinner from "../../common/Spinner";
import { postVoidedFiscalPrinter } from "../../common/utilities/receiptUtils";
import { isFiscalPrinter, isPrinterDevice, updateScroll } from "../../common/utilities/utils";
import { NavigationProp } from "../../StackNavigatorParams";
import { activityIndicatorColor } from "../../styles";
import { ReceiptPrinterChoiceProps } from "./interfaces";
import { receiptPrinterChoiceStyles } from "./styles";
import VectorIcon from "../../common/VectorIcon";
import OfflineNotice from "../../common/OfflineNotice";

const VOIDED_TRANSACTION_STATE = "Voided";

interface StateProps {
  chosenPrinterId: string;
  configuredPrinters: ReceiptPrinter[];
  alertNoPrintersFound: boolean;
  eventType: string;
  uiInputs: UiInput[];
  configurationManager: IConfigurationManager;
  uiState: UiState;
  isSelectPrinter: boolean;
  stateValues: Map<string, any>;
  i18nLocation: string
}

interface DispatchProps {
  setChosenPrinterId: ActionCreator;
  getPrintersFromSearch: ActionCreator;
  clearReceiptAlert: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends ReceiptPrinterChoiceProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  printingInProgress: boolean;
  inputValue: string;
  isContinueReceiptPrinting: boolean;
  isScrolling: boolean;
}

class ReceiptPrinterChoice extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(receiptPrinterChoiceStyles());

    this.state = {
      printingInProgress: false,
      inputValue: "",
      isContinueReceiptPrinting: true,
      isScrolling: false
    };

    this.updateInput = this.updateInput.bind(this);
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode !== UI_MODE_WAITING_TO_CLOSE) {
      this.props.updateUiMode(this.props.uiMode);
    }
  }

  public componentDidMount(): void {
    if (this.thereIsOnlyOneConfiguredPrinter) {
      if (!this.props.chosenPrinterId) {
        this.props.setChosenPrinterId(this.props.configuredPrinters[0].id);
      } else if (!!this.props.chosenPrinterId) {
        this.handleOnContinue();
      }
    }

    this.updateUiModeReceiptChoice();
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.thereIsOnlyOneConfiguredPrinter && !prevProps.chosenPrinterId && !!this.props.chosenPrinterId
        && this.state.isContinueReceiptPrinting) {
      this.handleOnContinue();
    }

    if(this.thereIsOnlyOneConfiguredPrinter && !this.props.chosenPrinterId) {
      this.props.setChosenPrinterId(this.props.configuredPrinters[0].id);
    }

    if (this.props.uiMode === UI_MODE_WAITING_TO_CLOSE && !this.props.chosenPrinterId) {
      this.updateUiModeReceiptChoice();
    }

    if (!prevProps.alertNoPrintersFound && this.props.alertNoPrintersFound) {
      setTimeout(
        () => Alert.alert(
          I18n.t("printerNotFoundHeader"),
          I18n.t("printerNotFoundMessage"),
          [{ text: I18n.t("ok"), onPress: this.props.clearReceiptAlert }],
          { cancelable: true }
        ),
        250
      );
    }
  }

  public updateUiModeReceiptChoice(): void {
    // Update UI Mode to UI_MODE_RECEIPT_PRINTER_CHOICE after all other uiMode updates
    setTimeout(() => {
      this.props.updateUiMode(UI_MODE_RECEIPT_PRINTER_CHOICE);
    }, 0);
  }

  public updateInput(value: string): void {
    this.setState({ inputValue: value });
  }

  public render(): JSX.Element {
    let printerList: ReceiptPrinter[];
    let fiscalPrinterMessage: string = undefined;
    if (this.props.eventType === POST_VOID_TRANSACTION_EVENT &&
        fiscalConfigValidationRequired(this.props.configurationManager, this.props.i18nLocation)) {
      printerList = postVoidedFiscalPrinter(this.props.uiInputs, this.props.configurationManager);
      if (printerList && printerList.length) {
        fiscalPrinterMessage = I18n.t("fiscalPostVoidPrinterInformation", { printerName: printerList[0].description });
      }
    } else if (this.props.isFilterFiscalPrinter && this.props.configuredPrinters) {
      printerList = this.props.configuredPrinters
          .filter((printer: ReceiptPrinter) => printer.id.toString()
          .includes(this.state.inputValue) && printer.printerType === PrinterType.Fiscal);
    } else if (this.props.configuredPrinters) {
      printerList = this.props.configuredPrinters
          .filter((printer: ReceiptPrinter) => printer.id.toString().includes(this.state.inputValue)
          && isPrinterDevice(printer));
    }

    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("receipt")}
          backButton= {this.getBackButton() }
          rightButton={!Theme.isTablet && !this.state.printingInProgress && {
            title: I18n.t("continue"),
            action: this.handleOnContinue
          }}
        />
        {!Theme.isTablet && <OfflineNotice isScrolling={this.state.isScrolling}/>}
        {
          fiscalPrinterMessage &&
            <View style = {this.styles.infoMessageView}>
              <Image source = {require("../../../../../assets/img/information.png")}
                  style = {this.styles.imageView}
              />
              <Text style={this.styles.infoMessageText}>{fiscalPrinterMessage}</Text>
            </View>
        }
        {
          !this.state.printingInProgress &&
          <>
            {
             !fiscalPrinterMessage && <Input
              style={this.styles.inputPanel}
              inputStyle={this.styles.inputField}
              cameraIcon={{
                icon: "Camera",
                size: this.styles.cameraIcon.fontSize,
                color: this.styles.cameraIcon.color,
                position: "right",
                style: this.styles.cameraIconPanel
              }}
              value={this.state.inputValue}
              showCamera={true}
              onChangeText={this.updateInput}
              placeholder={I18n.t("printerId")}
              placeholderSentenceCase={false}
              autoCapitalize={"none"}
            />
            }
            <FlatList
              onScrollEndDrag={this.handleScroll.bind(this)}
              data={printerList}
              renderItem={this.renderPrinterButton}
              keyExtractor={this.keyExtractor}
              extraData={this.props.chosenPrinterId}
            />
            {
              Theme.isTablet &&
              <View style={this.styles.buttonArea}>
                <TouchableOpacity
                  style={[this.styles.btnPrimary, this.styles.progressionButton]}
                  onPress={this.handleOnContinue}
                >
                  <Text style={this.styles.btnPrimaryText}>{I18n.t("continue")}</Text>
                </TouchableOpacity>
                {
                    this.props.eventType !== POST_VOID_TRANSACTION_EVENT && !this.props.hideBackButton && this.renderCancelButton()
                }
              </View>
            }
          </>
        }
        { this.renderPrintingSpinner()}
      </BaseView>
    );
  }

  private isFiscalPrinterSelected = () => {
    return isFiscalPrinter(this.props.configurationManager, this.props.chosenPrinterId);
  }

  private getBackButton = (): HeaderButton => {
    if (this.props.hideBackButton || !this.requireBackButton()) {
        return <View/>
    } else if (this.props.onCancel) {
      return { name: "Back", action: this.handleCancel };
    }
  }

  private handleScroll(scrollEvent: any): void {
    if (!Theme.isTablet) {
      this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
    }
  }


  private renderPrintingSpinner = (): JSX.Element => {
    if (this.state.printingInProgress) {
      if (this.isFiscalPrinterSelected()) {
        return (
          <View style = {this.styles.appCloseSpinnerContainer}>
            <View style={this.styles.activityIndicatorContainerView}>
              <Text style={this.styles.headerText}>{I18n.t("processing")}</Text>
              <Text style={this.styles.descText}>{I18n.t("donotCloseApp")}</Text>
              <ActivityIndicator
                size="large"
                style={this.styles.spinnerStyle}
                animating={true}
                color={activityIndicatorColor}
              />
            </View>
          </View>
        );
      } else {
        return (
          <Spinner size={0} containerStyle={this.styles.spinnerContainer}/>
        );
      }
    }
    return undefined;
  }

  private renderCancelButton(): JSX.Element {
    const isSelectPrinter: boolean =  this.props.isSelectPrinter;
    return (
      this.props.onCancel && this.cancelPrintAllowed() && !this.props.isTillReceiptFlow && !isSelectPrinter &&
        <TouchableOpacity
          style={[this.styles.btnSeconday, this.styles.progressionButton]}
          onPress={this.handleCancel}
        >
          <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
        </TouchableOpacity>
    );
  }

  private renderPrinterButton = ({ item }: { item: ReceiptPrinter }): JSX.Element => {
    return (
      <TouchableOpacity
        style={this.styles.receiptTypeChoiceButton}
        onPress={() => this.props.setChosenPrinterId(item.id)}
      >
        <Text style={this.styles.receiptTypeChoiceButtonText}>{item.description}</Text>
        {
          this.props.chosenPrinterId === item.id &&
          <VectorIcon
            name="Checkmark"
            fill={this.styles.receiptTypeChoiceButtonText.color}
            height={this.styles.checkIcon.fontSize}
          />
        }
      </TouchableOpacity>
    );
  }

  private keyExtractor = (item: ReceiptPrinter, index: number): string => index.toString();

  private get thereIsOnlyOneConfiguredPrinter(): boolean {
    return this.props.configuredPrinters && this.props.configuredPrinters.length === 1;
  }

  private handleOnContinue = (): void => {
    const printerWasChosen: boolean = this.props.configuredPrinters
        .map((printer: ReceiptPrinter) => printer.id)
        .indexOf(this.props.chosenPrinterId) !== -1;

    if (printerWasChosen) {
      if (this.props.isFilterFiscalPrinter) {
        this.setState({ printingInProgress: false, inputValue: "" , isContinueReceiptPrinting: false},
            () => setTimeout(this.props.onContinue, 100));
      } else {
        this.setState({ printingInProgress: true, isContinueReceiptPrinting: false},
            () => setTimeout(this.props.onContinue, 100));
      }
    }
  }

  private handleCancel = (): void => {
    if (!this.state.printingInProgress) {
      this.props.onCancel();
    }
  }
  private requireBackButton = (): boolean => {
    return (!this.props.isTillReceiptFlow &&
        this.props.uiState.logicalState !== IN_NO_SALE_TRANSACTION_WAITING &&
        !this.props.isSelectPrinter && this.cancelPrintAllowed() &&
        !(this.props.eventType === POST_VOID_TRANSACTION_EVENT));
  }

  private cancelPrintAllowed() : boolean {
    return this.props.stateValues.get("transaction.closingState") !== VOIDED_TRANSACTION_STATE &&
        !this.props.stateValues.get("transaction.isTenderExchangeTransaction");
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    chosenPrinterId: state.receipt.chosenPrinterId,
    configuredPrinters: state.receipt.configuredPrinters,
    alertNoPrintersFound: state.receipt.alertNoPrintersFound,
    eventType: state.businessState && state.businessState.eventType,
    uiInputs: state.businessState && state.businessState.inputs,
    configurationManager: state.settings && state.settings.configurationManager,
    uiState: state.uiState,
    isSelectPrinter: state.receipt.isSelectPrinter,
    stateValues: state.businessState.stateValues,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
};

const mapDispatchToProps: DispatchProps = {
  setChosenPrinterId: setChosenPrinterId.request,
  getPrintersFromSearch: getPrintersFromSearch.request,
  clearReceiptAlert: clearReceiptAlert.request,
  updateUiMode: updateUiMode.request
};

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, mapDispatchToProps)(ReceiptPrinterChoice);
