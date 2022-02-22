import * as React from "react";
import { Keyboard, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dispatch } from "redux";
import { Field, InjectedFormProps, reduxForm } from "redux-form";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { renderTextInputField } from "../common/FieldValidation";
import AptosLogoNavigationBar from "./AptosLogoNavigationBar";
import { tenantStyle } from "./styles";


export interface TenantForm {
  domain: string;
}

export interface Props {
  domain?: string;
  onSave: (domain: string) => void;
  error?: string;
}

export interface State { }

/**
 * Displays a form to collect a domain/hostname used to determine which SCP platform environment and tenant to connect
 * with.
 */
class TenantSettings extends React.Component<Props & InjectedFormProps<TenantForm, Props>, State> {
  private domain: any;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<TenantForm, Props>) {
    super(props);

    this.styles = Theme.getStyles(tenantStyle());
  }

  public componentDidMount(): void {
    this.domain.focus();
  }

  public render(): JSX.Element {
    return (
      <>
        <AptosLogoNavigationBar styles={this.styles}/>
        <KeyboardAwareScrollView contentContainerStyle={this.styles.fill}>
          <View style={this.styles.settings}>
            <Text style={this.styles.pageTitle}>{I18n.t("settingsDomain")}</Text>
            {this.props.error &&
            <View style={this.styles.error}>
              <View style={this.styles.errorContainer}>
                <Text style={this.styles.errorText}>{this.props.error}</Text>
              </View>
            </View>
            }
            <Field name="domain" onRef={(ref: any) => this.domain = ref} placeholder={I18n.t("settingsDomain")}
                   style={this.styles.textInput} errorStyle={this.styles.textInputError} returnKeyType={"done"}
                   component={renderTextInputField} onSubmitEditing={() => this.props["submit"]()}/>
          </View>
        </KeyboardAwareScrollView>
      </>
    );
  }
}

export default reduxForm<TenantForm, Props>({
  form: "tenant",
  validate : (values: any) => {
    const errors: { domain: string } = { domain: undefined};
    if (!values.domain) {
      errors.domain = I18n.t("missingDomainSettings");
    }
    return errors;
  },
  initialValues: { domain: undefined },
  onSubmit : (data: TenantForm, dispatch: Dispatch<any>, props: Props) => {
    props.onSave(data.domain);
    Keyboard.dismiss();
  }
})(TenantSettings);
