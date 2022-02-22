import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import {Dispatch} from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";
import { isEmail } from "validator";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  AddressFormat,
  Customer,
  formatAddress,
  getAddressFormatorDefault,
  PhoneCountryCode,
  PhoneFormatConfig,
  UiInputKey,
  UPDATE_CONTACT_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import {
  ICustomer,
  IDeliveryLocation,
  IOrder,
  IPerson
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  emailVerificationWarningAction,
  sceneTitle
} from "../../actions";
import { AppState, BusinessState, CustomerState, SettingsState } from "../../reducers";
import { IEmailVerificationState } from "../../reducers/emailVerification";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { SectionLine } from "../common/SectionLine";
import SectionSubHeader from "../common/SectionSubHeader";
import {
  getTestIdProperties,
  handleFormSubmission,
  warnBeforeLosingChanges
} from "../common/utilities";
import {
  asyncValidateEmailAddress,
  getCurrentPhoneCountryCode,
  validatePhoneNumberForAddress
} from "../common/utilities/addressUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { OrderPickupDetailsScreenProps } from "./interfaces";
import { customerAddUpdateStyle } from "./styles";

interface OrderPickupDetailsForm {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  phoneNumberCountryCode: string;
}

interface StateProps {
  businessState: BusinessState;
  customer: CustomerState;
  settings: SettingsState;
  contact: ICustomer | IPerson;
  deliveryLocation: IDeliveryLocation;
  initialValues: OrderPickupDetailsForm;
  updatedEmailVerificationWarningMessage: IEmailVerificationState;
  deviceIdentity: DeviceIdentity;
  i18nLocation: string;
}

interface DispatchProps {
  sceneTitle: ActionCreator;
  emailVerificationWarningMessage: ActionCreator;
  performBusinessOperation: ActionCreator;
}

interface Props extends OrderPickupDetailsScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"orderPickupDetailsConfirmation"> {}

interface State {
  phoneCountryCode: PhoneCountryCode;
}

const logger: ILogger =
    LogManager.getLogger("com.aptos.storeselling.ui.components.orderFulfillment.OrderPickupDetails");

const nextFieldMap = new Map<string, string>([
  ["init", "lastName"],
  ["lastName", "firstName"],
  ["firstName", "emailAddress"],
  ["emailAddress", "phoneNumber"],
  ["phoneNumber", undefined]
]);

type OrderPickupDetailsFormProps = Props & InjectedFormProps<OrderPickupDetailsForm, Props> &
    FormInstance<OrderPickupDetailsForm, Props>;

class OrderPickupDetails extends React.Component<OrderPickupDetailsFormProps, State> {
  private styles: any;
  private testID: string;

  private pickupFormRefs: any = {
    lastName: undefined,
    firstName: undefined,
    emailAddress: undefined,
    phoneNumber: undefined
  };

