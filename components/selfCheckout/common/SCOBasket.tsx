import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";

import I18n from "../../../../config/I18n";
import { AppState, BusinessState } from "../../../reducers";
import Theme from "../../../styles";
import { SCODiscountLine } from "./SCODiscountLine";
import { SCOFeeLine } from "./SCOFeeLine";
import SCOItemLine from "./SCOItemLine";
import SCOTotalsBar from "./SCOTotalsBar";
import { scoBasketStyles } from "./styles";


interface StateProps {
  businessState: BusinessState;
}

interface Props extends StateProps {
  isOnShoppingBagScreen: boolean;
}

interface State {}

class SCOBasket extends React.Component<Props, State> {
  private scrollView: ScrollView;
  constructor(props: Props) {
    super(props);
  }

  public render(): JSX.Element {
    const styles = Theme.getStyles(scoBasketStyles());
    const transactionHasItems = this.props.businessState.displayInfo &&
          this.props.businessState.displayInfo.itemDisplayLines.length > 0;

    const { stateValues } = this.props.businessState;
    const zeroCurrency = stateValues.get("transaction.accountingCurrency") ?
        new Money(0.00, stateValues.get("transaction.accountingCurrency")) : undefined;
    const transactionSubTotal: Money = stateValues && stateValues.get("transaction.subTotal") || zeroCurrency;
    const transactionSavings: Money = stateValues && stateValues.get("transaction.totalSavings") || zeroCurrency;
    const transactionTotalTendered: Money = stateValues && stateValues.get("transaction.totalTendered") || zeroCurrency;

    return (
      <View style={styles.basket}>
        <View style={styles.basketHeaderArea}>
          <Text style={styles.basketTitle}>{I18n.t("basket")}</Text>
          <View style={styles.basketColumnLabelArea}>
            <Text style={styles.basketColumnLabelText}>{I18n.t("item")}</Text>
            <Text style={styles.basketColumnLabelText}>{I18n.t("price")}</Text>
          </View>
        </View>
        {transactionHasItems ? this.createItemDisplayList(styles) : (
          <View style={styles.noItemsListArea}>
            <Text style={styles.emptyBasketText}>{I18n.t("scanYourFirstItem")}</Text>
          </View>
        )}
        {transactionSubTotal &&
          <SCOTotalsBar
            isOnShoppingBagScreen={this.props.isOnShoppingBagScreen}
            transactionSubTotal={transactionSubTotal}
            transactionSavings={transactionSavings}
            transactionTotalTendered={transactionTotalTendered}
          />
        }
      </View>
    );
  }

  private createItemDisplayList(styles: {itemListArea: any; discountSection: any}): JSX.Element {
    const {
      itemDisplayLines,
      transactionFeeDisplayLines,
      transactionDiscountDisplayLines
    } = this.props.businessState.displayInfo;
    return (
        <ScrollView
          ref = {(ref) => this.scrollView = ref}
          onContentSizeChange={(contentWidth, contentHeight) => {
            this.scrollView.scrollToEnd({animated: true});
          }}
          style={styles.itemListArea}
          scrollEnabled={true}
        >
          {
            itemDisplayLines && itemDisplayLines.map((item) => <SCOItemLine itemDisplayLine={item} />)
          }
          <View style={styles.discountSection}>
            {
              transactionDiscountDisplayLines && transactionDiscountDisplayLines.length >= 1 &&
              <SCODiscountLine
                discountDisplayLines={transactionDiscountDisplayLines}
                currency = {this.props.businessState.stateValues.get("transaction.accountingCurrency")}
              />
            }
            {
              transactionFeeDisplayLines &&
              transactionFeeDisplayLines.map((item) => <SCOFeeLine feeDisplayLine={item}/>)
            }
          </View>
        </ScrollView>
      );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState
  };
}

export default connect(mapStateToProps)(SCOBasket);

