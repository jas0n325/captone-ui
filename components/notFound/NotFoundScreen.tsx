import * as React from "react";
import { Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  ActionCreator,
  dataEvent,
  DataEventType,
  IKeyedData,
  updateUiMode
} from "../../actions";
import { AppState, BusinessState, SettingsState, UiState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { NotFoundScreenProps } from "./interfaces";
import NotFound from "./NotFound";
import { notFoundScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
  uiState: UiState;
  settings: SettingsState;
}

interface DispatchProps {
  dataEvent: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends NotFoundScreenProps, StateProps, DispatchProps, NavigationScreenProps<"notFound"> {}

interface State {
  itemKey: string;
  itemKeyType: string;
  notOnFile: boolean;
}

class NotFoundScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(notFoundScreenStyles());

    this.state = {
      itemKey: props.itemKey,
      itemKeyType: props.itemKeyType,
      notOnFile: false
    };
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <NotFound itemKey={this.state.itemKey} onSave={this.handleRetry.bind(this)}
                  onCancel={this.pop} settings={this.props.settings} />
      </BaseView>
    );
  }

  private handleRetry(inputValue: string): void {
    if (!inputValue || inputValue.trim().length === 0) {
      return;
    }

    const keyedData: IKeyedData = {
      inputText: inputValue
    };

    this.props.dataEvent(DataEventType.KeyedData, keyedData);
    Keyboard.dismiss();
    this.props.navigation.dispatch(popTo("main"));
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    uiState: state.uiState,
    settings: state.settings
  };
}
export default connect(mapStateToProps, {
  dataEvent: dataEvent.request,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof NotFoundScreen>()(NotFoundScreen));
