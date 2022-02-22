import * as React from "react";
import { connect } from "react-redux";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import {
  IItemDisplayLine,
  ITaxOverrideLine,
  VOID_LINE_EVENT,
  MODIFY_ITEM_TAX_OVERRIDE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { TaxOverrideType } from "@aptos-scp/scp-types-commerce-transaction";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";

import {
  ActionCreator,
  businessOperation
} from "../../actions";
import { AppState, BusinessState } from "../../reducers";
import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { taxExemptLineStyles } from "./styles";
import VectorIcon from "./VectorIcon";


interface Props extends StateProps, DispatchProps {
  line: IItemDisplayLine;
  isItemLevel: boolean;
  TranscationTaxOverrideLines: ITaxOverrideLine;
}

interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
}

interface DispatchProps {
  businessOperation: ActionCreator;
}

interface State {}

class TaxOverrideLine extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(taxExemptLineStyles());
  }

  public render(): JSX.Element {
    let taxRate;
    let reasonDescription;
    if (this.props.isItemLevel) {
      taxRate = this.props.line.taxOverride.taxRate;
      reasonDescription = this.props.line.taxOverride.reasonDescription;
    } else {
      taxRate = this.props.TranscationTaxOverrideLines && this.props.TranscationTaxOverrideLines.newTaxRate;
      reasonDescription = this.props.TranscationTaxOverrideLines && this.props.TranscationTaxOverrideLines.reasonDescription;
    }
    return (
      <View style={this.styles.root}>
        <TouchableOpacity style={this.styles.detailsArea}>
          <Text style={this.styles.topRowText}>
            {`${I18n.t("taxOverride")} -  ${taxRate}%`}
          </Text>
          <Text style={this.styles.bottomRowText}>
          </Text>
          <Text style={this.styles.bottomRowText}>
            {reasonDescription}
          </Text>
        </TouchableOpacity>
        <View style={this.styles.voidIconArea}>
          <TouchableOpacity style={this.styles.voidIcon} onPress={this.voidTaxOverride} >
            <VectorIcon
              name="Clear"
              height={this.styles.icon.fontSize}
              width={this.styles.icon.fontSize}
              fill={this.styles.icon.color}
              stroke={this.styles.icon.color}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  private voidTaxOverride = (): void => {
    Alert.alert(I18n.t("voidTaxOverrideHeader"), I18n.t("voidTaxOverridenMessage"), [
      {text: I18n.t("cancel"), style: "cancel"},
      {text: I18n.t("okCaps"), onPress: () => this.handleOnVoid()}
    ], { cancelable: true });
  }

  private handleOnVoid(): void {
    let line: ITaxOverrideLine;
    const selectedLine = this.props.line.lineNumber;
    if (!this.props.isItemLevel) {
      line = this.props.businessState.displayInfo.taxOverrideDisplayLines.find((data: any) => data.taxOverrideType === TaxOverrideType.Transaction);
      this.onVoid(line.lineNumber);
    } else {
      this.props.businessState.displayInfo.taxOverrideDisplayLines.forEach((data: ITaxOverrideLine) => {
        if (data.taxOverrideType === TaxOverrideType.Item) {
          if (data.taxOverrideLineReferences.length > 1) {
            const itemLineReferences = data.taxOverrideLineReferences.find((lineData) => lineData.lineNumber === selectedLine);
            if (itemLineReferences) {
            const taxOverrideReferenceLines = data.taxOverrideLineReferences.filter((referenceLine) => referenceLine.lineNumber !== itemLineReferences.lineNumber);
            this.onModify(data.lineNumber, taxOverrideReferenceLines);
            }
          } else {
            if (data.taxOverrideLineReferences[0].lineNumber === selectedLine) {
              this.onVoid(data.lineNumber);
            }
          }
        }
      });
    }
  }

  private onVoid(lineNumber: number): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", lineNumber));
    this.props.businessOperation(this.props.deviceIdentity, VOID_LINE_EVENT, uiInputs);
  }

  private onModify(lineNumber: number, LineReferences: any): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.TAX_OVERRIDE_LINE_NUMBER, lineNumber));
    uiInputs.push(new UiInput(UiInputKey.TAX_OVERRIDE_LINE_REFERENCES, LineReferences));
    this.props.businessOperation(this.props.deviceIdentity, MODIFY_ITEM_TAX_OVERRIDE_EVENT, uiInputs);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity
  };
};

export default connect(mapStateToProps, {
  businessOperation: businessOperation.request
})(TaxOverrideLine);
