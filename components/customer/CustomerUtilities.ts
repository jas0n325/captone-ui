import { Container } from "inversify";
import _ from "lodash";

import { IConfigurationManager, IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";
import {
  AllowedContent,
  Customer,
  DI_TYPES as FEATURES_DI_TYPES,
  EmailStatus,
  IAppLocalFeaturesStorage,
  ICustomerAttributeOptions,
  ICustomerLoyaltyMembership,
  IDisplayBehavior,
  IEmailVerificationApi,
  ILabel,
  IStoreLoyaltyPlans,
  ITaxIdentifier,
  LoyaltyQualifyingTransactions,
  PhoneCountryCode,
  PhoneFormatConfig,
  ReceiptTypeAllowedTransactionType,
  TaxCustomer,
  TaxCustomerLine,
  Usage
} from "@aptos-scp/scp-component-store-selling-features";
import { CustomerType } from "@aptos-scp/scp-types-commerce-transaction";
import {
  AttributeDataElementDefinition,
  AttributeDataElementEnumValue,
  AttributeGroupDefinition,
  AttributeGroupDefinitionList
} from "@aptos-scp/scp-types-customer";
import { LoyaltyPlan } from "@aptos-scp/scp-types-loyalty-memberships";

import I18n from "../../../config/I18n";
import { compareRenderSelectOptions, RenderSelectOptions } from "../common/FieldValidation";
import { CustomerTaxInformation, UserTaxInformation, UserTaxValidationPattern } from "./CustomerAddUpdate";
import { CustomerNIPTaxInformation } from "./CustomerNip";

export const enum GovernmentTaxIdentifierLocalTypeCode {
  VatNumber = "vatNumber",
  TaxCode = "taxCode",
  IdNumber = "idNumber",
  RUC = "ruc",
  NIP = "nip"
}

export const enum SingleResultBehavior {
  SearchResults = "SearchResults",
  Profile = "Profile",
  AssignToBasket = "AssignToBasket"
}

export interface IAdditionalCustomerTaxInformations {
  captureIdNumber?: UserTaxInformation;
  idNumberLabelText?: string;
  idNumberLocalTypeCode?: GovernmentTaxIdentifierLocalTypeCode;
  captureRUC?: UserTaxInformation;
  rucLabelText?: string;
  rucLocalTypeCode?: GovernmentTaxIdentifierLocalTypeCode;
}

export async function loadGenders(container: Container): Promise<RenderSelectOptions[]> {
  const appLocalFeatureStorage: IAppLocalFeaturesStorage =
      container.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

  const genders: ICustomerAttributeOptions[] = await appLocalFeatureStorage.loadCustomerGenders();

  return genders
    .map((gender: any): RenderSelectOptions => {
      return {
        code: gender.code,
        description: gender.description
      };
    })
    .sort((reason1: any, reason2: any): number => {
      return compareRenderSelectOptions(reason1, reason2);
    });
}

export async function loadLanguages(container: Container): Promise<RenderSelectOptions[]> {
  const appLocalFeatureStorage: IAppLocalFeaturesStorage =
      container.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

  const languages: ICustomerAttributeOptions[] = await appLocalFeatureStorage.loadCustomerLanguages();

  return languages
    .map((language: any): RenderSelectOptions => {
      return {
        code: language.code,
        description: language.description
      };
    })
    .sort((reason1: any, reason2: any): number => {
      return compareRenderSelectOptions(reason1, reason2);
    });
}

export async function loadTitles(container: Container): Promise<RenderSelectOptions[]> {
  const appLocalFeatureStorage: IAppLocalFeaturesStorage =
      container.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

  const titles: ICustomerAttributeOptions[] = await appLocalFeatureStorage.loadCustomerTitles();

  return titles
    .map((title: any): RenderSelectOptions => {
      return {
        code: title.code,
        description: title.description
      };
    })
    .sort((reason1: any, reason2: any): number => {
      return compareRenderSelectOptions(reason1, reason2);
    });
}

export async function loadAttributeDefinitions(container: Container): Promise<AttributeGroupDefinitionList> {
  const appLocalFeatureStorage: IAppLocalFeaturesStorage =
      container.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

  const attributeDefs = await appLocalFeatureStorage.loadAttributeGroupDefinitions();
  return attributeDefs;
}

export async function loadCountries(container: Container): Promise<RenderSelectOptions[]> {
  const appLocalFeatureStorage: IAppLocalFeaturesStorage =
      container.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

  const countries: ICustomerAttributeOptions[] = await appLocalFeatureStorage.loadCustomerCountries();

  return countries
    .map((country: any): RenderSelectOptions => {
      return {
        code: country.code,
        description: country.description
      };
    })
    .sort((reason1: any, reason2: any): number => {
      return compareRenderSelectOptions(reason1, reason2);
    });
}

export async function loadLoyaltyPlans(container: Container): Promise<IStoreLoyaltyPlans> {
  const appLocalFeatureStorage: IAppLocalFeaturesStorage =
      container.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

  const loyaltyPlans: IStoreLoyaltyPlans = await appLocalFeatureStorage.loadLoyaltyPlans();

  return loyaltyPlans;
}

export function getAdvanceEmailVerification(configurationManager: IConfigurationManager): boolean {
  try {
    return configurationManager.getFunctionalBehaviorValues().
    advancedVerificationBehaviors.advancedEmailVerification.externalEmailVerification;
  } catch (error) {
    return false;
  }
}
function getInvalidWithByPassEmailMessage(configurationManager: IConfigurationManager): string {
  try {
    const errorMessage: string = configurationManager.getFunctionalBehaviorValues()
    .advancedVerificationBehaviors.advancedEmailVerification.invalidWithByPassEmailMessage[I18n.currentLocale()];
    if (errorMessage !== undefined) {
      return errorMessage;
    } else {
      return I18n.t("invalidWithBypassEmailMessage");
    }
  } catch (error) {
    return I18n.t("invalidWithBypassEmailMessage");
  }
}
function getInvalidEmailMessage(configurationManager: IConfigurationManager): string {
  try {
    const errorMessage: string = configurationManager.getFunctionalBehaviorValues()
    .advancedVerificationBehaviors.advancedEmailVerification.invalidEmailMessage[I18n.currentLocale()];
    if (errorMessage !== undefined) {
      return errorMessage;
    } else {
      return I18n.t("invalidEmailMessage");
    }
  } catch (error) {
    return I18n.t("invalidEmailMessage");
  }
}

export async function loadEmailVerification(container: Container,
                                            configurationManager: IConfigurationManager,
                                            emailAddress: string): Promise<string> {
  const emailVerificationApi: IEmailVerificationApi = container.get<IEmailVerificationApi>(FEATURES_DI_TYPES.
      IEmailVerificationApi);

  const emailVerificationResponse: any = await emailVerificationApi.emailVerification(emailAddress);

  if (emailVerificationResponse.status === EmailStatus.Invalid) {
    return getInvalidEmailMessage(configurationManager);
  } else if (emailVerificationResponse.status === EmailStatus.InvalidWithBypass) {
    return getInvalidWithByPassEmailMessage(configurationManager);
  } else {
    return "";
  }
}

export function getAdvanceAddressVerification(configurationManager: IConfigurationManager): boolean {
  try {
    return configurationManager.getFunctionalBehaviorValues().advancedVerificationBehaviors.advancedAddressVerification.
        externalAddressVerification;
  } catch (error) {
    return false;

  }
}

export function getDefaultLoyaltyMembership(loyaltyMemberships: ICustomerLoyaltyMembership[]):
                                                  ICustomerLoyaltyMembership {
  let custLoyMembershipDefault: ICustomerLoyaltyMembership;
  if (_.isEmpty(loyaltyMemberships)) {
    return undefined;
  } else if (loyaltyMemberships.length === 1) {
    return loyaltyMemberships[0];
  } else {
    //look for the default
    custLoyMembershipDefault = loyaltyMemberships.find((lm) => lm.isDefault === true);
    if (!custLoyMembershipDefault) {
      //if no default then choose the plan with highest id
      const highestLoyaltyPlanKey = Math.max.apply(Math, loyaltyMemberships.map((lm) => lm.loyaltyPlanKey));
      custLoyMembershipDefault = loyaltyMemberships.find(
          (lp) => lp.loyaltyPlanKey === highestLoyaltyPlanKey.toString());
    }
  }

  return custLoyMembershipDefault;
}

export function loyaltyPlanCompare(a: LoyaltyPlan, b: LoyaltyPlan): number {
  const aKey: number = parseInt(a.loyaltyPlanKey, 10);
  const bKey: number = parseInt(b.loyaltyPlanKey, 10);
  if ( aKey < bKey ) {
    return 1;
  } else if ( aKey > bKey ) {
    return -1;
  }

  return 0;
}

export function getCountryFormatUsingCountryCode(phoneCountryCodes: PhoneFormatConfig,
                                                 countryCode: string): PhoneCountryCode {
  if (phoneCountryCodes[countryCode]) {
    return {
      ...phoneCountryCodes[countryCode],
      secondaryCountryCode: phoneCountryCodes[countryCode].countryCode,
      countryCode
    };
  }

  for (const phoneCountryCode in phoneCountryCodes) {
    if (phoneCountryCodes[phoneCountryCode].countryCode === countryCode) {
      return {
        ...phoneCountryCodes[phoneCountryCode],
        secondaryCountryCode: countryCode,
        countryCode: phoneCountryCode
      };
    }
  }
}

export function getEInvoiceForBusinessCustomerFlag(configurationManager: IConfigurationManager, i18nLocation: string): boolean {
  const countrySpecificConfigValues =
      configurationManager.getI18nCountryConfigValues(i18nLocation);
  return countrySpecificConfigValues && countrySpecificConfigValues.invoicing &&
      countrySpecificConfigValues.invoicing.enableEInvoiceForBusinessCustomer;
}

export function attributeGroupCompare(a: AttributeGroupDefinition, b: AttributeGroupDefinition): number {
  if ( a.sequence && !b.sequence ) {
    //a has a value but b has no value, then a should come before b
    return -1;
  } else if ( !a.sequence && b.sequence ) {
    //b has a value but a has no value, then b should come before a
    return 1;
  } else if ( !a.sequence && !b.sequence ) {
    //if both a and b have no sequence then compare the group descriptions
    if (a.description.toUpperCase() < b.description.toUpperCase()) {
      return -1;
    } else if (a.description.toUpperCase() > b.description.toUpperCase()) {
      return 1;
    }
  } else if ( a.sequence < b.sequence ) {
    return -1;
  } else if ( a.sequence > b.sequence ) {
    return 1;
  }

  return 0;
}

export function attributeGroupDataElementCompare(a: AttributeDataElementDefinition,
                                                 b: AttributeDataElementDefinition): number {
  if (a.sequence && !b.sequence) {
    //a has a value but b has no value, then a should come before b
    return -1;
  } else if (!a.sequence && b.sequence) {
    //b has a value but a has no value, then b should come before a
    return 1;
  } else if (!a.sequence && !b.sequence) {
    //if both a and b have no sequence then compare the group descriptions
    if (a.label.toUpperCase() < b.label.toUpperCase()) {
      return -1;
    } else if (a.label.toUpperCase() > b.label.toUpperCase()) {
      return 1;
    }
  } else if (a.sequence < b.sequence) {
    return -1;
  } else if (a.sequence > b.sequence) {
    return 1;
  }

  return 0;
}

export function mapDataElementDefOptionsToRenderSelect(dataElementDef: AttributeDataElementDefinition,
                                                       preferredLanguage: string): RenderSelectOptions[] {

  return dataElementDef && dataElementDef.enumValues
    .map((dataElementEnum: any): RenderSelectOptions => {
      return {
        code: dataElementEnum.code,
        description: getTranslationDataElement(dataElementEnum, preferredLanguage)
      };
    });
}

export function getTranslationDataElement(attrDataElement: AttributeDataElementDefinition |
                                          AttributeDataElementEnumValue,
                                          preferredLanguage: string): string {
  return attrDataElement && (attrDataElement.translations &&
      attrDataElement.translations[preferredLanguage] || attrDataElement.label);
}

export function getTranslationGroupDefStrings(attrGroupDef: AttributeGroupDefinition, preferredLanguage: string): any {
  let description = attrGroupDef.description;
  let longDescription = attrGroupDef.longDescription;
  let longDescriptionExpanded = attrGroupDef.longDescriptionExpanded;

  if (attrGroupDef && (attrGroupDef.translations && attrGroupDef.translations[preferredLanguage])) {
      description = attrGroupDef.translations[preferredLanguage].description || attrGroupDef.description;
      longDescription = attrGroupDef.translations[preferredLanguage].longDescription || attrGroupDef.longDescription;
      longDescriptionExpanded = attrGroupDef.translations[preferredLanguage].longDescriptionExpanded || attrGroupDef.longDescriptionExpanded;

  }
  return {
    description,
    longDescription,
    longDescriptionExpanded
  }
}

export function filterAttributeGroupDefinitions(attributeDefs: AttributeGroupDefinitionList, hiddenAttributeGroupCodes: string[]): void {
  if (!_.isEmpty(hiddenAttributeGroupCodes)) {
    //remove attribute defs where the group code matches what is in the hiddenAttributeGroupCodes array
    attributeDefs.data = attributeDefs.data.filter((ad) =>
        hiddenAttributeGroupCodes.findIndex((hac) => hac.toUpperCase() === ad.groupCode.toUpperCase()) === -1);
  }
}

export function getPostalCodeAllowedContentErrorCode(postalCodeAllowedContent: AllowedContent): string {
  switch (postalCodeAllowedContent) {
    case AllowedContent.LettersAndNumbers:
      return "lettersAndNumbers";
    case AllowedContent.NumbersOnly:
      return "numbersOnly";
    case AllowedContent.NumbersWithDashes:
      return "numbersWithDashes";
    default:
      return undefined;
  }
}

export function customerNIPTaxInformations(configurationManager: IConfigurationManager, i18nLocation: string): CustomerNIPTaxInformation {
  const countrySpecificTaxInfo = configurationManager.getI18nCountryConfigValues(i18nLocation);
  const taxInformation = countrySpecificTaxInfo.taxation?.taxIdentifiers;


  const captureRegionalTaxIdentifier = taxInformation.NIP && getUsage(taxInformation.NIP.usage,
    taxInformation.NIP.minLength, taxInformation.NIP.maxLength,
    taxInformation.NIP.typeBehaviour);
  const regionalTaxIdentifierLabelText = captureRegionalTaxIdentifier && captureRegionalTaxIdentifier.visible ?
    (taxInformation.NIP.labelText.default) ||
    I18n.t("regionalTaxIdentifierLabelText") : undefined;
  const regionalTaxIdentifierLocalTypeCode = getLocalTypeCode(GovernmentTaxIdentifierLocalTypeCode.NIP, captureRegionalTaxIdentifier)
  return {
    regionalTaxIdentifierLabelText,
    regionalTaxIdentifierLocalTypeCode,
    captureRegionalTaxIdentifier
  }
}

export function customerTaxInformations(configurationManager: IConfigurationManager, i18nLocation: string): CustomerTaxInformation {
  const countrySpecificTaxInfo = configurationManager.getI18nCountryConfigValues(i18nLocation);
  const taxInformation = countrySpecificTaxInfo.taxation;
  const companyRequirement = countrySpecificTaxInfo.invoicing;


  const captureRegionalTaxIdentifier = taxInformation.vatNumber && getUsage(taxInformation.vatNumber.usage,
    taxInformation.vatNumber.minLength, taxInformation.vatNumber.maxLength,
    taxInformation.vatNumber.typeBehaviour);
  const regionalTaxIdentifierLabelText = captureRegionalTaxIdentifier && captureRegionalTaxIdentifier.visible ?
    (taxInformation.vatNumber.labelText[I18n.currentLocale()]) ||
    I18n.t("regionalTaxIdentifierLabelText") : undefined;
  const regionalTaxIdentifierLocalTypeCode = getLocalTypeCode(GovernmentTaxIdentifierLocalTypeCode.VatNumber, captureRegionalTaxIdentifier)
  const captureTaxCode = taxInformation.taxCode && getUsage(taxInformation.taxCode.usage,
    taxInformation.taxCode.minLength, taxInformation.taxCode.maxLength, taxInformation.taxCode.typeBehaviour);
  const taxCodeLabelText = captureTaxCode && captureTaxCode.visible ?
    (taxInformation.taxCode.labelText[I18n.currentLocale()]) ||
    I18n.t("taxCodeLabelText") : undefined;
  const taxCodeLocalTypeCode = getLocalTypeCode(GovernmentTaxIdentifierLocalTypeCode.TaxCode, captureTaxCode);
  const capturePecAddress = taxInformation.pecAddress && getUsage(taxInformation.pecAddress.usage,
    taxInformation.pecAddress.minLength, taxInformation.pecAddress.maxLength,
    taxInformation.pecAddress.typeBehaviour);
  const pecAddressLabelText = capturePecAddress && capturePecAddress.visible ?
    (taxInformation.pecAddress.labelText[I18n.currentLocale()]) ||
    I18n.t("pecAddressLabelText") : undefined;
  const captureAddressCode = taxInformation.recipientCode && getUsage(taxInformation.recipientCode.usage,
    taxInformation.recipientCode.minLength, taxInformation.recipientCode.maxLength,
    taxInformation.recipientCode.typeBehaviour);
  const addressCodeLabelText = captureAddressCode && captureAddressCode.visible ?
    (taxInformation.recipientCode.labelText[I18n.currentLocale()]) ||
    I18n.t("addresseCodeLabelText") : undefined;
  const { captureIdNumber, idNumberLabelText, idNumberLocalTypeCode, captureRUC, rucLabelText, rucLocalTypeCode } = additionalCustomerTaxInformations(countrySpecificTaxInfo);
  return {
    regionalTaxIdentifierLabelText,
    regionalTaxIdentifierLocalTypeCode,
    captureRegionalTaxIdentifier,
    captureTaxCode,
    taxCodeLabelText,
    taxCodeLocalTypeCode,
    capturePecAddress,
    pecAddressLabelText,
    captureAddressCode,
    addressCodeLabelText,
    captureIdNumber,
    idNumberLabelText,
    idNumberLocalTypeCode,
    captureRUC,
    rucLabelText,
    rucLocalTypeCode,
    validateCompanyName: companyRequirement && companyRequirement.validateCompanyName ? companyRequirement.validateCompanyName : false
  }
}

function additionalCustomerTaxInformations(countrySpecificTaxInfo: IConfigurationValues): IAdditionalCustomerTaxInformations {
  const taxInformation = countrySpecificTaxInfo.taxation;
  const captureIdNumber = taxInformation.taxIdentifiers && getUsage(taxInformation.taxIdentifiers?.idNumber?.usage,
    taxInformation.taxIdentifiers?.idNumber?.minLength, taxInformation.taxIdentifiers?.idNumber?.maxLength,
    taxInformation.taxIdentifiers?.idNumber?.typeBehaviour);
  const i18nIdNumberLables: ILabel = taxInformation?.taxIdentifiers?.idNumber?.labelText;
  const idNumberLabelText = captureIdNumber && captureIdNumber.visible ?
    i18nIdNumberLables && I18n.t(i18nIdNumberLables.i18nCode, { defaultValue: i18nIdNumberLables.default }) ||
    I18n.t("idNumber") : undefined;
  const idNumberLocalTypeCode = getLocalTypeCode(GovernmentTaxIdentifierLocalTypeCode.IdNumber, captureIdNumber);
  const captureRUC = taxInformation.taxIdentifiers && getUsage(taxInformation.taxIdentifiers?.RUC?.usage,
    taxInformation.taxIdentifiers?.RUC?.minLength, taxInformation.taxIdentifiers?.RUC?.maxLength,
    taxInformation.taxIdentifiers?.RUC?.typeBehaviour);
  const i18nRucLables: ILabel = taxInformation?.taxIdentifiers?.RUC?.labelText;
  const rucLabelText = captureRUC && captureRUC?.visible ?
    i18nRucLables && I18n.t(i18nRucLables.i18nCode, { defaultValue: i18nRucLables.default }) ||
    I18n.t("ruc") : undefined;
  const rucLocalTypeCode = getLocalTypeCode(GovernmentTaxIdentifierLocalTypeCode.RUC, captureRUC);
  return { captureIdNumber, idNumberLabelText, idNumberLocalTypeCode, captureRUC, rucLabelText, rucLocalTypeCode };
}

function getUsage(value: string, minLength ?: number, maxLength ?: number, typeBehaviour ?: UserTaxValidationPattern): UserTaxInformation {
  const requiredUsage = value === Usage.Required;
  const isTaxVisible = (value === Usage.Required || value === Usage.Optional || value === Usage.ConditionallyRequired) ? true : false;
  let typeBehaviourRegex: RegExp;
  let userTaxInfoData: UserTaxInformation;
  if (typeBehaviour) {
    if (typeBehaviour === UserTaxValidationPattern.AlphaNumeric) {
      typeBehaviourRegex = /^[a-z0-9]+$/i;
    } else if (typeBehaviour === UserTaxValidationPattern.Numeric) {
      typeBehaviourRegex = /^[0-9]+$/;
    }
    userTaxInfoData = {
      required: requiredUsage, visible: isTaxVisible, minLength,
      maxLength, typeBehaviour: { pattern: typeBehaviourRegex, typeOfBehaviour: typeBehaviour }
    };
  } else {
    userTaxInfoData = {
      required: requiredUsage, visible: isTaxVisible, minLength,
      maxLength
    };
  }
  return userTaxInfoData;
}

function getLocalTypeCode(code: string, taxIdentifier: UserTaxInformation): GovernmentTaxIdentifierLocalTypeCode {
  switch (code) {
    case GovernmentTaxIdentifierLocalTypeCode.VatNumber:
      return taxIdentifier && taxIdentifier.visible ? GovernmentTaxIdentifierLocalTypeCode.VatNumber : undefined;
    case GovernmentTaxIdentifierLocalTypeCode.TaxCode:
      return taxIdentifier && taxIdentifier.visible ? GovernmentTaxIdentifierLocalTypeCode.TaxCode : undefined;
    case GovernmentTaxIdentifierLocalTypeCode.IdNumber:
      return taxIdentifier && taxIdentifier.visible ? GovernmentTaxIdentifierLocalTypeCode.IdNumber : undefined;
    case GovernmentTaxIdentifierLocalTypeCode.RUC:
      return taxIdentifier && taxIdentifier.visible ? GovernmentTaxIdentifierLocalTypeCode.RUC : undefined;
    case GovernmentTaxIdentifierLocalTypeCode.NIP:
      return taxIdentifier && taxIdentifier.visible ? GovernmentTaxIdentifierLocalTypeCode.NIP : undefined;
    default:
      return undefined;
  }
}

export function isFullTaxInvoiceAllowedForReprint(configurationManager: IConfigurationManager): boolean {
  const countrySpecificConfigValues = configurationManager.getFunctionalBehaviorValues();
  const fullTaxInvoiceAllowedFor = countrySpecificConfigValues && countrySpecificConfigValues.receipt &&
      countrySpecificConfigValues.receipt.typeChoices && countrySpecificConfigValues.receipt.typeChoices.fullTaxInvoiceAllowedFor;
  return fullTaxInvoiceAllowedFor === ReceiptTypeAllowedTransactionType.Reprint;
}

export function getDisplayLoyaltyBalancesWithoutRTP(configurationManager: IConfigurationManager, customer: Customer): boolean {
  const customerConfig: IConfigurationValues = configurationManager && configurationManager.getCustomerValues();
  //if loyalty is not enabled the don't proceed.
  if(!_.get(customerConfig, "loyalty.enabled")) {
    return false;
  }
  const displayBehavior: IDisplayBehavior = customerConfig && _.get(customerConfig, "loyalty.displayBehavior");
  const qualifyingTransactions: LoyaltyQualifyingTransactions = customerConfig && _.get(customerConfig, "loyalty.realTimePoints.qualifyingTransactions");
  const realTimePointsEnabled = qualifyingTransactions && qualifyingTransactions !== LoyaltyQualifyingTransactions.None;
  return _.get(displayBehavior, "displayBalancesWithoutRealTimePointsEnabled", false) && !realTimePointsEnabled &&
      customer && customer.hasLoyaltyMemberships;
}

export function getCustomerIconName(customer: Customer, shouldDisplayLoyaltyIndicator: boolean): string {
  let customerIconName;
  if (customer?.hasLoyaltyMemberships && shouldDisplayLoyaltyIndicator) {
    customerIconName = "LoyaltyCard";
  } else {
    customerIconName = customer ? "CustomerAssigned" : "AddCustomer";
  }
  return customerIconName;
}

export function extractTaxCustomerDetailsFromTaxCustomerLine(taxCustomerLine: TaxCustomerLine): TaxCustomer {
  const taxCustomer = new TaxCustomer();
  taxCustomer.firstName = taxCustomerLine.firstName;
  taxCustomer.lastName = taxCustomerLine.lastName;
  taxCustomer.phoneCountryCode = taxCustomerLine.phoneCountryCode;
  taxCustomer.phoneNumber = taxCustomerLine.phoneNumber;
  taxCustomer.postalCode = taxCustomerLine.postalCode;
  taxCustomer.address1 = taxCustomerLine.address1;
  taxCustomer.address2 = taxCustomerLine.address2;
  taxCustomer.city = taxCustomerLine.city;
  taxCustomer.state = taxCustomerLine.state;
  taxCustomer.companyName = taxCustomerLine.companyName;
  taxCustomer.countryCode = taxCustomerLine.countryCode;
  taxCustomer.customerType = (taxCustomerLine.customerType as CustomerType) || CustomerType.Personal;

  if (taxCustomerLine.governmentTaxIdentifier &&
      GovernmentTaxIdentifierLocalTypeCode.VatNumber === taxCustomerLine.governmentTaxIdentifier.name) {
    taxCustomer.governmentTaxIdentifier = {
      name: taxCustomerLine.governmentTaxIdentifier.name,
      value: taxCustomerLine.governmentTaxIdentifier.value
    } as ITaxIdentifier;
  }
  if (taxCustomerLine.taxCode &&
      GovernmentTaxIdentifierLocalTypeCode.TaxCode === taxCustomerLine.taxCode.name) {
    taxCustomer.taxCode = {
      name: taxCustomerLine.taxCode.name,
      value: taxCustomerLine.taxCode.value
    } as ITaxIdentifier;
  }
  if (taxCustomerLine.pecAddress) {
    taxCustomer.pecAddress = {
      value: taxCustomerLine.pecAddress.value
    } as ITaxIdentifier;
  }
  if (taxCustomerLine.addressCode) {
    taxCustomer.addressCode = {
      value: taxCustomerLine.addressCode.value
    } as ITaxIdentifier;
  }
  if (taxCustomerLine.ruc &&
    GovernmentTaxIdentifierLocalTypeCode.RUC === taxCustomerLine.ruc.name) {
    taxCustomer.ruc = {
      name: taxCustomerLine.ruc.name,
      value: taxCustomerLine.ruc.value
    } as ITaxIdentifier;
  }
  if (taxCustomerLine.idNumber &&
    GovernmentTaxIdentifierLocalTypeCode.IdNumber === taxCustomerLine.idNumber.name) {
    taxCustomer.idNumber = {
      name: taxCustomerLine.idNumber.name,
      value: taxCustomerLine.idNumber.value
    } as ITaxIdentifier;
  }

  return taxCustomer;
}

export function getCountryName(countryCode: string, countries: RenderSelectOptions[]): string {
  let customerCountryCode: RenderSelectOptions;
  customerCountryCode = (countryCode) ?
          countries.find((country) => country.code === countryCode) : undefined;
  return customerCountryCode?.description;
}

export function getAlternateDateFormat(dateFormat: string): string {
  let altDateFormat = undefined;
  if (dateFormat && dateFormat.endsWith("YY") && dateFormat.length >= 5) {
    altDateFormat = dateFormat.substring(0, 5);
  } else if (dateFormat && dateFormat.startsWith("YYYY") && dateFormat.length >= 5) {
    altDateFormat = dateFormat.substring(5);
  }
  return altDateFormat;
}
