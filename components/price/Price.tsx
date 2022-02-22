import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { FormInstance, formValueSelector, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { IItemDisplayLine, IThreshold } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, BusinessState } from "../../reducers";
import Theme from "../../styles";
import { CurrencyInput, RenderSelectOptions } from "../common/FieldValidation";
import Header from "../common/Header";
import ItemLine from "../common/ItemLine";
import {
  handleFormSubmission,
  isValidCurrencyMinimumValue,
  MinimumDenomination,
  printAmount,
  warnBeforeLosingChanges
} from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import { priceStyles } from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.price.Price");

export interface PriceForm {
  newPrice: string;
  reasonCode: string;
}

interface Props extends StateProps {
  maxAllowedLength: number;
  line: IItemDisplayLine;
  showLine: boolean;
  reasons: RenderSelectOptions[];
  businessState: BusinessState;
  currency: string;
  minimumDenomination: MinimumDenomination;
  limits?: IThreshold;
  onCancel: () => void;
  onSave: (price: string, reasonCodeId?: string) => void;
  requiresPriceEntry?: boolean;
  navigation: NavigationProp;
}

interface StateProps {
  newPrice?: string;
}

interface State {
  reasonCode: RenderSelectOptions;
}

class Price extends React.Component<Props & InjectedFormProps<PriceForm, Props> &
    FormInstance<PriceForm, undefined>, State> {
  private priceRef: any;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<PriceForm, Props> &
      FormInstance<PriceForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(priceStyles());

    this.state = {
      reasonCode: undefined
    };
  }

  public componentDidMount(): void {
    /**
     * requiresPriceEntry is true in the event of a system-mandated price entry,
     * and false in the case of a user-initiated price override
     */
    if(!this.props.requiresPriceEntry){
      this.priceRef.focus();
    }
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.root, this.props.requiresPriceEntry && this.styles.notInActionPanel]}>
        <Header
          title={this.props.requiresPriceEntry ? I18n.t("price") : I18n.t("overridePrice")}
          backButton={{
            name: "Back", action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onCancel)
          }}
          rightButton={{ title: I18n.t("apply"), action: () => handleFormSubmission(logger, this.props.submit) }}
        />
        { this.props.showLine && <ItemLine line={this.props.line} style={this.styles.itemLine} /> }
        <KeyboardAwareScrollView style={this.styles.scrollView} contentContainerStyle={this.styles.formArea}>
          <View style={this.styles.formArea}>
            <CurrencyInput
              onRef={(ref: any) => this.priceRef = ref}
              name="newPrice"
              blurOnSubmit={false}
              placeholder={I18n.t("enterNewPrice")}
              style={this.styles.inputFormArea}
              inputStyle={this.styles.inputForm}
              errorStyle={this.styles.errorTextSyle}
              currency={this.props.currency}
              onFocus={this.clearOnFocus}
              onBlur={this.resetOnBlur}
              maxAllowedLength={this.props.maxAllowedLength}
            />
            {
              !this.props.requiresPriceEntry &&
              <>
                <TouchableOpacity
                    style={[this.styles.btnReasonCode, this.isReasonInvalid() ? this.styles.btnInvalidReasonCode : {} ]}
                    onPress={this.pushReasonCodeList}
                >
                  <Text style={[this.styles.btnReasonCodeText, this.styles.tal]}>
                    {!this.state.reasonCode ? I18n.t("newPriceReason") : this.state.reasonCode.description }
                  </Text>
                  <Text style={[this.styles.btnReasonCodeText, this.styles.tar]}>{">"}</Text>
                </TouchableOpacity>
                {
                  this.isReasonInvalid() &&
                  <View style={this.styles.reasonCodeError}>
                    <Text style={this.styles.reasonCodeErrorText}>
                      {I18n.t("required", {field : I18n.t("newPriceReason")})}
                    </Text>
                  </View>
                }
              </>
            }
          </View>
          {
            Theme.isTablet &&
            <View style={this.styles.buttonsArea}>
              <TouchableOpacity
                style={[this.styles.mainButton, !this.isValid() && this.styles.btnDisabled]}
                onPress={() => handleFormSubmission(logger, this.props.submit)}
                disabled={!this.isValid()}
              >
                <Text style={[this.styles.btnPrimaryText, !this.isValid() && this.styles.btnTextDisabled]}>
                  {I18n.t("apply")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={this.styles.closeButton} onPress={this.props.onCancel} >
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          }
        </KeyboardAwareScrollView>
      </View>
    );
  }

  private isReasonInvalid(): boolean {
    return this.props.submitFailed && !this.state.reasonCode;
  }

  private isValid(): boolean {
    return this.props.valid && (!!this.state.reasonCode || this.props.requiresPriceEntry);
  }

  private onChangeReasonCode(reasonCode: RenderSelectOptions): void {
    this.setState({ reasonCode });

    this.props.change("reasonCode", reasonCode.code);
  }

  private resetOnBlur = (): void => {
    if (this.props.requiresPriceEntry && this.props.newPrice === "") {
      setTimeout(() => this.props.change("newPrice", this.props.line.unitPrice.amount.amount));
    }
  }

  private clearOnFocus = (): void => {
    if (this.props.requiresPriceEntry) {
      this.props.change("newPrice", "");
    }
  }

  private pushReasonCodeList = () => {
    this.props.navigation.push("reasonCodeList", {
      resetTitle: true,
      currentSelectedOption: this.state.reasonCode,
      options: this.props.reasons,
      onOptionChosen: this.onChangeReasonCode.bind(this)
    });
  }
}

const reduxFormPriceForm = reduxForm<PriceForm, Props>({
  form: "price",
  enableReinitialize: true,
  validate: (values: PriceForm, props: Props) => {
    const errors: PriceForm = { newPrice: undefined, reasonCode: undefined };
    if ((!values.reasonCode || values.reasonCode.trim().length === 0) && !props.requiresPriceEntry) {
      errors.reasonCode = I18n.t("reasonCodeMissing");
    }
    if (values.newPrice === undefined || values.newPrice === "" ||
        (!props.requiresPriceEntry && Number.parseFloat(values.newPrice) === 0)) {
      errors.newPrice = I18n.t("required", {field: I18n.t("price")});
    } else if (props.minimumDenomination && props.minimumDenomination.minimumValue &&
        !isValidCurrencyMinimumValue(values.newPrice, props.currency, props.minimumDenomination.minimumValue)) {
      errors.newPrice =I18n.t("invalidRoundedAmount", { amount: printAmount(
            new Money(props.minimumDenomination.minimumValue, props.currency)) });
    }

    return errors;
  },
  onSubmit(data: PriceForm, dispatch: Dispatch<any>, props: Props): void {
    props.onSave(data.newPrice, !props.requiresPriceEntry && data.reasonCode);
    Keyboard.dismiss();
 }
})(Price);

const selector = formValueSelector("price");

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    initialValues: {
      newPrice: ownProps.requiresPriceEntry ? ownProps.line.unitPrice.amount.amount : undefined
    },
    newPrice: selector(state, "newPrice")
  };
};

export default connect(mapStateToProps)(reduxFormPriceForm);
