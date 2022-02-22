import { CommonActions, Route, StackActions, StackNavigationState } from "@react-navigation/native";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import { StackNavigatorParams } from "../../StackNavigatorParams";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.utilities.navigationUtils");

export const popTo = (routeName: keyof StackNavigatorParams, fallbackRoute?: keyof StackNavigatorParams) =>
    (state: StackNavigationState<StackNavigatorParams>) => {
  const reversedRoute: Route<keyof StackNavigatorParams>[] = [...state.routes].reverse();

  const indexOfRoute = reversedRoute.findIndex((route: Route<keyof StackNavigatorParams>) => route.name === routeName);
  if (indexOfRoute > -1) {
    return StackActions.pop(indexOfRoute);
  } else {
    if (fallbackRoute) {
      logger.debug(`No route with name "${routeName}" was found on the stack. Using fallback route "${fallbackRoute}`);
      const indexOfFallbackRoute =
          reversedRoute.findIndex((route: Route<keyof StackNavigatorParams>) => route.name === fallbackRoute);
      if (indexOfFallbackRoute > -1) {
        return StackActions.pop(indexOfFallbackRoute);
      }
    }
    logger.warn(`No route with the name "${routeName}" was found on the stack.`, { metaData: new Map<string, string>(
      [
        ["fallbackRoute", fallbackRoute],
        ["routeName", routeName]
      ]
    )});
  }
};

/**
 * Cannot be used to replace init screen.
 */
export const popAndReplace =
    <T extends keyof StackNavigatorParams>(routeName: T, params?: Partial<StackNavigatorParams[T]>) =>
    (state: StackNavigationState<StackNavigatorParams>) => {
  if (state.routes.length > 2) {
    const routes = state.routes.slice(0, state.routes.length - 2);
    routes.push({
      name: routeName,
      params,
      key: undefined
    });
    return CommonActions.reset({
      ...state,
      routes,
      index: routes.length - 1
    });
  } else {
    logger.warn("Unable to pop and replace. There are not enough screens on the stack.", {
      metaData: new Map<string, any>([
        ["routeName", routeName],
        ["currentStackLength", state.routes.length],
        ["params", params]
    ])});
  }
};

export const replace =
    <T extends keyof StackNavigatorParams>(routeName: T, params?: Partial<StackNavigatorParams[T]>) =>
    (state: StackNavigationState<StackNavigatorParams>) => {
  return StackActions.replace(routeName, params);
};

export const pop = (numOfScreens: number = 1) => (state: StackNavigationState<StackNavigatorParams>) => {
  return StackActions.pop(numOfScreens);
};

export const push = <T extends keyof StackNavigatorParams>(routeName: T, params?: Partial<StackNavigatorParams[T]>) =>
    (state: StackNavigationState<StackNavigatorParams>) => {
  return StackActions.push(routeName, params);
};

export const refreshScreen = (screenKey: string, params: {} = {}): CommonActions.Action => {
  return {
    ...CommonActions.setParams(params),
    source: screenKey
  };
};
