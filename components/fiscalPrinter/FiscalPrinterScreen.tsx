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
import { AppState, BusinessState, DeviceStatusState, UI_MODE_STORE_OPERATION } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import ToastPopUp from "../common/ToastPopUp";
import { getFiscalPrinterList } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import {
  getReportToastType,
  isFiscalPrinterOperationCompleted,
  isFiscalPrinterZReportRun,
  isFiscalReportType,
  isPrinterReadyToSyncData,
  isPrinterStatusSuccess,
  isQueryPrinterStatus,
  isSyncCompleted
} from "../common/utilities/utils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { FiscalPrinterSpinnerTimeout, HeaderSyncType } from "./constants";
import { fiscalPrinterScreenStyles } from "./styles";
import { activityIndicatorColor } from "../styles";

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

interface Props extends StateProps, DispatchProps, NavigationScreenProps<"fiscalPrinter"> {}

interface State {
  modalVisible: boolean;
  deviceStatus: DeviceStatusState;
  activityIndicatorText: string;
  tempInfoMessage: string;
  action: string;
  abortedStatus: boolean;
}

class FiscalPrinterScreen extends React.Component<Props, State> {
  private styles: any;
  private isHandleSyncData: boolean;
  private fiscalPrinterList: ReceiptPrinter[];
  private reportType: string;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(fiscalPrinterScreenStyles());
    this.isHandleSyncData = false;
    this.fiscalPrinterList = undefined;
    this.reportType = undefined;
    this.state = {
      modalVisible: false,
      deviceStatus: undefined,
      activityIndicatorText: undefined,
      tempInfoMessage: undefined,
      action: undefined,
      abortedStatus: false
   };

