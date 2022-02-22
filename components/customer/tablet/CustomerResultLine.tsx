import { CountryCode, parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as RNLocalize from "react-native-localize";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  formatPhoneNumber,
  getDefaultPhoneFormat
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import VectorIcon from "../../common/VectorIcon";
import { customerResultLineStyles } from "./styles";


interface Props {
  customer: Customer;
  isChosenCustomer?: boolean;
  onCustomerSelected: (customer: Customer) => void;
  configurationManager: IConfigurationManager;
  showCustomerLoyaltyIndicator: (customer: Customer) => boolean;
  i18nLocation: string;
}

const CustomerResultLine = (props: Props): JSX.Element => {
  const i18nLocation = props.i18nLocation;
  const styles: any = Theme.getStyles(customerResultLineStyles());
  let phoneNumber;
  if (props.customer.phoneNumber) {
    if (props.customer.phoneCountryCode) {
      const countryPhoneFormat = getDefaultPhoneFormat(props.configurationManager, props.customer.phoneCountryCode,
        i18nLocation);
      let phoneNumberValue: string | PhoneNumber = countryPhoneFormat ? formatPhoneNumber(
        props.customer.phoneNumber, countryPhoneFormat.callingCode, countryPhoneFormat.format) : undefined;
      if (!phoneNumberValue) {
        phoneNumberValue = parsePhoneNumberFromString(props.customer.phoneNumber,
          RNLocalize.getCountry() as CountryCode);
        if (phoneNumberValue && phoneNumberValue.isValid()) {
          phoneNumber = phoneNumberValue.formatNational();
        }
      } else { phoneNumber = phoneNumberValue; }
    } else { phoneNumber = props.customer.phoneNumber; }
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.row, props.isChosenCustomer && styles.activeRow]}
      onPress={() => props.onCustomerSelected(props.customer)}
    >
      <View style={styles.fill}>
        <View style={styles.customerDetails}>
          <View style={styles.customerNameLoyaltyContainer}>
            <Text style={styles.customerNameText}
              adjustsFontSizeToFit={true} numberOfLines={1}>
              {props.customer.fullName}
            </Text>
            { props.showCustomerLoyaltyIndicator(props.customer) &&
              <VectorIcon
              name={"LoyaltyCard"}
              fill={styles.loyaltyCardIcon.color}
              height={styles.loyaltyCardIcon.fontSize}
              />
            }
          </View>
        </View>
        <View style={styles.customerDetails}>
          <Text style={styles.customerText}
              adjustsFontSizeToFit={true} numberOfLines={1}>
            {`${I18n.t("id")}: `}{props.customer.customerNumber}
          </Text>
        </View>
        {props.customer.emailAddress &&
        <View style={styles.customerDetails}>
          <Text style={styles.customerText}
            adjustsFontSizeToFit={true} numberOfLines={1}>
            {`${I18n.t("email")}: `}{props.customer.emailAddress}
          </Text>
        </View>
        }
        {phoneNumber &&
        <View style={styles.customerDetails}>
          <Text style={styles.customerText}
          adjustsFontSizeToFit={true} numberOfLines={1}>
            {`${I18n.t("phoneOptIn")}: `}{phoneNumber}
          </Text>
        </View>
        }
        {props.customer.address1 &&
        <View style={styles.customerDetails}>
            <Text style={styles.customerText}
                adjustsFontSizeToFit={true} numberOfLines={1}>
              {`${I18n.t("address")}: `}{props.customer.address1}
            </Text>
        </View>
        }
        {props.customer.postalCode &&
        <View style={styles.customerDetails}>
          <Text style={styles.customerText}
                adjustsFontSizeToFit={true} numberOfLines={1}>
            {`${I18n.t("zipPostalCode")}: `}{props.customer.postalCode}
          </Text>
        </View>
        }
      </View>
      <VectorIcon
        name="Checkmark"
        fill={props.isChosenCustomer ? styles.selected.color : styles.row.backgroundColor}
        height={styles.selected.fontSize}
      />
    </TouchableOpacity>
  );
};

export default CustomerResultLine;
