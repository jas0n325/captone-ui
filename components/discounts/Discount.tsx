import * as React from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ConfigProps, Field, FormInstance, formValueSelector, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  IDiscountDisplayLine,
  IEmployee,
  IEmployeeDiscount,
  IInputLimit,
  IItemDisplayLine,
  ILabel,
  OTHER_COMPETITOR_CODE,
  OTHER_FORM_OF_PROOF_CODE
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import { Modify } from "../common/constants";
import {
  CurrencyInput,
  renderInputField,
  renderOptionsSelect,
  renderPercentageInputField,
  RenderSelectOptions,
  renderTextInputField
} from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import ItemLine from "../common/ItemLine";
import ItemSummaryLine from "../common/ItemSummaryLine";
import {
  handleFormSubmission,
  isValidCurrencyMinimumValue,
  MinimumDenomination,
  printAmount,
  warnBeforeLosingChanges
} from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { NavigationProp } from "../StackNavigatorParams";
import { DiscountLevel, DiscountType } from "./constants";
import { discountStyles } from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.discounts.Discount");

export interface DiscountForm {
  amount: string;
  couponCode: string;
  employeeId: string;
  percentage: string;
  competitor: RenderSelectOptions;
  formOfProof: RenderSelectOptions;
  otherCompetitor?: string;
  otherFormOfProof?: string;
  employeeName?: string;
}

// Replace form's object types with strings for validation object
type DiscountFormValidation = Modify<DiscountForm, { competitor: string; formOfProof: string; }>;

export enum ValueType {
  Amount = "Amount",
  Percent = "Percent",
  NewPrice = "NewPrice",
  CompetitivePrice = "CompetitivePrice"
}

interface StateProps {
  stateValues: Map<string, any>;
  settings: SettingsState;
  selectedCompetitor?: RenderSelectOptions;
  selectedFormOfProof?: RenderSelectOptions;
}

interface Props extends StateProps {
  discountLevel: DiscountLevel;
  discountType: DiscountType;
  itemLines?: IItemDisplayLine[];
  discountDisplayLine?: IDiscountDisplayLine;
  showLine: boolean;
  valueType: ValueType;
  currentReasonCode: RenderSelectOptions;
  currentCompetitor: RenderSelectOptions;
  currentFormOfProof: RenderSelectOptions;
  reasonCodeOptions: RenderSelectOptions[];
  incomingCouponCode: string;
  onChangeValueType: (newValueType: ValueType) => void;
  onSetReasonCode: (newReasonCode: RenderSelectOptions) => void;
  onDiscount: (amount?: string, percent?: string, couponCode?: string, employeeId?: string,
               modifyDiscountLineNumber?: number, competitor?: RenderSelectOptions, formOfProof?: RenderSelectOptions,
               otherCompetitor?: string, otherFormOfProof?: string, employeeDiscount?: IEmployeeDiscount) => void;
  onPress: () => void;
  onCancel: () => void;
  employeeId?: string;
  limits?: IInputLimit;
  currency: string;
  minimumDenomination: MinimumDenomination;
  checkThresholdAgainstOriginalPrice: boolean;
  competitors?: RenderSelectOptions[];
  formsOfProof?: RenderSelectOptions[];
  employeeDiscountValue?: string;
  employeeDiscountDisplayText?: ILabel;
  preconfiguredEmployeeDiscount?: boolean;
  displayEmployeeConfirmation?: boolean;
  employeeCustomer?: IEmployee;
  navigation: NavigationProp;
  employeeDiscount?: IEmployeeDiscount;
  allowEmployeeDiscountSubmitWithoutPercent?: boolean;
}

interface State {
  errorMessage: string;
}

