import * as React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { DeviceIdentity, IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  IDiscountDisplayLine,
  IItemDisplayLine,
  VOID_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode} from "../../actions";
import { AppState, UI_MODE_DISCOUNT_TYPE_SELECTION } from "../../reducers";
import Theme from "../../styles";
import ActionButton from "../common/ActionButton";
import BaseView from "../common/BaseView";
import DiscountLine from "../common/DiscountLine";
import Header from "../common/Header";
import { getEmployeeDiscountDisplayText } from "../common/utilities/discountUtilities";
import { NavigationProp } from "../StackNavigatorParams";
import { DiscountLevel, DiscountType } from "./constants";
import { DiscountTypeSelectionProps } from "./interfaces";
import { discountTypeSelectionStyles } from "./styles";

interface StateProps {
  deviceIdentity: DeviceIdentity;
  isItemReasonCodeDiscountEnable: boolean;
  isItemCouponDiscountEnable: boolean;
  isItemEmployeeDiscountEnable: boolean;
  isTransactionReasonCodeDiscountEnable: boolean;
  isTransactionCouponDiscountEnable: boolean;
  isTransactionEmployeeDiscountEnable: boolean;
  isItemNewPriceDiscountEnable: boolean;
  isTransactionNewPriceDiscountEnable: boolean;
  isCompetitivePriceDiscountEnabled: boolean;
  configurationManager: IConfigurationManager;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends DiscountTypeSelectionProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  isNewPriceDiscountEnable: boolean;
  isReasonCodeDiscountEnable: boolean;
  isCouponDiscountEnable: boolean;
  isEmployeeDiscountEnable: boolean;
  isLoyaltyDiscountEnable: boolean;
  isCompetitivePriceDiscountEnabled: boolean;
}

