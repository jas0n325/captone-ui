import {
  createNavigationContainerRef,
  getFocusedRouteNameFromRoute,
  NavigationAction,
  NavigationState
} from "@react-navigation/native";
import { NativeStackNavigationOptions } from "react-native-screens/native-stack";
import { refreshScreen } from "./common/utilities/navigationUtils";

import { INITIAL_ROUTE, StackNavigatorParams } from "./StackNavigatorParams";

export const navigationRef = createNavigationContainerRef<StackNavigatorParams>();

/**
 * Navigate from anywhere in the app. Should only be used if access to a navigation prop is not available.
 */
export function navigate(name: keyof StackNavigatorParams, params?: {}, merge: boolean = true): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate({name, params, merge});
  }
}

// tslint:disable-next-line: max-line-length
export function refreshScreenWithNavigationRef<T extends keyof StackNavigatorParams>(name: T, params: Partial<StackNavigatorParams[T]> = {}): void {
  const route = navigationRef.current?.getCurrentRoute();
  if (name === route.name) {
    dispatchWithNavigationRef(refreshScreen(route.key, params));
  }
}

export function getCurrentBackButton(): JSX.Element {
  const options: NativeStackNavigationOptions = navigationRef.current?.getCurrentOptions();
  if (options?.headerLeft) {
    const headerLeft: JSX.Element = options.headerLeft({}) as JSX.Element;
    return headerLeft;
  }
}

export function dispatchWithNavigationRef(action: NavigationAction | ((state: NavigationState) => NavigationAction)):
    void {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(action);
  }
}

export function resetStackWithNavigationRef<T extends keyof StackNavigatorParams>(
    name: T,
    params?: Partial<StackNavigatorParams[T]>
): void {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }]
    });
  }
}

export function getCurrentRouteNameWithNavigationRef(): string {
  if (navigationRef.isReady()) {
    const route = navigationRef.current?.getCurrentRoute();
    return (route && (getFocusedRouteNameFromRoute(route) || route.name)) || INITIAL_ROUTE;
  } else {
    return INITIAL_ROUTE;
  }
}
