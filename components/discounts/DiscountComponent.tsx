import _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";

import {
  IConfigurationValues,
  PosBusinessError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  AllowedDiscountTypes,
  APPLY_EMPLOYEE_DISCOUNT_EVENT,
  APPLY_EMPLOYEE_TRANSACTION_DISCOUNT_EVENT,
  checkThresholdAgainstOriginalPrice,
  CollectedDataKey,
  Employee,
  EmployeeValidation,
  EMPLOYEE_DISCOUNT_OVERRIDE_EVENT,
  getEmployeeValidation,
  getValidateEmployee,
  IDiscountAttributeList,
  IDiscountAttributeListDefinition,
  IDiscountDefinition,
  IDiscountDisplayLine,
  IEmployee,
  IEmployeeDiscount,
  IFeatureAccessConfig,
  IInputLimit,
  IItemDisplayLine,
  ILabel,
  InputLimitsAllowedDiscountTypes,
  IReasonCodeDefinitions,
  IReasonCodesConfig,
  ISupervisorCredentials,
  ManualDiscountLevel,
  MANUAL_ITEM_DISCOUNT_EVENT,
  MANUAL_TRANSACTION_DISCOUNT_EVENT,
  MODIFY_MANUAL_DISCOUNT_EVENT,
  MULTI_LINE_EVENT,
  OTHER_COMPETITOR_CODE,
  OTHER_FORM_OF_PROOF_CODE,
  SSF_COMPETITIVE_DISCOUNT_WILL_VOID_PREVIOUS_DISCOUNTS_ON_ITEM_I18N_CODE,
  SSF_EMPLOYEE_IS_NOT_ELIGIBLE_FOR_DISCOUNTS_I18N_CODE,
  SSF_MANUAL_DISCOUNT_COMPETITIVE_PRICE_PRIOR_PRICE_OVERRIDE_I18N_CODE,
  SSF_MANUAL_DISCOUNT_NEW_PRICE_PRIOR_PRICE_OVERRIDE_I18N_CODE,
  SSF_NEW_PRICE_DISCOUNT_WILL_VOID_PREVIOUS_DISCOUNTS_ON_ITEM_I18N_CODE,
  UiInputKey,
  VOID_PRICE_CHANGE_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import {
  DiscountEntryType,
  ManualDiscountType
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  businessOperation,
  dataEvent,
  DataEventType,
  IKeyedData,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  DataEventState,
  SettingsState,
  UiState,
  UI_MODE_WAITING_FOR_INPUT
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import {
  compareRenderSelectOptions,
  RenderSelectOptions
} from "../common/FieldValidation";
import {
  getCurrencyCode,
  getCurrencyMinimumDenomination,
  MinimumDenomination
} from "../common/utilities";
import {
  getConfiguredEmployeeDiscountDisplayText,
  getDiscountDefinition,
  getFeatureAccessConfig
} from "../common/utilities/configurationUtils";
import { NavigationProp } from "../StackNavigatorParams";
import { DiscountLevel, DiscountType } from "./constants";
import Discount, { ValueType } from "./Discount";
import { DiscountComponentProps } from "./interfaces";
import { discountScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
  incomingDataEvent: DataEventState;
  uiState: UiState;
  i18nLocation: string
}

interface DispatchProps {
  alert: AlertRequest;
  dataEventSuccess: ActionCreator;
  updateUiMode: ActionCreator;
  performBusinessOperation: ActionCreator;
}
interface Props extends DiscountComponentProps, DispatchProps, StateProps {
  navigation: NavigationProp
}

interface State {
  reasonCode: RenderSelectOptions;
  currentCompetitor: RenderSelectOptions;
  currentFormOfProof: RenderSelectOptions;
  valueType: ValueType;
  couponCode: string;
  employeeId: string;
  employeeDiscountOverrideEnabled: boolean;
  employeeDiscountOverride: boolean;
  displayEmployeeConfirmation: boolean;
  employeeDiscount: IEmployeeDiscount;
  employeeCustomer: Employee;
}
const manualDiscountLevelToDiscountLevel = new Map<
  ManualDiscountLevel,
  DiscountLevel
>([
  [ManualDiscountLevel.Item, DiscountLevel.Item],
  [ManualDiscountLevel.Transaction, DiscountLevel.Transaction]
]);

class DiscountComponent extends React.PureComponent<Props, State> {
  private reasonCodes: RenderSelectOptions[];
  private reasonListType: string;
  private styles: any;
  private limits: IInputLimit;
  private minimumDenomination: MinimumDenomination;
  private currency: string;
  private checkThresholdAgainstOriginalPrice: boolean;
  private competitors: RenderSelectOptions[];
  private formsOfProof: RenderSelectOptions[];
  private employeeDiscountValue: string;
  private employeeDiscountDisplayText: ILabel;

  // tslint:disable-next-line:cyclomatic-complexity
  constructor(props: Props) {
    super(props);

    let configuredReasonCodes: IReasonCodeDefinitions;
    const featureType: string =
      this.props.discountLevel === DiscountLevel.Item
        ? MANUAL_ITEM_DISCOUNT_EVENT
        : MANUAL_TRANSACTION_DISCOUNT_EVENT;
    const featureConfig = getFeatureAccessConfig(
      this.props.settings.configurationManager,
      featureType
    );
    const discountsConfig =
      this.props.settings.configurationManager.getDiscountsValues();
    const reasonCodeConfigValues: IReasonCodesConfig =
      this.props.settings.configurationManager.getReasonCodesValues() as IReasonCodesConfig;
    if (reasonCodeConfigValues) {
      this.setReasonListType(featureConfig);
      if (this.reasonListType) {
        configuredReasonCodes =
          reasonCodeConfigValues.reasonCodeLists[this.reasonListType]
            .reasonCodeDefinitions;

        this.reasonCodes = Object.keys(configuredReasonCodes)
          .map((aReasonCode: string): RenderSelectOptions => {
            return {
              code: aReasonCode,
              description: configuredReasonCodes[aReasonCode].name
            };
          })
          .sort((reason1, reason2): number => {
            return compareRenderSelectOptions(reason1, reason2);
          });
      }
    }
    const preconfiguredEmployeeOverride =
      featureConfig &&
      featureConfig.preconfiguredOverrides &&
      featureConfig.preconfiguredOverrides.employee;

    let valueType: ValueType;
    if (
      this.props.discountType === DiscountType.NewPrice ||
      (this.props.discountDisplayLine &&
        this.props.discountDisplayLine.replacementUnitPrice)
    ) {
      valueType = ValueType.NewPrice;
    } else if (
      this.props.discountType === DiscountType.CompetitivePrice ||
      (this.props.discountDisplayLine &&
        this.props.discountDisplayLine.competitivePrice)
    ) {
      valueType = ValueType.CompetitivePrice;
    } else if (
      this.props.discountDisplayLine &&
      this.props.discountDisplayLine.amount
    ) {
      valueType = ValueType.Amount;
    } else if (
      this.props.discountType === DiscountType.Employee ||
      (this.props.discountDisplayLine && this.props.discountDisplayLine.percent)
    ) {
      valueType = ValueType.Percent;
    } else {
      valueType = ValueType.Amount;
    }

    let reasonCode: RenderSelectOptions = undefined;
    if (this.props.discountDisplayLine) {
      for (const key in this.reasonCodes) {
        if (
          this.props.discountDisplayLine.reasonCodeDescription ===
          this.reasonCodes[key].description
        ) {
          reasonCode = this.reasonCodes[key];
        }
      }
    }

    if (this.props.discountType !== DiscountType.Employee) {
      this.limits = this.getConfiguredInputLimits(
        featureConfig,
        this.props.discountType
      );
    } else {
      this.employeeDiscountValue = this.getConfiguredEmployeeDiscountValue(
        featureConfig,
        discountsConfig
      );
      this.employeeDiscountDisplayText =
        getConfiguredEmployeeDiscountDisplayText(
          featureConfig,
          discountsConfig
        );
    }
    const employee: IEmployee =
      !!this.props.discountDisplayLine &&
      this.props.businessState.stateValues &&
      this.props.businessState.stateValues.get("transaction.employeeCustomer");

    this.currency = getCurrencyCode(
      this.props.businessState.stateValues,
      this.props.settings.retailLocationCurrency
    );
    this.minimumDenomination = getCurrencyMinimumDenomination(
      this.props.settings.configurationManager,
      this.currency, this.props.i18nLocation
    );

    this.checkThresholdAgainstOriginalPrice =
      checkThresholdAgainstOriginalPrice(
        this.props.settings.configurationManager,
        valueType === ValueType.CompetitivePrice
          ? InputLimitsAllowedDiscountTypes.competitivePrice
          : valueType === ValueType.NewPrice
          ? InputLimitsAllowedDiscountTypes.newPrice
          : undefined
      );

    this.getCompetitivePriceInfoFromConfigs(discountsConfig);

    let currentCompetitor: RenderSelectOptions = undefined;
    let currentFormOfProof: RenderSelectOptions = undefined;
    if (this.props.discountDisplayLine) {
      for (const key in this.competitors) {
        if (
          this.props.discountDisplayLine.competitor ===
          this.competitors[key].description
        ) {
          currentCompetitor = this.competitors[key];
        }
      }
      for (const key in this.formsOfProof) {
        if (
          this.props.discountDisplayLine.formOfProof ===
          this.formsOfProof[key].description
        ) {
          currentFormOfProof = this.formsOfProof[key];
        }
      }
    }

    this.styles = Theme.getStyles(discountScreenStyles());

    this.state = {
      reasonCode,
      currentCompetitor,
      currentFormOfProof,
      couponCode: undefined,
      valueType,
      employeeId: employee && employee.employeeNumber,
      employeeDiscountOverrideEnabled:
        preconfiguredEmployeeOverride &&
        !!preconfiguredEmployeeOverride.valueOverrideSecurityPolicy,
      employeeDiscountOverride: false,
      displayEmployeeConfirmation: false,
      employeeDiscount: undefined,
      employeeCustomer: undefined
    };
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_WAITING_FOR_INPUT);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Discount
          checkThresholdAgainstOriginalPrice={
            this.checkThresholdAgainstOriginalPrice
          }
          discountLevel={this.props.discountLevel}
          discountType={this.props.discountType}
          itemLines={this.props.itemLines}
          discountDisplayLine={this.props.discountDisplayLine}
          showLine={this.props.showLine}
          valueType={this.state.valueType}
          currentReasonCode={this.state.reasonCode}
          reasonCodeOptions={this.reasonCodes}
          incomingCouponCode={this.state.couponCode}
          onChangeValueType={this.handleChangeValueType.bind(this)}
          onSetReasonCode={this.handleSetReasonCode.bind(this)}
          onDiscount={this.handleSubmit.bind(this)}
          onPress={this.onPress.bind(this)}
          onCancel={this.props.onCancel}
          employeeId={this.state.employeeId}
          limits={this.limits}
          currency={this.currency}
          minimumDenomination={this.minimumDenomination}
          competitors={this.competitors}
          formsOfProof={this.formsOfProof}
          currentCompetitor={this.state.currentCompetitor}
          currentFormOfProof={this.state.currentFormOfProof}
          employeeDiscountValue={
            !this.state.employeeDiscountOverride && this.employeeDiscountValue
          }
          employeeDiscountDisplayText={this.employeeDiscountDisplayText}
          preconfiguredEmployeeDiscount={
            this.state.employeeDiscountOverrideEnabled
          }
          displayEmployeeConfirmation={this.state.displayEmployeeConfirmation}
          employeeCustomer={
            (this.props.businessState.stateValues &&
              this.props.businessState.stateValues.get(
                "transaction.employeeCustomer"
              )) ||
            this.state.employeeCustomer
          }
          employeeDiscount={this.state.employeeDiscount}
          navigation={this.props.navigation}
          allowEmployeeDiscountSubmitWithoutPercent={
            this.allowEmployeeDiscountSubmitWithoutPercent
          }
        />
      </BaseView>
    );
  }

  public componentDidUpdate(prevProps: Props): void {
    const shouldHandleDataEvent: boolean =
      this.props.incomingDataEvent &&
      [
        DataEventType.ScanData,
        DataEventType.KeyListenerData,
        DataEventType.KeyedData
      ].indexOf(this.props.incomingDataEvent.eventType) > -1 &&
      this.props.uiState.mode === UI_MODE_WAITING_FOR_INPUT;

    if (shouldHandleDataEvent) {
      const incomingData =
        this.props.incomingDataEvent &&
        this.props.incomingDataEvent.data &&
        (this.props.incomingDataEvent.data.data ||
          (this.props.incomingDataEvent.data as IKeyedData).inputText);

      if (incomingData) {
        if (
          this.props.discountType === DiscountType.Employee &&
          !this.props.discountDisplayLine &&
          this.state.employeeId !== incomingData
        ) {
          this.setState({ employeeId: incomingData });
        } else {
          if (this.state.couponCode !== incomingData) {
            this.setState({ couponCode: incomingData });
          }
        }

        // Clear the props
        this.props.dataEventSuccess(this.props.incomingDataEvent, false);
      }
    }

    if (
      this.props.businessState.eventType !== EMPLOYEE_DISCOUNT_OVERRIDE_EVENT &&
      (this.itemDiscountsChanged(prevProps) ||
        !_.isEqual(
          prevProps.businessState.displayInfo.transactionDiscountDisplayLines,
          this.props.businessState.displayInfo.transactionDiscountDisplayLines
        ))
    ) {
      this.props.onCancel();
    }

    this.handleNewPriceDiscountCantBeApplied(prevProps);
    this.handlePriceOverrideOnNewPriceCompetitivePriceDiscount(prevProps);
    this.handleCompetitiveDiscountCantBeApplied(prevProps);
    this.handleEmployeeDiscountOverride(prevProps);
    this.handleShouldDisplayEmployeeConfirmation(prevProps);
    this.handleEmployeeNotEligibleForDiscounts(prevProps);
  }

  private handleChangeValueType(newValueType: ValueType): void {
    this.setState({ valueType: newValueType });
  }

  private handleSetReasonCode(newReasonCode: RenderSelectOptions): void {
    this.setState({ reasonCode: newReasonCode });
  }

  private handleSubmit(
    amount?: string,
    percent?: string,
    couponCode?: string,
    employeeId?: string,
    modifyDiscountLineNumber?: number,
    competitor?: RenderSelectOptions,
    formOfProof?: RenderSelectOptions,
    otherCompetitor?: string,
    otherFormOfProof?: string,
    employeeDiscount?: IEmployeeDiscount
  ): void {
    let inputs: UiInput[] = [];
    if (this.state.valueType === ValueType.Amount) {
      inputs.push(
        new UiInput(UiInputKey.DISCOUNT_TYPE, ManualDiscountType.AmountOff)
      );
      inputs.push(new UiInput(UiInputKey.AMOUNT, amount));
    } else if (this.state.valueType === ValueType.Percent) {
      inputs.push(
        new UiInput(UiInputKey.DISCOUNT_TYPE, ManualDiscountType.PercentOff)
      );
      inputs.push(new UiInput(UiInputKey.PERCENT, percent));
    } else if (this.state.valueType === ValueType.NewPrice) {
      inputs.push(
        new UiInput(
          UiInputKey.DISCOUNT_TYPE,
          ManualDiscountType.ReplacementUnitPrice
        )
      );
      inputs.push(new UiInput(UiInputKey.NEW_PRICE, amount));
    } else if (this.state.valueType === ValueType.CompetitivePrice) {
      //the discount type is not the kind of discount (Amount, Percent, Loyalty, Employee, CompetitivePrice, etc.);
      // it is how the price is impacted: by subtracting a monetary amount or subtracting an amount based on a
      // percentage or just replacing the original price with a new one.
      inputs.push(
        new UiInput(
          UiInputKey.DISCOUNT_TYPE,
          ManualDiscountType.ReplacementUnitPrice
        )
      );
      inputs.push(new UiInput(UiInputKey.COMPETITIVE_PRICE, amount));
    }
    if (this.state.reasonCode) {
      inputs.push(
        new UiInput(UiInputKey.REASON_CODE, this.state.reasonCode.code)
      );
      inputs.push(
        new UiInput(
          UiInputKey.REASON_DESCRIPTION,
          this.state.reasonCode.description
        )
      );
      inputs.push(
        new UiInput(UiInputKey.REASON_LIST_TYPE, this.reasonListType)
      );
    }
    inputs.push(new UiInput(UiInputKey.COUPON_CODE, couponCode));
    if (this.props.discountType === DiscountType.Employee) {
      this.employeeDiscountInputs(inputs, employeeId, employeeDiscount);
    }

    let eventType: string;
    if (modifyDiscountLineNumber) {
      inputs.push(
        new UiInput(UiInputKey.DISCOUNT_LINE_NUMBER, modifyDiscountLineNumber)
      );
      eventType = MODIFY_MANUAL_DISCOUNT_EVENT;
    } else {
      if (this.props.discountLevel === DiscountLevel.Item) {
        if (this.props.itemLines.length === 1) {
          inputs.push(
            new UiInput("lineNumber", this.props.itemLines[0].lineNumber)
          );
          eventType =
            this.props.discountType === DiscountType.Employee
              ? APPLY_EMPLOYEE_DISCOUNT_EVENT
              : MANUAL_ITEM_DISCOUNT_EVENT;
        } else {
          inputs = [
            new UiInput(
              UiInputKey.UI_BUSINESS_EVENT,
              this.props.discountType === DiscountType.Employee
                ? APPLY_EMPLOYEE_DISCOUNT_EVENT
                : MANUAL_ITEM_DISCOUNT_EVENT
            ),
            new UiInput(
              UiInputKey.LINE_NUMBERS,
              this.props.itemLines.map((itemLine) => itemLine.lineNumber)
            ),
            new UiInput(UiInputKey.UI_INPUTS, inputs)
          ];
          eventType = MULTI_LINE_EVENT;
        }
      } else if (this.props.discountLevel === DiscountLevel.Transaction) {
        if (this.props.discountType === DiscountType.Employee) {
          eventType = APPLY_EMPLOYEE_TRANSACTION_DISCOUNT_EVENT;
        } else {
          eventType = MANUAL_TRANSACTION_DISCOUNT_EVENT;
        }
      }
    }
    if (this.state.employeeDiscountOverride) {
      inputs.push(new UiInput(UiInputKey.EMPLOYEE_DISCOUNT_OVERRIDE, true));
      const supervisor: ISupervisorCredentials =
        this.props.businessState.nonContextualData.get(
          CollectedDataKey.QualifiedUserRestriction
        );
      if (supervisor) {
        inputs.push(new UiInput(UiInputKey.SUPERVISOR_OVERRIDE, supervisor));
      }
    } else if (
      this.props.discountType === DiscountType.Employee &&
      eventType !== MODIFY_MANUAL_DISCOUNT_EVENT
    ) {
      inputs.push(
        new UiInput(
          UiInputKey.DISCOUNT_ENTRY_TYPE,
          DiscountEntryType.Preconfigured
        )
      );
    }

    this.setCompetitivePriceDiscountInformation(
      competitor,
      formOfProof,
      otherCompetitor,
      otherFormOfProof,
      inputs
    );

    this.props.performBusinessOperation(
      this.props.settings.deviceIdentity,
      eventType,
      inputs
    );
  }

  private employeeDiscountInputs(
    inputs: UiInput[],
    employeeId: string,
    employeeDiscount: IEmployeeDiscount
  ): void {
    inputs.push(
      new UiInput(
        UiInputKey.EMPLOYEE_ID,
        !!this.props.discountDisplayLine ? this.state.employeeId : employeeId
      )
    );
    if (this.state.displayEmployeeConfirmation) {
      inputs.push(
        new UiInput(
          UiInputKey.EMPLOYEE_INFORMATION_CONFIRMATION,
          this.state.displayEmployeeConfirmation
        )
      );
    }
    if (employeeDiscount) {
      inputs.push(
        new UiInput(
          UiInputKey.EMPLOYEE_DISCOUNT_VALIDATED,
          employeeDiscount.discountEligible
        )
      );
    }
  }

  private onPress(): void {
    const inputs: UiInput[] = [];
    const employeeDiscountLevel =
      this.props.discountLevel === DiscountLevel.Transaction
        ? MANUAL_TRANSACTION_DISCOUNT_EVENT
        : MANUAL_ITEM_DISCOUNT_EVENT;
    inputs.push(
      new UiInput(UiInputKey.EMPLOYEE_DISCOUNT_EVENT, employeeDiscountLevel)
    );
    this.props.performBusinessOperation(
      this.props.settings.deviceIdentity,
      EMPLOYEE_DISCOUNT_OVERRIDE_EVENT,
      inputs
    );
  }

  private setCompetitivePriceDiscountInformation(
    competitor: RenderSelectOptions,
    formOfProof: RenderSelectOptions,
    otherCompetitor: string,
    otherFormOfProof: string,
    inputs: UiInput[]
  ): void {
    if (competitor) {
      inputs.push(new UiInput(UiInputKey.COMPETITOR, competitor.description));
      inputs.push(new UiInput(UiInputKey.COMPETITOR_CODE, competitor.code));

      if (competitor.code === OTHER_COMPETITOR_CODE && otherCompetitor) {
        inputs.push(
          new UiInput(UiInputKey.CUSTOM_COMPETITOR_NAME, otherCompetitor)
        );
      }
    }

    if (formOfProof) {
      inputs.push(
        new UiInput(UiInputKey.FORM_OF_PROOF, formOfProof.description)
      );
      inputs.push(new UiInput(UiInputKey.FORM_OF_PROOF_CODE, formOfProof.code));

      if (formOfProof.code === OTHER_FORM_OF_PROOF_CODE && otherFormOfProof) {
        inputs.push(
          new UiInput(UiInputKey.CUSTOM_FORM_OF_PROOF, otherFormOfProof)
        );
      }
    }
  }

  private setReasonListType(featureConfig: IFeatureAccessConfig): void {
    if (
      this.props.discountType === DiscountType.NewPrice &&
      featureConfig.reasonCodeListTypeByDiscountType &&
      !_.isNil(featureConfig.reasonCodeListTypeByDiscountType.newPrice)
    ) {
      this.reasonListType =
        featureConfig.reasonCodeListTypeByDiscountType.newPrice;
    } else {
      this.reasonListType = featureConfig.reasonCodeListType;
    }
  }

  private getConfiguredInputLimits(
    configuredFeature: IFeatureAccessConfig,
    discountType: DiscountType
  ): IInputLimit {
    const allowedDiscountTypes = this.getAllowedDiscountTypes(discountType);
    const discountTypeInputLimits: IInputLimit =
      configuredFeature.limits &&
      configuredFeature.limits[allowedDiscountTypes];
    return discountTypeInputLimits;
  }

  private getAllowedDiscountTypes(
    discountType: DiscountType
  ): AllowedDiscountTypes {
    if (discountType === DiscountType.Coupon) {
      return AllowedDiscountTypes.coupon;
    } else if (discountType === DiscountType.Manual) {
      return AllowedDiscountTypes.reasonCode;
    } else if (discountType === DiscountType.NewPrice) {
      return AllowedDiscountTypes.newPrice;
    }
  }

  private handleEmployeeDiscountOverride(prevProps: Props): void {
    if (
      prevProps.businessState.inProgress &&
      !this.props.businessState.inProgress &&
      this.props.businessState.eventType === EMPLOYEE_DISCOUNT_OVERRIDE_EVENT &&
      this.props.businessState.nonContextualData.get(
        CollectedDataKey.EmployeeDiscountOverride
      )
    ) {
      this.setState({ employeeDiscountOverride: true });
    }
  }

  private handleShouldDisplayEmployeeConfirmation(prevProps: Props): void {
    if (
      prevProps.businessState.inProgress &&
      !this.props.businessState.inProgress &&
      this.props.businessState.nonContextualData.get(
        CollectedDataKey.DisplayEmployeeConfirmationScreen
      )
    ) {
      this.setState({
        displayEmployeeConfirmation: true,
        employeeDiscount: this.props.businessState.nonContextualData.get(
          CollectedDataKey.EmployeeDiscount
        ),
        employeeCustomer: this.props.businessState.nonContextualData.get(
          CollectedDataKey.Employee
        )
      });
    }
  }

  private handleCompetitiveDiscountCantBeApplied(prevProps: Props): void {
    const previousDiscountsPreventCompetitiveDiscount: boolean =
      prevProps.businessState.inProgress &&
      !this.props.businessState.inProgress &&
      this.props.businessState.error &&
      (this.props.businessState.error as PosBusinessError).localizableMessage
        .i18nCode ===
        SSF_COMPETITIVE_DISCOUNT_WILL_VOID_PREVIOUS_DISCOUNTS_ON_ITEM_I18N_CODE;

    if (previousDiscountsPreventCompetitiveDiscount) {
      const resubmitCompetitiveDiscount = () => {
        const uiInputs: UiInput[] = [...this.props.businessState.inputs];

        const uiInputsIndex: number = uiInputs.findIndex(
          (input: UiInput) => input.inputKey === UiInputKey.UI_INPUTS
        );
        if (uiInputsIndex !== -1) {
          uiInputs[uiInputsIndex].inputValue.push(
            new UiInput(UiInputKey.ALLOW_VOID_OF_ITEM_DISCOUNTS, true)
          );
        } else {
          uiInputs.push(
            new UiInput(UiInputKey.ALLOW_VOID_OF_ITEM_DISCOUNTS, true)
          );
        }

        this.props.performBusinessOperation(
          this.props.settings.deviceIdentity,
          this.props.businessState.eventType,
          uiInputs
        );
      };

      this.props.alert(
        I18n.t("competitivePriceWarning"),
        I18n.t(
          SSF_COMPETITIVE_DISCOUNT_WILL_VOID_PREVIOUS_DISCOUNTS_ON_ITEM_I18N_CODE
        ),
        [
          { text: I18n.t("cancel"), style: "cancel" },
          {
            text: I18n.t("ok"),
            style: "destructive",
            onPress: resubmitCompetitiveDiscount
          }
        ],
        { cancellable: true, defaultButtonIndex: 0 }
      );
    }
  }

  private handleNewPriceDiscountCantBeApplied(prevProps: Props): void {
    const previousDiscountsPreventNewPriceDiscount: boolean =
      prevProps.businessState.inProgress &&
      !this.props.businessState.inProgress &&
      this.props.businessState.error &&
      (this.props.businessState.error as PosBusinessError).localizableMessage
        .i18nCode ===
        SSF_NEW_PRICE_DISCOUNT_WILL_VOID_PREVIOUS_DISCOUNTS_ON_ITEM_I18N_CODE;

    if (previousDiscountsPreventNewPriceDiscount) {
      const resubmitNewPriceDiscount = () => {
        const uiInputs: UiInput[] = [...this.props.businessState.inputs];

        const uiInputsIndex: number = uiInputs.findIndex(
          (input: UiInput) => input.inputKey === UiInputKey.UI_INPUTS
        );
        if (uiInputsIndex !== -1) {
          uiInputs[uiInputsIndex].inputValue.push(
            new UiInput(UiInputKey.ALLOW_VOID_OF_ITEM_DISCOUNTS, true)
          );
        } else {
          uiInputs.push(
            new UiInput(UiInputKey.ALLOW_VOID_OF_ITEM_DISCOUNTS, true)
          );
        }

        this.props.performBusinessOperation(
          this.props.settings.deviceIdentity,
          this.props.businessState.eventType,
          uiInputs
        );
      };

      this.props.alert(
        I18n.t("newPriceWarning"),
        I18n.t(
          SSF_NEW_PRICE_DISCOUNT_WILL_VOID_PREVIOUS_DISCOUNTS_ON_ITEM_I18N_CODE
        ),
        [
          { text: I18n.t("cancel"), style: "cancel" },
          {
            text: I18n.t("ok"),
            style: "destructive",
            onPress: resubmitNewPriceDiscount
          }
        ],
        { cancellable: true, defaultButtonIndex: 0 }
      );
    }
  }

  private handlePriceOverrideOnNewPriceCompetitivePriceDiscount(
    prevProps: Props
  ): void {
    const previousPriceOverrideOnNewPriceDiscount: boolean =
      prevProps.businessState.inProgress &&
      !this.props.businessState.inProgress &&
      this.props.businessState.error &&
      (this.props.businessState.error as PosBusinessError).localizableMessage
        .i18nCode ===
        SSF_MANUAL_DISCOUNT_NEW_PRICE_PRIOR_PRICE_OVERRIDE_I18N_CODE;

    const previousPriceOverrideOnCompetitivePriceDiscount: boolean =
      prevProps.businessState.inProgress &&
      !this.props.businessState.inProgress &&
      this.props.businessState.error &&
      (this.props.businessState.error as PosBusinessError).localizableMessage
        .i18nCode ===
        SSF_MANUAL_DISCOUNT_COMPETITIVE_PRICE_PRIOR_PRICE_OVERRIDE_I18N_CODE;

    if (
      previousPriceOverrideOnNewPriceDiscount ||
      previousPriceOverrideOnCompetitivePriceDiscount
    ) {
      const voidPriceChange = () => {
        const uiInputs: UiInput[] = [...this.props.businessState.inputs];

        const uiInputsIndex: number = uiInputs.findIndex(
          (input: UiInput) => input.inputKey === UiInputKey.UI_INPUTS
        );
        if (uiInputsIndex !== -1) {
          uiInputs[uiInputsIndex].inputValue.push(
            new UiInput(UiInputKey.ALLOW_VOID_OF_ITEM_DISCOUNTS, true)
          );
        } else {
          uiInputs.push(
            new UiInput(UiInputKey.ALLOW_VOID_OF_ITEM_DISCOUNTS, true)
          );
        }
        // FIXME: DSS-12652 Need to refactor UiBusinessEvent sequencing, price override with the apply new price
        //        discount uiBusinessEvent, rather than needing to submit a new event to void then apply the discount,
        //        this is not currently supported.
        this.props.performBusinessOperation(
          this.props.settings.deviceIdentity,
          VOID_PRICE_CHANGE_LINE_EVENT,
          uiInputs
        );
      };

      this.props.alert(
        I18n.t(
          previousPriceOverrideOnNewPriceDiscount
            ? "newPriceWarning"
            : "competitivePriceWarning"
        ),
        I18n.t(
          previousPriceOverrideOnNewPriceDiscount
            ? SSF_MANUAL_DISCOUNT_NEW_PRICE_PRIOR_PRICE_OVERRIDE_I18N_CODE
            : SSF_MANUAL_DISCOUNT_COMPETITIVE_PRICE_PRIOR_PRICE_OVERRIDE_I18N_CODE
        ),
        [
          { text: I18n.t("cancel"), style: "cancel" },
          { text: I18n.t("ok"), style: "destructive", onPress: voidPriceChange }
        ],
        { cancellable: true, defaultButtonIndex: 0 }
      );
    }
  }

  private handleEmployeeNotEligibleForDiscounts(prevProps: Props): void {
    const employeeNotEligibleForDiscount: boolean =
      (this.props.businessState.eventType === APPLY_EMPLOYEE_DISCOUNT_EVENT ||
        this.props.businessState.eventType ===
          APPLY_EMPLOYEE_TRANSACTION_DISCOUNT_EVENT) &&
      prevProps.businessState.inProgress === true &&
      this.props.businessState.inProgress === false &&
      this.props.businessState.error &&
      (this.props.businessState.error as PosBusinessError).localizableMessage
        .i18nCode === SSF_EMPLOYEE_IS_NOT_ELIGIBLE_FOR_DISCOUNTS_I18N_CODE;
    if (employeeNotEligibleForDiscount) {
      this.props.onCancel();
    }
  }

  private getConfiguredEmployeeDiscountValue(
    featureConfig: IFeatureAccessConfig,
    discountsConfig: IConfigurationValues
  ): string {
    const discountDefinition: IDiscountDefinition = getDiscountDefinition(
      featureConfig,
      discountsConfig
    );
    const configuredDiscountLevel =
      discountDefinition && discountDefinition.discountLevel;
    const discountLevel = manualDiscountLevelToDiscountLevel.get(
      configuredDiscountLevel
    );
    if (discountLevel === this.props.discountLevel) {
      const manualDiscountType =
        discountDefinition && discountDefinition.manualDiscountType;
      const discountValue =
        discountDefinition && discountDefinition.discountValue;
      return manualDiscountType === ManualDiscountType.PercentOff
        ? discountValue
        : undefined;
    }
  }

  private getCompetitivePriceInfoFromConfigs(
    discountsConfig: IConfigurationValues
  ): void {
    if (this.props.discountLevel === DiscountLevel.Item) {
      const mapDiscountAttributesToRenderSelectOption = (
        config: IDiscountAttributeListDefinition,
        key: string
      ): RenderSelectOptions => ({
        code: key,
        description: I18n.t(config.name.i18nCode, {
          defaultValue: config.name.default
        })
      });

      const competitorList: IDiscountAttributeList =
        discountsConfig && discountsConfig.competitorList;
      this.competitors =
        competitorList &&
        Object.keys(competitorList).map((competitorKey: string) =>
          mapDiscountAttributesToRenderSelectOption(
            competitorList[competitorKey],
            competitorKey
          )
        );

      const formOfProofList: IDiscountAttributeList =
        discountsConfig && discountsConfig.formOfProofList;
      this.formsOfProof =
        formOfProofList &&
        Object.keys(formOfProofList).map((formOfProofKey: string) =>
          mapDiscountAttributesToRenderSelectOption(
            formOfProofList[formOfProofKey],
            formOfProofKey
          )
        );
    }
  }

  private get allowEmployeeDiscountSubmitWithoutPercent(): boolean {
    const validateEmployeeNumber: boolean = getValidateEmployee(
      this.props.settings.configurationManager
    );
    const employeeValidation: EmployeeValidation = getEmployeeValidation(
      this.props.settings.configurationManager
    );
    return (
      this.props.discountType === DiscountType.Employee &&
      validateEmployeeNumber &&
      employeeValidation === EmployeeValidation.UseEmployeeValidationService
    );
  }

  private itemDiscountsChanged(prevProps: Props): boolean {
    const prevDiscountLines: IDiscountDisplayLine[] = [];
    prevProps.businessState.displayInfo.itemDisplayLines.forEach(
      (itemDisplayLine: IItemDisplayLine): void => {
        if (
          itemDisplayLine?.discountLines &&
          itemDisplayLine.discountLines.length
        ) {
          prevDiscountLines.push(...itemDisplayLine.discountLines);
        }
      }
    );

    const discountLines: IDiscountDisplayLine[] = [];
    this.props.businessState.displayInfo.itemDisplayLines.forEach(
      (itemDisplayLine: IItemDisplayLine): void => {
        if (
          itemDisplayLine?.discountLines &&
          itemDisplayLine.discountLines.length
        ) {
          discountLines.push(...itemDisplayLine.discountLines);
        }
      }
    );

    return !_.isEqual(prevDiscountLines, discountLines);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    settings: state.settings,
    incomingDataEvent: state.dataEvent,
    uiState: state.uiState,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
};

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  alert: alert.request,
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request,
  dataEventSuccess: dataEvent.success
})(DiscountComponent);
