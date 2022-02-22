import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { Dispatch } from "redux";
import { DecoratedComponentClass, Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import FeedbackNote from "../common/FeedbackNote";
import { renderTextInputField } from "../common/FieldValidation";
import { NavigationScreenProps } from "../StackNavigatorParams";
import AptosLogoNavigationBar from "./AptosLogoNavigationBar";
import { TerminalConflictScreenProps } from "./interfaces";
import { terminalConflictStyle } from "./styles";

interface TerminalConflictForm {
  storeId: string;
  deviceId: string;
  confirmDeviceId: string;
}

interface Props extends TerminalConflictScreenProps, NavigationScreenProps<"terminalConflict"> {}

interface State {}

class TerminalConflictScreen extends
    React.Component<Props & InjectedFormProps<TerminalConflictForm, Props> &
    FormInstance<TerminalConflictForm, Props>, State> {
  private styles: any;
  private confirmDeviceId: any;

  public constructor(props: Props & InjectedFormProps<TerminalConflictForm, Props> &
      FormInstance<TerminalConflictForm, Props>) {
    super(props);

    this.styles = Theme.getStyles(terminalConflictStyle());
  }

  public componentDidMount(): void {
    this.props.initialize({
      storeId: `${this.props.retailLocation.name} (${this.props.retailLocation.retailLocationId})`,
      deviceId: this.props.deviceId,
      confirmDeviceId: undefined
    });
    this.confirmDeviceId.focus();
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.screenContainer}>
        <AptosLogoNavigationBar styles={this.styles}/>
        <KeyboardAwareScrollView contentContainerStyle={this.styles.terminal}>
          <View style={this.styles.container}>
            <FeedbackNote
                messageTitle={I18n.t("terminalRegistrationConflictTitle")}
                message={I18n.t("terminalRegistrationConflictText")}
                style={this.styles}
            />

            <Field name="storeId" style={this.styles.conflictTextInput} placeholder={I18n.t("storeName")}
                   disabled={true} persistPlaceholder={true} component={renderTextInputField} />

            <Field name="deviceId" style={this.styles.conflictTextInput} persistPlaceholder={true}  disabled={true}
                   placeholder={I18n.t("terminal")} component={renderTextInputField} />

            <Field name="confirmDeviceId" onRef={(ref: any) => this.confirmDeviceId = ref}
                   style={this.styles.conflictTextInput} errorStyle={this.styles.textInputError}
                   placeholder={I18n.t("confirmTerminal")} persistPlaceholder={true}
                   placeholderSentenceCase={false} keyboardType="numbers-and-punctuation"
                   component={renderTextInputField} onSubmitEditing={this.props.submit} />

            <TouchableOpacity onPress={this.props.submit} disabled={this.props.invalid}
                              style={[this.styles.btnPrimary, this.styles.actionButton, this.props.invalid ?
                              this.styles.btnDisabled : {}]}>
              <Text style={[this.styles.btnPrimaryText, this.props.invalid ?
                  this.styles.btnTextDisabled : {}]}>{I18n.t("continue")}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.props.onCancel}
                              style={[this.styles.btnSeconday, this.styles.actionButton]}>
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

export default withMappedNavigationParams<DecoratedComponentClass<TerminalConflictForm, Props>>()
    (reduxForm<TerminalConflictForm, Props>({
      form: "terminalConflict",
      validate : (values: TerminalConflictForm) => {
        const errors: TerminalConflictForm = { storeId: undefined, deviceId: undefined, confirmDeviceId: undefined };

        if (!values.confirmDeviceId) {
          errors.confirmDeviceId = I18n.t("deviceNumberMissing");
        } else if (values.deviceId !== values.confirmDeviceId) {
          errors.confirmDeviceId = I18n.t("deviceNumberMismatch");
        }

        return errors;
      },
      initialValues: {
        storeId: undefined,
        deviceId: undefined,
        confirmDeviceId: undefined
      },
      onSubmit: (data: TerminalConflictForm, dispatch: Dispatch<any>, props: Props) => {
        props.onSave();
        Keyboard.dismiss();
      }
    })(TerminalConflictScreen));