  public constructor(props: OrderPickupDetailsFormProps) {
    super(props);

    this.testID = "OrderPickupDetails";
    this.state = {
      phoneCountryCode: getCurrentPhoneCountryCode(this.props.contact,
        this.props.settings.configurationManager,
        this.props.i18nLocation)
    };

    this.styles = Theme.getStyles(customerAddUpdateStyle());

    this.handleMoveToCountryPhoneCode = this.handleMoveToCountryPhoneCode.bind(this);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.businessState.inProgress &&
      prevProps.businessState.inProgress &&
      !this.props.businessState.error &&
      this.props.businessState.eventType === UPDATE_CONTACT_EVENT) {
        this.props.onExit();
      }
  }

  public render(): React.ReactNode {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          testID={this.testID}
          isVisibleTablet={true}
          title={I18n.t("pickUp")}
          backButton={{
            name: "Back",
            action:  () => warnBeforeLosingChanges(!!this.props.dirty, this.props.onCancel)
          }}
          rightButton={{
            title: I18n.t("continue"),
            action: () => {
              handleFormSubmission(logger, this.props.submit);
            }
          }}
        />
        <KeyboardAwareScrollView keyboardShouldPersistTaps={"always"}>
          { this.renderField("lastName", this.pickupFormRefs.lastName) }
          { this.renderField("firstName", this.pickupFormRefs.firstName) }
          { this.renderEmail() }
          { this.renderPhoneNumberField() }
          <SectionSubHeader
            styles={this.styles}
            testID={`${this.testID}-location-label`}>
            {I18n.t("pickUpLocation")}
          </SectionSubHeader>
          <View style={this.styles.addressDisplayPadding}>
            <View style={this.styles.addressDisplay}>
              { this.renderStoreName() }
            </View>
            <View style={this.styles.addressDisplay}>
              { this.renderLocationAddress() }
            </View>
          </View>
        </KeyboardAwareScrollView>
      </BaseView>
    );
  }

  private renderEmail(): React.ReactNode {
    const name = "emailAddress";
    return (
      <>
        <Field
          name={name}
          testID={`${this.testID}-${name}`}
          onRef={(ref: any) => this.pickupFormRefs.emailAddress = ref}
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
          this.props.updatedEmailVerificationWarningMessage.message !== undefined &&
          this.props.updatedEmailVerificationWarningMessage.message.length > 0 &&
          <Text
            key="emailWarning"
            style={this.styles.textInputWarning}
            {...getTestIdProperties(this.testID, "emailWarning")}>
            { this.props.updatedEmailVerificationWarningMessage.message }
          </Text>
        }
      </>
    );
  }

  private renderField(name: string, refField: any, placeholder?: string): React.ReactNode {
    return (
      <Field
        name={name}
        testID={`${this.testID}-${name}`}
        onRef={(ref: any) => refField = ref}
        placeholder={placeholder || I18n.t(name)}
        autoCapitalize="words"
        style={this.styles.textInput}
        component={renderTextInputField}
        errorStyle={this.styles.textInputError}
        onSubmitEditing={() => this.focusNextField(name)}
        persistPlaceholder
      />
    );
  }

  private renderPhoneNumberField = (): React.ReactNode => {
    const callingCode = this.state.phoneCountryCode && this.state.phoneCountryCode.callingCode;
    const name = "phoneNumber";
    return (
      <View style={this.styles.phoneNumberRow}>
        <TouchableOpacity
          style={[this.styles.controlsRow, this.styles.phoneNumberCode]}
          onPress={this.handleMoveToCountryPhoneCode}
        >
          <View style={this.styles.container}>
            <Text
              style={this.styles.placeholderLabelText}
              {...getTestIdProperties(this.testID, name)}>
            </Text>
            <Text {...getTestIdProperties(this.testID, "callingCode")}>
              { callingCode && !callingCode.startsWith("+") && "+" }
              { callingCode }
            </Text>
          </View>
        </TouchableOpacity>
        <Field
          name={name}
          testID={`${this.testID}-${name}`}
          onRef={(ref: any) => this.pickupFormRefs.phoneNumber = ref}
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

  private renderStoreName = (): React.ReactNode => {
    const storeName = this.props.deliveryLocation.storeName;
    return (
      <SectionLine
        styles={this.styles.textInput}
        testID={`${this.testID}-storeName`}>
        {storeName}
      </SectionLine>
    );
  }

  private renderLocationAddress = (): React.ReactNode[] | React.ReactNode => {
    const {
      addressLine1, addressLine2, addressLine3, addressLine4,
      city, stateOrProvince, postalCode, countryCode
    } = this.props.deliveryLocation.address;
    const address: AddressFormat = {
      address1: addressLine1,
      address2: addressLine2,
      address3: addressLine3,
      address4: addressLine4,
      city,
      state: stateOrProvince,
      district: undefined,
      postalCode,
      countryCode
    };
    const addressFormatConfig = countryCode && getAddressFormatorDefault(
      this.props.settings.configurationManager,
      countryCode,
      this.props.i18nLocation
    );
    const formattedAddress = formatAddress(addressFormatConfig.formatLines, address);

    return (
      formattedAddress && formattedAddress.length ?
        formattedAddress.map((line) => <SectionLine
          styles={this.styles.textInput}
          testID={`${this.testID}-location-address`}
        >{line}</SectionLine>)
        :
        <React.Fragment>
          <SectionLine styles={this.styles.textInput}
            isVisible={(!!addressLine1 || !!city)}
            testID={`${this.testID}-addressAndCity`}>
            {addressLine1}, {city}
          </SectionLine>
          <SectionLine styles={this.styles.textInput}
            isVisible={(!!stateOrProvince || !!postalCode)}
            testID={`${this.testID}-stateAndZip`}>
            {stateOrProvince}-{postalCode}
          </SectionLine>
        </React.Fragment>
    );
  }

  private focusNextField(currentField: string): void {
    const nextField = nextFieldMap.get(currentField);
    if (nextField) {
      if (this[nextField]) {
        this[nextField].focus();
      } else {
        this.focusNextField(nextField);
      }
    }
  }

  private handleMoveToCountryPhoneCode(): void {
    this.props.navigation.push("phoneCountryCode", {
      onCancel: () => this.props.navigation.pop(),
      onSelection: (phoneCountryCode: PhoneCountryCode) => this.setState(
        () => ({ phoneCountryCode }),
        () => {
          this.props.change("phoneCountryCode", phoneCountryCode.secondaryCountryCode);
          this.props.navigation.pop();
        }),
      selectedValue: this.state.phoneCountryCode
    });
  }
}

const asyncValidate = async (values: OrderPickupDetailsForm, dispatch: Dispatch<any>, props: Props) => {
  return asyncValidateEmailAddress(values, dispatch, props, logger);
};

const pickupDetailsForm = reduxForm<OrderPickupDetailsForm, any>({
  form: "orderPickupContact",
  asyncValidate,
  asyncBlurFields: ["emailAddress"],
  validate: (values: OrderPickupDetailsForm, props: Props & InjectedFormProps<OrderPickupDetailsForm, Props> &
    FormInstance<OrderPickupDetailsForm, Props>) => {
      const errors: {
        lastName: string,
        firstName: string,
        emailAddress: string,
        phoneNumber: string,
        phoneNumberCountryCode: string
      } = {
        lastName: undefined,
        firstName: undefined,
        emailAddress: undefined,
        phoneNumber: undefined,
        phoneNumberCountryCode: undefined
      };

      (() => {
        const phoneFormats: PhoneFormatConfig =
            props.settings.configurationManager.getI18nPhoneFormats();

        if (!values.phoneNumber) {
          errors.phoneNumber = I18n.t("required");
        } else {
          const phoneErrors =
              validatePhoneNumberForAddress(phoneFormats, values.phoneNumber, values.phoneNumberCountryCode);

          errors.phoneNumber = phoneErrors.phoneNumber;
          errors.phoneNumberCountryCode = phoneErrors.countryCode;

        }
      })();

      if (!values.firstName?.trim()) {
        errors.firstName = I18n.t("required");
      }

      if (!values.lastName?.trim()) {
        errors.lastName = I18n.t("required");
      }

      if (!values.emailAddress?.trim()) {
        errors.emailAddress = I18n.t("required");
      } else if (values.emailAddress && !isEmail(values.emailAddress)) {
        props.emailVerificationWarningMessage("");
        errors.emailAddress = I18n.t("customerCannotBeCreatedEmailAddressInvalidFormat");
      }

      return errors;
    },
  onSubmit: (values: OrderPickupDetailsForm, dispatch: any, props: OrderPickupDetailsFormProps) => {
    const {
      lastName,
      firstName,
      emailAddress,
      phoneNumber
    } = values;

    const contact: ICustomer = {
      lastName: lastName?.trim(),
      firstName: firstName?.trim(),
      emailAddress: emailAddress?.trim(),
      phoneNumber: phoneNumber?.trim()
    };

    const uiInputs: UiInput[] = [];

    uiInputs.push(new UiInput(UiInputKey.CONTACT, contact));

    props.performBusinessOperation(props.deviceIdentity, UPDATE_CONTACT_EVENT, uiInputs);
  }
})(OrderPickupDetails);

const mapStateToProps = (state: AppState): StateProps => {
  const order: IOrder = state.businessState.stateValues.get("transaction.order");
  let contact = order.fulfillmentGroups[0].deliveryLocation.contact;

  if (!contact) {
    const customer: Customer = state.businessState.stateValues.get("transaction.customer");
    if (customer) {
      contact = customer;
    }
  }
  return {
    businessState: state.businessState,
    customer: state.customer,
    settings: state.settings,
    contact,
    deliveryLocation: order.fulfillmentGroups[0].deliveryLocation,
    initialValues: {
      ...( contact ? {
        firstName: contact.firstName,
        lastName: contact.lastName,
        emailAddress: contact.emailAddress,
        phoneNumber: contact.phoneNumber,
        phoneNumberCountryCode: contact.phoneCountryCode
      } : {
        firstName: undefined,
        lastName: undefined,
        phoneNumber: undefined,
        emailAddress: undefined,
        phoneNumberCountryCode: getCurrentPhoneCountryCode(contact,
          state.settings.configurationManager, state.i18nLocationState?.i18nLocation).secondaryCountryCode
      })
    },
    deviceIdentity: state.settings.deviceIdentity,
    updatedEmailVerificationWarningMessage: state.emailVerification,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
};

const mapDispatchToProps: DispatchProps = {
  sceneTitle: sceneTitle.request,
  emailVerificationWarningMessage: emailVerificationWarningAction.request,
  performBusinessOperation: businessOperation.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof pickupDetailsForm>()(pickupDetailsForm));
