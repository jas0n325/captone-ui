import * as React from "react";
import { FlatList, Text, View } from "react-native";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { Customer } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { CustomerState } from "../../../reducers";
import Theme from "../../../styles";
import CustomerResultLine from "./CustomerResultLine";
import { customerResultsStyles } from "./styles";


interface Props {
  assignCustomer: boolean;
  chosenCustomer: Customer;
  customerLookupInProgress: boolean;
  customerLookupFailed: boolean;
  customerState: CustomerState;
  noSearchesOccurred: boolean;
  onCustomerSelected: (customer: Customer) => void;
  showCustomerLoyaltyIndicator: (customer: Customer) => boolean;
  configurationManager: IConfigurationManager;
  i18nLocation: string;
}

export default class CustomerResults extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(customerResultsStyles());
  }

  public render(): JSX.Element {
    const subtitleText: string = (this.props.customerState.error &&
        I18n.t(this.props.customerState.error.localizableMessage.i18nCode)) ||
        I18n.t("customerNotFound");
    return (
      <View style={this.styles.root}>
        {
          this.props.noSearchesOccurred &&
          !this.props.customerLookupInProgress &&
          !this.props.customerLookupInProgress &&
          <View style={this.styles.customerErrorArea}>
            <Text style={this.styles.emptyText}>{I18n.t("searchForACustomer")}</Text>
          </View>
        }
        {
          !this.props.noSearchesOccurred &&
          this.props.customerLookupInProgress &&
          <View style={this.styles.customerErrorArea}>
            <Text style={this.styles.emptyText}>{I18n.t("searchingCustomer")}</Text>
          </View>
        }
        { // No results found && error
          (!this.props.noSearchesOccurred && this.props.customerLookupFailed) &&
          <View style={this.styles.customerErrorArea}>
            <Text style={this.styles.emptyText}>{I18n.t("noResults")}</Text>
            <Text style={this.styles.emptyText}>{subtitleText}</Text>
          </View>
        }
        { // Results list
          (!this.props.noSearchesOccurred &&
           !this.props.customerLookupFailed &&
           !this.props.customerLookupInProgress) &&
          <FlatList
            data={this.props.customerState.customers}
            keyExtractor={(item: Customer) => item.customerNumber }
            renderItem={({ item: customer }) => {
              const customerMatches: boolean = this.props.chosenCustomer &&
                                     this.props.chosenCustomer.customerNumber === customer.customerNumber;
              return (
                <CustomerResultLine
                  customer={customer}
                  isChosenCustomer={customerMatches}
                  onCustomerSelected={this.props.onCustomerSelected}
                  configurationManager={this.props.configurationManager}
                  showCustomerLoyaltyIndicator={this.props.showCustomerLoyaltyIndicator}
                  i18nLocation={this.props.i18nLocation}
                />
              );
            }}
            extraData={this.props.chosenCustomer}
          />
        }
      </View>
    );
  }
}
