import * as React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import {ITaxExemptDisplayLine} from "@aptos-scp/scp-component-store-selling-features";

import { connect } from "react-redux";
import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import { TaxAuthorityForExemptionState } from "../../reducers/taxAuthoritySelection";
import Theme from "../../styles";
import { taxExemptLineStyles } from "./styles";
import VectorIcon from "./VectorIcon";


interface Props extends StateProps {
  line: ITaxExemptDisplayLine;
  onSelect: (line: ITaxExemptDisplayLine) => void;
  onVoid: (lineNumber: number) => void;
}
interface StateProps {
  taxAuthorityState: TaxAuthorityForExemptionState;
}

interface State {}

class TaxExemptLine extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(taxExemptLineStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <TouchableOpacity style={this.styles.detailsArea} onPress={() => this.props.onSelect(this.props.line)} >
          <Text style={this.styles.topRowText}>
            {this.props.line.certificateId ? this.props.line.certificateId : I18n.t("taxIdNotEntered")}
          </Text>
          <Text style={this.styles.bottomRowText}>
            {this.props.taxAuthorityState && this.props.taxAuthorityState.selectedTaxAuthority &&
                this.props.taxAuthorityState.selectedTaxAuthority.name}
          </Text>
          <Text style={this.styles.bottomRowText}>
            {this.props.line.reasonDescription}
          </Text>
        </TouchableOpacity>
        <View style={this.styles.voidIconArea}>
          <TouchableOpacity style={this.styles.voidIcon} onPress={this.voidTaxExempt}>
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

  private voidTaxExempt = (): void => {
    Alert.alert(I18n.t("voidTaxExemptionHeader"), I18n.t("voidTaxExemptionMessage"), [
      {text: I18n.t("cancel"), style: "cancel"},
      {text: I18n.t("okCaps"), onPress: () => this.props.onVoid(this.props.line.lineNumber)}
    ], { cancelable: true });
  }
}

function mapStateToProps(state: AppState): StateProps {
    return {
      taxAuthorityState: state.taxAuthorityForExemption
    };
  }
export default connect<StateProps>(mapStateToProps)(TaxExemptLine);
