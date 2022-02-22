import I18n = require('i18n-js');
import * as React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import Theme from "../../styles";
import { capturedLotteryLineStyles } from "./styles";
import VectorIcon from "../common/VectorIcon";

interface Props{
  lotteryCode: string;
  onVoid: () => void;
}
class CapturedLotteryLine extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(capturedLotteryLineStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <TouchableOpacity style={this.styles.detailsArea} >
          <Text style={this.styles.topRowText}>
            {I18n.t("lotteryCode")}
          </Text>
          <Text style={this.styles.bottomRowText}>
            {this.props.lotteryCode}
          </Text>
        </TouchableOpacity>
        <View style={this.styles.voidIconArea}>
          <TouchableOpacity style={this.styles.voidIcon} onPress={this.voidLotteryCode}>
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

  private voidLotteryCode = (): void => {
    Alert.alert(I18n.t("voidLottery"), I18n.t("voidLotteryMessage"), [
      {text: I18n.t("cancel"), style: "cancel"},
      {text: I18n.t("void"), onPress: () => this.props.onVoid()}
    ], { cancelable: true });
  }
}

export default CapturedLotteryLine;
