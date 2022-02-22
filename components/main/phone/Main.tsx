import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  IDiscountDisplayLine,
  IDisplayInfo
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import {
  ActionCreator,
  clearSelectedItemLines,
  ItemSelectionMode,
  selectAllItemLines,
  setItemSelectionMode,
  unselectAllItemLines
} from "../../../actions";
import { AppState, SettingsState, UI_MODE_ITEM_SELECTION } from "../../../reducers";
import Theme from "../../../styles";
import Display from "../../common/Display";
import Header from "../../common/Header";
import { cameraScannerInputStyles } from "../../common/styles";
import { getTransactionIsOpen, IDiscountGroupInformation } from "../../common/utilities";
import { isItemSearchBehaviorsIsNumeric } from "../../common/utilities/configurationUtils";
import { popTo } from "../../common/utilities/navigationUtils";
import VectorIcon from "../../common/VectorIcon";
import { getCustomerIconName } from "../../customer/CustomerUtilities";
import {DiscountLevel, DiscountType} from "../../discounts/constants";
import PaymentOptions from "../../payment/PaymentOptions";
import ReceiptOptionForm from "../../receipt/ReceiptOptionForm";
import { MainComponentCommonProps } from "../constants";
import { mainStyle } from "./styles";
import TotalTransaction from "./TotalTransaction";

interface StateProps {
  displayInfo: IDisplayInfo;
  itemSelectionMode: ItemSelectionMode;
  selectedItems: number[];
  stateValues: Readonly<Map<string, any>>;
  uiMode: string;
  settings: SettingsState;
}

interface DispatchProps {
  clearSelectedItemLines: ActionCreator;
  setItemSelectionMode: ActionCreator;
  selectAllItemLines: ActionCreator;
  unselectAllItemLines: ActionCreator;
}

interface Props extends MainComponentCommonProps, StateProps, DispatchProps {}

class Main extends React.Component<Props> {
  private styles: any;
  private inputStyles: any;
  private consecutiveScanning: boolean = false;
  private consecutiveScanDelay: number = 2000;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(mainStyle());
    this.inputStyles = Theme.getStyles(cameraScannerInputStyles());

    const peripheralsConfig: any = this.props.settings.configurationManager.getPeripheralsValues();
    this.consecutiveScanning = peripheralsConfig && peripheralsConfig.scannerType &&
        peripheralsConfig.scannerType.consecutiveCameraScanning;
    this.consecutiveScanDelay = peripheralsConfig && peripheralsConfig.scannerType &&
        peripheralsConfig.scannerType.consecutiveCameraScanDelayMilliseconds;

