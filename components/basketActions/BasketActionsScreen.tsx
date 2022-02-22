import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IDisplayInfo } from "@aptos-scp/scp-component-store-selling-features";

import { ItemSelectionMode } from "../../actions";
import { AppState, UI_MODE_ITEM_SELECTION } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import InTransactionActionPanel from "../common/InTransactionActionPanel";
import ItemSelectionActionPanel from "../common/ItemSelectionActionPanel";
import NotInTransactionActionPanel from "../common/NotInTransactionActionPanel";
import { getTransactionIsOpen, isTenderLineAvailable } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { getTestIdProperties } from "../common/utilities/utils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { BasketActionsScreenProps } from "./interfaces";
import { basketActionsScreenStyles } from "./styles";

interface StateProps {
  itemSelectionMode: ItemSelectionMode;
  stateValues: Readonly<Map<string, any>>;
  uiMode: string;
  displayInfo: IDisplayInfo;
}

interface Props extends BasketActionsScreenProps, StateProps, NavigationScreenProps<"basketActions"> {}

class BasketActionsScreen extends React.PureComponent<Props> {
  private styles: any;
  private testID: string;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(basketActionsScreenStyles());
    this.testID = "BasketActionsScreen";
  }

  public render(): JSX.Element {
    const isTenderLine: boolean = isTenderLineAvailable(this.props.displayInfo);

    return (
      <BaseView style={this.styles.root}>
        <Header
          testID={this.testID}
          backButton={{
            action: this.popToMain,
            name: "Cancel",
            ...getTestIdProperties(this.testID, "crossButton")
          }}
        />
        {
          !getTransactionIsOpen(this.props.stateValues) &&
          <NotInTransactionActionPanel
            onEnterReturnMode={this.props.onEnterReturnMode}
            onFastDiscount={this.props.onFastDiscount}
            onGiftCardIssue={this.props.onIssueGiftCard}
            onGiftCertificateIssue={this.props.onIssueGiftCertificate}
            onNonMerch={this.props.onNonMerch}
            onResumeOfSuspendedTransactions={this.props.onResumeOfSuspendedTransactions}
          />
        }
        {
          getTransactionIsOpen(this.props.stateValues) &&
          <>
            {
              !this.inItemSelection &&
              <InTransactionActionPanel
                horizontal={true}
                isTenderLineAvailable = {isTenderLine}
                mixedBasketAllowed={this.props.mixedBasketAllowed}
                onAssignSalesperson={this.props.onAssignSalesperson}
                onVoidTransaction={this.props.onVoidTransaction}
                onCoupon={this.props.onCoupon}
                onEnterReturnMode={this.props.onEnterReturnMode}
                onFastDiscount={this.props.onFastDiscount}
                onGiftCardIssue={this.props.onIssueGiftCard}
                onGiftCertificateIssue={this.props.onIssueGiftCertificate}
                onNonMerch={this.props.onNonMerch}
                onSuspendTransaction={this.props.onSuspendTransaction}
                onTransactionDiscount={this.props.onTransactionDiscount}
                onTransactionTaxScreen={this.props.onTransactionTaxDetails}
                returnMode={this.inReturnMode}
                onLottery={this.props.onLottery}
                onPreConfiguredDiscounts={this.props.onPreConfiguredDiscounts}
              />
            }
            {
              this.inItemSelection &&
              <ItemSelectionActionPanel
                clearSelectedItemLines={this.props.clearSelectedItemLines}
                horizontal={true}
                onAssignSalesperson={this.props.onAssignSalesperson}
                onItemDiscount={this.props.onItemDiscount}
                onTaxPress={this.props.onItemTaxDetails}
                navigation={this.props.navigation}
              />
            }
          </>
        }
      </BaseView>
    );
  }

  private get inItemSelection(): boolean {
    return this.props.uiMode === UI_MODE_ITEM_SELECTION || this.props.itemSelectionMode !== ItemSelectionMode.None;
  }

  private get inReturnMode(): boolean {
    return this.props.stateValues && this.props.stateValues.get("ItemHandlingSession.isReturning");
  }

  private popToMain = () => {
    this.props.navigation.dispatch(popTo("main"));
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  itemSelectionMode: state.itemSelectionState.itemSelectionMode,
  stateValues: state.businessState && state.businessState.stateValues,
  uiMode: state.uiState.mode,
  displayInfo: state.businessState.displayInfo
});

export default connect(mapStateToProps)(withMappedNavigationParams<typeof BasketActionsScreen>()(BasketActionsScreen));
