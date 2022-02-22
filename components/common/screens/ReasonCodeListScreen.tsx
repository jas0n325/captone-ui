import * as React from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import I18n from "../../../../config/I18n";
import { ActionCreator, sceneTitle, updateUiMode } from "../../../actions";
import { AppState, BusinessState, UiState, UI_MODE_ITEM_NOT_FOUND, UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY, UI_MODE_REASON_CODE } from "../../../reducers";
import Theme from "../../../styles";
import { NavigationScreenProps } from "../../StackNavigatorParams";
import BaseView from "../BaseView";
import { RenderSelectOptions } from "../FieldValidation";
import Header from "../Header";
import { optionListStyle } from "../styles";
import { getTestIdProperties } from "../utilities/utils";
import { ReasonCodeListScreenProps } from "./interfaces";
import VectorIcon from "../VectorIcon";

//Constant to ensure there should be a search option if the language list crosses 10 languages
const countOfLanguage: number = 10;

interface StateProps {
  uiState: UiState;
  businessState: BusinessState;
  sceneTitles: Map<string, string>;
}

interface DispatchProps {
  updateUiMode: ActionCreator;
  sceneTitle: ActionCreator;
}

interface Props extends ReasonCodeListScreenProps, StateProps, DispatchProps, NavigationScreenProps<"reasonCodeList"> {}

interface State {
  dataSource: RenderSelectOptions[];
  preferredLanguages: RenderSelectOptions[];
  shouldShowSearch: boolean;
  currentSelectedOption: RenderSelectOptions | RenderSelectOptions[];
}

class ReasonCodeListScreen extends React.Component<Props, State> {
  private reasonCodeChosen: boolean;
  private styles: any;
  private testID: string;

