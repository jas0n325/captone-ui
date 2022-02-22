import * as _ from "lodash";
import moment from "moment";
import { TextInputMaskOptionProp } from "react-native-masked-text";

import { Alert, Platform } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogEntryMessage, ILogger, LogLevel } from "@aptos-scp/scp-component-logging";
import { IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  AddressFormatConfig,
  CountryAddressFormat,
  getPrinterType,
  PhoneCountryCode,
  PhoneFormatConfig,
  NO_SALE_TRANSACTION_TYPE, UiInputKey,
  SSF_SINGLE_USE_COUPON_EXPIRED_I18N_CODE,
  SSF_SINGLE_USE_COUPON_INVALID_I18N_CODE,
  Usage,
  geti18nLocation,
  IDisplayInfo,
  TENDER_PAYMENT_LINE_TYPE,
  ITenderDisplayLine,
  ICustomerDetailsConfig,
  IThresholdLimit,
  ThresholdLimit,
  ITaxIdentifiersConfig,
  ITaxationConfig,
  I18nLocationValues,
  getCustomerAddressOverrides,
  GiftCertificateState
} from "@aptos-scp/scp-component-store-selling-features";
import {
  FiscalRequestType,
  FiscalResponseCode,
  IFiscalStatus,
  PrinterType,
  StatusCode,
  TenderType
} from "@aptos-scp/scp-types-commerce-devices";
import {
  AdditionalData,
  ItemLineAdditionalData,
  ItemSublineAdditionalData
} from "@aptos-scp/scp-types-ss-transaction-history";
import { ISubline, ReceiptCategory, ICustomer } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { ReceiptPrinter, SublineDisplayLine } from "../../../actions";
import { DeviceStatusState, RetailLocationsState } from "../../../reducers";
import store from "../../../reduxStore";
import { RenderSelectOptions } from "../../common/FieldValidation";
import { FiscalDailyStatus,
       FiscalDeviceWorkingStatus,
       FiscalReportToast,
       HeaderReportType,
       ReportType } from "../../fiscalPrinter/constants";
import {DEFAULT_DECIMAL_PRECISION, RADIX } from "../../main/constants";
import { StyleGroup, StyleGroupProp } from "../constants";
import { CustomerType } from "../../customer/CustomerAddUpdate";
import { BusinessState } from '../../../reducers/businessState';

export enum ReprintStatus {
  Never = "Never",
  Always = "Always"
}

export enum ButtonType {
  Primary = "primary",
  Secondary = "secondary",
  Tertiary = "tertiary",
  Tile = "tile"
}

export const LOCALE_SPECIFIC_CURRENCY_OVERRIDES = {
  "da-DK": {
    currencySymbol: "kr."
  },
  "es-PE": {
    currencySymbol: "S/."
  }
};

export enum GiftCertificateAction {
  Change = "change",
  Refund = "refund",
  Sale = "sale"
}

export interface ICustomerValidation {
  firstName?: boolean;
  lastName?: boolean;
  companyName?: boolean;
  countryCode?: boolean;
  phoneNumber?: boolean;
  address?: boolean;
  ruc?: boolean;
  idNumber?: boolean;
}
export interface ITaxIdentifierValidation {
  firstName?: boolean;
  lastName?: boolean;
  companyName?: boolean;
  countryCode?: boolean;
  phoneNumber?: boolean;
  address?: boolean;
  ruc?: boolean;
  idNumber?: boolean;
}

export interface ITaxationValidation {
  vatNumber?: boolean;
  pecAddress?: boolean;
  recipientCode?: boolean;
  taxCode?: boolean;
}

export interface ICurrencyData {
  currencyCode: string;
  tenderId: string;
  tenderName: string;
  isForeignTender?: boolean;
}

// make the money mask type props required
export interface ITextInputMoneyMaskOptions extends TextInputMaskOptionProp {
  precision: number;  // number of cents to show
  separator: string;  // cents separator
  delimiter: string;  // thousand separator
  unit: string;       // prefix text
  suffixUnit: string; // suffix text
}

export const getCurrencyMask = (currency?: string): ITextInputMoneyMaskOptions => {
  const locale = getStoreLocale();
  const decimalPrecision = I18n.t("currency.format.precision", {locale});
  const delimiter = translateWithStoreLocale("currency.format.thousandsSeparator");
  const separator = translateWithStoreLocale("currency.format.decimalSeparator");
  const localeSpecificPrecision = decimalPrecision ?
      Number.parseInt(decimalPrecision, RADIX) : DEFAULT_DECIMAL_PRECISION;

  const amount = currency ? new Money(0, currency).toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions()) :
      I18n.toCurrency(0, { delimiter, separator, precision: localeSpecificPrecision });
  let unit = renderUnit(amount, locale);
  let suffixUnit = "";
  if (amount.indexOf(unit) > 0) {
    suffixUnit = unit;
    unit = "";
  }
  return {
    precision: localeSpecificPrecision,
    delimiter,
    separator,
    unit,
    suffixUnit
  };
};

/**
 * Calculate the number of characters the tender input field should be limited to so that downstream errors are
 * prevented with excessively large numbers.
 * @param currencyMask mask options for the tender input field
 * @param maxNumericalTenderDigits maximum number of digits to allow, must be greater than currencyMask.precision
 * @returns integer number of characters to limit the field to
 */
export const getMaxTenderInputCharacters = (currencyMask: ITextInputMoneyMaskOptions,
                                            maxNumericalTenderDigits: number = 15): number => {
  const numDelimiters = Math.ceil((maxNumericalTenderDigits - currencyMask.precision) / 3) - 1;
  const tenderInputMaxLength = maxNumericalTenderDigits + currencyMask.unit.length +
      (numDelimiters * currencyMask.delimiter.length) + currencyMask.separator.length + currencyMask.suffixUnit.length;
  return tenderInputMaxLength;
};

