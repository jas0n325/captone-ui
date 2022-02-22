import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { DeviceIdentity } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../../config/I18n";
import { ActionCreator, businessOperation } from "../../../actions";
import { AppState} from "../../../reducers";
import Theme from "../../../styles";
import { NavigationProp } from "../../StackNavigatorParams";
import { commentsScreen } from "./styles";
import BaseView from "../BaseView";
import Header from "../Header";
import { FreeTextCommentProps } from "./interfaces";

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface StateProps {
  deviceIdentity: DeviceIdentity;
}

interface Props extends FreeTextCommentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  freeText: string;
}

class FreeTextComment extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = this.props.styles || Theme.getStyles(commentsScreen());
    this.state = {
      freeText: this.props.freeTextCommentValue
    };
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          title={I18n.t("comment")}
          backButton={{name: "Back", action: () => this.props.onExit()}}
          rightButton={!Theme.isTablet && {
            title: I18n.t("done"),
            action: this.onDone
          }}
          isVisibleTablet={this.props.showHeader}
        />
        <View style={this.styles.root}>
          <View style={this.styles.promptContainer}>
            <View style={this.styles.freeTextContainer}>
              <TextInput
                value={this.state.freeText}
                style={this.styles.freeTextInputField}
                placeholder={I18n.t("enterFreeTextComment")}
                onChangeText={this.onCommentChange}
                autoCorrect={false}
                autoFocus={true}
                multiline
              />
            </View>
            {
              Theme.isTablet &&
              <View>
                <TouchableOpacity
                  style={[this.styles.btnPrimary, this.styles.button]}
                  onPress={this.onDone}
                >
                  <Text style={this.styles.btnPrimaryText}>
                    {I18n.t("done")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[this.styles.btnSeconday, this.styles.button]}
                  onPress={() => this.props.onExit()}
                >
                  <Text style={this.styles.btnSecondayText}>
                    {I18n.t("cancel")}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        </View>
      </BaseView>
    );
  }

  private onCommentChange = (freeText: string): void => {
    this.setState({ freeText });
  }

  private onDone = (): void => {
    this.props.onDone(this.props.lineNumber, this.state.freeText);
    this.props.onExit();
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    deviceIdentity: state.settings.deviceIdentity
  };
};

export default connect<StateProps, DispatchProps, Omit<Props, keyof (StateProps & DispatchProps)>>(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(FreeTextComment);
