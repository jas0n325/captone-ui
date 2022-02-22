import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { connect } from "react-redux";

import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { fatalErrorStyle } from "./styles";

interface StateProps {
  uiStateErrorMessage: string;
}

interface Props extends StateProps, NavigationScreenProps<"fatalError"> {}

interface State {
  errorMessages: string[];
}


class FatalErrorScreen extends React.PureComponent<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(fatalErrorStyle());
    this.state = {
      errorMessages: [this.props.uiStateErrorMessage]
    };
  }

  public componentDidUpdate(): void {
    const propsMessage = this.props.uiStateErrorMessage;
    if (this.props.uiStateErrorMessage &&
        !this.state.errorMessages.some((message) => message === propsMessage)) {
      const messages = Object.assign([], this.state.errorMessages);
      messages.push(propsMessage);
      this.setState({errorMessages: messages});
    }
  }

  public render(): JSX.Element {
    const {container, spacerContainer, headerContainer, errorContainer, headerText} = this.styles;
    return (
      <BaseView style={container}>
        <View style={headerContainer}>
          <Text style={headerText}>{I18n.t("unrecoverableError")}</Text>
        </View>
        <View style={spacerContainer} />
        { this.state.errorMessages &&
          <ScrollView style={errorContainer}>
            {
              this.createErrorText()
            }
          </ScrollView>
        }
      </BaseView>
    );
  }

  private createErrorText(): JSX.Element[] {
    const {normalText} = this.styles;
    return this.state.errorMessages.map((message) => (
        <Text style={normalText}>{message}</Text>
      )) || null;
  }
}

const mapStateToProps = (state: AppState) => {
  return { uiStateErrorMessage: state.uiState.error.message };
};

export default connect(mapStateToProps, {})(FatalErrorScreen);
