import * as React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { connect } from "react-redux";

import I18n from "../../../config/I18n";
import { ActionCreator, updateUiMode } from "../../actions";
import { UI_MODE_INFORMATION_TERMINAL } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { NavigationScreenProps } from "../StackNavigatorParams";
import MainInformation from "./MainInformation";
import { informationStyle } from "./styles";

interface DispatchProps {
  updateUiMode: ActionCreator;
}

export interface Props extends DispatchProps, NavigationScreenProps<"information"> {}

export interface State {
  refreshing: boolean;
}

class InformationScreen extends React.Component<Props, State> {
  private styles: any;
  private testID: string;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(informationStyle());
    this.testID = "InformationScreen";

    this.state = {
      refreshing: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_INFORMATION_TERMINAL);
  }

  public render(): JSX.Element {
    const styles = this.styles;
    return (
      <BaseView style={this.styles.fill}>
        <Header
          title={I18n.t("information")}
          testID={this.testID}
          backButton={{name: "Back", action: this.pop}}
        />
        <View style={styles.informationContainer}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContainer}
            refreshControl={<RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this.updateRefreshing(true)} />}
          >
            <MainInformation
                parentStyles={informationStyle()}
                updateRefreshing={this.updateRefreshing}
                updateInformation={this.state.refreshing}
            />
          </ScrollView>
        </View>
      </BaseView>
    );
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  private updateRefreshing = (enable: boolean) => {
    this.setState({ refreshing: enable });
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

export default connect(undefined, {
  updateUiMode: updateUiMode.request
})(InformationScreen);
