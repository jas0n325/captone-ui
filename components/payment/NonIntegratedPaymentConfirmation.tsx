import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import Header from "../common/Header";
import { printAmount } from "../common/utilities";
import { nonIntegratedPaymentConfirmationStyles } from "./styles";


export interface Props {
  settings: SettingsState;
  onSave: () => void;
  onCancel: () => void;
  stateValues: Map<string, any>;
  amountDue?: string;
}

export interface State {}

export default class NonIntegratedPaymentConfirmation extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(nonIntegratedPaymentConfirmationStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("nonIntegratedConfirmation")}
          titleStyle={this.styles.headerTitle}
          backButton={{name: "Back", action: this.props.onCancel}}
          rightButton={{ title: I18n.t("confirm"), action: () => this.props.onSave()}}
        />
        <View style={this.styles.fill}>
          <View style={this.styles.topSection}>
            <View style={this.styles.formArea}>
              <View style={this.styles.amountDueTextArea}>
                <Text style={this.styles.amountDueTitle}>{this.getAmountText()}</Text>
                <Text style={this.styles.amountDueAmount}>
                  {
                    this.props.amountDue ||
                    (this.props.stateValues.get("TenderAuthorizationSession.authorizationAmount") &&
                    printAmount(!this.isRefund() ?
                        this.props.stateValues.get("TenderAuthorizationSession.authorizationAmount") :
                        this.props.stateValues.get("TenderAuthorizationSession.authorizationAmount").times(-1)))
                  }
                </Text>
              </View>
              <Text style={this.styles.informationText}>
                {I18n.t("nonIntegratedConfirmationInstructions")}
              </Text>
            </View>
          </View>
          {
            Theme.isTablet &&
            <View style={this.styles.buttonsArea}>
              <TouchableOpacity
                onPress={() => this.props.onSave()}
                style={[this.styles.btnPrimary, this.styles.button]}
              >
                <Text style={this.styles.btnPrimaryText}>
                  {I18n.t("confirm")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.props.onCancel()}
                style={[this.styles.btnSeconday, this.styles.button]}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
      </View>
    );
  }

  private getAmountText(): string {
    return !this.isRefund() ? I18n.t("amountDue") : I18n.t("refundDueCaps");
  }

  private isRefund(): boolean {
    return this.props.stateValues.get("transaction.balanceDue") &&
        this.props.stateValues.get("transaction.balanceDue").isNegative();
  }
}
