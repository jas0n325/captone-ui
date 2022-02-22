import _ from "lodash";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";
import { isEmail } from "validator";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  AddressFormatConfig,
  CountryAddressFormat,
  CountryAddressFormatKeys,
  CountryAddressUsageKeys,
  Customer,
  getAddressFormatorDefault,
  PhoneCountryCode,
  PhoneFormatConfig,
  UiInputKey,
  UPDATE_CONTACT_EVENT,
  Usage
} from "@aptos-scp/scp-component-store-selling-features";
import { IAddress, ICustomer, IFulfillmentGroup, IOrder, IPerson } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  emailVerificationWarningAction,
  loadVerifyAddressAction,
  sceneTitle
} from "../../actions";
import { AppState, BusinessState, CustomerState, RetailLocationsState, SettingsState } from "../../reducers";
import { IVerifyAddressState } from "../../reducers/addressVerification";
import { IEmailVerificationState } from "../../reducers/emailVerification";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { validateAllowedContent } from "../common/customInputs/RestrictedContentInput";
import { renderOptionsSelect, renderRestrictedContentInputField, RenderSelectOptions, renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { handleFormSubmission, warnBeforeLosingChanges } from "../common/utilities";
import {
  asyncValidateEmailAddress,
  getCurrentPhoneCountryCode,
  validatePhoneNumberForAddress
} from "../common/utilities/addressUtils";
import {
  getAdvanceAddressVerification,
  getCountryFormatUsingCountryCode,
  getPostalCodeAllowedContentErrorCode,
  loadCountries
} from "../customer/CustomerUtilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { getAddressInitialValue, getDefaultCountryCode } from "./constants";
import { OrderDeliveryAddressScreenProps } from "./interfaces";
import { customerAddUpdateStyle } from "./styles";

interface OrderDeliveryAddressForm {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  phoneCountryCode: string;
  address1: string;
  address2: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
}

interface StateProps {
  businessState: BusinessState;
  customer: CustomerState;
  settings: SettingsState;
  contact: ICustomer | IPerson;
  initialValues: OrderDeliveryAddressForm;
  updatedEmailVerificationWarningMessage: IEmailVerificationState;
  verifyAddressState: IVerifyAddressState;
  deviceIdentity: DeviceIdentity;
  retailLocations: RetailLocationsState;
  i18nLocation: string;
}

interface DispatchProps {
  sceneTitle: ActionCreator;
  loadVerifyAddress: ActionCreator;
  emailVerificationWarningMessage: ActionCreator;
  performBusinessOperation: ActionCreator;
}

interface Props extends OrderDeliveryAddressScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"orderDeliveryAddressConfirmation"> {}

interface State {
  country: RenderSelectOptions;
  countries: RenderSelectOptions[];
  state: RenderSelectOptions;
  states: RenderSelectOptions[];
  showDropDown: boolean;
  phoneCountryCode: PhoneCountryCode;
  hasAddressValue: boolean;
  searchNavigationFlag: boolean;
  addresses: AddressFormatConfig;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.customer.OrderDeliveryAddress");

const nextFieldMap = new Map<string, string>([
  ["init", "lastName"],
  ["lastName", "firstName"],
  ["firstName", "emailAddress"],
  ["emailAddress", "phoneNumber"],
  ["phoneNumber", "address1"],
  ["address1", "address2"],
  ["address2", "city"],
  ["city", "stateOrProvince"],
  ["stateOrProvince", "postalCode"],
  ["postalCode", undefined]
]);

type OrderDeliveryAddressFormProps = Props & InjectedFormProps<OrderDeliveryAddressForm, Props> &
    FormInstance<OrderDeliveryAddressForm, Props>;

const DEFAULT: string = "Default";

class OrderDeliveryAddress extends React.Component<OrderDeliveryAddressFormProps, State> {
  private styles: any;
  private testID: string;

  private deliveryFormRefs: any = {
    lastName: undefined,
    firstName: undefined,
    emailAddress: undefined,
    phoneNumber: undefined,
    address1: undefined,
    address2: undefined,
    city: undefined,
    stateOrProvince: undefined,
    postalCode: undefined
  };
  private debounceTimer: ReturnType<typeof  setTimeout>;

  public constructor(props: OrderDeliveryAddressFormProps) {
    super(props);
    const i18nLocation = props.i18nLocation;

    const phoneFormats: PhoneFormatConfig = props.settings.configurationManager.getI18nPhoneFormats();
    const defaultPhoneCountryCode: PhoneCountryCode = getCountryFormatUsingCountryCode(phoneFormats, i18nLocation);
    const contactCountryCode: PhoneCountryCode = getCurrentPhoneCountryCode(props.contact,
        props.settings.configurationManager, i18nLocation);

    this.testID = "OrderDeliveryAddress";

    if (!props.contact && !this.handleOrderDeliveryForStoreCountry()) {
      props.initialValues.address1 = undefined;
      props.initialValues.address2 = undefined;
      props.initialValues.city = undefined;
      props.initialValues.stateOrProvince = undefined;
      props.initialValues.postalCode = undefined;
      props.initialValues.countryCode = undefined;
    }

    let countryCode = props.initialValues?.countryCode;

    if (!countryCode) {
      countryCode = getDefaultCountryCode(props.settings.configurationManager, i18nLocation);
    }

    this.state = {
      country: {
        code: countryCode,
        description: countryCode
      },
      countries: undefined,
      showDropDown: false,
      phoneCountryCode: contactCountryCode || defaultPhoneCountryCode,
      state: {
        code: props.initialValues.stateOrProvince,
        description: props.initialValues.stateOrProvince
      },
      states: undefined,
      hasAddressValue: !!props.initialValues.address1,
      searchNavigationFlag: false,
      addresses: undefined
    };

    this.styles = Theme.getStyles(customerAddUpdateStyle());

    this.handleMoveToCountryPhoneCode = this.handleMoveToCountryPhoneCode.bind(this);
    this.changeCountry = this.changeCountry.bind(this);
    this.onAddressFocus = this.onAddressFocus.bind(this);
  }

  public componentDidMount(): void {
    (async () => {
      const countries = await loadCountries(this.props.settings.diContainer);

      if (countries?.length) {
        const countryAddressFormat: AddressFormatConfig =
            this.props.settings.configurationManager.getI18nAddressFormats();

        if (!this.state.addresses) {
          this.setState({addresses: countryAddressFormat});
        }

        const customerCountry = countries.find((country) => {
          for (const countryKey in countryAddressFormat) {
            if (countryKey === this.props?.i18nLocation &&
                countryAddressFormat[countryKey]?.countryCode === country.code) {
              return true;
            }
          }
          return false;
        });

        this.setState((prevState: State) => ({
          countries,
          country: prevState.country || customerCountry
        }));
      }
    })().catch((error) => {
      throw logger.throwing(error, "loadCustomerFormData", LogLevel.WARN);
    });
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress && !this.props.businessState.error) {
      if (this.props.businessState.eventType === UPDATE_CONTACT_EVENT) {
        this.props.onContinue();
      }
    }
  }

  public getSnapshotBeforeUpdate(prevProps: Props, prevState: State): void {
    if (this.props.settings && !_.isEqual(prevProps.verifyAddressState, this.props.verifyAddressState)) {
      this.updateStateOfAddressField();
      this.setState({
        hasAddressValue: true,
        showDropDown: false,
        searchNavigationFlag: false
      });
    }

    if (!this.state.searchNavigationFlag || !this.props.verifyAddressState.address.addressLine1) {
      return null;
    }
    this.setState({ searchNavigationFlag: false, hasAddressValue: true, showDropDown: false }, () => {
      this.updateStateOfAddressField();
    });
    return null;
  }

  public render(): React.ReactNode {
    const extraScrollHeight = 90;
    return (
      <BaseView style={this.styles.fill}>
        <Header
          testID={this.testID}
          isVisibleTablet={true}
          title={I18n.t("delivery")}
          backButton={{
            name: "Back",
            action: () => warnBeforeLosingChanges(!!this.props.dirty, this.props.onCancel)
          }}
          rightButton={{
            title: I18n.t("continue"),
            action: () => handleFormSubmission(logger, this.props.submit)
            }
          }
        />
        { this.props.settings &&
          <KeyboardAwareScrollView style={[this.styles.addressArea, this.styles.formArea]} extraScrollHeight={extraScrollHeight} keyboardShouldPersistTaps={"always"}>
            { this.renderField("lastName", (ref: any) => this.deliveryFormRefs.lastName = ref) }
            { this.renderField("firstName", (ref: any) => this.deliveryFormRefs.firstName = ref) }
            { this.renderEmail() }
            { this.renderPhoneNumberField() }
            <View style={this.styles.subtitleArea}>
              <Text
                style={this.styles.subtitleText}
                testID={`${this.testID}-address-label`}>
                {I18n.t("address")}
              </Text>
            </View>
            { this.renderCountry() }
            { this.renderAddressFields() }
          </KeyboardAwareScrollView>
        }
      </BaseView>
    );
  }

  private renderEmail(): React.ReactNode {
    const name = "emailAddress";
    return (
      <>
        <Field
          name={name}
          onRef={(ref: any) => this.deliveryFormRefs.emailAddress = ref}
          testID={`${this.testID}-${name}`}
          placeholder={I18n.t("email")}
          style={this.styles.textInput}
          inputStyle={{}}
          keyboardType="email-address"
          component={renderTextInputField}
          persistPlaceholder={true}
          errorStyle={this.styles.textInputError}
          onSubmitEditing={() => this.focusNextField(name)}
        />
        {
          this.props.updatedEmailVerificationWarningMessage &&
          this.props.updatedEmailVerificationWarningMessage.message !== undefined &&
          this.props.updatedEmailVerificationWarningMessage.message.length > 0 &&
          <Text key="emailWarning" style={this.styles.textInputWarning}>
            { this.props.updatedEmailVerificationWarningMessage.message }
          </Text>
        }
      </>
    );
  }

  private renderField(name: string, onRef: (ref: any) => void, placeholder?: string,
                      isUsed?: boolean): React.ReactNode {
    return (
      <React.Fragment>
        {(isUsed ?? true) &&
          <Field
              name={name}
              testID={`${this.testID}-${name}`}
              onRef={onRef}
              placeholder={placeholder || I18n.t(name)}
              autoCapitalize="words"
              style={this.styles.textInput}
              component={renderTextInputField}
              errorStyle={this.styles.textInputError}
              onSubmitEditing={() => this.focusNextField(name)}
              persistPlaceholder
          />
        }
      </React.Fragment>
    );
  }

  private renderPhoneNumberField = (): JSX.Element => {
    const callingCode = this.state.phoneCountryCode && this.state.phoneCountryCode.callingCode;
    const name = "phoneNumber";
    return (
      <View style={this.styles.phoneNumberRow}>
        <TouchableOpacity
          style={[this.styles.controlsRow, this.styles.phoneNumberCode]}
          onPress={this.handleMoveToCountryPhoneCode}
        >
          <View style={this.styles.container}>
            <Text style={this.styles.placeholderLabelText}> </Text>
            <Text>
              { callingCode && !callingCode.startsWith("+") && "+" }
              { callingCode }
            </Text>
          </View>
        </TouchableOpacity>
        <Field
          name={name}
          testID={`${this.testID}-${name}`}
          onRef={(ref: any) => this.deliveryFormRefs.phoneNumber = ref}
          placeholder={I18n.t(name)}
          style={{...this.styles.textInput, ...this.styles.phoneNumber}}
          errorStyle={this.styles.textInputError}
          keyboardType="phone-pad"
          returnKeyType={"done"}
          component={renderTextInputField}
          persistPlaceholder={true}
          onSubmitEditing={() => this.focusNextField(name)}
        />
      </View>
    );
  }

  private debounce(fn: (text: string) => void, delay: number): (text: string) => void {
    return (text: string) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        fn(text);
      }, delay);
    };
  }

  private renderCountry(): JSX.Element {
    let selectedCountry: RenderSelectOptions;

    if (this.state.country?.code && this.state.country?.description && this.state.countries?.length) {
      if (this.handleOrderDeliveryForStoreCountry()) {
        if (this.state.countries) {
          selectedCountry = this.state.countries.find((country) => {
            if (this.props.retailLocations.retailLocation.address.countryCode === country.code) {
              return country;
            } else if (this.props.retailLocations.retailLocation.address.countryCode.length !== country.code.length && this.state.addresses) {
              if (this.state.addresses[this.props.retailLocations.retailLocation.address.countryCode].countryCode === country.code) {
                return country;
              }
            }
          });
        }

        if (this.state.country.code && this.state.addresses && (this.props.retailLocations.retailLocation.address.countryCode === this.state.country.code ||
            (this.state.addresses[this.props.retailLocations.retailLocation.address.countryCode]
                && this.state.addresses[this.props.retailLocations.retailLocation.address.countryCode].countryCode === this.state.country.code))) {
          selectedCountry = selectedCountry ? selectedCountry : this.state.country;
        } else if (((this.state.country.code && this.props.retailLocations.retailLocation.address.countryCode
            !== this.state.country.code) && (this.state.countries)) || (this.state.countries)) {
          if (selectedCountry) {
            this.changeCountry(selectedCountry);
          }
        }
        return this.renderSelect("countryCode", "country", selectedCountry, this.state.countries, this.changeCountry);
      }
      return this.renderSelect("countryCode", "country", this.state.country, this.state.countries, this.changeCountry);
    }
  }

  private updateStateOfAddressField(): void {
    this.props.change("address1", this.props.verifyAddressState.address.addressLine1);
    this.props.change("address2", this.props.verifyAddressState.address.addressLine2);
    this.props.change("city", this.props.verifyAddressState.address.city);
    this.props.change("stateOrProvince", this.props.verifyAddressState.address.state);
    this.props.change("postalCode", this.props.verifyAddressState.address.postalCode);
    if (this.props.verifyAddressState["countryCode"]) {
      this.props.change("countryCode", this.props.verifyAddressState["countryCode"]);
    }
  }

  private changeCountry(newValue: RenderSelectOptions): void {
    this.setState({
      country: newValue,
      showDropDown: false,
      hasAddressValue: false
    }, () => {
      this.props.change("countryCode", newValue.code);
      this.props.change("address1", "");
      this.props.change("address2", "");
      this.props.change("city", "");
      this.props.change("stateOrProvince", "");
      this.props.change("postalCode", "");
    });
  }

  private preventAddressPage(flag: boolean): void {
    this.setState({hasAddressValue: flag});
  }

  private onAddressFocus(): void {
    let customerCountry: RenderSelectOptions;
    const i18nLocation = this.props.i18nLocation;
    if (this.state.country) {
      customerCountry = this.state.country;
    } else if (i18nLocation && i18nLocation !== DEFAULT &&
               this.state.countries && !_.isEmpty(this.state.countries)) {
      const addressFormatConfig = getAddressFormatorDefault(this.props.settings.configurationManager, i18nLocation,
          i18nLocation);
      customerCountry = this.state.countries.find((country) => {
        for (const countryKey in addressFormatConfig) {
          if (countryKey === i18nLocation && addressFormatConfig[countryKey].countryCode === country.code) {
            return true;
          }
        }
        return false;
      });
    }
    const shouldUseAddressVerification = !this.state.hasAddressValue && customerCountry &&
        getAdvanceAddressVerification(this.props.settings.configurationManager);

    if (shouldUseAddressVerification) {
      this.deliveryFormRefs.address1.blur();
      this.props.sceneTitle("addressSearch", "addressSearch");
      this.props.navigation.push("addressSearch", {
        country: customerCountry,
        onSelectAddressDropdown: this.onSelectAddressDropdown.bind(this),
        placeholder: I18n.t("addressSearch"),
        actionInputBoxStyle: this.styles.inputText,
        address1Change: this.props.change.bind(this),
        preventAddressPage: this.preventAddressPage.bind(this),
        diContainer: this.props.settings.diContainer,
        subtitleArea: this.styles.subtitleArea,
        subtitleText: this.styles.subtitleText,
        onCancel: this.props.onCancel,
        debounce: this.debounce.bind(this),
        isUpdate: false,
        isTaxInfo: false
      });
    }
  }

  private renderAddressFields = (): JSX.Element => {
    const country = this.state.country;
    const addressFormatConfig = getAddressFormatorDefault(
      this.props.settings.configurationManager,
      country?.code || getDefaultCountryCode(this.props.settings.configurationManager, this.props.i18nLocation),
        this.props.i18nLocation
    );
    const isAddressFormatConfigAvailable =
        (key: CountryAddressFormatKeys) => (addressFormatConfig && addressFormatConfig[key]);
    const getFieldLabel = (key: CountryAddressFormatKeys, defaultI18nCode: string) =>
      isAddressFormatConfigAvailable(key) && addressFormatConfig[key].i18nCode ?
          I18n.t(addressFormatConfig[key].i18nCode, { defaultValue: addressFormatConfig[key].default }) :
          I18n.t(defaultI18nCode);
    const name = "address1";
    const isAddressFieldUsed = (key: CountryAddressUsageKeys) => (
        addressFormatConfig && addressFormatConfig[key] !== Usage.NotUsed
    );

    return (
      <React.Fragment>
        {(isAddressFieldUsed(CountryAddressUsageKeys.addressLine1Usage) || !addressFormatConfig) &&
          <Field
            name={name} onRef={(ref: any) => this.deliveryFormRefs.address1 = ref}
            testID={`${this.testID}-${name}`}
            placeholder={getFieldLabel(CountryAddressFormatKeys.addressLine1Label, name)}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField(name)}
            onFocus={this.onAddressFocus}
          />
        }
        {
          this.renderField(
            "address2",
            (ref: any) => this.deliveryFormRefs.address2 = ref,
            getFieldLabel(CountryAddressFormatKeys.addressLine2Label, "address2"),
            (isAddressFieldUsed(CountryAddressUsageKeys.addressLine2Usage) || !addressFormatConfig)
          )
        }
        {
          this.renderField(
            "city",
              (ref: any) => this.deliveryFormRefs.city = ref,
            getFieldLabel(CountryAddressFormatKeys.cityLabel, "city"),
            (isAddressFieldUsed(CountryAddressUsageKeys.cityUsage) || !addressFormatConfig)
          )
        }
        {
          this.renderField(
            "stateOrProvince",
            (ref: any) => this.deliveryFormRefs.stateOrProvince = ref,
            getFieldLabel(CountryAddressFormatKeys.firstAdminDivisionLabel, "state"),
            (isAddressFieldUsed(CountryAddressUsageKeys.firstAdminDivisionUsage) || !addressFormatConfig)
          )
        }
        {
          (isAddressFieldUsed(CountryAddressUsageKeys.postalCodeUsage) || !addressFormatConfig) &&
            <Field
                name={"postalCode"}
                testID={`${this.testID}-postalCode`}
                onRef={(ref: any) => this.deliveryFormRefs.postalCode = ref}
                placeholder={getFieldLabel(CountryAddressFormatKeys.postalCodeLabel, "zipPostalCode") || I18n.t("zipPostalCode")}
                autoCapitalize="characters"
                style={this.styles.textInput}
                component={renderRestrictedContentInputField}
                errorStyle={this.styles.textInputError}
                onSubmitEditing={() => this.focusNextField("postalCode")}
                persistPlaceholder
                allowedContent={addressFormatConfig && addressFormatConfig.postalCodeAllowedContent}
            />
        }
      </React.Fragment>
    );
  }

  private renderSelect(
      name: string,
      placeholder: string,
      selectedOption: RenderSelectOptions,
      options: RenderSelectOptions[],
      onOptionChosen: any
  ): JSX.Element {
    return (
      <Field
        testID={`${this.testID}-${name}`}
        name={name}
        disabled={this.handleOrderDeliveryForStoreCountry()}
        component={renderOptionsSelect}
        placeholder={I18n.t(placeholder)}
        onOptionChosen={onOptionChosen}
        options={options}
        selectedOption={selectedOption}
        scene={placeholder}
      />
    );
  }

  private focusNextField(currentField: string): void {
    const nextField = nextFieldMap.get(currentField);
    if (nextField) {
      if (this.deliveryFormRefs[nextField]) {
        this.deliveryFormRefs[nextField].focus();
      } else {
        this.focusNextField(nextField);
      }
    }
  }

  private handleOrderDeliveryForStoreCountry(): boolean {
    const functionalBehaviorValues = this.props.settings.configurationManager.getFunctionalBehaviorValues();
    const { deliveryOrders } = functionalBehaviorValues?.omniChannelBehaviors.orders;
    if (deliveryOrders) {
      return deliveryOrders.restrictDeliveryToOriginatingRetailLocationCountry;
    }
    return false;
  }

  private handleMoveToCountryPhoneCode(): void {
    this.props.navigation.push("phoneCountryCode", {
      onCancel: () => this.props.navigation.pop(),
      onSelection: (phoneCountryCode: PhoneCountryCode) => this.setState(
        () => ({ phoneCountryCode }),
        () => {
          this.props.change("phoneCountryCode", phoneCountryCode?.secondaryCountryCode);
          this.props.navigation.pop();
        }),
      selectedValue: this.state.phoneCountryCode
    });
  }

  private onSelectAddressDropdown(newValue: string): void {
    const id = newValue.split("&id=")[1];
    this.setState(
        { searchNavigationFlag: true },
        () => this.props.loadVerifyAddress(id, this.state.country.code)
    );
  }
}

