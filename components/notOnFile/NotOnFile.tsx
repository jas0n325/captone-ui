import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { ITEM_NOT_ON_FILE_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { BusinessState } from "../../reducers";
import Theme from "../../styles";
import {
  CurrencyInput,
  renderNumericInputField,
  RenderSelectOptions,
  renderTextInputField
} from "../common/FieldValidation";
import Header from "../common/Header";
import {
  handleFormSubmission,
  isValidCurrencyMinimumValue,
  MinimumDenomination,
  printAmount,
  warnBeforeLosingChanges
} from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import { notOnFileStyle } from "./styles";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.notOnFile.NotOnFile");

export interface NotOnFileForm {
  department: string;
  description: string;
  price: string;
  quantity: string;
}

interface Props {
  businessState: BusinessState;
  retailLocationCurrency?: string;
  departments: RenderSelectOptions[];
  itemKey: string;
  maxAllowedLength: number;
  quantityDisabled: boolean;
  currency: string;
  minimumDenomination: MinimumDenomination;
  isDepartmentInputsRequired: () => boolean;
  onSave: (departmentId: string, description: string, price: string, quantity: string) => void;
  onCancel: () => void;
  navigation: NavigationProp;
}

interface State {
  department: RenderSelectOptions;
}

class NotOnFile extends React.Component<Props & InjectedFormProps<NotOnFileForm, Props> &
    FormInstance<NotOnFileForm, undefined>, State> {
  private formWasSubmitted: boolean = false;
  private price: any;
  private quantity: any;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<NotOnFileForm, Props> &
      FormInstance<NotOnFileForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(notOnFileStyle());

    this.state = {
      department: undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress &&
        prevProps.businessState.eventType === ITEM_NOT_ON_FILE_EVENT) {
      this.formWasSubmitted = false;
    }
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("itemNotOnFile")}
          backButton={{
            name: "Back",
            action:  () => warnBeforeLosingChanges(this.props.dirty, this.props.onCancel)
          }}
          rightButton={{
            title: I18n.t("add"),
            action: () => {
              if (this.isValid()) {
                this.submitFormHandler();
              }
            }
          }}
        />
        <View style={this.styles.panel}>
          <View style={this.styles.itemKey}>
            <Text style={this.styles.itemText}>{this.props.itemKey}</Text>
          </View>
          <Field
            name={"description"}
            placeholder={I18n.t("itemNotOnFileDescription")}
            autoCapitalize={"words"}
            style={this.styles.textInput}
            component={renderTextInputField}
            errorStyle={this.styles.textInputError}
            onSubmitEditing={() => this.price.focus()}
          />
          {
            this.props.isDepartmentInputsRequired() &&
            <>
              <TouchableOpacity
                style={[this.styles.btnDepartment, this.isDepartmentInvalid() ? this.styles.btnInvalidDepartment : {}]}
                onPress={this.pushReasonCodeList}
              >
                <Text style={this.styles.itemText}>
                  {!this.state.department ? I18n.t("itemNotOnFileDepartment") : this.state.department.description}
                </Text>
                <Text style={this.styles.itemText}>{">"}</Text>
              </TouchableOpacity>
              {
                this.isDepartmentInvalid() &&
                <View style={this.styles.departmentError}>
                  <Text style={this.styles.departmentErrorText}>
                    {I18n.t("required", { field: I18n.t("itemNotOnFileDepartment") })}
                  </Text>
                </View>
              }
            </>
          }
          <CurrencyInput
            name={"price"}
            onRef={(ref: any) => this.price = ref }
            placeholder={I18n.t("itemNotOnFilePrice")}
            style={this.styles.textInput}
            errorStyle={this.styles.textInputError}
            currency={this.props.businessState.stateValues.get("transaction.accountingCurrency") ||
                this.props.retailLocationCurrency}
            maxAllowedLength={this.props.maxAllowedLength}
            onSubmitEditing={() => this.quantity.focus()}
          />
          <Field
            name={"quantity"}
            disabled={this.props.quantityDisabled}
            onRef={(ref: any) => this.quantity = ref}
            placeholder={I18n.t("itemNotOnFileQuantity")}
            style={this.styles.textInput}
            inputStyle={this.props.quantityDisabled && this.styles.disabledArea}
            precision={0}
            component={renderNumericInputField}
            errorStyle={this.styles.textInputError}
            onSubmitEditing={this.submitFormHandler}
          />
        </View>
        {
          Theme.isTablet &&
          <View style={this.styles.actions}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.button, !this.isValid() && this.styles.btnDisabled]}
              disabled={!this.isValid()}
              onPress={this.submitFormHandler}
            >
              <Text style={[this.styles.btnPrimaryText, !this.isValid() && this.styles.btnTextDisabled]}>
                {I18n.t("addToTrx")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.button]}
              onPress={() => this.props.onCancel()}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }

  private isDepartmentInvalid(): boolean {
    return this.props.submitFailed && !this.state.department;
  }

  private isValid(): boolean {
    return this.props.valid && (this.props.isDepartmentInputsRequired() ? this.state.department !== undefined : true);
  }

  private onChangeReasonCode(department: RenderSelectOptions): void {
    this.setState({ department });

    this.props.change("department", department.code);
  }

  private submitFormHandler = (): void => {
    if (!this.formWasSubmitted && this.isValid()) {
      this.formWasSubmitted = true;

      handleFormSubmission(logger, this.props.submit);
    }
  }

  private pushReasonCodeList = () => {
    this.props.navigation.push("reasonCodeList", {
      currentSelectedOption: this.state.department,
      options: this.props.departments,
      onOptionChosen: this.onChangeReasonCode.bind(this)
    });
  };
}

