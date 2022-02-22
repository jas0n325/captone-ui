import * as React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { DeviceIdentity, IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CLOSE_TERMINAL_EVENT,
  IFeatureAccessConfig,
  NO_SALE_EVENT,
  OPEN_TERMINAL_EVENT,
  POST_VOID_TRANSACTION_EVENT,
  SEARCH_POST_VOIDABLE_TRANSACTION_EVENT,
  TENDER_EXCHANGE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { PrinterType, TenderType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import { AppState, BusinessState, UiState, UI_MODE_STORE_OPERATION } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { getFeatureAccessConfig, getPrinterData } from "../common/utilities/configurationUtils";
import { popTo } from "../common/utilities/navigationUtils";
import VectorIcon from "../common/VectorIcon";
import { IFiscalPrinterTypeAndDataCheck } from "../fiscalPrinter/interface";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { storeOperationsScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  stateValues: Map<string, any>;
  configManager: IConfigurationManager;
  uiState: UiState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends StateProps, DispatchProps, NavigationScreenProps<"storeOperations"> {}

class StoreOperationsScreen extends React.Component<Props> {
  private styles: any;
  private isFiscalPrinterType: boolean;
  private noSaleFeaturesAccessConfig: IFeatureAccessConfig;
  private isTillManagementEnabled: boolean;

  public constructor(props: Props) {
    super(props);

    this.isFiscalPrinterType = this.isFiscalPrinter();
    this.noSaleFeaturesAccessConfig = getFeatureAccessConfig(this.props.configManager, NO_SALE_EVENT);
    this.isTillManagementEnabled = this.tillManagementEnabled();

    this.styles = Theme.getStyles(storeOperationsScreenStyles());
    this.handleNoSale = this.handleNoSale.bind(this);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_STORE_OPERATION);
  }

  public componentDidUpdate(prevProps: Props): void {
    this.handleTerminalStateChanged(prevProps);

    if (this.businessOperationCompletedSuccessfully(prevProps)) {
      if (this.props.businessState.eventType === TENDER_EXCHANGE_EVENT) {
        this.props.navigation.push("tenderExchange");
      }
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
          title={I18n.t("storeOperations")}
          backButton={{
            name: "Back",
            title: Theme.isTablet ? I18n.t("basket") : undefined,
            action: this.pop
          }}
        />
        <ScrollView
          style={[Theme.isTablet ? this.styles.screen : {}, this.styles.buttonsArea]}
          contentContainerStyle={this.styles.fill}
        >
          { this.terminalIsOpen && this.renderOpenTerminalButtons() }
          { !this.terminalIsOpen && this.renderCloseTerminalButtons() }
        </ScrollView>
      </BaseView>
    );
  }

  private renderOpenTerminalButtons = (): React.ReactNode => {
    const postVoidAllowed: boolean = this.props.uiState.isAllowed(SEARCH_POST_VOIDABLE_TRANSACTION_EVENT) &&
        this.props.uiState.isAllowed(POST_VOID_TRANSACTION_EVENT);

    return (
      <>
        { this.renderStoreOperationButton(this.handleCloseTerminal, "closeTerminal") }
        {
          this.isFiscalPrinterType &&
          this.renderStoreOperationButton(this.handleFiscalPrinter, "fiscalPrinter")
        }
        {
          this.noSaleFeaturesAccessConfig && this.noSaleFeaturesAccessConfig.enabled &&
          this.renderStoreOperationButton(this.handleNoSale, "noSale")
        }
        {
          postVoidAllowed &&
          this.renderStoreOperationButton(this.handlePostVoid, "postVoid")
        }
        {
          this.props.uiState.isAllowed(TENDER_EXCHANGE_EVENT) &&
          this.renderStoreOperationButton(this.handleTenderExchange, "tenderExchange")
        }
        { this.isTillManagementEnabled && this.renderStoreOperationButton(this.handleOpenTillIn, "tillManagement") }
      </>
    );
  }

  private renderCloseTerminalButtons = (): React.ReactNode => {
    return (
      <>
        { this.renderStoreOperationButton(this.handleOpenTerminal, "openTerminal") }
      </>
    );
  }

  private renderStoreOperationButton = (buttonAction: () => void, buttonTextTranslationCode: string): JSX.Element => {
    return (
      <TouchableOpacity style={this.styles.operationButton} onPress={buttonAction} >
        <View style={this.styles.operationButtonContents}>
          <Text style={this.styles.operationButtonText}>
            {I18n.t(buttonTextTranslationCode)}
          </Text>
          <VectorIcon
            name="Forward"
            stroke={this.styles.chevronIcon.color}
            height={this.styles.chevronIcon.height}
            width={this.styles.chevronIcon.width}
          />
        </View>
      </TouchableOpacity>
    );
  }

  private tillManagementEnabled(): boolean {
    const storeOperationsBehaviors = this.props.configManager.getFunctionalBehaviorValues().storeOperationsBehaviors;

    return storeOperationsBehaviors && storeOperationsBehaviors.tillManagementButton &&
        storeOperationsBehaviors.tillManagementButton.visible;
  }

  private get terminalIsOpen(): boolean {
    return this.props.stateValues.get("TerminalSession.isOpen");
  }

  private handleOpenTerminal = (): void => {
    this.props.performBusinessOperation(this.props.deviceIdentity, OPEN_TERMINAL_EVENT, []);
  }

  private handleOpenTillIn = (): void => {
    this.props.navigation.push("tillManagement");
  }

  private handleCloseTerminal = (): void => {
    Alert.alert(
      I18n.t("closeTerminal"),
      I18n.t("areYouSureYouWantToCloseThisTerminal"),
      [
        { text: I18n.t("no"), style: "cancel" },
        {
          text: I18n.t("yes"),
          onPress: () => this.props.performBusinessOperation(this.props.deviceIdentity, CLOSE_TERMINAL_EVENT, [])
        }
      ],
      { cancelable: false }
    );
  }

  private handleFiscalPrinter = (): void => {
    this.props.navigation.push("fiscalPrinter");
  }

  private handleTerminalStateChanged(prevProps: Props): void {
    const terminalOpened: boolean = prevProps.stateValues && prevProps.stateValues.get("TerminalSession.isClosed") &&
                                    this.props.stateValues.get("TerminalSession.isOpen");

    const terminalClosed: boolean = prevProps.stateValues && prevProps.stateValues.get("TerminalSession.isOpen") &&
                                    this.props.stateValues.get("TerminalSession.isClosed");

    if (terminalOpened || terminalClosed) {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private isFiscalPrinter(): boolean {
    const printerData: IFiscalPrinterTypeAndDataCheck = getPrinterData(this.props.configManager);
    const printerType = printerData.printerType;
    let isFiscalPrinterType: boolean = false;
    if (printerType && printerType.length > 0 && printerType === PrinterType.Fiscal) {
      isFiscalPrinterType = true;
    }
    return isFiscalPrinterType;
  }

  private handleNoSale(): void {
    this.props.navigation.push("scanDrawer", { eventType: NO_SALE_EVENT });
  }

  private handlePostVoid = (): void => {
    this.props.navigation.push("salesHistory", { isPostVoidMode: true });
  }

  private handleTenderExchange = (): void => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.TENDER_TYPE_NAME, TenderType.Gift));
    this.props.performBusinessOperation(this.props.deviceIdentity, TENDER_EXCHANGE_EVENT, uiInputs);
  }

  private businessOperationCompletedSuccessfully(prevProps: Props): boolean {
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress) {
      return !this.props.businessState.error;
    }
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    stateValues: state.businessState.stateValues,
    configManager: state.settings.configurationManager,
    uiState: state.uiState
  };
};

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
};

export default connect(mapStateToProps, mapDispatchToProps)(StoreOperationsScreen);
