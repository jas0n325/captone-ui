import * as React from "react";
import { View, ViewStyle } from "react-native";

import Theme from "../../styles";
import { footerStyle } from "./styles";


export interface Props {
  style?: ViewStyle;
}
export interface State {}


export default class Footer extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(footerStyle());
  }

  public render(): JSX.Element {
    return (
        <View style={[this.styles.root, this.props.style || {}]}>
        {this.props.children}
      </View>
    );
  }
}
