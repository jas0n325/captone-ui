import * as React from "react";
import { Text, View } from "react-native";

import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

import Theme from "../../styles";
import { itemSummaryLineStyles } from "./styles";


interface Props {
  itemLine: IItemDisplayLine;
}

interface State {}

export default class ItemSummaryLine extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(itemSummaryLineStyles());
  }

  public render(): JSX.Element {
    const line = this.props.itemLine;
    return (
      <View style={this.styles.line} key={this.props.itemLine.lineNumber}>
        <Text style={[this.styles.itemLineText, this.styles.itemLineId]} numberOfLines={2} ellipsizeMode={"tail"}>
          {line.itemIdKey}
        </Text>
        <Text style={this.styles.itemLineText} numberOfLines={2} ellipsizeMode={"tail"}>
          {line.itemShortDescription}
        </Text>
      </View>
    );
  }
}
