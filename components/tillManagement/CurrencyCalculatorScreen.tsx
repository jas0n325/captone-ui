import { clone, sum } from "lodash";
import * as React from "react";
import { FlatList, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { withMappedNavigationParams } from "react-navigation-props-mapper";

import { Money } from "@aptos-scp/scp-component-business-core";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import CurrencyCalculator, { Denomination } from "../common/CurrencyCalculator";
import Header from "../common/Header";
import Spinner from "../common/Spinner";
import {
  deepObjectDifference,
  getStoreLocale,
  getStoreLocaleCurrencyOptions,
  warnBeforeLosingChanges
} from "../common/utilities";
import { getTitle18nCode } from "../common/utilities/tillManagementUtilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { CurrencyCalculatorScreenProps, CurrencyDenominator } from "./interfaces";
import { currencyCalculatorStyles } from "./styles";

interface Props extends CurrencyCalculatorScreenProps, NavigationScreenProps<"currencyCalculator"> {}

interface State {
  selectedIndex: number;
  currentAmount: CurrencyDenominator;
  calculatorSubmitLoader: boolean;
}

enum DenominationType {
  Notes= 0,
  Coins
}

class CurrencyCalculatorScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.state = {
      selectedIndex: DenominationType.Notes,
      currentAmount: this.loadInitialAmount(this.props.amount),
      calculatorSubmitLoader: false
    };

    this.styles = Theme.getStyles(currencyCalculatorStyles());
  }

  public render(): JSX.Element {
    return (
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always">
        <BaseView style={this.styles.fill}>
          <Header
              isVisibleTablet={Theme.isTablet}
              title={I18n.t(getTitle18nCode(this.props.eventType))}
              backButton={{
                name: "Back",
                action: () => warnBeforeLosingChanges(this.hasChanged(), this.pop)
              }}
              rightButton={{
                title: I18n.t("proceed"),
                action: this.submitCalculatorAmount
              }}
          />
          <View style={this.styles.root}>
            <View style={this.styles.header}>
              <View style={this.styles.textRow}>
                <Text style={this.styles.textTitle}>{I18n.t("total")}</Text>
                <Text style={this.styles.textValue}>
                  {this.state.currentAmount.total.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
                </Text>
              </View>
              <SegmentedControlTab
                  tabsContainerStyle={this.styles.tabArea}
                  activeTabStyle={this.styles.activeTabStyle}
                  activeTabTextStyle={this.styles.activeTabTextStyle}
                  tabStyle={this.styles.tabStyle}
                  tabTextStyle={this.styles.tabTextStyle}
                  values={[I18n.t("currencyNotes"), I18n.t("currencyCoins")]}
                  selectedIndex={this.state.selectedIndex}
                  onTabPress={(index: number) => { this.setState({ selectedIndex: index }); }}
              />
            </View>
            <View style={this.styles.fill}>
              <View style={this.styles.headerRow}>
                <View style={this.styles.headerTitle}></View>
                <Text style={[this.styles.headerTitle, this.styles.tac]}>{I18n.t("calculatorQty")}</Text>
                <Text style={[this.styles.headerTitle, this.styles.tar]}>{I18n.t("calculatorTotal")}</Text>
              </View>
              <FlatList data={this.state.selectedIndex === DenominationType.Notes ? this.state.currentAmount.notes :
                  this.state.currentAmount.coins}
                        renderItem={({item}) =>
                            <CurrencyCalculator currency={this.props.currency} item={item}
                                                setDenomination={this.setDenomination.bind(this)} />
                        } keyExtractor={(index) => index.toString()} />
            </View>
          </View>
          {
            this.state.calculatorSubmitLoader &&
            <Spinner overlay={true}/>
          }
        </BaseView>
      </KeyboardAwareScrollView>
    );
  }

  private submitCalculatorAmount = (): void => {
    this.setState({calculatorSubmitLoader: true}, () => this.props.onExit(this.state.currentAmount));
  }

  private hasChanged(): boolean {
    const initialTotal = this.props.amount && this.props.amount.total || new Money(0, this.props.currency);
    if (initialTotal.ne(this.state.currentAmount.total)) {
      return true;
    } else {
      return !this.props.amount ? false : !!deepObjectDifference(this.props.amount, this.state.currentAmount);
    }
  }

  private loadInitialAmount(input: CurrencyDenominator): CurrencyDenominator {
    const notes = input && input.notes || this.props.notes;
    const coins = input && input.coins || this.props.coins;
    const total = input && input.total || 0;
    return {
      notes: notes.map(clone),
      coins: coins.map(clone),
      total: new Money(total, this.props.currency)
    };
  }

  private setDenomination(item: Denomination): void {
    const denominations: Array<Denomination> = this.state.selectedIndex === DenominationType.Notes ?
        this.state.currentAmount.notes : this.state.currentAmount.coins;
    if (denominations) {
      const denomination = denominations.find((denominationItr: Denomination) => denominationItr.index === item.index);
      denomination.qty = item.qty;
      denomination.total = item.total;
      this.setState({ currentAmount: {...this.state.currentAmount, total: this.getTotal() }});
    }
  }

  private getTotal(): Money {
    const notesAmount: Money = new Money(
        sum(this.state.currentAmount.notes.map((note: Denomination) => note.total)), this.props.currency);
    const coinsAmount: Money = new Money(
        sum(this.state.currentAmount.coins.map((coin: Denomination) => coin.total)), this.props.currency);
    return notesAmount.plus(coinsAmount);
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

export default withMappedNavigationParams<typeof CurrencyCalculatorScreen>()(CurrencyCalculatorScreen);
