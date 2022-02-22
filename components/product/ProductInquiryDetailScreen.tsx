import { last } from "lodash";
import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IConfigurationValues, UiInput, UIINPUT_SOURCE_KEYBOARD } from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_EVENT,
  APPLY_ITEM_EXTENSIBILITY_FORM_DATA_EVENT,
  APTOS_ITEM_COMMENTS_FORM,
  APTOS_STORE_SELLING_NAMESPACE,
  getMixedBasketState,
  IItemDisplayLine,
  ItemLookupKey,
  ItemLookupType,
  Order,
  PriceInquiry,
  StoreItem,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { FulfillmentType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  productInquiry,
  productInquiryVariants,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  ProductInquiryState,
  SettingsState,
  UiState,
  UI_MODE_PRODUCT_DETAIL,
  UI_MODE_PRODUCT_INQUIRY
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import ToastPopUp from "../common/ToastPopUp";
import { getCurrentValueOfField, getStyleCode, itemDisplayLineHasValidExtensibilityForms } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ProductInquiryDetailScreenProps } from "./interfaces";
import ProductInquiryDetail from "./ProductInquiryDetail";
import { commentsScreen, productInquiryDetailScreenStyle } from "./styles";

interface StateProps {
  businessState: BusinessState;
  productInquiryState: ProductInquiryState;
  settings: SettingsState;
  uiState: UiState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  productInquiryRequest: ActionCreator;
  productInquiryVariantsRequest: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends ProductInquiryDetailScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"productInquiryDetail"> {}

interface State {
  error: string;
  displayItem: PriceInquiry;
  showToast: boolean;
  showToastVoid: boolean;
}

class ProductInquiryDetailScreen extends React.Component<Props, State> {
  private itemIsBeingAdded: boolean;
  private styles: any;
  private readonly showFinalPrice: boolean;
  private readonly itemAttributesDisplayOrder?: Set<string>;
  private shouldResetUiMode: boolean;
  private allowMixedSalesAndReturns: boolean;

  public constructor(props: Props) {
    super(props);

    const functionalBehaviorValues: IConfigurationValues =
        this.props.settings.configurationManager.getFunctionalBehaviorValues();
    const displayBehaviorsConfig: IConfigurationValues =
        functionalBehaviorValues.productDetailDisplayBehaviors;
    this.showFinalPrice = displayBehaviorsConfig && displayBehaviorsConfig.showFinalPrice;
    const displayItemAttributes = (displayBehaviorsConfig && displayBehaviorsConfig.itemAttributes)
        ? displayBehaviorsConfig.itemAttributes : undefined;
    const defaultDisplayOrder = ["Color", "Size", "Season"];

    this.itemAttributesDisplayOrder = displayItemAttributes && displayItemAttributes.displayOrder &&
        displayItemAttributes.displayOrder.length > 0
        ? new Set([...displayItemAttributes.displayOrder, ...defaultDisplayOrder])
        : new Set(defaultDisplayOrder);
    this.shouldResetUiMode = true;

    this.allowMixedSalesAndReturns = functionalBehaviorValues.returnsBehaviors &&
        functionalBehaviorValues.returnsBehaviors.mixedBasketAllowed;

    this.styles = Theme.getStyles(productInquiryDetailScreenStyle());

    this.state = {
      error: undefined,
      displayItem: undefined,
      showToast: false,
      showToastVoid: this.props.unavailableItem
    };

    if (this.props.unavailableItem){
      this.handleExitFromPage = this.handleExitFromPage.bind(this);
    } else {
      this.backButtonAction = this.backButtonAction.bind(this);
    }
  }

