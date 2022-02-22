import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  IConfigurationManager,
  UiInput,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import {
  FAST_DISCOUNT_EVENT,
  IFastDiscountButton,
  IFeatureAccessConfig,
  ItemLookupKey,
  StoreItem,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { ManualDiscountType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  dataEvent,
  DataEventType,
  IKeyedData,
  productInquiryClear,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  ProductInquiryState,
  SettingsState,
  UI_MODE_PRODUCT_INQUIRY
} from "../../reducers";
import {
  getCurrencyCode,
  getCurrencyMinimumDenomination,
  MinimumDenomination }
from "../common/utilities";
import { getFeatureAccessConfig, getMaximumAllowedFieldLength } from "../common/utilities/configurationUtils";
import { NavigationProp } from "../StackNavigatorParams";
import FastDiscountDetails from "./FastDiscountDetails";
import FastDiscountItemLookup, { FastDiscountItemLookupForm } from "./FastDiscountItemLookup";
import { FastDiscountProps } from "./interfaces";

interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  productInquiryState: ProductInquiryState;
  configManager: IConfigurationManager;
  settings: SettingsState;
  i18nLocation: string
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  dataEventRequest: ActionCreator;
  productInquiryClear: ActionCreator;
}

interface Props extends FastDiscountProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

class FastDiscount extends React.Component<Props> {
  private readonly maxAllowedLength: number;
  private readonly fastDiscountFeature: IFeatureAccessConfig;
  private minimumDenomination: MinimumDenomination;
  private currency: string;

  public constructor(props: Props) {
    super(props);

    this.fastDiscountFeature = getFeatureAccessConfig(this.props.configManager, FAST_DISCOUNT_EVENT);
    this.maxAllowedLength = getMaximumAllowedFieldLength(this.props.configManager);
    this.currency = getCurrencyCode(this.props.businessState.stateValues, this.props.settings.retailLocationCurrency);
    this.minimumDenomination = getCurrencyMinimumDenomination(this.props.settings.configurationManager, this.currency,
      this.props.i18nLocation);
  }

  public componentDidMount(): void {
    this.props.productInquiryClear();
    this.props.updateUiMode(UI_MODE_PRODUCT_INQUIRY);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.productInquiryState.inProgress && prevProps.productInquiryState.inProgress) {
      this.handleProductInquiryFinished();
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const item = this.getItem();
    return item ? this.renderFastDiscountResult() : this.renderFastDiscountInputForm();
  }

  private renderFastDiscountInputForm(): JSX.Element {
    return (
      <FastDiscountItemLookup
        fastDiscountFeature={this.fastDiscountFeature}
        searchItems={this.searchItems}
        onExit={this.props.onExit}
      />
    );
  }

  private getItem(): StoreItem {
    const {productInquiryState} = this.props;
    return (productInquiryState.items && productInquiryState.items.length) && productInquiryState.items[0];
  }

  private addItemToBasket = (fastDiscountButton: IFastDiscountButton, priceOverrideAmount?: string,
                             fixedPriceAmount?: string): void => {
    const item: StoreItem = this.getItem();
    const itemLookupKey: ItemLookupKey = item.itemLookupKeys[0];
    const uiInputs: UiInput[] = [];
    const inputInformation = this.getInputDetails();

    uiInputs.push(new UiInput("itemKey", itemLookupKey.value,
        inputInformation.inputType, inputInformation.inputSource));
    uiInputs.push(new UiInput("itemKeyType", itemLookupKey.type,
        inputInformation.inputType, inputInformation.inputSource));
    uiInputs.push(new UiInput("itemLookUpType", "ProductInquiry"));
    uiInputs.push(new UiInput(UiInputKey.FAST_DISCOUNT_BUTTON, fastDiscountButton));

    if (priceOverrideAmount) {
      uiInputs.push(new UiInput("price", priceOverrideAmount));
    }

    if (fixedPriceAmount) {
      uiInputs.push(new UiInput(UiInputKey.NEW_PRICE, fixedPriceAmount));
    }

    const searchedItemLookupKey = new ItemLookupKey(itemLookupKey.type, itemLookupKey.value);
    const itemSearchCriteria = this.props.productInquiryState.itemSearchCriteria;

    if (itemSearchCriteria && itemSearchCriteria.keyType && itemSearchCriteria.keyValue) {
      searchedItemLookupKey.type = itemSearchCriteria.keyType;
      searchedItemLookupKey.value = itemSearchCriteria.keyValue;
    }

    uiInputs.push(new UiInput(UiInputKey.SEARCHED_ITEM_LOOKUP_KEY, searchedItemLookupKey));

    this.props.performBusinessOperation(this.props.deviceIdentity, FAST_DISCOUNT_EVENT, uiInputs);

    this.props.onExit();
  }

  private renderFastDiscountResult(): JSX.Element {
    const item = this.getItem();
    const fixedPriceButton: IFastDiscountButton = this.getFixedPriceButton();

    return (
      <FastDiscountDetails
        storeItem={item}
        maxAllowedLength={this.maxAllowedLength}
        onCancel={this.props.onExit}
        onFastDiscount={this.addItemToBasket}
        fastDiscountFeature={this.fastDiscountFeature}
        fixedPriceButton={fixedPriceButton}
        minimumDenomination={this.minimumDenomination}
        onFixedPriceVisibilityChanged={this.props.onFixedPriceVisibilityChanged}
        navigation={this.props.navigation}
      />
    );
  }

  private searchItems = (data: FastDiscountItemLookupForm): void => {
    if (data && data.searchValue && data.searchValue.length) {
      const keyedData: IKeyedData = {inputText: data.searchValue};

      this.props.dataEventRequest(DataEventType.KeyedData, keyedData, {
        limit: 20,
        offset: 0
      });
    }
  }

  private handleProductInquiryFinished(): void {
    if (this.noResultsFound()) {
      setTimeout(
        () => Alert.alert(
          I18n.t("noResults"),
          undefined,
          [{ text: I18n.t("ok") }],
          { cancelable: true }
        ),
        250
      );
    }
  }

  private getFixedPriceButton(): IFastDiscountButton {
    let discountButton: IFastDiscountButton = undefined;
    this.fastDiscountFeature.fastDiscountButtonRows.forEach((fastDiscountButtonRow: IFastDiscountButton[]) => {
      const currentDiscountButton = fastDiscountButtonRow.find((fastDiscountButton: IFastDiscountButton) =>
          fastDiscountButton.manualDiscountType === ManualDiscountType.ReplacementUnitPrice);

      if (currentDiscountButton) {
        discountButton = currentDiscountButton;
      }
    });
    return discountButton;
  }

  private noResultsFound(): boolean {
    return !!(!this.props.productInquiryState.items || !this.props.productInquiryState.items.length ||
        this.props.productInquiryState.error);
  }

  private getInputDetails = (): { inputType: string, inputSource: string } =>
      this.props.businessState.inputs && this.props.businessState.inputs[0] !== void 0
        ? {
            inputType: this.props.businessState.inputs[0].inputType,
            inputSource: this.props.businessState.inputs[0].inputSource
          }
        : {
            inputType: "string",
            inputSource: UIINPUT_SOURCE_KEYBOARD
          }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    productInquiryState: state.productInquiry,
    configManager: state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity,
    settings: state.settings,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

const mapDispatchToProps: DispatchProps = {
  productInquiryClear: productInquiryClear.request,
  performBusinessOperation: businessOperation.request,
  dataEventRequest: dataEvent.request,
  updateUiMode: updateUiMode.request
};

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, mapDispatchToProps)(FastDiscount);
