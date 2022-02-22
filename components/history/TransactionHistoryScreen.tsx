import * as React from "react";
import { Alert, InteractionManager } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  IConfigurationManager,
  UiInput,
  UIINPUT_SOURCE_BARCODE,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import {
  IReasonCodeList,
  isFeatureConfigPresentAndEnabled,
  POST_VOID_TRANSACTION_EVENT,
  ReceiptType,
  REPRINT_RECEIPT_EVENT,
  START_TAX_REFUND_VOID_EVENT,
  TAX_REFUND_VOID_EVENT,
  TenderAuthorizationState,
  TENDER_ADJUSTMENT_LINE_TYPE,
  TENDER_CHANGE_LINE_TYPE,
  TENDER_DECLINE_LINE_TYPE,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import {
  isReceiptLine as isPostedReceiptLine,
  isTenderLine,
  ITenderLine,
  ITransactionLine,
  MerchandiseTransactionClosingState
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, DataEventType } from "../../actions";
import { AppState, BusinessState, DataEventState, ModalState, UiState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { compareRenderSelectOptions, RenderSelectOptions } from "../common/FieldValidation";
import Spinner from "../common/Spinner";
import { displayReturnValue, isFiscalPrinter } from "../common/utilities";
import {
  displayTenderRoundingAdjustment,
  getFeatureAccessConfig
} from "../common/utilities/configurationUtils";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { TransactionHistoryScreenProps } from "./interfaces";
import TransactionHistoryPhone from "./phone/TransactionHistory";
import { baseViewFill } from "./styles";
import TransactionHistoryTablet from "./tablet/TransactionHistory";

interface StateProps {
  businessState: BusinessState;
  chosenReceiptType: ReceiptType;
  configurationManager: IConfigurationManager;
  deviceIdentity: DeviceIdentity;
  incomingDataEvent: DataEventState;
  uiState: UiState;
  chosenPrinterId: string;
  modalState: ModalState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props extends TransactionHistoryScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"transactionHistory"> {}

interface State {
  showReceiptFormForPostVoid: boolean;
  reasonCode: RenderSelectOptions;
}

class TransactionHistoryScreen extends React.PureComponent<Props, State> {
  private reasons: RenderSelectOptions[] = [];
  private reasonListType: string;
  private reprintReceiptAllowed: boolean = false;
  private styles: any;
  private reprintReceiptFeatureEnabled: boolean = true;
  private taxFreeVoidEnabled: boolean;
  private isTaxFreeVoid: boolean;
  private startingVoidTaxFree: boolean;
  private displayReturnValue: boolean;

  constructor(props: Props) {
    super(props);

    // Get configured reason codes
    const featureConfig = getFeatureAccessConfig(this.props.configurationManager, POST_VOID_TRANSACTION_EVENT);
    this.reasonListType = featureConfig && featureConfig.reasonCodeListType;

    if (!!this.reasonListType) {
      const configuredReasonCodes: IReasonCodeList = this.props.configurationManager.getReasonCodesValues().
          reasonCodeLists[this.reasonListType].reasonCodeDefinitions;

      // Using those, build selection list (Sorted in ascending order of reason code name)
      this.reasons = Object.keys(configuredReasonCodes)
          .map((aReasonCode: string): RenderSelectOptions => {
            return {
              code: aReasonCode,
              description: configuredReasonCodes[aReasonCode].name
            };
          })
          .sort((reason1, reason2): number => {
            return compareRenderSelectOptions(reason1, reason2);
          });
    }

    this.reprintReceiptFeatureEnabled =
        !this.props.suppressReprintReceipt && this.props.uiState.isAllowed(REPRINT_RECEIPT_EVENT);

    const allowReprintReceipt = !this.props.suppressReprintReceipt &&
        this.props.configurationManager.getFunctionalBehaviorValues().receiptReprint
        ? this.props.configurationManager.getFunctionalBehaviorValues().receiptReprint.
            allowTransactionHistoryReceiptReprint
        : false;
    //enable/disable reprint based on if the selected transaction is reprintable
    this.reprintReceiptAllowed =
        allowReprintReceipt && !!this.props.transaction.lines?.find(isPostedReceiptLine) && !this.props.isPostVoidMode;

    this.taxFreeVoidEnabled = isFeatureConfigPresentAndEnabled(TAX_REFUND_VOID_EVENT,
        this.props.configurationManager);
    this.displayReturnValue = displayReturnValue(this.props.configurationManager);

    this.styles = Theme.getStyles(baseViewFill());

    this.state = {
      showReceiptFormForPostVoid: false,
      reasonCode: undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    const closingState: MerchandiseTransactionClosingState = this.props.businessState.
        stateValues.get("transaction.closingState");

    const postVoidEnded: boolean = this.postVoidCompleted(closingState, prevProps);

    if (postVoidEnded && !this.props.businessState.error) {
      if (closingState !== MerchandiseTransactionClosingState.PostVoidFailed) {
        this.setState({ showReceiptFormForPostVoid: true });
      } else {
        /**
         * This was getting skipped during the render cycle for post voids of non integrated payment
         * transactions. setTimeout allows it to be added to the end on the execution so that it is called
         * after everything else is done and it is no longer skipped.
         */
        if (closingState !== MerchandiseTransactionClosingState.PostVoidFailed
          && !isFiscalPrinter(this.props.configurationManager, this.props.chosenPrinterId)) {
          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.dispatch(popTo("main"));
          });
        }
      }
    }

    const prevStateValues = prevProps.businessState.stateValues;
    const stateValues = this.props.businessState.stateValues;

    const transactionClosed: boolean = prevProps.businessState.inProgress && !this.props.businessState.inProgress &&
        !!stateValues.get("transaction.closed");
    const transactionCleared: boolean = prevStateValues.get("transaction.id") && !stateValues.get("transaction.id");

    if (this.isTaxFreeVoid && (transactionClosed || transactionCleared)) {
      this.props.navigation.dispatch(popTo("main"));
    }

    if (this.isTaxFreeVoid && (!prevStateValues.get("TaxRefundSession.isActive") &&
        stateValues.get("TaxRefundSession.isActive"))) {
      this.startingVoidTaxFree = false;
      this.taxFreeVoid();
    }
  }

  public render(): JSX.Element {
    const TransactionHistory = Theme.isTablet ? TransactionHistoryTablet : TransactionHistoryPhone;

    return (
      <BaseView style={this.styles.fill}>
        <TransactionHistory
          checkIsTenderChange={this.isTenderChange.bind(this)}
          checkIsTendered={this.isTendered.bind(this)}
          checkIsTenderAdjustment={this.isTenderAdjustment.bind(this)}
          chosenReceiptType={this.props.chosenReceiptType}
          incomingDataEvent={this.props.incomingDataEvent}
          isPostVoidMode={this.props.isPostVoidMode}
          onPostVoidTransaction={this.onPostVoidTransaction.bind(this)}
          onSetReasonCode={this.handleSetReasonCode.bind(this)}
          reasons={this.reasons}
          reprintReceiptAllowed={this.reprintReceiptAllowed}
          reprintReceiptFeatureEnabled={true}
          enableReprintButton = {this.reprintReceiptFeatureEnabled}
          selectedReasonCode={this.state.reasonCode}
          showReceiptFormForPostVoid={this.state.showReceiptFormForPostVoid}
          transaction={this.props.transaction}
          displayRoundingAdjustment={displayTenderRoundingAdjustment(this.props.configurationManager)}
          displayReturnValue={this.displayReturnValue}
          taxFreeVoidEnabled={this.taxFreeVoidEnabled}
          onVoidTaxFreeForm={this.onVoidTaxFreeForm.bind(this)}
          uiState={this.props.uiState}
          navigation={this.props.navigation}
          configManager={this.props.configurationManager}
          businessState={this.props.businessState}
          modalState={this.props.modalState}
          parentScene={this.props.parentScene}
          isCustomerHistory={this.props.isCustomerHistory}
        />
        {
          this.startingVoidTaxFree && !Theme.isTablet &&
          <Spinner size={0}/>
        }

      </BaseView>
    );
  }

  private isTenderChangeLineType(line: ITransactionLine): boolean {
    return line.lineType === TENDER_CHANGE_LINE_TYPE;
  }

  private isTenderDeclineLineType(line: ITransactionLine): boolean {
    return line.lineType === TENDER_DECLINE_LINE_TYPE;
  }

  private isTenderAdjustmentLineType(line: ITransactionLine): boolean {
    return line.lineType === TENDER_ADJUSTMENT_LINE_TYPE;
  }

  private isTendered(line: ITransactionLine): line is ITenderLine {
    return isTenderLine(line) && !this.isTenderChangeLineType(line) && !this.isTenderDeclineLineType(line) &&
        !this.isTenderAdjustmentLineType(line);
  }

  private isTenderChange(line: ITransactionLine): line is ITenderLine {
    return isTenderLine(line) && this.isTenderChangeLineType(line);
  }

  private isTenderAdjustment(line: ITransactionLine): line is ITenderLine {
    return isTenderLine(line) && this.isTenderAdjustmentLineType(line);
  }

  private handleSetReasonCode(newReasonCode: RenderSelectOptions): void {
    this.setState({ reasonCode: newReasonCode });
  }

  private postVoidCompleted(closingState: MerchandiseTransactionClosingState, prevProps: Props): boolean {
    return this.props.isPostVoidMode && prevProps.businessState.inProgress && !this.props.businessState.inProgress &&
        this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.Completed && (closingState === MerchandiseTransactionClosingState.PostVoidCompleted ||
        closingState === MerchandiseTransactionClosingState.PostVoidFailed);
  }

  private onPostVoidTransaction(): void {
    Alert.alert(I18n.t("postVoid"), I18n.t("postVoidConfirmationMessage"), [
      { text: I18n.t("cancel"), style: "cancel" },
      {
        text: I18n.t("okCaps"),
        onPress: () => {
          const uiInputs: UiInput[] = [];

          if (this.state.reasonCode) {
            uiInputs.push(new UiInput(UiInputKey.REASON_CODE, this.state.reasonCode.code));
            uiInputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION, this.state.reasonCode.description));
            uiInputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE, this.reasonListType));
          }

          uiInputs.push(new UiInput(
            UiInputKey.RETRIEVED_TRANSACTION,
            this.props.transaction,
            undefined,
            this.props.incomingDataEvent && this.props.incomingDataEvent.eventType === DataEventType.KeyedData ?
                UIINPUT_SOURCE_KEYBOARD : UIINPUT_SOURCE_BARCODE
        ));

          this.props.performBusinessOperation(this.props.deviceIdentity, POST_VOID_TRANSACTION_EVENT, uiInputs);
        }
      }
    ], { cancelable: true });
  }

  private onVoidTaxFreeForm(): void {
    this.isTaxFreeVoid = true;
    this.startingVoidTaxFree = true;
    const uiInputs: UiInput[] = [];

    uiInputs.push(new UiInput(
      UiInputKey.RETRIEVED_TRANSACTION,
      this.props.transaction,
      undefined,
      this.props.incomingDataEvent && this.props.incomingDataEvent.eventType === DataEventType.KeyedData ?
          UIINPUT_SOURCE_KEYBOARD : UIINPUT_SOURCE_BARCODE
    ));

    this.props.performBusinessOperation(this.props.deviceIdentity, START_TAX_REFUND_VOID_EVENT, uiInputs);
  }

  private taxFreeVoid = () => {
    const uiInputs: UiInput[] = [];

    uiInputs.push(new UiInput(
      UiInputKey.RETRIEVED_TRANSACTION,
      this.props.transaction,
      undefined,
      this.props.incomingDataEvent && this.props.incomingDataEvent.eventType === DataEventType.KeyedData ?
          UIINPUT_SOURCE_KEYBOARD : UIINPUT_SOURCE_BARCODE
    ));

    this.props.performBusinessOperation(this.props.deviceIdentity, TAX_REFUND_VOID_EVENT, uiInputs);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    chosenReceiptType: state.receipt.chosenReceiptType,
    configurationManager: state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity,
    incomingDataEvent: state.dataEvent,
    chosenPrinterId: state.receipt.chosenPrinterId,
    uiState: state.uiState,
    modalState: state.modalState
  };
};

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof TransactionHistoryScreen>()(TransactionHistoryScreen));
