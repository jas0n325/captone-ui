import * as React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  isFeatureConfigPresentAndEnabled,
  PAID_IN_EVENT,
  PAID_OUT_EVENT,
  SAFE_TO_TILL_EVENT,
  TILL_AUDIT_EVENT,
  TILL_COUNT_EVENT,
  TILL_IN_EVENT,
  TILL_OUT_EVENT,
  TILL_RECONCILIATION_EVENT,
  TILL_TO_BANK_EVENT,
  TILL_TO_SAFE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import VectorIcon from "../common/VectorIcon";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { tillManagementStyles } from "./styles";

interface StateProps {
  configManager: IConfigurationManager;
}

interface Props extends StateProps, NavigationScreenProps<"tillManagement"> {}

class TillManagementScreen extends React.Component<Props> {
  private styles: any;
  private isPaidInEnabled: boolean;
  private isPaidOutEnabled: boolean;
  private isTillInEnabled: boolean;
  private isTillOutEnabled: boolean;
  private isTillCountEnabled: boolean;
  private isTillToBankEnabled: boolean;
  private isTillReconciliationEnabled: boolean;
  private isTillToSafeEnabled: boolean;
  private isSafeToTillEnabled: boolean;
  private isTillAuditEnabled: boolean;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(tillManagementStyles());

    this.isPaidInEnabled = isFeatureConfigPresentAndEnabled(PAID_IN_EVENT, props.configManager);
    this.isPaidOutEnabled = isFeatureConfigPresentAndEnabled(PAID_OUT_EVENT, props.configManager);
    this.isTillInEnabled = isFeatureConfigPresentAndEnabled(TILL_IN_EVENT, props.configManager);
    this.isTillOutEnabled = isFeatureConfigPresentAndEnabled(TILL_OUT_EVENT, props.configManager);
    this.isTillCountEnabled = isFeatureConfigPresentAndEnabled(TILL_COUNT_EVENT, props.configManager);
    this.isTillToBankEnabled = isFeatureConfigPresentAndEnabled(TILL_TO_BANK_EVENT, props.configManager);
    this.isTillReconciliationEnabled = isFeatureConfigPresentAndEnabled(TILL_RECONCILIATION_EVENT, props.configManager);
    this.isSafeToTillEnabled = isFeatureConfigPresentAndEnabled(SAFE_TO_TILL_EVENT, props.configManager);
    this.isTillToSafeEnabled = isFeatureConfigPresentAndEnabled(TILL_TO_SAFE_EVENT, props.configManager);
    this.isTillAuditEnabled = isFeatureConfigPresentAndEnabled(TILL_AUDIT_EVENT, props.configManager);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("tillManagement")}
          backButton={{
            name: "Back",
            title: Theme.isTablet && I18n.t("storeOperations"),
            action: this.pop
          }}
        />
        <ScrollView style={[this.styles.root, this.styles.scrollViewContainer]}>
          {this.isPaidInEnabled &&
          <TouchableOpacity style={this.styles.button} onPress={() => this.openScanner(PAID_IN_EVENT)}>
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("paidIn")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isPaidOutEnabled &&
          <TouchableOpacity
            style={this.styles.button}
            onPress={() => this.openScanner(PAID_OUT_EVENT)}
          >
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("paidOut")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isTillInEnabled &&
          <TouchableOpacity
            style={this.styles.button}
            onPress={() => this.openScanner(TILL_IN_EVENT)}
          >
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("tillIn")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isTillOutEnabled &&
          <TouchableOpacity
            style={this.styles.button}
            onPress={() => this.openScanner(TILL_OUT_EVENT)}
          >
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("tillOut")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isTillCountEnabled &&
          <TouchableOpacity
            style={this.styles.button}
            onPress={() => this.openScanner(TILL_COUNT_EVENT)}
          >
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("tillCount")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isTillToBankEnabled &&
          <TouchableOpacity
            style={this.styles.button}
            onPress={() => this.openScanner(TILL_TO_BANK_EVENT)}
          >
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("tillToBank")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isTillReconciliationEnabled &&
          <TouchableOpacity
            style={this.styles.button}
            onPress={() => this.openScanner(TILL_RECONCILIATION_EVENT)}
          >
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("tillReconciliation")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isSafeToTillEnabled &&
          <TouchableOpacity
            style={this.styles.button}
            onPress={() => this.openScanner(SAFE_TO_TILL_EVENT)}
          >
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("safeToTill")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isTillToSafeEnabled &&
          <TouchableOpacity
            style={this.styles.button}
            onPress={() => this.openScanner(TILL_TO_SAFE_EVENT)}
          >
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("tillToSafe")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
          {this.isTillAuditEnabled &&
          <TouchableOpacity style={this.styles.button} onPress={() => this.openScanner(TILL_AUDIT_EVENT)}>
            <View style={this.styles.buttonContents}>
              <Text style={this.styles.buttonText}>{I18n.t("tillAudit")}</Text>
              <VectorIcon
                name="Forward"
                stroke={this.styles.chevronIcon.color}
                height={this.styles.chevronIcon.height}
                width={this.styles.chevronIcon.width}
              />
            </View>
          </TouchableOpacity>
          }
        </ScrollView>
      </BaseView>
    );
  }

  private openScanner(eventType: string): void {
    this.props.navigation.push("scanDrawer", { eventType });
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    configManager: state.settings.configurationManager
  };
};

export default connect(mapStateToProps)(TillManagementScreen);