class Discount extends React.PureComponent<Props & InjectedFormProps<DiscountForm, Props> &
    FormInstance<DiscountForm, undefined>, State> {
  private coupon: any;
  private percentageField: any;
  private styles: any;

  constructor(props: Props & InjectedFormProps<DiscountForm, Props> &
      FormInstance<DiscountForm, undefined>) {
    super(props);
    this.styles = Theme.getStyles(discountStyles());

    this.state = {
      errorMessage: undefined
    };
  }

  public componentDidUpdate(prevProps: Props & InjectedFormProps<DiscountForm, Props>): void {
    if (prevProps.currentReasonCode !== this.props.currentReasonCode) {
      this.props.change("reasonCode", this.props.currentReasonCode);
    }
    if (prevProps.incomingCouponCode !== this.props.incomingCouponCode) {
      this.props.change("couponCode", this.props.incomingCouponCode);
    }
    if (prevProps.valueType !== this.props.valueType) {
      this.props.change("valueType", this.props.valueType);
    }
    if (prevProps.employeeId !== this.props.employeeId) {
      this.props.change("employeeId", this.props.employeeId);
    }
    if (prevProps.displayEmployeeConfirmation !== this.props.displayEmployeeConfirmation) {
      const employee: IEmployee = this.props.employeeCustomer;
      this.props.change("employeeName", employee.displayName || `${employee.firstName} ${employee.lastName}`);
    }
    if (!prevProps.employeeDiscount && this.props.employeeDiscount && this.props.employeeDiscount.discountPercentage) {
      this.props.change("percentage", `${this.props.employeeDiscount.discountPercentage}%`);
    }
  }

  public render(): JSX.Element {
    const employeeDiscountTitle = this.props.employeeDiscountDisplayText ?
        I18n.t(this.props.employeeDiscountDisplayText.i18nCode,
        { defaultValue: this.props.employeeDiscountDisplayText.default }) : I18n.t("employeeDiscount");
    return (
      <View style={this.styles.root}>
        <Header
          title={this.props.discountType === DiscountType.Manual ? I18n.t("discount") :
              this.props.discountType === DiscountType.Coupon ? I18n.t("couponDiscount") :
                  this.props.discountType === DiscountType.CompetitivePrice ? I18n.t("priceMatch") :
                      this.props.discountType === DiscountType.Employee ? employeeDiscountTitle :
                          I18n.t("priceDiscount")}
          backButton={{
            name: "Back",
            action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onCancel)
          }}
          rightButton={{
            title: this.props.displayEmployeeConfirmation ? I18n.t("confirm") : I18n.t("apply"),
            action: () => handleFormSubmission(logger, this.props.submit, this.isValid())
          }}
        />
        {this.props.showLine && this.props.itemLines && this.props.itemLines.length === 1 &&
        <ScrollView style={this.styles.fill}>
          <ItemLine line={this.props.itemLines[0]} style={this.styles.itemLine} />
          {this.renderDiscountForm()}
        </ScrollView>
        }
        {this.props.showLine && this.props.itemLines && this.props.itemLines.length > 1 &&
        <ScrollView style={this.styles.fill} horizontal={false}>
          {this.renderItemSummaryLines()}
          {this.renderDiscountForm()}
        </ScrollView>
        }
        {!this.props.showLine &&
        <View style={this.styles.fill}>
          {this.renderDiscountForm()}
          {this.props.discountType !== DiscountType.Employee && this.renderConfirmationActions()}
        </View>
        }
      </View>
    );
  }

  private renderConfirmationActions(): JSX.Element {
    return (
      Theme.isTablet &&
        <View style={this.styles.actions}>
          <TouchableOpacity
            style={[this.styles.btnPrimary, this.styles.button, !this.isValid() && this.styles.btnDisabled]}
            disabled={!this.isValid()}
            onPress={() => handleFormSubmission(logger, this.props.submit, this.isValid())}
          >
            <Text style={[this.styles.btnPrimaryText, !this.isValid() && this.styles.btnTextDisabled]}>
              {this.props.displayEmployeeConfirmation ? I18n.t("confirm") : I18n.t("apply")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[this.styles.btnSeconday, this.styles.button]} onPress={this.props.onCancel} >
            <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
          </TouchableOpacity>
        </View>
    );
  }

  private renderItemSummaryLines(): JSX.Element {
    return (
      <View style={this.styles.itemLines}>
        <View style={this.styles.line}>
          <Text style={this.styles.itemLineTitle}>{I18n.t("multipleItem")}</Text>
        </View>
        <FlatList
          style = {this.styles.fullItemLineList}
          data={this.props.itemLines}
          keyExtractor={(item) => item.lineNumber.toString() }
          renderItem={({ item, index }) =>  (<ItemSummaryLine itemLine={item}/>)}/>
      </View>
    );
  }

  private renderDiscountForm(): JSX.Element {
    if (this.props.discountType === DiscountType.Employee) {
      return this.renderEmployeeDiscountForm();
    } else if (this.props.discountType === DiscountType.NewPrice) {
      return this.renderNewPriceDiscountForm();
    } else if (this.props.discountType === DiscountType.CompetitivePrice) {
      return this.renderCompetitivePriceForm();
    } else {
      return this.renderManualOrCouponDiscountForm();
    }
  }

  private renderManualOrCouponDiscountForm(): JSX.Element {
    return (
      <>
        <SegmentedControlTab
          selectedIndex={this.props.valueType === ValueType.Amount ? 0 : 1}
          activeTabStyle={this.styles.togglerActive}
          activeTabTextStyle={this.styles.togglerActiveText}
          tabsContainerStyle={this.styles.togglerArea}
          tabStyle={this.styles.togglerInactive}
          tabTextStyle={this.styles.togglerInactiveText}
          values={[I18n.t(ValueType.Amount.toLowerCase()), I18n.t(ValueType.Percent.toLowerCase())]}
          onTabPress={(index: number) => {
            this.props.onChangeValueType(index === 0 ? ValueType.Amount : ValueType.Percent);
          }}
        />
        {
          this.props.valueType === ValueType.Amount &&
          <CurrencyInput
            name={"amount"}
            blurOnSubmit={false}
            currency={this.props.stateValues.get("transaction.accountingCurrency")}
            errorStyle={this.styles.errorText}
            placeholder={I18n.t("discountAmount")}
            style={this.styles.inputText}
            onSubmitEditing={() => {
              if (this.coupon) {
                this.coupon.focus();
              }
            }}
          />
        }
        { this.props.valueType === ValueType.Percent && this.renderPercentageField() }
        {
          this.props.discountType === DiscountType.Coupon &&
          <Field
            name="couponCode"
            onRef={(ref: any) => this.coupon = ref}
            component={renderInputField}
            style={this.styles.inputText}
            errorStyle={this.styles.errorText}
            placeholder={I18n.t("couponCode")}
            placeholderSentenceCase={false}
            settings={this.props.settings}
            inputType={InputType.text}
            overrideOnSubmitEditing={() => handleFormSubmission(logger, this.props.submit, this.isValid())}
          />
        }
        {
          this.props.discountType === DiscountType.Manual &&
          <TouchableOpacity
            style={this.styles.reasonCodeButton}
            onPress={this.pushReasonCodeList}
          >
            <Text style={[this.styles.reasonCodeButtonText, this.styles.tal]}>
              {this.props.currentReasonCode ? this.props.currentReasonCode.description : I18n.t("newPriceReason")}
            </Text>
            <Text style={[this.styles.reasonCodeButtonText, this.styles.tar]}>{">"}</Text>
          </TouchableOpacity>
        }
      </>
    );
  }

  private renderEmployeeDiscountForm(): JSX.Element {
    return (
      <>
        { this.renderEmployeeDetail() }
        { this.props.valueType === ValueType.Percent && this.renderPercentageField() }
        { this.renderConfirmationActions() }
        {
          this.props.displayEmployeeConfirmation &&
          <View style={this.styles.employeeInformationArea}>
            {/* todo: add employee image when available/required */}
            <View style={this.styles.employeePictureBackground}>
              <VectorIcon
                name={"EmployeePlaceholder"}
                height={this.styles.employeePicture.size}
                width={this.styles.employeePicture.size}
              />
            </View>
            <View style={this.styles.employeeInfoView} >
              <Text style={this.styles.employeeInfoHeader}>
                {I18n.t("employeeName")}
              </Text>
              <Text style={this.styles.employeeInfoValue}>
                {this.props.employeeCustomer && (this.props.employeeCustomer.displayName ||
                `${this.props.employeeCustomer.firstName} ${this.props.employeeCustomer.lastName}`)}
              </Text>
            </View>
            {
              this.props.employeeDiscount &&
              this.props.employeeDiscount.displayMessage &&
              <View style={this.styles.employeeInfoView} >
                <Text style={this.styles.employeeInfoHeader}>
                  {I18n.t("employeeMessage")}
                </Text>
                <Text style={this.styles.employeeInfoValue}>
                  { this.props.employeeDiscount.displayMessage }
                </Text>
              </View>
            }
          </View>
        }
      </>
    );
  }

  private renderNewPriceDiscountForm(): JSX.Element {
    return (
      <>
        <CurrencyInput
          name={"amount"}
          blurOnSubmit={false}
          currency={this.props.stateValues.get("transaction.accountingCurrency")}
          errorStyle={this.styles.errorText}
          placeholder={I18n.t("newPriceDiscount")}
          style={this.styles.inputText}
        />
        {
          this.props.reasonCodeOptions &&
          <TouchableOpacity
            style={this.styles.reasonCodeButton}
            onPress={this.pushReasonCodeList}
          >
            <Text style={[this.styles.reasonCodeButtonText, this.styles.tal]}>
              {this.props.currentReasonCode ? this.props.currentReasonCode.description : I18n.t("newPriceReason")}
            </Text>
            <Text style={[this.styles.reasonCodeButtonText, this.styles.tar]}>{">"}</Text>
          </TouchableOpacity>
        }
      </>
    );
  }

  private renderPercentageField(): JSX.Element {
    const isDisabled: boolean = !!this.props.employeeDiscountValue || !!this.props.displayEmployeeConfirmation;
    return (
        <Field
          name={"percentage"}
          component={renderPercentageInputField}
          onRef={(percentageField: any) => this.percentageField = percentageField}
          errorStyle={this.styles.errorText}
          placeholder={I18n.t("discountPercentage")}
          settings={this.props.settings}
          style={this.styles.inputText}
          inputStyle={isDisabled && this.styles.inputDisabled || {}}
          onSubmitEditing={() => {
            if (this.coupon) {
              this.coupon.focus();
            } else if (this.props.discountType === DiscountType.Employee) {
              handleFormSubmission(logger, this.props.submit, this.isValid());
            }
          }}
          onPress={this.props.onPress}
          disabled={isDisabled}
          preconfiguredEmployeeDiscount={this.props.preconfiguredEmployeeDiscount}
          disableEditButton={isDisabled && !!this.props.employeeDiscount}
        />
    );
  }

  private renderEmployeeDetail(): JSX.Element {
    if (this.props.employeeId && !!this.props.discountDisplayLine) {
      return <Text style={this.styles.employeeInfo}>{`${I18n.t("employeeId")}: ${this.props.employeeId}`}</Text>;
    } else {
      return (
        <Field
          name={"employeeId"}
          component={renderInputField}
          errorStyle={this.styles.errorText}
          placeholder={I18n.t("employeeId")}
          placeholderSentenceCase={false}
          precision={0}
          settings={this.props.settings}
          style={this.styles.inputText}
          inputType={InputType.numeric}
          disabled={this.props.displayEmployeeConfirmation}
          inputStyle={this.props.displayEmployeeConfirmation && this.styles.inputDisabled}
          onSubmitEditing={() => setTimeout(this.percentageField.focus())}
        />
      );
    }
  }

  private renderCompetitivePriceForm(): JSX.Element {
    return (
      <>
        <CurrencyInput
          name="amount"
          blurOnSubmit={false}
          currency={this.props.stateValues.get("transaction.accountingCurrency")}
          errorStyle={this.styles.errorText}
          placeholder={I18n.t("newPriceDiscount")}
          style={this.styles.inputText}
        />
        <Field
          name="competitor"
          scene={"competitor"}
          placeholder={I18n.t("competitor")}
          component={renderOptionsSelect}
          errorStyle={this.styles.errorText}
          options={this.props.competitors}
          selectedOption={this.props.selectedCompetitor}
        />
        {
          this.props.selectedCompetitor && this.props.selectedCompetitor.code === OTHER_COMPETITOR_CODE &&
          <Field
            name="otherCompetitor"
            placeholder={I18n.t("otherCompetitor")}
            component={renderTextInputField}
            style={{ ...this.styles.inputText, ...this.styles.inputTextBottomRoom }}
            errorStyle={this.styles.errorText}
            persistPlaceholder={true}
          />
        }
        <Field
          name="formOfProof"
          scene={"formOfProof"}
          placeholder={I18n.t("formOfProof")}
          component={renderOptionsSelect}
          errorStyle={this.styles.errorText}
          options={this.props.formsOfProof}
          selectedOption={this.props.selectedFormOfProof}
        />
        {
          this.props.selectedFormOfProof && this.props.selectedFormOfProof.code === OTHER_FORM_OF_PROOF_CODE &&
          <Field
            name="otherFormOfProof"
            placeholder={I18n.t("otherProof")}
            component={renderTextInputField}
            style={this.styles.inputText}
            errorStyle={this.styles.errorText}
            persistPlaceholder={true}
          />
        }
      </>
    );
  }

  private isValid(): boolean {
    return this.props.currentReasonCode !== undefined ||
      (this.props.discountType !== DiscountType.Manual && this.props.discountType !== DiscountType.NewPrice) ||
        this.props.discountType === DiscountType.NewPrice && !this.props.reasonCodeOptions;
  }

  private pushReasonCodeList = () => {
    this.props.navigation.push("reasonCodeList", {
      resetTitle: true,
      currentSelectedOption: this.props.currentReasonCode,
      options: this.props.reasonCodeOptions,
      onOptionChosen: this.props.onSetReasonCode
    })
  }
}

