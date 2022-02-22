import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager, QualificationError } from "@aptos-scp/scp-component-store-selling-core";
import {
  ICustomerLoyaltyMembership,
  IDisplayInfo,
  IItemDisplayLine,
  ILoyaltyRewardReason,
  SSF_ITEM_API_ERROR_I18N_CODE,
  SSF_ITEM_NOT_FOUND_I18N_CODE
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import {
  ActionCreator,
  clearSelectedItemLines,
  ItemSelectionMode,
  removeRedemption,
  selectAllItemLines,
  selectItemLine,
  setItemSelectionMode,
  setSelectionEnabled,
  unselectAllItemLines
} from "../../../actions";
import {
  AppState,
  ISelectedRedemptions,
  UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY,
  UiState
} from "../../../reducers";
import Theme from "../../../styles";
import Display from "../../common/Display";
import Header from "../../common/Header";
import ItemLine from "../../common/ItemLine";
import LoyaltyRedemptionList from "../../common/LoyaltyRedemptionList";
import { getStoreLocale, getStoreLocaleCurrencyOptions, renderNumber } from "../../common/utilities";
import { DiscountType } from "../../discounts/constants";
import OfflineAuthorization from "../../payment/OfflineAuthorization";
import PaymentOptions from "../../payment/PaymentOptions";
import { getCurrentRouteNameWithNavigationRef } from "../../RootNavigation";
import { MainComponentCommonProps, RADIX } from "../constants";
import { mainStyle } from "./styles";
import TransactionBar from "./TransactionBar";
import { withActionPanel } from "./withActionPanel";


interface StateProps {
  businessStateError: Error;
  businessStateInProgress: boolean;
  currentScreenName: string;
  displayInfo: IDisplayInfo;
  itemSelectionMode: ItemSelectionMode;
  selectedItems: number[];
  selectedLoyaltyMembership: ICustomerLoyaltyMembership;
  selectedRedemptions: ISelectedRedemptions[];
  stateValues: Map<string, any>;
  uiState: UiState;
  configurationManager: IConfigurationManager;
}

interface DispatchProps {
  clearSelectedItemLines: ActionCreator;
  selectAllItemLines: ActionCreator;
  setItemSelectionMode: ActionCreator;
  setSelectionEnabled: ActionCreator;
  unselectAllItemLines: ActionCreator;
  removeRedemption: ActionCreator;
  selectItemLine: ActionCreator;
}

interface Props extends MainComponentCommonProps, StateProps, DispatchProps {
  stoppedItem?: IItemDisplayLine;
  shouldPromptForAdditionalInfo: boolean;
  togglePromptForAdditionalInfo: () => void;
  headerTitle: string;
  discount: boolean;
  discountType: DiscountType;
  returnMode: boolean;
  chosenMultiSelectAction: boolean;
  shouldShowTransactionSummary: boolean;
  totalNumberOfItems: number;
  multipleOrAllLinesSelected: boolean;
  noLinesSelected: boolean;
}

interface State {
  offlineAuth: boolean;
}

class Main extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(mainStyle());

    this.state = {
      offlineAuth: false
    };
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (this.props.currentScreenName !== "main") {
      return;
    }

    if (this.props.uiState.mode === UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY && !this.props.businessStateInProgress &&
        prevProps.businessStateInProgress && this.props.businessStateError &&
        this.props.businessStateError instanceof QualificationError) {
      const error: QualificationError = this.props.businessStateError;
      const errorCode: string = error.localizableMessage.i18nCode;
      const itemKey: string = error.collectedData.get("itemKey");
      const itemKeyType: string = error.collectedData.get("itemKeyType");
      const inputSource: string = error.collectedData.get("inputSource");

      if (itemKey && (errorCode === SSF_ITEM_NOT_FOUND_I18N_CODE || errorCode === SSF_ITEM_API_ERROR_I18N_CODE)) {
        this.props.navigation.push("notOnFile", { itemKey, itemKeyType, inputSource });
      }
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  public render(): JSX.Element {
    const allItemsAreSelected: boolean = this.props.itemSelectionMode === ItemSelectionMode.All ||
        (this.props.displayInfo?.itemDisplayLines.length &&
         this.props.displayInfo.itemDisplayLines.length === this.props.selectedItems.length);
    const shouldShowSelectionPanel: boolean = this.props.canSelectItems &&
        this.props.itemSelectionMode !== ItemSelectionMode.Single && !this.props.chosenMultiSelectAction &&
        !this.props.shouldShowTransactionSummary;

    const backButton = this.props.returnMode
      ? { name: "Back", action: this.props.onExitReturnMode }
      : { name: "Menu", action: this.props.onMenuToggle };

    return (
      <View style={this.styles.root}>
        <Header
          title={this.props.headerTitle}
          testID="MainScreen"
          backButton={!this.props.printReceipt && backButton}
          returnMode={this.props.returnMode}
          image={!this.props.headerTitle && this.props.appLogo}
          isVisibleTablet
        />
        <View style={this.styles.mainRow}>
          <View style={this.styles.leftPanel}>
            <TransactionBar
              allItemsSelected={allItemsAreSelected}
              shouldShowSelectionPanel={shouldShowSelectionPanel}
              onSelectionModePress={() => this.handleSelectionModeButtonPress(allItemsAreSelected)}
              choseMultiSelectAction={this.props.chosenMultiSelectAction}
              selectedItemsCount={this.props.selectedItems.length}
              multiSelectEnabled={this.props.canSelectItems}
            />
            <View style={this.styles.display}>
              { this.getLeftPanel() }
            </View>
          </View>
          {
            !this.state.offlineAuth && (
              <View style={this.styles.rightPanel}>
                { this.props.children }
              </View>
            )
          }
          {
            (this.props.showOfflineOptions || this.props.showRetryAuthorization) && (
              <PaymentOptions
                retryOnlyAuthMode={this.props.showRetryAuthorization}
                onOfflineAuthorization={this.handleOfflineAuthorization}
                cancelOffline={this.cancelOffline}
                onRetry={this.retryAuthorization}
              />
            )
          }
          {
            this.state.offlineAuth && (
              <View style={this.styles.fill}>
                <View style={this.styles.titleArea}>
                  <Text style={this.styles.titleText}>{I18n.t("offlineAuthorization")}</Text>
                </View>
                <OfflineAuthorization
                  onCancel={this.clearOfflineAuth}
                  isGiftCardIssue={true}
                  navigation={this.props.navigation}
                />
              </View>
            )
          }
        </View>
      </View>
    );
  }

  private handleSelectionModeButtonPress = (allItemsAreSelected: boolean): void => {
    if (this.props.noLinesSelected) {
      this.props.setItemSelectionMode(ItemSelectionMode.Multiple);
    } else if (this.props.itemSelectionMode === ItemSelectionMode.All || allItemsAreSelected) {
      this.props.unselectAllItemLines();
    } else if (this.props.itemSelectionMode === ItemSelectionMode.Multiple) {
      this.props.selectAllItemLines();
    }
  }

  private clearOfflineAuth = () => {
    this.setState({ offlineAuth: false });
  }

  private retryAuthorization = (): void => {
    this.props.handleRetryAuthorization();
  }

  private handleOfflineAuthorization = (): void => {
    this.setState({ offlineAuth: true });
    this.props.handleOfflineOptions();
  }

  private cancelOffline = (): void => {
    this.setState({ offlineAuth: false });
    this.props.handleCancelOfflineAuthorization();
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private getLeftPanel(): JSX.Element {
    if (this.props.stoppedItem) {
      return <ItemLine line={this.props.stoppedItem} hideImage={true} style={this.styles.itemLine} />;
    } else if (this.props.shouldShowTransactionSummary) {
      const { stateValues } = this.props;
      const locale = getStoreLocale();

      if (this.props.discount && this.props.discountType === DiscountType.Loyalty &&
          this.props.selectedLoyaltyMembership) {
        const {
          availablePointBalance,
          loyaltyPlan
        } = this.props.selectedLoyaltyMembership;

        const loyaltyMembership = this.props.customer.loyaltyMemberships.find(
            (membership: ICustomerLoyaltyMembership) => membership.loyaltyPlanKey === loyaltyPlan.loyaltyPlanKey);
        const availablePoints = loyaltyPlan.currentTransactionPointsAvailableImmediately ?
            availablePointBalance :
            loyaltyMembership.availablePointBalance;

        let redeemed = 0;
        if (this.props.selectedRedemptions && this.props.selectedRedemptions.length > 0) {
          const selectedRedemptions = this.props.selectedRedemptions.find((selected: ISelectedRedemptions) =>
              selected.loyaltyPlanKey === loyaltyPlan.loyaltyPlanKey);
          if (selectedRedemptions) {
            selectedRedemptions.redemptions.forEach((redemption: ILoyaltyRewardReason) => {
              if (loyaltyPlan.loyaltyPlanKey === redemption.loyaltyPlanKey) {
                redeemed += redemption.pointsToDeduct;
              }
            });
          }
        }

        return (
          <ScrollView style={this.styles.loyaltyDiscount}>
            <View style={this.styles.loyaltyPlan}>
              <Text
                style={[ this.styles.memberPlanText, this.styles.memberPlanBoldText ]}
                numberOfLines={2}
              >
                { loyaltyPlan.description || loyaltyPlan.name }
              </Text>
              <View style={this.styles.memberPlanPoints}>
                <Text style={this.styles.memberPlanText}>
                  { I18n.t("available") }
                </Text>
                <Text style={this.styles.memberPlanText}>
                  { renderNumber(availablePoints) }
                </Text>
              </View>
              <View style={this.styles.memberPlanPoints}>
                <Text style={this.styles.memberPlanText}>
                  { I18n.t("redeemed") }
                </Text>
                <Text style={this.styles.memberPlanText}>
                  { renderNumber(redeemed) }
                </Text>
              </View>
              <View style={this.styles.memberPlanPoints}>
                <Text style={[ this.styles.memberPlanText, this.styles.memberPlanBoldText ]}>
                  {I18n.t("remaining")}
                </Text>
                <Text style={[ this.styles.memberPlanText, this.styles.memberPlanBoldText ]}>
                  {renderNumber(availablePoints - redeemed)}
                </Text>
              </View>
            </View>
            {
              this.props.selectedRedemptions &&
              this.props.selectedRedemptions.length > 0 &&
              this.props.selectedRedemptions.map((selectedRedemption: ISelectedRedemptions) => (
                <LoyaltyRedemptionList
                  allowVoid={true}
                  loyaltyPlan={selectedRedemption.loyaltyPlan}
                  loyaltyRedemptions={selectedRedemption.redemptions}
                  onVoid={(redemption: ILoyaltyRewardReason) => this.onVoidRedemption(redemption)}
                />
              ))
            }
          </ScrollView>
        );
      } else {
        const zeroAmount = I18n.toCurrency(0, {
          delimiter: "",
          separator: I18n.t("currency.format.decimalSeparator"),
          precision: Number.parseInt(
            I18n.t("currency.format.precision", { locale }),
            RADIX
          )
        });
        const zeroCurrency = new Money(
          0.0,
          stateValues.get("transaction.accountingCurrency")
        );
        const transactionSubTotal: Money =
          (stateValues && stateValues.get("transaction.subTotal")) ||
          zeroCurrency;

        const transactionTax: Money =
          (stateValues && stateValues.get("transaction.tax")) || zeroCurrency;
        const transactionTotalSavings: Money =
          (stateValues && stateValues.get("transaction.totalSavings")) ||
          zeroCurrency;
        const transactionBalanceDue: Money =
          (stateValues && stateValues.get("transaction.balanceDue")) ||
          zeroCurrency;

        return (
          <View style={this.styles.transactionDiscount}>
            <View style={this.styles.transactionLine}>
              <Text style={this.styles.transactionLineText}>
                {I18n.t("subTotalCaps")}
              </Text>
              <Text style={[ this.styles.transactionLineText, this.styles.totalTransactionLineText ]}>
                {
                  (transactionSubTotal &&
                   transactionSubTotal.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())) || zeroAmount
                }
              </Text>
            </View>
            <View style={this.styles.transactionLine}>
              <Text style={this.styles.transactionLineText}>
                { I18n.t("totalTaxCaps") }
              </Text>
              <Text style={[ this.styles.transactionLineText, this.styles.totalTransactionLineText ]}>
                {
                  (transactionTax &&
                   transactionTax.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())) || zeroAmount
                }
              </Text>
            </View>
            <View style={this.styles.transactionLine}>
              <Text style={this.styles.transactionLineText}>
                { I18n.t("discountsCaps") }
              </Text>
              <Text style={[ this.styles.transactionLineText, this.styles.totalTransactionLineText]}>
                {
                  transactionTotalSavings &&
                  transactionTotalSavings.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())
                }
              </Text>
            </View>
            <View style={[ this.styles.transactionLine, this.styles.lastTransactionLine ]}>
              <Text style={this.styles.transactionLineText}>
                { I18n.t("totalCaps") }
              </Text>
              <Text style={[ this.styles.transactionLineText, this.styles.totalTransactionLineText ]}>
                {
                  transactionBalanceDue?.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions()) || zeroAmount
                }
              </Text>
            </View>
          </View>
        );
      }
    } else {
      return (
        <Display
          customerTags={this.props.customer && this.props.customer.tags}
          transactionVoided={this.props.transactionVoided}
          onFiscalConfigValidationError={this.pushFiscalConfigValidationError}
        />
      );
    }
  }

  private onVoidRedemption = (redemption: ILoyaltyRewardReason): void => {
    this.props.removeRedemption(redemption);
  }

  private pushFiscalConfigValidationError = () => {
    this.props.navigation.push("fiscalConfigValidationError");
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessStateError: state.businessState.error,
    businessStateInProgress: state.businessState.inProgress,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    displayInfo: state.businessState.displayInfo,
    itemSelectionMode: state.itemSelectionState.itemSelectionMode,
    selectedItems: state.itemSelectionState.selectedItems,
    selectedLoyaltyMembership:
      state.loyaltyMembershipState.selectedLoyaltyMembership,
    selectedRedemptions: state.loyaltyMembershipState.selectedRedemptions,
    stateValues: state.businessState.stateValues,
    uiState: state.uiState,
    configurationManager: state.settings.configurationManager
  };
};

const mapDispatchToProps = {
  clearSelectedItemLines: clearSelectedItemLines.request,
  selectAllItemLines: selectAllItemLines.request,
  setItemSelectionMode: setItemSelectionMode.request,
  setSelectionEnabled: setSelectionEnabled.request,
  unselectAllItemLines: unselectAllItemLines.request,
  removeRedemption: removeRedemption.request,
  selectItemLine: selectItemLine.request
};

const ConnectedMain = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(Main);

export default withActionPanel(ConnectedMain);
