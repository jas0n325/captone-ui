import * as _ from "lodash";
import * as React from "react";
import { FlatList, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { DeviceIdentity } from "@aptos-scp/scp-component-store-selling-core";
import {
  AccountStatus,
  CollectedDataKey,
  IDisplayInfo,
  IEmployee,
  IItemDisplayLine,
  IServiceCustomerTag,
  ITEM_RETURN_LINE_TYPE,
  LOG_OFF_EVENT,
  OPEN_TERMINAL_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { LineType } from "@aptos-scp/scp-types-commerce-transaction";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  ItemSelectionMode,
  onScrollListener,
  ScrollableAwareComponent,
  scrollUpdate
} from "../../actions";
import {
  AppState,
  BusinessState,
  UiState,
  UI_MODE_VOID_TRANSACTION,
  UI_MODE_WAITING_TO_CLEAR_TRANSACTION
} from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import CustomerTagList from "./CustomerTagList";
import FeedbackNote from "./FeedbackNote";
import TransactionTotalsFooter from "./presentational/TransactionTotalsFooter";
import SelectableItemLine from "./SelectableItemLine";
import { displayStyle } from "./styles";
import VectorIcon from "./VectorIcon";
import { itemDisplayLineCreated } from "./utilities/itemLineUtils";
import OfflineNotice from "./OfflineNotice";

interface SalespersonDisplayLine {
  salesPerson: IEmployee;
  itemDisplayLines: IItemDisplayLine[];
}

interface SalespersonDisplayLineCollection {
  [key: string]: SalespersonDisplayLine;
}

interface BasketDisplayCollection {
  [key: string]: SalespersonDisplayLineCollection;
}

interface StateProps {
  deviceIdentity: DeviceIdentity;
  displayInfo: IDisplayInfo;
  itemSelectionMode: ItemSelectionMode;
  selectionEnabled: boolean;
  selectedItems: number[];
  stateValues: Map<string, any>;
  uiState: UiState;
  businessState: BusinessState;
}

interface DispatchProps extends ScrollableAwareComponent {
  performBusinessOperation: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
  style?: ViewStyle;
  transactionVoided: boolean;
  customerTags?: IServiceCustomerTag[];
  onFiscalConfigValidationError: () => void;
}

interface State {
  basketLinesToDisplay: (IItemDisplayLine | IEmployee | string)[];
}

const ITEM_LINES_GROUPING: string = `ITEM_LINES_GROUPING`;
const RETURN_TRANSACTION_SEPARATOR: string = `RETURN_TRANSACTION_SEPARATOR`;
const ITEM_LINES_SEPARATOR: string = `ITEM_LINES_SEPARATOR`;

class Display extends React.Component<Props, State> {
  private flatListRef: FlatList<any>;
  private flatListViewHeight: number;
  private SALESPERSON_NONE_SENTINEL: string = I18n.t("none");
  private EMPLOYEE_NUMBER_SENTINEL: string = `stubbed employeeNumber for ${this.SALESPERSON_NONE_SENTINEL}`;
  private styles: any;
  private zeroCurrency: Money;

  constructor(props: Props) {
    super(props);

    this.flatListViewHeight = 0;
    this.styles = Theme.getStyles(displayStyle());

    const accountingCurrency: string = this.props.stateValues.get("transaction.accountingCurrency");
    if (accountingCurrency) {
      this.zeroCurrency = new Money(0.00, accountingCurrency);
    }

    this.state = { basketLinesToDisplay: undefined };
  }

  public componentDidMount(): void {
    if (this.props.displayInfo && this.props.displayInfo.itemDisplayLines) {
      this.setState({
        basketLinesToDisplay: this.getBasketLinesToDisplay()
      });
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.basketDisplayLinesChanged(prevProps)) {
      this.setState({
        basketLinesToDisplay: this.getBasketLinesToDisplay()
      });
    } else if ((this.transactionHasClosed(prevProps) && prevProps.uiState.mode !== UI_MODE_VOID_TRANSACTION) ||
          (prevProps.uiState.mode === UI_MODE_WAITING_TO_CLEAR_TRANSACTION &&
          this.props.uiState.mode !== prevProps.uiState.mode)) {
      this.setState({ basketLinesToDisplay: undefined });
    }
  }

  public render(): JSX.Element {
    const inReturnMode: boolean = this.props.stateValues.get("ItemHandlingSession.isReturning");
    const inReturnWithEmptyBasket: boolean = this.basketIsEmpty && inReturnMode;
    if (this.props.uiState.isAllowed(LOG_OFF_EVENT) && !this.terminalIsOpen) {
      this.processError();
    }
    return (
      <View style={[this.styles.basket, this.props.style || {}]}>
        {
          !this.props.uiState.isAllowed(LOG_OFF_EVENT) &&
          !inReturnWithEmptyBasket &&
          <View style={this.styles.fill}>
            <OfflineNotice isScrolling={this.props.uiState.isScrolling} />
            {
              this.terminalIsOpen && this.basketIsEmpty &&
              <View style = {this.styles.feedBackNote}>
                <FeedbackNote
                  messageType={FeedbackNoteType.Info}
                  message={I18n.t("emptyBasketInTransction")}
                  messageTitle={I18n.t("emptyBasket")}
                />
              </View>
            }
            <FlatList
              data={this.state.basketLinesToDisplay}
              keyExtractor={(item, index) => index.toString()}
              onContentSizeChange={(width, height) => {
                setTimeout(() => {
                  if (this.flatListRef &&
                      height > this.flatListViewHeight &&
                      this.state?.basketLinesToDisplay?.length) {
                    this.flatListRef.scrollToEnd();
                  }
                }, 100);
              }}
              onLayout={(e) => { this.flatListViewHeight = e.nativeEvent.layout.height; }}
              ListHeaderComponent={this.renderListHeader()}
              renderItem={({ item }) => this.renderRow({ item })}
              ref={(ref: any) => this.flatListRef = ref}
              {...onScrollListener(this.props)}
              ListFooterComponent={
                this.props.itemSelectionMode === ItemSelectionMode.None &&
                this.renderFooter
              }
            />
          </View>
        }
        {
          this.terminalIsOpen && inReturnWithEmptyBasket &&
          <View style={this.styles.emptyBasket}>
            {this.renderListHeader()}
            <View style={this.styles.emptyBasketReturnIcon}>
              <VectorIcon name={"Returns"} fill={this.styles.white} height={this.styles.emptyBasketIcon.fontSize} />
            </View>
            <View style={this.styles.emptyBasketText}>
              <Text style={[this.styles.emptyBasketTitle, this.styles.emptyBasketReturnTitle]}>
                {I18n.t("returnMode")}
              </Text>
              <Text style={this.styles.emptyBasketScan}>{I18n.t("scanToBegin")}</Text>
            </View>
          </View>
        }
        {
          this.props.uiState.isAllowed(LOG_OFF_EVENT) && this.terminalIsOpen && this.basketIsEmpty && !inReturnMode &&
          <View style={this.styles.emptyBasket}>
            {this.renderListHeader()}
            <View style={this.styles.emptyBasketIcon}>
              <VectorIcon name="Basket" fill={this.styles.white} height={this.styles.emptyBasketIcon.fontSize} />
            </View>
            <View style={this.styles.emptyBasketText}>
              <Text style={this.styles.emptyBasketTitle}>{I18n.t("emptyBasked")}</Text>
              <Text style={this.styles.emptyBasketScan}>{I18n.t("scanToBegin")}</Text>
            </View>
          </View>
        }
        {
          this.props.uiState.isAllowed(LOG_OFF_EVENT) && !this.terminalIsOpen &&
          <View style={this.styles.emptyBasket}>
            {this.renderListHeader()}
            <View style={this.styles.emptyBasketIcon}>
              <VectorIcon name="Lock" fill={this.styles.white} height={this.styles.emptyBasketIcon.fontSize} />
            </View>
            <View style={this.styles.emptyBasketText}>
              <Text style={this.styles.emptyBasketTitle}>{I18n.t("terminalIsClosed")}</Text>
              <Text style={this.styles.emptyBasketScan}>{I18n.t("openTerminalToStartTransactions")}</Text>
            </View>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.openTerminalButton]}
              onPress={this.handleOpenTerminal}
            >
              <Text style={this.styles.btnPrimaryText}>{I18n.t("openTerminal")}</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }

  public renderListHeader() : JSX.Element {
    const preferredLanguage: string = this.props.businessState.stateValues.get("UserSession.user.preferredLanguage");
    return (
      this.props.customerTags &&
      <CustomerTagList
        preferredLanguage={preferredLanguage}
        tags={this.props.customerTags}
        style={this.styles.statusTags}
      />
    );
  }

  private basketDisplayLinesChanged(prevProps: Props): boolean {
    return itemDisplayLineCreated(prevProps.displayInfo, this.props.displayInfo) ||
        this.itemDisplayLineSalespersonChangedStart(prevProps) ||
        this.itemDisplayLineAdded(prevProps) || this.selectionChanged(prevProps) ||
        this.returnModeChanged(prevProps) || this.transactionIsNowVoiding(prevProps) ||
        this.itemDisplayLineSalespersonChanged(prevProps);
  }

  /**
   * This is to covert when the salesperson is updated on transaction start because all the other scenarios are handled
   * in the item line page which changes the selection mode and it forces the lines to be updated reflecting
   * the changes.
   *
   * @param prevProps the previous properties.
   */
  private itemDisplayLineSalespersonChangedStart(prevProps: Props): boolean {
    const prevPropsItemDisplayLines = prevProps.displayInfo && prevProps.displayInfo.itemDisplayLines;
    const itemDisplayLines = this.props.displayInfo && this.props.displayInfo.itemDisplayLines;

    const hasItemLine = prevPropsItemDisplayLines && itemDisplayLines &&
        prevPropsItemDisplayLines.length === itemDisplayLines.length && itemDisplayLines.length === 1;

    return hasItemLine && !prevProps.displayInfo.itemDisplayLines[0].salesperson &&
        this.props.displayInfo.itemDisplayLines[0].salesperson !== undefined;
  }

  private itemDisplayLineSalespersonChanged(prevProps: Props): boolean {
    const prevPropsItemDisplayLines = prevProps.displayInfo && prevProps.displayInfo.itemDisplayLines;
    const itemDisplayLines = this.props.displayInfo && this.props.displayInfo.itemDisplayLines;
    let changedLines: boolean = false;

    const hasItemLines = prevPropsItemDisplayLines && itemDisplayLines &&
        prevPropsItemDisplayLines.length === itemDisplayLines.length && itemDisplayLines.length >= 1;

    if (itemDisplayLines && prevPropsItemDisplayLines) {
      changedLines = itemDisplayLines.some((line) => {
        const oldLine = prevPropsItemDisplayLines.find((prevLine) => line.lineNumber === prevLine.lineNumber);
        return oldLine && !_.isEqual(line.salesperson, oldLine.salesperson);
      });
    }

    return hasItemLines && changedLines;
  }

  private itemDisplayLineAdded(prevProps: Props): boolean {
    return prevProps.displayInfo && prevProps.displayInfo.itemDisplayLines &&
        this.props.displayInfo && this.props.displayInfo.itemDisplayLines &&
        prevProps.displayInfo.itemDisplayLines.length !== this.props.displayInfo.itemDisplayLines.length;
  }

  private selectionChanged(prevProps: Props): boolean {
    return prevProps.itemSelectionMode !== this.props.itemSelectionMode ||
        prevProps.selectedItems.length !== this.props.selectedItems.length ||
        prevProps.selectionEnabled !== this.props.selectionEnabled;
  }

  private returnModeChanged(prevProps: Props): boolean {
    return prevProps.stateValues.get("ItemHandlingSession.isReturning") !==
        this.props.stateValues.get("ItemHandlingSession.isReturning");
  }

  private transactionIsNowVoiding(prevProps: Props): boolean {
    return prevProps.transactionVoided !== this.props.transactionVoided && this.props.transactionVoided;
  }

  private transactionHasClosed(prevProps: Props): boolean {
    return !prevProps.stateValues.get("transaction.closed") && this.props.stateValues.get("transaction.closed");
  }

  private getBasketLinesToDisplay(): (IItemDisplayLine | IEmployee | string)[] {
    const resultBasketDisplayCollection: BasketDisplayCollection = {};
    const { itemDisplayLines } = this.props.displayInfo;

    const salesPersonNone: IEmployee = {
      employeeNumber: this.EMPLOYEE_NUMBER_SENTINEL,
      firstName: this.SALESPERSON_NONE_SENTINEL,
      lastName: "",
      displayName: "",
      accountStatus: AccountStatus.Active
    };

    if (this.props.stateValues.get("transaction.voided") || this.props.transactionVoided) {
      return this.state.basketLinesToDisplay;
    }

    if (this.props.itemSelectionMode !== ItemSelectionMode.None) {
      const salesPersons: SalespersonDisplayLineCollection = {};
      salesPersons[salesPersonNone.employeeNumber] = {
        salesPerson: salesPersonNone,
        itemDisplayLines: itemDisplayLines.filter((itemDisplayLine: IItemDisplayLine) => {
          // If selection is enabled, show all items, otherwise only show the selected items
          return this.props.selectionEnabled || this.props.selectedItems.indexOf(itemDisplayLine.lineNumber) > -1;
        })
      };
      resultBasketDisplayCollection[ITEM_LINES_GROUPING] = salesPersons;
    } else {
      const returnWithTransactionItemsInBasket: boolean = itemDisplayLines &&
          !!itemDisplayLines.find((displayLine: IItemDisplayLine) => {
            return displayLine.lineType === LineType.ItemReturn &&
                displayLine.lineNumberFromReturnTransaction !== undefined &&
                displayLine.sublineIndexFromReturnItem !== undefined;
          });

      const noReceiptItemsInBasket: boolean = itemDisplayLines &&
          !!itemDisplayLines.find((displayLine: IItemDisplayLine) => {
            return displayLine.lineType === LineType.ItemReturn &&
                displayLine.transactionIdFromReturnTransaction === undefined &&
                displayLine.offlineReturnReferenceNumber === undefined;
          });
      //multi receipt offline return not allowed so all offline return items is from the same receipt
      const offlineReturnItemInBasket = itemDisplayLines &&
        itemDisplayLines.find((displayLine: IItemDisplayLine) => {
          return displayLine.lineType === LineType.ItemReturn &&
            displayLine.offlineReturnReferenceNumber !== undefined;
        });
      const isOfflineReturnItemInBasket = !!offlineReturnItemInBasket;
      const offlineReturnReferenceNumber: string = offlineReturnItemInBasket &&
          offlineReturnItemInBasket.offlineReturnReferenceNumber;

      const transactions: TransactionWithAdditionalData[] = returnWithTransactionItemsInBasket ?
          this.props.stateValues.get("ItemHandlingSession.transactions") : undefined;
      if (transactions && transactions.length > 0) {
        transactions.forEach(transaction => {
          const salesPersons: SalespersonDisplayLineCollection = {};
          itemDisplayLines.filter((itemDisplayLine: IItemDisplayLine) =>
              itemDisplayLine.transactionIdFromReturnTransaction === transaction.transactionId).forEach(
                  (itemDisplayLine: IItemDisplayLine) => {
                let salesPerson: IEmployee;
                if (itemDisplayLine.salesperson) {
                  salesPerson = itemDisplayLine.salesperson;
                } else {
                  salesPerson = salesPersonNone;
                }
                salesPersons[salesPerson.employeeNumber]
                  ? salesPersons[salesPerson.employeeNumber].itemDisplayLines.push(itemDisplayLine)
                  : salesPersons[salesPerson.employeeNumber] = {
                    salesPerson,
                    itemDisplayLines: [itemDisplayLine]
                  };
            });

          if (Object.keys(salesPersons).length > 0) {
            resultBasketDisplayCollection[transaction.transaction.order ?
                transaction.transaction.order.orderReferenceId :
                transaction.transaction.referenceNumber] = salesPersons;
          }
        });
      } else if (isOfflineReturnItemInBasket) {
        const salesPersons: SalespersonDisplayLineCollection = {};
        itemDisplayLines.filter((itemDisplayLine: IItemDisplayLine) =>
            itemDisplayLine.offlineReturnReferenceNumber === offlineReturnReferenceNumber).forEach(
                (itemDisplayLine: IItemDisplayLine) => {
              let salesPerson: IEmployee;
              if (itemDisplayLine.salesperson) {
                salesPerson = itemDisplayLine.salesperson;
              } else {
                salesPerson = salesPersonNone;
              }
              salesPersons[salesPerson.employeeNumber]
                ? salesPersons[salesPerson.employeeNumber].itemDisplayLines.push(itemDisplayLine)
                : salesPersons[salesPerson.employeeNumber] = {
                  salesPerson,
                  itemDisplayLines: [itemDisplayLine]
                };
            });

        if (Object.keys(salesPersons).length > 0) {
          resultBasketDisplayCollection[offlineReturnReferenceNumber.concat("\r")] = salesPersons;
        }
      }

      if (noReceiptItemsInBasket) {
        const salesPersons: SalespersonDisplayLineCollection = {};
        itemDisplayLines.filter((itemDisplayLine: IItemDisplayLine) =>
            itemDisplayLine.lineType === LineType.ItemReturn &&
            itemDisplayLine.transactionIdFromReturnTransaction === undefined &&
            itemDisplayLine.offlineReturnReferenceNumber === undefined).forEach(
                (itemDisplayLine: IItemDisplayLine) => {
              let salesPerson: IEmployee;
              if (itemDisplayLine.salesperson) {
                salesPerson = itemDisplayLine.salesperson;
              } else {
                salesPerson = salesPersonNone;
              }
              salesPersons[salesPerson.employeeNumber]
                ? salesPersons[salesPerson.employeeNumber].itemDisplayLines.push(itemDisplayLine)
                : salesPersons[salesPerson.employeeNumber] = {
                  salesPerson,
                  itemDisplayLines: [itemDisplayLine]
                };
            });

        if (Object.keys(salesPersons).length > 0) {
          resultBasketDisplayCollection["noreceipt"] = salesPersons;
        }
      }

      const lineItems =
          itemDisplayLines.filter(itemDisplayLine => !itemDisplayLine.transactionIdFromReturnTransaction &&
            !itemDisplayLine.offlineReturnReferenceNumber &&
            itemDisplayLine.lineType !== ITEM_RETURN_LINE_TYPE);
      if (lineItems.length > 0) {
        resultBasketDisplayCollection[ITEM_LINES_GROUPING] = {};
        lineItems.forEach((itemDisplayLine: IItemDisplayLine) => {
          if (!this.props.stateValues.get("ItemHandlingSession.isReturning")) {
            let salesPerson: IEmployee;
            if (itemDisplayLine.salesperson) {
              salesPerson = itemDisplayLine.salesperson;
            } else {
              salesPerson = salesPersonNone;
            }

            if (resultBasketDisplayCollection[ITEM_LINES_GROUPING][salesPerson.employeeNumber]) {
              resultBasketDisplayCollection[ITEM_LINES_GROUPING][salesPerson.employeeNumber]
                  .itemDisplayLines.push(itemDisplayLine);
            } else {
              resultBasketDisplayCollection[ITEM_LINES_GROUPING][salesPerson.employeeNumber] = {
                salesPerson,
                itemDisplayLines: [itemDisplayLine]
              };
            }
          }
        });
      }
    }

    return this.getIndividualBasketLinesFromCollection(resultBasketDisplayCollection);
  }

  private getIndividualBasketLinesFromCollection(basketDisplayCollection: BasketDisplayCollection):
      (IItemDisplayLine | IEmployee | string)[] {
    let resultArray: (IItemDisplayLine | IEmployee | string)[]  = [];

    const groups: string[] = Object.keys(basketDisplayCollection);

    if (!groups.length) {
      return resultArray;
    }
    groups.forEach((groupName: string, index) => {
      const salesPersonEmployeeNumbers = Object.keys(basketDisplayCollection[groupName]);

      const noSalesPerson = salesPersonEmployeeNumbers.length === 1 &&
          salesPersonEmployeeNumbers[0] === this.EMPLOYEE_NUMBER_SENTINEL;
      if (index > 0) {
        if (groupName === ITEM_LINES_GROUPING) {
          resultArray.push(ITEM_LINES_SEPARATOR);
        } else {
          resultArray.push(RETURN_TRANSACTION_SEPARATOR);
        }
      }
      if (groupName !== ITEM_LINES_GROUPING) {
        resultArray.push(groupName);
      }

    salesPersonEmployeeNumbers.forEach((salesPersonEmployeeNumber: string) => {
        const salesPerson = basketDisplayCollection[groupName][salesPersonEmployeeNumber].salesPerson;
        if (!noSalesPerson) {
          resultArray.push(salesPerson);
        }

        resultArray = resultArray.concat(
            basketDisplayCollection[groupName][salesPersonEmployeeNumber].itemDisplayLines);
      });
    });

    return resultArray;
  }

  private get basketIsEmpty(): boolean {
    return !this.state.basketLinesToDisplay || !this.state.basketLinesToDisplay.length;
  }

  private isItemDisplayLine(basketDisplayLine: IItemDisplayLine | IEmployee | string):
                            basketDisplayLine is IItemDisplayLine {
    return !!(basketDisplayLine as IItemDisplayLine).lineNumber && !!(basketDisplayLine as IItemDisplayLine).itemIdKey
        && !!(basketDisplayLine as IItemDisplayLine).itemIdKeyType
        && !!(basketDisplayLine as IItemDisplayLine).itemShortDescription;
  }

  private isSalesperson(basketDisplayLine: IItemDisplayLine | IEmployee | string):
                            basketDisplayLine is IEmployee {
    return !!(basketDisplayLine as IEmployee).firstName || !!(basketDisplayLine as IEmployee).lastName;
  }

  private isGroupSeparator(basketDisplayLine: IItemDisplayLine | IEmployee | string):
      basketDisplayLine is string {
    return basketDisplayLine && (basketDisplayLine === RETURN_TRANSACTION_SEPARATOR ||
        basketDisplayLine === ITEM_LINES_SEPARATOR);
  }

  private renderRow({ item: basketDisplayLine }: { item: IItemDisplayLine | IEmployee | string }): JSX.Element {
    const transactionReferenceNumber: string = basketDisplayLine as string;
    if (this.isItemDisplayLine(basketDisplayLine)) {
      return (
        <View style={this.styles.itemRow}>
          <SelectableItemLine
            itemLineNumber={basketDisplayLine.lineNumber}
            returnMode={this.props.stateValues.get("ItemHandlingSession.isReturning")}
          />
          {
            this.props.transactionVoided &&
            <View style={this.styles.voidRow}>
              <View style={this.styles.strikeOut}/>
              <Text style={this.styles.voided}>{I18n.t("lineVoid")}</Text>
              <View style={this.styles.strikeOut}/>
            </View>
          }
        </View>
      );
    } else if (this.isSalesperson(basketDisplayLine)) {
      const salesperson: IEmployee = basketDisplayLine as IEmployee;
      return (
        <View style={this.styles.salesPersonArea}>
          <View style={this.styles.salesPersonTextArea}>
            <Text style={this.styles.salesPerson}>{I18n.t("salesperson")}: </Text>
            <Text
                style={this.styles.salesPersonName}
                adjustsFontSizeToFit={true}
                numberOfLines={1}>
              {salesperson.firstName} {salesperson.lastName}
            </Text>
          </View>
          <View style={this.styles.separator} />
        </View>
      );
    } else if (this.isGroupSeparator(basketDisplayLine)) {
      if (basketDisplayLine === RETURN_TRANSACTION_SEPARATOR) {
        return (
          <View style={this.styles.returnItemsSeparator} />
        );
      } else {
        return (
          <View style={this.styles.saleItemsSeparator} />
        );
      }
    } else if (transactionReferenceNumber && transactionReferenceNumber.length > 0) {
      const offlineReturnReference = transactionReferenceNumber.endsWith("\r");
      const noreceipt = transactionReferenceNumber.startsWith("noreceipt");
      return (
        <View style={this.styles.salesPersonArea}>
          <View style={this.styles.salesPersonTextArea}>
            <Text style={this.styles.salesPerson}>
              {offlineReturnReference ? I18n.t("offlineReference"): I18n.t("return")}:
            </Text>
            <Text
                style={this.styles.salesPersonName}
                adjustsFontSizeToFit={true}
                numberOfLines={1}>
              {noreceipt ? I18n.t("noReceipt") : transactionReferenceNumber.trim()}
            </Text>
          </View>
          <View style={this.styles.separator} />
        </View>
      );
    }
  }

  private get terminalIsOpen(): boolean {
    return this.props.stateValues.get("TerminalSession.isOpen");
  }

  private handleOpenTerminal = (): void => {
    this.props.performBusinessOperation(this.props.deviceIdentity, OPEN_TERMINAL_EVENT, []);
  }

  private processError(): void {
    const nonContextualData = this.props.businessState.nonContextualData;
    if (nonContextualData && nonContextualData.get(CollectedDataKey.FiscalConfigValidation)
        && nonContextualData.get(CollectedDataKey.FiscalConfigValidation).length > 0) {
      this.props.onFiscalConfigValidationError();
    }
  }

  private renderFooter = (): JSX.Element => {
    const transactionNumber: number = this.props.stateValues.get("transaction.number");

    const transactionSubTotal: Money = this.getStateValueMoney("transaction.subTotal");
    const transactionTotalSavings: Money = this.getStateValueMoney("transaction.totalSavings");
    const transactionTax: Money = this.getStateValueMoney("transaction.tax");
    const transactionTotal: Money = this.getStateValueMoney("transaction.balanceDue");
    const totalFee: Money = this.getStateValueMoney("transaction.totalFee");

    const returnMode: boolean = this.props.stateValues.get("ItemHandlingSession.isReturning");
    const returnSubTotal: Money = this.getStateValueMoney("transaction.returnSubTotal");
    const returnTax: Money = this.getStateValueMoney("transaction.returnTax");
    const returnTotalSavings: Money = this.getStateValueMoney("transaction.returnTotalSavings");
    const returnTotal: Money = this.getStateValueMoney("transaction.returnTotal");

    return (
      <View style={this.styles.footerContainer}>
        <TransactionTotalsFooter
          style={this.styles.footerArea}
          transactionNumber={transactionNumber && transactionNumber.toString()}
          subtotal={returnMode ? returnSubTotal : transactionSubTotal}
          totalDiscounts={returnMode ? returnTotalSavings : transactionTotalSavings}
          tax={returnMode ? returnTax : transactionTax}
          total={returnMode ? returnTotal : transactionTotal}
          totalFee={totalFee}
        />
      </View>
    );
  }

  private getStateValueMoney(tranKey: string): Money {
    return this.props.stateValues && this.props.stateValues.get(tranKey) || this.zeroCurrency;
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    deviceIdentity: state.settings.deviceIdentity,
    displayInfo: state.businessState.displayInfo,
    itemSelectionMode: state.itemSelectionState.itemSelectionMode,
    selectedItems: state.itemSelectionState.selectedItems,
    selectionEnabled: state.itemSelectionState.selectionEnabled,
    stateValues: state.businessState.stateValues,
    businessState: state.businessState,
    uiState: state.uiState
  };
};

export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  scrollUpdate: scrollUpdate.request
})(Display);
