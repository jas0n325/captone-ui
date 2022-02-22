import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { ItemType } from "@aptos-scp/scp-component-store-items";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_EVENT,
  ItemLookupType,
  SSF_ITEM_API_ERROR_I18N_CODE,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, nonMerch, updateUiMode } from "../../actions";
import { AppState, ProductInquiryState } from "../../reducers";
import { UI_MODE_NON_MERCH } from "../../reducers/uiState";
import Theme from "../../styles";
import Header from "../common/Header";
import Input from "../common/Input";
import { popTo } from "../common/utilities/navigationUtils";
import { NonMerchProps } from "./interfaces";
import { nonMerchStyles } from "./styles";
import { NavigationProp } from "../StackNavigatorParams";
import FeedbackNote from "../common/FeedbackNote";
import { FeedbackNoteType } from "../../reducers/feedbackNote";

interface StateProps {
  productInquiryState: ProductInquiryState;
  deviceIdentity: DeviceIdentity;
}

interface DispatchProps {
  nonMerchItemRequest: ActionCreator;
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends NonMerchProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  filterValue: string;
}

class NonMerch extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(nonMerchStyles());

    this.state = {
      filterValue: ""
    };

    this.renderNonMerchItem = this.renderNonMerchItem.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_NON_MERCH);
    this.getNonMerchItems(0);
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): React.ReactNode {
    const { productInquiryState } = this.props;

    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("nonMerch")}
          backButton={{
            name: "Back",
            action: this.popToMain
          }}
        />
        <Input
          style={this.styles.inputPanel}
          inputStyle={this.styles.inputField}
          value={this.state.filterValue}
          onChangeText={this.onInputChange}
          showCamera={false}
          placeholder={I18n.t("filter")}
          placeholderSentenceCase={false}
          autoCapitalize={"none"}
          overrideOnSubmitEditing={() =>
            this.getNonMerchItems(0, this.state.filterValue)
          }
        />
        {
          productInquiryState &&
          !productInquiryState.items?.length &&
          productInquiryState.error?.localizableMessage?.i18nCode === SSF_ITEM_API_ERROR_I18N_CODE &&
          <View style={this.styles.errorWrapper}>
            <FeedbackNote message={I18n.t("timeoutApiError")} messageType={FeedbackNoteType.Error} />
          </View>
        }
        <View style={this.styles.listWrapper}>
          <FlatList
            data={productInquiryState.items}
            renderItem={this.renderNonMerchItem}
            keyExtractor={this.keyExtractor}
            ListFooterComponent={
              productInquiryState &&
              productInquiryState.items &&
              productInquiryState.paginationMetadata &&
              this.renderPagination
            }
          />
        </View>
        {
          Theme.isTablet && (
            <TouchableOpacity style={this.styles.cancelButton} onPress={() => this.props.onExit()}>
              <Text style={this.styles.paginationButtonTitle}>
                {I18n.t("cancel")}
              </Text>
            </TouchableOpacity>
          )
        }
      </View>
    );
  }

  public renderPagination: React.FunctionComponent = () => {
    const { paginationMetadata } = this.props.productInquiryState;

    const nextOffset: number =
      paginationMetadata.offset + paginationMetadata.limit;
    const previousOffset: number =
      paginationMetadata.offset - paginationMetadata.limit;

    return (
      <>
        <View style={this.styles.pagination}>
          <View style={this.styles.paginationButtonView}>
            {paginationMetadata.offset > 0 && (
              <TouchableOpacity
                style={this.styles.paginationButton}
                onPress={() =>
                  this.getNonMerchItems(previousOffset, this.state.filterValue)
                }
              >
                <Text style={this.styles.paginationButtonTitle}>
                  {I18n.t("previous")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={this.styles.paginationButtonView}>
            {nextOffset <= paginationMetadata.totalCount && (
              <TouchableOpacity
                style={this.styles.paginationButton}
                onPress={() =>
                  this.getNonMerchItems(nextOffset, this.state.filterValue)
                }
              >
                <Text style={this.styles.paginationButtonTitle}>
                  {I18n.t("next")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </>
    );
  };

  private getNonMerchItems(offset: number, filterValue?: string): void {
    const uiInputs: UiInput[] = [];

    if (filterValue) {
      uiInputs.push(new UiInput(UiInputKey.SEARCH_TERM, filterValue));
    }

    uiInputs.push(
      new UiInput(UiInputKey.STORE_ITEM_ORDER_BY, "shortDescription asc")
    );
    uiInputs.push(new UiInput(UiInputKey.STORE_ITEM_TYPES, ItemType.NonMerch));
    uiInputs.push(new UiInput(UiInputKey.API_LIMIT, "20"));
    uiInputs.push(new UiInput(UiInputKey.API_OFFSET, offset.toString()));

    this.props.nonMerchItemRequest(this.props.deviceIdentity, uiInputs);
  }

  private onInputChange(inputValue: string): void {
    this.setState({ filterValue: inputValue });
  }

  private renderNonMerchItem({ item }: { item: any }): JSX.Element {
    return (
      <TouchableOpacity
        style={this.styles.nonMerchButton}
        onPress={() => this.addNonMerchItemToBasket(item)}
      >
        <Text style={this.styles.nonMerchButtonText}>
          {item.shortDescription}
        </Text>
      </TouchableOpacity>
    );
  }

  private keyExtractor = (item: any, index: number): string => index.toString();

  private addNonMerchItemToBasket(item: any): void {
    const uiInputs: UiInput[] = [];

    uiInputs.push(new UiInput("itemKey", item.itemLookupKeys[0].value));
    uiInputs.push(new UiInput("itemKeyType", item.itemLookupKeys[0].type));
    uiInputs.push(
      new UiInput(UiInputKey.ITEM_LOOKUP_TYPE, ItemLookupType.ProductInquiry)
    );

    this.props.performBusinessOperation(
      this.props.deviceIdentity,
      APPLY_ITEM_EVENT,
      uiInputs
    );

    this.props.onExit();
  }

  private popToMain = () => {
    this.props.navigation.dispatch(popTo("main"));
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  productInquiryState: state.productInquiry,
  deviceIdentity: state.settings.deviceIdentity
});

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  nonMerchItemRequest: nonMerch.request,
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(NonMerch);
