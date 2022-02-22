import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  isFeatureConfigPresentAndEnabled,
  TILL_RECONCILIATION_EVENT,
  TILL_TO_BANK_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { popTo } from "../common/utilities/navigationUtils";
import { getAnotherTill18nCode, getSuccessful18nCode } from "../common/utilities/tillManagementUtilities";
import VectorIcon from "../common/VectorIcon";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { TillSuccessScreenProps } from "./interfaces";
import { tillSuccessStyles } from "./styles";

interface StateProps {
  configManager: IConfigurationManager;
}

interface Props extends TillSuccessScreenProps, StateProps, NavigationScreenProps<"tillSuccess"> {}

class TillSuccessScreen extends React.Component<Props> {
  private styles: any;
  private isTillToBankEnabled: boolean;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(tillSuccessStyles());
    this.isTillToBankEnabled = isFeatureConfigPresentAndEnabled(TILL_TO_BANK_EVENT, props.configManager);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        {
          Theme.isTablet &&
          <Header
            isVisibleTablet={true}
            backButton={<View style={this.styles.backButton} />}
          />
        }
        <View style={this.styles.root}>
          <View style={[this.styles.header, this.styles.statusBarHeight]}>
            <VectorIcon name={"Success"} height={this.styles.successIcon.fontSize} />
            <Text style={this.styles.titleText}>
              {I18n.t(getSuccessful18nCode(this.props.eventType))}
            </Text>
            <Text style={this.styles.subtitleText}>{I18n.t("tillGoBackToTransaction")}</Text>
          </View>
          <View style={this.styles.header}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.buttonMargin]}
              onPress={() => {
                this.props.eventType === TILL_TO_BANK_EVENT ?
                    this.goToStoreOperationsScreen() :
                    this.props.navigation.replace("scanDrawer", {
                      eventType: this.props.eventType
                    });
              }}
            >
              <Text style={this.styles.btnPrimaryText}>
                {I18n.t(getAnotherTill18nCode(this.props.eventType))}
              </Text>
            </TouchableOpacity>
            {this.props.eventType === TILL_RECONCILIATION_EVENT &&
             this.isTillToBankEnabled &&
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.buttonMargin, this.styles.anotherButton]}
              onPress={() => this.props.navigation.replace("scanDrawer", {
                eventType: TILL_TO_BANK_EVENT,
                continueWithPreviousDrawer: true,
                expectedAmount: this.props.actualAmount,
                previousCashDrawerKey: this.props.cashDrawerKey,
                previousAlternateKey: this.props.alternateKey,
                inputSource: this.props.inputSource
              })}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("deposit")}</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.buttonMargin, this.styles.anotherButton]}
              onPress={this.popToMain}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("goToTrx")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BaseView>
    );
  }

  private goToStoreOperationsScreen(): void {
    if (this.props.startup) {
      this.props.navigation.replace("storeOperations");
    } else {
      this.props.navigation.dispatch(popTo("storeOperations"));
    }
  }

  private popToMain = () => {
    this.props.navigation.dispatch(popTo("main"));
  }

}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    configManager: state.settings.configurationManager
  };
};
export default connect(mapStateToProps)(withMappedNavigationParams<typeof TillSuccessScreen>()(TillSuccessScreen));