const DiscountForm = reduxForm({
  form: "discount",
  // tslint:disable-next-line:cyclomatic-complexity
  validate: (values: DiscountForm, props: Props) => {
    const errors: DiscountFormValidation = {
      amount: undefined,
      couponCode: undefined,
      employeeId: undefined,
      percentage: undefined,
      competitor: undefined,
      formOfProof: undefined
    };
    if (props.valueType === ValueType.Amount) {
      if (!values.amount  || Number.parseFloat(values.amount) === 0) {
        errors.amount = I18n.t("amountRequired");
      } else if (values.amount && props.minimumDenomination && props.minimumDenomination.minimumValue &&
          !isValidCurrencyMinimumValue(values.amount, props.currency, props.minimumDenomination.minimumValue)) {
        errors.amount = I18n.t("invalidRoundedAmount", { amount: printAmount(
            new Money(props.minimumDenomination.minimumValue, props.currency)) });
      } else if (props.itemLines && props.itemLines.length === 1 && props.limits &&
          props.limits.amount && props.limits.amount.maxPercent) {
        const itemLine: IItemDisplayLine = props.itemLines[0];
        const currency = itemLine.unitPrice.amount.currency;
        const unitPrice = itemLine.unitPrice.amount.plus(props.discountDisplayLine && props.discountDisplayLine.amount ?
            props.discountDisplayLine.amount : new Money("0", currency));

        const discount = new Money(values.amount, currency);
        if (unitPrice.isPositive() && (discount.percentOf(unitPrice) > props.limits.amount.maxPercent)) {
          errors.amount = I18n.t("amountLimit");
        }
      }
    }

    if (props.valueType === ValueType.NewPrice || props.valueType === ValueType.CompetitivePrice) {
      if (!values.amount  || Number.parseFloat(values.amount) === 0) {
        errors.amount = I18n.t("required", {field : I18n.t("newPriceDiscount")});
      } else if (values.amount && props.minimumDenomination && props.minimumDenomination.minimumValue &&
          !isValidCurrencyMinimumValue(values.amount, props.currency, props.minimumDenomination.minimumValue)) {
        errors.amount = I18n.t("invalidRoundedAmount", { amount: printAmount(
              new Money(props.minimumDenomination.minimumValue, props.currency)) });
      } else if (props.itemLines && props.itemLines.length === 1 && props.limits &&
          props.limits.amount && props.limits.amount.maxPercent) {
        const itemLine: IItemDisplayLine = props.itemLines[0];
        const currency = itemLine.unitPrice.amount.currency;

        let basePrice: Money;
        if (props.checkThresholdAgainstOriginalPrice && itemLine.unitPriceBeforePriceOverride) {
          basePrice = itemLine.unitPriceBeforePriceOverride.amount;
        } else {
          basePrice = itemLine.unitPrice.amount.plus(
            props.discountDisplayLine ? props.discountDisplayLine.amount : new Money("0", currency)
          );
        }

        const newPrice = new Money(values.amount, currency);
        if (newPrice.lt(basePrice)) {
          const discount = basePrice.minus(newPrice);
          if (discount.percentOf(basePrice) > props.limits.amount.maxPercent) {
            errors.amount = I18n.t("newPriceDiscountLimit");
          }
        }
      }
    }

    if (props.valueType === ValueType.Percent && !props.allowEmployeeDiscountSubmitWithoutPercent) {
      if (values.percentage === undefined || isNaN(parseFloat(values.percentage))) {
        errors.percentage = I18n.t("percentageRequired");
      } else if (parseFloat(values.percentage) <= 0.0 || parseFloat(values.percentage) > 100.0) {
        errors.percentage = I18n.t("percentageRange");
      } else if (props.limits && props.limits.percent && props.limits.percent.maxPercent &&
            parseFloat(values.percentage) > props.limits.percent.maxPercent) {
        errors.percentage = I18n.t("percentageLimit");
      }
    }

    if (props.discountType === DiscountType.Employee && !values.employeeId) {
      errors.employeeId = I18n.t("employeeIdRequired");
    } else if (props.discountType === DiscountType.Coupon && !values.couponCode) {
      errors.couponCode = I18n.t("missingCouponCode");
    } else if (props.discountType === DiscountType.CompetitivePrice) {
      if (!values.competitor) {
        errors.competitor = I18n.t("competitorRequired");
      }

      if (!values.formOfProof) {
        errors.formOfProof = I18n.t("formOfProofRequired");
      }
    }

    return errors;
  },
  onSubmit(data: DiscountForm, dispatch: Dispatch<any>, props: Props): void {
    const cleanedPercent: string = data.percentage && data.percentage.replace(/%/g, "");
    props.onDiscount(
      data.amount,
      cleanedPercent,
      data.couponCode,
      data.employeeId,
      props.discountDisplayLine && props.discountDisplayLine.lineNumber,
      data.competitor,
      data.formOfProof,
      data.otherCompetitor,
      data.otherFormOfProof,
      props.employeeDiscount
    );
  }
})(Discount);

