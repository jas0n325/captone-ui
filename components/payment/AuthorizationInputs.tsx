import * as React from "react";
import { Alert, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { connect} from "react-redux";
import { Dispatch } from "redux";
import {
  ConfigProps,
  Field,
  FormInstance,
  formValueSelector,
  InjectedFormProps,
  reduxForm,
  SubmissionError
} from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  IOfflineAuthorizationFields,
  validateOfflineApprovalCode
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import { renderNumericInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { handleFormSubmission, printAmount } from "../common/utilities";
import { offlineAuthorizationStyles } from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.payment.AuthorizationInputs");

export interface AuthorizationInputsForm {
  authorizationCode: string;
  authorizationLength: number;
  authorizationMaxLength: number;
  authorizationMinLength: number;
  approvalCode: string;
  approvalCodeLength: number;
}

export interface Props extends StateProps{
  settings: SettingsState;
  errorMessage?: string;
  instructionsText?: string;
  onSave: (authorizationCode: string, approvalCode: string) => void;
  onCancel: (authorizationCode?: string, approvalCode?: string) => void;
  stateValues: Map<string, any>;
  title: string;
  authCodePlaceholder: string;
  approvalCodePlaceholder?: string;
  amountDue?: string;
  authorizationCodeLength?: number;
  authorizationCodeMaxLength?: number;
  authorizationCodeMinLength?: number;
  authorizationCodeFocus?: boolean;
  approvalCodeLength?: number;
  captureApprovalCode?: boolean;
  captureAuthorizationCode?: boolean;
  validateApprovalCode?: boolean;
  offlineAuthorizationFields?: IOfflineAuthorizationFields;
}

interface StateProps {
  approvalCode: string;
  authorizationCode: string;
}

export interface State {}

class AuthorizationInputs extends React.Component<Props & InjectedFormProps<AuthorizationInputsForm, Props> &
    FormInstance<AuthorizationInputsForm, undefined>, State> {
  private authorizationCode: any;
  private approvalCode: any;
  private styles: any;
  private maxLength: number;

  public constructor(props: Props & InjectedFormProps<AuthorizationInputsForm, Props> &
      FormInstance<AuthorizationInputsForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(offlineAuthorizationStyles());
    this.props.reset();
    this.props.change("authorizationLength", this.props.authorizationCodeLength);
    this.props.change("authorizationMaxLength", this.props.authorizationCodeMaxLength);
    this.props.change("authorizationMinLength", this.props.authorizationCodeMinLength);
    this.props.change("approvalCodeLength", this.props.approvalCodeLength);

    this.maxLength = !this.props.authorizationCodeMaxLength && !this.props.authorizationCodeMinLength ?
        this.props.authorizationCodeLength : this.props.authorizationCodeMaxLength;
  }

  public componentDidMount(): void {
    if (this.props.authorizationCodeFocus) {
      this.authorizationCode.focus();
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.authorizationCodeFocus !== prevProps.authorizationCodeFocus) {
      this.authorizationCode.focus();
    }
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
            title={this.props.title || I18n.t("offlineAuthorization")}
            titleStyle={this.styles.headerTitle}
            backButton={{
              name: "Back", action: () => this.warnBeforeLosingChanges(this.props.dirty, this.props.onCancel)
            }}
            rightButton={{ title: I18n.t("apply"), action: () => handleFormSubmission(logger, this.props.submit) }}
        />
        <View style={this.styles.fill}>
          <View style={this.styles.topSection}>
            <View style={this.styles.formArea}>
              <View style={this.styles.amountDueTextArea}>
                <Text style={this.styles.amountDueTitle}>{this.getAmountText()}</Text>
                <Text style={this.styles.amountDueAmount}>
                  {
                  this.props.amountDue ||
                  (this.props.stateValues.get("TenderAuthorizationSession.authorizationAmount") &&
                  printAmount(!this.isRefund() ?
                      this.props.stateValues.get("TenderAuthorizationSession.authorizationAmount") :
                      this.props.stateValues.get("TenderAuthorizationSession.authorizationAmount").times(-1)))
                  }
                </Text>
              </View>
              <View>
                {
                  this.props.captureAuthorizationCode &&
                  <Field name="authorizationCode" onRef={(ref: any) => this.authorizationCode = ref }
                  placeholder={this.props.authCodePlaceholder || I18n.t("offlineAuthorizationCode")}
                  style={this.styles.textInput}
                  keyboardType={"numeric"}
                  maxLength={this.maxLength}
                  useCounter={true}
                  errorStyle={this.styles.errorStyle} returnKeyType={"done"} component={renderNumericInputField}
                  trimLeadingZeroes={false}
                  onSubmitEditing={() =>
                      this.props.captureApprovalCode ? this.approvalCode.focus() :
                          handleFormSubmission(logger, this.props.submit)} />
                }
                {
                  this.props.captureApprovalCode &&
                  <Field name="approvalCode" onRef={(ref: any) => this.approvalCode = ref }
                       placeholder={this.props.approvalCodePlaceholder || I18n.t("offlineApprovalCode")}
                       style={this.styles.textInput}
                       keyboardType={"numeric"}
                       maxLength={this.props.approvalCodeLength}
                       useCounter={true}
                       errorStyle={this.styles.errorStyle} returnKeyType={"done"} component={renderNumericInputField}
                       trimLeadingZeroes={false}
                       onSubmitEditing={() => handleFormSubmission(logger, this.props.submit)} />
                }
              </View>
              <Text style={this.styles.informationText}>
                {this.props.instructionsText || I18n.t("offlineInstructions")}
              </Text>
            </View>
          </View>
          {
            Theme.isTablet &&
            <View style={this.styles.buttonsArea}>
              <TouchableOpacity
                onPress={() => handleFormSubmission(logger, this.props.submit)}
                style={[this.styles.btnPrimary, this.styles.button, this.props.invalid && this.styles.btnDisabled]}
                disabled={this.props.invalid}
              >
                <Text style={[this.styles.btnPrimaryText, this.props.invalid && this.styles.btnTextDisabled]}>
                  {I18n.t("apply")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.props.onCancel(this.props.authorizationCode, this.props.approvalCode)}
                style={[this.styles.btnSeconday, this.styles.button]}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
      </View>
    );
  }

  private warnBeforeLosingChanges =
        (hasChanged: boolean, onExit: (authorizationCode: string, approvalCode: string) => void) => {
    if (hasChanged) {
      Alert.alert(I18n.t("discardChanges"), I18n.t("discardChangesMessage"), [
        { text: I18n.t("cancel"), style: "cancel" },
        { text: I18n.t("okCaps"), onPress: () =>
          onExit(this.props.authorizationCode, this.props.approvalCode) }
      ], {cancelable: true});
    } else {
      onExit(this.props.authorizationCode, this.props.approvalCode);
    }
  }

  private getAmountText(): string {
    return !this.isRefund() ? I18n.t("amountDue") : I18n.t("refundDueCaps");
  }

  private isRefund(): boolean {
    return this.props.stateValues.get("transaction.balanceDue") &&
        this.props.stateValues.get("transaction.balanceDue").isNegative();
  }
}

function validateRequiredAuthCode(data: AuthorizationInputsForm, props: Props): void {
  if (props.captureAuthorizationCode) {
    if ((data.authorizationMinLength ||
        (!data.authorizationMaxLength && !data.authorizationMinLength && data.authorizationLength)) &&
        (!data.authorizationCode || data.authorizationCode.trim().length === 0)) {
      throw new SubmissionError({authorizationCode: I18n.t("required", {field: props.authCodePlaceholder})});
    }
  }
}

function validateMinimumLengthAuthCode(data: AuthorizationInputsForm, props: Props): void {
  if (props.captureAuthorizationCode && data.authorizationCode) {
    const dataLength: number =  data.authorizationCode.trim().length;
    const minLength: number = data.authorizationMinLength ||
        (!data.authorizationMinLength && !data.authorizationMaxLength && data.authorizationLength);
    if (minLength && dataLength < minLength) {
      throw new SubmissionError(
        {authorizationCode: I18n.t("minimumLength", {field: props.authCodePlaceholder, length: minLength.toString()})}
      );
    }
  }
}

const AuthorizationInputsForm = reduxForm<AuthorizationInputsForm, Props>({
  form: "authorizationInputs",
  validate : (values: any, props: Props) => {
    const errors: { authorizationCode: string, approvalCode: string } = {
      authorizationCode: undefined,
      approvalCode: undefined
    };
    return errors;
  },
  initialValues: {authorizationCode: undefined, approvalCode: undefined},
  onSubmit: (data: AuthorizationInputsForm, dispatch: Dispatch<any>, props: Props) => {
    if (props.captureAuthorizationCode) {
      validateRequiredAuthCode(data, props);
      validateMinimumLengthAuthCode(data, props);
    }
    if (props.captureApprovalCode) {
      if (!data.approvalCode) {
        throw new SubmissionError({approvalCode: I18n.t("required", {field: props.approvalCodePlaceholder})});
      } else if (data.approvalCode && data.approvalCodeLength &&
          data.approvalCode.trim().length < data.approvalCodeLength) {
        throw new SubmissionError({
          approvalCode: I18n.t("minimumLength",
              {field: props.approvalCodePlaceholder, length: data.approvalCodeLength.toString()})
        });
      }
    }
    if (props.validateApprovalCode) {
      if (!validateOfflineApprovalCode(data.approvalCode, props.offlineAuthorizationFields)) {
        throw new SubmissionError({approvalCode: I18n.t("invalidApprovalCode")});
      }
    }
    props.onSave(data.authorizationCode, data.approvalCode);
    Keyboard.dismiss();
  }
})(AuthorizationInputs);

const mapStateToProps = (state: AppState, ownProps: Props): StateProps => {
  const selector = formValueSelector("authorizationInputs");
  return {
    approvalCode: selector(state, "approvalCode"),
    authorizationCode: selector(state, "authorizationCode")
  };
};

export default connect<StateProps & Partial<ConfigProps<AuthorizationInputsForm, Props, string>>>(mapStateToProps)
    (AuthorizationInputsForm);