class DiscountTypeSelection extends React.PureComponent<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(discountTypeSelectionStyles());

    this.state = {
      isNewPriceDiscountEnable: undefined,
      isReasonCodeDiscountEnable: undefined,
      isCouponDiscountEnable: undefined,
      isEmployeeDiscountEnable: undefined,
      isLoyaltyDiscountEnable: undefined,
      isCompetitivePriceDiscountEnabled: undefined
    };
  }

  public componentDidMount(): void {
    if (this.props.discountLevel === DiscountLevel.Transaction) {
      this.setState({
        isReasonCodeDiscountEnable: this.props.isTransactionReasonCodeDiscountEnable,
        isCouponDiscountEnable: this.props.isTransactionCouponDiscountEnable,
        isEmployeeDiscountEnable: this.props.isTransactionEmployeeDiscountEnable,
        isNewPriceDiscountEnable: this.props.isTransactionNewPriceDiscountEnable,
        isLoyaltyDiscountEnable: this.props.isLoyaltyDiscountEnable,
        isCompetitivePriceDiscountEnabled: false
      });
    } else if (this.props.discountLevel === DiscountLevel.Item) {
      this.setState({
        isReasonCodeDiscountEnable: this.props.isItemReasonCodeDiscountEnable,
        isCouponDiscountEnable: this.props.isItemCouponDiscountEnable,
        isEmployeeDiscountEnable: this.props.isItemEmployeeDiscountEnable,
        isNewPriceDiscountEnable: this.props.isItemNewPriceDiscountEnable,
        isLoyaltyDiscountEnable: false,
        isCompetitivePriceDiscountEnabled: this.props.isCompetitivePriceDiscountEnabled
      });
    }

    this.props.updateUiMode(UI_MODE_DISCOUNT_TYPE_SELECTION);
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const discountLines: IDiscountDisplayLine[] = [];

    if (this.props.transactionDiscountDisplayLines) {
      discountLines.push(...this.props.transactionDiscountDisplayLines);
    } else if (this.props.itemLines) {
      this.props.itemLines.forEach((line: IItemDisplayLine) => {
        if (line.discountLines) {
          discountLines.push(...line.discountLines);
        }
      });
    }

    return (
      <BaseView style={this.styles.root}>
        <Header
            title={this.props.discountLevel === DiscountLevel.Item ?
                I18n.t("itemDiscount") :
                I18n.t("transactionDiscount")
            }
            backButton={{name: "Back", action: this.props.onExit}}
        />
        <View style={this.styles.actionsPanel}>
          <View style={this.styles.actions}>
            {this.state.isReasonCodeDiscountEnable && this.getDiscountTypeButton("PriceTag", DiscountType.Manual)}
            {this.state.isCouponDiscountEnable && this.getDiscountTypeButton("CouponDiscount", DiscountType.Coupon)}
            {this.state.isEmployeeDiscountEnable && this.getDiscountTypeButton(
                "EmployeeDiscount", DiscountType.Employee)
            }
            {this.state.isNewPriceDiscountEnable && this.getDiscountTypeButton("PriceOverride", DiscountType.NewPrice)}
            {this.state.isLoyaltyDiscountEnable && this.getDiscountTypeButton("LoyaltyDiscount", DiscountType.Loyalty)}
            {this.state.isCompetitivePriceDiscountEnabled && this.getDiscountTypeButton("CompetitivePriceDiscount",
                DiscountType.CompetitivePrice)
            }
            {this.getLastButton()}
          </View>
        </View>
        {Theme.isTablet &&
        <View style={this.styles.buttonPanel}>
          <TouchableOpacity style={this.styles.btnSeconday} onPress={this.props.onExit} >
            <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
          </TouchableOpacity>
        </View>
        }
        {discountLines.length > 0 &&
        <View style={this.styles.discountHeader}>
          <Text style={this.styles.discountHeaderText}>{I18n.t("appliedDiscountsCaps")}</Text>
        </View>
        }
        {discountLines.length > 0 &&
        <FlatList
            style={this.styles.discountList}
            data={discountLines}
            renderItem={({ item }) =>
                <DiscountLine discountLine={item}
                              onDiscount={(discountLevel: DiscountLevel, discountType: DiscountType,
                                           discountDisplayLine: IDiscountDisplayLine) => {
                                if (!discountDisplayLine.isLoyaltyDiscount) {
                                  this.props.onDiscount(discountLevel, discountType, discountDisplayLine);
                                }
                              }}
                              onVoid={this.handleVoid.bind(this)}/>}
            keyExtractor={(item) => item.lineNumber.toString() } />
        }
      </BaseView>
    );
  }

  private getLastButton(): JSX.Element {
    let counter = 0;
    if (this.state.isReasonCodeDiscountEnable) {
      counter++;
    }
    if (this.state.isCouponDiscountEnable) {
      counter++;
    }
    if (this.state.isEmployeeDiscountEnable) {
      counter++;
    }
    if (this.state.isNewPriceDiscountEnable) {
      counter++;
    }
    if (this.state.isLoyaltyDiscountEnable) {
      counter++;
    }
    if (this.state.isCompetitivePriceDiscountEnabled) {
      counter++;
    }

    if (counter % 3 >= 1) {
      return (
        <View style={this.styles.lastBtn}/>
      );
    }

    return undefined;
  }

  private handleVoid(discountLineNumber: number): void {
    Alert.alert(I18n.t("voidDiscount"), I18n.t("voidDiscountExplanation"), [
      { text: I18n.t("cancel"), style: "cancel" },
      { text: I18n.t("okCaps"), onPress: () => {
          const inputs: UiInput[] = [];
          inputs.push(new UiInput("lineNumber", discountLineNumber));
          this.props.performBusinessOperation(this.props.deviceIdentity, VOID_LINE_EVENT, inputs);
          this.props.onExit();
        }
      }
    ], {cancelable: true});
  }

  private getDiscountTypeButton(iconName: string, discountType: DiscountType): JSX.Element {
    let translationString: string;
    const employeeDiscountDisplayText = getEmployeeDiscountDisplayText(discountType,this.props.discountLevel,
        this.props.configurationManager);

    if (discountType === DiscountType.Coupon) {
      translationString = "couponDiscount";
    } else if (discountType === DiscountType.Employee) {
      translationString = "employeeDiscount";
    } else if (discountType === DiscountType.NewPrice) {
      translationString = "priceDiscount";
    } else if (discountType === DiscountType.Loyalty) {
      translationString = "loyaltyDiscount";
    } else if (discountType === DiscountType.CompetitivePrice) {
      translationString = "priceMatch";
    } else {
      translationString = "discount";
    }

    return (
      <ActionButton
          style={this.styles.btnAction}
          icon={{icon: iconName, size: this.styles.btnActionIcon.fontSize}}
          title={employeeDiscountDisplayText ? I18n.t(employeeDiscountDisplayText.i18nCode,
            { defaultValue: employeeDiscountDisplayText.default }) : I18n.t(translationString)}
          titleStyle={this.styles.btnActionText}
          allowTextWrap={true}
          onPress={() => this.props.onDiscount(this.props.discountLevel, discountType)} />
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    deviceIdentity: state.settings.deviceIdentity,
    isItemReasonCodeDiscountEnable: state.uiState.featureActionButtonProps.isItemReasonCodeDiscountEnable,
    isItemCouponDiscountEnable: state.uiState.featureActionButtonProps.isItemCouponDiscountEnable,
    isItemEmployeeDiscountEnable: state.uiState.featureActionButtonProps.isItemEmployeeDiscountEnable,
    isTransactionReasonCodeDiscountEnable: state.uiState.featureActionButtonProps.isTransactionReasonCodeDiscountEnable,
    isTransactionCouponDiscountEnable: state.uiState.featureActionButtonProps.isTransactionCouponDiscountEnable,
    isTransactionEmployeeDiscountEnable: state.uiState.featureActionButtonProps.isTransactionEmployeeDiscountEnable,
    isItemNewPriceDiscountEnable: state.uiState.featureActionButtonProps.isItemNewPriceDiscountEnable,
    isTransactionNewPriceDiscountEnable: state.uiState.featureActionButtonProps.isTransactionNewPriceDiscountEnable,
    isCompetitivePriceDiscountEnabled: state.uiState.featureActionButtonProps.isCompetitivePriceDiscountEnabled,
    configurationManager: state.settings.configurationManager
  };
};

export default connect<StateProps, DispatchProps, Omit<Props, keyof (StateProps & DispatchProps)>>(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(DiscountTypeSelection);
