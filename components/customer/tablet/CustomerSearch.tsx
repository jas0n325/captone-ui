import * as React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { Customer, ICustomerSearch } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import { renderInputField, renderNumericInputField, renderTextInputField } from "../../common/FieldValidation";
import Header from "../../common/Header";
import { InputType } from "../../common/Input";
import { handleFormSubmission } from "../../common/utilities";
import { NavigationProp } from "../../StackNavigatorParams";
import CustomerDisplay from "../CustomerDisplay";
import CustomerResults from "../CustomerResults";
import { SearchField } from "../CustomerSearchScreen";
import { customerSearchStyle } from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.customer.tablet.CustomerSearch");

export interface CustomerSearchForm {
  lastName: string;
  firstName: string;
  email: string;
  alternateKey: string;
  phoneNumber: string;
  zipPostalCode: string;
  customerNumber: string;
}

interface Props {
  isTransactionStarting: boolean;
  assignCustomer: boolean;
  hideCreateCustomer: boolean;
  returnMode: boolean;
  backNavigationTitle?: string;
  chosenCustomer: Customer;
  addCustomer: boolean;
  noSearchOccurred: boolean;
  showReturnPopup: boolean;
  searchFields: SearchField[];
  onSearch: (params: ICustomerSearch) => void;
  onCancel: () => void;
  onExit: () => void;
  onClearChosenCustomer: () => void;
  onCustomerSelected: (customer: Customer) => void;
  navigation: NavigationProp;
}

interface State {}

