import * as React from "react";
import { InteractionManager, View } from "react-native";
import { WebView } from "react-native-webview";
import { WebViewErrorEvent, WebViewNavigationEvent } from "react-native-webview/lib/WebViewTypes";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IPrintResult } from "@aptos-scp/scp-component-rn-device-services";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  DISCONNECT_TAX_REFUND_EVENT,
  IReceiptTypeChoices,
  OPEN_TAX_REFUND_UI_EVENT,
  ReceiptCategory,
  SKIP_TAX_REFUND_EVENT,
  TaxRefundIssuingState,
  TAX_REFUND_DEFERRED_EVENT,
  TAX_REFUND_PRINT_STATUS_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation } from "../../actions";
import { AppState, BusinessState, RetailLocationsState, SettingsState, UiState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import Spinner from "../common/Spinner";
import { getPrintStatusFromPrintResult, isFranceLocation, warnBeforeLosingChanges } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { TaxFreeScreenProps } from "./interfaces";
import { taxFreeStyles } from "./styles";

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface StateProps {
  settings: SettingsState;
  deviceIdentity: DeviceIdentity;
  stateValues: Map<string, any>;
  businessState: BusinessState;
  uiState: UiState;
  retailLocations: RetailLocationsState;
}

interface Props extends TaxFreeScreenProps, StateProps, DispatchProps, NavigationScreenProps<"taxFree"> {}

interface State {
  webViewData: string;
  url: string;
  isPrinting: boolean;
  displayBackButton: boolean;
}

class TaxFreeScreen extends React.Component<Props, State> {
  private styles: any;

  private backButtonTimeout: number;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(taxFreeStyles());

    this.state = {
      webViewData: undefined,
      url: undefined,
      isPrinting: false,
      displayBackButton: true
    };
  }

  public componentDidMount(): void {
    if (this.props.stateValues && this.props.stateValues.get("TaxRefundSession.isPrinting")) {
      this.setState({webViewData: undefined, isPrinting: true, displayBackButton: false},
          this.startPrinting.bind(this));
    } else if (this.props.originalTransaction) {
      const uiInputs: UiInput[] = [];
      uiInputs.push(new UiInput(UiInputKey.RETRIEVED_TRANSACTION, this.props.originalTransaction));
      this.props.performBusinessOperation(this.props.deviceIdentity, TAX_REFUND_DEFERRED_EVENT, uiInputs);
    } else {
      this.props.performBusinessOperation(this.props.deviceIdentity, OPEN_TAX_REFUND_UI_EVENT, []);
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    const stateValues = this.props.stateValues;
    const nonContextualData = this.props.businessState.nonContextualData;
    const webViewData = nonContextualData && nonContextualData.get(CollectedDataKey.TaxRefundWebviewData);
    const previousWebViewData = prevProps.businessState.nonContextualData &&
        prevProps.businessState.nonContextualData.get(CollectedDataKey.TaxRefundWebviewData);
    const url = nonContextualData && nonContextualData.get(CollectedDataKey.TaxRefundWebviewUrl);

    const prevStateValues = prevProps.businessState.stateValues;

    const transactionClosed: boolean = !prevStateValues.get("transaction.closed") &&
        !!stateValues.get("transaction.closed");

    const transactionCleared: boolean = prevStateValues.get("transaction.id") && !stateValues.get("transaction.id");

    if (webViewData && !previousWebViewData && url) {
      this.setState({webViewData, url});
    }

    if (transactionClosed || transactionCleared) {
      this.props.navigation.dispatch(popTo("main"));
    } else if (!prevProps.stateValues.get("TaxRefundSession.error") &&
               !!this.props.stateValues.get("TaxRefundSession.error")) {
      this.handleBack();
    } else if (!prevProps.stateValues.get("TaxRefundSession.isCompletedOrSkipped") &&
               stateValues.get("TaxRefundSession.isCompletedOrSkipped")) {
      this.proceedToReceiptSummary();
    }

    this.handleStartPrinting(prevProps);

    this.handleDisableBackButton(prevProps);

  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          title={I18n.t("taxFree")}
          isVisibleTablet={Theme.isTablet}
          backButton={this.state.displayBackButton && {
            name: "Back",
            action: () => warnBeforeLosingChanges(!!this.state.webViewData, this.handleBack)
          }}
        />
        <View style={[{flex: 1}, this.styles.optionsRoot]}>
        {!!this.state.webViewData &&
          <WebView
            source={{
              html: this.state.webViewData,
              baseUrl: this.state.url
            }}
            useWebKit={true}
            onError={this.onError.bind(this)}
            onLoad={this.onLoad.bind(this)}
            javaScriptEnabled={true}
            style={{flex: 1}}
          />
        }
        {!this.state.webViewData &&
          <Spinner size={0} containerStyle={this.styles.spinnerContainer}/>
        }
        </View>
      </BaseView>
    );
  }

  public renderHeaderForPrintScreen(): JSX.Element {
    return (<Header title={I18n.t("taxFree")} isVisibleTablet={Theme.isTablet} />);
  }

  private handleStartPrinting(prevProps: Props): void {
    if (!prevProps.stateValues.get("TaxRefundSession.isPrinting") &&
        this.props.stateValues.get("TaxRefundSession.isPrinting")) {
      this.setState({webViewData: undefined, isPrinting: true, displayBackButton: false},
          this.startPrinting.bind(this));
      if (this.backButtonTimeout) {
        clearTimeout(this.backButtonTimeout);
        this.backButtonTimeout = undefined;
      }
    }
  }

  private handleDisableBackButton(prevProps: Props): void {
    if (prevProps.stateValues.get("TaxRefundSession.issuingState") !== TaxRefundIssuingState.Issuing &&
        this.props.stateValues.get("TaxRefundSession.issuingState") === TaxRefundIssuingState.Issuing) {
      //disable back button for 30 seconds to not allow going back immediately after issuing begins
      //NOTE: Do not remove, this is a global blue requirement
      this.setState({displayBackButton: false},
          () => this.backButtonTimeout = setTimeout(this.toggleBackButtonOn.bind(this), 30000));
    }
  }

  private async startPrinting(): Promise<void> {
    const stateValues = this.props && this.props.businessState && this.props.businessState.stateValues;
    if (this.state.isPrinting && stateValues && !stateValues.get("TaxRefundSession.isCompletedOrSkipped")) {
      const documentIdentifier: string = stateValues.get("TaxRefundSession.documentIdentifier");
      this.props.navigation.push("genericPrinter", {
        onFinish: this.handlePrintResult.bind(this),
        header: this.renderHeaderForPrintScreen(),
        dataUrl: stateValues.get("TaxRefundSession.contentAsDataUrl"),
        documentName: `${documentIdentifier}.pdf` || "TaxFreeForm.pdf"
      });
    }

  }

  private handlePrintResult(result: IPrintResult): void {
    this.setState({isPrinting: false});
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.PRINT_STATUS, getPrintStatusFromPrintResult(result)));
    this.props.performBusinessOperation(this.props.deviceIdentity, TAX_REFUND_PRINT_STATUS_EVENT, uiInputs);
    this.props.navigation.dispatch(popTo("taxFree"));
  }

  private onError(error: WebViewErrorEvent): void {
    //TODO: Handle errors from webview
  }

  private onLoad(e: WebViewNavigationEvent): void {
    //TODO: Handle errors from webview
  }

  private proceedToReceiptSummary = (): void => {
    let receiptCategory: ReceiptCategory = this.getReceiptSessionCategory() || ReceiptCategory.Receipt;
    if (this.checkOnlyFullTaxEnabled()) {
      receiptCategory = ReceiptCategory.Invoice;
    }
    if (isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
      receiptCategory = ReceiptCategory.VatReceipt;
    }
    InteractionManager.runAfterInteractions(() =>
        this.props.navigation.replace("receiptSummary", { receiptCategory }));
  }

  private checkOnlyFullTaxEnabled(): boolean {

    const functionalBehavior = this.props.settings.configurationManager.getFunctionalBehaviorValues();
    const receiptTypeChoices: IReceiptTypeChoices = functionalBehavior.receipt.typeChoices;

    if (receiptTypeChoices && !receiptTypeChoices.vatReceipt && !receiptTypeChoices.fullPageInvoice &&
        !receiptTypeChoices.standardReceipt && !receiptTypeChoices.japanRSSReceipt &&
        receiptTypeChoices.fullTaxInvoice) {
      return true
    } else {
      return false
    }
  }

  private toggleBackButtonOn = (): void => {
    const stateValues = this.props && this.props.businessState && this.props.businessState.stateValues;
    if (stateValues && !this.state.isPrinting && !this.state.displayBackButton) {
      this.setState({displayBackButton: true});
    }
    this.backButtonTimeout = undefined;
  }

  private handleBack = (): void => {
    this.setState({webViewData: undefined});
    this.props.performBusinessOperation(this.props.deviceIdentity, SKIP_TAX_REFUND_EVENT, []);
    this.requestDisconnect();
  }

  private requestDisconnect = (): void => {
    this.props.performBusinessOperation(this.props.deviceIdentity, DISCONNECT_TAX_REFUND_EVENT, []);
  }

  private getReceiptSessionCategory(): ReceiptCategory {
    return this.props.stateValues &&
        this.props.stateValues.get("ReceiptSession.receiptCategory");
  }

}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    deviceIdentity: state.settings.deviceIdentity,
    stateValues: state.businessState && state.businessState.stateValues,
    businessState: state.businessState,
    uiState: state.uiState,
    retailLocations: state.retailLocations
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(withMappedNavigationParams<typeof TaxFreeScreen>()(TaxFreeScreen));
