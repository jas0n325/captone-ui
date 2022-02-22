import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { DecoratedFormProps, Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import {
  DeviceIdentity,
  PosBusinessError,
   UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  ENTER_ATTENDANT_MODE_EVENT,
  SSF_INVALID_CREDENTIALS_I18N_CODE,
  SSF_PASSWORD_CHANGE_REQUIRED_I18N_CODE,
  SSF_PASSWORD_CHANGE_WARNING_I18N_CODE,
  SSF_PASSWORD_EXPIRED_I18N_CODE,
  SSF_USER_API_ERROR_I18N_CODE,
  SSF_USER_LOCKOUT_I18N_CODE,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { ActionCreator, businessOperation } from "../../../actions";
import { AppState } from "../../../reducers";
import Theme from "../../../styles";
import { renderTextInputField } from "../../common/FieldValidation";
import {
  BasePasswordExpirationDispatchProps,
  BasePasswordExpirationScreen,
  BasePasswordExpirationState,
  BasePasswordExpirationStateProps
} from "../../login/BasePasswordExpirationScreen";
import { ExpiredUserData } from "../../login/LoginScreen";
import { StackNavigatorParams } from "../../StackNavigatorParams";
import { scoToggleModePopUpStyles } from "./styles";


export interface ToggleModeForm {
  username: string;
  password: string;
}

interface StateProps extends BasePasswordExpirationStateProps {
  deviceIdentity: DeviceIdentity;
}

interface DispatchProps extends BasePasswordExpirationDispatchProps {
  performBusinessOperation: ActionCreator;
}

interface Props extends StateProps, DispatchProps {
  onHide: () => void;
  navigation: NativeStackNavigationProp<StackNavigatorParams>;
}

interface State extends BasePasswordExpirationState {}

let formExpiredUserData: ExpiredUserData = {
  id: undefined,
  username: undefined,
  password: undefined,
  daysUntilExpired: undefined
};
let canAutoMoveToChangePassword = true;

class SCOToggleModePopUp extends BasePasswordExpirationScreen<Props & InjectedFormProps<ToggleModeForm, Props> &
    FormInstance<ToggleModeForm, Props>, State> {
  private passwordField: any;
  private styles: any;
  private usernameField: any;

  constructor(props: Props & InjectedFormProps<ToggleModeForm, Props> & FormInstance<ToggleModeForm, Props>) {
    super(props);

    this.styles = Theme.getStyles(scoToggleModePopUpStyles());
  }

  public componentDidMount(): void {
    this.usernameField.focus();
    this.isSCO = true;
    formExpiredUserData = undefined;
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.moveToPasswordChangeRequired(prevProps)) {
      this.handleExpiredPassword();
    }
  }

  public componentWillUnmount(): void {
    if (!!formExpiredUserData) {
      this.modifyCachedExpiredUserData(formExpiredUserData);
      formExpiredUserData = undefined;
    }
    if (canAutoMoveToChangePassword) {
      this.setAutoMove(canAutoMoveToChangePassword);
      canAutoMoveToChangePassword = false;
    }
  }

  public render(): JSX.Element {
    const loginError = (this.props.businessState && this.props.businessState.error) ||
        (this.props.userNotification && this.props.userNotification.error);

    let errorMessage: string;

    if (loginError && loginError instanceof PosBusinessError &&
        (loginError.localizableMessage.i18nCode === SSF_INVALID_CREDENTIALS_I18N_CODE
            || loginError.localizableMessage.i18nCode === SSF_USER_LOCKOUT_I18N_CODE
            || loginError.localizableMessage.i18nCode === SSF_PASSWORD_CHANGE_REQUIRED_I18N_CODE
            || loginError.localizableMessage.i18nCode === SSF_USER_API_ERROR_I18N_CODE
            || loginError.localizableMessage.i18nCode === SSF_PASSWORD_EXPIRED_I18N_CODE
            || loginError.localizableMessage.i18nCode === SSF_PASSWORD_CHANGE_WARNING_I18N_CODE)) {
      let i18nCode = loginError.localizableMessage.i18nCode;
      if (i18nCode === SSF_PASSWORD_CHANGE_REQUIRED_I18N_CODE || i18nCode === SSF_PASSWORD_EXPIRED_I18N_CODE) {
        i18nCode = `${SSF_PASSWORD_CHANGE_REQUIRED_I18N_CODE}SCO`;
      }
      errorMessage = I18n.t(i18nCode, loginError.localizableMessage.parameters ||
          new Map<string, any>());
    }

    return (
      <View style={this.styles.root}>
        <View style={this.styles.textArea}>
          <Text style={this.styles.title}>{I18n.t("enterLoginInfo")}</Text>
          <Text style={this.styles.generalText}>{I18n.t("provideValidCredentials")}</Text>
        </View>
        <View style={this.styles.fieldArea}>
          <View style={this.styles.errorTextArea}>
            { errorMessage && <Text style={[this.styles.errorText, this.styles.errorTextMain]}>{errorMessage}</Text> }
          </View>
          <Field
            name={"username"}
            onRef={(ref: any) => this.usernameField = ref}
            placeholder={I18n.t("username")}
            style={this.styles.field}
            inputStyle={this.styles.fieldInput}
            keyboardType={"numbers-and-punctuation"}
            component={renderTextInputField}
            errorStyle={this.styles.errorText}
            onSubmitEditing={() => this.passwordField.focus()}
            secureTextEntry={true}
          />
          <Field
            name={"password"}
            onRef={(ref: any) => this.passwordField = ref}
            placeholder={I18n.t("password")}
            style={this.styles.field}
            inputStyle={this.styles.fieldInput}
            component={renderTextInputField}
            errorStyle={this.styles.errorText}
            onSubmitEditing={() => this.props.submit()}
            returnKeyType={"done"}
            secureTextEntry={true}
          />
        </View>
        <View style={this.styles.buttonArea}>
          <TouchableOpacity
            style={this.styles.cancelButton}
            onPress={() => this.props.onHide()}
          >
            <Text style={this.styles.cancelButtonText}>{I18n.t("cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.styles.submitButton}
            onPress={() => this.props.submit()}
          >
            <Text style={this.styles.submitButtonText}>{I18n.t("submit")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  protected onMovetoPasswordScreen(): void {
    this.props.onHide();
  }
}

const SCOToggleModePopUpForm = reduxForm<ToggleModeForm, Props>({
  form: "toggleModeForm",
  validate: (values: ToggleModeForm) => {
    const errors: ToggleModeForm = {
      username: undefined,
      password: undefined
    };

    if (!values.username) {
      errors.username = I18n.t("usernameMissing");
    }

    if (!values.password) {
      errors.password = I18n.t("passwordMissing");
    }

    return errors;
  },
  onSubmit: (data: ToggleModeForm, dispatch: Dispatch<any>, props: DecoratedFormProps<ToggleModeForm, Props>) => {
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

    props.performBusinessOperation(props.deviceIdentity, ENTER_ATTENDANT_MODE_EVENT, uiInputs);

    Keyboard.dismiss();
  }
})(SCOToggleModePopUp);

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings && state.settings.deviceIdentity,
    settings: state.settings,
    userNotification: state.userNotification
  };
};

export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(SCOToggleModePopUpForm);
