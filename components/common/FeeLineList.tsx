import * as React from "react";
import { FlatList, Text, View } from "react-native";

import { IFeeDisplayLine } from "@aptos-scp/scp-component-store-selling-features";
import { LineType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import FeeLine from "./FeeLine";
import { feeLineListStyles } from "./styles";


interface Props {
  feeDisplayLines: IFeeDisplayLine[];
  preventScroll?: boolean;
  style?: any;
}

interface State {}

export default class FeeLineList extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(feeLineListStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.root, this.props.style || {}]}>
        {this.props.feeDisplayLines.length > 0 &&
          <View style={this.styles.subtitleArea}>
            <Text style={this.styles.subtitleText}>{I18n.t("appliedFeeCaps")}</Text>
          </View>
        }
        { this.props.preventScroll && this.props.feeDisplayLines.map(this.renderFeeLine) }
        {
          !this.props.preventScroll &&
          <FlatList
            data={this.props.feeDisplayLines}
            renderItem={({ item }) => this.renderFeeLine(item)}
            keyExtractor={(item) => item.lineNumber.toString()}
          />
        }
      </View>
    );
  }

  private renderFeeLine = (feeDisplayLine: IFeeDisplayLine) => {
    if (feeDisplayLine.lineType === LineType.TransactionFee) {
      return <FeeLine line={feeDisplayLine} />;
    }
  }
}
