import * as React from "react";
import {Dimensions, Keyboard, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Dispatch} from "redux";
import {FormInstance, InjectedFormProps, reduxForm} from "redux-form";

import {Money} from "@aptos-scp/scp-component-business-core";
import {ILogger, LogManager} from "@aptos-scp/scp-component-logging";
import {IDonationButton} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import {AspectPreservedImage} from "../common/AspectPreservedImage";
import {CurrencyInput} from "../common/FieldValidation";
import { handleFormSubmission, printAmount } from "../common/utilities";
import {donationStyle} from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.donation.Donation");

interface DonationForm {
  amount: string;
}

interface Props {
  currency: string;
  roundUpAmount: Money;
  donationImage: string;
  roundUpButton: IDonationButton;
  donationButtons: IDonationButton[][];
  onDonate: (amount: string) => void;
}

class Donation extends React.Component<Props & InjectedFormProps<DonationForm, Props> &
    FormInstance<DonationForm, undefined>> {
  private styles: any;

  public constructor(props: Props & InjectedFormProps<DonationForm, Props> &
      FormInstance<DonationForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(donationStyle(Dimensions.get("screen").width));
  }

  public render(): JSX.Element {
    return Theme.isTablet ? this.renderTablet() : this.renderPhone();
  }

  private renderPhone(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <ScrollView contentContainerStyle={this.styles.container}>
          { this.renderImage() }
          { this.renderForm() }
        </ScrollView>
      </View>
    );
  }

  private renderTablet(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <View style={this.styles.leftPanel}>
          { this.renderImage() }
        </View>
        <View style={this.styles.rightPanel}>
          { this.renderForm() }
        </View>
      </View>
    );
  }

  private renderImage(): React.ReactNode {
    return this.props.donationImage && (
      <View style={this.styles.imageArea}>
        <AspectPreservedImage
            defaultSource={undefined}
            defaultSourceWidth={this.styles.imageSize.width}
            defaultSourceHeight={this.styles.imageSize.height}
            desiredSource={{ uri: this.props.donationImage }}
            rowWidth={this.styles.imageSize.width}
            rowHeight={this.styles.imageSize.height}
        />
      </View>
    ) || undefined;
  }

  private renderForm(): JSX.Element {
    return (
      <View style={this.styles.container}>
        <CurrencyInput
            name={"amount"}
            blurOnSubmit={false}
            currency={this.props.currency}
            errorStyle={this.styles.textInputError}
            placeholder={I18n.t("donationAmount")}
            style={this.styles.textInput}
            persistPlaceholder={true}
            onSubmitEditing={() => handleFormSubmission(logger, this.props.submit)}
        />
        <View style={this.styles.donateButtons}>
          <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.button, !this.props.valid && this.styles.btnDisabled]}
              disabled={!this.props.valid}
              onPress={() => handleFormSubmission(logger, this.props.submit)}
          >
            <Text style={[this.styles.btnPrimaryText, !this.props.valid && this.styles.btnTextDisabled]}>
              {I18n.t("donate")}
            </Text>
          </TouchableOpacity>
          {this.props.roundUpButton && this.props.roundUpAmount.isPositive() &&
          <TouchableOpacity style={[this.styles.btnSeconday, this.styles.button, this.styles.roundUpButton]}
                            onPress={this.updateAmount.bind(this, this.props.roundUpAmount.amount)}>
            <Text style={this.styles.btnSecondayText}>
              {I18n.t(this.props.roundUpButton.displayText.i18nCode,
                  { defaultValue: this.props.roundUpButton.displayText.default})}
            </Text>
            <Text style={this.styles.amountText}>
              {printAmount(this.props.roundUpAmount)}
            </Text>
          </TouchableOpacity>
          }
          {this.props.donationButtons?.length &&
          <View style={this.styles.amountButtons}>
            {this.props.donationButtons.map(buttons => this.renderRow(buttons))}
          </View>
          }
        </View>
      </View>
    );
  }
  private renderRow(buttons: IDonationButton[]): JSX.Element {
    return (
      <View style={this.styles.amountbuttonsRow}>
        {buttons.map(button =>
            <TouchableOpacity style={[this.styles.btnSeconday, this.styles.amountButton]}
                              onPress={this.updateAmount.bind(this, button.donationAmount)}>
              <Text style={this.styles.btnSecondayText}>
                {I18n.t(button.displayText.i18nCode, { defaultValue: button.displayText.default})}
              </Text>
            </TouchableOpacity>
        )}
        {buttons.length === 1 && <View style={this.styles.amountButton} /> }
      </View>
    );
  }

  private updateAmount(amount: string): void {
    this.props.change("amount", amount);
  }
}

export default reduxForm<DonationForm, Props>({
  form: "donation",
  validate : (values: any) => {
    const errors: { amount: string } = { amount: undefined};
    if (!values.amount) {
      errors.amount = I18n.t("donationAmountMissing");
    }
    return errors;
  },
  initialValues: { amount: undefined },
  onSubmit : (data: DonationForm, dispatch: Dispatch<any>, props: Props) => {
    props.onDonate(data.amount);
    Keyboard.dismiss();
  }
})(Donation);
