import * as React from "react";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";

import { DeviceIdentity, IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  FISCAL_PRINTER_STATUS_EVENT,
  SYNC_FISCAL_PRINTER_ABORT_EVENT,
  SYNC_FISCAL_PRINTER_DATA_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  getConfiguredPrinters,
  ReceiptPrinter,
  setChosenPrinterId,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  DeviceStatusState,
  UI_MODE_RECEIPT_PRINTER_CHOICE,
  UI_MODE_STORE_OPERATION
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import ToastPopUp from "../common/ToastPopUp";
import {
  getFiscalPrinterList,
  isFiscalPrinterZReportRun,
  isFiscalReportType,
  isPrinterReadyToSyncData,
  isPrinterStatusSuccess,
  isQueryPrinterStatus,
  isSyncCompleted
} from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { FiscalPrinterSpinnerTimeout, HeaderSyncType, ReportType } from "./constants";
import { fiscalPrinterScreenStyles } from "./styles";
import { activityIndicatorColor } from "../styles";
import ErrorIcon from "./FiscalPrintErrorIcon";

interface StateProps {
  deviceIdentity: DeviceIdentity;
  retailLocationCurrency: string;
  businessState: BusinessState;
  configurationManager: IConfigurationManager;
  stateValues: Map<string, any>;
  deviceStatus: DeviceStatusState;
  chosenPrinterId: string;
  configuredPrinters: ReceiptPrinter[];
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  getConfiguredPrinters: ActionCreator;
  setChosenPrinterId: ActionCreator;
}

interface Props extends StateProps, DispatchProps, NavigationScreenProps<"fiscalSyncReportError"> { }

interface State {
  deviceStatus: DeviceStatusState;
  modalVisible: boolean;
  activityIndicatorText: string;
  abortedStatus: boolean;
  tempInfoMessage: string;
  action: string;
}
interface IFiscalErrorMessage {
  errorMessage: string;
  headerTitle: string;
}
class FiscalSyncReportErrorScreen extends React.Component<Props, State> {
  private styles: any;
  private isHandleSyncData: boolean;
  private fiscalPrinterList: ReceiptPrinter[];

  public constructor(props: Props) {
    super(props);
    this.isHandleSyncData = false;
    this.styles = Theme.getStyles(fiscalPrinterScreenStyles());
    this.state = {
      deviceStatus: undefined,
      tempInfoMessage: undefined,
      modalVisible: false,
      activityIndicatorText: undefined,
      abortedStatus: false,
      action: undefined
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_STORE_OPERATION);
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.deviceStatus !== prevState.deviceStatus) {
      this.handleTerminalStateChanged();
    }
  }

  public render(): JSX.Element {
    const { errorMessage, headerTitle } = this.printErrorMessage();
    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={headerTitle}
          backButton={{
            name: "Back",
            title: Theme.isTablet && I18n.t("fiscalPrinter"),
            action: (): void => { this.backButtonAction(); }
          }}
          rightButton={(this.isSyncZReportError()) ? {
            title: I18n.t("okCaps"),
            action: () => this.backButtonAction()
          } : {
            title: I18n.t("retry"),
            action: () => this.retryAction()
          }
          }
        />
        <KeyboardAwareScrollView style={Theme.isTablet ? this.styles.tabletRoot : this.styles.root}>
          <Modal
            transparent={false}
            animationType={"none"}
            visible={this.state.modalVisible}>
            <View style={this.styles.modalBackground}>
              {this.renderSpinnerModal()}
            </View>
          </Modal>
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
        </KeyboardAwareScrollView>
        {
          this.state.tempInfoMessage &&
          <ToastPopUp textToDisplay={this.state.tempInfoMessage} hidePopUp={this.hideToastPopUp} />
        }
      </BaseView>
    );
  }

  private renderSpinnerModal(): JSX.Element {
    const { deviceStatus } = this.props;
    return (
      <View style={this.styles.activityIndicatorContainerView}>
        <Text style={this.styles.printingText}>{this.state.activityIndicatorText}</Text>
        <ActivityIndicator
          size="large"
          style={this.styles.spinnerStyle}
          animating={true}
          color={activityIndicatorColor}
        />
        {!isFiscalReportType(this.state.action) &&
          <TouchableOpacity
            style={this.styles.btnTertiary}
            onPress={() => {
              this.setState({ modalVisible: false, deviceStatus });
              if (this.state.action === HeaderSyncType.SyncData) {
                setTimeout(() => {
                  this.abortAction();
                }, FiscalPrinterSpinnerTimeout);
              }
            }
            }>
            <Text style={this.styles.btnTertiaryText}>{I18n.t("cancel")}</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }

  private backButtonAction = (): void => {
    this.props.getConfiguredPrinters(true);
    this.props.updateUiMode(UI_MODE_RECEIPT_PRINTER_CHOICE);
    this.props.navigation.pop();
  }

  private abortAction(): void {
    const inputs: UiInput[] = [];
    inputs.push(new UiInput(UiInputKey.PRINTER, this.props.chosenPrinterId));
    this.isHandleSyncData = false;
    this.setState({ abortedStatus: true, deviceStatus: this.props.deviceStatus });
    this.props.performBusinessOperation(this.props.deviceIdentity,
      SYNC_FISCAL_PRINTER_ABORT_EVENT, inputs);
  }

  private hideToastPopUp = (): void => {
    this.setState({ tempInfoMessage: undefined });
  }

  private retryAction(): void {
    const inputs: UiInput[] = [];
    this.fiscalPrinterList = getFiscalPrinterList(this.props.configuredPrinters);
    const printerId: string = this.fiscalPrinterList && this.fiscalPrinterList.length > 1
      ? this.props.chosenPrinterId : this.fiscalPrinterList[0].id;
    const reportType: string = this.props.deviceStatus.reportType;
    if (printerId) {
      inputs.push(new UiInput(UiInputKey.PRINTER, printerId));
      inputs.push(new UiInput(UiInputKey.ReportType, reportType));
      if (reportType) {
        this.setState({ modalVisible: true, action: reportType, activityIndicatorText: I18n.t("printing") });
        setTimeout(() => {
          this.props.performBusinessOperation(this.props.deviceIdentity, reportType, inputs);
        }, FiscalPrinterSpinnerTimeout);
      } else {
        this.setState({
          modalVisible: true,
          action: HeaderSyncType.SyncData,
          abortedStatus: false,
          activityIndicatorText: I18n.t("syncingData")
        });
        this.handlePrinterStatus();
      }
    }
  }

  private handlePrinterStatus(): void {
    const inputs: UiInput[] = [];
    const printerId: string = this.fiscalPrinterList && this.fiscalPrinterList.length > 1
      ? this.props.chosenPrinterId : this.fiscalPrinterList[0].id;
    if (printerId) {
      inputs.push(new UiInput(UiInputKey.PRINTER, printerId));
      this.isHandleSyncData = false;
      setTimeout(() => {
        this.props.performBusinessOperation(this.props.deviceIdentity, FISCAL_PRINTER_STATUS_EVENT, inputs);
      }, FiscalPrinterSpinnerTimeout);
    }
  }

  private printErrorMessage(): IFiscalErrorMessage {
    let errorMessage: string;
    let headerTitle: string;
    const { fiscalStatus } = this.props.deviceStatus;
    if (fiscalStatus && fiscalStatus.reportType === ReportType.PrintZReport) {
      errorMessage = I18n.t("FiscalReportError", {
        report: HeaderSyncType.ZReport
      });
      headerTitle = HeaderSyncType.ZReport;
    } else if (fiscalStatus && fiscalStatus.reportType === ReportType.PrintXReport) {
      errorMessage = I18n.t("FiscalReportError", {
        report: HeaderSyncType.XReport
      });
      headerTitle = HeaderSyncType.XReport;
    } else if (this.isSyncZReportError()) {
      errorMessage = I18n.t("FiscalSyncZReportError");
      headerTitle = HeaderSyncType.SyncData;
    } else {
      errorMessage = I18n.t("FiscalSyncError");
      headerTitle = HeaderSyncType.SyncData;
    }
    return { errorMessage, headerTitle };
  }
  private isSyncZReportError(): boolean {
    const { fiscalStatus } = this.props.deviceStatus;
    let isSyncZReportError: boolean = false;
    if (fiscalStatus
      && isQueryPrinterStatus(fiscalStatus)
      && fiscalStatus.rtDailyOpen
      && fiscalStatus.rtNoWorkingPeriod
      && !isFiscalPrinterZReportRun(fiscalStatus)) {
      isSyncZReportError = true;
    }
    return isSyncZReportError;
  }

  private handleTerminalStateChanged(): void {
    const { statusCode, reportType, fiscalStatus } = this.props.deviceStatus;
    if (isFiscalReportType(reportType) && isPrinterStatusSuccess(fiscalStatus)) {
      this.setState({ modalVisible: false, deviceStatus: this.props.deviceStatus });
      this.props.navigation.push("fiscalPrinter");
    } else if (statusCode
      && !isPrinterStatusSuccess(fiscalStatus)
      && !this.state.abortedStatus) {
      this.setState({ modalVisible: false, deviceStatus: this.props.deviceStatus });
    } else if (statusCode
      && isPrinterStatusSuccess(fiscalStatus)
      && !isFiscalPrinterZReportRun(fiscalStatus)
      && isQueryPrinterStatus(fiscalStatus)
      && !this.state.abortedStatus) {
      this.setState({ modalVisible: false, deviceStatus: this.props.deviceStatus });
    } else if (isPrinterReadyToSyncData(fiscalStatus) && !this.isHandleSyncData) {
      this.setState({ deviceStatus: this.props.deviceStatus });
      this.handleSyncData();
    } else if (fiscalStatus
      && isPrinterStatusSuccess(fiscalStatus)
      && isSyncCompleted(fiscalStatus.requestType)
      && !this.state.abortedStatus) {
      this.setState({ modalVisible: false, deviceStatus: this.props.deviceStatus });
      this.props.navigation.push("fiscalPrinter");
    } else if (this.state.abortedStatus) {
      this.setState({ deviceStatus: this.props.deviceStatus });
    }
  }

  private handleSyncData(): void {
    const inputs: UiInput[] = [];
    const printerId: string = this.fiscalPrinterList && this.fiscalPrinterList.length > 1
      ? this.props.chosenPrinterId : this.fiscalPrinterList[0].id;
    if (printerId) {
      inputs.push(new UiInput(UiInputKey.PRINTER, printerId));
      this.isHandleSyncData = true;
      setTimeout(() => {
        this.props.performBusinessOperation(this.props.deviceIdentity, SYNC_FISCAL_PRINTER_DATA_EVENT, inputs);
      }, FiscalPrinterSpinnerTimeout);
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    deviceIdentity: state.settings.deviceIdentity,
    retailLocationCurrency: state.settings.retailLocationCurrency,
    businessState: state.businessState,
    configurationManager: state.settings.configurationManager,
    stateValues: state.businessState.stateValues,
    deviceStatus: state.deviceStatus,
    chosenPrinterId: state.receipt.chosenPrinterId,
    configuredPrinters: state.receipt.configuredPrinters
  };
};

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request,
  getConfiguredPrinters: getConfiguredPrinters.request,
  setChosenPrinterId: setChosenPrinterId.request
};

export default connect(mapStateToProps, mapDispatchToProps)(FiscalSyncReportErrorScreen);
