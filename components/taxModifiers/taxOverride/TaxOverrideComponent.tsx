import { isEqual } from "lodash";
import * as React from "react";
import { connect } from "react-redux";

import { DeviceIdentity, IDisplayInfo, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  getFeatureAccessConfig,
  IReasonCodeLists,
  ITEM_TAX_OVERRIDE_EVENT,
  TRANSACTION_TAX_OVERRIDE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { ITransactionLineReferenceType, TaxOverrideType } from "@aptos-scp/scp-types-commerce-transaction";

import {
  ActionCreator,
  businessOperation,
  sceneTitle
} from "../../../actions";
import { AppState, BusinessState, SettingsState } from "../../../reducers";
import Theme from "../../../styles";
import BaseView from "../../common/BaseView";
import { compareRenderSelectOptions, RenderSelectOptions } from "../../common/FieldValidation";
import { NavigationProp } from "../../StackNavigatorParams";
import { itemTaxOverrideScreenStyle } from "../styles";
import { TaxOverrideComponentProps } from "./interfaces";
import TaxOverride from "./TaxOverride";

export interface ItemTaxOverrideForm {
  taxId: string;
  reasonCode: string;
  lineNumber: string;
}

export interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  displayInfo: IDisplayInfo;
  settings: SettingsState;
}

export interface DispatchProps {
  businessOperation: ActionCreator;
  sceneTitle: ActionCreator;
}

interface State {
  reasonCodeRequired: boolean;
}

interface Props extends TaxOverrideComponentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

class TaxOverrideComponent extends React.Component<Props, State> {
  private styles: any;
  private reasonListType: string;
  private reasons: RenderSelectOptions[] = [];

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(itemTaxOverrideScreenStyle());
    this.reasonCodeLoader();
    this.state = {
      reasonCodeRequired: !!this.reasonListType
    };
  }
  public componentDidMount(): void {
    this.props.sceneTitle("reasonCodeList", "reasonCode");
  }

  public componentWillReceiveProps(nextProps: Props): void {
    if (!isEqual(nextProps.businessState.displayInfo.taxOverrideDisplayLines,
        this.props.businessState.displayInfo.taxOverrideDisplayLines)) {
      this.props.onExit();
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <TaxOverride
          showLine={this.props.showLine}
          lines={this.props.lines}
          reasonCodeRequired={this.state.reasonCodeRequired}
          reasons={this.reasons}
          onSave={this.handleOnSave}
          onCancel={this.props.onExit}
          isItemLevel={this.props.isItemLevel}
          taxOverrideDisplayLines={this.props.businessState.displayInfo.taxOverrideDisplayLines}
          navigation={this.props.navigation}
        />
      </BaseView>
    );
  }

  private handleOnSave = (taxRate: string, reason: RenderSelectOptions, lineNumber: string): void => {
    if (taxRate) {
      const inputs = [];
      const taxOverrideTypeInput = new UiInput(UiInputKey.TAX_OVERRIDE_TYPE,
        this.props.isItemLevel ? TaxOverrideType.Item : TaxOverrideType.Transaction);
      const taxRateInput = new UiInput(UiInputKey.TAX_OVERRIDE_PERCENT, taxRate.replace(/%/g, ""));
      const taxOverrideReasonInput = new UiInput(UiInputKey.TAX_OVERRIDE_REASON, reason);
      inputs.push(taxOverrideTypeInput, taxRateInput, taxOverrideReasonInput);

      if (this.props.isItemLevel) {
        const taxOverrideLineReferencesInput: ITransactionLineReferenceType[] =
            this.props.lines.map((line) => ({ lineNumber: line.lineNumber }));
        inputs.push(new UiInput(UiInputKey.TAX_OVERRIDE_LINE_REFERENCES, taxOverrideLineReferencesInput));
        this.props.businessOperation(this.props.deviceIdentity, ITEM_TAX_OVERRIDE_EVENT, inputs);
      } else {
        this.props.businessOperation(this.props.deviceIdentity, TRANSACTION_TAX_OVERRIDE_EVENT, inputs);
      }
    }
  }

  private reasonCodeLoader = () => {
    const eventType = this.props.showLine ? "ItemTaxOverride" : "TransactionTaxOverride";
    const featureConfig =
      getFeatureAccessConfig(this.props.settings.configurationManager, eventType);
    this.reasonListType = featureConfig.reasonCodeListType;
    if (!!this.reasonListType) {
      const configuredReasonCodeLists: IReasonCodeLists =
        this.props.settings.configurationManager.getReasonCodesValues().reasonCodeLists as IReasonCodeLists;
      const configuredReasonCodeList = configuredReasonCodeLists && configuredReasonCodeLists[this.reasonListType];
      const configuredReasonCodes = configuredReasonCodeList && configuredReasonCodeList.reasonCodeDefinitions;
      if (configuredReasonCodes) {
        // Using those, build selection list (Sorted in ascending order of reason code name)
        this.reasons = Object.keys(configuredReasonCodes)
          .map((aReasonCode: string): RenderSelectOptions => {
            return {
              code: aReasonCode,
              description: configuredReasonCodes[aReasonCode].name
            };
          })
          .sort((reason1, reason2): number => {
            return compareRenderSelectOptions(reason1, reason2);
          });
      }
    }
  }

}
const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    settings: state.settings,
    displayInfo: state.businessState.displayInfo
  };
};

export default connect(mapStateToProps, {
  businessOperation: businessOperation.request,
  sceneTitle: sceneTitle.request
})(TaxOverrideComponent);
