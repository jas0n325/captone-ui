import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { IPromotionCouponDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

import Theme from "../../styles";
import { couponLineStyles } from "./styles";
import VectorIcon from "./VectorIcon";

interface Props {
  line: IPromotionCouponDisplayLine;
  onVoid: (lineNumber: number) => void;
}

interface State {}

export default class CouponLine extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(couponLineStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <View style={this.styles.detailsArea}>
          <Text style={this.styles.rowText}>
            {this.props.line.couponNumber}
          </Text>
        </View>
        {this.props.onVoid &&
        <View style={this.styles.voidIconArea}>
          <TouchableOpacity style={this.styles.voidIcon} onPress={() => this.props.onVoid(this.props.line.lineNumber)}>
            <VectorIcon
              name="Clear"
              height={this.styles.icon.fontSize}
              width={this.styles.icon.fontSize}
              fill={this.styles.icon.color}
              stroke={this.styles.icon.color}
            />
          </TouchableOpacity>
        </View>
        }
      </View>
    );
  }
}
