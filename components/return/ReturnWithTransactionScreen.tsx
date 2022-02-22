import * as React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  IConfigurationManager,
  QualificationError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  AllowedReturnTypes,
  Customer,
  ENTER_RETURN_MODE_EVENT,
  EXIT_RETURN_MODE_EVENT,
  EXIT_RETURN_WITH_TRANSACTION_EVENT,
  IItemDisplayLine,
  IN_MERCHANDISE_TRANSACTION,
  OfflineReturnReference,
  SEARCH_HISTORICAL_TRANSACTIONS_EVENT,
  SELECT_TRANSACTION_FOR_RETURN_EVENT,
  SSF_TRANSACTION_HISTORY_OFFLINE_ERROR_I18N_CODE,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import {
  AppState,
  TransactionsState,
  UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import Input from "../common/Input";
import { getDisplayableDate, getFeatureAccessConfig, updateScroll } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ReturnWithTransactionScreenProps } from "./interfaces";
import { returnReceiptScreenStyles } from "./styles";
import OfflineNotice from "../common/OfflineNotice";

interface StateProps {
  configurationManager: IConfigurationManager;
  currentScreenName: string;
  customer: Customer;
  deviceIdentity: DeviceIdentity;
  displayLines: IItemDisplayLine[];
  logicalState: string;
  returnMode: boolean;
  returnWithTransaction: boolean;
  transactionForReturn: IMerchandiseTransaction;
  transactions: TransactionWithAdditionalData[];
  itemAddedFromTransactionForReturn: boolean;
  transactionState: TransactionsState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends ReturnWithTransactionScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"returnTransaction"> {}

interface State {
  referenceNumber: string;
  isScrolling: boolean;
}

class ReturnWithTransactionScreen extends React.PureComponent<Props, State> {
  private returnWithoutReceipt: boolean;
  private multipleTransactionsAllowed: boolean;
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(returnReceiptScreenStyles());

    this.state = {
      referenceNumber: undefined,
      isScrolling: false
    };

    this.returnWithoutReceipt = getFeatureAccessConfig(props.configurationManager, ENTER_RETURN_MODE_EVENT)
        .allowReturn === AllowedReturnTypes.All;

    const returnsBehaviors = props.configurationManager.getFunctionalBehaviorValues().returnsBehaviors;
    this.multipleTransactionsAllowed = returnsBehaviors && returnsBehaviors.returnWithTransactionBehaviors &&
        returnsBehaviors.returnWithTransactionBehaviors.multipleTransactionsAllowed;

    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleExitReturnMode = this.handleExitReturnMode.bind(this);
    this.handleNoReceiptReturn = this.handleNoReceiptReturn.bind(this);
    this.handleOfflineReturn = this.handleOfflineReturn.bind(this);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH);