  public constructor(props: Props, state: State) {
    super(props);

    this.checkCurrentSelectedOption = this.checkCurrentSelectedOption.bind(this);
    this.renderSearchBar = this.renderSearchBar.bind(this);
    this.renderHeader = this.renderHeader.bind(this);

    this.styles = Theme.getStyles(optionListStyle());

    if (this.props.resetTitle) {
      this.props.sceneTitle("reasonCodeList", "reasonCode");
    }

    this.testID = "ReasonCodeListScreen";

    this.state = {
      dataSource: this.props.options,
      preferredLanguages: this.props.options,
      shouldShowSearch: false,
      currentSelectedOption: this.props.currentSelectedOption
    };
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode === UI_MODE_REASON_CODE) {
      this.props.updateUiMode(undefined);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.options !== prevProps.options) {
      this.setState({preferredLanguages: this.props.options, dataSource: this.props.options});
    }
  }

  public componentDidMount(): void {
    this.reasonCodeChosen = false;

    if (this.state.preferredLanguages && this.state.preferredLanguages.length > countOfLanguage &&
        this.props.options.length > 0 && this.props.options[0].localiseDesc) {
      this.setState({
        shouldShowSearch: true
      });
    }
  }


  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.base}>
        <Header
          title={
            (Theme.isTablet && this.props.uiState.mode === UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY) || this.props.uiState.mode === UI_MODE_ITEM_NOT_FOUND
            ? I18n.t("departments")
            : this.props.sceneTitles.has("reasonCodeList")
                ? I18n.t(this.props.sceneTitles.get("reasonCodeList"))
                : I18n.t("reasonCode")
          }
          backButton={{name: "Back", action: this.exitScreen.bind(this)}}
          isVisibleTablet={Theme.isTablet}
        />
        <View style={this.styles.root}>
          { this.state.shouldShowSearch && this.renderSearchBar() }
          <FlatList
            data={this.state.preferredLanguages}
            extraData={this.state.currentSelectedOption}
            ListHeaderComponent={this.state.shouldShowSearch && this.renderHeader}
            renderItem={({item}) => {
              return (
                <TouchableOpacity
                  {...getTestIdProperties(this.testID, "reasonCode-select")}
                  style={[this.styles.optionButton, item.disabled && this.styles.disabledOption]}
                  onPress={() => {
                    if (!this.reasonCodeChosen && !this.props.multiSelect) {
                      this.reasonCodeChosen = true;
                      if (this.props.onExitNavigation) {
                        this.props.onExitNavigation();
                      } else {
                        this.props.navigation.pop();
                      }
                    }

                    this.props.onOptionChosen(item);

                    if (this.props.multiSelect) {
                      this.handleMultiSelect(item);
                    }
                  }}
                  disabled={item.disabled}
                >
                  <View style={this.styles.languageView}>
                    <Text style={[
                        this.styles.optionText,
                        item.disabled && this.styles.disabledText
                    ]}>
                      {item.localiseDesc}
                    </Text>
                    {
                      item.description &&
                      <Text style={[
                        item.localiseDesc && this.styles.optionDescriptionSubText || this.styles.optionDescriptionText,
                        item.disabled && this.styles.disabledText
                      ]}>
                        {item.description}
                      </Text>
                    }
                  </View>
                  {
                    this.checkCurrentSelectedOption(item) &&
                    <VectorIcon
                      name="Checkmark"
                      fill={this.styles.checkIcon.color}
                      height={this.styles.checkIcon.fontSize}
                    />
                  }
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </BaseView>
    );
  }

  private exitScreen(): void {
    if (this.props.onClose) {
      this.props.onClose();
    }
    this.props.navigation.pop();
  }

  private checkCurrentSelectedOption(item: RenderSelectOptions): boolean {
    const selectedLanguage = this.props.businessState.stateValues.get("UserSession.user.preferredLanguage");
    let currentSelectedOption = false;
    if (this.state.currentSelectedOption) {
      if (this.props.multiSelect && Array.isArray(this.state.currentSelectedOption)) {
        currentSelectedOption =
            this.state.currentSelectedOption.findIndex((option) => option.code === item.code) > -1;
      } else {
        const singleOption: RenderSelectOptions = Array.isArray(this.state.currentSelectedOption) &&
            this.state.currentSelectedOption.length > 0 ? this.state.currentSelectedOption[0] :
            this.state.currentSelectedOption as RenderSelectOptions;
        if (singleOption.code === item.code ||
            (selectedLanguage === item.code && !this.state.currentSelectedOption)) {
          currentSelectedOption = true;
        }
      }
    }
    return currentSelectedOption;
  }

  private handleMultiSelect(item: RenderSelectOptions): void {
    const selectedOptions: RenderSelectOptions[] = this.state.currentSelectedOption as RenderSelectOptions[];
    const newSelection: boolean =
        selectedOptions.findIndex((selectedOption) =>
        selectedOption.code === item.code) === -1;
    this.setState({
      currentSelectedOption: newSelection ? [...selectedOptions, item] :
          selectedOptions.filter((selectedOption) => selectedOption.code !== item.code)
    });
  }

  private renderSearchBar(): JSX.Element {
    return (
      <TextInput
        autoCapitalize={"none"}
        keyboardType={"default"}
        placeholder={I18n.t("search")}
        style={this.styles.textInput}
        onChangeText={(e) => this.searchDataChange(e)}
      />
    );
  }

  private renderHeader(): JSX.Element {
    return (
      <View style={this.styles.header_footer_style}>
        <Text style = {this.styles.headerTextStyle}>
          {I18n.t("availableLanguage")}
        </Text>
      </View>
    );
  }

  private searchDataChange(searchText: string): void {
    const newData = this.state.dataSource.filter((item) => {
      const itemData = item.description ? item.description.toUpperCase() : "";
      const textData = searchText.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      preferredLanguages: newData
    });
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    sceneTitles: state.sceneTitlesState.sceneTitles,
    uiState: state.uiState,
    businessState: state.businessState
  };
};

const mapDispatchToProps = {
  updateUiMode: updateUiMode.request,
  sceneTitle: sceneTitle.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof ReasonCodeListScreen>()(ReasonCodeListScreen));
