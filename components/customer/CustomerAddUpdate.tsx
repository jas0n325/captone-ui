import _ from "lodash";
import moment from "moment";
import * as React from "react";
import { InteractionManager, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Menu, { MenuItem } from "react-native-material-menu";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { DecoratedFormProps, Field, FormErrors, FormInstance, InjectedFormProps, reduxForm, SubmissionError } from "redux-form";
import { isEmail } from "validator";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import {
  AddressFormatConfig,
  CountryAddressFormat,
  CountryAddressFormatKeys,
  CountryAddressUsageKeys,
  Customer,
  taxInvoiceAndCustomerDetailsMap,
  getCustomerAddressOverrides,
  getAddressFormatorDefault,
  I18nLocationValues,
  isEditable,
  IServiceCustomerAttribute,
  IServiceCustomerAttributeDataElement,
  isRequired,
  isVisible,
  ITaxCustomerLine,
  PhoneCountryCode,
  ReceiptCategory,
  TaxCustomer,
  Usage
} from "@aptos-scp/scp-component-store-selling-features";
import { OptIn } from "@aptos-scp/scp-types-commerce-transaction";
import { CustomerType as CustomerTypeEnum } from "@aptos-scp/scp-types-commerce-transaction";
import {
  AttributeGroupDefinition,
  AttributeGroupDefinitionList
} from "@aptos-scp/scp-types-customer";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  emailVerificationWarningAction,
  feedbackNoteAction,
  loadSearchAddressAction,
  loadVerifyAddressAction,
  sceneTitle
} from "../../actions";
import { AppState, BusinessState, CustomerState, FeedbackNoteState, SettingsState } from "../../reducers";
import { ISearchAddressState, IVerifyAddressState } from "../../reducers/addressVerification";
import { IEmailVerificationState } from "../../reducers/emailVerification";
import Theme from "../../styles";
import { validateAllowedContent } from "../common/customInputs/RestrictedContentInput";
import FeedbackNote from "../common/FeedbackNote";
import {
  renderDateInputField,
  renderOptionsSelect,
  renderRestrictedContentInputField,
  RenderSelectOptions,
  renderTextInputField
} from "../common/FieldValidation";
import Header from "../common/Header";
import ToastPopUp from "../common/ToastPopUp";
import {
  getStoreLocale,
  handleFormSubmission,
  validateAddressFields,
  validateGroup,
  validatePhoneFields,
  validateRequiresOneOf,
  warnBeforeLosingChanges
} from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { getTestIdProperties, ICustomerValidation } from "../common/utilities/utils";
import VectorIcon from "../common/VectorIcon";
import { NavigationProp } from "../StackNavigatorParams";
import CustomerAttributeAddUpdate from "./CustomerAttributeAddUpdate";
import {
  customerTaxInformations,
  getAdvanceAddressVerification,
  getAdvanceEmailVerification,
  getAlternateDateFormat,
  getCountryFormatUsingCountryCode,
  getPostalCodeAllowedContentErrorCode,
  loadCountries,
  loadEmailVerification,
  loadGenders,
  loadLanguages,
  loadTitles
} from "./CustomerUtilities";
import { customerAddUpdateStyle } from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.customer.CustomerAddUpdate");

export const enum UserTaxValidationPattern {
  Numeric = "Numeric",
  AlphaNumeric = "AlphaNumeric"
}

const enum ErrorMessageId {
  Address = "addressError",
  RequiredFields = "requiredFields"
}

export interface CustomerAddUpdateForm {
  lastName: string;
  firstName: string;
  suffix: string;
  emailAddress: string;
  phoneNumber: string;
  phoneCountryCode: string;
  countryCode: string;
  companyName: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  countryName: string,
  taxIdentifier: string;
  taxCode: string;
  pecAddress: string;
  addressCode: string;
  emailOptIn: OptIn;
  textOptIn: OptIn;
  phoneOptIn: OptIn;
  gender: string;
  birthDate: string;
  preferredLanguage: string;
  titleCode: string;
  customerType: string;
  [name: string]: string;
  attributes: any;
  idNumber: string;
  ruc: string;
}

export interface StateProps {
  businessState: BusinessState;
  customer: CustomerState;
  settings: SettingsState;
  searchAddressState: ISearchAddressState;
  updatedEmailVerificationWarningMessage: IEmailVerificationState;
  verifyAddressState: IVerifyAddressState;
  feedbackNoteState: FeedbackNoteState;
  receiptCategory: ReceiptCategory;
  i18nLocation: string;
}

export interface DispatchProps {
  sceneTitle: ActionCreator;
  emailVerificationWarningMessage: ActionCreator;
  loadSearchAddress: ActionCreator;
  loadVerifyAddress: ActionCreator;
  feedbackNoteRequest: ActionCreator;
  feedbackNoteSuccess: ActionCreator;
}

export interface BirthDateBehavior {
  editable?: boolean;
  dateFormat: string;
  defaultYear: number;
}

export interface Props extends StateProps, DispatchProps {
  displayEmailOptIn: boolean;
  displayTextOptIn: boolean;
  displayPhoneOptIn: boolean;
  displayMailOptIn: boolean;
  birthDateBehavior: BirthDateBehavior;
  editableCustomer?: Customer;
  taxCustomerDetails?: TaxCustomer;
  createdCustomer?: boolean;        //customer create succeeded, disabled edit
  isUpdate?: boolean;
  assignCustomer?: boolean;
  onSave: (
      customer: Customer,
      taxIdentifier?: string,
      taxIdentifierName?: string,
      taxCode?: string,
      taxCodeLabelText?: string,
      pecAddress?: string,
      pecAddressLabelText?: string,
      addressCode?: string,
      addressCodeLabelText?: string,
      idNumber?: string,
      idNumberLabelText?: string,
      ruc?: string,
      rucLabelText?: string
  ) => void;
  onFailed?: () => void;
  onFailedWithErrors?: (errors: FormErrors<CustomerAddUpdateForm>) => void;
  onCancel: () => void;
  onExit: () => void;
  assignCustomerAction?: (customerNumber: string) => void;
  displayTaxInformation?: boolean;
  requiresOneFromEachGroup?: any;
  taxInvoiceButtonText?: string;
  customerUiConfig?: any;
  attributeDefs?: AttributeGroupDefinitionList;
  feedbackNote?: FeedbackNoteState;
  vatNumberRequired: boolean;
  isRucRequired: boolean;
  customerValidationDetails?: ICustomerValidation;
  scannedCustomerEmail?: string;
  navigation: NavigationProp;
  errors?: FormErrors<CustomerAddUpdateForm>;
}

export interface State {
  countries: RenderSelectOptions[];
  genders: RenderSelectOptions[];
  languages: RenderSelectOptions[];
  titles: RenderSelectOptions[];
  phoneCountryCode: PhoneCountryCode;
  country: RenderSelectOptions;
  emailOpt: OptIn;
  textOpt: OptIn;
  phoneOpt: OptIn;
  mailOpt: OptIn;
  gender: RenderSelectOptions;
  preferredLanguage: RenderSelectOptions;
  titleCode: RenderSelectOptions;
  temporaryCustomerMessage: string;
  hasAddressValue: boolean;
  showDropDown: boolean;
  searchNavigationFlag: boolean;
  customerType: RenderSelectOptions;
  customerTypesOptions: RenderSelectOptions[];
  feedbackNoteMessages: Map<string, any>;
  hasConditionalAttributeRuleError: boolean;
  isJapanRSSReceipt: boolean;
  scrollToError: boolean;
}

export interface CustomerTaxInformation {
  regionalTaxIdentifierLabelText: string;
  regionalTaxIdentifierLocalTypeCode: string;
  captureRegionalTaxIdentifier: UserTaxInformation;
  captureTaxCode: UserTaxInformation;
  taxCodeLabelText: string;
  taxCodeLocalTypeCode: string;
  capturePecAddress: UserTaxInformation;
  pecAddressLabelText: string;
  captureAddressCode: UserTaxInformation;
  addressCodeLabelText: string;
  captureIdNumber: UserTaxInformation;
  idNumberLabelText: string;
  idNumberLocalTypeCode: string;
  captureRUC: UserTaxInformation;
  rucLabelText: string;
  rucLocalTypeCode: string;
  validateCompanyName: boolean;
}

export interface UserTaxInformation {
  required: boolean;
  visible: boolean;
  minLength?: number;
  maxLength?: number;
  typeBehaviour?: {pattern: RegExp, typeOfBehaviour: UserTaxValidationPattern};
}

export const CustomerType = [
  {code: "Personal", description: "Personal"},
  {code: "Business", description: "Business"},
  {code: "Employee", description: "Employee"}
];

const nextFieldMap = new Map<string, string>([
  ["init", "lastName"],
  ["lastName", "firstName"],
  ["firstName", "suffix"],
  ["suffix", "phoneNumber"],
  ["phoneNumber", "emailAddress"],
  ["emailAddress", "birthDate"],
  ["birthDate", "companyName"],
  ["companyName", "address1"],
  ["address1", "address2"],
  ["address2", "address3"],
  ["address3", "address4"],
  ["address4", "city"],
  ["city", "district"],
  ["district", "customerState"],
  ["customerState", "postalCode"],
  ["postalCode", "taxIdentifier"],
  ["taxIdentifier", "idNumber"],
  ["idNumber", "ruc"],
  ["ruc", "taxCode"],
  ["taxCode", "pecAddress"],
  ["pecAddress", "addressCode"],
  ["addressCode", undefined]
]);

const nextScrollFieldList: string[] = [
  "lastName",
  "firstName",
  "suffix",
  "phoneNumber",
  "emailAddress",
  "titleCode",
  "preferredLanguage",
  "gender",
  "birthDate",
  "companyName",
  "address1",
  "address2",
  "address3",
  "address4",
  "city",
  "district",
  "customerState",
  "postalCode"
];

export interface IValidationCustomerTaxInformation {
  captureUserTaxInformation: boolean;
  captureRegionalTaxIdentifierVisible: boolean;
  captureTaxCodeVisible: boolean;
  capturePecAddressVisible: boolean;
  captureAddressCodeVisible: boolean;
  captureIdNumberVisible: boolean;
  captureRucVisible: boolean;
}
const DEFAULT: string = "Default";