    if (!this.multipleTransactionsAllowed && this.props.returnWithTransaction && this.props.transactionForReturn &&
        this.props.transactionForReturn.transactionId && this.props.itemAddedFromTransactionForReturn) {
      this.props.navigation.replace("returnDetails", { autoMove: true });
    } else if (this.props.offlineReturnReference && this.props.transactionState.error &&
          this.props.transactionState.error instanceof QualificationError) {
      const error: QualificationError = this.props.transactionState.error;
      const errorCode: string = error.localizableMessage.i18nCode;
      if ( errorCode === SSF_TRANSACTION_HISTORY_OFFLINE_ERROR_I18N_CODE) {
        this.handleOfflineReturn(this.props.offlineReturnReference);
      }
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    this.preserveUiModeWhenTransactionStarts(prevProps);

    if (prevProps.transactionState.inProgress && !this.props.transactionState.inProgress) {
      if (this.props.transactionState.error && this.props.transactionState.error instanceof QualificationError ) {
        const error: QualificationError = this.props.transactionState.error;
        const errorCode: string = error.localizableMessage.i18nCode;
        const collectedData: Map<string, any> = error.collectedData;
        if ( errorCode === SSF_TRANSACTION_HISTORY_OFFLINE_ERROR_I18N_CODE) {
          const offlineReference = collectedData.get("offlineReturnReference");
          setTimeout(() => Alert.alert("", I18n.t("transactionHistoryOfflineError"), [
            {text: I18n.t("cancel"), style: "cancel"},
            {text: I18n.t("ok"), onPress: () =>
                this.handleOfflineReturn(offlineReference)
            }
          ], { cancelable: false }), 500);
        }
      } else if (this.props.offlineReturnReference) {
        this.handleOfflineReturn(this.props.offlineReturnReference);
      } else {
        this.props.navigation.replace("returnWithTransactionSearchResult", {
          inputSource: this.props.transactionState.inputSource
        });
      }
    }

    if (this.multipleTransactionsAllowed && ((!prevProps.transactionForReturn && this.props.transactionForReturn) ||
        (prevProps.transactionForReturn && this.props.transactionForReturn &&
            prevProps.transactionForReturn !== this.props.transactionForReturn))) {
      this.props.navigation.replace("returnDetails", { autoMove: true });
    }

    if ((prevProps.returnMode && !this.props.returnMode) ||
        (prevProps.returnWithTransaction && !this.props.returnWithTransaction)) {
      this.props.navigation.dispatch(popTo("main"));
    }

    if (this.props.currentScreenName !== prevProps.currentScreenName && this.props.currentScreenName === "returnTransaction") {
      this.props.updateUiMode(UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH);
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("returns")}
          backButton={{ name: "Back", action: this.handleExitReturnMode }}
          isVisibleTablet={Theme.isTablet}
          returnMode={this.props.returnMode}
        />
        <OfflineNotice isScrolling={this.state.isScrolling}/>
        <View style={this.styles.base}>
          <Input
            showCamera
            value={this.state.referenceNumber}
            onChangeText={this.handleChangeText}
            placeholder={I18n.t("scanReceiptOrOrder")}
            cameraIcon={{
              icon: "Camera",
              size: this.styles.cameraIcon.fontSize,
              color: this.styles.cameraIcon.color,
              position: "right",
              style: this.styles.cameraIconPanel
            }}
            style={this.styles.inputArea}
          />
          <View style={this.styles.returnArea}>
            <View style={this.styles.returnOptionsArea}>
              {
                !this.props.transactionState.inProgress &&
                <>
                  { this.renderReturnOption(this.handleCustomerSearch.bind(this), "searchCustomer") }
                  { this.renderReturnOption(this.handleReturnSearch.bind(this), "returnSearch") }
                  { this.returnWithoutReceipt && this.renderReturnOption(this.handleNoReceiptReturn, "noReceipt") }
                </>
              }
            </View>
            {this.multipleTransactionsAllowed && this.props.transactions && this.props.transactions.length > 0 &&
            <View style={this.styles.returned}>
              <Text style={this.styles.returnedLabel}>{I18n.t("returned")}</Text>
              <FlatList
                  onScrollEndDrag={this.handleScroll.bind(this)}
                  data={this.props.transactions}
                  renderItem={({ item }) => this.renderReturnTransaction(item.transaction as IMerchandiseTransaction)}
                  keyExtractor={(item: IMerchandiseTransaction) => item.transactionId}
              />
            </View>
            }
          </View>
        </View>
      </BaseView>
    );
  }

  private renderReturnOption(action: () => void, text: string): JSX.Element {
    return (
      <TouchableOpacity style={[this.styles.btnSeconday, this.styles.returnOptionButton]} onPress={action}>
        <Text style={this.styles.btnSecondayText}>{I18n.t(text)}</Text>
      </TouchableOpacity>
    );
  }

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }

  private renderReturnTransaction(transaction: IMerchandiseTransaction): JSX.Element {
    return (
      <TouchableOpacity style={this.styles.returnedTransaction}
                        onPress={() => this.handleTransactionChosen(transaction)}>
        <Text style={this.styles.returnedTransactionTitle}>{I18n.t("transaction")}</Text>
        <Text style={this.styles.returnedTransactionNumber}>{transaction.referenceNumber}</Text>
        <Text style={this.styles.returnedTransactionDate}>{getDisplayableDate(transaction.endDateTime)}</Text>
      </TouchableOpacity>
    );
  }
  private handleChangeText(newText: string): void {
    this.setState({ referenceNumber: newText });
  }

  private handleTransactionChosen(transaction: IMerchandiseTransaction): void {
    if (this.props.transactionForReturn && this.props.transactionForReturn === transaction) {
      this.props.navigation.replace("returnDetails");
    } else {
      this.props.performBusinessOperation(this.props.deviceIdentity, SELECT_TRANSACTION_FOR_RETURN_EVENT, [
        new UiInput(UiInputKey.TRANSACTION_ID_FOR_RETURN, transaction.transactionId)
      ]);
    }
  }

  private handleCustomerSearch(): void {
    if (this.props.customer) {
      this.runCustomerSearch();
    } else {
      this.props.navigation.push("customer", {
        isTransactionStarting: false,
        assignCustomer: true,
        hideCreateCustomer: true,
        returnMode: true,
        backNavigationTitle: I18n.t("returns"),
        onExit: () => {
          if (this.props.customer) {
            this.runCustomerSearch();
          }
          this.props.navigation.dispatch(popTo("returnTransaction"));
        },
        onCancel: this.pop
      });
    }
  }

  private runCustomerSearch(): void {
    if (this.props.customer.customerNumber) {
      const uiInputs: UiInput[] = [];
      uiInputs.push(new UiInput("customerNumber", this.props.customer.customerNumber));
      this.props.performBusinessOperation(this.props.deviceIdentity, SEARCH_HISTORICAL_TRANSACTIONS_EVENT, uiInputs);
    } else {
      Alert.alert(I18n.t("returnCustomerSearchCustomerNumberRequired"), undefined,
          [{ text: I18n.t("ok") }], { cancelable: true });
    }
  }

  private handleReturnSearch(): void {
    this.props.navigation.replace("returnSearch");
  }

  private handleNoReceiptReturn(): void {
    this.props.performBusinessOperation(this.props.deviceIdentity, EXIT_RETURN_WITH_TRANSACTION_EVENT, []);
  }

  private handleOfflineReturn(offlineReturnReference?: OfflineReturnReference): void {
    this.props.performBusinessOperation(this.props.deviceIdentity, EXIT_RETURN_WITH_TRANSACTION_EVENT,
        offlineReturnReference ? [new UiInput(UiInputKey.OFFLINE_RETURN_REFERENCE, offlineReturnReference, undefined,
            offlineReturnReference.inputSource)]: []
    );
  }

  private preserveUiModeWhenTransactionStarts(prevProps: Props): void {
    // The start of a transaction causes a change in logicalState, which wipes out required uiMode, preserve it here
    if (prevProps.logicalState !== IN_MERCHANDISE_TRANSACTION &&
        this.props.logicalState === IN_MERCHANDISE_TRANSACTION) {
      this.props.updateUiMode(UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH);
    }
  }

  private handleExitReturnMode(): void {
    this.props.performBusinessOperation(this.props.deviceIdentity, EXIT_RETURN_MODE_EVENT, []);
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  configurationManager: state.settings.configurationManager,
  currentScreenName: getCurrentRouteNameWithNavigationRef(),
  deviceIdentity: state.settings.deviceIdentity,
  customer: state.businessState.stateValues && state.businessState.stateValues.get("transaction.customer"),
  displayLines: state.businessState.displayInfo && state.businessState.displayInfo.itemDisplayLines,
  logicalState: state.uiState.logicalState,
  returnMode: state.businessState.stateValues.get("ItemHandlingSession.isReturning"),
  returnWithTransaction: state.businessState.stateValues.get("ItemHandlingSession.returnWithTransaction"),
  transactionForReturn: state.businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn") &&
      state.businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn").transaction,
  transactions: state.businessState.stateValues.get("ItemHandlingSession.transactions"),
  itemAddedFromTransactionForReturn:
      state.businessState.stateValues.get("ItemHandlingSession.itemAddedFromTransactionForReturn"),
  transactionState: state.transactions
});

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof ReturnWithTransactionScreen>()(ReturnWithTransactionScreen));
