import * as React from "react";
import { Image, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { DecoratedFormProps, Field, InjectedFormProps, reduxForm } from "redux-form";

import { PosBusinessError, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  LOGGED_OFF,
  LOG_ON_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation } from "../../actions";
import {
  AppState,
  BusinessState,
  IAppAccessLockState,
  IAppVersionBlockedState,
  IUserNotificationState,
  SettingsState,
  UiState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import FeedbackNote from "../common/FeedbackNote";
import { renderTextInputField } from "../common/FieldValidation";
import Spinner from "../common/Spinner";
import VectorIcon from "../common/VectorIcon";
import { StackNavigatorParams } from "../StackNavigatorParams";
import {
  BasePasswordExpirationDispatchProps,
  BasePasswordExpirationScreen,
  BasePasswordExpirationState,
  BasePasswordExpirationStateProps
} from "./BasePasswordExpirationScreen";
import { LoginScreenProps } from "./interfaces";
import { loginStyle } from "./styles";

export interface LoginForm {
  username: string;
  password: string;
}

export interface ExpiredUserData extends LoginForm {
  id: string;
  daysUntilExpired: number;
}

let formExpiredUserData: ExpiredUserData = {
  id: undefined,
  username: undefined,
  password: undefined,
  daysUntilExpired: undefined
};
let canAutoMoveToChangePassword: boolean = false;

interface StateProps extends BasePasswordExpirationStateProps {
  businessState: BusinessState;
  settings: SettingsState;
  uiState: UiState;
  userNotification: IUserNotificationState;
  appAccessLock: IAppAccessLockState;
  appVersionsBlocked: IAppVersionBlockedState;
}

interface DispatchProps extends BasePasswordExpirationDispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props extends LoginScreenProps, StateProps, DispatchProps,
    NativeStackScreenProps<StackNavigatorParams, "login"> {}

interface State extends BasePasswordExpirationState {
  appVersionIsBlocked?: boolean;
  appLocked: boolean;
  appBlockedMessageDisplayed: boolean;
}

class LoginScreen extends BasePasswordExpirationScreen<Props & InjectedFormProps<LoginForm, Props>, State> {
  private username: any;
  private password: any;
  private errorMessage: string;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<LoginForm, Props>) {
    super(props);

    this.styles = Theme.getStyles(loginStyle());

    this.state = {
      appVersionIsBlocked: props.appVersionsBlocked.appVersionBlocked,
      appLocked: props.appAccessLock.appLocked,
      appBlockedMessageDisplayed: false
    };
  }

  public componentDidMount(): void {
    if (!this.state.appLocked && !this.props.appVersionsBlocked.appVersionBlocked && this.username
        && this.username.focus) {
      this.username.focus();
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!!formExpiredUserData) {
      this.modifyCachedExpiredUserData(formExpiredUserData);
      formExpiredUserData = undefined;
    }
    if (canAutoMoveToChangePassword) {
      this.setAutoMove(canAutoMoveToChangePassword);
    }
    if (this.moveToPasswordChangeRequired(prevProps)) {
      this.handleExpiredPassword();
    }
    if (prevProps.uiState.logicalState === LOGGED_OFF && this.props.uiState.logicalState !== LOGGED_OFF) {
      this.errorMessage = undefined;
    }
    if (this.props.appVersionsBlocked.appVersionBlocked && !this.state.appBlockedMessageDisplayed) {
      this.setState({ appBlockedMessageDisplayed: true });
      this.setState({ appVersionIsBlocked: true });
    }
  }

  public componentWillMount(): void {
    this.clearOutCachedData();
  }

  public render(): JSX.Element {

    const error = this.props.businessState.error || (this.props.userNotification && this.props.userNotification.error);

    if (error) {
      if (error instanceof PosBusinessError) {
        this.errorMessage = I18n.t(
          error.localizableMessage.i18nCode,
          error.localizableMessage.parameters || new Map<string, any>()
        );
      } else {
        this.errorMessage = I18n.t("invalidCredentials");
      }
    }

    return (
      <BaseView style={this.styles.root}>
        {
          !this.props.businessState.inProgress &&
          <KeyboardAwareScrollView contentContainerStyle={this.styles.fill}>
            <View style={this.styles.login}>
              {
                Theme.isTablet &&
                <View style={this.styles.aptosLogoPanel}>
                  <VectorIcon name={"One"} fill={this.styles.aptosLogo.color} height={this.styles.aptosLogo.height}/>
                </View>
              }
              <View style={this.styles.logoPanel}>
                <Image source={this.props.loginLogo} style={this.styles.logo} resizeMode="contain"/>
              </View>
              {
                this.errorMessage &&
                <View style={this.styles.error}>
                  <View style={this.styles.errorContainer}>
                    <Text style={this.styles.errorText}>{this.errorMessage}</Text>
                  </View>
                </View>
              }
              {
                this.props.appVersionsBlocked.appVersionBlocked &&
                <View style={this.styles.feedBackNoteDisplay}>
                  <FeedbackNote
                    messageTitle={I18n.t("applicationDisabled")}
                    message={I18n.t("versionNoLongerSupported")}
                    style={this.styles}
                  />
                </View>
              }
              {
                this.state.appLocked &&
                <View style={this.styles.feedBackNoteDisplay}>
                  <FeedbackNote
                    messageTitle={I18n.t("appLockErrorTitle")}
                    message={I18n.t("appLockErrorMessage")}
                    style={this.styles}
                  />
                </View>
              }
              <Field name="username" onRef={(ref: any) => this.username = ref} placeholder={I18n.t("username")}
                    style={this.styles.input} inputStyle={this.styles.inputField}
                    keyboardType="numbers-and-punctuation" component={renderTextInputField}
                    disabled = {this.props.appVersionsBlocked.appVersionBlocked || this.state.appLocked}
                    onSubmitEditing={() => this.password.focus && this.password.focus()}/>
              <Field name="password" onRef={(ref: any) => this.password = ref} placeholder={I18n.t("password")}
                    style={this.styles.input} inputStyle={this.styles.inputField} secureTextEntry={true}
                    selectTextOnFocus
                    returnKeyType={"done"} component={renderTextInputField}
                    disabled = {this.props.appVersionsBlocked.appVersionBlocked || this.state.appLocked}
                    onSubmitEditing={() => this.onSubmit()}/>
              <TouchableOpacity
                disabled={this.props.appVersionsBlocked.appVersionBlocked || this.state.appLocked}
                onPress={() => this.onSubmit()}
              >
                <View style={this.styles.button}>
                  <Text style={this.styles.buttonText}>{I18n.t("signIn")}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        }
        {
          this.props.businessState.inProgress &&
          <Spinner/>
        }
      </BaseView>
    );
  }

  protected onMovetoPasswordScreen(): void {
    //INTENTIONALLY EMPTY
    return;
  }

  private clearOutCachedData(): void {
    // Explicitly clear this for sanity
    formExpiredUserData = undefined;
  }

  private onSubmit(): void {
    if (this.props.appVersionsBlocked.appVersionBlocked || this.state.appLocked) {
      this.username.clear();
      this.password.clear();
    } else {
      this.props["submit"]();
    }
    this.errorMessage = undefined;
  }
}

const loginForm = reduxForm<LoginForm, Props>({
  form: "login",
  validate: (values: LoginForm) => {
    const errors: { username: string, password: string } = {username: undefined, password: undefined};
    if (!values.username || values.username.trim().length === 0) {
      errors.username = I18n.t("required", {field: I18n.t("username")});
    }
    if (!values.password || values.password.trim().length === 0) {
      errors.password = I18n.t("required", {field: I18n.t("password")});
    }
    return errors;
  },
  initialValues: {username: undefined, password: undefined},
  onSubmit: (data: LoginForm, dispatch: Dispatch<any>, props: DecoratedFormProps<LoginForm, Props>) => {
    if (!props.businessState.inProgress) {

      canAutoMoveToChangePassword = true;
      formExpiredUserData = {
        id: undefined,
        password: data.password,
        username: data.username,
        daysUntilExpired: undefined
      };

      const uiInputs: UiInput[] = [];
      uiInputs.push(new UiInput(UiInputKey.USERNAME, data.username));
      uiInputs.push(new UiInput(UiInputKey.PASSWORD, data.password));

      props.performBusinessOperation(props.settings.deviceIdentity, LOG_ON_EVENT, uiInputs);

      props.reset();

      Keyboard.dismiss();
    }
  }
});

function mapStateToProps(state: AppState): StateProps {
  return {
    appAccessLock: state.appAccessLock,
    appVersionsBlocked: state.appVersionBlocked,
    businessState: state.businessState,
    settings: state.settings,
    uiState: state.uiState,
    userNotification: state.userNotification
  };
}

export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})((loginForm)(withMappedNavigationParams<typeof LoginScreen>()(LoginScreen)));