    this.renderZReportButton = this.renderZReportButton.bind(this);
    this.renderXReportButton = this.renderXReportButton.bind(this);
    this.renderSyncDataButton = this.renderSyncDataButton.bind(this);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_STORE_OPERATION);
    this.props.getConfiguredPrinters(true);
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevState.deviceStatus && prevProps.deviceStatus !== prevState.deviceStatus
        && isFiscalPrinterOperationCompleted(prevProps.deviceStatus)  ) {
      this.handleStateChanged();
   }
 }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("fiscalPrinter")}
          backButton={{
            name: "Back",
            title: Theme.isTablet && I18n.t("storeOperations"),
            action: (): void => { this.props.navigation.dispatch(popTo("storeOperations")); }
          }}
        />
        <KeyboardAwareScrollView style={Theme.isTablet ? this.styles.tabletRoot : this.styles.root}>
          <Modal
            transparent={false}
            animationType={"none"}
            visible={this.state.modalVisible}
          >
            <View style={this.styles.modalBackground}>
              {this.renderSpinnerModal()}
            </View>
          </Modal>
          <View style={[this.styles.containerView, this.styles.paddingStyle]}>
            { this.renderXReportButton() }
            { this.renderZReportButton() }
          </View>
          { this.renderSyncDataButton() }
        </KeyboardAwareScrollView>
        {
          this.state.tempInfoMessage &&
              <ToastPopUp textToDisplay={this.state.tempInfoMessage} hidePopUp={this.hideToastPopUp} />
        }
      </BaseView>
    );
  }

  private handleStateChanged(): void {
    if (this.props.deviceStatus) {
      const { statusCode, reportType, fiscalStatus } = this.props.deviceStatus;

      if (reportType && isFiscalReportType(reportType) && isPrinterStatusSuccess(fiscalStatus)) {
        const toastReportType = getReportToastType(reportType);
        this.setState({tempInfoMessage: I18n.t("FiscalPrintReportSuccesful", {
            report: toastReportType}),
            modalVisible: false, deviceStatus: this.props.deviceStatus});
        this.syncSuccess();
      } else if (statusCode && !isPrinterStatusSuccess(fiscalStatus) && !this.state.abortedStatus) {
        this.setState({modalVisible: false, deviceStatus: this.props.deviceStatus});
        this.props.navigation.push("fiscalSyncReportError");
      } else if (statusCode
          && isPrinterStatusSuccess(fiscalStatus)
          && !isFiscalPrinterZReportRun(fiscalStatus)
          && isQueryPrinterStatus(fiscalStatus)
          && !this.state.abortedStatus ) {
        this.setState({modalVisible: false, deviceStatus: this.props.deviceStatus});
        this.props.navigation.push("fiscalSyncReportError");
      } else if (isPrinterReadyToSyncData(fiscalStatus) && ! this.isHandleSyncData) {
        this.setState({deviceStatus: this.props.deviceStatus});
        this.handleSyncData();
      } else if (fiscalStatus && isPrinterStatusSuccess(fiscalStatus) && isSyncCompleted(fiscalStatus.requestType) &&
          !this.state.abortedStatus) {
        this.setState({tempInfoMessage: I18n.t("syncDataSuccesful"), modalVisible: false,
            deviceStatus: this.props.deviceStatus});
        this.syncSuccess();
      } else if (this.state.abortedStatus) {
        this.setState({deviceStatus: this.props.deviceStatus});
      }
    }
  }

  private syncSuccess(): void {
    this.props.getConfiguredPrinters(true);
    this.props.navigation.dispatch(popTo("fiscalPrinter"));
  }

  private abortAction(): void {
    const inputs: UiInput[] = [];
    this.isHandleSyncData = false;
    this.setState({abortedStatus: true,  deviceStatus: this.props.deviceStatus});
    inputs.push(new UiInput(UiInputKey.PRINTER, this.props.chosenPrinterId));
    this.props.performBusinessOperation(this.props.deviceIdentity,
      SYNC_FISCAL_PRINTER_ABORT_EVENT, inputs);
  }

  private renderSpinnerModal(): JSX.Element {
    const {deviceStatus} = this.props;
    return (
      <View style={this.styles.activityIndicatorContainerView}>
        <Text style={this.styles.printingText}>{this.state.activityIndicatorText}</Text>
        <ActivityIndicator
          size="large"
          style={this.styles.spinnerStyle}
          animating={true}
          color={activityIndicatorColor}
        />
        {
          !isFiscalReportType(this.state.action) &&
          <TouchableOpacity
            style={this.styles.btnTertiary}
            onPress={() => {
              this.setState({ modalVisible: false, deviceStatus });
              if (this.state.action === HeaderSyncType.SyncData) {
                setTimeout(() => {
                  this.abortAction();
                }, FiscalPrinterSpinnerTimeout); }
            }}
          >
            <Text style={this.styles.btnTertiaryText}>{I18n.t("cancel")}</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }

  private renderZReportButton(): JSX.Element {
    return (
      <TouchableOpacity
        style={[this.styles.actions, this.styles.btnSeconday]}
        onPress={() => this.handleReport("printZReport")}
      >
        <Text style={this.styles.btnSecondayText}>{I18n.t("printZReport")}</Text>
      </TouchableOpacity>
    );
  }

  private renderXReportButton(): JSX.Element {
    return (
      <TouchableOpacity
        style={[this.styles.actions, this.styles.btnSeconday]}
        onPress={() => this.handleReport("printXReport")}
      >
        <Text style={this.styles.btnSecondayText}>{I18n.t("printXReport")}</Text>
      </TouchableOpacity>
    );
  }

  private renderSyncDataButton(): JSX.Element {
    return (
      <View style={[this.styles.footerContainer, this.styles.paddingStyle]}>
        <Text style={this.styles.syncDataToPrinterStyle}>{I18n.t("syncDataToPrinter")}</Text>
        <TouchableOpacity
          style={[this.styles.actions, this.styles.btnPrimary, this.styles.paddingStyle]}
          onPress={() => this.selectPrinterForSync()}
        >
          <Text style={this.styles.btnPrimaryText}>{I18n.t("syncData")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  private hideToastPopUp = (): void => {
    this.setState({ tempInfoMessage: undefined });
  }

  private handleReport = (printReport: string): void => {
    this.fiscalPrinterList = getFiscalPrinterList(this.props.configuredPrinters);
    this.props.setChosenPrinterId(undefined);
    this.reportType = printReport;
    if (this.fiscalPrinterList && this.fiscalPrinterList.length > 1) {
      this.props.navigation.push("receiptPrinterChoice", {
        onContinue: this.handleReportOperation,
        onCancel: this.backButtonOperation,
        isFilterFiscalPrinter: true
      });
    } else if (this.fiscalPrinterList && this.fiscalPrinterList.length === 1) {
      this.handleReportOperation();
    }
  }

  private handleReportOperation = (): void =>  {
    const inputs: UiInput[] = [];
    const printerId: string = this.fiscalPrinterList.length > 1
        ? this.props.chosenPrinterId : this.fiscalPrinterList[0].id ;
    if (printerId && this.reportType) {
      this.setState({modalVisible: true,
          action: this.reportType,
          activityIndicatorText: I18n.t("printing"),
          deviceStatus: this.props.deviceStatus
      });
      inputs.push(new UiInput(UiInputKey.PRINTER, printerId));
      inputs.push(new UiInput(UiInputKey.ReportType, this.reportType));

      setTimeout(() => {
        this.props.performBusinessOperation(this.props.deviceIdentity, this.reportType, inputs);
      }, FiscalPrinterSpinnerTimeout);
    }
  }

  private backButtonOperation = (): void => {
    this.props.setChosenPrinterId(undefined);
    this.props.navigation.pop();
  }

  private handleSyncData(): void {
    const inputs: UiInput[] = [];
    const printerId: string = this.fiscalPrinterList.length > 1
        ? this.props.chosenPrinterId : this.fiscalPrinterList[0].id ;
    if (printerId) {
      inputs.push(new UiInput(UiInputKey.PRINTER, printerId));
      this.isHandleSyncData = true;

      setTimeout(() => {
        this.props.performBusinessOperation(this.props.deviceIdentity, SYNC_FISCAL_PRINTER_DATA_EVENT, inputs);
        }, FiscalPrinterSpinnerTimeout);
    }
  }

  private selectPrinterForSync = (): void => {
    this.fiscalPrinterList = getFiscalPrinterList(this.props.configuredPrinters);
    this.props.setChosenPrinterId(undefined);
    if (this.fiscalPrinterList && this.fiscalPrinterList.length > 1) {
      this.props.navigation.push("receiptPrinterChoice", {
        onContinue: this.handlePrinterStatus,
        onCancel: this.backButtonOperation,
        isFilterFiscalPrinter: true
      });
    }  else if (this.fiscalPrinterList && this.fiscalPrinterList.length === 1) {
      this.handlePrinterStatus();
    }
  }

  private handlePrinterStatus = (): void => {
    const inputs: UiInput[] = [];
    const printerId: string = this.fiscalPrinterList.length > 1
        ? this.props.chosenPrinterId : this.fiscalPrinterList[0].id ;
    this.isHandleSyncData = false;
    if (printerId) {
      inputs.push(new UiInput(UiInputKey.PRINTER, printerId));
      this.setState({
        modalVisible: true,
        action: HeaderSyncType.SyncData,
        abortedStatus: false,
        deviceStatus: this.props.deviceStatus,
        activityIndicatorText: I18n.t("syncingData")
      });
      setTimeout(() => {
        this.props.performBusinessOperation(this.props.deviceIdentity, FISCAL_PRINTER_STATUS_EVENT, inputs);
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
    configuredPrinters: state.receipt.configuredPrinters,
    chosenPrinterId: state.receipt.chosenPrinterId
  };
};

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request,
  getConfiguredPrinters: getConfiguredPrinters.request,
  setChosenPrinterId: setChosenPrinterId.request
};

export default connect(mapStateToProps, mapDispatchToProps)(FiscalPrinterScreen);