/**
 * Takes in a component's styles props and its individual StyleGroup and returns one StyleGroup array for the component
 * to use.
 * @param propStyles style object or array of style objects passed into the component's props. Can be undefined.
 * @param componentStyles Individual style objects for the component, CANNOT be an array.
 */
export const combineComponentStyleWithPropStyles = (propStyles: StyleGroupProp | undefined,
                                                    ...componentStyles: StyleGroup[]): StyleGroup[] => {
  return Array.isArray(propStyles) ? [...componentStyles].concat(propStyles) : [...componentStyles, propStyles || {}];
};

/**
 * Utility to handle submission of redux-forms to reduce code duplication. Redux-form does not execute "submit"
 * asynchronously every time; this utility handles the promise, whether it is present or not.
 * @param logger logger from the component submitting the form
 * @param submit the component's prop's instance of the submit function
 * @param isValid optional pre-form-submission validation value
 */
export const handleFormSubmission = (logger: ILogger, submit: () => Promise<any>, isValid: boolean = true): void => {
  const entryMessage: ILogEntryMessage = logger.traceEntry("handleFormSubmission");

  if (isValid) {
    const promise: Promise<any> = submit();

    if (promise && promise.catch) {
      promise.catch((error) => { throw logger.throwing(error, entryMessage, LogLevel.WARN); });
    }
  }

  logger.traceExit(entryMessage);
};

export const warnBeforeLosingChanges = (hasChanged: boolean, onExit: () => void) => {
  if (hasChanged) {
    Alert.alert(I18n.t("discardChanges"), I18n.t("discardChangesMessage"), [
      { text: I18n.t("cancel"), style: "cancel" },
      { text: I18n.t("okCaps"), onPress: onExit }
    ], {cancelable: true});
  } else {
    onExit();
  }
};

export const promptSaveBeforeLosingChanges = (hasChanged: boolean, onExit: () => void, onSave: () => void) => {
  if (hasChanged) {
    Alert.alert(I18n.t("saveChanges"), I18n.t("saveChangesMessage"), [
      { text: I18n.t("cancel"), style: "cancel", onPress: onExit },
      { text: I18n.t("save"), onPress: onSave }
    ], {cancelable: true});
  } else {
    onExit();
  }
};

export const promptToReturnCoupon = () => {
  setTimeout(() =>
      Alert.alert(I18n.t("couponReturnTitle"), I18n.t("couponRemovedMessage"), [
        {text: I18n.t("ok")}
      ], {cancelable: true}), 500);
};

export const promptToAssignCustomer = (onContinue: () => void,
    doPromptForLottery: boolean): void => {
  if (doPromptForLottery) {
    Alert.alert(I18n.t("warning"), I18n.t("voidLotteryMessageForCustomer"), [
      { text: I18n.t("cancel"), style: "cancel"},
      { text: I18n.t("continue"), onPress: onContinue }
    ], {cancelable: true});
  } else {
    onContinue();
  }
};

export const getCouponTitle = (errorCode: string): string => {
  if (errorCode === SSF_SINGLE_USE_COUPON_EXPIRED_I18N_CODE) {
     return I18n.t("couponExpiredTitle");
  } else if (errorCode === SSF_SINGLE_USE_COUPON_INVALID_I18N_CODE) {
    return I18n.t("invalidCouponTitle");
  } else {
    return I18n.t("couponErrorTitle");
  }
};

export const isFranceLocation = (retailLocations: RetailLocationsState,
                                 configurationManager: IConfigurationManager): boolean => {
  const i18nLocationValue = getI18nLocation(retailLocations, configurationManager);
  return (i18nLocationValue === I18nLocationValues.France);
};

export const isCostaRicaLocation = (retailLocations: RetailLocationsState,
                                    configurationManager: IConfigurationManager): boolean => {
  const i18nLocationValue = getI18nLocation(retailLocations, configurationManager);
  return (i18nLocationValue === I18nLocationValues.CostaRica);
};

export const getCouponMessage = (errorCode: string): string => {
  if (errorCode === SSF_SINGLE_USE_COUPON_EXPIRED_I18N_CODE) {
    return I18n.t("couponExpiredMessage");
  } else if (errorCode === SSF_SINGLE_USE_COUPON_INVALID_I18N_CODE) {
    return I18n.t("invalidCouponMessage");
  } else {
    return I18n.t("singleUseCouponCannotAccept");
  }
};

export const getTransactionIsOpen = (stateValues: Readonly<Map<string, any>>): boolean => {
  return stateValues && stateValues.get("transaction.open");
};

/**
 * Returns an object containing the differences between the two different objects passed in. Intended to be used to
 * dissect why components are re-rendering. Use in a method like componentDidUpdate(prevProps: Props, prevState: State).
 *
 * Example: console.log("SuperSlowComponent.tsx difference in props: ", difference(this.props, prevProps));
 *
 * @param object the newer copy of the object that changed
 * @param base the older copt of the object that changed
 */
export const difference = (object: any, base: any): any => {
  function changes(subObject: any, subBase: any): any {
    return _.transform(subObject, (result: any, value: any, key: any): any => {
      if (!_.isEqual(value, base[key])) {
        result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, subBase[key]) : value;
      }
    });
  }
  return changes(object, base);
};

export function getStoreLocale(): string {
  return (store.getState().settings.primaryLanguage) ?
      store.getState().settings.primaryLanguage : (I18n.defaultLocale
          ? I18n.defaultLocale : "en");
}

export function getLocaleAmount(selectedAmount: Money): string {
  let amount: string;
  if (selectedAmount) {
    const locale = getStoreLocale();
    const decimalPrecision: number = Number.parseInt(I18n.t("currency.format.precision", {locale}), RADIX);
    const splitAmount: any = selectedAmount.amount.split(".");
    if (decimalPrecision === 0 || decimalPrecision === undefined) {
      amount = splitAmount[0];
    } else {
      amount = selectedAmount.amount;
    }
  }
  return amount
}

