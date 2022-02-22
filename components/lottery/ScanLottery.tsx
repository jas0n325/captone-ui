import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  IConfigurationValues,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  CAPTURE_LOTTERY_CODE_EVENT,
  Customer,
  LotteryVoidDescription,
  LotteryVoidReason,
  TenderType,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { CustomerType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  dataEvent,
  DataEventType,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  DataEventState,
  SettingsState,
  UiState
} from "../../reducers";
import { UI_MODE_WAITING_FOR_INPUT } from "../../reducers/uiState";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { renderInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import { printAmount } from "../common/utilities";
import { warnBeforeLosingChanges } from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationProp } from "../StackNavigatorParams";
import CapturedLotteryLine from "./CapturedLotteryLine";
import { ScanLotteryProps } from "./interfaces";
import { scanLotteryStyle } from "./styles";

interface LotteryForm {
  lotteryCode: string;
}
interface DispatchProps {
  businessOperation: ActionCreator;
  dataEventSuccess: ActionCreator;
  updateUiMode: ActionCreator;
}
interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
  incomingDataEvent: DataEventState;
  uiState: UiState;
  currentSceneName: string;
  i18nLocation: string;
}

interface State {
  lotteryCode: string;
  isEditMode: boolean;
  scannedLotteryCode: string;
  isDataScanned: boolean;
}

interface Props extends ScanLotteryProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

class ScanLottery extends React.Component<
  Props &
    InjectedFormProps<LotteryForm, Props> &
    FormInstance<LotteryForm, Props>,
  State
