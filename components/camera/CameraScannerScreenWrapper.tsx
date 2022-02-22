import { useNavigationState } from "@react-navigation/native";
import * as React from "react";

import CameraScannerScreen from "@aptos-scp/scp-component-rn-device-services";

import { NavigationScreenProps } from "../StackNavigatorParams";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";

interface Props extends NavigationScreenProps<"scan"> {}

export const CameraScannerScreenWrapper: React.FunctionComponent<Props> = (props) => {
  // useNavigationState will trigger whenever the navigationState updates and will update the currentSceneName prop
  const currentSceneName = useNavigationState((state) => {
    return getCurrentRouteNameWithNavigationRef()
  });
  const params = props.route.params;
  return <CameraScannerScreen {...params} currentSceneName={currentSceneName} />;
};
