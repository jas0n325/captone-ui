import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";

import { ActionCreator, updateUiMode } from "../../../actions";
import { AppState, UiState, UI_MODE_SCO_POPUP } from "../../../reducers";
import Theme from "../../../styles";
import { NavigationProp } from "../../StackNavigatorParams";
import SCOToggleModePopUp from "./SCOToggleModePopUp";
import { scoPopupStyles } from "./styles";


interface StateProps {
  uiState: UiState;
}

interface DispatchProps {
  updateUiMode: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
  navigation: NavigationProp;
  allowToggleApplicationMode?: boolean;
  style?: any;
  preserveUiMode?: boolean;
}

interface State {
  showToggleForm: boolean;
}

class SCOPopup extends React.Component<React.PropsWithChildren<Props>, State> {
  private styles: any;
  private currentUiMode: string;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(scoPopupStyles());

    this.state = {
      showToggleForm: false
    };
  }

  public componentDidMount(): void {
    this.currentUiMode = this.props.uiState.mode;
    if (!this.props.preserveUiMode) {
      this.props.updateUiMode(UI_MODE_SCO_POPUP);
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(this.currentUiMode);
  }

  public render(): JSX.Element {
    return (
      <KeyboardAwareScrollView style={this.styles.base} contentContainerStyle={this.styles.root}>
        <View style={this.styles.root}>
          {
            this.props.allowToggleApplicationMode &&
            !this.state.showToggleForm &&
            <TouchableOpacity style={this.styles.hiddenButton} onPress={() => this.toggleShowToggleForm()} />
          }
          <View style={this.styles.centerArea}>
            { !this.state.showToggleForm && this.props.children }
            {
              this.props.allowToggleApplicationMode &&
              this.state.showToggleForm &&
              <SCOToggleModePopUp navigation={this.props.navigation} onHide={() => this.toggleShowToggleForm()} />
            }
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }

  private toggleShowToggleForm(): void {
    this.setState({ showToggleForm: !this.state.showToggleForm });
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    uiState: state.uiState
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  updateUiMode: updateUiMode.request
})(SCOPopup);
