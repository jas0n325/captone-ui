import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm, SubmissionError } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import { renderNumericInputField, renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { handleFormSubmission, warnBeforeLosingChanges } from "../common/utilities";
import { offlineAuthorizationStyles } from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.payment.TenderPromptInputs");

export interface TenderPromptInputsForm {
  referenceNumber: string;
  referenceNumberLength: number;
  referenceNumberMaxLength: number;
}

export interface Props {
  settings: SettingsState;
  errorMessage?: string;
  instructionsText?: string;
  onSave: (referenceNumber: string) => void;
  onCancel: (referenceNumber?: string) => void;
  stateValues: Map<string, any>;
  title: string;
  referenceNumberPlaceholder?: string;
  amount: string;
  referenceNumberMinLength?: number;
  referenceNumberMaxLength?: number;
  captureReferenceNumber?: boolean;
  tenderLabel?: string;
  keyboardType?: "number-pad" | "default";
}

export interface State {}

class TenderPromptInputs extends React.Component<Props & InjectedFormProps<TenderPromptInputsForm, Props> &
    FormInstance<TenderPromptInputsForm, undefined>, State> {
  private referenceNumber: any;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<TenderPromptInputsForm, Props> &
      FormInstance<TenderPromptInputsForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(offlineAuthorizationStyles());
    this.props.reset();
    this.props.change("referenceNumberMinLength", this.props.referenceNumberMinLength);
    this.props.change("referenceNumberMaxLength", this.props.referenceNumberMaxLength);
  }

  public componentDidMount(): void {
    if (this.props.captureReferenceNumber) {
      this.referenceNumber.focus();
    }
  }

  public render(): JSX.Element {
    const keyboardType = this.props.keyboardType || "default";
    return (
      <View style={this.styles.root}>
        <Header
          title={this.props.title}
          titleStyle={this.styles.headerTitle}
          backButton={{ name: "Back", action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onCancel) }}
          rightButton={{ title: I18n.t("apply"), action: () => handleFormSubmission(logger, this.props.submit) }}
        />
        <View style={this.styles.fill}>
          <View style={this.styles.topSection}>
            <View style={this.styles.formArea}>
              <View style={this.styles.amountDueTextArea}>
                <Text style={this.styles.amountDueTitle}>{this.props.tenderLabel}</Text>
                <Text style={this.styles.amountDueAmount}>
                  {this.props.amount}
                </Text>
              </View>
              <View>
                {
                  this.props.captureReferenceNumber && keyboardType === "default" &&
                  <Field
                    name="referenceNumber"
                    onRef={(ref: any) => this.referenceNumber = ref }
                    placeholder={this.props.referenceNumberPlaceholder || I18n.t("offlineReferenceNumber")}
                    style={this.styles.textInput}
                    alphaNumericOnly={true}
                    autoCapitalize={"characters"}
                    maxLength={this.props.referenceNumberMaxLength}
                    useCounter={true}
                    trimLeadingZeroes={false}
                    errorStyle={this.styles.errorStyle} returnKeyType={"done"} component={renderTextInputField}
                    onSubmitEditing={() => handleFormSubmission(logger, this.props.submit)}
                  />
                }
                {
                  this.props.captureReferenceNumber && keyboardType === "number-pad" &&
                  <Field
                    name="referenceNumber"
                    onRef={(ref: any) => this.referenceNumber = ref}
                    placeholder={this.props.referenceNumberPlaceholder || I18n.t("offlineReferenceNumber")}
                    style={this.styles.textInput}
                    keyboardType={keyboardType}
                    maxLength={this.props.referenceNumberMaxLength}
                    useCounter={true}
                    trimLeadingZeroes={false}
                    errorStyle={this.styles.errorStyle} returnKeyType={"done"} component={renderNumericInputField}
                    onSubmitEditing={() => handleFormSubmission(logger, this.props.submit)}
                  />
                }
              </View>
              <Text style={this.styles.informationText}>
                {this.props.instructionsText}
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
                onPress={() => this.props.onCancel()}
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
}

export default reduxForm<TenderPromptInputsForm, Props>({
  form: "tenderPromptInputs",
  validate : (values: any, props: Props) => {
    const errors: {referenceNumber: string } = {
      referenceNumber: undefined
    };
    return errors;
  },
  initialValues: {referenceNumber: undefined},
  onSubmit: (data: TenderPromptInputsForm, dispatch: Dispatch<any>, props: Props) => {
    if (props.captureReferenceNumber && (props.referenceNumberMaxLength && props.referenceNumberMinLength)) {
        if (!data.referenceNumber || data.referenceNumber.trim().length < props.referenceNumberMinLength ||
              data.referenceNumber.trim().length > props.referenceNumberMaxLength) {
          throw new SubmissionError({referenceNumber: I18n.t("required", {field: props.referenceNumberPlaceholder})});
        }
    }
    props.onSave(data.referenceNumber);
    Keyboard.dismiss();
  }
})(TenderPromptInputs);
