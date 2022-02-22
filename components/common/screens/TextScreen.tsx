import * as React from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { SettingsState } from "../../../reducers";
import Theme from "../../../styles";
import { textScreenStyle } from "../../customer/styles";
import { NavigationScreenProps } from "../../StackNavigatorParams";
import BaseView from "../BaseView";
import { TextScreenProps } from "./interfaces";

interface DispatchProps {
  settings: SettingsState;
}
interface Props extends TextScreenProps, DispatchProps, NavigationScreenProps<"textScreen"> {}

interface State {}

class TextScreen extends
    React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(textScreenStyle());

  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <View style={this.styles.base}>
          {this.renderBody()}
        </View>
      </BaseView>
    );
  }

  private renderBody(): JSX.Element {
    return (
      <KeyboardAwareScrollView keyboardShouldPersistTaps={"always"}>
        <View style={this.styles.displayTextArea}>
          <Text style={this.styles.displayText}>{this.props.displayText}</Text>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
const mapStateToProps = (state: any) => {
  return { settings: state.settings };
};

export default connect(mapStateToProps, {})(withMappedNavigationParams<typeof TextScreen>()(TextScreen));