export function translateWithStoreLocale(value: string): string {
  const locale = getStoreLocale();
  return I18n.t(value, { locale });
}

export function getLanguageList(): RenderSelectOptions[] {
  const languages = [
    {
      code: "zh-CN",
      description: "Chinese (S)",
      localiseDesc: "简体中文"
    },
    {
      code: "en",
      description: "English (US)",
      localiseDesc: "English (US)"
    },
    {
      code: "en-GB",
      description: "English (UK)",
      localiseDesc: "English (UK)"
    },
    {
      code: "fr-CA",
      description: "French (Canada)",
      localiseDesc: "Français (Canada)"
    },
    {
      code: "fr-FR",
      description: "French (France)",
      localiseDesc: "Français"
    },
    {
      code: "it-IT",
      description: "Italian (Italy)",
      localiseDesc: "Italiano"
    },
    {
      code: "en-IE",
      description: "English (Ireland)",
      localiseDesc: "English (Ireland)"
    },
    {
      code: "es-ES",
      description: "Spanish",
      localiseDesc: "Español"
    },
    {
      code: "de-DE",
      description: "German",
      localiseDesc: "Deutsch"
    },
    {
      code: "en-PR",
      description: "English (Puerto Rico)",
      localiseDesc: "English (Puerto Rico)"
    },
    {
      code: "es-PR",
      description: "Spanish (Latin America)",
      localiseDesc: "Español (Latinoamérica)"
    },
    {
      code: "nl-NL",
      description: "Dutch",
      localiseDesc: "Nederlands"
    },
    {
      code: "ja-JP",
      description: "Japanese",
      localiseDesc: "日本語"
    },
    {
      code: "es-CL",
      description: "Spanish (Chile)",
      localiseDesc: "Español (Chile)"
    },
    {
      code: "es-PE",
      description: "Spanish (Peru)",
      localiseDesc: "Español (Peru)"
    },
    {
      code: "es-CR",
      description: "Spanish (Costa Rica)",
      localiseDesc: "Español (Costa Rica)"
    },
    {
      code: "es-CO",
      description: "Spanish (Colombia)",
      localiseDesc: "Español (Colombia)"
    },
    {
      code: "de-AT",
      description: "German (Austria)",
      localiseDesc: "Deutsch (Österreich)"
    },
    {
      code: "zh-HK",
      description: "Chinese, Traditional (Hong Kong)",
      localiseDesc: "繁體中文（香港)"
    },
    {
      code: "pl-PL",
      description: "Polish",
      localiseDesc: "Polski"
    },
    {
      code: "pt-PT",
      description: "Portuguese",
      localiseDesc: "Português"
    }
  ];
  const sortedLanguage = languages.sort((a, b) => (a.description > b.description)
    ? 1 : ((b.description > a.description) ? -1 : 0));
  return sortedLanguage;
}

/**
 * Deep diff between two objects - i.e. an object with the new value of new & changed fields.
 * Removed fields will be set as undefined on the result.
 * Only plain objects will be deeply compared (@see _.isPlainObject)
 *
 * Inspired by: https://gist.github.com/Yimiprod/7ee176597fef230d1451#gistcomment-2565071
 * This fork: https://gist.github.com/TeNNoX/5125ab5770ba287012316dd62231b764/
 *
 * @param  {Object} base   Object to compare with (if falsy we return object)
 * @param  {Object} object Object compared
 * @return {Object}        Return a new object who represent the changed & new values
 */
export function deepObjectDifference(base: any, object: any): any {
  if (!object) {
    throw new Error(`The object compared should be an object: ${object}`);
  }
  if (!base) {
    return object;
  }

  const result = _.transform(object, (entry: any, value, key) => {
    if (!_.has(base, key)) {
      entry[key] = value;
    } // fix edge case: not defined to explicitly defined as undefined

    if (!_.isEqual(value, base[key])) {
      entry[key] = _.isPlainObject(value) && _.isPlainObject(base[key]) ?
          deepObjectDifference(base[key], value) : value;
    }
  });
  // map removed fields to undefined
  _.forOwn(base, (value, key) => {
    if (!_.has(object, key)) {
      result[key] = undefined;
    }
  });
  return !_.isEmpty(result) ? result : undefined;
}

export function getDisplayableDateOnly(dateString: string, format?: string): string {
  const locale = getStoreLocale();
  const dateOptions: string = I18n.t( !format ? "date.format" : format, { locale });
  return moment(dateString).format(dateOptions);
}

export function isFiscalReportType(reportType: string): boolean {
  let isFiscalReport: boolean = false;
  if (reportType === ReportType.PrintXReport || reportType === ReportType.PrintZReport) {
    isFiscalReport = true;
  }
  return isFiscalReport;
}

export function isQueryPrinterStatus(fiscalStatus: IFiscalStatus): boolean {
  let isPrinterStatus: boolean = false;
  if (fiscalStatus && fiscalStatus.requestType === FiscalRequestType.QueryPrinterStatus) {
    isPrinterStatus = true;
  }
  return isPrinterStatus;
}

export function isPrinterStatusSuccess(fiscalStatus: IFiscalStatus): boolean {
  let statusSuccess: boolean = false;
  if (fiscalStatus && fiscalStatus.statusCode === StatusCode.Success) {
    statusSuccess = true;
  }
  return statusSuccess;
}

export function isPrinterReadyToSyncData(fiscalStatus: IFiscalStatus): boolean {
  let isReady: boolean = false;
  if (fiscalStatus) {
    if (isQueryPrinterStatus(fiscalStatus)
        && isPrinterStatusSuccess(fiscalStatus)
        && isFiscalPrinterZReportRun(fiscalStatus)) {
      isReady = true;
    }
  }
  return isReady;
}

