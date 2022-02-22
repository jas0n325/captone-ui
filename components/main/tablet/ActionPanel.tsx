import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { QualificationError } from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  IDisplayInfo,
  SSF_ITEM_API_ERROR_I18N_CODE,
  SSF_ITEM_NOT_FOUND_I18N_CODE
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { AppState, SettingsState } from "../../../reducers";
import Theme from "../../../styles";
import { InputType } from "../../common/Input";
import InTransactionActionPanel from "../../common/InTransactionActionPanel";
import NotInTransactionActionPanel from "../../common/NotInTransactionActionPanel";
import {
  IDiscountGroupInformation,
  getTransactionIsOpen,
  isTenderLineAvailable
} from "../../common/utilities";
import { isItemSearchBehaviorsIsNumeric } from "../../common/utilities/configurationUtils";
import VectorIcon from "../../common/VectorIcon";
import { mainActionPanelStyle } from "./styles";
import TotalTransaction from "./TotalTransaction";
import { getCustomerIconName } from "../../customer/CustomerUtilities";
import CameraScannerInput from "../../common/CameraScannerInput";


interface StateProps {
  displayInfo: IDisplayInfo;
  stateValues: Map<string, any>;
  settings: SettingsState;
}

interface Props extends StateProps {
  returnMode: boolean;
  mixedBasketAllowed: boolean;
  customerBannerButtonClickable: boolean;
  customerBannerButtonVisible: boolean;
  customer: Customer;
  error: Error;
  shouldDisplayCustomerNumber: boolean;
  shouldDisplayLoyaltyIndicator: boolean;
  numberOfReturnItems: number;
  onCustomerUpdate: () => void;
  onSuspendTransaction: () => void;
  onAssignSalesperson: () => void;
  onCoupon: () => void;
  onIssueGiftCard: () => void;
  onIssueGiftCertificate: () => void;
  onTransactionDiscount: () => void;
  onFastDiscount: () => void;
  onTransactionTaxExempt: () => void;
  onTransactionTaxDetails: () => void;
  onTotal: () => void;
  onResumeOfSuspendedTransactions: () => void;
  onEnterReturnMode: () => void;
  onVoidTransaction: () => void;
  onNonMerch: () => void;
  onLottery: () => void;
  onPreConfiguredDiscounts: (transactionDiscountGroup: IDiscountGroupInformation) => void;
  totalTransactionIsAllowed: boolean;
}

interface State {
  inputValue: string;
}

class ActionPanel extends React.PureComponent<Props, State> {
  private styles: any;
  private consecutiveScanning: boolean;
  private consecutiveScanDelay: number;

  constructor(props: Props) {
    super(props);

    const peripheralsConfig: any = this.props.settings.configurationManager.getPeripheralsValues();
    this.consecutiveScanning = peripheralsConfig && peripheralsConfig.scannerType &&
        peripheralsConfig.scannerType.consecutiveCameraScanning;
    this.consecutiveScanDelay = peripheralsConfig && peripheralsConfig.scannerType &&
        peripheralsConfig.scannerType.consecutiveCameraScanDelayMilliseconds;

    this.styles = Theme.getStyles(mainActionPanelStyle());

    this.state = { inputValue: "" };
  }