  public componentDidMount(): void {
    if (this.props.uiState.mode === UI_MODE_PRODUCT_INQUIRY) {
      this.fetchVariants(this.props.item);
    } else if (this.props.uiState.mode === UI_MODE_PRODUCT_DETAIL) {
      const productInquiryInputs: UiInput[] = [];
      const inputInformation = this.getInputDetails();
      productInquiryInputs.push(new UiInput("itemKey", this.props.line.itemIdKey,
          inputInformation.inputType, inputInformation.inputSource));
      productInquiryInputs.push(new UiInput("itemKeyType", this.props.line.itemIdKeyType,
          inputInformation.inputType, inputInformation.inputSource));
      productInquiryInputs.push(new UiInput(UiInputKey.LINE_NUMBER, this.props.line.lineNumber));
      productInquiryInputs.push(new UiInput(UiInputKey.ITEM_LOOKUP_TYPE, ItemLookupType.ProductInquiryDetail));
      this.props.productInquiryRequest(this.props.settings.deviceIdentity, productInquiryInputs);
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (this.isModeProductDetail() && prevProps.productInquiryState.inProgress &&
        !this.props.productInquiryState.inProgress) {
      // Check if this call is for itemDescription
      if (!prevProps.productInquiryState.items) {
        let error: string = undefined;
        if (this.props.productInquiryState.error) {
          error = I18n.t(this.props.productInquiryState.error.localizableMessage.i18nCode);
        } else {
          if (this.props.productInquiryState.items && this.props.productInquiryState.items.length >= 1) {
            this.setState({ displayItem: this.props.productInquiryState.items[0]});
          } else {
            error = I18n.t("itemNotOnFileTitle");
          }
        }
        this.setState({
          error
        });
      }
    }

    const pastItemDisplayLines: IItemDisplayLine[] = (
          prevProps.businessState &&
          prevProps.businessState.displayInfo &&
          prevProps.businessState.displayInfo.itemDisplayLines
        )
        ? prevProps.businessState.displayInfo.itemDisplayLines
        : [];

    const currentItemDisplayLines: IItemDisplayLine[] = (
          this.props.businessState &&
          this.props.businessState.displayInfo &&
          this.props.businessState.displayInfo.itemDisplayLines
        )
        ? this.props.businessState.displayInfo.itemDisplayLines
        : [];

    if (this.itemIsBeingAdded && currentItemDisplayLines.length > pastItemDisplayLines.length) {
      this.itemIsBeingAdded = false;
      this.setState({showToast: true});
      if (this.props.unavailableItem) {
        this.handleExitFromPage();
      } else {
        this.handleExtensibilityForms();
      }
    }
  }

  public componentWillUnmount(): void {
    // Will undefined the UIMode if it is for product detail not product inquiry
    if (this.isModeProductDetail() && this.shouldResetUiMode) {
      this.props.updateUiMode(undefined);
    }
  }

  public fetchVariants(item: StoreItem): void {
    this.setState({ displayItem: item }, () => {
      const uiInputs: UiInput[] = [];
      const inputInformation = this.getInputDetails();
      const styleCode = getStyleCode(item);
      if (styleCode) {
        uiInputs.push(new UiInput(UiInputKey.STORE_ITEM_PRODUCT_ATTRIBUTES, [
              {"attributeType": "style", "code": styleCode}],
            inputInformation.inputType, inputInformation.inputSource));
      }
      uiInputs.push(new UiInput(UiInputKey.STORE_ITEM, item,
          inputInformation.inputType, inputInformation.inputSource));
      this.props.productInquiryVariantsRequest(this.props.settings.deviceIdentity, item, uiInputs);
    });
  }

  public isModeProductDetail(): boolean {
    return this.props.uiState.mode === UI_MODE_PRODUCT_DETAIL;
  }

  public backButtonAction(): void {
    this.shouldResetUiMode = false;
    this.props.updateUiMode(UI_MODE_PRODUCT_INQUIRY);
    this.props.navigation.dispatch(popTo("productInquiry"));
  }

  public handleExitFromPage(): void {
    this.props.updateUiMode(undefined);
    if (this.props.unavailableItemCount > 1) {
      this.props.navigation.push("unavailableQuantities", {
        displayInfo: this.props.businessState.displayInfo,
        onAccepted: () => this.props.navigation.dispatch(popTo("main"))
      });
    } else {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  public render(): JSX.Element {
    const { displayItem, error } = this.state;
    const isReadOnly = this.isModeProductDetail();

    let toastMessage = I18n.t("addedToBasket");
    if (this.state.showToastVoid){
      toastMessage = I18n.t("itemVoided");
    }

    return (
      <BaseView style={this.styles.root}>
        {
          (displayItem || error) &&
          <ProductInquiryDetail
            selectedRetailLocationId={this.props.selectedRetailLocationId}
            selectedInventory= {this.props.selectedInventory}
            addItemToBasket={this.addItemToBasket.bind(this)}
            error={this.state.error}
            isReadOnly={isReadOnly}
            showFinalPrice={this.showFinalPrice}
            item= {this.props.productInquiryState.itemFromPricing ?
                this.props.productInquiryState.itemFromPricing : displayItem}
            itemSearchCriteria = {this.props.productInquiryState.itemSearchCriteria}
            settings={this.props.settings}
            variants={this.props.productInquiryState.variants}
            itemAttributesDisplayOrder = {this.itemAttributesDisplayOrder}
            backButtonAction={this.props.unavailableItem ? this.handleExitFromPage : this.backButtonAction}
            mixedBasketState={getMixedBasketState(this.allowMixedSalesAndReturns,
                                                this.currentTransactionOrder(),
                                                this.props.businessState.displayInfo,
                                                this.props.settings.configurationManager)}
            unavailableItem={this.props.unavailableItem}
            backButtonTitle={this.getBackButtonTitle()}
            navigation={this.props.navigation}
          />
        }
        {
          this.showToast(toastMessage)
        }
      </BaseView>
    );
  }

  private showToast(toastMessage: string): JSX.Element {
    if (this.state.showToast) {
      return (
          <ToastPopUp
              textToDisplay={toastMessage}
              hidePopUp={() => this.setState({showToast: false})} />
      );
    } else if (this.state.showToastVoid) {
      return (
          <ToastPopUp textToDisplay={toastMessage}
                   hidePopUp={() => this.setState({ showToastVoid: false })} />
      );
    }
  }

  private currentTransactionOrder(): Order {
    return this.props.businessState.stateValues.get("transaction.order");
  }

  private addItemToBasket(itemLookupKey: ItemLookupKey, quantity: string, fulfillmentType?: FulfillmentType): void {
    this.itemIsBeingAdded = true;
    const uiInputs: UiInput[] = [];
    const inputInformation = this.getInputDetails();
    uiInputs.push(new UiInput("itemKey", itemLookupKey.value,
      inputInformation.inputType, inputInformation.inputSource));
    uiInputs.push(new UiInput("itemKeyType", itemLookupKey.type,
      inputInformation.inputType, inputInformation.inputSource));
    uiInputs.push(new UiInput("itemLookUpType", "ProductInquiry"));
    uiInputs.push(new UiInput(UiInputKey.QUANTITY, quantity));

    this.props.productInquiryState.itemSearchCriteria.keyValue = itemLookupKey.value
    const { itemSearchCriteria } = this.props.productInquiryState;

    const searchedItemLookupKey = new ItemLookupKey(itemLookupKey.type, itemLookupKey.value);

    if (itemSearchCriteria && itemSearchCriteria.keyType && itemSearchCriteria.keyValue) {
      searchedItemLookupKey.type = itemSearchCriteria.keyType;
      searchedItemLookupKey.value = itemSearchCriteria.keyValue;
    }

    if (this.props.selectedRetailLocationId) {
      uiInputs.push(new UiInput(UiInputKey.PICKUP_AT_ANOTHER_LOCATION_ID, this.props.selectedRetailLocationId));
    }

    uiInputs.push(new UiInput(UiInputKey.SEARCHED_ITEM_LOOKUP_KEY, searchedItemLookupKey));

    if (fulfillmentType) {
      uiInputs.push(new UiInput(UiInputKey.ITEM_FULFILLMENT_TYPE, fulfillmentType));
    }

    this.props.performBusinessOperation(this.props.settings.deviceIdentity, APPLY_ITEM_EVENT, uiInputs);
  }

  private getInputDetails = (): { inputType: string, inputSource: string } =>
      !this.isModeProductDetail() && this.props.businessState.inputs && this.props.businessState.inputs[0] !== void 0 ?
          {
            inputType: this.props.businessState.inputs[0].inputType,
            inputSource: this.props.businessState.inputs[0].inputSource
          } :
          {inputType: "string", inputSource: UIINPUT_SOURCE_KEYBOARD}

  private getBackButtonTitle(): string {
    if (this.props.unavailableItem) {
      return (Theme.isTablet ? I18n.t("back") : "");
    } else {
      if (Theme.isTablet){
        return (this.props.uiState.mode === UI_MODE_PRODUCT_DETAIL)
        ? I18n.t("lineItemActions")
        : I18n.t("productInquiry");
      } else {
        return "";
      }
    }
  }

  private handleExtensibilityForms(): void {
    if (Theme.isTablet) {
      const lastAddedItem = last(this.props.businessState.displayInfo.itemDisplayLines);
      if (itemDisplayLineHasValidExtensibilityForms(lastAddedItem)) {
        const freeTextCommentValue: string = getCurrentValueOfField(lastAddedItem, "comment");
        const styles = Theme.getStyles(commentsScreen());
        this.props.navigation.push("comment", {
          lineNumber: lastAddedItem.lineNumber,
          freeTextCommentValue,
          onExit: () => {
            this.props.navigation.pop();
          },
          onDone: (lineNumber: number, comment?: string) => {
            this.onAdditionalInfoProvided(lineNumber, APTOS_ITEM_COMMENTS_FORM, comment && { comment });
          },
          styles,
          showHeader: true
        });
      }
    }
  }

  private onAdditionalInfoProvided = (lineNumber: number, formName: string, fields?: object) => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", lineNumber));
    uiInputs.push(new UiInput(UiInputKey.FORM_NAME, formName));
    uiInputs.push(new UiInput(UiInputKey.NAMESPACE, APTOS_STORE_SELLING_NAMESPACE));
    uiInputs.push(new UiInput(UiInputKey.FIELDS, fields));
    this.props.performBusinessOperation(
      this.props.settings.deviceIdentity,
      APPLY_ITEM_EXTENSIBILITY_FORM_DATA_EVENT,
      uiInputs
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    productInquiryState: state.productInquiry,
    settings: state.settings,
    uiState: state.uiState
  };
}
export default connect<StateProps, DispatchProps>(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  productInquiryRequest: productInquiry.request,
  productInquiryVariantsRequest: productInquiryVariants.request,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof ProductInquiryDetailScreen>()(ProductInquiryDetailScreen));