export function isFiscalPrinterZReportRun(fiscalStatus: IFiscalStatus): boolean {
  return  fiscalStatus.rtDailyOpen  === FiscalDailyStatus.Closed
          && fiscalStatus.rtNoWorkingPeriod === FiscalDeviceWorkingStatus.No;
}

export function isFiscalPrinterOperationCompleted(deviceStatus: DeviceStatusState): boolean {
  let isFiscalPrinterAction = false;
  switch (deviceStatus && deviceStatus.fiscalStatus && deviceStatus.fiscalStatus.requestType) {
    case FiscalRequestType.Report:
    case FiscalRequestType.SyncLogo:
    case FiscalRequestType.QueryPrinterStatus:
    case FiscalRequestType.SyncFiscalData:
      isFiscalPrinterAction = true;
      break;
    default:
      isFiscalPrinterAction = false;
  }
  return isFiscalPrinterAction;
}

export function getReportType(reqReport: string): string {
  return reqReport === ReportType.PrintZReport
    ? HeaderReportType.ZReport : HeaderReportType.XReport ;
}
export function isSyncCompleted(reqType: string): boolean {
  return reqType === FiscalRequestType.SyncLogo || reqType === FiscalRequestType.SyncFiscalData;
}
export function getReportToastType(reqReport: string): string {
  return reqReport === ReportType.PrintZReport
    ? FiscalReportToast.ZReport : FiscalReportToast.XReport ;
}

export function renderNumber(amount: number): string {
  return I18n.toNumber(!!amount ? amount : 0, {delimiter: I18n.t("currency.format.thousandsSeparator"), precision: 0});
}

export function isFiscalPrinter(configurationManager: IConfigurationManager, chosenPrinterId: string): boolean {
  const printerType: string = getPrinterType(configurationManager, chosenPrinterId);
  return printerType === PrinterType.Fiscal;
}

export const isPrinterDevice = (printer: ReceiptPrinter): boolean => {
  return printer.printerType !== PrinterType.FiscalDeviceOnly;
}

export function isFiscalPrintForNoSale(configurationManager: IConfigurationManager, stateValues: Map<string, any>,
                                      providedReceiptCategory: string, receiptCategory: string,
                                      chosenPrinterId: string): boolean {
  return isFiscalPrinter(configurationManager, chosenPrinterId) &&
      stateValues.get("transaction.type") === NO_SALE_TRANSACTION_TYPE &&
      providedReceiptCategory === ReceiptCategory.NoSale &&
      receiptCategory ===  ReceiptCategory.Receipt;
}
export function getPrinterStatus(inputs: Array<UiInput>): UiInput {
  return inputs && inputs
     .find((uiInput: UiInput) =>
      uiInput.inputKey === UiInputKey.PRINTER_STATUS_KEY);
}
export function getFiscalPrinterResponseCode(deviceStatus: DeviceStatusState): FiscalResponseCode {
  return deviceStatus && deviceStatus.fiscalStatus &&
      deviceStatus.fiscalStatus.responseCode;
}

export function renderUnit(amount: string, locale: string): string {
  const unit: string = LOCALE_SPECIFIC_CURRENCY_OVERRIDES[locale] && LOCALE_SPECIFIC_CURRENCY_OVERRIDES[locale].currencySymbol
      ? LOCALE_SPECIFIC_CURRENCY_OVERRIDES[locale].currencySymbol +
      amount.split(LOCALE_SPECIFIC_CURRENCY_OVERRIDES[locale].currencySymbol)[1].replace(/[0-9.,]/g, "")
      : amount.replace(/[0-9.,]/g, "");
  return unit;
}

export function getStoreLocaleCurrencyOptions(): object {
  const locale = getStoreLocale();
  const separator = translateWithStoreLocale("currency.format.thousandsSeparator");
  const delimiter = translateWithStoreLocale("currency.format.decimalSeparator");
  const decimalPrecision: number = Number.parseInt(I18n.t("currency.format.precision", {locale}), RADIX);
  const defaultLocaleOptions: object = {
    thousandsSeparator: separator,
    decimalSeparator: delimiter,
    precision: decimalPrecision
  };
  return defaultLocaleOptions;
}

export function getSublineAvailableReturnQuantity(
  sublineDisplayLine: SublineDisplayLine,
  transactionAdditionalData: AdditionalData
): { sublineAvailableQuantity: number; previouslyReturned: number; } {
  const { itemLine, sublineIndex } = sublineDisplayLine;

  const subline: ISubline = itemLine.sublines[sublineIndex];

  const sublineQuantity: number = subline && subline.quantity || 0;

  const itemAdditionalData: ItemLineAdditionalData = transactionAdditionalData &&
      transactionAdditionalData.lines &&
      transactionAdditionalData.lines.find((itemLineAdditionalData: ItemLineAdditionalData) => {
        return itemLineAdditionalData.canonicalSequenceNumber === itemLine.lineNumberFromReturnCanonicalTransaction;
      });

  const sublineSequenceNumber: number = subline && subline.lineNumberFromCanonicalSubItem;

  const sublineAdditionalData: ItemSublineAdditionalData = itemAdditionalData &&
      itemAdditionalData.sublines &&
      itemAdditionalData.sublines.find((itemSublineAdditionalData: ItemSublineAdditionalData) => {
        return itemSublineAdditionalData.canonicalSequenceNumber === sublineSequenceNumber;
      });

  const previouslyReturned: number = sublineAdditionalData && sublineAdditionalData.returnedQuantity &&
      Number(sublineAdditionalData.returnedQuantity.amount);

  return {
    sublineAvailableQuantity: sublineQuantity - (previouslyReturned !== undefined ? previouslyReturned : 0),
    previouslyReturned
  };
}

