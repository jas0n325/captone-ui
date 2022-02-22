import * as React from "react";
import { Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  ConfigurationBlockKey,
  DeviceIdentity,
  IConfigurationManager,
  IConfigurationValues,
  PosBusinessError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  CHANGE_PASSWORD_EVENT,
  ENTER_ATTENDANT_MODE_EVENT,
  EXIT_ATTENDANT_MODE_EVENT,
  LOG_OFF_EVENT,
  LOG_ON_EVENT,
  SSF_INVALID_CREDENTIALS_I18N_CODE,
  SSF_USER_API_ERROR_I18N_CODE,
  SSF_USER_LOCKOUT_I18N_CODE,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import {
  isLowercaseRequirementUnmet,
  isMinimumLengthRequirementUnmet,
  isSpecialCharacterRequirementUnmet,
  isUppercaseRequirementUnmet
} from "@aptos-scp/scp-component-user";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  updateUiMode
} from "../../actions";
import {AppState, BusinessState, IUserNotificationState, UI_MODE_CHANGE_PASSWORD } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationScreenProps } from "../StackNavigatorParams";
import ChangePassword, {
  IMandatoryPasswordRequirementsValidated,
  IOptionalPasswordRequirementsValidated,
  PasswordRequirementValidated
} from "./ChangePassword";
import { ChangePasswordScreenProps } from "./interface";
import { changePasswordScreenStyles } from "./styles";


interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  userNotification: IUserNotificationState;
  configManager: IConfigurationManager;
}

interface DispatchProps {
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends ChangePasswordScreenProps, StateProps,
    DispatchProps, NavigationScreenProps<"changePassword"> {}

interface State {
  changePasswordErrorText: string;
  mandatoryRequirementsMet: IMandatoryPasswordRequirementsValidated;
  optionalRequirementsMet: IOptionalPasswordRequirementsValidated;
  allPasswordRequirementsMet: boolean;
}

class ChangePasswordScreen extends React.Component<Props, State> {
  private cachedNewPassword: string;
  private selfCheckoutModeEnabled: boolean;
  private allowChangePassword: boolean;
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(changePasswordScreenStyles());
    this.state = {
      changePasswordErrorText: undefined,
      mandatoryRequirementsMet: {
        noOldPasswordMatch: undefined,
        noUsernameMatch: undefined,
        newPasswordsMatch: undefined
      },
      optionalRequirementsMet: {
        minimumLengthMet: undefined,
        specialCharactersMet: undefined,
        upperCaseMet: undefined,
        lowerCaseMet: undefined
      },
      allPasswordRequirementsMet: undefined
    };

    const functionalBehaviorValues: IConfigurationValues = this.props.configManager.getFunctionalBehaviorValues();

    this.selfCheckoutModeEnabled = functionalBehaviorValues.selfCheckoutModeBehaviors &&
        functionalBehaviorValues.selfCheckoutModeBehaviors.enabled;

    const userComponentConfig = this.props.configManager.getConfigurationValues(ConfigurationBlockKey.userComponent);
    this.allowChangePassword = userComponentConfig && userComponentConfig.allowUserChangePassword;
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_CHANGE_PASSWORD);

