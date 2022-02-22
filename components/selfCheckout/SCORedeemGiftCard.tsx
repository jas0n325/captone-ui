import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  ConfigProps,
  DecoratedFormProps,
  Field,
  FormErrors,
  FormInstance,
  formValueSelector,
  InjectedFormProps,
  reduxForm
} from "redux-form";

import { UIINPUT_SOURCE_BARCODE, UIINPUT_SOURCE_KEYBOARD } from "@aptos-scp/scp-component-store-selling-core";
import { IPinRules, Usage } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import { renderNumericInputField } from "../common/FieldValidation";
import { InputType } from "../common/Input";
import { getPinUsage } from "../giftCard/GiftCardUtilities";
import { ITenderType } from "../payment/PaymentDevicesUtils";
import { scoRedeemStyles } from "./styles";


interface SCORedeemGiftCardForm {
  cardNumber: string;
  pinNumber: string;
}

interface OwnProps {
  settings: SettingsState;
  onBack: () => void;
  onRedeem: (cardNumber: string, uiInputSource: string, pinNumber: string) => void;
  activeGiftTender: ITenderType;
  pinRules: IPinRules;
  cardNumber: string;
}

interface StateProps {
  card: string;
  uiInputSource: string;
  pin: string;
}

interface Props extends OwnProps, StateProps {
}

interface State {}

class SCORedeemGiftCard extends React.Component<Props & InjectedFormProps<SCORedeemGiftCardForm, Props> &
    FormInstance<SCORedeemGiftCardForm, undefined>, State> {
  private styles: any;
  private pinNumberRef: any;

  public constructor(props: Props & InjectedFormProps<SCORedeemGiftCardForm, Props> &
      FormInstance<SCORedeemGiftCardForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(scoRedeemStyles());
  }

  public componentDidUpdate(prevProps: Props & InjectedFormProps<SCORedeemGiftCardForm, Props>): void {
    if (prevProps.card !== this.props.card && this.props.card !== this.props.cardNumber &&
        this.props.uiInputSource !== UIINPUT_SOURCE_KEYBOARD) {
      this.props.change("uiInputSource", UIINPUT_SOURCE_KEYBOARD);
    }
    if (this.props.cardNumber && this.props.cardNumber !== prevProps.cardNumber) {
      this.props.change("cardNumber", this.props.cardNumber);
      this.props.change("uiInputSource", UIINPUT_SOURCE_BARCODE);
    }
  }

  public render(): JSX.Element {
    const pinUsage: string = getPinUsage(this.props);
    return (
      <View style={this.styles.rightSide}>
        <View style= {this.styles.redeemButtonArea}>
          <TouchableOpacity
            style={this.styles.redeemBackButton}
            onPress={() => this.props.onBack()}
          >
            <Text style={this.styles.redeemBackText} >{I18n.t("back")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
           style={this.styles.continueButton}
           onPress={() => this.props.submit()}
          >
          <Text
             style={[this.styles.continueText]}>
             {I18n.t("apply")}
           </Text>
         </TouchableOpacity>
        </View>
        <View style={[this.styles.redeemTextArea, this.styles.redeemKeyTextArea]}>
          <Text style={this.styles.title}>{I18n.t("scanGiftCard")}</Text>
          <Text style={this.styles.subtitle}>{I18n.t("keyGiftCard")}</Text>
          <View style={this.styles.textInputArea}>
            <Field
                name={"cardNumber"}
                placeholder={I18n.t("giftCardNumber") + " *"}
                style={this.styles.field}
                inputStyle={this.styles.fieldInput}
                errorStyle={this.styles.textInputError}
                clearText={false}
                component={renderNumericInputField}
                onSubmitEditing={() => this.pinNumberRef && this.pinNumberRef.focus()}
                settings={this.props.settings}
                secureTextEntry={true}
                keyboardType={InputType.numeric}
                inputType={InputType.numeric}
              />
              { (pinUsage === Usage.Required || pinUsage === Usage.Optional) &&
                <Field
                  name={"pinNumber"}
                  onRef={(ref: any) => this.pinNumberRef = ref}
                  placeholder={this.getPinPlaceHolder(pinUsage)}
                  style={this.styles.field}
                  inputStyle={this.styles.fieldInput}
                  errorStyle={this.styles.textInputError}
                  clearText={false}
                  component={renderNumericInputField}
                  settings={this.props.settings}
                  secureTextEntry={true}
                  keyboardType={InputType.numeric}
                  inputType={InputType.numeric}
                  placeholderSentenceCase={false}
                />
              }
          </View>
        </View>
      </View>
    );
  }

  private getPinPlaceHolder(usage: string): string {
    const placeHolder: string = I18n.t("pin");
    return usage === Usage.Required ? placeHolder + " *" : placeHolder;
  }
}

const SCORedeemGiftCardForm = reduxForm<SCORedeemGiftCardForm, Props>({
  form: "SCORedeem",
  validate: (values: any, props: DecoratedFormProps<SCORedeemGiftCardForm, Props>) => {
    const errors: FormErrors<SCORedeemGiftCardForm, string> = {
      cardNumber: undefined
    };
    if (!values.cardNumber) {
      errors.cardNumber = I18n.t("required");
    }
    if (!values.pinNumber && getPinUsage(props) === Usage.Required) {
      errors.pinNumber = I18n.t("required");
    }
    return errors;
  },
  onSubmit: (data: SCORedeemGiftCardForm, dispatch: Dispatch<any>, props: Props) => {
    props.onRedeem(data.cardNumber, props.uiInputSource, data.pinNumber);
    Keyboard.dismiss();
  }
})(SCORedeemGiftCard);

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const selector = formValueSelector("SCORedeem");
  return {
    card: selector(state, "cardNumber"),
    uiInputSource: selector(state, "uiInputSource"),
    pin: selector(state, "pinNumber"),
    initialValues: {
      cardNumber: undefined as string,
      uiInputSource: undefined as string,
      pinNumber: undefined as string
    }
  };
};

export default connect<StateProps & Partial<ConfigProps<SCORedeemGiftCardForm, Props, string>>>(
  mapStateToProps)(SCORedeemGiftCardForm);
