import * as React from "react";
import { Keyboard, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { colors } from "../../styles/styles";
import { renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { handleFormSubmission, warnBeforeLosingChanges } from "../common/utilities";
import { ExpiredUserData } from "../login/LoginScreen";
import { changePasswordStyle } from "./styles";
import VectorIcon from "../common/VectorIcon";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.user.ChangePassword");

export interface PasswordForm {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

export enum PasswordRequirementValidated {
  Valid = "Valid",
  Invalid = "Invalid",
  NotAvailable = "Not Available"
}

export interface IMandatoryPasswordRequirementsValidated {
  newPasswordsMatch?: PasswordRequirementValidated;
  noUsernameMatch?: PasswordRequirementValidated;
  noOldPasswordMatch?: PasswordRequirementValidated;
}

export interface IOptionalPasswordRequirementsValidated {
  minimumLengthMet?: PasswordRequirementValidated;
  specialCharactersMet?: PasswordRequirementValidated;
  upperCaseMet?: PasswordRequirementValidated;
  lowerCaseMet?: PasswordRequirementValidated;
}

export interface ValidationIcon {
  icon: string;
  color: string;
}

interface Props {
  expiredUserData: ExpiredUserData;
  allowChangePassword: boolean;
  onSave: (password: string, newPassword: string) => void;
  onCancel: () => void;
  onSkip: (username: string, password: string) => void;
  changePasswordErrorText: string;
  onClearChangePasswordErrorText: () => void;
  userComponentConfigs: IConfigurationValues;
  validatePasswordRequirements: (props: Props, values: any) => void;
  mandatoryRequirementsMet: IMandatoryPasswordRequirementsValidated;
  optionalRequirementsMet: IOptionalPasswordRequirementsValidated;
  allPasswordRequirementsMet: boolean;
}

interface State {}

const validPasswordIcon: ValidationIcon = { icon: "Checkmark", color: colors.good };
const invalidPasswordIcon: ValidationIcon = { icon: "Cancel", color: colors.bad };
const notAvailablePasswordIcon: ValidationIcon = { icon: "Bullet", color: colors.darkerGrey };

const passwordRequirementValidatedToValidationIcon = new Map<PasswordRequirementValidated, ValidationIcon>([
  [PasswordRequirementValidated.Invalid, invalidPasswordIcon],
  [PasswordRequirementValidated.Valid, validPasswordIcon],
  [PasswordRequirementValidated.NotAvailable, notAvailablePasswordIcon]
]);

class ChangePassword extends React.Component<Props & InjectedFormProps<PasswordForm, Props> &
    FormInstance<PasswordForm, undefined>, State> {
  private password: any;
  private newPassword: any;
  private confirmPassword: any;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<PasswordForm, Props> &
      FormInstance<PasswordForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(changePasswordStyle());
  }

  public componentDidMount(): void {
    if (this.password && this.password.focus) {
      this.password.focus();
    }
  }

  public render(): JSX.Element {
    const rightButtonTitle = this.getRightButtonTitle();
    return (
      <View style={this.styles.fill}>
        <Header
          title={I18n.t("changePassword")}
          backButton={{
            name: "Back",
            action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onCancel)
          }}
          rightButton={ !!rightButtonTitle  && {
            title: rightButtonTitle,
            action: this.props.expiredUserData && this.props.expiredUserData.daysUntilExpired
                ? () => this.props.onSkip(this.props.expiredUserData.username, this.props.expiredUserData.password)
                : () => handleFormSubmission(logger, this.props.submit)
          }}

          isVisibleTablet={Theme.isTablet}
        />
        <ScrollView style={this.styles.root}>
          {
            this.props.allowChangePassword &&
            this.renderPasswordFields()
          }
          { this.renderPhoneSave() }
          { this.renderExpiryWarning(this.props.expiredUserData && this.props.expiredUserData.daysUntilExpired) }
        </ScrollView>
      </View>
    );
  }

  public renderPhoneSave(): React.ReactNode {
    return (
      <View>
        {
          !Theme.isTablet &&
            <View style={this.styles.actions}>
              {
                this.props.allowChangePassword &&
                <TouchableOpacity
                    style={[this.styles.btnPrimary, this.styles.button]}
                    disabled={!this.props.valid || !this.props.allPasswordRequirementsMet}
                    onPress={() => handleFormSubmission(logger, this.props.submit)}
                >
                  <Text style={this.styles.btnPrimaryText}>
                    {I18n.t("save")}
                  </Text>
                </TouchableOpacity>
              }
            </View>
        }
      </View>
    );
  }

  public renderExpiryWarning(daysUntilExpired: number): React.ReactNode {
    if (daysUntilExpired) {
      return (
        <View  style={[this.styles.row, this.styles.rowSeparator]}>
          <Text style={this.styles.changePasswordText}>
            {this.props.allowChangePassword ? I18n.t("passwordExpiringSoonMessage") : I18n.t("passwordExpiringSoon")}
          </Text>
          <Text style={this.styles.changePasswordText}>
            {I18n.t("expiresIn", {daysUntilExpired: this.props.expiredUserData.daysUntilExpired.toString()})}
          </Text>
        </View>
      );
    }
  }

  public renderPasswordFields(): React.ReactNode {
    return (
      <View>
        {
          !this.props.expiredUserData &&
          <Field
            name="password"
            onRef={(ref: any) => this.password = ref}
            secureTextEntry={true}
            placeholder={I18n.t("currentPassword")}
            style={this.styles.textInput}
            errorStyle={this.styles.textInputError}
            component={renderTextInputField}
            onFocus={() => {
              this.props.change("password", "");
              this.props.onClearChangePasswordErrorText();
            }}
            onSubmitEditing={this.newPassword && this.newPassword.focus}
            errorText={this.props.changePasswordErrorText}
          />
        }
        <Field
          name="newPassword"
          onRef={(ref: any) => this.newPassword = ref}
          secureTextEntry={true}
          placeholder={I18n.t("newPassword")}
          style={this.styles.textInput}
          errorStyle={this.styles.textInputError}
          component={renderTextInputField}
          onFocus={() => {
            this.props.change("newPassword", "");
          }}
          onSubmitEditing={this.confirmPassword && this.confirmPassword.focus}
        />
        <Field
          name="confirmPassword"
          onRef={(ref: any) => this.confirmPassword = ref}
          secureTextEntry={true}
          placeholder={I18n.t("confirmPassword")}
          style={this.styles.textInput}
          errorStyle={this.styles.textInputError}
          returnKeyType={"done"}
          component={renderTextInputField}
          onFocus={() => {
            this.props.change("confirmPassword", "");
          }}
          onSubmitEditing={this.props["submit"]}
        />
        { this.renderPasswordRequirements() }
        {
          Theme.isTablet &&
          <View style={this.styles.actions}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.button,
                (!this.props.valid || !this.props.allPasswordRequirementsMet) && this.styles.btnDisabled]}
              disabled={!this.props.valid || !this.props.allPasswordRequirementsMet}
              onPress={() => handleFormSubmission(logger, this.props.submit)}
            >
              <Text style={[this.styles.btnPrimaryText,
                (!this.props.valid || !this.props.allPasswordRequirementsMet) && this.styles.btnTextDisabled]}>
                {I18n.t("save")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.button]}
              onPress={this.props.onCancel}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }

  public renderPasswordRequirements(): React.ReactNode {
    const passwordsMatchMet = this.props.mandatoryRequirementsMet.newPasswordsMatch ||
        PasswordRequirementValidated.NotAvailable;
    const noUsernameMatch = this.props.mandatoryRequirementsMet.noUsernameMatch ||
        PasswordRequirementValidated.NotAvailable;
    const noOldPasswordMatch = this.props.mandatoryRequirementsMet.noOldPasswordMatch ||
        PasswordRequirementValidated.NotAvailable;
    const minimumLengthMet = this.props.optionalRequirementsMet.minimumLengthMet ||
        PasswordRequirementValidated.NotAvailable;
    const upperCaseMet = this.props.optionalRequirementsMet.upperCaseMet ||
        PasswordRequirementValidated.NotAvailable;
    const lowerCaseMet = this.props.optionalRequirementsMet.lowerCaseMet ||
        PasswordRequirementValidated.NotAvailable;
    const specialCharactersMet = this.props.optionalRequirementsMet.specialCharactersMet ||
        PasswordRequirementValidated.NotAvailable;


    const minimumLengthIcon = passwordRequirementValidatedToValidationIcon.get(minimumLengthMet);
    const passwordsMatchIcon = passwordRequirementValidatedToValidationIcon.get(passwordsMatchMet);
    const noUsernameIcon = passwordRequirementValidatedToValidationIcon.get(noUsernameMatch);
    const noOldPasswordIcon = passwordRequirementValidatedToValidationIcon.get(noOldPasswordMatch);
    const upperCaseIcon = passwordRequirementValidatedToValidationIcon.get(upperCaseMet);
    const lowerCaseIcon = passwordRequirementValidatedToValidationIcon.get(lowerCaseMet);
    const specialCharactersIcon = passwordRequirementValidatedToValidationIcon.get(specialCharactersMet);
    const requirementsConfig = this.props.userComponentConfigs.passwordRequirements;
    return (
      <View>
        <View>
          <Text style={this.styles.passwordRequirementsText}>
            { I18n.t("passwordMust") }
          </Text>
        </View>

        <View style={this.styles.passwordLengthText}>
          <VectorIcon
            name={passwordsMatchIcon.icon}
            fill={passwordsMatchIcon.color}
            height={this.styles.passwordRequirementsIcon.fontSize}
          />
          <Text style={this.styles.passwordLengthText}>
            { I18n.t("matchPasswordConfirmation") }
          </Text>
        </View>
        <View style={this.styles.passwordLengthText}>
          <VectorIcon
            name={noOldPasswordIcon.icon}
            fill={noOldPasswordIcon.color}
            height={this.styles.passwordRequirementsIcon.fontSize}
          />
          <Text style={this.styles.passwordLengthText}>
            { I18n.t("notMatchCurrentPassword") }
          </Text>
        </View>
        <View style={this.styles.passwordLengthText}>
          <VectorIcon
            name={noUsernameIcon.icon}
            fill={noUsernameIcon.color}
            height={this.styles.passwordRequirementsIcon.fontSize}
          />
          <Text style={this.styles.passwordLengthText}>
            { I18n.t("notMatchUsername") }
          </Text>
        </View>
        { requirementsConfig && requirementsConfig.minimumPasswordLength &&
          <View style={this.styles.passwordLengthText}>
            <VectorIcon
              name={minimumLengthIcon.icon}
              fill={minimumLengthIcon.color}
              height={this.styles.passwordRequirementsIcon.fontSize}
            />
            <Text style={this.styles.passwordLengthText}>
              { I18n.t("meetMinimumLength", {minimumPasswordLength: requirementsConfig.minimumPasswordLength}) }
            </Text>
          </View>
        }
        { requirementsConfig && requirementsConfig.requireUpperCase &&
          <View style={this.styles.passwordLengthText}>
            <VectorIcon
              name={upperCaseIcon.icon}
              fill={upperCaseIcon.color}
              height={this.styles.passwordRequirementsIcon.fontSize}
            />
            <Text style={this.styles.passwordLengthText}>
              { I18n.t("containUppercase") }
            </Text>
          </View>
        }
        { requirementsConfig && requirementsConfig.requireLowerCase &&
          <View style={this.styles.passwordLengthText}>
            <VectorIcon
              name={lowerCaseIcon.icon}
              fill={lowerCaseIcon.color}
              height={this.styles.passwordRequirementsIcon.fontSize}
            />
            <Text style={this.styles.passwordLengthText}>
              { I18n.t("containLowercase") }
            </Text>
          </View>
        }
        { requirementsConfig && requirementsConfig.requireSpecialCharacter &&
          requirementsConfig.specialCharacterList?.length > 0 &&
          <View style={this.styles.passwordLengthText}>
            <VectorIcon
              name={specialCharactersIcon.icon}
              fill={specialCharactersIcon.color}
              height={this.styles.passwordRequirementsIcon.fontSize}
            />
            <Text style={this.styles.passwordLengthText}>
              {
                I18n.t("containSpecialCharacter",
                    {specialCharacterList: (requirementsConfig.specialCharacterList as string[]).join(" ")})
              }
            </Text>
          </View>
        }
      </View>
    );
  }

  private getRightButtonTitle(): string {
    let title: string;

    if (!this.props.allowChangePassword) {
      title = I18n.t("continue");
    } else if (this.props.expiredUserData && this.props.expiredUserData.daysUntilExpired) {
      title = I18n.t("skip");
    }
    return title;
  }
}

export default reduxForm<PasswordForm, Props>({
  form: "changePassword",
  validate: (values: PasswordForm, props: Props) => {
    const errors: PasswordForm = { password: undefined, newPassword: undefined, confirmPassword: undefined };
    props.validatePasswordRequirements(props, values);

    if (!values.password && !props.expiredUserData) {
      errors.password = I18n.t("required", {field: I18n.t("currentPassword")});
    }

    if (!values.newPassword) {
      errors.newPassword = I18n.t("required", {field: I18n.t("newPassword")});
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = I18n.t("required", {field: I18n.t("confirmPassword")});
    }


    return errors;
  },
  initialValues: { password: undefined, newPassword: undefined, confirmPassword: undefined },
  onSubmit: (data: PasswordForm, dispatch: Dispatch<any>, props: Props) => {
    if (props.allPasswordRequirementsMet) {
      props.onSave(
        props.expiredUserData ? props.expiredUserData.password : data.password,
        data.newPassword
      );

      Keyboard.dismiss();
    }
  }
})(ChangePassword);