> {
  private styles: any;

  public constructor(
    props: Props &
      InjectedFormProps<LotteryForm, Props> &
      FormInstance<LotteryForm, Props>
  ) {
    super(props);
    this.styles = Theme.getStyles(scanLotteryStyle());
    this.state = {
      lotteryCode: undefined,
      isEditMode: false,
      scannedLotteryCode: undefined,
      isDataScanned: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_WAITING_FOR_INPUT);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (
      this.props.incomingDataEvent &&
      this.props.incomingDataEvent.eventType === DataEventType.ScanData &&
      this.props.uiState.mode === UI_MODE_WAITING_FOR_INPUT
    ) {
      const incomingLotteryCode =
        this.props.incomingDataEvent &&
        this.props.incomingDataEvent.data &&
        this.props.incomingDataEvent.data.data;

      if (incomingLotteryCode) {
        if (this.state.scannedLotteryCode !== incomingLotteryCode) {
          this.props.change("lotteryCode", incomingLotteryCode);
          this.setState({ scannedLotteryCode: incomingLotteryCode });
        }
        // Clear the props
        this.props.dataEventSuccess(this.props.incomingDataEvent, false);
      } else if (
        this.state.scannedLotteryCode &&
        this.state.isEditMode &&
        !this.state.isDataScanned
      ) {
        this.setState({ ...this.state, isDataScanned: true });
      } else if (this.state.scannedLotteryCode && this.props.valid) {
        this.props.handleSubmit(this.saveLottery)();
        this.setState({
          ...this.state,
          scannedLotteryCode: undefined,
          isDataScanned: false
        });
      } else if (this.state.scannedLotteryCode && this.props.invalid) {
        this.props.touch("lotteryCode");
        if (this.state.isDataScanned) {
          this.setState({
            ...this.state,
            scannedLotteryCode: undefined,
            isDataScanned: false
          });
        }
      }
    }

    this.handleProceesedEvent(prevProps);
    this.editLotteryCode();
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const { handleSubmit } = this.props;
    const isTaxLotteryApplicable = this.isTaxLotteryApplicable();
    return (
      <BaseView style={this.styles.fill}>
        <Header
          title={I18n.t("lottery")}
          backButton={{
            name: "Back",
            action: () =>
              warnBeforeLosingChanges(this.props.dirty, this.props.onExit)
          }}
          rightButton={
            isTaxLotteryApplicable
              ? {
                  title:
                    this.capturedLottery() && !this.props.dirty
                      ? I18n.t("edit")
                      : undefined,
                  action: () => this.enableEditMode()
                }
              : {
                  title: I18n.t("okCaps"),
                  action: this.props.onExit
                }
          }
        />
        <View style={this.styles.root}>
          {((isTaxLotteryApplicable && !this.capturedLottery()) ||
            this.state.isEditMode) && (
            <View>
              <Field
                name="lotteryCode"
                component={renderInputField}
                overrideOnSubmitEditing={handleSubmit(this.saveLottery)}
                style={this.styles.inputPanel}
                inputStyle={this.styles.inputField}
                cameraIcon={{
                  icon: "Camera",
                  size: this.styles.cameraIcon.fontSize,
                  color: this.styles.cameraIcon.color,
                  position: "right",
                  style: this.styles.cameraIconPanel
                }}
                placeholder={I18n.t("lotteryCode")}
                placeholderSentenceCase={false}
                settings={this.props.settings}
                errorStyle={this.styles.inputError}
                showCamera={true}
                inputType={InputType.text}
                returnKeyType={"done"}
                autoCapitalize={"none"}
              />
              <View style={this.styles.lotteryLabelsEditMode}>
                {this.lotteryRequirements()}
              </View>
            </View>
          )}
          {isTaxLotteryApplicable &&
            this.capturedLottery() &&
            !this.state.isEditMode && (
              <View>
                <View style={this.styles.taxLotteryHeader}>
                  <Text style={this.styles.appliedTitle}>
                    {I18n.t("applied")}
                  </Text>
                </View>
                <FlatList
                  data={[this.capturedLottery()]}
                  renderItem={({ item }) => <CapturedLotteryLine lotteryCode={item} onVoid={this.voidLotteryCode} />}
                />
              </View>
            )}
          {!isTaxLotteryApplicable && (
            <View style={this.styles.infoCautionPanel}>
              <View style={this.styles.cautionIconPadding}>
                <VectorIcon
                  name="Information"
                  fill={this.styles.infoCautionIcon.color}
                  height={this.styles.infoCautionIcon.fontSize}
                />
              </View>
              <View style={this.styles.cautionText}>
                <Text>{I18n.t("lotteryNotQualifiedTransaction")}</Text>
              </View>
            </View>
          )}
          {Theme.isTablet && (
            <View style={this.styles.actions}>
              {this.capturedLottery() && !this.props.dirty && (
                <TouchableOpacity
                  style={[
                    this.styles.btnPrimary,
                    this.styles.button,
                    this.styles.editButton
                  ]}
                  onPress={() => this.enableEditMode()}
                >
                  <Text style={[this.styles.btnPrimaryText]}>
                    {I18n.t("edit")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.button]}
                onPress={() =>
                  warnBeforeLosingChanges(this.props.dirty, this.props.onExit)
                }
              >
                <Text style={this.styles.btnSecondayText}>
                  {I18n.t("cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BaseView>
    );
  }

  private lotteryRequirements = (): JSX.Element => {
    const formattedMinimumPurchaseAmount =
      this.getFormattedMinimumPurchaseAmount();
    const formattedEligibleTenders = this.getFormattedEligibleTenders();
    return (
      <View>
        <Text style={this.styles.btnWarningHeader}>
          {I18n.t("requirements")}
        </Text>
        <View style={this.styles.lotteryRequirement}>
          <VectorIcon
            name="Bullet"
            fill={this.styles.bulletIcon.color}
            height={this.styles.bulletIcon.fontSize}
          />
          <Text style={this.styles.btnWarningText}>
            {I18n.t("personalCustomer")}
          </Text>
        </View>
        {formattedMinimumPurchaseAmount && (
          <View style={this.styles.lotteryRequirement}>
            <VectorIcon
              name="Bullet"
              fill={this.styles.bulletIcon.color}
              height={this.styles.bulletIcon.fontSize}
            />
            <Text style={this.styles.btnWarningText}>
              {I18n.t("minimumAmount", {
                minimumPurchaseAmountRequired: formattedMinimumPurchaseAmount
              })}
            </Text>
          </View>
        )}
        <View style={this.styles.lotteryRequirement}>
          <VectorIcon
            name="Bullet"
            fill={this.styles.bulletIcon.color}
            height={this.styles.bulletIcon.fontSize}
          />
          <Text style={this.styles.btnWarningText}>
            {I18n.t("excludesInvoice")}
          </Text>
        </View>
        {formattedEligibleTenders && (
          <View style={this.styles.lotteryRequirement}>
            <VectorIcon
              name="Bullet"
              fill={this.styles.bulletIcon.color}
              height={this.styles.bulletIcon.fontSize}
            />
            <Text
              style={[
                this.styles.btnWarningText,
                this.styles.tenderTextSpacing
              ]}
            >
              {I18n.t("eligibleTendersForLottery", {
                allEligibleTenders: formattedEligibleTenders
              })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  private getFormattedMinimumPurchaseAmount = (): string => {
    const i18nLocation = this.props.i18nLocation;
    const taxationConfig: IConfigurationValues =
      this.props.settings.configurationManager.getI18nCountryConfigValues(
        i18nLocation
      ).taxation;
    const minimumPurchaseAmountRequired =
      taxationConfig &&
      taxationConfig.taxLottery &&
      taxationConfig.taxLottery.minimumPurchaseAmountRequired;
    if (minimumPurchaseAmountRequired) {
      const accountingCurrency: string =
        this.props.businessState.stateValues.get(
          "transaction.accountingCurrency"
        );
      return printAmount(
        new Money(minimumPurchaseAmountRequired, accountingCurrency)
      );
    }
    return undefined;
  };

  private getFormattedEligibleTenders = (): string => {
    const configurationManager = this.props.settings?.configurationManager;
    const tenderDefinitions =
      configurationManager?.getTendersValues()?.tenderDefinitions;
    const tenderAuthCategoryDefinitions =
      configurationManager?.getTendersValues()?.tenderAuthCategoryDefinitions;
    const eligibleTenders: string[] = [];
    if (tenderDefinitions) {
      tenderDefinitions.forEach((tender: TenderType) => {
        const tenderAuthCategory = tender.tenderAuthCategory;
        if (tenderAuthCategory === "None") {
          if (
            !tender.hasOwnProperty("eligibleForTaxLottery") ||
            tender.eligibleForTaxLottery
          ) {
            eligibleTenders.push(tender.tenderName);
          }
        } else if (
          tenderAuthCategoryDefinitions &&
          (!tenderAuthCategoryDefinitions[tenderAuthCategory] ||
            !tenderAuthCategoryDefinitions[tenderAuthCategory].hasOwnProperty(
              "eligibleForTaxLottery"
            ) ||
            tenderAuthCategoryDefinitions[tenderAuthCategory]
              .eligibleForTaxLottery)
        ) {
          eligibleTenders.push(tender.tenderName);
        }
      });
    }
    return eligibleTenders.join(", ");
  };

  private saveLottery = (data: LotteryForm): void => {
    if (data && data.lotteryCode) {
      const uiInputs: UiInput[] = [];
      uiInputs.push(new UiInput(UiInputKey.LOTTERY_CODE, data.lotteryCode));
      this.props.businessOperation(
        this.props.settings.deviceIdentity,
        CAPTURE_LOTTERY_CODE_EVENT,
        uiInputs
      );
    }
  };

  private voidLotteryCode = (): void => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(
      new UiInput(UiInputKey.VOID_REASON, LotteryVoidReason.VOIDED_BY_USER)
    );
    uiInputs.push(
      new UiInput(
        UiInputKey.VOID_REASON_DESC,
        LotteryVoidDescription.VOIDED_BY_USER
      )
    );
    uiInputs.push(new UiInput(UiInputKey.VOID_LOTTERY_CODE, true));
    this.props.businessOperation(
      this.props.settings.deviceIdentity,
      CAPTURE_LOTTERY_CODE_EVENT,
      uiInputs
    );
  };

  private capturedLottery = (): string => {
    return (
      (this.props.businessState &&
        this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get(
          "transaction.taxLotteryCustomerCode"
        )) ||
      undefined
    );
  };

  private enableEditMode = (): void => {
    this.setState({
      lotteryCode:
        this.props.businessState &&
        this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get(
          "transaction.taxLotteryCustomerCode"
        ),
      isEditMode: true
    });
  };

  private editLotteryCode = (): void => {
    if (this.state.isEditMode && !this.props.dirty) {
      this.props.change("lotteryCode", this.state.lotteryCode);
    }
  };

  private isTaxLotteryApplicable = (): boolean => {
    const customer: Customer =
      this.props.businessState &&
      this.props.businessState.stateValues &&
      this.props.businessState.stateValues.get("transaction.customer");
    return !(customer && customer.customerType === CustomerType.Business);
  };

  private handleProceesedEvent = (prevProps: Props): void => {
    const lotteryCodeInput: UiInput =
      this.props.businessState.inputs &&
      this.props.businessState.inputs.find(
        (input) => input.inputKey === UiInputKey.LOTTERY_CODE
      );
    const lotteryCode: string = lotteryCodeInput && lotteryCodeInput.inputValue;
    if (
      lotteryCode &&
      prevProps.businessState.inProgress &&
      this.props.businessState.eventType === CAPTURE_LOTTERY_CODE_EVENT &&
      !this.props.businessState.inProgress
    ) {
      this.setState({ lotteryCode: undefined, isEditMode: false });
      this.props.onExit();
    }
  };
}

const lotteryForm = reduxForm<LotteryForm, Props>({
  form: "scanLottery",
  initialValues: { lotteryCode: undefined },
  validate: (values: LotteryForm, props: Props) => {
    const errors: { lotteryCode: string } = { lotteryCode: undefined };
    if (!values.lotteryCode) {
      errors.lotteryCode = I18n.t("required", { field: I18n.t("lotteryCode") });
    } else if (props.settings.configurationManager) {
      const i18nLocation = props.i18nLocation;
      const taxationConfig: IConfigurationValues =
        props.settings.configurationManager.getI18nCountryConfigValues(
          i18nLocation
        ).taxation;
      if (taxationConfig && taxationConfig.taxLottery) {
        const maxLength: number = taxationConfig.taxLottery.maxLength;
        const minLength: number = taxationConfig.taxLottery.minLength;
        validateLotteryCodeLength(
          values.lotteryCode,
          minLength,
          maxLength,
          errors
        );

        const validationExpression: string =
          taxationConfig.taxLottery.validationExpression;
        if (
          validationExpression &&
          !values.lotteryCode.match(new RegExp(validationExpression))
        ) {
          errors.lotteryCode = I18n.t("lotteryCodeInvalid", {
            field: I18n.t("lotteryCode")
          });
        }
      }
    }
    return errors;
  }
})(ScanLottery);

function validateLotteryCodeLength(
  lotteryCode: string,
  minLength: number,
  maxLength: number,
  errors: { lotteryCode: string }
): void {
  if (
    minLength &&
    maxLength &&
    minLength === maxLength &&
    lotteryCode.length !== minLength
  ) {
    errors.lotteryCode = I18n.t("lotteryCodeInvalidLength", {
      length: minLength
    });
  } else if (
    minLength &&
    maxLength &&
    !(lotteryCode.length >= minLength && lotteryCode.length <= maxLength)
  ) {
    errors.lotteryCode = I18n.t("lotteryCodeInvalidLengthForRange", {
      minLength,
      maxLength
    });
  } else if (minLength && !maxLength && lotteryCode.length < minLength) {
    errors.lotteryCode = I18n.t("lotteryCodeInvalidMinLength", { minLength });
  } else if (!minLength && maxLength && lotteryCode.length > maxLength) {
    errors.lotteryCode = I18n.t("lotteryCodeInvalidMaxLength", { maxLength });
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    settings: state.settings,
    uiState: state.uiState,
    incomingDataEvent: state.dataEvent,
    currentSceneName: getCurrentRouteNameWithNavigationRef(),
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<StateProps, DispatchProps, Omit<Props, keyof (StateProps & DispatchProps)>>(mapStateToProps, {
  businessOperation: businessOperation.request,
  dataEventSuccess: dataEvent.success,
  updateUiMode: updateUiMode.request
})(lotteryForm);
