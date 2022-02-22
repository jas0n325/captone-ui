import * as React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  IConfigurationManager,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_DISCOUNT_EVENT,
  IDiscountDisplayLine,
  UiInputKey,
  VOID_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation } from "../../actions";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import DiscountLine from "../common/DiscountLine";
import Header from "../common/Header";
import { IButtonLayoutInformation } from "../common/utilities/discountUtilities";
import { DiscountLevel, DiscountType } from "./constants";
import { PreConfiguredDiscountsScreenProps } from "./interfaces";
import { preConfiguredDiscountsScreenStyles } from "./styles";
import { NavigationProp } from "../StackNavigatorParams";

interface StateProps {
  transactionDiscountDisplayLines: IDiscountDisplayLine[];
  deviceIdentity: DeviceIdentity;
  configManager: IConfigurationManager;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props
  extends PreConfiguredDiscountsScreenProps,
    StateProps,
    DispatchProps {
  navigation: NavigationProp;
}

class PreConfiguredDiscounts extends React.Component<Props> {
  private styles: any;
  private discountDefinitions: any;
  private discountButtons: IButtonLayoutInformation[];

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(preConfiguredDiscountsScreenStyles());

    const discountsConfig = props.configManager.getDiscountsValues();

    this.discountDefinitions = discountsConfig?.discountDefinitions;

    if (this.discountDefinitions) {
      this.discountButtons = Object.values(
        props.transactionDiscountGroup.buttonLayout
      )
        .filter(
          (button) =>
            !!button.discountDefinition &&
            !isNaN(button.displayOrder) &&
            !!this.discountDefinitions[button.discountDefinition]
        )
        .sort(
          (button1, button2) => button1.displayOrder - button2.displayOrder
        );
    }
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t(
            this.props.transactionDiscountGroup.groupButtonText.i18nCode,
            {
              defaultValue:
                this.props.transactionDiscountGroup.groupButtonText.default
            }
          )}
          backButton={{
            name: "Back",
            action: this.props.onExit
          }}
        />
        <View style={this.styles.content}>
          <View>
            <FlatList
              data={this.discountButtons}
              renderItem={({ item }) => (
                <View style={this.styles.row}>
                  <TouchableOpacity
                    onPress={() =>
                      this.handleClickedDiscount(item.discountDefinition)
                    }
                  >
                    <Text style={this.styles.discountText}>
                      {I18n.t(
                        this.discountDefinitions[item.discountDefinition]
                          .displayText.i18nCode,
                        {
                          defaultValue:
                            this.discountDefinitions[item.discountDefinition]
                              .displayText.default
                        }
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
          {Theme.isTablet && (
            <View style={this.styles.buttonArea}>
              <TouchableOpacity
                style={this.styles.button}
                onPress={this.props.onExit}
              >
                <Text style={this.styles.btnSecondayText}>
                  {I18n.t("cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {this.props.transactionDiscountDisplayLines?.length > 0 && (
            <View style={this.styles.appliedDiscounts}>
              <Text style={this.styles.appliedDiscountText}>
                {I18n.t("appliedDiscounts")}
              </Text>
              <FlatList
                style={this.styles.discountList}
                data={this.props.transactionDiscountDisplayLines}
                renderItem={({ item }) => (
                  <DiscountLine
                    discountLine={item}
                    onDiscount={(
                      discountLevel: DiscountLevel,
                      discountType: DiscountType,
                      discountDisplayLine: IDiscountDisplayLine
                    ) => {
                      if (!discountDisplayLine.isLoyaltyDiscount) {
                        this.props.onDiscount(
                          discountLevel,
                          discountType,
                          discountDisplayLine
                        );
                      }
                    }}
                    onVoid={this.handleVoid.bind(this)}
                  />
                )}
                keyExtractor={(item) => item.lineNumber.toString()}
              />
            </View>
          )}
        </View>
      </View>
    );
  }

  private handleClickedDiscount(discountName: string): void {
    const inputs: UiInput[] = [];

    inputs.push(
      new UiInput(UiInputKey.PRECONFIGURED_DISCOUNT_NAME, discountName)
    );

    this.props.performBusinessOperation(
      this.props.deviceIdentity,
      APPLY_DISCOUNT_EVENT,
      inputs
    );

    this.props.onExit();
  }

  private handleVoid(discountLineNumber: number): void {
    Alert.alert(
      I18n.t("voidDiscount"),
      I18n.t("voidDiscountExplanation"),
      [
        { text: I18n.t("cancel"), style: "cancel" },
        {
          text: I18n.t("okCaps"),
          onPress: () => {
            const inputs: UiInput[] = [];
            inputs.push(new UiInput("lineNumber", discountLineNumber));
            this.props.performBusinessOperation(
              this.props.deviceIdentity,
              VOID_LINE_EVENT,
              inputs
            );
            this.props.onExit();
          }
        }
      ],
      { cancelable: true }
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    transactionDiscountDisplayLines:
      state.businessState.displayInfo.transactionDiscountDisplayLines,
    deviceIdentity: state.settings.deviceIdentity,
    configManager: state.settings.configurationManager
  };
}

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(PreConfiguredDiscounts);