export default reduxForm<NotOnFileForm, Props>({
  form: "notOnFile",
  validate: (values: NotOnFileForm, props: Props) => {
    const errors: NotOnFileForm = {
      department: undefined,
      description: undefined,
      price: undefined,
      quantity: undefined
    };

    if (!values.department && props.isDepartmentInputsRequired()) {
      errors.department = I18n.t("required", {field : I18n.t("itemNotOnFileDepartment")});
    }

    if (!values.description || values.description.trim().length === 0) {
      errors.description = I18n.t("descriptionMissing");
    }

    if (!values.price || Number.parseFloat(values.price) === 0) {
      errors.price = I18n.t("required", {field : I18n.t("price")});
    } else if (values.price && props.minimumDenomination && props.minimumDenomination.minimumValue &&
      !isValidCurrencyMinimumValue(values.price, props.currency, props.minimumDenomination.minimumValue)) {
      errors.price = I18n.t("invalidRoundedAmount", { amount: printAmount(
        new Money(props.minimumDenomination.minimumValue, props.currency)) });
      }

    const quantityMissing: boolean = !props.quantityDisabled && (!values.quantity || !values.quantity.trim().length ||
        Number.parseInt(values.quantity, 10) === 0);

    if (quantityMissing) {
      errors.quantity = I18n.t("required", {field : I18n.t("quantity")});
    }

    return errors;
  },
  initialValues: {
    department: undefined,
    description: undefined,
    price: undefined,
    quantity: undefined
  },
  onSubmit: (data: NotOnFileForm, dispatch: Dispatch<any>, props: Props) => {
    /**
     * As Department is not exactly a part of form we are changing the department value explicitly,
     * So if user press the keypad submit button then we will have error if department is required.
     * To overcome that we need to explicitly check if department is required than is department valuue is
     * added to form or not.
     */
    if (!props.isDepartmentInputsRequired() || data.department) {
      props.onSave(data.department, data.description, data.price, props.quantityDisabled ? "1" : data.quantity);
    }
    Keyboard.dismiss();
  }
})(NotOnFile);

