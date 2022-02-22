import * as React from "react";
import { FlatList, ListRenderItemInfo, Text, TextInput, TouchableOpacity, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { PhoneCountryCode, PhoneFormatConfig } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import Header from "../common/Header";
import { getTestIdProperties } from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { PhoneCountryCodeScreenProps } from "./interfaces";
import { phoneCountryCodeStyle } from "./styles";
import VectorIcon from "../common/VectorIcon";

interface StateProps {
  settings: SettingsState;
}
interface Props extends PhoneCountryCodeScreenProps, StateProps, NavigationScreenProps<"phoneCountryCode"> {}
interface State {
  searchText: string;
  phoneCountryCodes: PhoneCountryCode[];
}

class PhoneCountryCodeScreen extends React.Component<Props, State> {
  private styles: any;
  private testID: string;

  constructor(props: Props) {
    super(props);

    this.testID = "PhoneCountryCodeScreen";
    this.styles = Theme.getStyles(phoneCountryCodeStyle());
    this.state = {
      searchText: undefined,
      phoneCountryCodes: undefined
    };
  }

  public componentDidMount(): void {
    this.getCountryCodes();
  }

  public render(): JSX.Element {
    const pageHeader = () =>
      <Header
        testID={this.testID}
        title={I18n.t("country")}
        backButton={{
          name: "Back",
          action: this.props.onCancel
        }}
        isVisibleTablet={true}
      />;

    return (
      <View style={this.styles.root}>
        {pageHeader()}
        <TextInput
          {...getTestIdProperties(this.testID, "search")}
          style={this.styles.inputField}
          autoCorrect={false}
          placeholder={I18n.t("search")}
          onChangeText={(searchText) => this.setState({ searchText }, () => this.getCountryCodes(searchText))}
        />
        <FlatList
          data={this.state.phoneCountryCodes}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.countryCode}
        />
      </View>
    );
  }

  private renderItem = ({ item }: ListRenderItemInfo<PhoneCountryCode>): JSX.Element => {
    const { countryName, callingCode, secondaryCountryCode } = item;
    return (
      <TouchableOpacity
        onPress={() => this.props.onSelection(item)}
      >
        <View style={this.styles.listView}>
          <View style={this.styles.textView}>
            <Text {...getTestIdProperties(this.testID, "countryName")}>{countryName}</Text>
            <Text {...getTestIdProperties(this.testID, "callingCode")}>{callingCode}</Text>
          </View>
          {(this.props.selectedValue &&
            secondaryCountryCode === this.props.selectedValue.secondaryCountryCode) &&
            <View style={this.styles.iconView}>
              <VectorIcon
                testId={`${this.testID}-selected`}
                name="Checkmark"
                fill={this.styles.icon.color}
                height={this.styles.icon.fontSize}
              />
            </View>
          }
        </View>
      </TouchableOpacity>
    );
  }

  private getCountryCodes = (searchText?: string): PhoneCountryCode[] => {
    const codes: PhoneCountryCode[] = [];
    const phoneCountryCodes =
        this.props.settings.configurationManager.getI18nPhoneFormats() as PhoneFormatConfig;

    for (const countryCode in phoneCountryCodes) {
      if (phoneCountryCodes.hasOwnProperty(countryCode)) {
        if (searchText &&
           !phoneCountryCodes[countryCode].countryName.toLowerCase().trim().includes(searchText.toLowerCase().trim())) {
          continue;
        }
        codes.push({
          ...phoneCountryCodes[countryCode],
          secondaryCountryCode: phoneCountryCodes[countryCode].countryCode,
          countryCode
        });
      }
    }
    this.setState({ phoneCountryCodes: codes });
    return codes;
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    settings: state.settings
  };
};

export default connect(mapStateToProps)
    (withMappedNavigationParams<typeof PhoneCountryCodeScreen>()(PhoneCountryCodeScreen));