const asyncValidate = async (values: OrderDeliveryAddressForm, dispatch: Dispatch<any>, props: Props) => {
  return asyncValidateEmailAddress(values, dispatch, props, logger);
};

const customerShippingForm = reduxForm<OrderDeliveryAddressForm, any>({
  form: "orderDeliveryAddress",
  asyncValidate,
  asyncBlurFields: ["emailAddress"],
  validate: (values: OrderDeliveryAddressForm, props: Props & InjectedFormProps<OrderDeliveryAddressForm, Props> &
      FormInstance<OrderDeliveryAddressForm, Props>) => {
    const errors: {
      lastName: string;
      firstName: string;
      emailAddress: string;
      phoneNumber: string;
      phoneCountryCode: string;
      countryCode: string;
      city: string;
      address1: string;
      stateOrProvince: string;
      postalCode: string;
    } = {
      lastName: undefined,
      firstName: undefined,
      emailAddress: undefined,
      phoneNumber: undefined,
      phoneCountryCode: undefined,
      countryCode: undefined,
      city: undefined,
      address1: undefined,
      stateOrProvince: undefined,
      postalCode: undefined
    };

    let countryAddressFormat: CountryAddressFormat = undefined;
    const countryCode = values.countryCode || getDefaultCountryCode(props.settings.configurationManager, props?.i18nLocation);

    (() => {
      const addressFormats: AddressFormatConfig = props.settings.configurationManager.getI18nAddressFormats();
      const phoneFormats: PhoneFormatConfig = props.settings.configurationManager.getI18nPhoneFormats();

      if (!values.phoneNumber) {
        errors.phoneNumber = I18n.t("required");
      } else {
        const phoneErrors = validatePhoneNumberForAddress(phoneFormats, values.phoneNumber, values.phoneCountryCode);

        errors.phoneNumber = phoneErrors.phoneNumber;
        errors.phoneCountryCode = phoneErrors.countryCode;
      }

      for (const countryKey in addressFormats) {
        if (countryKey === countryCode || addressFormats[countryKey]?.countryCode === countryCode) {
          countryAddressFormat = addressFormats[countryKey];

          const isValidEntry = (validationValue: string, field: string, fieldMinKey: string,
                                fieldMaxKey: string, fieldUsageKey: string) => {
            const valueToValidate = validationValue?.trim();
            const valuesField = values[field]?.trim();
            if (valueToValidate) {
              if (
                  (countryAddressFormat[fieldMinKey] && countryAddressFormat[fieldMinKey] > 0 && !valuesField)
              ) {
                errors[field] = I18n.t("required", { field: I18n.t(field) });
              } else if (
                  (countryAddressFormat[fieldMinKey] &&
                      valuesField && valuesField.length < countryAddressFormat[fieldMinKey]) ||
                  (countryAddressFormat[fieldMaxKey] &&
                      valuesField && valuesField.length > countryAddressFormat[fieldMaxKey])) {
                let characterCount = "";
                if (countryAddressFormat[fieldMinKey] !== undefined &&
                    countryAddressFormat[fieldMaxKey] !== undefined) {
                  characterCount = `${countryAddressFormat[fieldMinKey]} - ${countryAddressFormat[fieldMaxKey]}`;
                } else if (countryAddressFormat[fieldMinKey] !== undefined) {
                  characterCount = countryAddressFormat[fieldMinKey];
                } else if (countryAddressFormat[fieldMaxKey] !== undefined) {
                  characterCount = countryAddressFormat[fieldMaxKey];
                }
                errors[field] = I18n.t("minMaxValidation", { characterCount });
              }
            } else if (countryAddressFormat[fieldUsageKey] === Usage.Required) {
              errors[field] = I18n.t("required", { field: I18n.t(field) });
            }
          };
          isValidEntry(values.address1, "address1", "addressLine1MinLength", "addressLine1MaxLength", "addressLine1Usage");
          isValidEntry(values.address2, "address2", "addressLine2MinLength", "addressLine2MaxLength", "addressLine2Usage");
          isValidEntry(values.city, "city", "cityMinLength", "cityMaxLength", "cityUsage");
          isValidEntry(values.stateOrProvince, "stateOrProvince", "firstAdminDivisionMinLength",
              "firstAdminDivisionMaxLength", "firstAdminDivisionUsage");
          isValidEntry(values.postalCode, "postalCode", "postalCodeMinLength", "postalCodeMaxLength",
              "postalCodeUsage");
          break;
        }
      }
    })();

    if (!values.firstName || !values.firstName.trim()) {
      errors.firstName = I18n.t("required");
    }

    if (!values.lastName || !values.lastName.trim()) {
      errors.lastName = I18n.t("required");
    }

    if (!countryCode) {
      errors.countryCode = I18n.t("required");
    }

    if (!values.emailAddress) {
      errors.emailAddress = I18n.t("required");
    } else if (values.emailAddress && !isEmail(values.emailAddress)) {
      props.emailVerificationWarningMessage("");
      errors.emailAddress = I18n.t("customerCannotBeCreatedEmailAddressInvalidFormat");
    }

    if (values.postalCode && countryAddressFormat &&
        !validateAllowedContent(values.postalCode, countryAddressFormat.postalCodeAllowedContent)) {
      errors.postalCode = I18n.t(getPostalCodeAllowedContentErrorCode(countryAddressFormat.postalCodeAllowedContent));

    }
    return errors;
  },
  onSubmit: (values: OrderDeliveryAddressForm, dispatch: any, props: OrderDeliveryAddressFormProps) => {
    const {
      lastName,
      firstName,
      emailAddress,
      phoneNumber,
      phoneCountryCode,
      countryCode,
      address1,
      address2,
      city,
      stateOrProvince,
      postalCode
    } = values;

    const contact: ICustomer = {
      lastName: lastName?.trim(),
      firstName: firstName?.trim(),
      emailAddress: emailAddress?.trim(),
      phoneCountryCode: phoneCountryCode?.trim(),
      phoneNumber: phoneNumber?.trim(),
      countryCode: countryCode?.trim() || getDefaultCountryCode(props.settings.configurationManager, props.i18nLocation),
      address1: address1?.trim(),
      address2: address2?.trim(),
      city: city?.trim(),
      state: stateOrProvince?.trim(),
      postalCode: postalCode?.trim()
    };

    const uiInputs: UiInput[] = [];

    uiInputs.push(new UiInput(UiInputKey.CONTACT, contact));

    props.performBusinessOperation(props.deviceIdentity, UPDATE_CONTACT_EVENT, uiInputs);
  }
})(OrderDeliveryAddress);

