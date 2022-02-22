import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dispatch } from "redux";
import { DecoratedFormProps, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import NumericInput from "../common/customInputs/NumericInput";
import { CurrencyInput } from "../common/FieldValidation";
import Header from "../common/Header";
import ItemLine from "../common/ItemLine";
import { handleFormSubmission, warnBeforeLosingChanges } from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import { zeroPriceStyles } from "./styles";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.price.ZeroPriced");

export interface ZeroPricedForm {
  price: string;
  quantity: string;
}

interface Props {
  currency: string;
  maxAllowedLength: number;
  line: IItemDisplayLine;
  quantityDisabled: boolean;
  onSave: (price: string, quantity: string) => void;
  onCancel: () => void;
  navigation: NavigationProp;
}

interface State {
  quantity: string;
}

class ZeroPriced extends React.Component<Props & InjectedFormProps<ZeroPricedForm, Props> &
    FormInstance<ZeroPricedForm, undefined>, State> {
  private price: any;
  private quantity: any;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<ZeroPricedForm, Props> &
      FormInstance<ZeroPricedForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(zeroPriceStyles());
    this.state = {
      quantity: "1"
    };
  }

  public componentDidMount(): void {
    this.price.focus();
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("zeroPriced")}
          backButton={{name: "Back", action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onCancel)}}
          rightButton={{title: I18n.t("apply"), action: () => handleFormSubmission(logger, this.props.submit) }}
        />
        <ItemLine line={this.props.line} />
        <KeyboardAwareScrollView contentContainerStyle={this.styles.fill}>
          <View style={this.styles.formArea}>
            <CurrencyInput name="price" onRef={(ref: any) => this.price = ref} placeholder={I18n.t("enterNewPrice")}
                           style={this.styles.inputFormArea} inputStyle={this.styles.inputForm}
                           errorStyle={this.styles.errorTextSyle} currency={this.props.currency}
                           maxAllowedLength={this.props.maxAllowedLength} onSubmitEditing={() => this.quantity.focus()}
            />
            <View style={[this.styles.controlsRow, this.props.quantityDisabled && this.styles.disabledArea]}>
              <Text style={this.styles.textPrompt}>
                {I18n.t("quantity") + ":"}
              </Text>
              <NumericInput
                disabled={this.props.quantityDisabled}
                onRef={(ref: any) => this.quantity = ref}
                placeholder={undefined}
                style={[this.styles.input, this.props.quantityDisabled && this.styles.disabledArea]}
                precision={0}
                negative={false}
                returnKeyType={"done"}
                secureTextEntry={false}
                trimLeadingZeroes={true}
                value={this.state.quantity}
                onChangeText={this.updateQuantity.bind(this)}
                onSubmitEditing={() => handleFormSubmission(logger, this.props.submit)}
              />
              <View style={this.styles.quantityButtonsArea}>
                <TouchableOpacity
                  style={[this.styles.quantityButton, this.styles.quantityButtonMinus]}
                  onPress={() => this.subtractQuantity()}
                  disabled={this.props.quantityDisabled}
                >
                  <Text style={this.styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[this.styles.quantityButton, this.styles.quantityButtonAdd]}
                  onPress={() => this.addQuantity()}
                  disabled={this.props.quantityDisabled}
                >
                  <Text style={this.styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {Theme.isTablet &&
          <View style={this.styles.buttonsArea}>
            <TouchableOpacity
              style={[this.styles.mainButton, !this.isValid() && this.styles.btnDisabled]}
              disabled={!this.isValid()}
              onPress={() => handleFormSubmission(logger, this.props.submit)}
            >
              <Text style={[this.styles.btnPrimaryText, !this.isValid() && this.styles.btnTextDisabled]}>
                {I18n.t("apply")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={this.styles.closeButton}
              onPress={this.pop}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          </View>
          }
        </KeyboardAwareScrollView>
      </View>
    );
  }

  private subtractQuantity(): void {
    const quantity: number = parseInt(this.state.quantity, 10) - 1;
    if (quantity && quantity > 0) {
      this.updateQuantity(quantity.toString());
    }
  }

  private addQuantity(): void {
    const quantity: number = parseInt(this.state.quantity, 10) + 1;
    if (quantity && quantity > 0) {
      this.updateQuantity(quantity.toString());
    }
  }

  private updateQuantity(newQuantity: string): void {
    this.setState({ quantity: newQuantity });
    this.props.change("quantity", newQuantity);
  }

  private isValid(): boolean {
    return this.props.valid && this.state.quantity.trim().length && Number.parseInt(this.state.quantity, 10) > 0;
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

export default reduxForm<ZeroPricedForm, Props>({
  form: "zeroPriced",
  validate: (values: any, props: DecoratedFormProps<ZeroPricedForm, Props>) => {
    const errors: { price: string, quantity: string } = { price: undefined, quantity: undefined };

    if (!values.price || Number.parseFloat(values.price) === 0) {
      errors.price = I18n.t("required", {field: I18n.t("price")});
    }

    const quantityMissing: boolean = !props.quantityDisabled && (!values.quantity || !values.quantity.trim().length ||
        Number.parseInt(values.quantity, 10) === 0);

    if (quantityMissing) {
      errors.quantity = I18n.t("required", {field: I18n.t("quantity")});
    }

    return errors;
  },
  initialValues: {
    price: undefined,
    quantity: "1"
  },
  onSubmit: (data: ZeroPricedForm, dispatch: Dispatch<any>, props: Props) => {
    props.onSave(data.price, data.quantity);
    Keyboard.dismiss();
  }
})(ZeroPriced);
