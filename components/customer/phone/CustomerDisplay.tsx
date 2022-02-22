import { CountryCode, parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import _ from "lodash";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as RNLocalize from "react-native-localize";
import SegmentedControlTab from "react-native-segmented-control-tab";

import {
  AddressFormat,
  CountryAddressFormat,
  Customer,
  formatAddress,
  formatPhoneNumber,
  IRetailLocation,
  PhoneCountryCode
} from "@aptos-scp/scp-component-store-selling-features";
import {
  CustomerType,
  IMerchandiseTransaction,
  ITenderControlTransaction,
  OptIn
} from "@aptos-scp/scp-types-commerce-transaction";
import { AttributeGroupDefinitionList } from "@aptos-scp/scp-types-customer";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import I18n from "../../../../config/I18n";
import { ActionCreator } from "../../../actions";
import { BusinessState, CustomerState } from "../../../reducers";
import Theme from "../../../styles";
import CustomerHistoryTransactionList from "../../common/CustomerHistoryTransactionList";
import CustomerTagList from "../../common/CustomerTagList";
import { RenderSelectOptions } from "../../common/FieldValidation";
import Header from "../../common/Header";
import MembershipStatusIndicator from "../../common/MembershipStatusIndicator";
import { Section } from "../../common/Section";
import { SectionLine } from "../../common/SectionLine";
import { SectionRow } from "../../common/SectionRow";
import { SectionSubHeader } from "../../common/SectionSubHeader";
import VectorIcon from "../../common/VectorIcon";
import { NavigationProp } from "../../StackNavigatorParams";
import { CustomerAttributeList } from "../CustomerAttributeList";
import { getDefaultLoyaltyMembership } from "../CustomerUtilities";
import { customerDisplayStyle } from "./styles";


interface Props {
  assignCustomer: boolean;
  searchResponseIncludesFullTransaction: boolean;
  customer: Customer;
  returnMode: boolean;
  languages: RenderSelectOptions[];
  onAssignRemove: () => void;
  onExit: () => void;
  phoneFormat: PhoneCountryCode;
  addressFormat: CountryAddressFormat;
  attributeDefs: AttributeGroupDefinitionList;
  businessState: BusinessState;
  displayLoyalty: boolean;
  displayLoyaltyEnrollButton: boolean;
  displayLoyaltyIndicator: boolean;
  displayTransHistory: boolean;
  onSubmitLoyaltyEnrollment: (loyaltyPlanKey: string, membershipTypeKey: string, emailAddress?: string) => void;
  onFindCustomerTransactions: () => void;
  transactions: Array<IMerchandiseTransaction | TransactionWithAdditionalData | ITenderControlTransaction>;
  retailLocations: IRetailLocation[];
  parentScene: string;
  selectedTransaction: TransactionWithAdditionalData;
  getHistoricalTransaction: ActionCreator;
  disableCustomerButton: boolean;
  navigation: NavigationProp;
  customerState?: CustomerState;
}

interface State {
  segmentedControlSelectedIndex: number;
  selectedTransactionId: string;
}

export default class CustomerDisplay extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(customerDisplayStyle());

    this.state = {
      segmentedControlSelectedIndex: 0,
      selectedTransactionId: undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.selectedTransaction && prevProps.selectedTransaction !== this.props.selectedTransaction) {
      this.props.navigation.push("transactionHistory", {
        transaction:
            (this.props.selectedTransaction).transaction as IMerchandiseTransaction,
        isPostVoidMode: false,
        suppressReprintReceipt: true,
        parentScene: this.props.parentScene,
        isCustomerHistory: true
      });
    }
  }

  public render(): JSX.Element {
    const { customer } = this.props;
    const prefContact: string = ((this.props.customer.emailOptIn === OptIn.True) && I18n.t("emailOptIn")) ||
    ((this.props.customer.textOptIn === OptIn.True) && I18n.t("textOptIn")) ||
    ((this.props.customer.phoneOptIn === OptIn.True) && I18n.t("phoneOptIn")) ||
    ((this.props.customer.mailOptIn === OptIn.True) && I18n.t("mailOptIn")) ||
    I18n.t("unknownOptIn");

    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("customerProfile")}
          returnMode={this.props.returnMode}
          backButton={{name: "Back", action: this.pop}}
          rightButton={
            this.allowEdit() ?
            {
              title: I18n.t("edit"),
              action: this.pushCustomerUpdate
            } : <View />
          }
        />
        {this.props.displayTransHistory &&
          <View style={this.styles.controlArea}>
            <SegmentedControlTab
              activeTabStyle={this.styles.activeTabStyle}
              activeTabTextStyle={this.styles.activeTabTextStyle}
              tabStyle={this.styles.tabStyle}
              tabTextStyle={this.styles.tabTextStyle}
              values={[I18n.t("details"), I18n.t("history")]}
              selectedIndex={this.state.segmentedControlSelectedIndex}
              onTabPress={this.handleTabPress.bind(this)}
            />
          </View>
        }
        {this.state.segmentedControlSelectedIndex === 0 &&
        <>
          <View style={this.styles.headerPanel}>
            <View style={this.styles.customerNameArea}>
              <Text style={this.styles.customerNameText}>{customer && customer.fullName}</Text>
              {customer?.hasLoyaltyMemberships && this.props.displayLoyaltyIndicator &&
                <View style={this.styles.loyaltyIndicator}>
                  <VectorIcon
                    name={"LoyaltyCard"}
                    fill={this.styles.customerNameText.color}
                    height={this.styles.customerNameText.fontSize} />
                </View>
              }
            </View>
            <Text style={this.styles.customerIdText}>
              {I18n.t("id")}: {this.props.customer && this.props.customer.customerNumber}
            </Text>
          </View>
          <KeyboardAwareScrollView style={this.styles.fill}>
            {this.renderCustomerDetails(prefContact)}
          </KeyboardAwareScrollView>
          <View style={this.styles.btnArea}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.customerButton,
              this.props.disableCustomerButton ?
              this.styles.btnDisabled : {}]}
              onPress={() => this.props.onAssignRemove()}
              disabled={this.props.disableCustomerButton}
            >
              <Text style={[this.styles.btnPrimaryText, this.props.disableCustomerButton ?
                  this.styles.btnTextDisabled : {}]}>
                {I18n.t(this.props.assignCustomer ? "assignCustomer" : "removeCustomer")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
        }
        {this.state.segmentedControlSelectedIndex === 1 &&
            this.renderTransactionHistory()
        }
      </View>
    );
  }

  private allowEdit(): boolean {
    return !this.props.returnMode && !this.props.customer.offline;
  }

  private handleTabPress(index: number): void {
    this.setState({ segmentedControlSelectedIndex: index });
    if(index === 1 && _.isEmpty(this.props.transactions)) {
      this.props.onFindCustomerTransactions();
    }
  }

  private renderTransactionHistory(): JSX.Element {
    const searchReturnedResults: boolean = this.props.transactions &&
        !!this.props.transactions.length;
    const searchResultsEmpty: boolean = this.props.transactions && this.props.transactions.length === 0;
    if (searchResultsEmpty){
      return (
        <Text style={this.styles.transactionMessageText}>{I18n.t("noTransactionsFound")}</Text>
      );
    } else if (searchReturnedResults) {
      return (
        <CustomerHistoryTransactionList
          transactions={this.props.transactions}
          styles={this.styles}
          retailLocations={this.props.retailLocations}
          onTransactionSelected={this.handleTransactionSelectedSearch.bind(this)}
        />
      );
    }
  }

  private handleTransactionSelectedSearch(
      item: IMerchandiseTransaction | TransactionWithAdditionalData | ITenderControlTransaction): void {
    if (this.props.searchResponseIncludesFullTransaction) {
      this.props.navigation.push("transactionHistory", {
        transaction: item as IMerchandiseTransaction,
        isPostVoidMode: false,
        suppressReprintReceipt: false,
        parentScene: this.props.parentScene,
        isCustomerHistory: true
      });
    } else {
      this.props.getHistoricalTransaction(item.transactionId,
          this.props.businessState.stateValues.get("UserSession.user.preferredLanguage"));

      this.setState({selectedTransactionId: item.transactionId});
    }
  }

  private renderLoyaltySection(): JSX.Element {
    const currentCustomerLoyaltyPlan: any = getDefaultLoyaltyMembership(this.props.customer.loyaltyMemberships);

    let availPoints;
    let balancePoints;
    let loyPlanLabel;

    if (currentCustomerLoyaltyPlan) {
      availPoints = currentCustomerLoyaltyPlan.availablePointBalance;
      balancePoints = (currentCustomerLoyaltyPlan.postedPointBalance || 0)
          + (currentCustomerLoyaltyPlan.pendingPointBalance || 0);
      const planMembershipCount = this.props.customer.loyaltyMemberships.length;
      const planMembershipMoreCount = planMembershipCount > 1 ? planMembershipCount - 1 : 0;
      const planName = _.get(currentCustomerLoyaltyPlan, "loyaltyPlan.description") ||
          _.get(currentCustomerLoyaltyPlan, "loyaltyPlan.name");
      if (planMembershipMoreCount > 0) {
        loyPlanLabel =
            `${planName}, +${planMembershipMoreCount} ${I18n.t("more")}`;
      } else {
        loyPlanLabel = planName;
      }
    }
    return (
        <>
          {currentCustomerLoyaltyPlan &&
          <Section styles={this.styles} titleKey="loyalty" >
            <TouchableOpacity
                style={this.styles.loyMembershipView}
                onPress={() =>
                    this.props.navigation.push("loyaltyMembershipDetails", {
                      customer: this.props.customer,
                      loyaltyMemberships: this.props.customer.loyaltyMemberships,
                      loyaltyPlanKey: currentCustomerLoyaltyPlan.loyaltyPlanKey,
                      onLoyaltyEnrollment: this.props.onSubmitLoyaltyEnrollment,
                      customerEmailAddress: this.props.customer.emailAddress,
                      returnToCustomerScene: "customerDisplay",
                      displayLoyaltyEnrollButton: this.props.displayLoyaltyEnrollButton
                    })
                }
            >
              <View style={this.styles.loyMembershipViewBody}>
                {
                  <View style={this.styles.membershipViewStatus}>
                    <Text style={this.styles.loyMembershipViewTitle}>
                      {loyPlanLabel}
                    </Text>

                    <SectionSubHeader styles={this.styles}>{I18n.t("loyType")}</SectionSubHeader>
                    <SectionLine styles={this.styles}>
                      {_.get(currentCustomerLoyaltyPlan, "membershipType.description")}
                    </SectionLine>
                    <MembershipStatusIndicator
                        membershipStatusKey={
                          (_.get(currentCustomerLoyaltyPlan, "membershipStatus.membershipStatusKey"))
                        }
                        membershipDescription={_.get(currentCustomerLoyaltyPlan, "membershipStatus.description")}
                    />
                    <SectionRow styles={this.styles}>
                      <SectionSubHeader styles={this.styles}>{I18n.t("loyAvailablePoints")}</SectionSubHeader>
                      <SectionLine styles={this.styles}>
                        {availPoints.toLocaleString()} {I18n.t("of")} {balancePoints.toLocaleString()}
                      </SectionLine>
                    </SectionRow>
                  </View>
                }
              </View>
              <VectorIcon
                  name="Forward"
                  stroke={this.styles.chevronIcon.color}
                  height={this.styles.chevronIcon.height}
                  width={this.styles.chevronIcon.width}
              />
            </TouchableOpacity>
          </Section>
          }
          {!currentCustomerLoyaltyPlan &&
          <Section styles={this.styles} titleKey="loyalty" >
            <Text>{I18n.t("noLoyaltyMemberships")}</Text>
          </Section>
          }
          {this.props.displayLoyaltyEnrollButton &&
          <View style={this.styles.btnArea}>
            <TouchableOpacity
                style={[this.styles.btnSeconday]}
                onPress={() =>
                    this.props.navigation.push("loyaltyEnrollment", {
                      customer: this.props.customer,
                      onSave: this.props.onSubmitLoyaltyEnrollment,
                      returnToCustomerScene: "customerDisplay",
                      emailAddress: this.props.customer.emailAddress
                    })
                }
                disabled={false}
            >
              <Text style={this.styles.btnSecondaryText}>
                {I18n.t("enroll")}
              </Text>
            </TouchableOpacity>
          </View>
          }
        </>
    );
  }

  private renderCustomerDetails(prefContact: string): JSX.Element {
    const language = this.props.customer.preferredLanguage && this.props.languages ?
        this.props.languages.find((lang) => lang.code === this.props.customer.preferredLanguage) : undefined;
    const preferredLanguage = language ? language.description : this.props.customer.preferredLanguage;
    const customerType = this.props.customer ? (this.props.customer.customerType || CustomerType.Personal) : undefined;

    let phoneNumber;
    if (this.props.customer.phoneNumber) {
      let phoneNumberValue: string | PhoneNumber = this.props.phoneFormat ? formatPhoneNumber(
          this.props.customer.phoneNumber, this.props.phoneFormat.callingCode, this.props.phoneFormat.format) :
          undefined;
      if (!phoneNumberValue) {
        phoneNumberValue = parsePhoneNumberFromString(this.props.customer.phoneNumber,
          RNLocalize.getCountry() as CountryCode);
        if (phoneNumberValue && phoneNumberValue.isValid()) {
          phoneNumber = phoneNumberValue.formatNational();
        }
      } else {
        phoneNumber = phoneNumberValue;
      }
    }


    return (
      <KeyboardAwareScrollView>
        <Section styles={this.styles} titleKey="contactInformation">
          <SectionRow styles={this.styles} icon="Location" isVisible={!!this.props.customer.address1} >
              <SectionLine styles={this.styles}>{this.props.customer.companyName}</SectionLine>
              {this.renderCustomerAddress()}
          </SectionRow>
          <SectionRow styles={this.styles} icon="Mail">{this.props.customer.emailAddress}</SectionRow>
          <SectionRow styles={this.styles} icon="Phone">{phoneNumber}</SectionRow>
        </Section>
        { this.props.customer.tags &&
          <Section styles={this.styles} titleKey="tags" >
            <CustomerTagList preferredLanguage={this.props.businessState.stateValues.get("UserSession.user.preferredLanguage")}
                tags={this.props.customer.tags} style={this.styles.statusTags} allowMultipleLines={true} />
          </Section>
        }
        {this.props.displayLoyalty && this.renderLoyaltySection()}
        <Section styles={this.styles} titleKey="preferences">
          <SectionRow styles={this.styles}>
            <SectionSubHeader styles={this.styles}>{I18n.t("prefLanguage")}</SectionSubHeader>
            <SectionLine styles={this.styles}>{preferredLanguage}</SectionLine>
          </SectionRow>
          {
            !_.isEmpty(customerType) &&
            <SectionRow styles={this.styles}>
              <SectionSubHeader styles={this.styles}>{I18n.t("customerType")}</SectionSubHeader>
              <SectionLine styles={this.styles}>{customerType}</SectionLine>
            </SectionRow>
          }
        </Section>
        <CustomerAttributeList styles={this.styles}
          titleKey="attributes"
          custAttributes={this.props.customer.attributes}
          attributeDefs={this.props.attributeDefs}
          businessState={this.props.businessState}
        />
      </KeyboardAwareScrollView>
    );
  }

  private renderCustomerAddress = (): JSX.Element[] | JSX.Element => {
    const {
      address1, address2, address3, address4,
      city, state, district, postalCode, countryCode
    } = this.props.customer;
    const address: AddressFormat = {
      address1, address2, address3, address4, city, state, district, postalCode, countryCode
    };
    const formattedAddress = this.props.addressFormat ?
        formatAddress(this.props.addressFormat.formatLines, address) : undefined;

    return (
      formattedAddress && formattedAddress.length ?
        formattedAddress.map((line) => <SectionLine
          styles={this.styles}
        >{line}</SectionLine>)
        :
        <React.Fragment>
          <SectionLine styles={this.styles}
            isVisible={(!!this.props.customer.address1 || !!this.props.customer.city)}>
            {this.props.customer.address1}, {this.props.customer.city}
          </SectionLine>
          <SectionLine styles={this.styles}
            isVisible={(!!this.props.customer.state || !!this.props.customer.postalCode)}>
            {this.props.customer.state}-{this.props.customer.postalCode}
          </SectionLine>
        </React.Fragment>
    );
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private pushCustomerUpdate = () => {
    this.props.navigation.push("customerUpdate", {
      onExit: this.props.onExit
    });
  }
}