class CustomerSearch extends React.Component<Props & InjectedFormProps<CustomerSearchForm, Props> &
    FormInstance<CustomerSearchForm, Props>, State> {
  private lastName: any;
  private firstName: any;
  private email: any;
  private alternateKey: any;
  private phoneNumber: any;
  private zipPostalCode: any;
  private customerNumber: any;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<CustomerSearchForm, Props> &
      FormInstance<CustomerSearchForm, Props>) {
    super(props);

    this.styles = Theme.getStyles(customerSearchStyle());
  }

  public componentDidMount(): void {
    if (this.props.showReturnPopup) {
      setTimeout(() => Alert.alert(I18n.t("customerRequiredReturns"), undefined, [
        { text: I18n.t("ok"), onPress: () =>  this.onSubmitEditing(this.props.searchFields[0]) }
        ], {cancelable: false}), 500);
    } else {
      this.onSubmitEditing(this.props.searchFields[0]);
    }
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.fill}>
        <Header
          isVisibleTablet={true}
          title={I18n.t("customerSearch")}
          returnMode = {this.props.returnMode}
          backButton={this.props.isTransactionStarting ? <View/> : {
            name: "Back",
            title: this.props.backNavigationTitle || I18n.t("basket"),
            action: () => this.props.onExit()
          }}
          rightButton={!this.props.hideCreateCustomer ? {
            title: I18n.t("newCustomer"),
            action: this.pushCustomerCreate
          } : <View/> }
        />
        <View style={this.styles.root}>
          <View style={this.styles.leftPanel}>
            <CustomerResults
              assignCustomer={this.props.assignCustomer}
              chosenCustomer={this.props.chosenCustomer}
              noSearchOccurred={this.props.noSearchOccurred}
              onCustomerSelected={this.props.onCustomerSelected.bind(this)}
              onExit={this.props.onExit}
              navigation={this.props.navigation}
            />
          </View>
          <View style={this.styles.rightPanel}>
            {!this.props.chosenCustomer && this.renderSeachForm()}
            {this.props.chosenCustomer &&
              <CustomerDisplay
                assignCustomer={this.props.assignCustomer}
                returnMode={this.props.returnMode}
                customer={this.props.chosenCustomer}
                addCustomer={this.props.addCustomer}
                onClearChosenCustomer={this.props.onClearChosenCustomer}
                onExit={this.props.onExit}
                navigation={this.props.navigation}
              />
            }
          </View>
        </View>
      </View>
    );
  }

  private renderSeachForm(): JSX.Element {
    return (
      <View style={this.styles.fill}>
        <KeyboardAwareScrollView
          contentContainerStyle={this.styles.formArea}
          keyboardShouldPersistTaps={"always"}
        >
          {this.props.searchFields && this.props.searchFields.map((field, index) => this.getField(field,
              index < this.props.searchFields.length - 1 ? this.props.searchFields[index + 1] : undefined))}
          <View style={this.styles.btnArea}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.customerButton,
                      this.props.invalid && this.styles.btnDisabled]}
              onPress={() => handleFormSubmission(logger, this.props.submit)}
              disabled={this.props.invalid}
            >
              <Text style={[this.styles.btnPrimaryText, this.props.invalid && this.styles.btnTextDisabled]}>
                {I18n.t("search")}
              </Text>
            </TouchableOpacity>
            {!this.props.isTransactionStarting &&
              <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.customerButton]}
                onPress={() => {
                  this.props["initialize"](this.props["initialValues"]);
                  this.onSubmitEditing(this.props.searchFields[0]);
                }}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("clear")}</Text>
              </TouchableOpacity>
            }
            {this.props.isTransactionStarting &&
              <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.customerButton]}
                onPress={this.props.onCancel}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("skip")}</Text>
              </TouchableOpacity>
            }
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  private onSubmitEditing = (next: SearchField): void => {
    switch (next && next.name) {
      case "lastName":
        this.lastName.focus();
        break;
      case "firstName":
        this.firstName.focus();
        break;
      case "phoneNumber":
        this.phoneNumber.focus();
        break;
      case "customerNumber":
        this.customerNumber.focus();
        break;
      case "zipPostalCode":
        this.zipPostalCode.focus();
        break;
      case "email":
        this.email.focus();
        break;
      case "alternateKey":
        this.alternateKey.focus();
        break;
      default:
        handleFormSubmission(logger, this.props.submit);
        break;
    }
  }

  private getField = (cur: SearchField, next?: SearchField): JSX.Element => {
    const nextField = next;
    switch (cur.name) {
      case "lastName":
        return <Field name={`lastName`} onRef={(ref: any) => this.lastName = ref}
                      placeholder={I18n.t("lastName")} autoCapitalize="words" style={this.styles.textInput}
                      errorStyle={this.styles.textInputError}
                      returnKeyType={nextField ? "next" : "search"} component={renderTextInputField}
                      persistPlaceholder={true}
                      onSubmitEditing={() => this.onSubmitEditing(nextField) }/>;
      case "firstName":
        return <Field name={`firstName`} onRef={(ref: any) => this.firstName = ref }
                      placeholder={I18n.t("firstName")} autoCapitalize="words" style={this.styles.textInput}
                      errorStyle={this.styles.textInputError}
                      returnKeyType={nextField ? "next" : "search"} component={renderTextInputField}
                      persistPlaceholder={true}
                      onSubmitEditing={() => this.onSubmitEditing(nextField) }/>;
      case "phoneNumber":
        return <Field name={`phoneNumber`} onRef={(ref: any) => this.phoneNumber = ref}
                      placeholder={I18n.t("phoneNumber")} style={this.styles.textInput}
                      errorStyle={this.styles.textInputError} keyboardType="phone-pad"
                      returnKeyType={nextField ? "next" : "search"} component={renderTextInputField}
                      persistPlaceholder={true}
                      onSubmitEditing={() => this.onSubmitEditing(nextField) }/>;
      case "customerNumber":
        return <Field name={`customerNumber`} onRef={(ref: any) => this.customerNumber = ref }
                      placeholder={I18n.t("customerNumber")} style={this.styles.textInput}
                      errorStyle={this.styles.textInputError}
                      returnKeyType={nextField ? "next" : "search"} component={renderNumericInputField}
                      persistPlaceholder={true}
                      onSubmitEditing={() => this.onSubmitEditing(nextField) }/>;
      case "zipPostalCode":
        return <Field name={`zipPostalCode`} onRef={(ref: any) => this.zipPostalCode = ref }
                      placeholder={I18n.t("zipPostalCode")} style={this.styles.textInput}
                      errorStyle={this.styles.textInputError} keyboardType="numbers-and-punctuation"
                      returnKeyType={nextField ? "next" : "search"} component={renderTextInputField}
                      persistPlaceholder={true}
                      onSubmitEditing={() => this.onSubmitEditing(nextField) }/>;
      case "email":
        return <Field name={`email`} onRef={(ref: any) => this.email = ref }
                      placeholder={I18n.t("email")} style={this.styles.textInput}
                      errorStyle={this.styles.textInputError} keyboardType="email-address"
                      returnKeyType={nextField ? "next" : "search"} component={renderInputField}
                      persistPlaceholder={true}
                      cameraIcon={{
                        icon: "Camera",
                        size: this.styles.cameraIcon.fontSize,
                        color: this.styles.cameraIcon.color,
                        position: "right",
                        style: this.styles.cameraIconPanel
                      }}
                      inputType={InputType.text}
                      overrideOnSubmitEditing={() => this.onSubmitEditing(nextField) }/>;
      case "alternateKey":
        return <Field name={`alternateKey`} onRef={(ref: any) => this.alternateKey = ref }
                      placeholder={cur.displayText || I18n.t("alternateKey")}  style={this.styles.textInput}
                      errorStyle={this.styles.textInputError}
                      returnKeyType={nextField ? "next" : "search"} component={renderInputField}
                      persistPlaceholder={true}
                      maxLength={80}
                      cameraIcon={{
                        icon: "Camera",
                        size: this.styles.cameraIcon.fontSize,
                        color: this.styles.cameraIcon.color,
                        position: "right",
                        style: this.styles.cameraIconPanel
                      }}
                      inputType={InputType.text}
                      overrideOnSubmitEditing={() => this.onSubmitEditing(nextField) }/>;
      default:
        break;
    }
  }

  private pushCustomerCreate = () => {
    this.props.navigation.push("customerCreate", {
      assignCustomer: this.props.assignCustomer,
      onExit: this.props.onExit
    });
  }
}

export default reduxForm<CustomerSearchForm, Props>({
  form: "customerSearch",
  // tslint:disable-next-line:cyclomatic-complexity
  validate: (values: CustomerSearchForm, props: Props) => {
    const errors: { lastName: string, firstName: string, email: string, phoneNumber: string,
        zipPostalCode: string, customerNumber: string } = { lastName: undefined, firstName: undefined,
        email: undefined, phoneNumber: undefined, zipPostalCode: undefined, customerNumber: undefined};

    return errors;
  },
  initialValues: { lastName: undefined, firstName: undefined,
    email: undefined, phoneNumber: undefined, zipPostalCode: undefined, customerNumber: undefined},
  onSubmit: (data: CustomerSearchForm, dispatch: Dispatch<any>, props: Props) => {
    props.onSearch({lastName: data.lastName, firstName: data.firstName, emailAddress: data.email,
        phoneNumber: data.phoneNumber, postalCode: data.zipPostalCode, customerKey: data.customerNumber,
        alternateKey1: data.alternateKey});
  }
})(CustomerSearch);
