import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import { changeDueStyles } from "./styles";


interface Props {
  handleAddCustomerOnChangeDueScreen: () => void;
  handleContinueOnChangeDueScreen: () => void;
  showAddCustomerButton: boolean;
}

interface State {}

export default class ChangeDueChoice extends React.PureComponent<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(changeDueStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.changeDueOptionsRoot}>
        <View style={this.styles.changeDueOptionsArea}>
          {this.props.showAddCustomerButton &&
            <TouchableOpacity
              style={this.styles.changeDueScreenButton}
              onPress={() => this.props.handleAddCustomerOnChangeDueScreen()}
            >
              <Text style={this.styles.changeDueScreenButtonTitle}>{I18n.t("customerAdd")}</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity
            style={[this.styles.changeDueScreenButton, this.styles.bottomMostButton]}
            onPress={() => this.props.handleContinueOnChangeDueScreen()}
          >
            <Text style={this.styles.changeDueScreenButtonTitle}>{I18n.t("continue")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
