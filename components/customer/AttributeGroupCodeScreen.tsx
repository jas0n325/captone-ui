import _ from "lodash";
import * as React from "react";
import { FlatList, ListRenderItemInfo, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IServiceCustomerAttribute } from "@aptos-scp/scp-component-store-selling-features";
import { AttributeGroupDefinition } from "@aptos-scp/scp-types-customer";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import Header from "../common/Header";
import VectorIcon from "../common/VectorIcon";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { attributeGroupCompare, loadAttributeDefinitions } from "./CustomerUtilities";
import { AttributeGroupCodeScreenProps } from "./interfaces";
import { AttributeGroupDefinitionCodeStyle } from "./styles";

interface DispatchProps {
  settings: SettingsState;
}
interface Props extends AttributeGroupCodeScreenProps, DispatchProps, NavigationScreenProps<"attributeDefList"> {}
interface State {
  searchText: string;
  filteredAttributeGroupDefs: AttributeGroupDefinition[];
  attributeGroupDefs: AttributeGroupDefinition[];
  customerAttributes: IServiceCustomerAttribute[];
}

class AttributeGroupCodeScreen extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(AttributeGroupDefinitionCodeStyle());
    this.state = {
      searchText: undefined,
      filteredAttributeGroupDefs: undefined,
      attributeGroupDefs: _.get(props, "attributeGroupDefs.data"),
      customerAttributes: props.customerAttributes
    };
  }

  public async componentDidMount(): Promise<void> {
    await this.getAttributeGroups();
  }

  public render(): JSX.Element {
    const pageHeader = () =>
      <Header
        title={I18n.t("attribute")}
        backButton={{
          name: "Back",
          action: this.props.onCancel
        }}
        isVisibleTablet={true}
      />;
    return (
      <View style={this.styles.fill}>
        {pageHeader()}
        <View style={this.styles.root}>
          {this.renderBody()}
        </View>
      </View>
    );
  }


  private renderBody(): JSX.Element {
    return (
      <KeyboardAwareScrollView keyboardShouldPersistTaps={"always"}>
        <View style={this.styles.searchContainer}>
          <TextInput
            style={this.styles.inputField}
            autoCorrect={false}
            placeholder={I18n.t("search")}
            onChangeText={(searchText) =>
                this.setState({ searchText }, async () => this.getAttributeGroups(searchText))}
            placeholderTextColor={this.styles.placeHolderText.color}
          />
          <VectorIcon
            name={"Search"}
            fill={this.styles.searchIcon.color}
            height={this.styles.searchIcon.size}
          />
        </View>
        <FlatList
          data={this.state.filteredAttributeGroupDefs}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.countryCode}
        />
      </KeyboardAwareScrollView>
    );
  }

  private renderItem = ({ item }: ListRenderItemInfo<AttributeGroupDefinition>): JSX.Element => {
    const attrGroupDesc = getAttributeGroupDescription(item, this.props.preferredLanguage);
    return (
      <TouchableOpacity
        onPress={() => this.props.onSelection(item)}
      >
        <View style={this.styles.listView}>
          <View style={this.styles.textView}>
            <Text>{attrGroupDesc}</Text>
          </View>
          {(this.props.selectedValue &&
            item.groupCode === this.props.selectedValue.groupCode) &&
            <View style={this.styles.iconView}>
              <VectorIcon
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

  private getAttributeGroups = async (searchText?: string): Promise<AttributeGroupDefinition[]> => {
    if (_.isEmpty(this.state.attributeGroupDefs)) {
      const attrGroupDefs = await loadAttributeDefinitions(this.props.settings.diContainer);
      this.setState({attributeGroupDefs: attrGroupDefs.data});
    }

    let filteredAttrGroupDefs = this.state.attributeGroupDefs;
    //only include attribute groups that are not readonly and not (unique and customer already has), then sort
    filteredAttrGroupDefs = filteredAttrGroupDefs.filter(
        (ag) => !ag.isReadOnly &&
        !(ag.isUnique && (this.state.customerAttributes.findIndex((ca) =>
        ca.groupCode === ag.groupCode) > -1))).sort(attributeGroupCompare);
    if (searchText) {
      filteredAttrGroupDefs = this.state.attributeGroupDefs.filter((ad) =>
        getAttributeGroupDescription(ad, this.props.preferredLanguage).toString()
            .toUpperCase().startsWith(searchText.toUpperCase()));
    }

    this.setState({ filteredAttributeGroupDefs: filteredAttrGroupDefs });

    return filteredAttrGroupDefs;
  }
}

const getAttributeGroupDescription = (attrGroup: AttributeGroupDefinition, primaryLang: string) => {
  return attrGroup && (primaryLang && attrGroup.translations && attrGroup.translations[primaryLang] ?
      attrGroup.translations[primaryLang].description : attrGroup.description);
};

const mapStateToProps = (state: AppState) => {
  return {
    settings: state.settings
  };
};

export default connect(mapStateToProps)
    (withMappedNavigationParams<typeof AttributeGroupCodeScreen>()(AttributeGroupCodeScreen));
