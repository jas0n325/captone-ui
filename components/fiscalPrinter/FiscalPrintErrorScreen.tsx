import * as React from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  FISCAL_POST_VOID_NO_RECEIPT,
  POST_VOID_FAILED_EVENT,
  PRINT_FISCAL_RETRY_EVENT,
  UiInputKey,
  VOID_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { FiscalResponseCode } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import { ActionCreator,
      businessOperation,
      isSelectPrinterFlow,
      ReceiptPrinter,
      updateUiMode} from "../../actions";
import { AppState,
     BusinessState,
     DeviceStatusState,
      UiState,
      UI_MODE_STORE_OPERATION
     } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { getFiscalPrinterList, IFeatureActionButtonProps } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { FiscalPrinterSpinnerTimeout } from "../fiscalPrinter/constants";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { FiscalPrinterErrorScreenProps } from "./interface";
import { fiscalPrinterScreenStyles } from "./styles";
import { activityIndicatorColor } from "../styles";
import { receiptPrinterChoiceStyles } from "../receipt/receiptFlow/styles";
import ErrorIcon from "./FiscalPrintErrorIcon";

interface StateProps {
  deviceIdentity: DeviceIdentity;
  businessState: BusinessState;
  deviceStatus: DeviceStatusState;
  configuredPrinters: ReceiptPrinter[];
  featureActionButtonProps: IFeatureActionButtonProps;
  chosenPrinterId: string;
  uiState: UiState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  isSelectPrinterFlow: ActionCreator;
}

interface Props extends FiscalPrinterErrorScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"fiscalPrinterError"> {}

