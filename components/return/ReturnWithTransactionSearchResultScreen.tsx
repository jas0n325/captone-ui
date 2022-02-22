import moment from "moment";
import * as React from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  IConfigurationManager,
  PosBusinessError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  I18nLocationValues,
  RECORD_TRANSACTION_FOR_RETURN_EVENT,
  SELECT_TRANSACTION_FOR_RETURN_EVENT,
  SSF_TRANSACTION_FOR_RETURN_COUNTRY_MISMATCH_I18N_CODE,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation } from "../../actions";
import { AppState, BusinessState, RetailLocationsState, TransactionsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import Transaction from "../common/Transaction";
import { getI18nLocation, updateScroll } from "../common/utilities/utils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ReturnWithTransactionSearchResultScreenProps } from "./interfaces";
import { returnDetailsScreen } from "./styles";
import OfflineNotice from "../common/OfflineNotice";

interface StateProps {
  businessState: BusinessState;
  configurationManager: IConfigurationManager;
  deviceIdentity: DeviceIdentity;
  retailLocationCurrency: string;
  returnMode: boolean;
  transaction: IMerchandiseTransaction;
  transactions: TransactionWithAdditionalData[];
  transactionState: TransactionsState;
  retailLocations: RetailLocationsState;
  stateValues: Map<string, any>;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props extends ReturnWithTransactionSearchResultScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"returnWithTransactionSearchResult"> {}

interface State {
  isScrolling: boolean;
}

class ReturnWithTransactionSearchResultScreen extends React.PureComponent<Props, State> {
  private businessDayDate: Date;
  private daysToRefund: number;
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(returnDetailsScreen());
    this.state = {
      isScrolling: false
    };

    const customRefundMessage = props.configurationManager.getBrandingValues().receiptStyling &&
        props.configurationManager.getBrandingValues().receiptStyling.customRefundMessage;
    if (customRefundMessage && customRefundMessage.daysToRefund > 0) {
      this.daysToRefund = customRefundMessage.daysToRefund;
    } else {
      this.daysToRefund = 0;
    }
    const stateValues = props.businessState.stateValues;
    this.businessDayDate = stateValues && stateValues.get("TerminalSession.lastActiveBusinessDay");

    this.handleTransactionChosen = this.handleTransactionChosen.bind(this);
    this.handleReturnCustomer = this.handleReturnCustomer.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.transactionState.transactions &&
        this.props.transactionState.transactions.length === 1 && !this.props.returning) {
      this.handleReturnCustomer(this.props.transactionState.transactions[0]);
      this.handleTransactionChosen(this.props.transactionState.transactions[0]);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if ((!prevProps.transaction && this.props.transaction) ||
        (prevProps.transaction && this.props.transaction && prevProps.transaction !== this.props.transaction)) {
      this.props.navigation.replace("returnDetails");
    }
    this.handleReturnCustomer = this.handleReturnCustomer.bind(this);
    this.handleRecordTransactionRejected(prevProps);
  }

  public render(): JSX.Element {
    const searchReturnedResults: boolean = this.props.transactionState.transactions &&
        !!this.props.transactionState.transactions.length;

    return (
      <BaseView style={this.styles.base}>
        <Header
          title={I18n.t("returns")}
          backButton={{
            name: "Back",
            action: this.replaceWithReturnTransaction
          }}
          isVisibleTablet={Theme.isTablet}
          returnMode={this.props.returnMode}
        />
        <OfflineNotice isScrolling={this.state.isScrolling}/>
        <View style={this.styles.root}>
          {
            !searchReturnedResults &&
            <View style={[this.styles.fill, this.styles.noResults]}>
              <Text style={this.styles.emptyList}>
                {I18n.t(this.props.transactionState.error ? "retrievalError" : "noResults")}
              </Text>
            </View>
          }
          {
            searchReturnedResults &&
            <>
              <Text style={this.styles.resultsLabel}>{I18n.t("resultsAllCaps")}</Text>
              <FlatList
                onScrollEndDrag={this.handleScroll.bind(this)}
                data={this.props.transactionState.transactions}
                renderItem={({ item }: { item: TransactionWithAdditionalData }) => {
                  return (<Transaction transaction={item.transaction as IMerchandiseTransaction}
                                       onTransactionChosen={(transaction: IMerchandiseTransaction) =>
                                           this.handleTransactionChosen(item)}
                                       displayTaxFreeDocId={false} />);
                }}
                keyExtractor={(item: IMerchandiseTransaction) => item.transactionId}
              />
            </>
          }
        </View>
      </BaseView>
    );
  }

  private handleTransactionChosen(transaction: TransactionWithAdditionalData): void {
    if (this.props.transaction && transaction.transaction &&
        this.props.transaction.transactionId === transaction.transaction.transactionId) {
      this.props.navigation.replace("returnDetails");
    } else {
      let isSelectable = true;
      let homeCurrency = true;
      if (this.daysToRefund > 0) {
        const lastDayToRefund = moment(transaction.transaction.endDateTime).add(this.daysToRefund, "days");
        isSelectable = moment(this.businessDayDate).isSameOrBefore(lastDayToRefund);
      }
      if (isSelectable) {
        const currency = transaction.transaction.transactionTotal.currency;
        if (currency && this.props.retailLocationCurrency) {
          isSelectable = currency === this.props.retailLocationCurrency;
          if (!isSelectable) {
            homeCurrency = false;
          }
        }
      }

      if (isSelectable) {
        const existingTransaction = this.props.transactions.find((item) =>
            item.transactionId === transaction.transactionId);
        if (!existingTransaction) {
          this.handleReturnCustomer(transaction);
        } else {
          this.props.performBusinessOperation(this.props.deviceIdentity, SELECT_TRANSACTION_FOR_RETURN_EVENT, [
            new UiInput(UiInputKey.TRANSACTION_ID_FOR_RETURN, transaction.transactionId)
          ]);
        }
      } else {
        this.showTransactionRejectedAlert(homeCurrency ? "transactionReturnPeriodExpired" :
            "transactionInvalidForRefund");
      }
    }
  }

  private handleRecordTransactionRejected(prevProps: Props): void {
    const showTransactionRejectedAlert: boolean = prevProps.businessState.inProgress &&
        !this.props.businessState.inProgress && (
          prevProps.businessState.eventType === RECORD_TRANSACTION_FOR_RETURN_EVENT ||
          prevProps.businessState.eventType === SELECT_TRANSACTION_FOR_RETURN_EVENT
        ) && this.props.businessState.error && this.props.businessState.error instanceof PosBusinessError &&
        this.props.businessState.error.localizableMessage.i18nCode ===
        SSF_TRANSACTION_FOR_RETURN_COUNTRY_MISMATCH_I18N_CODE;

    if (showTransactionRejectedAlert) {
      this.showTransactionRejectedAlert(SSF_TRANSACTION_FOR_RETURN_COUNTRY_MISMATCH_I18N_CODE);
    }
  }

  private showTransactionRejectedAlert(i18nCode: string): void {
    setTimeout(() => Alert.alert(I18n.t(i18nCode), undefined, [{ text: I18n.t("ok") }], { cancelable: true }), 250);
  }

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }

  private handleReturnCustomer(transactionWithAdditionalData: TransactionWithAdditionalData): void {
    const i18nLocationValue = getI18nLocation(this.props.retailLocations, this.props.configurationManager);
    if (i18nLocationValue === I18nLocationValues.Peru || i18nLocationValue === I18nLocationValues.CostaRica) {
      const originalCustomer = transactionWithAdditionalData.transaction?.customer as Customer;
      const currentCustomer = this.props.stateValues?.get("transaction.customer");
      if (currentCustomer && originalCustomer && originalCustomer.customerNumber &&
          originalCustomer.customerNumber !== currentCustomer.customerNumber) {
        setTimeout(() => Alert.alert("", I18n.t("originalSaleCustomerMessage"), [
          {
            text: I18n.t("cancel"), style: "cancel",
            onPress: () => this.props.navigation.replace("returnWithTransactionSearchResult")
          },
          {
            text: I18n.t("ok"), onPress: () =>
              this.handleReturnTransaction(transactionWithAdditionalData.transactionId, transactionWithAdditionalData.transaction?.order?.orderReferenceId)
          }
        ], { cancelable: false }), 500);
      } else {
        this.handleReturnTransaction(transactionWithAdditionalData.transactionId, transactionWithAdditionalData.transaction?.order?.orderReferenceId);
      }
    } else {
      this.handleReturnTransaction(transactionWithAdditionalData.transactionId, transactionWithAdditionalData.transaction?.order?.orderReferenceId);
    }
  }

  private handleReturnTransaction(transactionId: string, orderNumber: string): void {
    if (! orderNumber) {
      this.props.performBusinessOperation(this.props.deviceIdentity, RECORD_TRANSACTION_FOR_RETURN_EVENT, [
        new UiInput(UiInputKey.TRANSACTION_ID_FOR_RETURN, transactionId, undefined, this.props.inputSource)
      ]);
    } else {
      this.props.performBusinessOperation(this.props.deviceIdentity, RECORD_TRANSACTION_FOR_RETURN_EVENT, [
        new UiInput(UiInputKey.ORDER_NUMBER_FOR_RETURN, orderNumber, undefined, this.props.inputSource)
      ]);
    }
  }

  private replaceWithReturnTransaction = () => {
    this.props.navigation.replace("returnTransaction");
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  businessState: state.businessState,
  configurationManager: state.settings.configurationManager,
  deviceIdentity: state.settings.deviceIdentity,
  retailLocationCurrency: state.settings.retailLocationCurrency,
  returnMode: state.businessState.stateValues.get("ItemHandlingSession.isReturning"),
  transaction: state.businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn") &&
      state.businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn").transaction,
  transactions: state.businessState.stateValues.get("ItemHandlingSession.transactions"),
  transactionState: state.transactions,
  retailLocations: state.retailLocations,
  stateValues: state.businessState.stateValues
});

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof ReturnWithTransactionSearchResultScreen>()
    (ReturnWithTransactionSearchResultScreen));
