import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { BackHandler } from "react-native";

export interface HardwareBackButtonHandlerProps {
  onBackPress: () => boolean;
}

/**
 * Functional component to use appropriate react navigation hooks to override default back handler functionality.
 * Returns null and does not display anything.
 */
export function HardwareBackButtonHandler(props: HardwareBackButtonHandlerProps): JSX.Element {
  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", props.onBackPress);
    }, [props])
  );

  // null is considered a valid JSX.Element
  return null;
}