interface State {
  isFiscalPrinterOffline: boolean;
  businessState: BusinessState;
  modalVisible: boolean;
  isPostVoid: boolean;
  isNoReceiptOrVoidAction: boolean;
  isShowSelectPrinter: boolean;
  isNotRefundable: boolean;
}
interface IFiscalErrorMessage {
  errorMessage: string;
  headerTitle: string;
}
class PrinterErrorScreen extends React.Component<Props, State> {
  private styles: any;
  private modalViewStyles: any;
  private fiscalPrinterList: ReceiptPrinter[];

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(fiscalPrinterScreenStyles());
    this.modalViewStyles = Theme.getStyles(receiptPrinterChoiceStyles());
    this.fiscalPrinterList = undefined;
    this.state = {
      isFiscalPrinterOffline: false,
      businessState: this.props.businessState,
      modalVisible: false,
      isPostVoid: false,
      isNoReceiptOrVoidAction: false,
      isShowSelectPrinter: false,
      isNotRefundable: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_STORE_OPERATION);

  }
  public componentWillMount(): void {
    this.handleStateChanged();
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }
  public componentDidUpdate(nextProps: Props): void {
    if (nextProps.uiState.logicalState !== this.props.uiState.logicalState) {
      this.handleStateChanged();
   }
 }

  public render(): JSX.Element {
    const {errorMessage, headerTitle} = this.printErrorMessage();
    return (
      <BaseView style={this.styles.root}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={headerTitle}
          backButton={this.state.isShowSelectPrinter || (!this.props.noPrinterExistsToPostVoid &&
              (this.state.isFiscalPrinterOffline && this.state.isPostVoid)) ? {
            name: "Back",
            action: (): void => { this.printerSelectionBackAction(); }
          } : <View />}
          rightButton={(this.props.noPrinterExistsToPostVoid ||
              (!this.state.isFiscalPrinterOffline && this.state.isPostVoid)) ? {
            title: I18n.t("okCaps"),
            action: () => {
              if (this.props.noPrinterExistsToPostVoid) {
                this.props.performBusinessOperation(this.props.deviceIdentity, POST_VOID_FAILED_EVENT, []);
              } else {
                this.props.navigation.dispatch(popTo("main"));
              }
            }
          } : <View />}
        />
        {this.renderContainerView(errorMessage)}
        {this.renderSpinnerModal()}
      </BaseView>
    );
  }

  private renderContainerView(errorMessage: string): JSX.Element {
    if (!this.state.modalVisible) {
      return (
        <>
          <View style={this.styles.container}>
            <View style={this.styles.errorContainer}>
              <View style={this.styles.errorMessageView}>
                <ErrorIcon
                  styles={this.styles.imageView}
                  fill={this.styles.iconStyle.cautionColor}
                  height={this.styles.iconStyle.height}
                />
                <Text style={this.styles.errorMessageText}>{errorMessage}</Text>
              </View>
            </View>
            {!this.props.noPrinterExistsToPostVoid && this.state.isFiscalPrinterOffline
              && this.state.isPostVoid &&
              <View style={Theme.isTablet ? this.styles.actions :
                [this.styles.fiscalFooterContainer, this.styles.printReportButtonMargin]}>
                {this.renderRetryButton()}
                {this.renderNoReceiptButton()}
              </View>
            }
            {!this.props.noPrinterExistsToPostVoid && !this.state.isPostVoid &&
              <View style={Theme.isTablet ? this.styles.actions :
                [this.styles.fiscalFooterContainer, this.styles.printReportButtonMargin]}>
                {this.state.isFiscalPrinterOffline && this.renderRetryButton()}
                {this.state.isShowSelectPrinter && this.renderSelectPrinter()}
                {this.renderVoidTransactionButton()}
              </View>
            }
            </View>
        </>
      )
    }
    return undefined;
  }

  private renderRetryButton(): JSX.Element {
    return (
      <TouchableOpacity
        style={[this.styles.btnPrimary, Theme.isTablet && this.styles.button, this.styles.printReportButtonMargin]}
        onPress={() => this.retryAction()}
      >
        <Text style={this.styles.btnPrimaryText}>{I18n.t("retry")}</Text>
      </TouchableOpacity>
    );
  }

  private renderNoReceiptButton(): JSX.Element {
    return (
      <TouchableOpacity
        style={[this.styles.btnSeconday, Theme.isTablet && this.styles.button, this.styles.printReportButtonMargin]}
        onPress={() => this.noReceiptAction()}
      >
        <Text style={this.styles.btnSecondayText}>{I18n.t("noReceipt")}</Text>
      </TouchableOpacity>
    );
  }

  private renderVoidTransactionButton(): JSX.Element {
    return (
      <TouchableOpacity
        style={[this.styles.btnSeconday, Theme.isTablet && this.styles.button, this.styles.printReportButtonMargin]}
        onPress={() => this.handleVoidTransaction()}
      >
        <Text style={ this.styles.btnSecondayText}>{I18n.t("voidTransactionForPrint")}</Text>
      </TouchableOpacity>
    );
  }

  private renderSelectPrinter(): JSX.Element {
    return (
      <TouchableOpacity
          style={[this.state.isNotRefundable ? this.styles.btnPrimary: this.styles.btnSeconday,
              Theme.isTablet && this.styles.button,
              this.styles.printReportButtonMargin]}
          onPress={() => this.printerSelectionBackAction()}>
        <Text style={this.state.isNotRefundable ? this.styles.btnPrimaryText : this.styles.btnSecondayText}>
            {I18n.t("selectPrinterButton")}</Text>
      </TouchableOpacity>
    );
  }

  private renderSpinnerModal(): JSX.Element {
    if (this.state.modalVisible) {
      return (
        <View style={this.modalViewStyles.appCloseSpinnerContainer}>
          <View style={this.modalViewStyles.activityIndicatorContainerView}>
            <Text style={this.modalViewStyles.headerText}>{I18n.t("printing")}</Text>
            <ActivityIndicator
              size="large"
              style={this.modalViewStyles.spinnerStyle}
              animating={true}
              color={activityIndicatorColor} />
          </View>
        </View>
      );
    }
    return undefined;
  }

  private retryAction(): void {
    const inputs: UiInput[] = [];
    const printerId: string = this.fiscalPrinterList && this.fiscalPrinterList.length > 1
        ? this.props.chosenPrinterId : (this.fiscalPrinterList[0] && this.fiscalPrinterList[0].id
        ? this.fiscalPrinterList[0].id : undefined);
    this.setState({isFiscalPrinterOffline: true,
      businessState: this.props.businessState,
      modalVisible: true
    });

    if (printerId) {
      inputs.push(new UiInput(UiInputKey.PRINTER, printerId));
      setTimeout(() => {
        this.props.performBusinessOperation(this.props.deviceIdentity, PRINT_FISCAL_RETRY_EVENT, inputs);
      }, FiscalPrinterSpinnerTimeout);
    }
  }

  private noReceiptAction(): void {
    this.setState({isFiscalPrinterOffline: true,
      businessState: this.props.businessState,
      modalVisible: true,
      isNoReceiptOrVoidAction: true
    });
    setTimeout(() => {
      this.props.performBusinessOperation(this.props.deviceIdentity, FISCAL_POST_VOID_NO_RECEIPT, []);
    }, FiscalPrinterSpinnerTimeout);
  }
  private printerSelectionBackAction(): void {
    this.props.isSelectPrinterFlow(true);
    if (!Theme.isTablet) {
      this.props.navigation.push("receiptPrinterChoice", {
        onContinue: this.props.receiptPrinterChoiceContinue,
        onCancel: this.props.receiptPrinterChoiceCancel
      });
    } else {
      this.props.navigation.pop();
    }
  }

  private handleVoidTransaction(): void {
    this.setState({ isNoReceiptOrVoidAction: true });
    const uiInputs: Array<UiInput> = [];
    const reasonListType: string = this.props && this.props.featureActionButtonProps &&
        this.props.featureActionButtonProps.voidTransactionReasonListType
        ? this.props.featureActionButtonProps.voidTransactionReasonListType : "TRAN";
    uiInputs.push(new UiInput(UiInputKey.REASON_CODE, I18n.t("printerUnavailableReasonCode")));
    uiInputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION, I18n.t("printerUnavailableReasonDesc")));
    uiInputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE, reasonListType));
    Alert.alert(
      I18n.t("voidTransactionForPrint"),
      I18n.t("voidErrorAlertMessage"),
      [
        {
          text:  I18n.t("cancel"),
          style: "cancel"
        },
        { text:  I18n.t("void"), onPress: () => {
            this.setState({isFiscalPrinterOffline: true,
              businessState: this.props.businessState,
              modalVisible: true
            });
            setTimeout(() => {
                this.props.performBusinessOperation(this.props.deviceIdentity, VOID_TRANSACTION_EVENT, uiInputs);
            }, FiscalPrinterSpinnerTimeout);
          }
        }
      ],
      { cancelable: false }
    );
  }

  private  printErrorMessage(): IFiscalErrorMessage {
    let errorMessage: string;
    let headerTitle: string;
    if ((!this.state.isFiscalPrinterOffline && this.state.isPostVoid) || (this.props.noPrinterExistsToPostVoid)) {
      errorMessage = I18n.t("postVoidTransactionError");
      headerTitle = I18n.t("postVoid");
    } else if (this.state.isNotRefundable) {
      if(!this.state.isShowSelectPrinter) {
        headerTitle = I18n.t("print");
        errorMessage = I18n.t("transactionPrintingError");
      } else {
        headerTitle = I18n.t("print");
        errorMessage = I18n.t("notRefundablePrintError");
      }
    } else {
       errorMessage = I18n.t("printFailedError");
       headerTitle = I18n.t("print");
    }
    return { errorMessage , headerTitle};
  }

  private isPrinterStatusOfflineOrRejected(printerResponseCode: FiscalResponseCode): boolean {
    return printerResponseCode === FiscalResponseCode.NotConnected ||
      printerResponseCode === FiscalResponseCode.Rejected || printerResponseCode === FiscalResponseCode.Timeout;
  }

  private handleStateChanged(): void {
    const isPostVoid: boolean = !!this.props.businessState.stateValues.get("transaction.postVoid");
    const printerResponseCode: FiscalResponseCode = this.props.deviceStatus && this.props.deviceStatus.fiscalStatus ?
          this.props.deviceStatus.fiscalStatus.responseCode : undefined;
    this.fiscalPrinterList = this.props.configuredPrinters && getFiscalPrinterList(this.props.configuredPrinters);
    if (printerResponseCode && this.isPrinterStatusOfflineOrRejected(printerResponseCode) && !!isPostVoid === true) {
        this.setState({isFiscalPrinterOffline: true,
          businessState: this.props.businessState,
          modalVisible: false,
          isPostVoid
        });
    } else if (printerResponseCode === FiscalResponseCode.MalformedRequest) {
        this.setState({isFiscalPrinterOffline: false,
          businessState: this.props.businessState,
          modalVisible: false,
          isPostVoid: true
        });
    } else if (!isPostVoid && printerResponseCode && (this.isPrinterStatusOfflineOrRejected(printerResponseCode) ||
        printerResponseCode === FiscalResponseCode.NotRefundable)) {
      this.setState({isPostVoid,
        businessState: this.props.businessState,
        modalVisible: false,
        isFiscalPrinterOffline: this.isPrinterStatusOfflineOrRejected(printerResponseCode),
        isShowSelectPrinter: this.fiscalPrinterList && this.fiscalPrinterList.length > 1,
        isNotRefundable: printerResponseCode === FiscalResponseCode.NotRefundable
      });
    } else if (!isPostVoid && printerResponseCode && printerResponseCode === FiscalResponseCode.Accepted) {
      setTimeout(() => {
        this.setState({isPostVoid,
          businessState: this.props.businessState,
          modalVisible: false,
          isFiscalPrinterOffline: false
        });
    }, 100);
    } else if (this.props.noPrinterExistsToPostVoid) {
        this.setState({isPostVoid: true,
          businessState: this.props.businessState,
          modalVisible: false,
          isFiscalPrinterOffline: false
        });
    } else {
      this.setState({modalVisible: false});
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    deviceIdentity: state.settings.deviceIdentity,
    businessState: state.businessState,
    deviceStatus: state.deviceStatus,
    configuredPrinters: state.receipt.configuredPrinters,
    featureActionButtonProps: state.uiState.featureActionButtonProps,
    chosenPrinterId: state.receipt.chosenPrinterId,
    uiState: state.uiState
  };
};

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request,
  isSelectPrinterFlow: isSelectPrinterFlow.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof PrinterErrorScreen>()(PrinterErrorScreen));
