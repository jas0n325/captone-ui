import * as React from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import I18n from "../../../config/I18n";
import { ActionCreator, loadSearchAddressAction } from "../../actions";
import { AppState, UiState } from "../../reducers";
import { ISearchAddressState } from "../../reducers/addressVerification";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { warnBeforeLosingChanges } from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { AddressSearchScreenProps } from "./interfaces";
import { addressSearch } from "./styles";

interface StateProps {
  uiState: UiState;
  sceneTitles: Map<string, string>;
  searchAddressState: ISearchAddressState;
}

interface DispatchProps {
  loadSearchAddress: ActionCreator;
}

interface Props extends AddressSearchScreenProps, StateProps, DispatchProps, NavigationScreenProps<"addressSearch"> {}

export interface State {
  showDropDown: boolean;
  Address1: string;
  isSearchText: boolean;
}

class AddressSearchScreen extends React.Component<Props, State> {
  private styles: any;
  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(addressSearch());
    this.state = {
      showDropDown: false,
      Address1: undefined,
      isSearchText: false
    };
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          title={this.props.sceneTitles.has("addressSearch") ? I18n.t(this.props.sceneTitles.get("addressSearch")) :
              I18n.t("addressSearch")}
          backButton={{
            name: "Back",
            title: this.getBackButtonTitle(),
            action: () => {
              if (this.state.isSearchText) {
                warnBeforeLosingChanges(this.state.showDropDown, () => this.onDoneHandler(false));
              } else {
                this.onDoneHandler(false);
              }
            }
          }}
          rightButton={{
            title: I18n.t("done"),
            action: () => {
              this.onDoneHandler(this.state.showDropDown);
            }
          }}
          isVisibleTablet={true}
        />
        <View style={this.styles.root}>
          <TextInput
            style={this.styles.inputField}
            placeholder={this.props.placeholder}
            onChangeText={(e) => this.onAddressChange(e)}
            autoCorrect={false}
            autoFocus={true}
          />
          {this.state.showDropDown && this.props.country && this.props.searchAddressState.count ?
            <View>
              <View style={this.props.subtitleArea}>
                <Text style={this.props.subtitleText}>{("Address Suggestion").toUpperCase()}</Text>
              </View>
              <FlatList
                keyboardShouldPersistTaps={"always"}
                data={this.props.searchAddressState.results}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => {
                      this.props.onSelectAddressDropdown(item.format);
                      this.props.navigation.pop();
                    }}
                  >
                    <Animatable.Text
                      animation="fadeIn"
                      duration={600}
                      easing={"ease-in-out"}
                      direction={"alternate"}
                      style={this.styles.addressSuggestionText}
                      useNativeDriver
                    >
                      {item.suggestion}
                    </Animatable.Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View> : undefined
          }
        </View>
      </BaseView>
    );
  }

  public onAddressChange(searchText: string): void {
    const apiCall = this.props.debounce( (text: string) => this.getAddressSuggestion(text), 500);
    apiCall(searchText);
  }

  private getBackButtonTitle(): string {
    const {isTaxInfo, isUpdate } = this.props;
    if (Theme.isTablet) {
      if (isTaxInfo) {
        return I18n.t("confirmDetails");
      } else if (isUpdate) {
        return I18n.t("customerUpdate");
      } else {
        return I18n.t("customerCreate");
      }
    }
    return "";

  }

  private getAddressSuggestion(searchText: string): void {
    this.setState({ Address1: searchText });
    if (this.props.country && searchText !== "") {
      const searchAddressResult = this.props.loadSearchAddress(searchText, this.props.country.code);
      if (searchAddressResult) {
        this.setState({showDropDown: true, isSearchText: true});
      }
    } else {
      this.setState({showDropDown: false});
    }
  }

  private onDoneHandler(preventAddressPage: boolean): void {
    this.props.preventAddressPage(preventAddressPage);
    if (preventAddressPage) {
      this.props.address1Change("address1", this.state.Address1);
    }
    this.props.navigation.pop();
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    sceneTitles: state.sceneTitlesState.sceneTitles,
    uiState: state.uiState,
    searchAddressState: state.searchAddress
  };
};

export default connect(mapStateToProps, {
  loadSearchAddress: loadSearchAddressAction.request
})(withMappedNavigationParams<typeof AddressSearchScreen>()(AddressSearchScreen));
