import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { Customer } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { CustomerState } from "../../../reducers";
import Theme from "../../../styles";
import Header from "../../common/Header";
import VectorIcon from "../../common/VectorIcon";
import { NavigationProp } from "../../StackNavigatorParams";
import CustomerResultLine from "./CustomerResultLine";
import { customerResultsStyles } from "./styles";


interface Props {
  assignCustomer: boolean;
  hideCreateCustomer: boolean;
  returnMode: boolean;
  customerLookupInProgress: boolean;
  customerLookupFailed: boolean;
  customerState: CustomerState;
  onCustomerSelected: (customer: Customer) => void;
  onExit: () => void;
  configurationManager: IConfigurationManager;
  showCustomerLoyaltyIndicator: (customer: Customer) => boolean;
  navigation: NavigationProp;
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
        <Header
          title={I18n.t("customerSearch")}
          returnMode={this.props.returnMode}
          backButton={{name: "Back", action: this.pop}}
        />
        {!this.props.hideCreateCustomer &&
        <TouchableOpacity
          activeOpacity={1}
          style={this.styles.assignCustAndSelectItemsBtn}
          onPress={this.pushCustomerCreate}
        >
          <View style={this.styles.assignCustomerContainer}>
            <VectorIcon
              name={"AddCustomer"}
              fill={this.styles.assignCustomerIcon.color}
              height={this.styles.assignCustomerIcon.fontSize}
            />
            <Text style={this.styles.assignCustomerText}>{I18n.t("newCustomer")}</Text>
          </View>
          <View style={this.styles.arrowArea}>
            <VectorIcon name="Forward" height={this.styles.icon.fontSize} fill={this.styles.icon.color} />
          </View>
        </TouchableOpacity>
        }
        {
          this.props.customerLookupInProgress &&
          <View style={this.styles.customerErrorArea}>
            <Text style={this.styles.titleText}>{I18n.t("searchingCustomer")}</Text>
          </View>
        }
        { // No results found && error
          this.props.customerLookupFailed &&
          <View style={this.styles.customerErrorArea}>
            <Text style={this.styles.titleText}>{I18n.t("noResults")}</Text>
            <Text style={this.styles.subtitleText}>{subtitleText}</Text>
          </View>
        }
        { //# Results
          (!this.props.customerLookupFailed && !this.props.customerLookupInProgress) &&
          <View style={this.styles.subtitleArea}>
            <Text style={this.styles.subtitleText}>
              {this.props.customerState.customers.length.toString()} {I18n.t("customerResults")}
            </Text>
          </View>
        }
        { // Results list
          (!this.props.customerLookupFailed && !this.props.customerLookupInProgress) &&
          <FlatList
            data={this.props.customerState.customers}
            keyExtractor={(item: Customer) => item.customerNumber }
            renderItem={
              ({ item }) =>
                <CustomerResultLine
                  customer={item}
                  onCustomerSelected={this.props.onCustomerSelected}
                  configurationManager={this.props.configurationManager}
                  showCustomerLoyaltyIndicator={this.props.showCustomerLoyaltyIndicator}
                  i18nLocation={this.props.i18nLocation}
                />
            }
          />
        }
      </View>
    );
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private pushCustomerCreate = () => {
    this.props.navigation.push("customerCreate", {
      assignCustomer: this.props.assignCustomer,
      onExit: () => this.props.onExit()
    });
  }
}
