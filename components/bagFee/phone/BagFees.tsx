import * as React from "react";
import { Text, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IDisplayInfo } from "@aptos-scp/scp-component-store-selling-features";
import { FeeType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { SettingsState } from "../../../reducers";
import Theme from "../../../styles";
import AdderSubtractor from "../../common/AdderSubtractor";
import Header from "../../common/Header";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../../common/utilities";
import { getAcceptanceText, getUnitAmount, getBagFeesConfig } from "../../common/utilities/transactionFeeUtilities";
import { bagFeeStyles } from "./styles";
import FeedbackNote from "../../common/FeedbackNote";
import { FeedbackNoteType } from "../../../reducers/feedbackNote";


interface Props {
  displayInfo: IDisplayInfo;
  settings: SettingsState;
  currency: string;
  onAccept: (bagQuantity: number) => void;
  onSkip: () => void;
  onCancel: () => void;
}

interface State {
  bagQuantity: number;
}

export default class BagFeeprops extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(bagFeeStyles());

    if (this.props.displayInfo.transactionFeeDisplayLines &&
        this.props.displayInfo.transactionFeeDisplayLines.length > 0) {
      const feeDisplayLine =
          this.props.displayInfo.transactionFeeDisplayLines.find((line) => line.feeType === FeeType.Bag);
      if (feeDisplayLine) {
        this.state = { bagQuantity: feeDisplayLine.quantity };
      } else {
        this.state = { bagQuantity: 0 };
      }
    } else {
      this.state = { bagQuantity: 0 };
    }
  }

  public render(): JSX.Element {
    const unitCost: Money = getUnitAmount(this.props.settings.configurationManager, this.props.currency);
    const totalCost: Money = this.props.currency && unitCost ? new Money(unitCost.times(this.state.bagQuantity),
        this.props.currency) : undefined;
    const acceptanceText = getAcceptanceText(this.props.settings.configurationManager);
    const bagFeeConfig = getBagFeesConfig(this.props.settings.configurationManager);
    const bagFeeCurrency: string = bagFeeConfig?.unitAmount?.currency;
    const isCurrencyMatches: boolean = bagFeeCurrency === this.props.currency;
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("bagFee")}
          backButton={{ name: "Back", action: this.props.onCancel }}
          rightButton={{ title: isCurrencyMatches ? I18n.t("accept") : I18n.t("continue"),
            action: () => isCurrencyMatches ? this.props.onAccept(this.state.bagQuantity) :
              this.props.onSkip() }}
        />
        <View style={this.styles.bagFeePanel}>
          <Text style={this.styles.bagFeeExplainedText}>
              {acceptanceText ? acceptanceText : I18n.t("bagFeeExplanation")}</Text>
          <View style={this.styles.quantityControls}>
            <Text style={[this.styles.generalText, !isCurrencyMatches && this.styles.disabledText]}>
              {`${I18n.t("quantity")}: ${this.state.bagQuantity}`}
            </Text>
            <AdderSubtractor
                minimum={0}
                onValueUpdate={(newValue: number) => this.setState({ bagQuantity: newValue })}
                value={this.state.bagQuantity}
                disabled={!isCurrencyMatches}
            />
          </View>
          {isCurrencyMatches ?
              <>
                <View style={this.styles.generalTextArea}>
                  <Text style={this.styles.generalText}>{I18n.t("pricePerBag")}</Text>
                  <Text style={this.styles.generalText}>{unitCost && unitCost.toLocaleString
                    (getStoreLocale(), getStoreLocaleCurrencyOptions())}</Text>
                </View>
                <View style={this.styles.generalTextArea}>
                  <Text style={this.styles.generalText}>{I18n.t("totalCostOfBags")}</Text>
                  <Text style={this.styles.generalText}>{totalCost && totalCost.toLocaleString
                    (getStoreLocale(), getStoreLocaleCurrencyOptions())}</Text>
                </View>
              </> :
              <View style={this.styles.feedBackNote}>
                <FeedbackNote message={I18n.t("incorrectBagFeeText")}
                  messageTitle={I18n.t("incorrectBagFeeTitle")}
                  messageType={FeedbackNoteType.Warning}/>
              </View>
          }
        </View>
      </View>
    );
  }
}
