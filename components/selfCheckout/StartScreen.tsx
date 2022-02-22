import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { IConfigurationManager, IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";
import { MERCHANDISE_TRANSACTION_TYPE } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, BusinessState } from "../../reducers";
import Theme from "../../styles";
import VectorIcon from "../common/VectorIcon";
import { SCOScreenKeys, SCOScreenProps } from "./common/constants";
import { startScreenStyles } from "./styles";


interface StateProps {
  businessState: BusinessState;
  configurationManager: IConfigurationManager;
}

interface Props extends StateProps, SCOScreenProps {
  toggleShowToggleModePopUp: () => void;
}

class  StartScreen extends React.Component<Props> {
  private styles: any;
  private startScreenTitle: string;
  private startScreenSubtitle: string;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(startScreenStyles());
    const selfCheckoutModeBehaviors: IConfigurationValues = props.configurationManager &&
        props.configurationManager.getFunctionalBehaviorValues().selfCheckoutModeBehaviors;
    if (selfCheckoutModeBehaviors && selfCheckoutModeBehaviors.startScreenTitle) {
      this.startScreenTitle = selfCheckoutModeBehaviors.startScreenTitle[I18n.currentLocale()];
    }
    if (selfCheckoutModeBehaviors && selfCheckoutModeBehaviors.startScreenSubtitle) {
      this.startScreenSubtitle = selfCheckoutModeBehaviors.startScreenSubtitle[I18n.currentLocale()];
    }
  }

  public componentDidUpdate(): void {
    const currentStateValues = this.props.businessState && this.props.businessState.stateValues;
    if (currentStateValues &&
        (currentStateValues.get("transaction.id") &&
        currentStateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE)) {
      this.props.navigateToNextScreen(SCOScreenKeys.ShoppingBag);
    }
  }

  public render(): JSX.Element {
    return this.props.businessState.stateValues.get("TerminalSession.isOpen")
        ? this.renderTerminalOpen()
        : this.renderTerminalClosed();
  }

  private renderTerminalOpen(): JSX.Element {
    return (
      <TouchableOpacity
        style={this.styles.root}
        onPress={() => this.props.navigateToNextScreen(SCOScreenKeys.ShoppingBag)}
      >
        <View style={this.styles.base}>
          <View style={this.styles.headingView}>
            <Text style={this.styles.titleText}>
              {this.startScreenTitle ? this.startScreenTitle : I18n.t("selfCheckout")}
            </Text>
            <Text style={this.styles.subtitleText}>
              {this.startScreenSubtitle ? this.startScreenSubtitle : I18n.t("payWithCreditOrDebit")}
            </Text>
          </View>
          <View style={this.styles.touchToStartArea}>
            <Text style={this.styles.touchToStartInstructions}>{I18n.t("scanFirstItemOr")}</Text>
            <TouchableOpacity
              style={this.styles.touchToStartButton}
              onPress={() => this.props.navigateToNextScreen(SCOScreenKeys.ShoppingBag)}
            >
              <Text style={this.styles.touchToStartButtonText}>{I18n.t("touchToStart")}</Text>
            </TouchableOpacity>
          </View>
          <View style={this.styles.stepsArea}>
            <View style={this.styles.iconArea}>
              <View style={this.styles.icon}>
                <VectorIcon
                  fill={this.styles.scannerIcon.color}
                  height={this.styles.scannerIcon.height}
                  name={"SCOScanner"}
                  stroke={this.styles.scannerIcon.borderColor}
                  width={this.styles.scannerIcon.width}
                  strokeWidth={2}
                />
              </View>
              <View style={this.styles.icon}>
                <VectorIcon
                  fill={this.styles.creditCardIcon.color}
                  height={this.styles.creditCardIcon.height}
                  name={"CreditCard"}
                  stroke={this.styles.creditCardIcon.borderColor}
                  width={this.styles.creditCardIcon.width}
                  strokeWidth={2}
                />
              </View>
              <View style={this.styles.icon}>
                <VectorIcon
                  fill={this.styles.securityTagIcon.color}
                  height={this.styles.securityTagIcon.height}
                  name={"SecurityTag"}
                  stroke={this.styles.securityTagIcon.borderColor}
                  width={this.styles.securityTagIcon.width}
                  strokeWidth={2}
                />
              </View>
            </View>
            <View style={this.styles.stepTextArea}>
              <View style={this.styles.step}><Text style={this.styles.stepText}>{`1. ${I18n.t("scan")}`}</Text></View>
              <View style={this.styles.step}><Text style={this.styles.stepText}>{`2. ${I18n.t("pay")}`}</Text></View>
              <View style={this.styles.step}>
                <Text style={this.styles.stepText}>{`3. ${I18n.t("deactivateSecurityTags")}`}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  private renderTerminalClosed(): JSX.Element {
    return (
      <TouchableOpacity
        style={this.styles.root}
        onPress={this.props.toggleShowToggleModePopUp}
      >
        <View style={this.styles.terminalClosedTextArea}>
          <Text style={this.styles.titleText}>{I18n.t("terminalIsClosed")}</Text>
          <Text style={this.styles.subtitleText}>{I18n.t("useTheNextAvailableTerminal")}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    configurationManager: state.settings.configurationManager
  };
};

export default connect(mapStateToProps)(StartScreen);