export function getDateFromISODateString(dt: string): Date {
  if (_.isEmpty(dt)) {
    return undefined;
  }

  //parse ISO date string
  const year = dt.substring(0, 4);
  const month = dt.substring(5, 7);
  const day = dt.substring(8, 10);

  const dtObj = new Date(+year, +month - 1, +day);
  return dtObj;
}

export function removeMSAndTimeZone(dt: string): string {
  if (dt) {
    const msIndex = dt.indexOf(".");
    if (msIndex > 0) {
      dt = dt.slice(0, msIndex);
    }

    const offsetIndex = dt.indexOf("-", 8);
    if (offsetIndex > 0) {
      dt = dt.slice(0, offsetIndex);
    }
  }

  return dt;
}

export function getCustomerDisplayText(customer: ICustomer): string {
  if (customer && customer.firstName && customer.lastName) {
    return `${I18n.t("customerName")}: ${customer.firstName} ${customer.lastName}`;
  } else {
    return `${I18n.t("customer")}: ${customer.customerNumber}`;
  }
}

export function validateRequiresOneOf(errors: any, values: any, requiresConfig: any, configManager: IConfigurationManager,
                                      configKeyToFieldKeysMapper: Map<string, string[]>, isDisplayTax: boolean,
                                      i18nLocation: string): boolean {
  let isValid: boolean = true;
  if (requiresConfig) {
    requiresConfig.forEach((group: string[]) => {
      isValid = validateGroup(errors, values, group, configManager, configKeyToFieldKeysMapper, false, isDisplayTax,
        i18nLocation) && isValid;
    });
  }
  return isValid;
}

export function validateRequiresAllOf(errors: any, values: any, requiresConfig: any, configManager: IConfigurationManager,
                                      configKeyToFieldKeysMapper: Map<string, string[]>, isDisplayTax: boolean, i18nLocation: string): void {

  if (requiresConfig) {
    requiresConfig.forEach((group: string[]) => {
      validateGroup(errors, values, group, configManager, configKeyToFieldKeysMapper, true, isDisplayTax, i18nLocation) ;
    });
  }
}

export function validateGroup(errors: any, values: any, group: string[], configManager: IConfigurationManager,
                              configKeyToFieldKeysMapper: Map<string, string[]>, all: boolean,
                              isDisplayTax: boolean, i18nLocation: string): boolean {

  const validConfigKeys: string[] = [];
  let missingFields: string[] = [];
  if (group) {
    group.forEach((configKey: string ) => {
      const fieldKeys: string[] = configKeyToFieldKeysMapper.get(configKey);
      if (fieldKeys && fieldKeys.length > 0) {
        const validFields = fieldKeys.filter((fieldKey: string) => values[fieldKey] && values[fieldKey].trim().length > 0);

        if (validFields.length === fieldKeys.length) {
          //fieldKey is valid
          validConfigKeys.push(configKey);
        } else {
          missingFields = [...missingFields, ...fieldKeys];
        }
      } else if (configKey === "address") {
        const addressErrors = _.cloneDeep(errors);
        validateAddressFields(addressErrors, values, configManager, true, isDisplayTax, i18nLocation);
        if (!isAddressEmpty(values) && _.isEqual(addressErrors, errors)) {
          validConfigKeys.push(configKey);
        } else {
          const errorFields = getNewErrorFields(errors, addressErrors);
          missingFields = [...missingFields, ...errorFields];
        }
      }
    });

    if (!validConfigKeys || validConfigKeys.length === 0 || (all && validConfigKeys.length !== group.length)) {
      //Mark group as required as it doesn't meet validation rules
      missingFields.forEach(key => {
        if (!values[key]) {
          errors[key] =  I18n.t("required");
        }
      });
      return false;
    }
    return true;
  }
}

function isAddressEmpty(values: any) : boolean {
  return !values.address1 &&
      !values.address2 &&
      !values.address3 &&
      !values.address4 &&
      !values.city &&
      !values.district &&
      !values.state &&
      !values.postalCode;
}

