import { ceil } from "lodash";
import * as React from "react";

import { ConfigurationBlockKey, PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  SSF_PASSWORD_CHANGE_REQUIRED_I18N_CODE,
  SSF_PASSWORD_CHANGE_WARNING_I18N_CODE,
  SSF_PASSWORD_EXPIRED_I18N_CODE
} from "@aptos-scp/scp-component-store-selling-features";

import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { ActionCreator } from "../../actions";
import { BusinessState, IUserNotificationState, SettingsState } from "../../reducers";
import { StackNavigatorParams } from "../StackNavigatorParams";
import { ExpiredUserData } from "./LoginScreen";

export interface BasePasswordForm {
  username: string;
  password: string;
}

export interface BasePasswordExpirationStateProps {
  businessState: BusinessState;
  settings: SettingsState;
  userNotification: IUserNotificationState;
}

export interface BasePasswordExpirationDispatchProps {
  performBusinessOperation: ActionCreator;
}

export interface BasePasswordExpirationProps extends BasePasswordExpirationStateProps,
    BasePasswordExpirationDispatchProps {
  navigation: NativeStackNavigationProp<StackNavigatorParams, keyof StackNavigatorParams>;
}

export interface BasePasswordExpirationState {}

let cachedExpiredUserData: ExpiredUserData = {
  id: undefined,
  username: undefined,
  password: undefined,
  daysUntilExpired: undefined
};
let canAutoMoveToChangePassword: boolean = false;

export abstract class BasePasswordExpirationScreen<P extends BasePasswordExpirationProps,
    S extends BasePasswordExpirationState> extends React.Component <P, S> {

  protected isSCO: boolean = false;
  protected passwordExpirationHandled: boolean = false;

  public constructor(props: P) {
    super(props);
  }

  public modifyCachedExpiredUserData(data: ExpiredUserData): void {
    cachedExpiredUserData = data;
  }

  public setAutoMove(canMove: boolean): void {
    canAutoMoveToChangePassword = canMove;
  }

  protected handleExpiredPassword(): void {
    const { userNotification } = this.props;

    if (canAutoMoveToChangePassword) {
      canAutoMoveToChangePassword = false;

      // FIXME: Pull the user's id off of nonContextualData rather than error parameter
      if (userNotification.error instanceof PosBusinessError &&
        userNotification.error.localizableMessage.parameters) {
        cachedExpiredUserData.id = userNotification.error.localizableMessage.parameters.get("id");
        cachedExpiredUserData.daysUntilExpired = ceil(userNotification.error.localizableMessage.parameters.get(
            CollectedDataKey.DaysUntilPasswordExpiration));
      }

      this.props.navigation.push("changePassword", { expiredUserData: cachedExpiredUserData });
      this.onMovetoPasswordScreen();
    }
  }

  protected moveToPasswordChangeRequired(prevProps: BasePasswordExpirationProps): boolean {
    const prevUserNotification = prevProps && prevProps.userNotification;
    const currentUserNotificationError = this.props && this.props.userNotification && this.props.userNotification.error;
    const userComponentConfig = this.props.settings && this.props.settings.configurationManager &&
        this.props.settings.configurationManager.getConfigurationValues(ConfigurationBlockKey.userComponent);
    const allowChangePassword = userComponentConfig && userComponentConfig.allowUserChangePassword;

    const useSCOhandling = this.isSCO && !this.passwordExpirationHandled && !!currentUserNotificationError;
    const userNotificationReceived: boolean = !prevUserNotification.error && !!currentUserNotificationError;

    let moveForExpiredPassword: boolean = false;
    let moveForPasswordExpirationWarning: boolean = false;
    let moveForPasswordChangeRequired: boolean = false;

    if ((useSCOhandling || userNotificationReceived) && currentUserNotificationError instanceof PosBusinessError) {
      moveForExpiredPassword = allowChangePassword &&
          currentUserNotificationError.localizableMessage.i18nCode === SSF_PASSWORD_EXPIRED_I18N_CODE;
      moveForPasswordExpirationWarning =
          currentUserNotificationError.localizableMessage.i18nCode === SSF_PASSWORD_CHANGE_WARNING_I18N_CODE;
      moveForPasswordChangeRequired = allowChangePassword &&
          currentUserNotificationError.localizableMessage.i18nCode === SSF_PASSWORD_CHANGE_REQUIRED_I18N_CODE;
      this.passwordExpirationHandled = true;
    }

    return moveForExpiredPassword || moveForPasswordExpirationWarning || moveForPasswordChangeRequired;
  }

  protected abstract onMovetoPasswordScreen(): void;
}