  public render(): JSX.Element {
    const customer: Customer = this.props.customer;
    const customerName: string = customer && (customer.fullName || I18n.t("defaultCustomerName"));
    const customerNumber: string = customer && customer.customerNumber;

    const customerBannerDisabled: boolean = !this.props.customerBannerButtonClickable || !this.terminalIsOpen;

    const customerIconName = getCustomerIconName(customer, this.props.shouldDisplayLoyaltyIndicator);

    return (
      <View style={this.styles.root}>
        <View style={this.styles.mainPanel}>
          <View style={this.styles.itemPanel}>
            <CameraScannerInput
              testID={"ActionPanel-search"}
              inputType={isItemSearchBehaviorsIsNumeric(this.props.settings.configurationManager) ?
                  InputType.numeric : InputType.text}
              value={this.state.inputValue}
              terminalIsOpen={this.terminalIsOpen}
              onChangeText={this.updateInput}
              consecutiveScanningEnabled={this.consecutiveScanning}
              consecutiveScanningDelay={this.consecutiveScanDelay}
            />
            <View style={this.styles.errorPanel}>
              {this.getErrorMessage(this.props.error)}
            </View>
          </View>
          {
            this.props.customerBannerButtonVisible &&
            <TouchableOpacity
                activeOpacity={1}
                style={[this.styles.assignCustomerBtn, !this.terminalIsOpen && this.styles.btnDisabled]}
                onPress={this.props.onCustomerUpdate}
                disabled={customerBannerDisabled}
            >
              <VectorIcon
                name={customerIconName}
                fill={customerBannerDisabled
                  ? this.styles.btnTextDisabled.color
                  : this.styles.assignCustomerIcon.color}
                height={this.styles.assignCustomerIcon.fontSize}
              />
              <Text style={[
                this.styles.assignCustomerText,
                customerBannerDisabled && this.styles.btnTextDisabled
              ]}>
                {customer
                    ? (this.props.shouldDisplayCustomerNumber ? customerNumber : customerName)
                    : I18n.t("assignCustomer")
                }
              </Text>
            </TouchableOpacity>
          }
          <View style={this.styles.actionPanel}>
            {this.getActionPanel()}
          </View>
        </View>
        {!(this.props.stateValues.get("ItemHandlingSession.isReturning") && !this.props.numberOfReturnItems) &&
          <View style={this.styles.totalPanel}>
            <TotalTransaction
              mixedBasketAllowed={this.props.mixedBasketAllowed}
              onTotal={this.props.onTotal}
              resetOnTotalPressed={() => this.resetOnTotalPressed()}
              totalTransactionIsAllowed={this.props.totalTransactionIsAllowed}
            />
          </View>
        }
      </View>
    );
  }

  private get terminalIsOpen(): boolean {
    return this.props.stateValues.get("TerminalSession.isOpen");
  }

  private getErrorMessage(error: Error): JSX.Element {
    if (error && error instanceof QualificationError) {
      const errorCode: string = error.localizableMessage.i18nCode;
      if (errorCode === SSF_ITEM_API_ERROR_I18N_CODE || errorCode === SSF_ITEM_NOT_FOUND_I18N_CODE) {
        return (
          <Text style={[this.styles.inputErrorText, this.styles.inputError]}>
            {I18n.t(errorCode)}
          </Text>
        );
      }
    }

    return undefined;
  }

  private resetOnTotalPressed(): void {
    this.updateInput("");
    Keyboard.dismiss();
  }

  private getActionPanel(): JSX.Element {
    if (!getTransactionIsOpen(this.props.stateValues)) {
      return (
        <NotInTransactionActionPanel
          onGiftCardIssue={this.props.onIssueGiftCard}
          onGiftCertificateIssue={this.props.onIssueGiftCertificate}
          onResumeOfSuspendedTransactions={this.props.onResumeOfSuspendedTransactions}
          onEnterReturnMode={this.props.onEnterReturnMode}
          onFastDiscount={this.props.onFastDiscount}
          onNonMerch={this.props.onNonMerch}
        />
      );
    } else {
      const isTenderLine: boolean = isTenderLineAvailable(this.props.displayInfo);
      return (
        <InTransactionActionPanel
          horizontal={false}
          returnMode={this.props.returnMode}
          isTenderLineAvailable = {isTenderLine}
          mixedBasketAllowed={this.props.mixedBasketAllowed}
          onEnterReturnMode={this.props.onEnterReturnMode}
          onSuspendTransaction={this.props.onSuspendTransaction}
          onAssignSalesperson={this.props.onAssignSalesperson}
          onCoupon={this.props.onCoupon}
          onGiftCardIssue={this.props.onIssueGiftCard}
          onGiftCertificateIssue={this.props.onIssueGiftCertificate}
          onTransactionTaxScreen={this.props.onTransactionTaxDetails}
          onTransactionDiscount={this.props.onTransactionDiscount}
          onFastDiscount={this.props.onFastDiscount}
          onVoidTransaction={this.props.onVoidTransaction}
          onNonMerch={this.props.onNonMerch}
          onLottery={this.props.onLottery}
          onPreConfiguredDiscounts={this.props.onPreConfiguredDiscounts}
        />
      );
    }
  }

  private updateInput = (text: string) => {
    this.setState({ inputValue: text });
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    displayInfo: state.businessState && state.businessState.displayInfo,
    stateValues: state.businessState && state.businessState.stateValues,
    settings: state.settings
  };
};

export default connect(mapStateToProps)(ActionPanel);
