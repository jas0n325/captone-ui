import _ from "lodash";
import * as React from "react";
import { BackHandler } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";

import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { HardwareBackButtonHandler } from "../common/HardwareBackButtonHandler";
import Spinner from "../common/Spinner";
import { getCurrentBackButton } from "../RootNavigation";
import { NavigationScreenProps, StackNavigatorParams } from "../StackNavigatorParams";
import { InitScreenProps } from "./interfaces";
import { initStyle } from "./styles";

export interface StateProps {
  currentScreen: keyof StackNavigatorParams;
}

interface Props extends InitScreenProps, NavigationScreenProps<"init"> {}

class InitScreen extends React.Component<Props> {
  private styles: any;
  private onBackPress: () => boolean;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(initStyle());

    this.onBackPress = () => {
      const backButton = getCurrentBackButton();
      const backButtonPress = backButton?.props?.onPress;
      if (backButtonPress) {
        backButtonPress();
      }
      //do not pop screen
      return true;
    };

  }

  public componentDidMount(): void {
    if (this.props.autoMoveSceneKey) {
      this.props.navigation.push(this.props.autoMoveSceneKey as keyof StackNavigatorParams);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    const autoMoveSceneKey = this.props.autoMoveSceneKey;
    if (autoMoveSceneKey && prevProps.autoMoveSceneKey !== autoMoveSceneKey) {
      this.props.navigation.push(autoMoveSceneKey as keyof StackNavigatorParams);
    }
  }

  public componentWillUnmount(): void {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  public render(): JSX.Element {
    return (
      <>
        <HardwareBackButtonHandler onBackPress={this.onBackPress}/>
        <BaseView style={this.styles.container}>
          <Spinner size={ 0 } />
        </BaseView>
      </>
    );
  }
}

export default withMappedNavigationParams<typeof InitScreen>()(InitScreen);
