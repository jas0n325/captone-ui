import { CountryCode, parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import * as _ from "lodash";
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
import { BusinessState, CustomerState} from "../../../reducers";
import Theme from "../../../styles";
import CustomerHistoryTransactionList from "../../common/CustomerHistoryTransactionList";
import CustomerTagList from "../../common/CustomerTagList";
import { RenderSelectOptions } from "../../common/FieldValidation";
import MembershipStatusIndicator from "../../common/MembershipStatusIndicator";
import { Section } from "../../common/Section";
import SectionLine from "../../common/SectionLine";
import { SectionRow } from "../../common/SectionRow";
import SectionSubHeader from "../../common/SectionSubHeader";
import VectorIcon from "../../common/VectorIcon";
import { CustomerAttributeList } from "../CustomerAttributeList";
import { getDefaultLoyaltyMembership } from "../CustomerUtilities";
import { customerDisplayStyle } from "./styles";
import { NavigationProp } from "../../StackNavigatorParams";

interface Props {
  assignCustomer: boolean;
  searchResponseIncludesFullTransaction: boolean;
  customer: Customer;
  returnMode: boolean;
  previewMode: boolean;
  languages: RenderSelectOptions[];
  onAssignRemove: () => void;
  onClearChosenCustomer: () => void;
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
  selectedTransaction: IMerchandiseTransaction | TransactionWithAdditionalData | ITenderControlTransaction;
  retailLocations: IRetailLocation[];
  parentScene: string;
  getHistoricalTransaction: ActionCreator;
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

  public render(): JSX.Element {
    const prefContact: string = ((this.props.customer.emailOptIn === OptIn.True) && I18n.t("emailOptIn")) ||
        ((this.props.customer.textOptIn === OptIn.True) && I18n.t("textOptIn")) ||
        ((this.props.customer.phoneOptIn === OptIn.True) && I18n.t("phoneOptIn")) ||
        ((this.props.customer.mailOptIn === OptIn.True) && I18n.t("mailOptIn")) ||
        I18n.t("unknownOptIn");

    return this.props.assignCustomer && !this.props.previewMode ? this.renderForAssignCustomer(prefContact) :
        this.renderWithSpacing(prefContact);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.selectedTransaction && prevProps.selectedTransaction !== this.props.selectedTransaction) {
      this.props.navigation.push("transactionHistory", {
        transaction: (this.props.selectedTransaction as TransactionWithAdditionalData).transaction as IMerchandiseTransaction,
        isPostVoidMode: false,
        suppressReprintReceipt: true,
        parentScene: this.props.parentScene,
        isCustomerHistory: true
      });
    }
  }

  private renderForAssignCustomer(prefContact: string): JSX.Element {
    const language = this.props.customer.preferredLanguage && this.props.languages ?
        this.props.languages.find((lang) => lang.code === this.props.customer.preferredLanguage) : undefined;
    const preferredLanguage = language ? language.description : this.props.customer.preferredLanguage;
    const customerType = this.props.customer && this.props.customer.customerType;
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
      <View style={this.styles.base}>
        <View style={this.styles.assignCustomerHeaderPanel}>
          <Text style={this.styles.assignCustomerNameText}>{this.props.customer && this.props.customer.fullName}</Text>
          <Text style={this.styles.assignCustomerIdText}>
            {I18n.t("customerId")}: {this.props.customer && this.props.customer.customerNumber}
          </Text>
        </View>
        <View style={this.styles.fill}>
          <KeyboardAwareScrollView>
            {this.displayCustomerAddress((this.props.customer))}
            {(!!this.props.customer.emailAddress) &&
            <View style={this.styles.detailsPiece}>
              <View style={this.styles.subtitleArea}>
                <Text style={this.styles.subtitleText}>{I18n.t("email")}</Text>
              </View>
              <Text style={this.styles.detailsText}>{this.props.customer.emailAddress}</Text>
            </View>
            }
            {phoneNumber &&
            <View style={this.styles.detailsPiece}>
              <View style={this.styles.subtitleArea}>
                <Text style={this.styles.subtitleText}>{I18n.t("phoneOptIn")}</Text>
              </View>
              <Text style={this.styles.detailsText}>{phoneNumber}</Text>
            </View>
            }
            <View style={this.styles.detailsPiece}>
              <View style={this.styles.subtitleArea}>
                <Text style={this.styles.subtitleText}>{I18n.t("prefContactMethod")}</Text>
              </View>
              <Text style={this.styles.detailsText}>{prefContact}</Text>
            </View>
            {preferredLanguage &&
            <View style={this.styles.detailsPiece}>
              <View style={this.styles.subtitleArea}>
                <Text style={this.styles.subtitleText}>{I18n.t("prefLanguage")}</Text>
              </View>
              <Text style={this.styles.detailsText}>{preferredLanguage}</Text>
            </View>
            }
            {!_.isEmpty(customerType) &&
            <View style={this.styles.detailsPiece}>
              <View style={this.styles.subtitleArea}>
                <Text style={this.styles.subtitleText}>{I18n.t("customerType")}</Text>
              </View>
              <Text style={this.styles.detailsText}>{customerType}</Text>
            </View>
            }
          </KeyboardAwareScrollView>
          <View style={this.styles.assignBtnArea}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.customerButton]}
              onPress={() => this.props.onAssignRemove()}
            >
              <Text style={this.styles.btnPrimaryText}>
                {I18n.t("assignCustomer")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.customerButton]}
              onPress={this.pushCustomerPreviewDisplay}
            >
              <Text style={this.styles.btnSecondayText}>
                {I18n.t("viewProfile")}
              </Text>
            </TouchableOpacity>
            {!this.props.returnMode &&
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.customerButton, this.props.customer.offline && this.styles.btnDisabled]}
              onPress={this.pushCustomerUpdate}
              disabled={this.props.customer.offline}
            >
              <Text style={[this.styles.btnSecondayText, this.props.customer.offline && this.styles.btnTextDisabled]}>{I18n.t("customerUpdate")}</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.customerButton]}
              onPress={() => this.props.onClearChosenCustomer()}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  private renderWithSpacing(prefContact: string): JSX.Element {
    return (
      <View style={this.styles.root}>
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
              <Text style={this.styles.customerNameText}>{this.props.customer && this.props.customer.fullName}</Text>
              {this.props.customer?.hasLoyaltyMemberships && this.props.displayLoyaltyIndicator &&
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
          <View style={this.styles.mainPanel}>
            {this.state.segmentedControlSelectedIndex === 0 && this.renderCustomerDetails(prefContact)}
            <View style={this.styles.btnArea}>
              <TouchableOpacity
                style={[this.styles.btnPrimary, this.styles.customerButton]}
                onPress={() => this.props.onAssignRemove()}
              >
                <Text style={this.styles.btnPrimaryText}>
                  {this.props.previewMode ? I18n.t("assignCustomer") : I18n.t("removeCustomer")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.customerButton, this.props.customer?.offline && this.styles.btnDisabled]}
                onPress={this.pushCustomerUpdate}
                disabled={this.props.customer?.offline}
              >
                <Text style={[this.styles.btnSecondayText, this.props.customer?.offline && this.styles.btnTextDisabled]}>{I18n.t("customerUpdate")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
        }
        {this.state.segmentedControlSelectedIndex === 1 &&
            this.renderTransactionHistory()
        }
      </View>
    );
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

  private handleTransactionSelectedSearch(item: IMerchandiseTransaction | TransactionWithAdditionalData | ITenderControlTransaction): void {
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

  private renderCustomerDetails(prefContact: string): JSX.Element {
    const language = this.props.customer.preferredLanguage && this.props.languages ?
        this.props.languages.find((lang) => lang.code === this.props.customer.preferredLanguage) : undefined;
    const preferredLanguage = language ? language.description : this.props.customer.preferredLanguage;
    const customerType = this.props.customer ? (this.props.customer.customerType || CustomerType.Personal) : undefined;

    let phoneNumber;
    if (this.props.customer.phoneNumber) {
      let phoneNumberValue: string | PhoneNumber = this.props.phoneFormat ? formatPhoneNumber(
        this.props.customer.phoneNumber, this.props.phoneFormat.callingCode, this.props.phoneFormat.format) : undefined;

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
        <Section styles={this.styles} titleKey="contactInformation" >
          <SectionRow styles={this.styles} icon="Location" isVisible={!!this.props.customer.address1} >
              <SectionLine styles={this.styles} >{this.props.customer.companyName}</SectionLine>
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
                onPress={() => this.props.navigation.push("loyaltyMembershipDetails", {
                    customer: this.props.customer,
                    loyaltyMemberships: this.props.customer.loyaltyMemberships,
                    loyaltyPlanKey: currentCustomerLoyaltyPlan.loyaltyPlanKey,
                    onLoyaltyEnrollment: this.props.onSubmitLoyaltyEnrollment,
                    customerEmailAddress: this.props.customer.emailAddress,
                    returnToCustomerScene: this.props.previewMode ? "customerPreviewDisplay" : "customerDisplay",
                    displayLoyaltyEnrollButton: this.props.displayLoyaltyEnrollButton
                })}
            >
              <View style={this.styles.loyMembershipViewBody}>
                <View>
                  <Text style={this.styles.loyMembershipViewTitle}>
                    {loyPlanLabel}
                  </Text>
                </View>
                <View>
                  <SectionRow styles={this.styles}>
                    <SectionSubHeader styles={this.styles}>{I18n.t("loyType")}</SectionSubHeader>
                    <View style={{flexDirection: "row"}}>
                      <SectionLine styles={this.styles}>
                        {_.get(currentCustomerLoyaltyPlan, "membershipType.description")}
                      </SectionLine>
                      <MembershipStatusIndicator
                          membershipStatusKey={(_.get(currentCustomerLoyaltyPlan, "membershipStatus.membershipStatusKey"))}
                          membershipDescription={_.get(currentCustomerLoyaltyPlan, "membershipStatus.description")} >
                      </MembershipStatusIndicator>
                    </View>
                  </SectionRow>
                  <SectionRow styles={this.styles}>
                    <SectionSubHeader styles={this.styles}>{I18n.t("loyAvailablePoints")}</SectionSubHeader>
                    <SectionLine styles={this.styles}>
                      {availPoints.toLocaleString()} {I18n.t("of")} {balancePoints.toLocaleString()}
                    </SectionLine>
                  </SectionRow>
                </View>
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
            <Text style={this.styles.noLoyaltyText}>{I18n.t("noLoyaltyMemberships")}</Text>
          </Section>
          }
          {this.props.displayLoyaltyEnrollButton &&
          <View style={this.styles.btnArea}>
            <TouchableOpacity
                style={[this.styles.btnSeconday]}
                onPress={this.pushLoyaltyEnrollment}
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

  private renderCustomerAddress = () => {
    const {
      address1, address2, address3, address4,
      city, district, state, postalCode, countryCode
    } = this.props.customer;
    const address: AddressFormat = {
      address1, address2, address3, address4, city, district, state, postalCode, countryCode
    };
    const formattedAddress = this.props.addressFormat ?
        formatAddress(this.props.addressFormat.formatLines, address) : undefined;

    return (
      formattedAddress && formattedAddress.length ?
        formattedAddress.map((line) => <SectionLine styles={this.styles} >{line}</SectionLine>)
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

  private displayCustomerAddress = (customer: Customer): JSX.Element => {
    const { address1, address2, address3, address4, city, district, state, postalCode, countryCode } = customer;
    const address: AddressFormat = {
      address1, address2, address3, address4, city, district, state, postalCode, countryCode
    };
    const formattedAddress = this.props.addressFormat ?
        formatAddress(this.props.addressFormat.formatLines, address) : undefined;

    return (
      (!!customer.address1) &&
      <View style={this.styles.detailsPiece}>
        <View style={this.styles.subtitleArea}>
          <Text style={this.styles.subtitleText}>{I18n.t("address")}</Text>
        </View>
        <Text style={this.styles.detailsText}>{customer.companyName ? customer.companyName : ""}</Text>
        {
          formattedAddress && formattedAddress.length ?
            formattedAddress.map((line) => <Text style={this.styles.detailsText}>
              {line}
            </Text>) :
            <React.Fragment>
              <Text style={this.styles.detailsText}>
                {customer.address1}, {customer.city ? `${customer.city}` : ""}
              </Text>
              <Text style={this.styles.detailsText}>
                {customer.state ? `${customer.state}-` : ""}{customer.postalCode}
              </Text>
            </React.Fragment>
        }
      </View>
    );
  }

  private pushCustomerUpdate = () => {
    this.props.navigation.push("customerUpdate", {
      onExit: this.props.onExit
    });
  }

  private pushCustomerPreviewDisplay = () => {
    this.props.navigation.push("customerPreviewDisplay", {
      previewMode: true,
      customer: this.props.customer,
      onExit: this.props.onExit
    });
  }

  private pushLoyaltyEnrollment = () => {
    this.props.navigation.push("loyaltyEnrollment", {
      customer: this.props.customer,
      onSave: this.props.onSubmitLoyaltyEnrollment,
      returnToCustomerScene: this.props.previewMode ? "customerPreviewDisplay" : "customerDisplay",
      emailAddress: this.props.customer.emailAddress
    });
  }
}
