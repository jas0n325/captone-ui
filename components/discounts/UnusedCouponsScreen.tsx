import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { Coupon } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { unusedCouponsScreenStyles } from "./styles";


interface Props {
  onCloseScreen: () => void;
  promptText: string;
  unusedCoupons: Coupon[];
}

export default class UnusedCouponsScreen extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(unusedCouponsScreenStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <View style={this.styles.content}>
          <Text style={this.styles.explanation}>{this.props.promptText}</Text>
          <FlatList
            data={this.props.unusedCoupons}
            renderItem={({ item }) =>
                <View style={this.styles.row}>
                  <Text style={this.styles.couponText}>{item.singleUseCouponNumber ? item.singleUseCouponNumber :
                      item.couponNumber}</Text>
                  <Text style={this.styles.couponText}>{item.name || I18n.t("unusedCouponNoName")}</Text>
                  {item.description && <Text style={this.styles.couponText}>{item.description}</Text>}
                </View>}
            keyExtractor={(item) => item.couponNumber}
          />
          {Theme.isTablet &&
          <View style={this.styles.buttonArea}>
            <TouchableOpacity style={this.styles.button} onPress={this.props.onCloseScreen} >
              <Text style={this.styles.btnPrimaryText}>{I18n.t("ok")}</Text>
            </TouchableOpacity>
          </View>
          }
        </View>
      </View>
    );
  }
}
