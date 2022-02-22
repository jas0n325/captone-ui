import * as React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { Customer, IDisplayInfo } from "@aptos-scp/scp-component-store-selling-features";
import { FeeType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { SettingsState } from "../../../reducers";
import { AppState } from "../../../reducers";
import Theme from "../../../styles";
import AdderSubtractor from "../../common/AdderSubtractor";
import { getStoreLocale, getStoreLocaleCurrencyOptions, printAmount } from "../../common/utilities";
import { getAcceptanceText, getUnitAmount, getBagFeesConfig } from "../../common/utilities/transactionFeeUtilities";
import { bagFeeStyles } from "./styles";
import FeedbackNote from "../../common/FeedbackNote";
import { FeedbackNoteType } from "../../../reducers/feedbackNote";

interface StateProps {
  stateValues: Map<string, any>;
}

interface Props extends StateProps {
  appLogo: any;
  settings: SettingsState;
  displayInfo: IDisplayInfo;
  currency: string;
  onAccept: (bagQuantity: number) => void;
  onSkip: () => void;
  onCancel: () => void;
}

interface State {
  bagQuantity: number;
  hasDonations: boolean;
}

class BagFee extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(bagFeeStyles());

    const hasDonations = this.props.displayInfo.donationDisplayLines.length > 0;
    if (this.props.displayInfo.transactionFeeDisplayLines &&
      this.props.displayInfo.transactionFeeDisplayLines.length > 0) {

      const feeDisplayLine =
          this.props.displayInfo.transactionFeeDisplayLines.find((line) => line.feeType === FeeType.Bag);
      if (feeDisplayLine) {
        this.state = { bagQuantity: feeDisplayLine.quantity, hasDonations };
      } else {
        this.state = { bagQuantity: 0, hasDonations };
      }
    } else {
      this.state = { bagQuantity: 0, hasDonations };
    }
  }

  public render(): JSX.Element {
    const customer: Customer = this.props.stateValues.get("transaction.customer");
    const acceptanceText = getAcceptanceText(this.props.settings.configurationManager);
    const unitCost: Money = getUnitAmount(this.props.settings.configurationManager, this.props.currency);
    const totalCost: Money = this.props.currency && unitCost ? new Money(unitCost.times(this.state.bagQuantity),
        this.props.currency) : undefined;
    const bagFeeConfig = getBagFeesConfig(this.props.settings.configurationManager);
    const bagFeeCurrency: string = bagFeeConfig?.unitAmount?.currency;
    const isCurrencyMatches: boolean = bagFeeCurrency === this.props.currency;
    return (
      <View style={this.styles.root}>
        <View style={this.styles.leftPanel}>
          <View style={this.styles.header}>
            <Image source={this.props.appLogo} style={this.styles.headerLogo} resizeMode="contain" />
          </View>
          <View style={this.styles.transaction}>
            <View style={this.styles.transactionLeft}>
              <Text style={[this.styles.transactionTextTitle, this.styles.tal]}>{I18n.t("transaction")}</Text>
              <Text style={[this.styles.transactionTextValue, this.styles.tal]}>
                {this.props.stateValues.get("transaction.number")}
              </Text>
            </View>
            <View style={this.styles.transactionRight}>
              {customer &&
              <View style={this.styles.transactionPanel}>
                <Text style={[this.styles.transactionTextTitle, this.styles.tar]}>{I18n.t("customerName")}</Text>
                <Text style={[this.styles.transactionTextValue, this.styles.tar]}>{customer.fullName}</Text>
              </View>
              }
            </View>
          </View>
          <View style={this.styles.fill}>
            <View style={this.styles.detailsArea}>
              <View style={this.styles.detailsSide}>
                { this.renderDetailTitle("subTotalCaps") }
                { this.renderDetailTitle("totalTaxCaps") }
                { this.renderDetailTitle("feeCaps") }
                { this.renderDetailTitle("discountsCaps") }
                { this.state.hasDonations && this.renderDetailTitle("donationCaps") }
                { this.renderDetailTitle("totalCaps") }
                { this.renderDetailTitle("totalTenderedCaps") }
              </View>
              <View style={[this.styles.detailsSide, this.styles.detailsRightSide]}>
                { this.renderDetailValue(this.props.stateValues.get("transaction.subTotal")) }
                { this.renderDetailValue(this.props.stateValues.get("transaction.tax")) }
                { this.renderDetailValue(this.props.stateValues.get("transaction.totalFee")) }
                { this.renderDetailValue(this.props.stateValues.get("transaction.totalSavings")) }
                { this.state.hasDonations && this.renderDetailValue(this.props.stateValues.get("transaction.donation")) }
                { this.renderDetailValue(this.props.stateValues.get("transaction.total")) }
                { this.renderDetailValue(this.props.stateValues.get("transaction.totalTendered")) }
              </View>
            </View>
            <View style={this.styles.bottomSection}>
              <View style={this.styles.fill} />
            </View>
          </View>
        </View>
        <View style={this.styles.rightPanel}>
          <View style={this.styles.titleArea}>
            <Text style={this.styles.titleText}>{I18n.t("bagFee")}</Text>
          </View>
          <View style={this.styles.controlsArea}>
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
                <Text style={this.styles.generalText}>{unitCost && unitCost.toLocaleString(getStoreLocale(),
                  getStoreLocaleCurrencyOptions())}</Text>
                </View>
                <View style={this.styles.generalTextArea}>
                  <Text style={this.styles.generalText}>{I18n.t("totalCostOfBags")}</Text>
                  <Text style={this.styles.generalText}>{totalCost &&
                    totalCost.toLocaleString(getStoreLocale(),
                      getStoreLocaleCurrencyOptions())}</Text>
                </View>
              </> :
              <View style={this.styles.feedbackNoteContainer}>
                <FeedbackNote message={I18n.t("incorrectBagFeeText")}
                  messageTitle={I18n.t("incorrectBagFeeTitle")}
                  messageType={FeedbackNoteType.Warning}
                />
              </View>
            }
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.generalButton]}
              onPress={() => isCurrencyMatches ? this.props.onAccept(this.state.bagQuantity) : this.props.onSkip() }
            >
              <Text style={this.styles.btnPrimaryText}>{isCurrencyMatches ?
                I18n.t("accept") : I18n.t("continue")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.generalButton]}
              onPress={this.props.onCancel}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  private renderDetailTitle(textToTranslate: string): JSX.Element {
    return (
      <Text style={this.styles.detailsText} adjustsFontSizeToFit numberOfLines={1}>{I18n.t(textToTranslate)}</Text>
    );
  }

  private renderDetailValue(amount: Money): JSX.Element {
    return (
      <Text style={this.styles.detailsText} adjustsFontSizeToFit numberOfLines={1}>
        {printAmount(amount)}
      </Text>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    stateValues: state.businessState.stateValues
  };
};

export default connect(mapStateToProps)(BagFee);
