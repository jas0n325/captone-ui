import { CountryCode, parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import * as React from "react";
import { Text, TouchableOpacity } from "react-native";
import { View } from "react-native-animatable";
import * as RNLocalize from "react-native-localize";
import { connect } from "react-redux";

import {
  AddressFormat,
  formatAddress,
  formatPhoneNumber
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator } from "../../actions/actions";
import { getHoursOfOperationAction } from "../../actions/hoursOfOperation";
import { AppState } from "../../reducers";
import { HoursOfOperationState } from "../../reducers/hoursOfOperation";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { Section } from "../common/Section";
import SectionLine from "../common/SectionLine";
import { SectionRow } from "../common/SectionRow";
import { customerDisplayStyle } from "../customer/phone/styles";
import { NavigationProp } from "../StackNavigatorParams";
import { StoreOperationDetailsScreenProps } from "./interfaces";
import { getTestIdProperties } from "../common/utilities";
import VectorIcon from '../common/VectorIcon';

interface Props extends StoreOperationDetailsScreenProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface StateProps {
  hoursOfOperation: HoursOfOperationState;
}

interface DispatchProps {
  getHoursOfOperationAction: ActionCreator;
}

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const selectedHours = "SelectedHours";

class StoreOperationDetails extends React.Component<Props>{
  private styles: any;
  private testID: string;
  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(customerDisplayStyle());
    this.props.hoursOfOperation.hoursOfOperation = undefined;
    this.props.getHoursOfOperationAction(this.props.hoursOfOperationKey);
    this.testID = "StoreOperationDetailsScreen";
  }

  public componentDidUpdate(prevProps: any): void {
    if (prevProps.hoursOfOperationKey !== this.props.hoursOfOperationKey) {
      this.props.hoursOfOperation.hoursOfOperation = undefined;
      this.props.getHoursOfOperationAction(this.props.hoursOfOperationKey);
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <Header
          testID={this.testID}
          isVisibleTablet={false}
          title={I18n.t("findNearby")}
          backButton={{ name: "Back", action: this.pop }}
        />
        <Section styles={this.styles}>
          <View style={this.styles.sectionHeader} useNativeDriver>
            <Text
              {...getTestIdProperties(this.testID,"store")}
              style={this.styles.titleText}>
                {this.props.name}
            </Text>
          </View>
          <SectionRow
            testID={`${this.testID}-location`}
            styles={this.styles}
            icon="Location"
            isVisible={!!this.props.retailLocationAddress?.addressLine1}
          >
            {this.renderStoreAddress()}
          </SectionRow>
          <View>
            <SectionRow testID={`${this.testID}-phone`} styles={this.styles} icon="Phone" isVisible={!!this.props.phoneNumbers}>
              {this.renderPhoneNumber()}
            </SectionRow>
            {
              Theme.isTablet &&
              this.props.isVisiblePickup &&
              <View style={this.styles.buttonContainerRowTab}>
                <TouchableOpacity {...getTestIdProperties(this.testID, "selectStore-tablet-button")}
                  style={[
                    this.styles.buttonTab,
                    this.isDisabledButton && this.styles.disabledButton
                  ]}
                  onPress={() => this.onSelectStore()}
                  disabled={this.isDisabledButton}
                >
                  <View style={this.styles.buttonInner}>
                    <View style={[
                      this.styles.buttonIconContainerTab,
                      this.isDisabledButton && this.styles.disabledButtonIconContainer
                    ]}>
                      <VectorIcon name="Store" height={this.styles.iconHeight.height}
                        fill={this.isDisabledButton ? this.styles.disabledButtonIconContainer.color : this.styles.iconColor.color} />
                    </View>
                    <View style={this.styles.buttonTextTab}>
                      <Text style={[
                        this.styles.addButtonTextTab,
                        this.isDisabledButton && this.styles.disabledButtonText]}>
                        {I18n.t("selectPickupStore")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            }
            {
              !Theme.isTablet &&
              this.props.isVisiblePickup &&
              <View style={this.styles.buttonContainer}>
                <TouchableOpacity {...getTestIdProperties(this.testID, "selectStore-phone-button")}
                  style={[
                    this.styles.addButton,
                    this.isDisabledButton && this.styles.disabledButton
                  ]}
                  onPress={() => this.onSelectStore()}
                  disabled={this.isDisabledButton}
                  >
                  <View style={this.styles.buttonInner}>
                    <View style={[
                      this.styles.buttonIconContainer,
                      this.isDisabledButton && this.styles.disabledButtonIconContainer
                      ]}>
                      <VectorIcon name="Store" height={this.styles.iconHeight.height}
                        fill={this.isDisabledButton ? this.styles.disabledButtonIconContainer.color : this.styles.iconColor.color} />
                    </View>
                    <View style={this.styles.buttonText}>
                      <Text style={[
                        this.styles.addButtonText,
                        this.isDisabledButton && this.styles.disabledButtonText
                        ]}>
                        {I18n.t("selectPickupStore")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            }
          </View>
        </Section>
        {
          this.props.hoursOfOperation.hoursOfOperation &&
          <Section styles={this.styles} titleKey="details">
            <View style={this.styles.hoursOfOperationHeader} useNativeDriver ><Text style={this.styles.titleText}>{I18n.t("storeHours")}</Text></View>
            <SectionRow testID={`${this.testID}-details`} styles={this.styles} isVisible={!!this.props.hoursOfOperation.hoursOfOperation} >
              {this.renderHoursOfOperation()}
            </SectionRow>
          </Section>
        }
      </BaseView>
    );
  }

  private onSelectStore(): void {
    this.props.navigation.navigate("productInquiryDetail",
      {
        item: this.props.item,
        selectedRetailLocationId: this.props.selectedRetailLocationId,
        selectedInventory: this.props.selectedInventory
      });
  }

  private renderPhoneNumber(): string {
    let phoneNumber;
    if (this.props.phoneNumbers) {
      const phone: string = this.props.phoneNumbers[0].phoneNumber.replace(/-/g, '');
      let phoneNumberValue: string | PhoneNumber = this.props.phoneFormat
        ? formatPhoneNumber(phone, this.props.phoneFormat.callingCode, this.props.phoneFormat.format)
        : undefined;
      if (!phoneNumberValue) {
        phoneNumberValue = parsePhoneNumberFromString(this.props.phoneNumbers[0].phoneNumber,
          RNLocalize.getCountry() as CountryCode);
        if (phoneNumberValue && phoneNumberValue.isValid()) {
          phoneNumber = phoneNumberValue.formatNational();
        }
      } else {
        phoneNumber = phoneNumberValue;
      }
    }
    return phoneNumber;
  }

  private renderStoreAddress = (): JSX.Element[] | JSX.Element => {
    const {
      addressLine1, addressLine2, addressLine3, addressLine4,
      city, postalCode, stateOrProvince, countryCode, firstAdminDivision
    } = this.props.retailLocationAddress;
    const address: AddressFormat = {
      address1: addressLine1, address2: addressLine2, address3: addressLine3, address4: addressLine4,
      city, postalCode, state: stateOrProvince, countryCode, district: firstAdminDivision
    };
    const formattedAddress = this.props.addressFormat ?
      formatAddress(this.props.addressFormat.formatLines, address) : undefined;

    return (
      formattedAddress && formattedAddress.length > 0 &&
      formattedAddress.map((line) => <SectionLine
        styles={this.styles}
        testID={`${this.testID}-location`}
      >{line}</SectionLine>)
    );
  }

  private renderHoursOfOperation = (): JSX.Element => {
    const dateObj = new Date();
    const today = new Date();
    const weeks: string[] = [];
    const todayWeekNumber = dateObj.getDay();
    const todayWeekName = days[todayWeekNumber];
    days.forEach((day: string, index: number) => {
      dateObj.setDate(today.getDate() + index)
      const weekdayNumber = dateObj.getDay();
      const weekdayName = days[weekdayNumber];
      weeks.push(weekdayName);
    })
    return (
      <>
        {
          this.props.hoursOfOperation.hoursOfOperation &&
          weeks.map((day) =>
            <View style={this.styles.hoursOfOperationContainer} useNativeDriver>
              <View style={todayWeekName === day ? this.styles.hoursOfOperationTextColor : this.styles.hoursOfOperationTextStyle} useNativeDriver>
                <Text
                  style={this.styles.hoursOfOperationFontStyle}
                  {...getTestIdProperties(this.testID,"details-day")}>
                    {I18n.t(day)}
                </Text>
                <Text
                  style={this.styles.hoursOfOperationstyle}
                  {...getTestIdProperties(this.testID,"details-hours")}>
                    {this.renderHoursOfOperation24Hours(day)}
                </Text>
              </View>
            </View>
          )
        }
      </>
    );
  }

  private renderHoursOfOperation24Hours(dayName: string): string {
    let result: string = I18n.t("closed");
    this.props.hoursOfOperation.hoursOfOperation.dailyPeriods.forEach((day) => {
      if (day.scheduleType === selectedHours) {
        const weekNames = day.daysOfWeek.filter(x => x === I18n.t(dayName));
        weekNames.forEach((weekname) => {
          if (weekname === I18n.t(dayName)) {
            result = this.formatAMPM(day.times[0]?.openingTime ? day.times[0]?.openingTime : "00:00") + " - " +
              this.formatAMPM(day.times[0]?.closingTime ? day.times[0]?.closingTime : "23:59");
            return result;
          }
        })
      } else {
        day.daysOfWeek.forEach((weekname) => {
          if (weekname === I18n.t(dayName)) {
            result = "12:00" + I18n.t("am") + " - " + "11:59" + I18n.t("pm");
            return result;
          }
        })
      }
    })
    return result;
  }

  private formatAMPM(time: string): string {
    const times = time.split(/[ :]+/);
    let hours = parseInt(times[0], 10);
    let minutes = times[1];
    const newformat = hours >= 12 ? I18n.t("pm") : I18n.t("am");
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = parseInt(minutes, 10) < 10 ? minutes : minutes;
    const newhours = hours < 10 ? '0' + hours : hours;
    return newhours + ':' + minutes + newformat;
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private get isDisabledButton(): boolean {
    return ((this.props.selectedRetailLocationId && this.props.currentRetailLocationId &&
      (this.props.selectedRetailLocationId !== this.props.currentRetailLocationId)) || this.props.selectedInventory <= 0)
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    hoursOfOperation: state.hoursOfOperation
  };
}

export default connect(mapStateToProps, {
  getHoursOfOperationAction: getHoursOfOperationAction.request
})(StoreOperationDetails);
