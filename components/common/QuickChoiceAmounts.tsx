import React from "react";
import { IMoney, Money } from "@aptos-scp/scp-component-business-core";
import { Text, TouchableOpacity, View } from "react-native";
import Theme from "../../styles";
import { quickChoiceAmountsStyles } from "./styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "./utilities";
import { DEFAULT_DECIMAL_PRECISION } from "../main/constants";
import { LocaleCurrencyOptions } from "../giftCard/IssueGiftCard";

interface Props {
  style?: any;
  quickChoiceAmounts: IMoney[];
  currency: string;
  onSelect?: (amount: IMoney) => void;
  selectedAmount?: IMoney;
}

interface State {
}

export default class QuickChoiceAmounts extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(quickChoiceAmountsStyles());
  }

  public render(): JSX.Element {
    return (
        <View style={this.styles.choiceRow}>
          {
            this.props.quickChoiceAmounts.map((amount: IMoney, index: number) => {
              const money: Money = new Money(amount.amount, this.props.currency);
              const selectedMoney: Money = this.props.selectedAmount && new Money(this.props.selectedAmount.amount, this.props.currency);
              const activeChoice = !!(selectedMoney && selectedMoney.eq(money));
              return (
                  <TouchableOpacity
                      onPress={() => this.props.onSelect(money)}
                      style={activeChoice ? this.styles.activeChoiceButton : this.styles.choiceButton}
                      key={`${index}${activeChoice}`}
                  >
                    <Text style={activeChoice ? this.styles.activeChoiceButtonText : this.styles.choiceButtonText}>
                      {this.getFormattedAmount(money)}
                    </Text>
                  </TouchableOpacity>
              );
            })
          }
        </View>
    );
  }

  private getFormattedAmount(localeCurrencyAmount: Money): string {
    const locale = getStoreLocale();
    const currencyOptions = getStoreLocaleCurrencyOptions() as LocaleCurrencyOptions;
    let localeMoney: string = localeCurrencyAmount.toLocaleString(locale, currencyOptions);
    const decimalPrecision: number = currencyOptions.precision;
    if (decimalPrecision === DEFAULT_DECIMAL_PRECISION) {
      const separator = currencyOptions.decimalSeparator;
      localeMoney = localeMoney.replace(`${separator}00`, "");
    }
    return localeMoney;
  }
}