    this.popToMain = this.popToMain.bind(this);
  }

  public getCheckBoxType(allItemsSelected: boolean, noItemsSelected: boolean): string {
    if (allItemsSelected) {
      return "CheckedBox";
    } else if (noItemsSelected) {
      return "UncheckedBox";
    } else {
      return "MinusBox";
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  public render(): JSX.Element {
    const customer: Customer = this.props.customer;
    const customerName = customer && (customer.fullName || I18n.t("defaultCustomerName"));
    const customerNumber = customer && customer.customerNumber;

    const voidedOrClosing: boolean = this.props.transactionVoided || this.props.closingTransaction;
    const canShowElements: boolean = !voidedOrClosing && this.terminalIsOpen;

    const returnMode: boolean = this.props.stateValues && this.props.stateValues.get("ItemHandlingSession.isReturning");

    const backButton = returnMode
        ? { name: "Back", action: this.props.onExitReturnMode }
        : { name: "Menu", action: this.props.onMenuToggle };

    const allItemsAreSelected: boolean = this.props.itemSelectionMode === ItemSelectionMode.All ||
        (this.props.displayInfo && this.props.displayInfo.itemDisplayLines.length &&
         this.props.displayInfo.itemDisplayLines.length === this.props.selectedItems.length);

    const customerIconName = getCustomerIconName(customer, this.props.shouldDisplayLoyaltyIndicator);

    return (
      <>
        <View style={this.styles.fill}>
          <Header
            title={returnMode && !voidedOrClosing && I18n.t("returnMode")}
            testID={"MainScreen"}
            backButton={!this.props.printReceipt && backButton}
            image={!returnMode && this.props.appLogo}
            showInput={!voidedOrClosing}
            returnMode={returnMode}
            isNumeric={isItemSearchBehaviorsIsNumeric(this.props.settings.configurationManager)}
            inputDisabled={!this.terminalIsOpen}
            inputCameraIcon={{
              color: this.terminalIsOpen ?
                  this.inputStyles.cameraIcon.color : this.styles.closedTerminalCameraIconStyles.color,
              icon: "Camera",
              size: this.inputStyles.cameraIcon.fontSize,
              style: Object.assign({}, this.inputStyles.cameraIconPanel, !this.terminalIsOpen &&
                  this.styles.closedTerminalCameraIconStyles),
              position: "right"
            }}
            consecutiveScanningEnabled={this.consecutiveScanning}
            consecutiveScanningDelay={this.consecutiveScanDelay}
            inputStyle={{
              inputAreaStyle: [this.styles.inputPanel, returnMode && this.styles.returnModeInputPanel],
              inputTextBoxStyle: [this.styles.inputField, !this.terminalIsOpen && this.styles.closedTerminalStyles],
              placeholderTextColor: !this.terminalIsOpen && this.styles.closedTerminalStyles.color
            }}
          />
          { canShowElements && (this.props.customerBannerButtonVisible || this.props.canSelectItems) &&
            <View style={this.styles.assignCustAndSelectItemsBtn}>
              {
                this.props.customerBannerButtonVisible && !this.inItemSelection &&
                <TouchableOpacity
                  activeOpacity={1}
                  style={this.styles.assignCustomerContainer}
                  onPress={() => this.props.onCustomerUpdate(false)}
                  disabled={!this.props.customerBannerButtonClickable}
                >
                  <VectorIcon
                    name={customerIconName}
                    fill={!this.props.customerBannerButtonClickable
                        ? this.styles.btnTextDisabled.color
                        : this.styles.assignCustomerIcon.color}
                    height={this.styles.assignCustomerIcon.fontSize}
                  />
                  <Text style={[
                    this.styles.assignCustomerText,
                    !this.props.customerBannerButtonClickable && this.styles.btnTextDisabled
                  ]}
                    numberOfLines={1}>
                    {customer
                        ? (this.props.shouldDisplayCustomerNumber ? customerNumber : customerName)
                        : I18n.t("addCustomer")}
                  </Text>
                </TouchableOpacity>
              }
              {
                (this.props.canSelectItems && this.inItemSelection) &&
                <TouchableOpacity
                  activeOpacity={1}
                  style={this.styles.selectAllItemsContainer}
                  onPress={allItemsAreSelected
                      ? this.props.unselectAllItemLines
                      : this.props.selectAllItemLines}
                >
                  <VectorIcon
                      name={this.getCheckBoxType(allItemsAreSelected, this.props.selectedItems.length === 0)}
                      fill={this.styles.assignCustomerIcon.color}
                      height={this.styles.assignCustomerIcon.fontSize}
                  />
                  <Text style={this.styles.selectAllItemsText}>
                    {I18n.t(allItemsAreSelected ? "unselectAll" : "selectAll")}
                  </Text>
                </TouchableOpacity>
              }
              {
                this.props.canSelectItems &&
                <TouchableOpacity
                  activeOpacity={1}
                  style={this.styles.selectItemsContainer}
                  onPress={() => this.inItemSelection
                      ? this.props.clearSelectedItemLines()
                      : this.props.setItemSelectionMode(ItemSelectionMode.Multiple)}
                >
                  <VectorIcon
                    name={this.inItemSelection ? "Cancel" : "MultiSelect"}
                    fill={this.styles.assignCustomerIcon.color}
                    height={this.styles.assignCustomerIcon.fontSize}
                  />
                </TouchableOpacity>
              }
            </View>
          }
          <Display
            customerTags={customer && customer.tags}
            transactionVoided={this.props.transactionVoided}
            onFiscalConfigValidationError={this.pushFiscalConfigValidationError}
          />
          {
            canShowElements &&
            <TotalTransaction
              balanceDue={this.props.stateValues && this.props.stateValues.get("transaction.balanceDue")}
              inItemSelection={this.inItemSelection}
              mixedBasketAllowed={this.props.mixedBasketAllowed}
              returnMode={returnMode}
              returnTotal={this.props.stateValues && this.props.stateValues.get("transaction.returnTotal")}
              totalTransactionIsAllowed={this.props.totalTransactionIsAllowed}
              transactionIsOpen={getTransactionIsOpen(this.props.stateValues)}
              onBasketActionPressed={this.handleBasketActionsPressed}
              onTotalPressed={this.props.handleOnTotalPressed}
            />
          }
          {
            (this.props.showOfflineOptions || this.props.showRetryAuthorization) &&
            <PaymentOptions
              retryOnlyAuthMode={this.props.showRetryAuthorization}
              onOfflineAuthorization={this.props.handleOfflineOptions}
              cancelOffline={this.props.handleCancelOfflineAuthorization}
              onRetry={this.props.handleRetryAuthorization}
            />
          }
        </View>
        {
          this.props.printReceipt &&
          <ReceiptOptionForm
            customer={customer}
            providedReceiptCategory={this.props.receiptCategory}
            onClose={this.props.onResetAfterReceiptPrint}
            navigation={this.props.navigation}
          />
        }
      </>
    );
  }

  private get inItemSelection(): boolean {
    return this.props.uiMode === UI_MODE_ITEM_SELECTION || this.props.itemSelectionMode !== ItemSelectionMode.None;
  }

  private get terminalIsOpen(): boolean {
    return this.props.stateValues.get("TerminalSession.isOpen");
  }

  private onAssignSalesperson = (): void => {
    this.props.navigation.push("assignSalesperson", {
      assignToTransaction: !this.props.selectedItems || this.props.selectedItems.length === 0,
      lineNumbers: this.props.selectedItems,
      onExit: () => this.clearSelectedItemLines(),
      isTransactionStarting: false
    });
  }

  private clearSelectedItemLines = (): void => {
    if (this.inItemSelection) {
      this.props.clearSelectedItemLines();
    }
    this.popToMain();
  }

  private onCoupon = (): void => {
    this.props.navigation.push("coupon", {
      onExit: this.popToMain
    });
  }

  private onIssueGiftCard = (): void => {
    this.props.navigation.push("issueGiftCard", {
      onGCIssue: this.props.onIssueGC,
      onExit: this.popToMain
    });
  }

  private onIssueGiftCertificate = (): void => {
    this.props.navigation.push("issueGiftCertificate", {
      onIssue: (certificateNumber: string, amount: string, inputSource: string, inputs?: UiInput[]) => {
        this.props.onIssueGCert(certificateNumber, amount, inputSource);
        this.popToMain();
      },
      onExit: this.popToMain
    });
  }

  private onResumeOfSuspendedTransactions = (): void => {
    this.props.navigation.push("resumeSuspendedTransactions");
  }

  private onItemDiscount = (): void => {
    const itemLines = this.props.displayInfo.itemDisplayLines.filter((itemLine) =>
        this.props.selectedItems.indexOf(itemLine.lineNumber) > -1);

    this.props.navigation.push("discountTypeSelection", {
      discountLevel: DiscountLevel.Item,
      itemLines,
      onDiscount: (discountLevel: DiscountLevel, discountType: DiscountType,
                   discountDisplayLine: IDiscountDisplayLine) =>
          this.props.navigation.push("discountScreen", {
            discountLevel,
            discountType,
            itemLines,
            showLine: true,
            onCancel: () => this.clearSelectedItemLines()
          }),
      onExit: this.popToMain
    });
  }

  private onTransactionDiscount = (): void => {
    this.props.navigation.push("discountTypeSelection", {
      discountLevel: DiscountLevel.Transaction,
      isLoyaltyDiscountEnable: this.props.isLoyaltyDiscountEnable,
      transactionDiscountDisplayLines: this.props.displayInfo.transactionDiscountDisplayLines,
      onDiscount: this.onDiscountTransactionLevel,
      onExit: this.popToMain
    });
  }

  private onFastDiscount = (): void => {
    this.props.navigation.push("fastDiscountScreen", {
      onExit: this.popToMain
    });
  }

  private onNonMerch = (): void => {
    this.props.navigation.push("nonMerch", {
      onExit: this.popToMain
    });
  }

  private onLottery = (): void => {
    this.props.navigation.push("scanLottery", {
      onExit: this.popToMain
    });
  }

  private onPreConfiguredDiscounts = (transactionDiscountGroup: IDiscountGroupInformation): void => {
    this.props.navigation.push("preConfiguredDiscounts", {
      transactionDiscountGroup,
      onDiscount: this.onDiscountTransactionLevel,
      onExit: this.popToMain
    });
  }

  private onDiscountTransactionLevel = (discountLevel: DiscountLevel,
                                        discountType: DiscountType,
                                        discountDisplayLine: IDiscountDisplayLine) => {
    if (discountType !== DiscountType.Loyalty) {
      this.props.navigation.push("discountScreen", {
        discountLevel,
        discountType,
        discountDisplayLine,
        showLine: false,
        onCancel: this.popToMain
      });
    } else {
      this.props.navigation.push("loyaltyDiscount", {
        onCancel: this.popToMain
      });
    }
  }

  private onTransactionTaxExempt = (): void => {
    this.props.navigation.push("taxExempt", {
      onExit: (): void => {
        this.popToMain();
        this.props.clearSelectedItemLines();
      }
    });
  }

  private onTransactionTaxOverride = (): void => {
    const itemLines = this.props.displayInfo.itemDisplayLines;
    this.props.navigation.push("taxOverrideScreen", {
      showLine: false,
      isItemLevel: false,
      lines: itemLines,
      onExit: () => {
        this.popToMain();
        this.props.clearSelectedItemLines();
      }
    });
  }

  private onTransactionTaxDetails = (): void => {
    this.props.navigation.push("taxActionPanel", {
      onExit: this.popToMain,
      onTransactionTaxExempt: this.onTransactionTaxExempt,
      onTransactionTaxOverride: this.onTransactionTaxOverride
    });
  }

  private onItemTaxDetails = (): void => {
    const itemLines = this.props.displayInfo.itemDisplayLines.filter((itemLine) =>
        this.props.selectedItems.indexOf(itemLine.lineNumber) > -1);

    this.props.navigation.push("taxActionPanel", {
      isItemLevel: true,
      onTransactionTaxExempt: (): void => {
        this.props.navigation.push("taxExempt", {
          showLine: true,
          itemLines,
          onExit: (): void => {
            this.popToMain();
            this.props.clearSelectedItemLines();
          }
        });
      },
      onTransactionTaxOverride: (): void => {
        this.props.navigation.push("taxOverrideScreen", {
          showLine: true,
          isItemLevel: true,
          lines: itemLines,
          onExit: () => {
            this.popToMain();
            this.props.clearSelectedItemLines();
          }
        });
      },
      onExit: this.popToMain
    });
  }

  private handleBasketActionsPressed = () => {
    this.props.navigation.push("basketActions", {
      mixedBasketAllowed: this.props.mixedBasketAllowed,
      clearSelectedItemLines: this.props.clearSelectedItemLines,
      onAssignSalesperson: this.onAssignSalesperson,
      onVoidTransaction: this.props.onVoidTransaction,
      onCoupon: this.onCoupon,
      onEnterReturnMode: this.props.onEnterReturnMode,
      onFastDiscount: this.onFastDiscount,
      onIssueGiftCard: this.onIssueGiftCard,
      onIssueGiftCertificate: this.onIssueGiftCertificate,
      onItemDiscount: this.onItemDiscount,
      onItemTaxDetails: this.onItemTaxDetails,
      onNonMerch: this.onNonMerch,
      onResumeOfSuspendedTransactions: this.onResumeOfSuspendedTransactions,
      onSuspendTransaction: this.props.onSuspendTransaction,
      onTransactionDiscount: this.onTransactionDiscount,
      onTransactionTaxDetails: this.onTransactionTaxDetails,
      onLottery: this.onLottery,
      onPreConfiguredDiscounts: this.onPreConfiguredDiscounts
    });
  }

  private popToMain(): void {
    this.props.navigation.dispatch(popTo("main"));
  }

  private pushFiscalConfigValidationError = () => {
    this.props.navigation.push("fiscalConfigValidationError");
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    displayInfo: state.businessState.displayInfo,
    itemSelectionMode: state.itemSelectionState.itemSelectionMode,
    uiMode: state.uiState.mode,
    selectedItems: state.itemSelectionState.selectedItems,
    stateValues: state.businessState.stateValues,
    settings: state.settings
  };
};

export default connect(mapStateToProps, {
  clearSelectedItemLines: clearSelectedItemLines.request,
  setItemSelectionMode: setItemSelectionMode.request,
  selectAllItemLines: selectAllItemLines.request,
  unselectAllItemLines: unselectAllItemLines.request
})(Main);