    Keyboard.dismiss();
  }

  public componentDidUpdate(prevProps: Props): void {
    this.handlePasswordChangeFinished(prevProps);
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <ChangePassword
          expiredUserData={this.props.expiredUserData}
          onSave={this.handlePasswordChange}
          onCancel={this.handleClose}
          onSkip={this.handleSkip}
          changePasswordErrorText={this.state.changePasswordErrorText}
          onClearChangePasswordErrorText={() => this.setState({changePasswordErrorText: undefined})}
          allowChangePassword={this.allowChangePassword}
          userComponentConfigs={this.props.configManager.getConfigurationValues(ConfigurationBlockKey.userComponent)}
          validatePasswordRequirements={this.validateAllPasswordRequirements.bind(this)}
          mandatoryRequirementsMet={this.state.mandatoryRequirementsMet}
          optionalRequirementsMet={this.state.optionalRequirementsMet}
          allPasswordRequirementsMet={this.state.allPasswordRequirementsMet}
        />
      </BaseView>
    );
  }

  private validateAllPasswordRequirements =  (props: any, values: any): void => {
    const optionalMet = this.validateOptionalPasswordRequirements(props, values);
    const mandatoryMet = this.validateMandatoryPasswordRequirements(props, values);
    this.setState({
      allPasswordRequirementsMet: optionalMet && mandatoryMet
    });
  }

  private validateMandatoryPasswordRequirements(props: any, values: any): boolean {
    let passMatchValid: PasswordRequirementValidated;
    let noUsernameMatch: PasswordRequirementValidated;
    let noOldPasswordMatch: PasswordRequirementValidated;
    let allReqsMet: boolean = true;
    if (values.newPassword && values.confirmPassword) {
      if (values.newPassword === values.confirmPassword) {
        passMatchValid = PasswordRequirementValidated.Valid;
      } else {
        passMatchValid = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      }
    } else {
      passMatchValid = PasswordRequirementValidated.NotAvailable;
      allReqsMet = false;
    }

    if (props.expiredUserData) {
      if (values.newPassword && props.expiredUserData.password !== values.newPassword) {
        noOldPasswordMatch = PasswordRequirementValidated.Valid;
      } else if (values.newPassword) {
        noOldPasswordMatch = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      } else {
        noOldPasswordMatch = PasswordRequirementValidated.NotAvailable;
        allReqsMet = false;
      }

      if (values.newPassword && props.expiredUserData.username !== values.newPassword) {
        noUsernameMatch = PasswordRequirementValidated.Valid;
      } else if (values.newPassword) {
        noUsernameMatch = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      } else {
        noUsernameMatch = PasswordRequirementValidated.NotAvailable;
        allReqsMet = false;
      }
    } else {
      if (values.newPassword && values.password && values.password !== values.newPassword) {
        noOldPasswordMatch = PasswordRequirementValidated.Valid;
      } else if (values.newPassword && values.password) {
        noOldPasswordMatch = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      } else {
        noOldPasswordMatch = PasswordRequirementValidated.NotAvailable;
        allReqsMet = false;
      }

      if (values.newPassword && values.newPassword !== this.props.businessState.stateValues.get("UserSession.user.username")) {
        noUsernameMatch = PasswordRequirementValidated.Valid;
      } else if (values.newPassword) {
        noUsernameMatch = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      } else {
        noUsernameMatch = PasswordRequirementValidated.NotAvailable;
        allReqsMet = false;
      }
    }
    this.setState({mandatoryRequirementsMet: {
      newPasswordsMatch: passMatchValid,
      noUsernameMatch,
      noOldPasswordMatch
    }});
    return allReqsMet;
  }


  private validateOptionalPasswordRequirements(props: any, values: any): boolean {
    let allReqsMet = true;
    let upperCaseMet: PasswordRequirementValidated;
    let lowerCaseMet: PasswordRequirementValidated;
    let specialCharactersMet: PasswordRequirementValidated;
    let minimumLengthMet: PasswordRequirementValidated;
    const passwordRequirements = props.userComponentConfigs?.passwordRequirements;

    if (passwordRequirements?.requireUpperCase) {
      if (values.newPassword && isUppercaseRequirementUnmet(passwordRequirements, values.newPassword)) {
        upperCaseMet = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      } else if (values.newPassword) {
        upperCaseMet = PasswordRequirementValidated.Valid;
      } else {
        upperCaseMet = PasswordRequirementValidated.NotAvailable;
        allReqsMet = false;
      }
    }

    if (passwordRequirements?.requireLowerCase) {
      if (values.newPassword && isLowercaseRequirementUnmet(passwordRequirements, values.newPassword)) {
        lowerCaseMet = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      } else if (values.newPassword) {
        lowerCaseMet = PasswordRequirementValidated.Valid;
      } else {
        lowerCaseMet = PasswordRequirementValidated.NotAvailable;
        allReqsMet = false;
      }
    }

    if (passwordRequirements?.requireSpecialCharacter &&
        passwordRequirements.specialCharacterList?.length > 0) {
      if (values.newPassword &&
          isSpecialCharacterRequirementUnmet(passwordRequirements, values.newPassword)) {
        specialCharactersMet = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      } else if (values.newPassword) {
        specialCharactersMet = PasswordRequirementValidated.Valid;
      } else {
        specialCharactersMet = PasswordRequirementValidated.NotAvailable;
        allReqsMet = false;
      }
    }

    if (passwordRequirements?.minimumPasswordLength) {
      if (values.newPassword && isMinimumLengthRequirementUnmet(passwordRequirements, values.newPassword)) {
        minimumLengthMet = PasswordRequirementValidated.Invalid;
        allReqsMet = false;
      } else if (values.newPassword) {
        minimumLengthMet = PasswordRequirementValidated.Valid;
      } else if (!values.newPassword) {
        minimumLengthMet = PasswordRequirementValidated.NotAvailable;
        allReqsMet = false;
      }
    }

    this.setState({optionalRequirementsMet: {
      minimumLengthMet,
      specialCharactersMet,
      upperCaseMet,
      lowerCaseMet
    }});
    return allReqsMet;
  }

  private handlePasswordChange = (password: string, newPassword: string): void => {
    this.cachedNewPassword = newPassword;

    const uiInputs: UiInput[] = [];

    if (this.props.expiredUserData) {
      uiInputs.push(new UiInput(UiInputKey.EXPIRED_PASSWORD_CHANGE, true));
      uiInputs.push(new UiInput(UiInputKey.EXPIRED_PASSWORD_USER_ID, this.props.expiredUserData.id));
    }

    // For forced password changes, password param is given the password entered in LoginScreen
    uiInputs.push(new UiInput(UiInputKey.PASSWORD, password));
    uiInputs.push(new UiInput("newPassword", newPassword));

    this.setState({changePasswordErrorText: undefined});
    this.props.businessOperation(this.props.deviceIdentity, CHANGE_PASSWORD_EVENT, uiInputs);

    Keyboard.dismiss();
  }

  private handleClose = (): void => {
    this.props.navigation.pop();
  }

  private handleSkip = (username: string, password: string): void => {
    const uiInputs: UiInput[] = [];

    uiInputs.push(new UiInput(UiInputKey.SKIP_PASSWORD_CHANGE, true));
    uiInputs.push(new UiInput(UiInputKey.USERNAME, username));
    uiInputs.push(new UiInput(UiInputKey.PASSWORD, password));

    this.props.businessOperation(this.props.deviceIdentity, this.selfCheckoutModeEnabled ?
        ENTER_ATTENDANT_MODE_EVENT : LOG_ON_EVENT, uiInputs);
    Keyboard.dismiss();
  }

  private handlePasswordChangeFinished(prevProps: Props): void {
    const propsError = this.props.businessState.error || this.props.userNotification.error;
    const prevPropsError = prevProps.businessState.error || prevProps.userNotification.error;
    const businessEventStopped: boolean = prevProps.businessState.inProgress && !this.props.businessState.inProgress;

    if (!prevPropsError && !!propsError && propsError instanceof PosBusinessError) {
      if (propsError.localizableMessage.i18nCode === SSF_USER_LOCKOUT_I18N_CODE) {
        this.props.businessOperation(this.props.deviceIdentity,
            this.selfCheckoutModeEnabled ? EXIT_ATTENDANT_MODE_EVENT : LOG_OFF_EVENT, []);
      } else if (propsError.localizableMessage.i18nCode === SSF_INVALID_CREDENTIALS_I18N_CODE) {
          this.setState({changePasswordErrorText: I18n.t("invalidPassword")});
      } else if (propsError.localizableMessage.i18nCode === SSF_USER_API_ERROR_I18N_CODE) {
          this.setState({changePasswordErrorText: I18n.t(propsError.localizableMessage.i18nCode)});
      }
    }

    const businessEventChangePassword: boolean = this.props.businessState.eventType === CHANGE_PASSWORD_EVENT;

    if (!propsError && businessEventStopped && businessEventChangePassword) {
      const wasForcedPasswordChange: boolean = businessEventStopped && businessEventChangePassword &&
          !!this.props.expiredUserData;

      if (wasForcedPasswordChange) {
        const uiInputs: UiInput[] = [
          new UiInput(UiInputKey.USERNAME, this.props.expiredUserData.username),
          new UiInput(UiInputKey.PASSWORD, this.cachedNewPassword)
        ];

        this.props.businessOperation(this.props.deviceIdentity, this.selfCheckoutModeEnabled ?
            ENTER_ATTENDANT_MODE_EVENT : LOG_ON_EVENT, uiInputs);
      } else {
        this.handleClose();
      }

      this.cachedNewPassword = undefined;
    }
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    userNotification: state.userNotification,
    configManager: state.settings.configurationManager
  };
}

export default connect(mapStateToProps, {
  businessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof ChangePasswordScreen>()(ChangePasswordScreen));
