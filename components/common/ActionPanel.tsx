import * as React from "react";
import { ScrollView } from "react-native";

import Theme from "../../styles";
import { actionPanelStyle } from "./styles";


interface Props {}

export default class ActionPanel extends React.PureComponent<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(actionPanelStyle());
  }

  public render(): JSX.Element {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={this.styles.fill}
        contentContainerStyle={this.styles.actionPanel}
      >
        {this.props.children}
      </ScrollView>
    );
  }
}

