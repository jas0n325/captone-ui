import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";
import { connectModal, InjectedProps } from "redux-modal";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../config/I18n";
import { BusinessState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "./BaseView";
import { renderTextInputField } from "./FieldValidation";
import { dialogStyles } from "./styles";
import { handleFormSubmission } from "./utilities";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.ManagerApproval");

export interface ManagerApprovalForm {
  username: string;
  password: string;
}

export interface Props extends InjectedProps {
  businessState: BusinessState;
  onApprove: (username: string, password: string) => void;
  onClose: () => void;
}

export interface State {
}

class ManagerApproval extends React.Component<Props & InjectedFormProps<ManagerApprovalForm, Props> &
    FormInstance<ManagerApprovalForm, Props>, State> {

  private styles: any;
  private username: any;
  private password: any;

  public constructor(props: Props & InjectedFormProps<ManagerApprovalForm, Props> &
      FormInstance<ManagerApprovalForm, Props>) {
    super(props);
    this.styles = Theme.getStyles(dialogStyles());
  }

  public componentDidMount(): void {
    this.username.focus();
  }

  public render(): JSX.Element {
    return (
      <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          extraHeight={190}
          style={this.styles.root}
          contentContainerStyle={this.styles.root}>
        <BaseView style={this.styles.modalContainer}>
            <View style={this.styles.modalView}>
              <View style={this.styles.infoContainer}>
                <Text style={this.styles.heading}>{I18n.t("managerApproval")}</Text>
                { this.props.businessState.error &&
                  <Text style={this.styles.subHeading}>
                    {this.getLocalizeMessage(this.props.businessState.error)}
                  </Text>
                }
                <View style={this.styles.formContainer}>
                    <Field name={`username`} onRef={(ref: any) => this.username = ref} placeholder={I18n.t("username")}
                      style={this.styles.field} inputStyle={this.styles.inputField}
                      keyboardType="numbers-and-punctuation" component={renderTextInputField}
                      errorStyle={this.styles.textInputError} onSubmitEditing={() => this.password.focus()} />

                    <View style={this.styles.formSeprator} />

                    <Field
                      name={`password`}
                      onRef={(ref: any) => this.password = ref}
                      placeholder={I18n.t("password")}
                      style={this.styles.field}
                      inputStyle={this.styles.inputField}
                      errorStyle={this.styles.textInputError}
                      secureTextEntry={true}
                      returnKeyType={"done"}
                      component={renderTextInputField}
                      onSubmitEditing={() => handleFormSubmission(logger, this.props.submit)}
                    />
                </View>
              </View>
              <View style={this.styles.buttonContainer}>
                <TouchableOpacity
                  style={this.styles.buttonStyle}
                  onPress={() => this.props.onClose()}
                  activeOpacity={0.7}
                >
                  <Text style={this.styles.buttonTextStyle}>{I18n.t("cancel")}</Text>
                </TouchableOpacity>
                <View style={this.styles.seprator}/>
                <TouchableOpacity
                  style={[this.styles.buttonStyle]}
                  onPress={() => handleFormSubmission(logger, this.props.submit)}
                  activeOpacity={0.7}
                >
                  <Text style={[this.styles.buttonTextStyle,  this.styles.approveButtonStyle]}>
                    {I18n.t("approve")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        </BaseView>
      </KeyboardAwareScrollView>
    );
  }

  private getLocalizeMessage(error: Error): string {
    let errorMessage: string = undefined;
    if (error instanceof PosBusinessError && error.localizableMessage) {
      errorMessage = I18n.t(error.localizableMessage.i18nCode);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return errorMessage;
  }
}

const ManagerApprovalForm = reduxForm({
  form: "managerApproval",
  validate: (values: ManagerApprovalForm) => {
    const errors: { username: string, password: string} = { username: undefined, password: undefined };
    if (!values.username || values.username.trim().length === 0) {
      errors.username = I18n.t("required", {field: I18n.t("username")});
    }
    if (!values.password || values.password.trim().length === 0) {
      errors.password = I18n.t("required", {field: I18n.t("password")});
    }
    return errors;
  },
  initialValues: { username: undefined, password: undefined},
  onSubmit: (data: ManagerApprovalForm, dispatch: Dispatch<any>, props: Props) => {
    props.onApprove(data.username, data.password);
    Keyboard.dismiss();
  }
})(ManagerApproval);

export default connectModal({ name: "ManagerApproval" })(ManagerApprovalForm);