class CustomerAddUpdate extends React.Component<Props & InjectedFormProps<CustomerAddUpdateForm, Props> &
    FormInstance<CustomerAddUpdateForm, Props>, State> {
  private customerFieldRefs: any = { // moved into object to avoid "... is declared but its value is never read."
    lastName: undefined,
    firstName: undefined,
    suffix: undefined,
    emailAddress: undefined,
    phoneNumber: undefined,
    titleCode: undefined,
    preferredLanguage: undefined,
    gender: undefined,
    companyName: undefined,
    address1: undefined,
    address2: undefined,
    address3: undefined,
    address4: undefined,
    city: undefined,
    district: undefined,
    customerState: undefined,
    postalCode: undefined,
    countryName: undefined,
    taxIdentifier: undefined,
    taxCode: undefined,
    pecAddress: undefined,
    addressCode: undefined,
    birthDate: undefined,
    idNumber: undefined,
    ruc: undefined,
    attributes: new Map<string, any>()
  };
  private menu: any;

  private customerTaxInfo: CustomerTaxInformation = {
    regionalTaxIdentifierLabelText: undefined,
    regionalTaxIdentifierLocalTypeCode: undefined,
    captureRegionalTaxIdentifier: {required: false, visible: false},
    captureTaxCode: {required: false, visible: false},
    taxCodeLabelText: undefined,
    taxCodeLocalTypeCode: undefined,
    capturePecAddress: {required: false, visible: false},
    pecAddressLabelText: undefined,
    captureAddressCode: {required: false, visible: false},
    addressCodeLabelText: undefined,
    captureIdNumber: {required: false, visible: false},
    idNumberLabelText: undefined,
    idNumberLocalTypeCode: undefined,
    captureRUC: {required: false, visible: false},
    rucLabelText: undefined,
    rucLocalTypeCode: undefined,
    validateCompanyName: false
  };

  private styles: any;
  private debounceTimer: ReturnType<typeof  setTimeout>;
  private attributes: IServiceCustomerAttribute[];
  private displayAttributes: boolean;
  private scrollView: any;
  private testID: string;

  public constructor(props: Props & InjectedFormProps<CustomerAddUpdateForm, Props> &
      FormInstance<CustomerAddUpdateForm, Props>) {
    super(props);
    this.debounceTimer  = undefined;
    this.styles = Theme.getStyles(customerAddUpdateStyle());
    this.testID = "CustomerAddUpdate";

    this.state = {
      countries: undefined,
      genders: undefined,
      languages: undefined,
      titles: undefined,
      phoneCountryCode: undefined,
      country: undefined,
      emailOpt: OptIn.Unknown,
      textOpt: OptIn.Unknown,
      phoneOpt: OptIn.Unknown,
      mailOpt: OptIn.Unknown,
      gender: undefined,
      preferredLanguage: undefined,
      titleCode: undefined,
      temporaryCustomerMessage: undefined,
      hasAddressValue: false,
      showDropDown: false,
      searchNavigationFlag: false,
      customerType: undefined,
      customerTypesOptions: undefined,
      feedbackNoteMessages: new Map<string, any>(),
      hasConditionalAttributeRuleError: false,
      isJapanRSSReceipt: false,
      scrollToError: false
    };

    this.handleMoveToCountryPhoneCode = this.handleMoveToCountryPhoneCode.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
    this.handleAttributeDelete = this.handleAttributeDelete.bind(this);
  }

  public componentDidMount(): void {
    if (!this.attributes) {
      this.attributes = this.props.isUpdate ? this.props.editableCustomer &&
          _.cloneDeep(this.props.editableCustomer && this.props.editableCustomer.attributes) :
          this.createPromptOnCreateAttributes();
    }
    const customer = this.props.editableCustomer;
    const taxCustomerDetails = this.props.taxCustomerDetails;

    const i18nLocation = this.props.i18nLocation;
    const phoneCountryCodesFormats = this.props.settings
        .configurationManager.getI18nPhoneFormats() as { [x: string]: PhoneCountryCode };

    if (i18nLocation) {
      this.customerTaxInfo = customerTaxInformations(this.props.settings.configurationManager, i18nLocation);
    }

    (async () => {
      const { editableCustomer = { address1: "" } } = this.props;
      const { address1 } = editableCustomer;
      const countries = await loadCountries(this.props.settings.diContainer);
      const genders = await loadGenders(this.props.settings.diContainer);
      const languages = await loadLanguages(this.props.settings.diContainer);
      const titles = await loadTitles(this.props.settings.diContainer);
      const customerTypesOptions = CustomerType;
      let customerCountry: RenderSelectOptions;
      let customerPhoneCountryCode: PhoneCountryCode = undefined;
      const defaultPhoneCountryCode: PhoneCountryCode =
          getCountryFormatUsingCountryCode(phoneCountryCodesFormats, i18nLocation);
      const countryAddressFormat: AddressFormatConfig =
          this.props.settings.configurationManager.getI18nAddressFormats();

      const getCustomerCountryCode = (currentCustomer: Customer | ITaxCustomerLine): PhoneCountryCode =>
          getCountryFormatUsingCountryCode(phoneCountryCodesFormats, currentCustomer.phoneCountryCode);
      const getCustomerDefaultCountryCode = (currentCustomer: Customer | ITaxCustomerLine): RenderSelectOptions => {
        let customerCountryCode = (currentCustomer) ?
            countries.find((country) => country.code === currentCustomer.countryCode) : undefined;
        if (!(customerCountryCode && customerCountryCode.code)) {
          customerCountryCode = countries.find((country) => country.code ===
              (countryAddressFormat[i18nLocation] ? countryAddressFormat[i18nLocation].countryCode : undefined));
        }
        return customerCountryCode;
      };

      if (taxCustomerDetails) {
        customerCountry = getCustomerDefaultCountryCode(taxCustomerDetails);
        customerPhoneCountryCode = getCustomerCountryCode(taxCustomerDetails);
      } else if (customer) {
        customerCountry = getCustomerDefaultCountryCode(customer);
        customerPhoneCountryCode = getCustomerCountryCode(customer);
      } else {
        customerCountry = countries.find((country) => {
          for (const countryKey in countryAddressFormat) {
            if (countryKey === i18nLocation && countryAddressFormat[countryKey].countryCode === country.code) {
              return true;
            }
          }
          return false;
        });
        const initializeDefaultValues = () =>
          this.props.initialize({
            countryCode: customerCountry && customerCountry.code,
            countryName: customerCountry && customerCountry.description,
            phoneCountryCode: defaultPhoneCountryCode && defaultPhoneCountryCode.secondaryCountryCode,
            attributes: this.attributes as any
          });
        initializeDefaultValues();
      }
      this.setState({
        countries,
        genders,
        languages,
        titles,
        phoneCountryCode: customerPhoneCountryCode || defaultPhoneCountryCode,
        country: customerCountry,
        emailOpt: customer && customer.emailOptIn || OptIn.Unknown,
        textOpt: customer && customer.textOptIn || OptIn.Unknown,
        phoneOpt: customer && customer.phoneOptIn || OptIn.Unknown,
        mailOpt: customer && customer.mailOptIn || OptIn.Unknown,
        gender: customer ? genders.find((gender) => gender.code === customer.gender) : undefined,
        preferredLanguage: customer ? languages.find((lang) => lang.code === customer.preferredLanguage) : undefined,
        titleCode: customer ? titles.find((title) => title.code === customer.titleCode) : undefined,
        hasAddressValue: !!address1,
        isJapanRSSReceipt: this.props.receiptCategory === ReceiptCategory.JapanRSSReceipt,
        customerTypesOptions,
        customerType: customer && customerTypesOptions.find(
          (customerType) => customerType.code === customer.customerType) || CustomerType[0]
      });

      if (taxCustomerDetails) {
        this.initializeTaxCustomerDetail(taxCustomerDetails);
      } else if (customer || this.attributes) {
        this.initializeCustomerDetail(customer);
      }
    })().catch((error) => { throw logger.throwing(error, "loadCustomerFormData", LogLevel.WARN); });

    this.focusNextField("init");
    this.props.emailVerificationWarningMessage("");

    this.displayAttributes = this.props.isUpdate ?
        _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
        customerFunctionChoices, "customerEdit.attributes.visible", true) :
        _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
        customerFunctionChoices, "customerCreate.attributes.visible", true);
  }

  public getSnapshotBeforeUpdate(prevProps: Props, prevState: State): void {
    if (
      !_.isEqual(prevProps.verifyAddressState, this.props.verifyAddressState)
      ) {
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

  public componentDidUpdate(prevProps: Props): void {
    if (this.shouldScrollToError()) {
      this.scrollErrorFieldIntoView();
      this.setState({scrollToError: false});
    }
    if (this.props.customer.creationResult && !prevProps.customer.creationResult) {
      if (this.props.customer.creationResult.createdSuccessfully) {
        this.setState({ temporaryCustomerMessage: I18n.t("customerCreateSuccess") });
      } else if (!this.props.settings.configurationManager.getFunctionalBehaviorValues().
          customerFunctionChoices?.customerCreate?.discardCustomerOnServiceFailure) {
        this.setState({ temporaryCustomerMessage: I18n.t("customerUnsuccessful") });
      }
    }
    if (this.props.customer.updateResult && !prevProps.customer.updateResult) {
      if (this.props.customer.updateResult.successful) {
        this.setState({ temporaryCustomerMessage: I18n.t("customerUpdateSuccess") });
      } else {
        this.setState({ temporaryCustomerMessage: I18n.t("customerUpdateUnsuccessful") });
      }
    }
    if (!prevProps.attributeDefs && this.props.attributeDefs) {
      this.attributes = this.attributes && this.attributes.length > 0 ?
          this.attributes : this.createPromptOnCreateAttributes();
      this.props.change("attributes", this.attributes);
      this.forceUpdate();
    }

    if (prevProps.feedbackNoteState !== this.props.feedbackNoteState &&
        !this.props.feedbackNoteState.feedBackNotes.has(ErrorMessageId.Address) &&
        !this.props.feedbackNoteState.feedBackNotes.has(ErrorMessageId.RequiredFields)) {
      this.setState({feedbackNoteMessages: new Map<string, any>()});
    } else if (this.props.feedbackNote && this.props.feedbackNote !== prevProps.feedbackNote) {
      this.setState({ feedbackNoteMessages: this.props.feedbackNote.feedBackNotes });
      setTimeout(() => this.scrollView.scrollToPosition(0, 0), 100);
    }
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.fill}>
        {Theme.isTablet ? this.getPageTabletHeader() : this.getPagePhoneHeader()}
        <View style={this.styles.root}>
        { this.isJapanRSSReceipt() ? this.renderJapanRSSReceiptBody() : this.renderBody()}
        {this.state.temporaryCustomerMessage &&
          <ToastPopUp
            textToDisplay={this.state.temporaryCustomerMessage}
            hidePopUp={this.hidePopUp.bind(this)}
          />
        }
        </View>
      </View>
    );
  }

  private shouldScrollToError(): boolean {
    return this.props.invalid && this.props.submitFailed && this.props.errors && !this.props["triggerSubmit"] &&
        this.state.scrollToError;
  }

  private scrollErrorFieldIntoView(): void {
    let fieldFound: boolean = false;

    if(this.props.feedbackNoteState?.feedBackNotes.has(ErrorMessageId.RequiredFields)) {
      //scroll to the top to show error note at the top of form
      setTimeout(() => this.scrollView.scrollToPosition(0, 0), 100);
    } else {
      for (const name of nextScrollFieldList) {
        if (this.props.errors[name] && this.customerFieldRefs[name] && this.scrollView) {
          setTimeout(() => this.scrollView.scrollIntoView(this.customerFieldRefs[name]), 100);
          fieldFound = true;
          break;
        }
      };
      if (!fieldFound && this.customerFieldRefs.attributes.size > 0) {
        for (const [key, ref] of this.customerFieldRefs.attributes) {
          if (this.props.errors[key]) {
            setTimeout(() => this.scrollView.scrollIntoView(ref), 100);
            break;
          }
        };
      }
    }
  }

  private renderJapanRSSReceiptBody(): JSX.Element {
    return  (
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={"always"}
        ref={(ref: any) => this.scrollView = ref}>
            {this.renderConditionalError()}
            {this.renderNameFields()}
            {this.renderFooterButton()}
      </KeyboardAwareScrollView>
    );
  }

  private renderBody(): JSX.Element {
    return  (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps={"always"}
      ref={(ref: any) => this.scrollView = ref}>
          {this.renderConditionalError()}
          {this.renderNameFields()}
          {this.renderPhoneNumberField()}
          {this.renderEmail()}
          {this.getCustomerAttributesMain()}
          {this.renderCompany()}
          {(isVisible("address", this.props.customerUiConfig) ||
              isVisible("country", this.props.customerUiConfig)) &&
            <View style={this.styles.subtitleArea}>
              <Text style={this.styles.subtitleText}>{I18n.t("address")}</Text>
            </View>
          }
          {this.renderAddressError()}
          {this.renderCountry()}
          {this.renderAddressFields()}
          {this.props.displayTaxInformation && this.getTaxInformationInput()}
          {this.getOptInOptions()}
          {this.renderCustomerDefinedAttributes()}
          {Theme.isTablet && !this.props.displayTaxInformation &&
            <View style={this.styles.btnArea}>
              <TouchableOpacity
                style={[this.styles.btnPrimary, this.styles.customerButton]}
                onPress={() => {
                  if (!this.state.hasConditionalAttributeRuleError) {
                    if (this.props.isUpdate && !this.props.dirty) {
                      if (this.props.customer && this.props.customer.customer) {
                        this.props.assignCustomerAction(this.props.customer.customer.customerNumber);
                      }
                      this.props.onExit();
                    } else {
                      this.setState({scrollToError: true});
                      handleFormSubmission(logger, this.props.submit);
                    }
                  }
                }}
              >
                <Text style={this.styles.btnPrimaryText}>
                    {this.props.createdCustomer ? I18n.t("assignCustomer") : I18n.t("save")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.customerButton]}
                onPress={() => this.props.onCancel()}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          }
        </KeyboardAwareScrollView>
    );
  }

  private focusNextField(currentField: string): void {
    const nextField = nextFieldMap.get(currentField);
    if (nextField) {
      if (this.customerFieldRefs[nextField] && this.customerFieldRefs[nextField].props &&
            this.customerFieldRefs[nextField].props.editable) {
        this.customerFieldRefs[nextField].focus();
      } else {
        this.focusNextField(nextField);
      }
    }
  }

  private renderConditionalError(): JSX.Element {
    return (this.state.feedbackNoteMessages?.has(ErrorMessageId.RequiredFields) &&
      <FeedbackNote message={this.state.feedbackNoteMessages.get(ErrorMessageId.RequiredFields).message}
        style={this.styles}
      />
    );
  }

  private renderAddressError(): JSX.Element {
    return ( this.state.feedbackNoteMessages?.has(ErrorMessageId.Address) &&
        <FeedbackNote message={this.state.feedbackNoteMessages.get(ErrorMessageId.Address).message}
          style={this.styles}
        />
    );
  }

  private renderEmail(): JSX.Element {
    if (this.props.displayTaxInformation) { return undefined; }

    return (
      <>
        {
          isVisible("emailAddress", this.props.customerUiConfig, !this.props.displayTaxInformation) &&
          <Field name="emailAddress" onRef={(ref: any) => this.customerFieldRefs.emailAddress = ref}
            disabled={this.props.createdCustomer || (this.props.isUpdate && !this.isEditableField("emailAddress"))}
            placeholder={I18n.t("email") + (isRequired("emailAddress", this.props.customerUiConfig) ? "*" : "")}
            style={this.styles.textInput}
            inputStyle={(this.props.isUpdate && !this.isEditableField("emailAddress")) ? this.styles.inputDisabled : {}}
            keyboardType="email-address"
            component={renderTextInputField}
            persistPlaceholder={true}
            errorStyle={this.styles.textInputError}
            onSubmitEditing={() => this.focusNextField("emailAddress")} />
        }
        {
          isVisible("emailAddress", this.props.customerUiConfig, !this.props.displayTaxInformation) &&
          this.props.updatedEmailVerificationWarningMessage.message !== undefined &&
          this.props.updatedEmailVerificationWarningMessage.message.length > 0 &&
          <Text key="emailWarning" style={this.styles.textInputWarning}>
            {this.props.updatedEmailVerificationWarningMessage.message}
          </Text>
        }
    </>
    );
  }

  private renderPhoneNumberField = (): JSX.Element => {
    const callingCode = this.state.phoneCountryCode && this.state.phoneCountryCode.callingCode;
    return (
      isVisible("phoneNumber", this.props.customerUiConfig) &&
      <View style={this.styles.phoneNumberRow}>
        <TouchableOpacity
          style={[this.styles.controlsRow, this.styles.phoneNumberCode,
              this.getInputStyle(this.isEditableField("phoneNumberAddress"))]}
          onPress={this.isEditableField("phoneNumber") && this.handleMoveToCountryPhoneCode}
        >
          <View style={[this.styles.container, this.getInputStyle(this.isEditableField("phoneNumber"))]}>
            <Text style={this.styles.placeholderLabelText}> </Text>
            <Text style={this.getInputStyle(this.isEditableField("phoneNumber"))}>
              {callingCode && !callingCode.startsWith("+") && "+"}
              {callingCode}
            </Text>
          </View>
        </TouchableOpacity>
        <Field name="phoneNumber" onRef={(ref: any) => this.customerFieldRefs.phoneNumber = ref}
          placeholder={I18n.t("phoneNumber") + (isRequired("phoneNumber", this.props.customerUiConfig) ? "*" : "")}
          style={{...this.styles.textInput, ...this.styles.phoneNumber}}
          errorStyle={this.styles.textInputError} keyboardType="phone-pad" returnKeyType={"done"}
          component={renderTextInputField} disabled={this.props.createdCustomer || !this.isEditableField("phoneNumber")}
          persistPlaceholder={true}
          inputStyle={this.getInputStyle(this.isEditableField("phoneNumber"))}
          onSubmitEditing={() => this.focusNextField("phoneNumber")} />
      </View>
    );
  }

  private renderAddressFields = (): JSX.Element => {
    if (!isVisible("address", this.props.customerUiConfig)) { return undefined; }
    const { country } = this.state;
    const i18nLocation = this.props.i18nLocation;
    let addressFormatConfig: CountryAddressFormat = undefined;
    if (country) {
      addressFormatConfig = getAddressFormatorDefault(this.props.settings.configurationManager, country.code,
          i18nLocation);
    } else if (i18nLocation && i18nLocation !== DEFAULT) {
      addressFormatConfig = getAddressFormatorDefault(this.props.settings.configurationManager, i18nLocation,
          i18nLocation);
    }
    const customerAddressOverrides = getCustomerAddressOverrides(this.props.settings.configurationManager,
        addressFormatConfig?.country, i18nLocation);
    const postalCodeAllowedContent = addressFormatConfig && addressFormatConfig.postalCodeAllowedContent;
    const isAddressFormatConfigAvailable = (key: CountryAddressFormatKeys) =>
        (addressFormatConfig && addressFormatConfig[key]);
    const isAddressFieldUsed = (key: CountryAddressUsageKeys) => {
        if(customerAddressOverrides && customerAddressOverrides[key] && !this.props.displayTaxInformation) {
          return customerAddressOverrides[key] !== Usage.NotUsed;
        }
        return addressFormatConfig && addressFormatConfig[key] !== Usage.NotUsed;
    };
    const getAddressConfig = (key: CountryAddressUsageKeys) => {
      if(customerAddressOverrides && customerAddressOverrides[key] && !this.props.displayTaxInformation) {
        return customerAddressOverrides;
      }
      return addressFormatConfig;
    }
    const getFieldLabel = (key: CountryAddressFormatKeys, defaultI18nCode: string) =>
        (
          isAddressFormatConfigAvailable(key) && addressFormatConfig[key].i18nCode ?
            I18n.t(addressFormatConfig[key].i18nCode, { defaultValue: addressFormatConfig[key].default }) :
            I18n.t(defaultI18nCode)
        );
    return (
      <React.Fragment>
        {(isAddressFieldUsed(CountryAddressUsageKeys.addressLine1Usage) || !getAddressConfig(CountryAddressUsageKeys.addressLine1Usage)) &&
          <Field
            name="address1" onRef={(ref: any) => this.customerFieldRefs.address1 = ref}
            disabled={!this.isEditableField("address")}
            inputStyle={this.getInputStyle(this.isEditableField("address"))}
            placeholder={this.getAddressPlaceHolder(getFieldLabel(CountryAddressFormatKeys.addressLine1Label, "address1"), "addressLine1Usage", getAddressConfig(CountryAddressUsageKeys.addressLine1Usage), i18nLocation)}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField("address1")}
            onChange={this.onChangeOfAddress.bind(this)}
            onFocus={() => this.handleAddressSearch(i18nLocation)}
          />
        }
        {(isAddressFieldUsed(CountryAddressUsageKeys.addressLine2Usage) || !getAddressConfig(CountryAddressUsageKeys.addressLine2Usage)) &&
          <Field name="address2" onRef={(ref: any) => this.customerFieldRefs.address2 = ref}
            disabled={!this.isEditableField("address")}
            inputStyle={this.getInputStyle(this.isEditableField("address"))}
            placeholder={this.getAddressPlaceHolder(getFieldLabel(CountryAddressFormatKeys.addressLine2Label, "address2"), "addressLine2Usage", getAddressConfig(CountryAddressUsageKeys.addressLine2Usage), i18nLocation)}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField("address2")} />
        }
        {isAddressFieldUsed(CountryAddressUsageKeys.addressLine3Usage) &&
          <Field name="address3" onRef={(ref: any) => this.customerFieldRefs.address3 = ref}
            disabled={!this.isEditableField("address")}
            inputStyle={this.getInputStyle(this.isEditableField("address"))}
            placeholder={this.getAddressPlaceHolder(getFieldLabel(CountryAddressFormatKeys.addressLine3Label, "address3"), "addressLine3Usage", getAddressConfig(CountryAddressUsageKeys.addressLine3Usage), i18nLocation)}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField("address3")} />
        }
        {isAddressFieldUsed(CountryAddressUsageKeys.addressLine4Usage) &&
          <Field name="address4" onRef={(ref: any) => this.customerFieldRefs.address4 = ref}
            disabled={!this.isEditableField("address")}
            inputStyle={this.getInputStyle(this.isEditableField("address"))}
            placeholder={this.getAddressPlaceHolder(getFieldLabel(CountryAddressFormatKeys.addressLine4Label, "address4"), "addressLine4Usage", getAddressConfig(CountryAddressUsageKeys.addressLine4Usage), i18nLocation)}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField("address4")} />
        }
        {(isAddressFieldUsed(CountryAddressUsageKeys.cityUsage) || !getAddressConfig(CountryAddressUsageKeys.cityUsage)) &&
          <Field name="city" onRef={(ref: any) => this.customerFieldRefs.city = ref}
            disabled={!this.isEditableField("address")}
            inputStyle={this.getInputStyle(this.isEditableField("address"))}
            placeholder={this.getAddressPlaceHolder(getFieldLabel(CountryAddressFormatKeys.cityLabel, "city"), "cityUsage", getAddressConfig(CountryAddressUsageKeys.cityUsage), i18nLocation)}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField("city")} />
        }
        {isAddressFieldUsed(CountryAddressUsageKeys.secondAdminDivisionUsage) &&
          <Field name="district" onRef={(ref: any) => this.customerFieldRefs.district = ref}
            disabled={!this.isEditableField("address")}
            inputStyle={this.getInputStyle(this.isEditableField("address"))}
            placeholder={this.getAddressPlaceHolder(getFieldLabel(CountryAddressFormatKeys.secondAdminDivisionLabel, "district"), "secondAdminDivisionUsage", getAddressConfig(CountryAddressUsageKeys.secondAdminDivisionUsage), i18nLocation)}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField("district")} />
        }
        {(isAddressFieldUsed(CountryAddressUsageKeys.firstAdminDivisionUsage) || !getAddressConfig(CountryAddressUsageKeys.firstAdminDivisionUsage)) &&
          <Field name="state" onRef={(ref: any) => this.customerFieldRefs.customerState = ref}
            disabled={!this.isEditableField("address")}
            inputStyle={this.getInputStyle(this.isEditableField("address"))}
            placeholder={this.getAddressPlaceHolder(getFieldLabel(CountryAddressFormatKeys.firstAdminDivisionLabel, "state"), "firstAdminDivisionUsage", getAddressConfig(CountryAddressUsageKeys.firstAdminDivisionUsage), i18nLocation)}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField("customerState")} />
        }
        {(isAddressFieldUsed(CountryAddressUsageKeys.postalCodeUsage) || !getAddressConfig(CountryAddressUsageKeys.postalCodeUsage)) &&
          <Field name="postalCode" onRef={(ref: any) => this.customerFieldRefs.postalCode = ref}
            disabled={!this.isEditableField("address")}
            inputStyle={this.getInputStyle(this.isEditableField("address"))}
            placeholder={this.getAddressPlaceHolder(getFieldLabel(CountryAddressFormatKeys.postalCodeLabel, "zipPostalCode"), "postalCodeUsage", getAddressConfig(CountryAddressUsageKeys.postalCodeUsage), i18nLocation)}
            autoCapitalize="characters" style={this.styles.textInput}
            component={renderRestrictedContentInputField} errorStyle={this.styles.textInputError}
            persistPlaceholder={true}
            onSubmitEditing={() => this.focusNextField("postalCode")}
            allowedContent={postalCodeAllowedContent}
          />
        }
      </React.Fragment>
    );
  }

  private getAddressPlaceHolder(defaultFieldLabel: string, fieldName: string, config: any, i18nLocation: string): string {
    if (i18nLocation && (i18nLocation === I18nLocationValues.Peru || i18nLocation === I18nLocationValues.Portugal)) {
      return defaultFieldLabel + ((this.isConditionallyRequired("address") &&
          (config && config[fieldName] === Usage.Required)) ? "*" : "");
    } else {
      return defaultFieldLabel + (config && config[fieldName] === Usage.Required ? "*" : "");
    }
  }

  private handleAddressSearch(i18nLocation: string): void {
    let customerCountry: RenderSelectOptions;
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
    if (!this.state.hasAddressValue && customerCountry &&
      getAdvanceAddressVerification(this.props.settings.configurationManager)) {
      this.customerFieldRefs.address1.blur();
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
        isUpdate: this.props.isUpdate,
        isTaxInfo: !!this.props.displayTaxInformation
      });
    }
  }

  private isEditableField(fieldName: string): boolean {
    return isEditable(fieldName, this.props.customerUiConfig, true);
  }

  private getInputStyle(editable: boolean): any {
    return !editable ? this.styles.inputDisabled : {};
  }

  private debounce(fn: (text: string) => void, delay: number): (text: string) => void {
    return (text: string) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        fn(text);
      }, delay);
    };
  }

  private getOptInTitle(): JSX.Element {
    if (this.props.displayEmailOptIn || this.props.displayTextOptIn || this.props.displayPhoneOptIn || this.props.displayMailOptIn) {
      return (
        <View style={this.styles.subtitleArea}>
          <Text style={this.styles.subtitleText}>{I18n.t("contactMethod")}</Text>
        </View>
      );
    } else {
      return undefined;
    }
  }

  private getTaxInformationInput(): JSX.Element {
    const captureTaxCodeVisible = this.customerTaxInfo.captureTaxCode && this.customerTaxInfo.captureTaxCode.visible;
    const capturePecAddressVisible = this.customerTaxInfo.capturePecAddress?.visible;
    const captureAddressCodeVisible = this.customerTaxInfo.captureAddressCode?.visible;
    const captureRegionalTaxIdentifierVisible = this.customerTaxInfo.captureRegionalTaxIdentifier?.visible;
    const captureIdNumberVisible = !this.props.isRucRequired && this.customerTaxInfo.captureIdNumber?.visible;
    const captureRucVisible = this.props.isRucRequired && this.customerTaxInfo.captureRUC?.visible;

    const captureUserTaxInformation = captureTaxCodeVisible || capturePecAddressVisible ||
      captureAddressCodeVisible || captureRegionalTaxIdentifierVisible || captureIdNumberVisible || captureRucVisible;
    return this.renderAdditionalTaxInfo(captureUserTaxInformation, captureRegionalTaxIdentifierVisible,
        captureTaxCodeVisible, capturePecAddressVisible, captureAddressCodeVisible, captureIdNumberVisible,
        captureRucVisible);
  }

  private renderAdditionalTaxInfo(captureUserTaxInformation: boolean, captureRegionalTaxIdentifierVisible: boolean,
                                  captureTaxCodeVisible: boolean, capturePecAddressVisible: boolean,
                                  captureAddressCodeVisible: boolean, captureIdNumberVisible: boolean,
                                  captureRucVisible: boolean): JSX.Element {
    return (
      <View>
        {captureUserTaxInformation &&
          <View>
            <View style={this.styles.subtitleArea}>
              <Text style={this.styles.subtitleText}>{I18n.t("taxInformation")}</Text>
            </View>
            {captureRegionalTaxIdentifierVisible &&
              <Field name="taxIdentifier" onRef={(ref: any) => this.customerFieldRefs.taxIdentifier = ref}
                placeholder={
                  this.customerTaxInfo.regionalTaxIdentifierLabelText +
                    (this.getValidationVatResult(this.customerTaxInfo.captureRegionalTaxIdentifier.required) ? "*" : "")
                }
                placeholderSentenceCase={false}
                autoCapitalize="words" style={this.styles.textInput}
                component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
                onSubmitEditing={() => this.focusNextField("taxIdentifier")} />}
            {captureTaxCodeVisible &&
              <Field name="taxCode" onRef={(ref: any) => this.customerFieldRefs.taxCode = ref}
                placeholder={
                  this.customerTaxInfo.taxCodeLabelText +
                    (this.customerTaxInfo.captureTaxCode && this.customerTaxInfo.captureTaxCode.required ? "*" : "")
                }
                autoCapitalize="words" style={this.styles.textInput}
                component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
                onSubmitEditing={() => this.focusNextField("taxCode")} />}
            {capturePecAddressVisible &&
              <Field name="pecAddress" onRef={(ref: any) => this.customerFieldRefs.pecAddress = ref}
                placeholder={
                  this.customerTaxInfo.pecAddressLabelText +
                      (this.customerTaxInfo.capturePecAddress &&
                      this.customerTaxInfo.capturePecAddress.required ? "*" : "")}
                keyboardType="email-address" style={this.styles.textInput}
                component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
                onSubmitEditing={() => this.focusNextField("pecAddress")} />}
            {captureAddressCodeVisible &&
              <Field name="addressCode" onRef={(ref: any) => this.customerFieldRefs.addressCode = ref}
                placeholder={
                  this.customerTaxInfo.addressCodeLabelText + (this.customerTaxInfo.captureAddressCode &&
                      this.customerTaxInfo.captureAddressCode.required ? "*" : "")
                }
                autoCapitalize="words" style={this.styles.textInput}
                component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
                onSubmitEditing={() => this.focusNextField("addressCode")} />}
            {captureIdNumberVisible &&
              <Field name="idNumber" onRef={(ref: any) => this.customerFieldRefs.idNumber = ref}
                placeholder={
                  this.customerTaxInfo.idNumberLabelText + (this.customerTaxInfo.captureIdNumber.required ? "*" : "")
                }
                placeholderSentenceCase={false}
                autoCapitalize="words" style={this.styles.textInput}
                component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
                onSubmitEditing={() => this.focusNextField("idNumber")} />}
            {captureRucVisible &&
              <Field name="ruc" onRef={(ref: any) => this.customerFieldRefs.ruc = ref}
                placeholder={
                  this.customerTaxInfo.rucLabelText +
                      (this.getRucResult(this.customerTaxInfo.captureRUC.required) ? "*" : "")
                }
                placeholderSentenceCase={false}
                autoCapitalize="words" style={this.styles.textInput}
                component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
                onSubmitEditing={() => this.focusNextField("ruc")} />}
          </View>}
        {this.renderFooterButton()}
      </View>
    );
  }

  private getRucResult(value: boolean) : boolean {
    return (value || this.props.isRucRequired === true);
  }

  private isConditionallyRequired(key: string): boolean {
    return (this.props.customerValidationDetails && this.props.customerValidationDetails[key] === true);
  }

  private renderFooterButton(): JSX.Element {
    return (
      <View style={this.styles.btnArea}>
        <TouchableOpacity
          style={[this.styles.btnPrimary, this.styles.customerButton]}
          onPress={() => {
            handleFormSubmission(logger, this.props.submit);
          }}
        >
          <Text style={this.styles.btnPrimaryText}>
            {this.props.taxInvoiceButtonText}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[this.styles.btnSeconday, this.styles.cancelButton]}
          onPress={() => this.props.onCancel()}
        >
          <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  private getPageTabletHeader(): JSX.Element {
    if (!this.props.displayTaxInformation) {
      return(
        <Header
          isVisibleTablet={true}
          testID={this.testID}
          title={this.props.isUpdate ? I18n.t("customerUpdate") : I18n.t("customerCreate")}
          backButton={{ name: "Back", action: this.handleBackPress }}
          rightButton={this.displayAttributes && this.props.attributeDefs?.data ? {
            title: I18n.t("attributeAdd"),
            action: () => this.handleRightButtonAction()
          } : <View/> }
        />
      );
    } else {
      return (
        <Header
          isVisibleTablet={true}
          title={I18n.t("confirmDetails")}
          backButton={{
            name: "Back", action: this.handleBackPress
          }}
        />
      );
    }
  }

  private getPagePhoneHeader(): JSX.Element {
    if (!this.props.displayTaxInformation) {
      return(
          <Header
            title={this.props.isUpdate ? I18n.t("customerUpdate") : I18n.t("customerCreate")}
            backButton={{
              name: "Back", action: this.handleBackPress
            }}
            rightButtons={[{
              title: this.props.createdCustomer ? I18n.t("assignCustomer") : I18n.t("save"),
              action: () => {
                if(!this.state.hasConditionalAttributeRuleError) {
                  if (this.props.isUpdate && !this.props.dirty) {
                    if (this.props.customer && this.props.customer.customer) {
                      this.props.assignCustomerAction(this.props.customer.customer.customerNumber);
                    }
                    this.props.onExit();
                  } else {
                    this.setState({scrollToError: true});
                    handleFormSubmission(logger, this.props.submit);
                  }
                }
              }
            },
            this.getKebabMenu()
            ]}
          />
      );
    } else {
      return (
        <Header
          title={I18n.t("confirmDetails")}
          backButton={{
            name: "Back", action: this.handleBackPress
          }}
        />
      );
    }
  }

  private getKebabMenu(): JSX.Element {
    return (
    <View>
      <Menu
        ref={this.setMenuRef}
        button={ <TouchableOpacity style={this.styles.menuIcon} onPress={() => this.showMenu()} >
          <VectorIcon
              name={"Kebab"}
              fill={this.styles.menuIcon.color}
              height={this.styles.menuIcon.fontSize}
            />
        </TouchableOpacity>}
      >
        {this.props.attributeDefs?.data &&
        <MenuItem
          {...getTestIdProperties(this.testID, "attribute-add-menu")}
          onPress={this.handleMenuAddAttribute}> {I18n.t("attributeAdd")}</MenuItem>
        }
      </Menu>
    </View>);
  }

  private handleMenuAddAttribute = () => {
    this.hideMenu();
    this.handleRightButtonAction();
  }

  private setMenuRef = (ref: any) => {
    this.menu = ref;
  }

  private hideMenu = () => {
    this.menu.hide();
  }

  private showMenu = () => {
    this.menu.show();
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private handleRightButtonAction(): void {
    this.props.navigation.push("attributeDefList", {
      onCancel: this.pop,
      preferredLanguage: _.get(this, "state.preferredLanguage.code"),
      customerAttributes: this.attributes || [],
      attributeGroupDefs: this.props.attributeDefs,
      onSelection: (attributeGroupDef: AttributeGroupDefinition) =>
          this.handleAddAttributeGroup(attributeGroupDef)
    });
  }

  private handleAddAttributeGroup(attrGroupDef: AttributeGroupDefinition): void {
    this.pop();
    //create a new customer attribute and display it in a new screen to edit by itself
    this.props.navigation.push("attributeEditor", {
      onCancel: this.pop,
      onAdd: (newAttr: IServiceCustomerAttribute) => this.handleEditAttributeGroup(newAttr),
      businessState: this.props.businessState,
      styles: this.styles,
      custAttribute: this.createNewAttribute(attrGroupDef),
      attributeDefs: this.props.attributeDefs,
      isUpdate: this.props.isUpdate});
  }

  private handleEditAttributeGroup(newAttr: IServiceCustomerAttribute): void {
    this.props.navigation.dispatch(popTo(this.props.isUpdate ? "customerUpdate" : "customerCreate"));
    this.attributes.push(newAttr);
    this.props.change("attributes", this.attributes);
    this.forceUpdate();
    newAttr.dataElements.map((element) => {
      this.props.change(newAttr.id + "-" + element.key, element.value[0]);
    });
  }

  private handleAttributeDelete(attr: IServiceCustomerAttribute): void {
    this.attributes = this.attributes
        .filter((a) => !(a.id === attr.id && a.groupCode === attr.groupCode));
    this.props.change("attributes", this.attributes);
    this.forceUpdate();
  }

  private getOptInOptions(): JSX.Element {
    if (this.props.displayEmailOptIn || this.props.displayTextOptIn || this.props.displayPhoneOptIn || this.props.displayMailOptIn) {
      return (
        <View style={this.styles.optInOptions}>
          {this.getOptInTitle()}
          {this.renderEmailOptIn()}
          {this.renderTextOptIn()}
          {this.renderPhoneOptIn()}
          {this.renderMailOptIn()}
        </View>
      );
    } else {
      return undefined;
    }
  }

  private renderCustomerDefinedAttributes(): JSX.Element {
    if (!(this.displayAttributes && this.props.attributeDefs && this.attributes && this.attributes.length > 0)) {
      return undefined;
    }

    return (
      <CustomerAttributeAddUpdate
        styles={this.styles}
        titleKey="attributes"
        custAttributes={this.attributes}
        attributeDefs={this.props.attributeDefs}
        isUpdate={this.props.isUpdate}
        onChange={this.props.change}
        onDelete={this.handleAttributeDelete}
        uiId={Math.floor(Math.random() * 100000000)}
        customerUiConfig={this.props.customerUiConfig}
        onConditionalRuleErrorChange={this.handleAttributeRuleErrorChange.bind(this)}
        navigation={this.props.navigation}
        setAttributeRef={this.setAttributeRef.bind(this)}
      />
    );
  }

  private setAttributeRef(ref: any): void {
    if (ref && !this.customerFieldRefs.attributes.has(ref.props.name)) {
      this.customerFieldRefs.attributes.set(ref.props.name, ref);
    }
  }

  private handleAttributeRuleErrorChange(preventSubmit: boolean): void {
    this.setState({hasConditionalAttributeRuleError: preventSubmit});
  }

  private getCustomerAttributesMain(): JSX.Element {
    return (
      <View>
        {!_.isEmpty(this.state.titles) && isVisible("title", this.props.customerUiConfig) &&
            this.renderSelect("titleCode", "title", this.state.titleCode, this.state.titles,
            this.changeTitleCode.bind(this), this.isEditableField("title"), "title")}
        {!_.isEmpty(this.state.languages) && isVisible("language", this.props.customerUiConfig) &&
            this.renderSelect("preferredLanguage", "preferredLanguage", this.state.preferredLanguage,
            this.state.languages, this.changePreferredLanguage.bind(this),
            this.isEditableField("language"), "language")}
        {this.renderCustomerType()}
        {!_.isEmpty(this.state.genders) && isVisible("gender", this.props.customerUiConfig) &&
            this.renderSelect("gender", "gender", this.state.gender, this.state.genders, this.changeGender.bind(this),
            this.isEditableField("gender"))}
        {this.renderBirthDate()}
      </View>
    );
  }

  private createNewAttribute(attributeGroupDef: AttributeGroupDefinition): IServiceCustomerAttribute {
    return {
      id: Math.floor(Math.random() * -10000).toString(),
      groupCode: attributeGroupDef.groupCode,
      dataElements: attributeGroupDef.dataElementDefinitions.map<IServiceCustomerAttributeDataElement>((ded) => {
        return {
          key: ded.key,
          value: []
        };
     })
    };

  }

  private createPromptOnCreateAttributes(): IServiceCustomerAttribute[] {
    if (this.props && this.props.attributeDefs &&  this.props.attributeDefs.data) {
      const promptOnCreateAttributeDef =
          this.props.attributeDefs.data.filter((def: AttributeGroupDefinition) => def.promptOnCreate);
      return promptOnCreateAttributeDef &&
           promptOnCreateAttributeDef.map((pocDef) => this.createNewAttribute(pocDef)) || [];
    }
    return [];
  }

  private renderEmailOptIn(): JSX.Element {
    if (this.props.displayEmailOptIn) {
      return (
        <View style={this.styles.optInRow}>
          <Text style={this.styles.textPrompt}>
            {I18n.t("emailOptIn")}
          </Text>
          <SegmentedControlTab
              tabsContainerStyle={this.styles.optInArea}
              activeTabStyle={this.styles.activeTabStyle}
              activeTabTextStyle={this.styles.activeTabTextStyle}
              tabStyle={this.styles.tabStyle}
              tabTextStyle={this.styles.tabTextStyle}
              enabled={!(this.props.isUpdate && !this.props.displayEmailOptIn)}
              values={[I18n.t("no"), I18n.t("yes"), I18n.t("unknownOptIn")]}
              selectedIndex={this.state.emailOpt === OptIn.False ? 0 : this.state.emailOpt === OptIn.True ? 1 : 2}
              onTabPress={(index: number) => {
                const optIn = (index === 0 ? OptIn.False : index === 1 ? OptIn.True : OptIn.Unknown);
                this.setState({ emailOpt: optIn }, () => {
                  this.props.change("emailOptIn", optIn);
                });
              }} />
        </View>
      );
    } else {
      return undefined;
    }
  }

  private renderTextOptIn(): JSX.Element {
    if (this.props.displayTextOptIn) {
      return (
        <View style={this.styles.optInRow}>
          <Text style={this.styles.textPrompt}>
            {I18n.t("textOptIn")}
          </Text>
          <SegmentedControlTab
              tabsContainerStyle={this.styles.optInArea}
              activeTabStyle={this.styles.activeTabStyle}
              activeTabTextStyle={this.styles.activeTabTextStyle}
              tabStyle={this.styles.tabStyle}
              tabTextStyle={this.styles.tabTextStyle}
              enabled={!(this.props.isUpdate && !this.props.displayTextOptIn)}
              values={[I18n.t("no"), I18n.t("yes"), I18n.t("unknownOptIn")]}
              selectedIndex={this.state.textOpt === OptIn.False ? 0 : this.state.textOpt === OptIn.True ? 1 : 2}
              onTabPress={(index: number) => {
                const optIn = (index === 0 ? OptIn.False : index === 1 ? OptIn.True : OptIn.Unknown);
                this.setState({textOpt: optIn}, () => {
                  this.props.change("textOptIn", optIn);
                });
              }} />
        </View>
      );
    } else {
      return undefined;
    }
  }

  private renderPhoneOptIn(): JSX.Element {
    if (this.props.displayPhoneOptIn) {
      return (
        <View style={this.styles.optInRow}>
          <Text style={this.styles.textPrompt}>
            {I18n.t("phoneOptIn")}
          </Text>
          <SegmentedControlTab
              tabsContainerStyle={this.styles.optInArea}
              activeTabStyle={this.styles.activeTabStyle}
              activeTabTextStyle={this.styles.activeTabTextStyle}
              tabStyle={this.styles.tabStyle}
              tabTextStyle={this.styles.tabTextStyle}
              enabled={!(this.props.isUpdate && !this.props.displayPhoneOptIn)}
              values={[I18n.t("no"), I18n.t("yes"), I18n.t("unknownOptIn")]}
              selectedIndex={this.state.phoneOpt === OptIn.False ? 0 : this.state.phoneOpt === OptIn.True ? 1 : 2}
              onTabPress={(index: number) => {
                const optIn = (index === 0 ? OptIn.False : index === 1 ? OptIn.True : OptIn.Unknown);
                this.setState({phoneOpt: optIn}, () => {
                  this.props.change("phoneOptIn", optIn);
                });
              }} />
        </View>
      );
    } else {
      return undefined;
    }
  }

  private renderMailOptIn(): JSX.Element {
    if (this.props.displayMailOptIn) {
      return (
        <View style={this.styles.optInRow}>
          <Text style={this.styles.textPrompt}>
            {I18n.t("mailOptIn")}
          </Text>
          <SegmentedControlTab
              tabsContainerStyle={this.styles.optInArea}
              activeTabStyle={this.styles.activeTabStyle}
              activeTabTextStyle={this.styles.activeTabTextStyle}
              tabStyle={this.styles.tabStyle}
              tabTextStyle={this.styles.tabTextStyle}
              enabled={!(this.props.isUpdate && !this.props.displayMailOptIn)}
              values={[I18n.t("no"), I18n.t("yes"), I18n.t("unknownOptIn")]}
              selectedIndex={this.state.mailOpt === OptIn.False ? 0 : this.state.mailOpt === OptIn.True ? 1 : 2}
              onTabPress={(index: number) => {
                const optIn = (index === 0 ? OptIn.False : index === 1 ? OptIn.True : OptIn.Unknown);
                this.setState({mailOpt: optIn}, () => {
                  this.props.change("mailOptIn", optIn);
                });
              }} />
        </View>
      );
    } else {
      return undefined;
    }
  }

  private renderBirthDate(): JSX.Element {
    if (isVisible("birthDay", this.props.customerUiConfig)) {
      const altDateFormat = getAlternateDateFormat(this.props.birthDateBehavior.dateFormat);
      const helpText = altDateFormat && I18n.t("customerBirthdateHelpText",
          {formatWithYear: this.props.birthDateBehavior.dateFormat, formatWithoutYear: altDateFormat});
      return (
        <Field
          name="birthDate"
          disabled={
            this.props.createdCustomer || (!this.props.birthDateBehavior.editable && !this.isEditableField("birthDay"))
          }
          onRef={(ref: any) => this.customerFieldRefs.birthDate = ref}
          placeholder={I18n.t("birthdate") + (isRequired("birthDay", this.props.customerUiConfig) ? "*" : "")}
          style={this.styles.textInput}
          component={renderDateInputField}
          errorStyle={this.styles.textInputError}
          dateFormat={this.props.birthDateBehavior.dateFormat}
          helpText={helpText}
          inputStyle={this.getInputStyle(this.props.birthDateBehavior.editable || this.isEditableField("birthDay"))}
          formatStyle={this.styles.dateFormat}
          showFormat={!altDateFormat}
          helpTextStyle={this.styles.helpText}
          persistPlaceholder={true} showErrorOnFocusOut={true}
        />
      );
    }

    return undefined;
  }

  private getValidationVatResult(value: boolean) : boolean {
    return (value || this.props.vatNumberRequired === false);
  }

  private changeCountry(newValue: RenderSelectOptions): void {
    this.setState({
        country: newValue,
        showDropDown: false,
        hasAddressValue: false
      }, () => {
      this.props.change("countryCode", newValue.code);
      this.props.change("countryName", newValue.description);
      this.props.change("address1", "");
      this.props.change("address2", "");
      this.props.change("address3", "");
      this.props.change("address4", "");
      this.props.change("city", "");
      this.props.change("state", "");
      this.props.change("postalCode", "");
    });
  }

  private isJapanRSSReceipt(): boolean {
    return this.state.isJapanRSSReceipt;
  }

  private handleMoveToCountryPhoneCode(): void {
    this.props.navigation.push("phoneCountryCode", {
      onCancel: this.pop,
      onSelection: (phoneCountryCode: PhoneCountryCode) => this.setState(
          () => ({ phoneCountryCode }),
          () => {
            this.props.change("phoneCountryCode", phoneCountryCode.secondaryCountryCode);
            this.props.navigation.pop();
          }),
      selectedValue: this.state.phoneCountryCode
    });
  }

  private handleBackPress(): void {
    if (this.customerFieldRefs.address1) {
      this.customerFieldRefs.address1.blur();
    }
    InteractionManager.runAfterInteractions(
        () => warnBeforeLosingChanges(this.props.dirty, this.props.onCancel)
    );
  }

  private renderCustomerType(): JSX.Element {
    return (
        isVisible("customerType", this.props.customerUiConfig) &&
        (!_.isEmpty(this.state.customerType) && !this.props.displayTaxInformation) &&
        this.renderSelect("customerType", "customerType", this.state.customerType,
            this.state.customerTypesOptions,
            this.changeCustomerTypeOptions.bind(this), this.isEditableField("customerType"))
    );
  }

  private renderNameFields(): JSX.Element {
    return (
      <>
        {
          this.showNameFields("lastName") &&
          <Field name="lastName" onRef={(ref: any) => this.customerFieldRefs.lastName = ref}
            disabled={this.props.createdCustomer || !this.isEditableField("lastName")}
            placeholder={
              I18n.t("lastName") + (this.isJapanRSSReceipt() || this.isConditionallyRequired("lastName") ||
                  isRequired("lastName", this.props.customerUiConfig) ? "*" : "")
            }
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            inputStyle={this.getInputStyle(this.isEditableField("lastName"))}
            onSubmitEditing={() => this.focusNextField("lastName")}/>
        }
        {
          this.showNameFields("firstName") &&
          <Field name="firstName" onRef={(ref: any) => this.customerFieldRefs.firstName = ref}
            disabled={this.props.createdCustomer || !this.isEditableField("firstName")}
            placeholder={
              I18n.t("firstName") + (this.isJapanRSSReceipt() || this.isConditionallyRequired("firstName") ||
                  isRequired("firstName", this.props.customerUiConfig) ? "*" : "")}
            autoCapitalize="words" style={this.styles.textInput}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            inputStyle={this.getInputStyle(this.isEditableField("firstName"))}
            onSubmitEditing={() => this.focusNextField("firstName")}/>
        }
        {
          this.showNameFields("nameSuffix")  &&
          <Field name="suffix" onRef={(ref: any) => this.customerFieldRefs.suffix = ref}
            disabled={this.props.createdCustomer || !this.isEditableField("nameSuffix")}
            placeholder={
              I18n.t("suffix") + (this.isJapanRSSReceipt() || isRequired("nameSuffix", this.props.customerUiConfig) ||
                  this.isJapanRSSReceipt() ? "*" : "")}
            autoCapitalize="words" style={this.styles.textInput}
            maxLength={40}
            component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
            inputStyle={this.getInputStyle(this.isEditableField("nameSuffix"))}
            onSubmitEditing={() => this.focusNextField("nameSuffix")}/>
        }
      </>
    );
  }

  private renderCountry(): JSX.Element {
    return (
      isVisible("country", this.props.customerUiConfig) && !_.isEmpty(this.state.countries) &&
      this.renderSelect("countryCode", "country", this.state.country, this.state.countries,
          this.changeCountry.bind(this), this.isEditableField("country"), "country")
    );
  }

  private renderCompany(): JSX.Element {
    return (
        isVisible("company", this.props.customerUiConfig) &&
        <Field name="companyName" onRef={(ref: any) => this.customerFieldRefs.companyName = ref}
               disabled={!this.isEditableField("company")}
               inputStyle={this.getInputStyle(this.isEditableField("company"))}
               placeholder={I18n.t("company") + (isRequired("company", this.props.customerUiConfig) ? "*" : "")}
               autoCapitalize="words" style={this.styles.textInput}
               component={renderTextInputField} errorStyle={this.styles.textInputError} persistPlaceholder={true}
               onSubmitEditing={() => this.focusNextField("companyName")}/>
    );
  }

  private setSelectRef(ref: any): void {
    if (ref?.name) {
      this.customerFieldRefs[ref.name] = ref;
    }
  }

  private renderSelect(name: string, placeholder: string, selectedOption: RenderSelectOptions,
                       options: RenderSelectOptions[], onOptionChosen: any, editable: boolean,
                       configKey?: string): JSX.Element {
    return (
        <Field
            name={name}
            ref={this.setSelectRef.bind(this)}
            component={renderOptionsSelect}
            placeholder={I18n.t(placeholder) + (isRequired(configKey || name, this.props.customerUiConfig) ? "*" : "")}
            onOptionChosen={onOptionChosen}
            options={options}
            selectedOption={selectedOption}
            scene={placeholder}
            disabled={!editable}
            inputStyle={!editable ? this.styles.inputDisabled : {}}
        />
    );
  }

  private showNameFields(fieldName: string): boolean {
    return this.isJapanRSSReceipt() ? fieldName !== "nameSuffix" : isVisible(fieldName, this.props.customerUiConfig);
  }

  private changeCustomerTypeOptions = (newValue: RenderSelectOptions) => {
    this.setState({ customerType: newValue},
      () => this.props.change("customerType", newValue.code));
  }

  private onSelectAddressDropdown(newValue: string): void {
    const id = newValue.split("&id=")[1];
    this.setState({ searchNavigationFlag: true },
      () => this.props.loadVerifyAddress(id, this.state.country.code));
  }

  private preventAddressPage(flag: boolean): void {
    this.setState({hasAddressValue: flag});
  }

  private onChangeOfAddress(event: Event, values: string): void {
    if (values === "") {
      this.setState({hasAddressValue: false});
      this.customerFieldRefs.address1.blur();
    }
  }

  private changeGender(newValue: RenderSelectOptions): void {
    this.setState({ gender: newValue }, () => {
      this.props.change("gender", newValue.code);
    });
  }

  private changePreferredLanguage(newValue: RenderSelectOptions): void {
    this.setState({ preferredLanguage: newValue }, () => {
      this.props.change("preferredLanguage", newValue.code);
    });
  }

  private updateStateOfAddressField(): void {
    this.props.change("address1", this.props.verifyAddressState.address.addressLine1);
    this.props.change("address2", this.props.verifyAddressState.address.addressLine2);
    this.props.change("address3", this.props.verifyAddressState.address.addressLine3);
    this.props.change("address4", "");
    this.props.change("city", this.props.verifyAddressState.address.city);
    this.props.change("state", this.props.verifyAddressState.address.state);
    this.props.change("postalCode", this.props.verifyAddressState.address.postalCode);
  }

  private changeTitleCode(newValue: RenderSelectOptions): void {
    this.setState({ titleCode: newValue }, () => {
      this.props.change("titleCode", newValue.code);
    });
  }

  private hidePopUp(): void {
    this.setState({ temporaryCustomerMessage: undefined });
  }

  private initializeCustomerDetail(customerDetails: Customer): void {

    const custAttributesForInit: any = {};
    if (this.attributes) {
      this.attributes.map((attr) => {
        if (attr.dataElements) {
          attr.dataElements.map((element) => {
            const fieldName: string = attr.id + "-" + element.key;
            const fieldVal: string = element && element.value
                && element.value.length > 0 && element.value[0];
            if (fieldName && fieldVal) {
              custAttributesForInit[attr.id + "-" + element.key] = element.value[0];
            }
          });
        }
      });
      custAttributesForInit["attributes"] = this.attributes;
    }

    if (customerDetails) {
      const { phoneNumber, lastName, firstName, suffix, emailAddress, countryCode, countryName, companyName, address1, address2, city,
        postalCode, state, emailOptIn, textOptIn, phoneOptIn, mailOptIn, gender, birthDate, preferredLanguage,
        titleCode, customerType, phoneCountryCode, address3, address4, district } = customerDetails;
      const dateFormat = birthDate?.getFullYear() === this.props.birthDateBehavior.defaultYear ?
          getAlternateDateFormat(this.props.birthDateBehavior.dateFormat) : this.props.birthDateBehavior.dateFormat;
      this.props["initialize"]({
        firstName,
        lastName,
        suffix,
        emailAddress,
        phoneCountryCode: phoneCountryCode || _.get(this.state, "phoneCountryCode.secondaryCountryCode"),
        phoneNumber,
        countryCode: countryCode || _.get(this.state, "country.code"),
        countryName: countryName || this.state?.country?.description,
        companyName,
        address1,
        address2,
        address3,
        address4,
        city,
        district,
        state,
        postalCode,
        emailOptIn: emailOptIn || OptIn.Unknown,
        textOptIn: textOptIn || OptIn.Unknown,
        phoneOptIn: phoneOptIn || OptIn.Unknown,
        mailOptIn: mailOptIn || OptIn.Unknown,
        gender,
        birthDate: birthDate ? moment(birthDate).format(dateFormat) : undefined,
        preferredLanguage,
        titleCode,
        customerType: !customerType ? CustomerType[0].code : customerType,
        ...custAttributesForInit
      });
    } else {
      this.props["initialize"]({
        emailAddress: this.props.scannedCustomerEmail,
        emailOptIn: OptIn.Unknown,
        textOptIn: OptIn.Unknown,
        phoneOptIn: OptIn.Unknown,
        phoneCountryCode: _.get(this.state, "phoneCountryCode.secondaryCountryCode"),
        mailOptIn: OptIn.Unknown,
        countryCode: this.state.country && this.state.country.code,
        countryName: this.state.country && this.state.country.description,
        customerType: CustomerType[0].code,
        ...custAttributesForInit
      });
    }

  }

  private initializeTaxCustomerDetail(taxCustomer: TaxCustomer): void {
    const { phoneNumber, lastName, firstName, countryCode, countryName, companyName, address1, address2, city,
      postalCode, state, addressCode, pecAddress, taxCode, governmentTaxIdentifier, phoneCountryCode,
      address3, address4, district, idNumber, ruc, customerType } = taxCustomer;

    this.props["initialize"]({
      firstName,
      lastName,
      phoneCountryCode: phoneCountryCode || _.get(this.state, "phoneCountryCode.secondaryCountryCode"),
      phoneNumber,
      countryCode: countryCode || _.get(this.state, "country.code"),
      countryName: countryName || this.state?.country?.description,
      companyName,
      address1,
      address2,
      address3,
      address4,
      city,
      district,
      state,
      postalCode,
      addressCode: (addressCode && addressCode.value) ? addressCode.value : undefined,
      pecAddress: (pecAddress && pecAddress.value) ? pecAddress.value : undefined,
      taxCode: (taxCode && taxCode.value) ? taxCode.value : undefined,
      taxIdentifier: (governmentTaxIdentifier && governmentTaxIdentifier.value)
          ? governmentTaxIdentifier.value : undefined,
      idNumber: (idNumber && idNumber.value) ? idNumber.value : undefined,
      ruc: (ruc && ruc.value) ? ruc.value : undefined,
      customerType
    });
  }
}

const asyncValidate = async (values: CustomerAddUpdateForm, dispatch: Dispatch<any>, props: Props) => {
  const {configurationManager, diContainer} = props.settings;
  if (isEditable("emailAddress", props.customerUiConfig, true) && values.emailAddress &&
      getAdvanceEmailVerification(configurationManager)) {
    let response;
    try {
       response = await loadEmailVerification(diContainer, configurationManager, values.emailAddress);
    } catch (error) {
       logger.warn("Error during email verification, bypassing to allow email submission.", error);
    }
    const updatedMessage = configurationManager.getFunctionalBehaviorValues()
        .advancedVerificationBehaviors.advancedEmailVerification;
    if (response === (updatedMessage.invalidWithByPassEmailMessage &&
        updatedMessage.invalidWithByPassEmailMessage[I18n.currentLocale()]
        || I18n.t("invalidWithBypassEmailMessage"))) {
      props.emailVerificationWarningMessage(response);
    } else if (response === (updatedMessage.invalidEmailMessage &&
        updatedMessage.invalidEmailMessage[I18n.currentLocale()] ||
        I18n.t("invalidEmailMessage"))) {
      props.emailVerificationWarningMessage("");
      throw {emailAddress: response};
    } else {
      props.emailVerificationWarningMessage("");
    }
  }
};

const form = reduxForm<CustomerAddUpdateForm, Props>({
  form: "customerAddUpdate",
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  asyncValidate,
  asyncBlurFields: ["emailAddress"],
  // tslint:disable-next-line:cyclomatic-complexity
  validate: (values: CustomerAddUpdateForm, props: DecoratedFormProps<CustomerAddUpdateForm, Props>) => {
    const errors: {
      lastName: string, firstName: string, suffix: string, emailAddress: string, phoneNumber: string, countryCode: string,
      countryName: string, companyName: string, address1: string, address2: string, city: string, state: string, postalCode: string,
      taxIdentifier: string, birthDate: string, taxCode: string, pecAddress: string, addressCode: string,
      address3: string, address4: string, district: string, titleCode: string, gender: string,
      preferredLanguage: string, address: string, idNumber: string, ruc: string
    } = {
      lastName: undefined, firstName: undefined, suffix: undefined, emailAddress: undefined, phoneNumber: undefined,
      countryCode: undefined, countryName: undefined, companyName: undefined, address1: undefined, address2: undefined, city: undefined,
      state: undefined, postalCode: undefined, taxIdentifier: undefined, birthDate: undefined, taxCode: undefined,
      pecAddress: undefined, addressCode: undefined, address3: undefined, address4: undefined, district: undefined,
      titleCode: undefined, gender: undefined, preferredLanguage: undefined, address: undefined, idNumber: undefined,
      ruc: undefined
    };
    const i18nLocation = props.i18nLocation;
    const customerTaxInformation = customerTaxInformations(props.settings.configurationManager, i18nLocation);
    const taxInfoValidation = (captureConfig: UserTaxInformation, validationValue: string, field: string): void => {
      if (validationValue && captureConfig) {
        if ((captureConfig.minLength && (validationValue.length < captureConfig.minLength)) ||
          (captureConfig.maxLength && validationValue.length > captureConfig.maxLength)) {
          let characterCount = "";
          if (captureConfig.minLength !== undefined && captureConfig.maxLength !== undefined) {
            characterCount = `${captureConfig.minLength} - ${captureConfig.maxLength}`;
          } else if (captureConfig.minLength) {
            characterCount = captureConfig.minLength + "";
          } else if (captureConfig.maxLength) {
            characterCount = captureConfig.maxLength + "";
          }
          errors[field] = I18n.t("minMaxValidation", { characterCount });
        }
        if (captureConfig.typeBehaviour && !validationValue.match(captureConfig.typeBehaviour.pattern)) {
          if (captureConfig.typeBehaviour.typeOfBehaviour === UserTaxValidationPattern.Numeric) {
            errors[field] = I18n.t("numericValidation");
          } else if (captureConfig.typeBehaviour.typeOfBehaviour === UserTaxValidationPattern.AlphaNumeric) {
            errors[field] = I18n.t("alphaNumericValidation");
          }
        }
      }
    };
    taxInfoValidation(customerTaxInformation.captureTaxCode, values.taxCode, "taxCode");
    taxInfoValidation(customerTaxInformation.captureAddressCode, values.addressCode, "addressCode");
    taxInfoValidation(customerTaxInformation.capturePecAddress, values.pecAddress, "pecAddress");
    taxInfoValidation(customerTaxInformation.captureRegionalTaxIdentifier, values.taxIdentifier, "taxIdentifier");
    taxInfoValidation(customerTaxInformation.captureIdNumber, values.idNumber, "idNumber");
    taxInfoValidation(customerTaxInformation.captureRUC, values.ruc, "ruc");
    const isConditionallyRequired = isRequired("address", props.customerUiConfig) || (props.customerValidationDetails && props.customerValidationDetails.address);
    const countryAddressFormat = isEditable("address", props.customerUiConfig, true) && validateAddressFields(errors, values, props.settings.configurationManager,
        isConditionallyRequired, props.displayTaxInformation, i18nLocation);
    const countryPhoneFormat = isEditable("phoneNumber", props.customerUiConfig, true) && validatePhoneFields(errors, values, props.settings.configurationManager);

    const attributes: IServiceCustomerAttribute[] = values["attributes"];
    const attributeDefs: AttributeGroupDefinition[] = props.attributeDefs && props.attributeDefs.data;

    if (attributes) {
      const locale = getStoreLocale();
      const dateFormat = I18n.t("date.format", {locale});
      attributes.map((attr: IServiceCustomerAttribute) => {
        const attrDef = attributeDefs && attributeDefs.find((def) => {
          return def.groupCode === attr.groupCode && !def.isReadOnly;
        });
        if (attrDef) {
          attrDef.dataElementDefinitions.map((elementDef) => {
            const value = values[attr.id + "-" + elementDef.key];
            if (elementDef && elementDef.isRequired && !(value && value.length > 0) &&
                elementDef.fieldType !== "boolean") {
              errors[attr.id + "-" + elementDef.key] = I18n.t("required");
            } else if (elementDef.fieldType === "date" && value && value.length > 0 &&
                value.length <= dateFormat.length) {
              const date = moment(value, dateFormat, true);
              if (!date.isValid()) {
                errors[attr.id + "-" + elementDef.key] = I18n.t("invalidDate");
              } else {
                let dtString = date.toISOString();
                dtString = dtString.substr(0, dtString.indexOf("T")) + "T00:00:00";
                props.change(attr.id + "-" + elementDef.key, dtString);
              }
            }
          });
        }
      });
    }

    const isValid = validateRequiresOneOf(errors, values, props.requiresOneFromEachGroup, props.settings.configurationManager,
      taxInvoiceAndCustomerDetailsMap, props.displayTaxInformation, i18nLocation);

    if (isValid) {
      if(props.feedbackNoteState?.feedBackNotes.has(ErrorMessageId.RequiredFields)) {
        // Clear conditional error heading message
        props.feedbackNoteSuccess(ErrorMessageId.RequiredFields);
      }
    } else {
      props.feedbackNoteRequest(I18n.t("conditionalRequiredFields"), "conditionalRequiredFields",
          ErrorMessageId.RequiredFields);
    }

    const fieldRequiredValidation = (fieldKey: string, configKey: string, defaultVisible?: boolean): void => {
      if (props.customerUiConfig && !values[fieldKey]) {
        if (isRequired(configKey, props.customerUiConfig, defaultVisible) &&
            isVisible(configKey, props.customerUiConfig, defaultVisible) &&
            isEditable(configKey, props.customerUiConfig, true)) {
          errors[fieldKey] = I18n.t("required");
        }
      }
    };

    fieldRequiredValidation("suffix", "nameSuffix", false);
    fieldRequiredValidation("titleCode", "title");
    fieldRequiredValidation("gender", "gender");
    fieldRequiredValidation("companyName", "company");
    fieldRequiredValidation("countryCode", "country");
    fieldRequiredValidation("preferredLanguage", "language");
    if (props.receiptCategory === ReceiptCategory.JapanRSSReceipt) {
      if (!values.firstName) {
        errors.firstName = I18n.t("required");
      }
      if (!values.lastName) {
        errors.lastName = I18n.t("required");
      }
    } else if (i18nLocation &&
        (i18nLocation === I18nLocationValues.Peru || i18nLocation === I18nLocationValues.Portugal)
        && props.customerValidationDetails) {
      if (props.customerValidationDetails.firstName && !values.firstName) {
        errors.firstName = I18n.t("required");
      }
      if (props.customerValidationDetails.lastName && !values.lastName) {
        errors.lastName = I18n.t("required");
      }
    } else {
      fieldRequiredValidation("firstName", "firstName", !props.displayTaxInformation);
      fieldRequiredValidation("lastName", "lastName", !props.displayTaxInformation);
    }

    if (!values.companyName && (props.displayTaxInformation && props.editableCustomer &&
        props.editableCustomer.customerType === CustomerTypeEnum.Business &&
        customerTaxInformation.validateCompanyName)) {
      errors.companyName = I18n.t("required");
    }

    if (isRequired("phoneNumber", props.customerUiConfig) && isVisible("phoneNumber", props.customerUiConfig) &&
        isEditable("phoneNumber", props.customerUiConfig, true) && !values.phoneNumber) {
      errors.phoneNumber = I18n.t("required");
    } else if (!countryPhoneFormat && values.phoneNumber && !values.phoneNumber.match(/^[0-9]{10}|[0-9]{7}$/)) {
      errors.phoneNumber = I18n.t("customerCannotBeCreatedPhoneNumberInvalidFormat");
    }

    if (isRequired("emailAddress", props.customerUiConfig, !props.displayTaxInformation) &&
        isEditable("emailAddress", props.customerUiConfig, true) &&
        isVisible("emailAddress", props.customerUiConfig, !props.displayTaxInformation) &&
        !values.emailAddress) {
      errors.emailAddress = I18n.t("required");
    } else if (values.emailAddress && !isEmail(values.emailAddress)) {
      props.emailVerificationWarningMessage("");
      errors.emailAddress = I18n.t("customerCannotBeCreatedEmailAddressInvalidFormat");
    }
    const customerAddressOverrides = getCustomerAddressOverrides(props.settings.configurationManager,
        countryAddressFormat?.country , i18nLocation);
    const isRequiredUsage = (fieldUsageKey: string): boolean => {
      if (customerAddressOverrides && customerAddressOverrides[fieldUsageKey] && !props.displayTaxInformation) {
        return customerAddressOverrides[fieldUsageKey] === Usage.Required;
      }
      return countryAddressFormat && countryAddressFormat[fieldUsageKey] === Usage.Required;
    };
    const resetErrorMessage = (addressFieldName: string) => {
      errors[addressFieldName] = "";
    };

    if (props.displayTaxInformation && i18nLocation &&
       (i18nLocation === I18nLocationValues.Peru || i18nLocation === I18nLocationValues.Portugal)) {
      if (countryAddressFormat && props.customerValidationDetails && props.customerValidationDetails.address === true) {
        if (isRequiredUsage("addressLine1Usage") && !values.address1) {
          errors.address1 = I18n.t("required");
        }
        if (isRequiredUsage("addressLine2Usage") && !values.address2) {
          errors.address2 = I18n.t("required");
        }
        if (isRequiredUsage("addressLine3Usage") && !values.address3) {
          errors.address3 = I18n.t("required");
        }
        if (isRequiredUsage("addressLine4Usage") && !values.address4) {
          errors.address4 = I18n.t("required");
        }
        if (isRequiredUsage("firstAdminDivisionUsage") && !values.state) {
          errors.state = I18n.t("required");
        }
        if (isRequiredUsage("secondAdminDivisionUsage") && !values.district) {
          errors.district = I18n.t("required");
        }
        if (isRequiredUsage("cityUsage") && !values.city) {
          errors.city = I18n.t("required");
        }
        if (isRequiredUsage("postalCodeUsage") && !values.postalCode) {
          errors.postalCode = I18n.t("required");
        }
      } else {
        resetErrorMessage("address1");
        resetErrorMessage("address2");
        resetErrorMessage("address3");
        resetErrorMessage("address4");
        resetErrorMessage("state");
        resetErrorMessage("district");
        resetErrorMessage("city");
        resetErrorMessage("postalCode");
      }
    } else if ((isRequired("address", props.customerUiConfig, false) ||
        props.requiresOneFromEachGroup?.some((c: any) => c.includes("address") &&
            !validateGroup(errors, values, c, props.settings.configurationManager,
            taxInvoiceAndCustomerDetailsMap, false, props.displayTaxInformation,
            i18nLocation))) &&
        !props.displayTaxInformation &&
        !isRequiredUsage("addressLine1Usage") &&
        !isRequiredUsage("addressLine2Usage") &&
        !isRequiredUsage("addressLine3Usage") &&
        !isRequiredUsage("addressLine4Usage") &&
        !isRequiredUsage("cityUsage") &&
        !isRequiredUsage("secondAdminDivisionUsage") &&
        !isRequiredUsage("firstAdminDivisionUsage") &&
        !isRequiredUsage("postalCodeUsage") &&
        !(values.address1 || values.address2 || values.address3 || values.address4 ||
            values.city || values.district || values.state || values.postalCode)) {
      errors.address = I18n.t("addressRequiredFields"); // Not displayed. Just populating with any value
      props.feedbackNoteRequest(I18n.t("addressRequiredFields"), "addressRequiredFields", ErrorMessageId.Address);
    } else if (props.feedbackNoteState?.feedBackNotes.has(ErrorMessageId.Address)) {
      // Clear conditional error heading message
      props.feedbackNoteSuccess(ErrorMessageId.Address);
    }

    if (values.postalCode && countryAddressFormat &&
        !validateAllowedContent(values.postalCode, countryAddressFormat.postalCodeAllowedContent)) {
      errors.postalCode = I18n.t(getPostalCodeAllowedContentErrorCode(countryAddressFormat.postalCodeAllowedContent));
    }

    if (!countryAddressFormat && values.city && values.city.length < 4 &&
        isEditable("address", props.customerUiConfig, true)) {
      errors.city = I18n.t("required", { field: I18n.t("city") });
    }

    if (!countryAddressFormat && values.address1 && values.address1.length < 6 &&
        isEditable("address", props.customerUiConfig, true)) {
      errors.address1 = I18n.t("required", { field: I18n.t("address1") });
    }
    if ((props.displayTaxInformation) && ((props.vatNumberRequired === false
        && !values.taxIdentifier) || (customerTaxInformation.captureRegionalTaxIdentifier &&
        customerTaxInformation.captureRegionalTaxIdentifier.required && !values.taxIdentifier))) {
      errors.taxIdentifier = I18n.t("required", { field: I18n.t("taxInformationMissing") });
    }

    if ((props.displayTaxInformation) && ((props.isRucRequired === true
        && !values.ruc) || (customerTaxInformation.captureRUC &&
        customerTaxInformation.captureRUC.required && !values.ruc))) {
      errors.ruc = I18n.t("required", { field: I18n.t("ruc") });
    }

    if (props.displayTaxInformation && customerTaxInformation.captureIdNumber) {
      if (customerTaxInformation.captureIdNumber.required && !values.idNumber) {
        errors.idNumber = I18n.t("required", { field: I18n.t("idNumber") });
      }
    }
    if (props.displayTaxInformation && customerTaxInformation.captureTaxCode) {
      if (customerTaxInformation.captureTaxCode.required && !values.taxCode && !values.pecAddress) {
        errors.taxCode = I18n.t("required", { field: I18n.t("taxCodeOrPecAddressMissing") });
      }
    }

    if (props.displayTaxInformation && customerTaxInformation.captureAddressCode &&
        customerTaxInformation.captureAddressCode.required && !values.addressCode) {
      errors.addressCode = I18n.t("required", { field: I18n.t("addressCode") });
    }

    if (props.displayTaxInformation && customerTaxInformation.captureTaxCode &&
        customerTaxInformation.captureTaxCode.required && !values.taxCode) {
      errors.taxCode = I18n.t("required", { field: I18n.t("taxCode") });
    }

    if (props.displayTaxInformation && customerTaxInformation.capturePecAddress &&
        customerTaxInformation.capturePecAddress.required && !values.pecAddress) {
      errors.pecAddress = I18n.t("required");
    } else if (values.pecAddress && !isEmail(values.pecAddress)) {
      errors.pecAddress = I18n.t("customerCannotBeCreatedEmailAddressInvalidFormat");
    }

    const altDateFormat = getAlternateDateFormat(props.birthDateBehavior.dateFormat);
    const isValidBirthDate = (birthDate: string, dateFormat: string, formatWithoutYear: string): boolean => {
      if (birthDate) {
        if ((!formatWithoutYear && birthDate.length !== dateFormat.length) ||
            (formatWithoutYear && birthDate.length !== dateFormat.length &&
                birthDate.length !== formatWithoutYear.length) ||
            (!formatWithoutYear && !moment(birthDate, dateFormat).isValid()) ||
            (formatWithoutYear && !moment(birthDate, dateFormat).isValid() &&
                !moment(birthDate, formatWithoutYear).isValid()) ||
            (dateFormat.indexOf("YYYY") > -1 && birthDate.length === dateFormat.length &&
                moment(values.birthDate, props.birthDateBehavior.dateFormat).isAfter(moment(new Date())))) {
          return false;
        }
      }
      return true;
    };

    if (isVisible("birthDay", props.customerUiConfig)  && !props.displayTaxInformation) {
      if (isRequired("birthDay", props.customerUiConfig) && isEditable("birthDay", props.customerUiConfig, true) &&
          !values.birthDate) {
        errors.birthDate = I18n.t("required", { field: I18n.t("birthdate") });
      } else if (!isValidBirthDate(values.birthDate, props.birthDateBehavior.dateFormat, altDateFormat)) {
        errors.birthDate = !altDateFormat ? I18n.t("invalidDateFormat",
            {format: props.birthDateBehavior.dateFormat}) : I18n.t("invalidDateFormats",
            {formatWithYear: props.birthDateBehavior.dateFormat, formatWithoutYear: altDateFormat});
      }
    }

    return errors;
  },
  initialValues: {
    firstName: undefined, lastName: undefined, suffix: undefined, emailAddress: undefined, phoneNumber: undefined,
    countryCode: undefined, companyName: undefined, address1: undefined, address2: undefined, city: undefined,
    state: undefined, countryName: undefined, postalCode: undefined, taxIdentifier: undefined, emailOptIn: OptIn.Unknown,
    textOptIn: OptIn.Unknown, phoneOptIn: OptIn.Unknown, gender: undefined,
    birthDate: undefined, preferredLanguage: undefined, titleCode: undefined,
    taxCode: undefined, pecAddress: undefined, addressCode: undefined, customerType: CustomerType[0].code,
    attributes: undefined, idNumber: undefined, ruc: undefined
  },
  onSubmit: (data: CustomerAddUpdateForm, dispatch: Dispatch<any>, props: Props) => {
    const {
      lastName,
      firstName,
      suffix,
      emailAddress,
      phoneCountryCode,
      phoneNumber,
      countryCode,
      companyName,
      address1,
      address2,
      address3,
      address4,
      city,
      district,
      state,
      postalCode,
      countryName,
      taxIdentifier,
      taxCode,
      pecAddress,
      addressCode,
      emailOptIn,
      textOptIn,
      phoneOptIn,
      mailOptIn,
      gender,
      preferredLanguage,
      titleCode,
      birthDate,
      customerType,
      idNumber,
      ruc
    } = data;
    /*
    customerNumber: string;
    salutation: string;
    headOfHouseholdFlag?: boolean;
    */

    if (props.feedbackNoteState && props.feedbackNoteState.feedBackNotes.has(ErrorMessageId.Address)) {
      throw new SubmissionError({address: ErrorMessageId.Address});
    }
    // Set the year in the date in cases the format doesn't include it as those case where the format is MM/DD
    const { dateFormat, defaultYear } = props.birthDateBehavior;
    let customerBirthDate = birthDate ? moment(birthDate, dateFormat) : undefined;
    if (customerBirthDate) {
      if (birthDate.length === 5) {
        if (props.editableCustomer && props.editableCustomer.birthDate &&
            moment(props.editableCustomer.birthDate).year() !== defaultYear) {
          customerBirthDate = customerBirthDate.year(moment(props.editableCustomer.birthDate).year());
        } else {
          customerBirthDate = customerBirthDate.year(defaultYear);
        }
      } else if (dateFormat.indexOf("YYYY") === -1) {
        const today = moment(new Date());
        if (customerBirthDate.isAfter(today)) {
          customerBirthDate = customerBirthDate.subtract(100, "y");
        }
      }
    }
    const i18nLocation = props.i18nLocation;
    const customerTaxInformation = customerTaxInformations(props.settings.configurationManager, i18nLocation);
    const attributes: IServiceCustomerAttribute[] = data["attributes"];
    const attributeDefs: AttributeGroupDefinition[] = props.attributeDefs && props.attributeDefs.data;
    if (attributes && attributeDefs) {
      attributes.map((attr: IServiceCustomerAttribute) => {
        const attrDef = attributeDefs && attributeDefs.find((def) => def.groupCode === attr.groupCode);
        if (attrDef) {
          attrDef.dataElementDefinitions.map((elementDef) => {
            if (elementDef && elementDef.fieldType === "boolean") {
              const dataElem = attr.dataElements.find((de) => elementDef.key === de.key);
              if (dataElem) {
                dataElem.value = dataElem.value && dataElem.value.length > 0 &&
                    dataElem.value[0].length > 0 ? dataElem.value : ["false"];
              }
            }
          });
        }
      });
    }

    props.onSave({
      lastName,
      firstName,
      suffix,
      emailAddress,
      phoneCountryCode,
      phoneNumber,
      countryCode: countryCode || getAddressFormatorDefault(props.settings.configurationManager, undefined, i18nLocation)?.countryCode,
      companyName,
      address1,
      address2,
      address3,
      address4,
      city,
      district,
      state,
      postalCode,
      countryName,
      emailOptIn,
      textOptIn,
      phoneOptIn,
      mailOptIn,
      gender,
      preferredLanguage,
      titleCode,
      birthDate: customerBirthDate ? customerBirthDate.toDate() : undefined,
      customerType,
      attributes: data["attributes"]
    } as Customer, taxIdentifier, customerTaxInformation.regionalTaxIdentifierLocalTypeCode, taxCode,
    customerTaxInformation.taxCodeLocalTypeCode, pecAddress, customerTaxInformation.pecAddressLabelText, addressCode,
    customerTaxInformation.addressCodeLabelText, idNumber, customerTaxInformation.idNumberLocalTypeCode,
    ruc, customerTaxInformation.rucLocalTypeCode );
    Keyboard.dismiss();
  },
  onSubmitFail: (errors: FormErrors<CustomerAddUpdateForm>, dispatch: Dispatch<any>, submitError: any,
                 props: Props) => {
    if (!errors) {
      props.onFailed();
    } else if (props.onFailedWithErrors) {
      props.onFailedWithErrors(errors);
    }
  }
});

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    customer: state.customer,
    settings: state.settings,
    updatedEmailVerificationWarningMessage: state.emailVerification,
    searchAddressState: state.searchAddress,
    verifyAddressState: state.verifyAddress,
    feedbackNoteState: state.feedbackNote,
    receiptCategory: state.receipt.receiptCategory,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}
export default connect(mapStateToProps, {
  sceneTitle: sceneTitle.request,
  loadSearchAddress: loadSearchAddressAction.request,
  loadVerifyAddress: loadVerifyAddressAction.request,
  emailVerificationWarningMessage: emailVerificationWarningAction.request,
  feedbackNoteRequest: feedbackNoteAction.request,
  feedbackNoteSuccess: feedbackNoteAction.success
})((form)(CustomerAddUpdate));
