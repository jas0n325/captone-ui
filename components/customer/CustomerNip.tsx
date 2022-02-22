import * as React from "react";
import { Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dispatch } from "redux";
import { DecoratedFormProps, Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import { renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import { UserTaxInformation, UserTaxValidationPattern } from "./CustomerAddUpdate";
import { customerNIPTaxInformations } from "./CustomerUtilities";
import { customerNipStyles } from "./styles";


export interface CustomerNipForm {
  nipNumber: string;
}

export interface CustomerNIPTaxInformation {
  regionalTaxIdentifierLabelText: string;
  regionalTaxIdentifierLocalTypeCode: string;
  captureRegionalTaxIdentifier: UserTaxInformation;
}

interface Props {
  onSave: (nipNumber: string) => void;
  handleCancel: () => void;
  settings: SettingsState;
  i18nLocation: string;
}

interface State {}

class CustomerNip extends React.Component<Props & InjectedFormProps<CustomerNipForm, Props> &
    FormInstance<CustomerNipForm, Props>, State> {
  private styles: any;

  public constructor(props: Props & InjectedFormProps<CustomerNipForm, Props> &
      FormInstance<CustomerNipForm, Props>) {
    super(props);

    this.styles = Theme.getStyles(customerNipStyles());
  }

  public render(): JSX.Element {
    return (
      <>
        <Header
          title={I18n.t("nip")}
          backButton={{
            name: "Back",
            title: Theme.isTablet && I18n.t("basket"),
            action: this.props.handleCancel
          }}
          rightButton={{
            title: I18n.t("continue"),
            action: this.props.submit
          }
          }
          isVisibleTablet={Theme.isTablet}
        />
      <KeyboardAwareScrollView contentContainerStyle={this.styles.root}>
        <Field
            name="nipNumber"
            clearText={false}
            component={renderTextInputField}
            style={this.styles.input}
            inputStyle={this.styles.inputField}
            onSubmitEditing={() => this.props.submit()}
            placeholder ={I18n.t("nipNumber")}
            settings={this.props.settings}
            keyboardType={InputType.numeric}
            inputType={InputType.numeric}
          />
      </KeyboardAwareScrollView>
    </>
    );
  }

}

export default reduxForm<CustomerNipForm, Props>({
  form: "customerNip",
  validate : (values: CustomerNipForm, props: DecoratedFormProps<CustomerNipForm, Props>) => {
    const errors: { nipNumber: string } = { nipNumber: undefined };
    const { captureRegionalTaxIdentifier } = customerNIPTaxInformations(props.settings.configurationManager,
      props.i18nLocation);
    const validationValue = values.nipNumber;
    if (validationValue && captureRegionalTaxIdentifier) {
      if ((captureRegionalTaxIdentifier.minLength &&
          (validationValue.length < captureRegionalTaxIdentifier.minLength)) ||
          (captureRegionalTaxIdentifier.maxLength && validationValue.length > captureRegionalTaxIdentifier.maxLength)) {
        let characterCount = "";
        if (captureRegionalTaxIdentifier.minLength && captureRegionalTaxIdentifier.maxLength) {
          characterCount = `${captureRegionalTaxIdentifier.minLength} - ${captureRegionalTaxIdentifier.maxLength}`;
        } else if (captureRegionalTaxIdentifier.minLength) {
          characterCount = captureRegionalTaxIdentifier.minLength + "";
        } else if (captureRegionalTaxIdentifier.maxLength) {
          characterCount = captureRegionalTaxIdentifier.maxLength + "";
        }
        errors.nipNumber = I18n.t("minMaxValidation", { characterCount });
      }
      if (captureRegionalTaxIdentifier.typeBehaviour &&
          !validationValue.match(captureRegionalTaxIdentifier.typeBehaviour.pattern)) {
        if (captureRegionalTaxIdentifier.typeBehaviour.typeOfBehaviour === UserTaxValidationPattern.Numeric) {
          errors.nipNumber = I18n.t("numericValidation");
        } else if (captureRegionalTaxIdentifier.typeBehaviour.typeOfBehaviour ===
            UserTaxValidationPattern.AlphaNumeric) {
          errors.nipNumber = I18n.t("alphaNumericValidation");
        }
      }
    }
    if (captureRegionalTaxIdentifier?.required && !validationValue) {
      errors.nipNumber = I18n.t("required");
    }

    return errors;
  },
  initialValues: { nipNumber: undefined },
  onSubmit: (data: CustomerNipForm, dispatch: Dispatch<any>, props: Props) => {
    props.onSave(data.nipNumber);
    Keyboard.dismiss();
  }
})(CustomerNip);
