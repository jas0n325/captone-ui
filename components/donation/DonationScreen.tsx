import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { Money, RoundingRule } from "@aptos-scp/scp-component-business-core";
import { DeviceIdentity, IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  IDonationButton,
  IDonationDefinition,
  MAKE_DONATION_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { DonationAmountType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation } from "../../actions";
import { AppState, BusinessState} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { getCurrencyCode, getFeatureAccessConfig } from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import Donation from "./Donation";
import { DonationScreenProps } from "./interfaces";
import { donationScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
  configManager: IConfigurationManager;
  deviceIdentity: DeviceIdentity;
  retailLocationCurrency: string;
  appResources: Map<string, string>;
}

interface DispatchProps {
  businessOperation: ActionCreator;
}

interface Props extends DonationScreenProps, StateProps, DispatchProps, NavigationScreenProps<"donation"> {}

interface State {
}

class DonationScreen extends React.Component<Props, State> {
  private currency: string;
  private roundUpAmount: Money;
  private definitionKey: string;
  private donationDefinition: IDonationDefinition;
  private roundUpButton: IDonationButton;
  private donationButtons: IDonationButton[][];
  private styles: any;

  public constructor(props: Props) {
    super(props);

    const donationDefinitions = props.configManager.getFunctionalBehaviorValues().donationBehaviors?.
        donationDefinitions;
    const donationFeature = getFeatureAccessConfig(props.configManager, MAKE_DONATION_EVENT);

    this.currency = getCurrencyCode(this.props.businessState.stateValues, this.props.retailLocationCurrency);
    this.definitionKey = donationFeature.donationDefinitionKey.find((key) => !!donationDefinitions[key]);
    this.donationDefinition = donationDefinitions[this.definitionKey];

    this.roundUpButton = donationFeature.donationButtonRows?.find(
        (button) => button.donationAmountType === DonationAmountType.RoundUpTotalDue);
    this.donationButtons = donationFeature.donationButtonRows?.filter(
        (button) => button.donationAmountType === DonationAmountType.FixedAmount)
        .reduce((resultArray, item, index) => {
          const chunkIndex = Math.floor(index/2)
          if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
          }

          resultArray[chunkIndex].push(item);
          return resultArray
        }, []);

    if (this.roundUpButton) {
      const balanceDue = this.props.businessState.stateValues.get("transaction.balanceDue");
      const roundedAmount = balanceDue.roundToDenomination(1, RoundingRule.AlwaysUp);
      this.roundUpAmount = roundedAmount.minus(balanceDue);
    }

    this.styles = Theme.getStyles(donationScreenStyles());

    this.state = {};
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.businessState.eventType === MAKE_DONATION_EVENT && prevProps.businessState.inProgress &&
        !this.props.businessState.inProgress && !this.props.businessState.error) {
      this.props.onExit();
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={true}
          title={I18n.t(this.donationDefinition.donationName.i18nCode,
              { defaultValue: this.donationDefinition.donationName.default } )}
          backButton={{ name: "Back", action: this.props.onCancel }}
          rightButton={{ title: I18n.t("skip"), action: this.props.onSkip }}
        />
        <Donation
          currency={this.currency}
          roundUpAmount={this.roundUpAmount}
          donationImage={this.props.appResources.get(this.donationDefinition.donationImage)}
          roundUpButton={this.roundUpButton}
          donationButtons={this.donationButtons}
          onDonate={this.handleDonate.bind(this)}
        />
      </BaseView>
    );
  }

  private handleDonate(amount: string): void {
    let donationType: DonationAmountType = undefined;
    const donationAmount = new Money(amount, this.currency);
    if (this.roundUpAmount && this.roundUpAmount.eq(donationAmount)) {
      donationType = DonationAmountType.RoundUpTotalDue;
    } else if (this.donationButtons?.length) {
      for (const buttonsRow of this.donationButtons) {
        const fixedAmount = buttonsRow.find(
            button => new Money(button.donationAmount, this.currency).eq(donationAmount));
        if (fixedAmount) {
          donationType = DonationAmountType.FixedAmount;
          break;
        }
      }
    }

    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.DONATION_CODE, this.definitionKey));
    uiInputs.push(new UiInput(UiInputKey.DONATION_AMOUNT, amount));
    if (donationType) {
      uiInputs.push(new UiInput(UiInputKey.DONATION_AMOUNT_TYPE, donationType));
    }
    this.props.businessOperation(this.props.deviceIdentity, MAKE_DONATION_EVENT, uiInputs);
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    configManager: state.settings && state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity,
    retailLocationCurrency: state.settings.retailLocationCurrency,
    appResources: state.appResources.resources
  };
}
export default connect(mapStateToProps, {
  businessOperation: businessOperation.request
})(withMappedNavigationParams<typeof DonationScreen>()(DonationScreen));
