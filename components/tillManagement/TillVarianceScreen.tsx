import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";

import { TILL_AUDIT_EVENT, TILL_TO_SAFE_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import FeedbackNote from "../common/FeedbackNote";
import Header from "../common/Header";
import { getTitle18nCode } from "../common/utilities/tillManagementUtilities";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { TillVarianceScreenProps, VarianceAmount } from "./interfaces";
import { tillVarianceStyles } from "./styles";

interface Props extends TillVarianceScreenProps, NavigationScreenProps<"tillVariance"> {}

class TillVarianceScreen extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(tillVarianceStyles());

    this.renderVarianceAmounts = this.renderVarianceAmounts.bind(this);
    this.renderVarianceAmount = this.renderVarianceAmount.bind(this);
  }

  private get isTillAuditEvent(): boolean {
    return this.props.eventType === TILL_AUDIT_EVENT;
  }

  private get title(): string {
    if (this.isTillAuditEvent) {
      return this.props.noExpectedAmountInTillAudit ? undefined : I18n.t("unexpectedAmount");
    }
    return I18n.t("varianceInAmountTitle");
  }

  private get feedbackMessage(): string {
    if (this.isTillAuditEvent && this.props.noExpectedAmountInTillAudit) {
      return I18n.t("continueWithTillAudit");
    } else if (this.props.eventType === TILL_TO_SAFE_EVENT) {
      return I18n.t("noAmountInTillMessage");
    }
    return I18n.t("varianceInAmountMessage");
  }

  public render(): React.ReactNode {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={this.title}
          backButton={{
            name: "Back",
            title: Theme.isTablet ? I18n.t(getTitle18nCode(this.props.eventType)) : undefined,
            action: this.props.onExit
          }}
        />
        <View style={this.styles.root}>
          <View style={this.styles.varianceWrapper}>
            <FeedbackNote message={this.feedbackMessage} messageType={FeedbackNoteType.Info} />
            { this.renderVarianceAmounts() }
            <View style={this.styles.actions}>
              { this.renderContinueProceedButton() }
              { this.renderUpdateBalanceButton() }
              { this.renderRecountButton() }
            </View>
          </View>
        </View>
      </BaseView>
    );
  }

  private renderContinueProceedButton(): React.ReactNode {
    if (this.isTillAuditEvent) {
      return this.renderButton("continue", this.props.onTillAuditContinue)
    }
    return this.renderButton("proceed", this.props.onProceed);
  }

  private renderUpdateBalanceButton(): React.ReactNode {
    return this.isTillAuditEvent && this.renderButton("updateBalance", this.props.onUpdateBalance);
  }

  private renderRecountButton(): React.ReactNode {
    return this.renderButton("recount", this.props.onExit)
  }

  private renderVarianceAmounts(): React.ReactNode {
    return this.props.varianceAmounts?.length > 0 && (
      <View style={this.styles.varianceAmounts}>
        <Text style={this.styles.varianceHeader}>{ I18n.t("varianceAmount") }</Text>
        <View>
          { this.props.varianceAmounts.map(this.renderVarianceAmount) }
        </View>
      </View>
    );
  }

  private renderVarianceAmount(varianceAmount: VarianceAmount): React.ReactNode {
    const locale = getStoreLocale();
    const currencyOptions = getStoreLocaleCurrencyOptions();

    return (
      <View style={this.styles.varianceRow}>
        <View style={this.styles.tenderName}>
          <Text>{ `${varianceAmount.tenderName}` }</Text>
        </View>
        <View style={this.styles.tenderVariance}>
          <Text>
            { `${varianceAmount.amount.toLocaleString(locale, currencyOptions)} (${I18n.t(varianceAmount.overUnder)})` }
          </Text>
        </View>
      </View>
    );
  }

  private renderButton(i18nCode: string, onPress: () => void): React.ReactNode {
    return (
      <TouchableOpacity style={this.styles.btnSecondary} onPress={onPress}>
        <Text style={this.styles.btnSecondaryText}>{I18n.t(i18nCode)}</Text>
      </TouchableOpacity>
    )
  }
}

export default withMappedNavigationParams<typeof TillVarianceScreen>()(TillVarianceScreen);
