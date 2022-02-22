import * as React from "react";
import { Keyboard } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  DeviceIdentity,
  IConfigurationManager,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_EVENT,
  IItemDisplayLine,
  IReasonCodeList,
  IThreshold,
  PRICE_CHANGE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import {
  ActionCreator,
  businessOperation,
  sceneTitle,
  updateUiMode
} from "../../actions";
import { AppState, BusinessState, UI_MODE_PRICE_CHANGE } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import {
  compareRenderSelectOptions,
  RenderSelectOptions
} from "../common/FieldValidation";
import {
  getCurrencyCode,
  getCurrencyMinimumDenomination,
  MinimumDenomination
} from "../common/utilities";
import {
  getFeatureAccessConfig,
  getMaximumAllowedFieldLength
} from "../common/utilities/configurationUtils";
import { NavigationProp } from "../StackNavigatorParams";
import Price from "./Price";
import { priceScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
  retailLocationCurrency: string;
  configManager: IConfigurationManager;
  deviceIdentity: DeviceIdentity;
  i18nLocation: string;
}

interface DispatchProps {
  businessOperation: ActionCreator;
  sceneTitle: ActionCreator;
  updateUiMode: ActionCreator;
}

interface State {
  inProgress: boolean;
}

interface Props extends StateProps, DispatchProps {
  line: IItemDisplayLine;
  showLine: boolean;
  onExit: () => void;
  requiresPriceEntry?: boolean;
  navigation: NavigationProp;
}
class PriceComponent extends React.PureComponent<Props, State> {
  private maxAllowedLength: number;
  private currency: string;
  private minimumDenomination: MinimumDenomination;
  private reasons: RenderSelectOptions[] = [];
  private styles: any;
  private limits: IThreshold;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(priceScreenStyles());

    this.maxAllowedLength = getMaximumAllowedFieldLength(
      this.props.configManager
    );
    this.currency = getCurrencyCode(
      this.props.businessState.stateValues,
      this.props.retailLocationCurrency
    );
    this.minimumDenomination = getCurrencyMinimumDenomination(
      this.props.configManager,
      this.currency,
      this.props.i18nLocation
    );

    // Get configured reason codes
    const featureConfig = getFeatureAccessConfig(
      this.props.configManager,
      PRICE_CHANGE_EVENT
    );
    const reasonListType: string = featureConfig.reasonCodeListType;
    const configuredReasonCodes: IReasonCodeList =
      this.props.configManager.getReasonCodesValues().reasonCodeLists[
        reasonListType
      ] &&
      this.props.configManager.getReasonCodesValues().reasonCodeLists[
        reasonListType
      ].reasonCodeDefinitions;
    // Using those, build selection list (Sorted in ascending order of reason code name)
    this.reasons = configuredReasonCodes
      ? Object.keys(configuredReasonCodes)
          .map((aReasonCode: string): RenderSelectOptions => {
            return {
              code: aReasonCode,
              description: configuredReasonCodes[aReasonCode].name
            };
          })
          .sort((reason1, reason2): number => {
            return compareRenderSelectOptions(reason1, reason2);
          })
      : undefined;

    this.limits = featureConfig && (featureConfig.limits as IThreshold);
    this.state = {
      inProgress: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_PRICE_CHANGE);
    this.props.sceneTitle("reasonCodeList", "reasonCode");
  }

  public componentDidUpdate(prevProps: Props): void {
    if (
      !this.props.businessState.inProgress &&
      prevProps.businessState.inProgress &&
      !this.props.businessState.error &&
      this.state.inProgress
    ) {
      this.setState({ inProgress: false });
      this.props.onExit();
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Price
          businessState={this.props.businessState}
          minimumDenomination={this.minimumDenomination}
          currency={this.currency}
          line={this.props.line}
          showLine={this.props.showLine}
          maxAllowedLength={this.maxAllowedLength}
          reasons={this.reasons}
          limits={this.limits}
          onSave={this.handlePriceChange.bind(this)}
          onCancel={this.props.onExit}
          requiresPriceEntry={this.props.requiresPriceEntry}
          navigation={this.props.navigation}
        />
      </BaseView>
    );
  }

  private handlePriceChange(inputValue: string, reasonCodeId: string): void {
    const uiInputs: UiInput[] = [];

    if (this.props.requiresPriceEntry) {
      uiInputs.push(
        new UiInput(
          "price",
          new Money(inputValue, this.props.line.unitPrice.amount.currency)
        )
      );
      uiInputs.push(new UiInput("itemKey", this.props.line.itemIdKey));
      uiInputs.push(new UiInput("itemKeyType", this.props.line.itemIdKeyType));

      const { businessState } = this.props;
      if (
        businessState.inputs.some(
          (input: UiInput) => input.inputKey === UiInputKey.QUANTITY
        )
      ) {
        uiInputs.push(
          businessState.inputs.find(
            (input: UiInput) => input.inputKey === UiInputKey.QUANTITY
          )
        );
      }

      if (
        businessState.inputs.some(
          (input: UiInput) =>
            input.inputKey === UiInputKey.ITEM_FULFILLMENT_TYPE
        )
      ) {
        uiInputs.push(
          businessState.inputs.find(
            (input: UiInput) =>
              input.inputKey === UiInputKey.ITEM_FULFILLMENT_TYPE
          )
        );
      }

      if (
        businessState.inputs.some(
          (input: UiInput) =>
            input.inputKey === UiInputKey.PICKUP_AT_ANOTHER_LOCATION_ID
        )
      ) {
        uiInputs.push(
          businessState.inputs.find(
            (input: UiInput) =>
              input.inputKey === UiInputKey.PICKUP_AT_ANOTHER_LOCATION_ID
          )
        );
      }

      this.props.businessOperation(
        this.props.deviceIdentity,
        APPLY_ITEM_EVENT,
        uiInputs
      );
    } else {
      // if the value is the same then we don't do anything
      const value = Number.parseFloat(inputValue.toString());

      if (isNaN(value)) {
        return;
      }

      if (!reasonCodeId) {
        return;
      }

      const reason: RenderSelectOptions = this.reasons.find(
        (r) => r.code === reasonCodeId
      );

      uiInputs.push(new UiInput("lineNumber", this.props.line.lineNumber));
      uiInputs.push(new UiInput("price", inputValue));
      uiInputs.push(new UiInput("reasonCode", reason.code));
      this.props.businessOperation(
        this.props.deviceIdentity,
        PRICE_CHANGE_EVENT,
        uiInputs
      );
    }

    this.setState({ inProgress: true });

    Keyboard.dismiss();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    retailLocationCurrency: state.settings.retailLocationCurrency,
    configManager: state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  businessOperation: businessOperation.request,
  sceneTitle: sceneTitle.request,
  updateUiMode: updateUiMode.request
})(PriceComponent);
