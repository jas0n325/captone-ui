import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { CountryAddressFormat, getAddressFormatorDefault } from "@aptos-scp/scp-component-store-selling-features";
import { IAddress } from "@aptos-scp/scp-types-commerce-transaction";


export const getAddressInitialValue = (address: IAddress, configManager: IConfigurationManager, i18nLocation: string) => {
  const addressIsEmpty: boolean = address && Object.keys(address).every((key: string) => {
    return !address[key];
  });

  let defaultAddressFormat: CountryAddressFormat;

  if (!address || addressIsEmpty) {
    defaultAddressFormat = getAddressFormatorDefault(configManager, i18nLocation, i18nLocation);
  }

  return getAddressFormat(address, defaultAddressFormat);
}

export const getAddressFormat = (address: IAddress, defaultAddressFormat?: CountryAddressFormat) => {
  return {
    address1: address?.addressLine1,
    address2: address?.addressLine2,
    city: address?.city,
    stateOrProvince: address?.stateOrProvince,
    postalCode: address?.postalCode,
    countryCode: address?.countryCode || defaultAddressFormat?.countryCode
  };
}

export const getDefaultCountryCode = (configManager: IConfigurationManager, i18nLocation: string) => {
  const defaultAddressFormat: CountryAddressFormat = getAddressFormatorDefault(configManager, i18nLocation,
      i18nLocation);
  return defaultAddressFormat?.countryCode;
}