const mapStateToProps = (state: AppState, props: Props): StateProps & Partial<ConfigProps<DiscountForm, Props>> => {
  const selector = formValueSelector("discount");

  return {
    initialValues: {
      amount: props.discountDisplayLine && (props.valueType === ValueType.NewPrice ?
          (props.discountDisplayLine.replacementUnitPrice &&
              props.discountDisplayLine.replacementUnitPrice.amount.amount) :
              props.valueType === ValueType.CompetitivePrice ?
              (props.discountDisplayLine.competitivePrice &&
              props.discountDisplayLine.competitivePrice.amount.amount) :
              (props.discountDisplayLine.amount && props.discountDisplayLine.amount.amount)),
      couponCode: props.discountDisplayLine && props.discountDisplayLine.couponCode,
      percentage: (props.discountDisplayLine && props.discountDisplayLine.percent) || props.employeeDiscountValue ||
          undefined,
      competitor: props.discountType === DiscountType.CompetitivePrice && props.currentCompetitor ?
          props.currentCompetitor: undefined,
      formOfProof: props.discountType === DiscountType.CompetitivePrice && props.currentFormOfProof ?
          props.currentFormOfProof: undefined,
      otherCompetitor: props.discountDisplayLine && props.discountDisplayLine.customCompetitorName,
      otherFormOfProof: props.discountDisplayLine && props.discountDisplayLine.customFormOfProof
    },
    stateValues: state.businessState.stateValues,
    settings: state.settings,
    selectedCompetitor: selector(state, "competitor"),
    selectedFormOfProof: selector(state, "formOfProof")
  };
};

export default connect<StateProps>(mapStateToProps)(DiscountForm);