const mapStateToProps = (state: AppState): StateProps => {
  const order: IOrder = state.businessState.stateValues.get("transaction.order");
  if (order && order.fulfillmentGroups) {
    let contact: ICustomer | IPerson;
    let address: IAddress;

    order.fulfillmentGroups.forEach((fulfillmentGroup: IFulfillmentGroup) => {
      if (fulfillmentGroup?.deliveryLocation?.address) {
        address = fulfillmentGroup.deliveryLocation.address;
      }
      if (fulfillmentGroup?.deliveryLocation?.contact) {
        contact = fulfillmentGroup.deliveryLocation.contact;
      }
    });

    if (!address && !contact) {
      const customer: Customer = state.businessState.stateValues.get("transaction.customer");
      if (customer) {
        address = {addressLine1: customer.address1, city: customer.city, countryCode: customer.countryCode, postalCode: customer.postalCode, stateOrProvince: customer.state};
        contact = customer;
      }
    }
    return {
      businessState: state.businessState,
      customer: state.customer,
      settings: state.settings,
      contact,
      initialValues: {
        ...(contact ? {
          firstName: contact.firstName,
          lastName: contact.lastName,
          emailAddress: contact.emailAddress,
          phoneNumber: contact.phoneNumber,
          phoneCountryCode: contact.phoneCountryCode
        } : {
          firstName: undefined,
          lastName: undefined,
          emailAddress: undefined,
          phoneNumber: undefined,
          phoneCountryCode: getCurrentPhoneCountryCode(contact, state.settings.configurationManager, state.i18nLocationState?.i18nLocation)?.secondaryCountryCode
        }),
        ...getAddressInitialValue(address, state.settings.configurationManager, state.i18nLocationState?.i18nLocation)
      },
      deviceIdentity: state.settings.deviceIdentity,
      updatedEmailVerificationWarningMessage: state.emailVerification,
      verifyAddressState: state.verifyAddress,
      retailLocations: state.retailLocations,
      i18nLocation: state.i18nLocationState?.i18nLocation
    };
  }
};

const mapDispatchToProps = {
  sceneTitle: sceneTitle.request,
  loadVerifyAddress: loadVerifyAddressAction.request,
  emailVerificationWarningMessage: emailVerificationWarningAction.request,
  performBusinessOperation: businessOperation.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof customerShippingForm>()(customerShippingForm));