export function validateAddressFields(errors: any, values: any, configManager: IConfigurationManager, required: boolean, isDisplayTax: boolean,
                                      i18nLocation: string): CountryAddressFormat {
  const addressFormats: AddressFormatConfig = configManager.getI18nAddressFormats();
  let countryAddressFormat: CountryAddressFormat = undefined;
  const countryCode = values.countryCode || i18nLocation;
  let country: string;
  for (const countryKey in addressFormats) {
    if (countryKey === countryCode ||
        (addressFormats[countryKey] && addressFormats[countryKey].countryCode === countryCode)) {
      countryAddressFormat = addressFormats[countryKey];
      country = countryKey;
      const customerAddressOverrides = getCustomerAddressOverrides(configManager,country, i18nLocation);
      // tslint:disable-next-line:cyclomatic-complexity
      const isValidAddressEntry = (validationValue: string, field: string, fieldMinKey: string, fieldMaxKey: string, fieldUsageKey: string, addressDirty: boolean) => {
        if (validationValue) {
          if (
            (countryAddressFormat[fieldMinKey] && countryAddressFormat[fieldMinKey] > 0 && !values[field])
          ) {
            errors[field] = I18n.t("required", { field: I18n.t(field) });
          } else if (
            (countryAddressFormat[fieldMinKey] &&
              values[field] && values[field].length < countryAddressFormat[fieldMinKey]) ||
            (countryAddressFormat[fieldMaxKey] &&
              values[field] && values[field].length > countryAddressFormat[fieldMaxKey])) {
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
        } else if (addressDirty && (customerAddressOverrides && customerAddressOverrides[fieldUsageKey] &&
            customerAddressOverrides[fieldUsageKey] === Usage.Required && !isDisplayTax ||
            (!(customerAddressOverrides && customerAddressOverrides[fieldUsageKey]) || isDisplayTax) &&
            countryAddressFormat[fieldUsageKey] === Usage.Required)) {
          errors[field] = I18n.t("required", { field: I18n.t(field) });
        }
      };
      const addressRequired: boolean = required || !!(values.address1 || values.address2 || values.address3 || values.address4 || values.city || values.district || values.state || values.postalCode);

      isValidAddressEntry(values.address1, "address1", "addressLine1MinLength", "addressLine1MaxLength", "addressLine1Usage", addressRequired);
      isValidAddressEntry(values.address2, "address2", "addressLine2MinLength", "addressLine2MaxLength", "addressLine2Usage", addressRequired);
      isValidAddressEntry(values.address3, "address3", "addressLine3MinLength", "addressLine3MaxLength", "addressLine3Usage", addressRequired);
      isValidAddressEntry(values.address4, "address4", "addressLine4MinLength", "addressLine4MaxLength", "addressLine4Usage", addressRequired);
      isValidAddressEntry(values.city, "city", "cityMinLength", "cityMaxLength", "cityUsage", addressRequired);
      isValidAddressEntry(values.district, "district", "secondAdminDivisionMinLength", "secondAdminDivisionMaxLength", "secondAdminDivisionUsage", addressRequired);
      isValidAddressEntry(values.state, "state", "firstAdminDivisionMinLength", "firstAdminDivisionMaxLength", "firstAdminDivisionUsage", addressRequired);
      isValidAddressEntry(values.postalCode, "postalCode", "postalCodeMinLength", "postalCodeMaxLength", "postalCodeUsage", addressRequired);
      break;
    }
  }
  return Object.assign({}, countryAddressFormat, {country});
}

export function validatePhoneFields(errors: any, values: any, configManager: IConfigurationManager): PhoneCountryCode {
  const phoneFormats: PhoneFormatConfig = configManager.getI18nPhoneFormats();

  for (const countryKey in phoneFormats) {
    if (countryKey === values.phoneCountryCode ||
      (phoneFormats[countryKey] && phoneFormats[countryKey].countryCode === values.phoneCountryCode)) {
        const countryPhoneFormat = phoneFormats[countryKey];
        let regExp;
        if (countryPhoneFormat.minLength || countryPhoneFormat.maxLength) {
          regExp =
           new RegExp(`^[0-9]{${countryPhoneFormat.minLength || 0},${countryPhoneFormat.maxLength || ""}}$`);
        } else {
          regExp = new RegExp(`^[0-9]*$`);
        }
        if (values.phoneNumber && !values.phoneNumber.match(regExp)) {
          const errMessage = "customerCannotBeCreatedPhoneInvalidLength";
          if (countryPhoneFormat.minLength && countryPhoneFormat.maxLength) {
            errors.phoneNumber = I18n.t(errMessage,
              { length: countryPhoneFormat.minLength + "-" + countryPhoneFormat.maxLength });
          } else if (countryPhoneFormat.minLength) {
            errors.phoneNumber = I18n.t(errMessage, { length: countryPhoneFormat.minLength });
          } else if (countryPhoneFormat.maxLength) {
            errors.phoneNumber = I18n.t(errMessage, { length: countryPhoneFormat.maxLength });
          } else {
            errors.phoneNumber = I18n.t("customerCannotBeCreatedPhoneInvalidFormat");
          }
        }
      return countryPhoneFormat;
    }
  }
}

export function isTenderLineAvailable(displayInfo: IDisplayInfo): boolean {
  return displayInfo?.tenderDisplayLines?.some((tenderLine: ITenderDisplayLine) =>
      tenderLine.lineNumber && tenderLine.lineType === TENDER_PAYMENT_LINE_TYPE);
}

export function getCurrencyCode(stateValues: Map<string, any>, retailLocationCurrency: string ): string {
  const currency = stateValues && stateValues.get("transaction.accountingCurrency") || retailLocationCurrency;
  return currency;
}

function getNewErrorFields(errors: any, newErrors: any): string[] {
  const errorDiff: string[] = [];

  for (const field in newErrors) {
    if (errors[field] !== newErrors[field]) {
      errorDiff.push(field);
    }
   }
  return errorDiff;
}

export function getCashTenderData(configurationManager: IConfigurationManager, retailLocationCurrency: string): ICurrencyData[] {
  const tenderValuesDefinitions = configurationManager && configurationManager.getTendersValues() &&
      configurationManager.getTendersValues().tenderDefinitions;
  const tenderData = tenderValuesDefinitions &&
      tenderValuesDefinitions.filter((tender: any) => tender.tenderType === TenderType.Cash &&
      tender.trackableBy?.includes("Amount") && !(tender.isForeignTender && tender.currencyCode === retailLocationCurrency));
  const returnData: ICurrencyData[] = tenderData?.map((data: any) => {
    return {
      tenderId: data.tenderId,
      currencyCode: data.currencyCode || retailLocationCurrency,
      tenderName: data.tenderName,
      isForeignTender: data.isForeignTender
    }
  }) || [];

  if (returnData?.length < 1) {
    const backupData = tenderValuesDefinitions &&
      tenderValuesDefinitions.find((tender: any) => tender.tenderType === TenderType.Cash);
    returnData.push({
      tenderId: backupData.tenderId,
      currencyCode: backupData.currencyCode || retailLocationCurrency,
      tenderName: backupData.tenderName
    });
  }

  return returnData;
}

export function getTestIdProperties(id: string, suffix?: string): object {
  if (id !== undefined) {
    const componentId = suffix ? `${id}-${suffix}` : id;
    if(Platform.OS === "ios") {
      return {
        testID: componentId
      };
    } else {
      return {
        accessibilityLabel: componentId
      };
    }
  }
  return undefined;
}

export function getI18nLocation(retailLocations: RetailLocationsState, configurationManager: IConfigurationManager): string {
  const retailLocation = retailLocations && retailLocations.retailLocation;
  const i18nLocation = geti18nLocation(retailLocation, configurationManager);
  return i18nLocation;
}

export function isConfirmCustomerDetailsDuringReprint(configurationManager: IConfigurationManager, i18nLocation: string): boolean {
  const i18nConfig = configurationManager.getI18nCountryConfigValues(i18nLocation);
  const invoicingConfigDuringReprint = i18nConfig.invoicing;
  const isInvoicingConfigDuringReprint: boolean = invoicingConfigDuringReprint && invoicingConfigDuringReprint.reprint && invoicingConfigDuringReprint.reprint.confirmCustomerDetails ?
      (invoicingConfigDuringReprint.reprint.confirmCustomerDetails === ReprintStatus.Never ? true : false) : false;
  return isInvoicingConfigDuringReprint;
}

export function shouldOpenGiftCertificateIssuance(businessState: BusinessState): boolean {
  //if giftCertificateState exists on CashDrawerSession and the cash drawer is open,
  //then that means that the user restarted app while issuing GCert and left drawer open.
  //in this case open GCert issuance screen
  return (businessState.stateValues.get("CashDrawerSession.giftCertificateState") &&
      businessState.stateValues.get("CashDrawerSession.isOpen"));
}

export function getGiftCertificateTenderIdFromCashDrawerState(businessState: BusinessState): number {
  const giftCertState: GiftCertificateState = businessState.stateValues.get("CashDrawerSession.giftCertificateState");
  return giftCertState?.tenderId;
}

export function isFullTaxInvoiceReprint(configurationManager: IConfigurationManager, i18nLocation: string): boolean {
  const i18nConfig = configurationManager.getI18nCountryConfigValues(i18nLocation);
  const receiptTypeReprintChoice = i18nConfig.receiptTypeChoices;
  const isReceiptTypeReprintChoice: boolean = receiptTypeReprintChoice && receiptTypeReprintChoice.fullTaxInvoice &&
      receiptTypeReprintChoice.fullTaxInvoice.reprint ? receiptTypeReprintChoice.fullTaxInvoice.reprint.enableOnlyWhenCustomerAssignedToTransaction : false;
  return isReceiptTypeReprintChoice;
}

export function isConfirmCustomerDetailsPageAllowed(configurationManager: IConfigurationManager, i18nLocation: string,
                                                    transactionTotal: Money, customerType: string,
                                                    accountingCurrency: string): boolean {
  if (accountingCurrency) {
    const i18nConfig = configurationManager.getI18nCountryConfigValues(i18nLocation);
    const taxationConfig = i18nConfig && i18nConfig.taxation;
    const conditionsConfig = taxationConfig && taxationConfig.vatNumber && taxationConfig.vatNumber.conditions;
    const customerTypeFromConfig: string = conditionsConfig && conditionsConfig.customerType;
    const transactionTotalOver = conditionsConfig && conditionsConfig.transactionTotalOver;
    let transactionTotalOverAmount = new Money(transactionTotalOver || 0.00, accountingCurrency);
    if (transactionTotal.isNegative() && !transactionTotalOverAmount.isNegative()) {
      transactionTotalOverAmount = new Money(-transactionTotalOver || 0.00, accountingCurrency);
    }
    let transactionTotalCompare: boolean = transactionTotal.gt(transactionTotalOverAmount);
    if (transactionTotal.isNegative() && transactionTotalOverAmount.isNegative()){
      transactionTotalCompare = transactionTotalOverAmount.gt(transactionTotal)
    }
    const businessCustomer = CustomerType[1].code;
    return ((customerTypeFromConfig === businessCustomer || customerType === businessCustomer) && transactionTotalCompare);
  }
  return false;
}

export function getTaxidentifierValdiation(configurationManager: IConfigurationManager, i18nLocation: string,
                                        transactionTotal: Money, accountingCurrency: string): ITaxIdentifierValidation {
  const i18nConfig = configurationManager.getI18nCountryConfigValues(i18nLocation);
  const taxationConfigs: ITaxIdentifiersConfig = i18nConfig && i18nConfig.taxation && i18nConfig.taxation.taxIdentifiers;
  let isRucRequired: boolean = false;
  let isIdNumberRequired: boolean = false;

  const rucUsage: string = taxationConfigs?.RUC?.usage;
  if (rucUsage === Usage.ConditionallyRequired) {
    const rucThreshold: IThresholdLimit = taxationConfigs.RUC?.conditions?.transactionTotalThreshold;
    const rucKey: string = Object.keys(rucThreshold)[0];
    const rucValue: string = Object.values(rucThreshold)[0];
    const rucReceiptCategory = taxationConfigs?.RUC?.conditions?.receiptCategory;
    isRucRequired = isRequired(rucKey, rucValue, transactionTotal, accountingCurrency, rucReceiptCategory);
  }

  const idNumberUsage: string = taxationConfigs?.idNumber?.usage;
  if (idNumberUsage === Usage.ConditionallyRequired) {
    const idNumberThreshold: IThresholdLimit = taxationConfigs.idNumber?.conditions?.transactionTotalThreshold;
    const idNumberKey: string = Object.keys(idNumberThreshold)[0];
    const idNumberValue = Object.values(idNumberThreshold)[0];
    const idNumberReceiptCategory = taxationConfigs?.RUC?.conditions?.receiptCategory;
    isIdNumberRequired = isRequired(idNumberKey, idNumberValue, transactionTotal, accountingCurrency, idNumberReceiptCategory);
  }

  const taxIdentifiersDetails: ITaxIdentifierValidation = {
    ruc: isRucRequired,
    idNumber: isIdNumberRequired
  };
  return  taxIdentifiersDetails;
}

export function getTaxationValdiation(configurationManager: IConfigurationManager, i18nLocation: string,
  transactionTotal: Money, accountingCurrency: string): ITaxationValidation {
  const i18nConfig = configurationManager.getI18nCountryConfigValues(i18nLocation);
  const taxationConfigs: ITaxationConfig = i18nConfig && i18nConfig.taxation;
  let isVatNumberRequired: boolean = false;

  const vatNumberUsage: string = taxationConfigs?.vatNumber?.usage;
  if (vatNumberUsage === Usage.ConditionallyRequired) {
    const vatNumberThreshold: IThresholdLimit = taxationConfigs.vatNumber?.conditions?.transactionTotalThreshold;
    const vatNumberKey: string = vatNumberThreshold && Object.keys(vatNumberThreshold)[0];
    const vatNumberValue: string = vatNumberThreshold && Object.values(vatNumberThreshold)[0];
    const vatNumberReceiptCategory = taxationConfigs?.vatNumber?.conditions?.receiptCategory;
    isVatNumberRequired = isRequired(vatNumberKey, vatNumberValue, transactionTotal, accountingCurrency, vatNumberReceiptCategory);
  }

  const taxationDetails: ITaxationValidation = {
    vatNumber: isVatNumberRequired
  };
  return taxationDetails;
}

function isRequired(key: string, value: string, transactionTotal: Money, accountingCurrency: string,
                    receiptCategory: string): boolean {
  let isRequiredField: boolean;
  const amount = new Money(value || 0.00, accountingCurrency);
  switch (key) {
    case ThresholdLimit.Minimum:
      isRequiredField = transactionTotal.gte(amount);
      break;
    case ThresholdLimit.Maximum:
      isRequiredField = transactionTotal.lte(amount);
      break;
    case ThresholdLimit.LessThan:
      isRequiredField = transactionTotal.lt(amount);
      break;
    case ThresholdLimit.GreaterThan:
      isRequiredField = transactionTotal.gt(amount);
      break;
    default:
      break;
  }
  return isRequiredField && receiptCategory === ReceiptCategory.Invoice;
}

export function getCustomerDetailsThresholdValdiation(configurationManager: IConfigurationManager, i18nLocation: string,
                                                      transactionTotal: Money, accountingCurrency: string): ICustomerValidation {
  const i18nConfig = configurationManager.getI18nCountryConfigValues(i18nLocation);
  const customerDetailsConfig: ICustomerDetailsConfig = i18nConfig && i18nConfig.invoicing && i18nConfig.invoicing.customerDetails;
  let isFirstNameRequired: boolean = false;
  let isLastNameRequired: boolean = false;
  let isAddressRequired: boolean = false;

  const firstNameUsage: string = customerDetailsConfig?.firstName?.usage;
  if (firstNameUsage === Usage.ConditionallyRequired) {
    const firstNameThreshold: IThresholdLimit = customerDetailsConfig?.firstName?.conditions?.transactionTotalThreshold;
    const firstNameKey: string = Object.keys(firstNameThreshold)[0];
    const firstNameValue: string = Object.values(firstNameThreshold)[0];
    const firstNameReceiptCategory = customerDetailsConfig?.firstName?.conditions?.receiptCategory;
    isFirstNameRequired = isRequired(firstNameKey, firstNameValue, transactionTotal, accountingCurrency, firstNameReceiptCategory);
  }

  const lastNameUsage: string = customerDetailsConfig?.lastName?.usage;
  if (lastNameUsage === Usage.ConditionallyRequired) {
    const lastNameThreshold: IThresholdLimit = customerDetailsConfig?.lastName?.conditions?.transactionTotalThreshold;
    const lastNameKey: string = Object.keys(lastNameThreshold)[0];
    const lastNameValue: string = Object.values(lastNameThreshold)[0];
    const lastNameReceiptCategory = customerDetailsConfig?.lastName?.conditions?.receiptCategory;
    isLastNameRequired = isRequired(lastNameKey, lastNameValue, transactionTotal, accountingCurrency, lastNameReceiptCategory);
  }

  const addressUsage: string = customerDetailsConfig?.address?.usage;
  if (addressUsage === Usage.ConditionallyRequired) {
    const addressThreshold: IThresholdLimit = customerDetailsConfig?.address?.conditions?.transactionTotalThreshold;
    const addressKey: string = Object.keys(addressThreshold)[0];
    const addressValue: string = Object.values(addressThreshold)[0];
    const addressReceiptCategory = customerDetailsConfig?.lastName?.conditions?.receiptCategory;
    isAddressRequired = isRequired(addressKey, addressValue, transactionTotal, accountingCurrency, addressReceiptCategory);
  }

  const taxIdentifiersDetails: ICustomerValidation = {
    firstName: isFirstNameRequired,
    lastName: isLastNameRequired,
    address: isAddressRequired
  };
  return taxIdentifiersDetails;
}

export function isTaxCustomerRequiredConfigExists(configurationManager: IConfigurationManager,
                                                  i18nLocation: string): boolean {
  const i18nConfig = configurationManager.getI18nCountryConfigValues(i18nLocation);
  const taxationConfig = i18nConfig?.taxation;
  const isTaxCustomerRequiredDuringReturn: boolean = taxationConfig?.taxCustomerRequiredDuringReturn;
  return isTaxCustomerRequiredDuringReturn;
}

export const hideBackAndCancelButton = (receiptCategory: ReceiptCategory): boolean => {
  switch(receiptCategory){
    case ReceiptCategory.Suspend:
    case ReceiptCategory.PostVoid:
    case ReceiptCategory.BalanceInquiry:
    case ReceiptCategory.Till:
    case ReceiptCategory.NoSale:
      return true;
    default:
      return false;
  }
}

export const updateScroll = (scrollEvent: any,
                             isScrolling: boolean): boolean => {
  if(scrollEvent && scrollEvent.nativeEvent && scrollEvent.nativeEvent.contentOffset) {
    const contentOffset = scrollEvent.nativeEvent.contentOffset;
    if (contentOffset.y > 3 && !isScrolling) {
      isScrolling = true;
    } else if (contentOffset.y <= 3 && isScrolling) {
      isScrolling = false;
    }
  }
  return isScrolling;
}
