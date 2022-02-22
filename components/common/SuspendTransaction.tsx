import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";
import { connectModal, InjectedProps } from "redux-modal";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "./BaseView";
import { renderTextInputField } from "./FieldValidation";
import { dialogStyles } from "./styles";
import { handleFormSubmission } from "./utilities";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.SuspendTransaction");

export interface SuspendForm {
  resumeToken: string;
}

interface StateProps {
  businessStateError: Error;
}

interface Props extends StateProps, InjectedProps {
  promptForReference: boolean;
  resumeTokenLength: number;
  onSuspend: (resumeToken: string) => void;
  onCancel: () => void;
}

interface State {}

class SuspendTransaction extends React.Component<Props & InjectedFormProps<SuspendForm, Props> &
    FormInstance<SuspendForm, Props>, State> {
  private styles: any;
  private resumeToken: any;

  public constructor(props: Props & InjectedFormProps<SuspendForm, Props> &
      FormInstance<SuspendForm, Props>) {
    super(props);
    this.styles = Theme.getStyles(dialogStyles());
  }

  public componentDidMount(): void {
    if (this.props.promptForReference) {
      this.resumeToken.focus();
    }
  }

  public render(): JSX.Element {
    return (
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        extraHeight={190}
        style={this.styles.root}
        contentContainerStyle={this.styles.root}
      >
        <BaseView style={this.styles.modalContainer}>
          <View style={this.styles.modalView}>
            <View style={this.styles.infoContainer}>
              <Text style={this.styles.heading}>{I18n.t("suspendTransaction")}</Text>
              <Text style={this.styles.subHeading}>{I18n.t("suspendTransactionMessage")}</Text>
            {
              this.props.submitFailed && this.props.businessStateError &&
                  this.getLocalizeMessage(this.props.businessStateError)
            }
            {
              this.props.promptForReference &&
              <View style={this.styles.formContainer}>
                <Field
                  name="resumeToken"
                  onRef={(ref: any) => this.resumeToken = ref }
                  placeholder={I18n.t("resumeToken")}
                  placeholderSentenceCase={false}
                  inputStyle={this.styles.inputField}
                  style={this.styles.field}
                  errorStyle={this.styles.textInputError}
                  returnKeyType={"done"}
                  component={renderTextInputField}
                  onSubmitEditing={() => handleFormSubmission(logger, this.props.submit)}
                />
              </View>
            }
            </View>
            <View style={this.styles.buttonContainer}>
              <TouchableOpacity
                style={this.styles.buttonStyle}
                onPress={() => this.props.onCancel()}
                activeOpacity={0.7}
              >
                <Text style={this.styles.buttonTextStyle}>{I18n.t("cancel")} </Text>
              </TouchableOpacity>
              <View style={this.styles.seprator}/>
              <TouchableOpacity
                style={[this.styles.buttonStyle]}
                onPress={() => handleFormSubmission(logger, this.props.submit)}
                activeOpacity={0.7}
              >
                <Text style={[this.styles.buttonTextStyle,  this.styles.approveButtonStyle]}>
                  {I18n.t("suspend")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BaseView>
      </KeyboardAwareScrollView>
    );
  }

  private getLocalizeMessage(error: Error): JSX.Element {
    let errorMessage: string = undefined;
    if (error instanceof PosBusinessError && error.localizableMessage) {
      if (error.errorCode !== "SSC_QUALIFICATION_RESULT_REJECTED_ERROR_CODE") {
        errorMessage = I18n.t(error.localizableMessage.i18nCode);
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return errorMessage && (<Text style={[this.styles.subHeading, this.styles.errorText]}>{errorMessage}</Text>);
  }
}

const SuspendTransactionForm = reduxForm({
  form: "suspend",
  validate: (values: SuspendForm, props: Props) => {
    const errors: { resumeToken: string } = { resumeToken: undefined };
    if (!!props.promptForReference && !values.resumeToken) {
      errors.resumeToken = I18n.t("required", {field: I18n.t("resumeToken")});
    } else if (props.promptForReference && values.resumeToken && props.resumeTokenLength &&
          props.resumeTokenLength > 0 && values.resumeToken.length > props.resumeTokenLength) {
      errors.resumeToken = I18n.t("resumeTokenLengthError", {allowed: props.resumeTokenLength.toString()});
    }
    return errors;
  },
  initialValues: { resumeToken: undefined },
  onSubmit: (data: SuspendForm, dispatch: Dispatch<any>, props: Props) => {
    props.onSuspend(data.resumeToken);
    Keyboard.dismiss();
  }
})(SuspendTransaction);

const SuspendTransactionFormModal = connectModal({ name: "SuspendTransaction" })(SuspendTransactionForm);

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessStateError: state.businessState && state.businessState.error
  };
};

export default connect(mapStateToProps)(SuspendTransactionFormModal);
