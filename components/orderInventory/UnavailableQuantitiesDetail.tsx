import * as React from "react";
import {
  FlatList,
  ScrollView,
  Text,
  View
} from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  IItemDisplayLine,
  ItemLookupType,
  MULTI_LINE_EVENT,
  PriceInquiry,
  UiInputKey,
  VOID_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  productInquiry,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  ProductInquiryState,
  SettingsState,
  UI_MODE_PRODUCT_INQUIRY
} from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import ActionButton from "../common/ActionButton";
import FeedbackNote from "../common/FeedbackNote";
import Header from "../common/Header";
import SelectableItemLine from "../common/SelectableItemLine";
import { popTo } from "../common/utilities/navigationUtils";
import { getTestIdProperties } from "../common/utilities/utils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { UnavailableQuantitiesDetailScreenProps } from "./interfaces";
import { unavailableQuantitiesDetailStyle } from "./styles";

const logger: ILogger =
    LogManager.getLogger("com.aptos.storeselling.ui.components.orderInventory.UnavailableQuantitiesPage");

interface Props extends UnavailableQuantitiesDetailScreenProps, DispatchProps, StateProps,
    NavigationScreenProps<"unavailableQuantities"> {}

interface StateProps {
  settings: SettingsState;
  productInquiryItem: PriceInquiry;
  productInquiryState: ProductInquiryState;
  businessState: BusinessState;
}

interface State {
  unreservedLinesToDisplay: IItemDisplayLine[];
  itemToVoid: IItemDisplayLine;
}
interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  productInquiryRequest: ActionCreator;
}

class UnavailableQuantitiesDetail extends React.Component<Props, State> {
  private styles: any;
  private replaceButtonEnabled: boolean;
  private testID: string;

  public constructor(props: Props) {
    super(props);
    this.testID = "UnavailableQuantitiesDetail";

    this.styles = Theme.getStyles(unavailableQuantitiesDetailStyle());

    this.state = {
      unreservedLinesToDisplay: undefined,
      itemToVoid: undefined
    };

    this.replaceButtonEnabled = true;
  }

  public componentDidMount(): void {
    if (this.props.displayInfo && this.props.displayInfo.itemDisplayLines) {
      this.setState({
        unreservedLinesToDisplay: this.getUnreservedLinesToDisplay()
      });
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress && !this.props.businessState.error &&
      this.props.businessState.eventType === VOID_LINE_EVENT ){
        this.getProductDetail(this.state.itemToVoid);
    }

    if (prevProps.productInquiryState.inProgress && !this.props.productInquiryState.inProgress
        && !this.props.productInquiryState.error && !prevProps.productInquiryState.items){
        if (this.props.productInquiryItem) {
          this.replaceButtonEnabled = true;
          this.props.updateUiMode(UI_MODE_PRODUCT_INQUIRY);
          this.props.navigation.push("productInquiryDetail", {
            item: this.props.productInquiryItem,
            unavailableItem: true,
            unavailableItemCount: this.state.unreservedLinesToDisplay.length
          });
        }
    }
  }

  public componentWillUnmount(): void {
    this.setState({itemToVoid: undefined});
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
            testID={this.testID}
            isVisibleTablet={true}
            title={I18n.t("basket")}
            backButton={{name: "Back", action: this.pop}}
            rightButton={{ title: I18n.t("accept"), action: () => this.voidUnreservedItemsAndMoveToBasket() }}
        />
        { !this.props.error && this.renderContent() }
        {
          this.props.error &&
          <View style={this.styles.errorContainer}>
            <Text
              {...getTestIdProperties(this.testID, "error-text")}
              style={this.styles.errorText}>{this.props.error}</Text>
          </View>
        }
      </View>
    );
  }

  private renderContent(): JSX.Element {
    const message: string = I18n.t("unavailableQuantitiesDetailMsg");
    return (
      <ScrollView style={this.styles.root}>
        <View style={this.styles.mainContent}>
          <View style={this.styles.unreservedDetailContainer}>
            <View style={this.styles.unreservedDetail}>
              <View>
                <Text
                  {...getTestIdProperties(this.testID, "details-label")}
                  style={this.styles.headerText}>{I18n.t("unavailableQuantitiesDetail")}
                </Text>
              </View>
              <View style={this.styles.feedbackNote}>
                <FeedbackNote
                  testID={this.testID}
                  message={message}
                  messageType={FeedbackNoteType.Error}/>
              </View>
            </View>
            <View style={this.styles.fill}>
              <FlatList
                  {...getTestIdProperties(this.testID, "unreservedLineItems-list")}
                  data={this.state.unreservedLinesToDisplay}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                  renderItem={({ item }) => this.renderRow(item)}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  private getUnreservedLinesToDisplay(): IItemDisplayLine[] {
    const { itemDisplayLines } = this.props.displayInfo;
    let unreservedLines: IItemDisplayLine[] = undefined;

    if(itemDisplayLines) {
      unreservedLines = itemDisplayLines.filter((displayLine: IItemDisplayLine) =>
          displayLine.reservedQuantity !== undefined &&
          displayLine.reservedQuantity !== displayLine.quantity);
    }
    return unreservedLines;
  }

  private renderRow(item: IItemDisplayLine): JSX.Element {
    return (
        <View style={this.styles.itemRow}>
          <SelectableItemLine
              testID={this.testID}
              itemLineNumber={item.lineNumber}
              returnMode={false}
              showReservedQuantity={true}
              removeLineAction={true}
          />
          <View style={this.styles.buttonContainer}>
            <ActionButton style={this.styles.closeButton}
              testID={this.testID}
              title={I18n.t("replaceItem")}
              titleStyle={this.styles.btnSecondayText}
              allowTextWrap={true}
              onPress={() => this.onReplaceItem(item)}
              disabled={!this.replaceButtonEnabled}
            />
          </View>
        </View>
    );
  }

  private onReplaceItem(currentItem: IItemDisplayLine): void {
    this.replaceButtonEnabled = false;
    this.setState(
      { itemToVoid: currentItem },
      () => this.voidLine(currentItem.lineNumber)
    );
  }

  private getProductDetail(currentItem: IItemDisplayLine): void {
    try {
      const productInquiryInputs: UiInput[] = [];
      productInquiryInputs.push(new UiInput("itemKey", currentItem.itemIdKey));
      productInquiryInputs.push(new UiInput("itemKeyType", currentItem.itemIdKeyType));
      productInquiryInputs.push(new UiInput(UiInputKey.LINE_NUMBER, currentItem.lineNumber));
      productInquiryInputs.push(new UiInput(UiInputKey.ITEM_LOOKUP_TYPE, ItemLookupType.ProductInquiryDetail));
      this.props.productInquiryRequest(this.props.settings.deviceIdentity, productInquiryInputs);
    } catch (error) {
      throw logger.throwing(error, "productInquiryRequest", LogLevel.WARN);
    }
  }

  private voidLines(lineNumbers: number[]): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.UI_BUSINESS_EVENT, VOID_LINE_EVENT));
    uiInputs.push(new UiInput(UiInputKey.LINE_NUMBERS, lineNumbers));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, MULTI_LINE_EVENT, uiInputs);
  }

  private voidLine(lineNumbers: number): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", lineNumbers));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, VOID_LINE_EVENT, uiInputs);
  }

  private voidUnreservedItemsAndMoveToBasket = (): void => {
    const lineNumbers: number[] =  this.state.unreservedLinesToDisplay.map((lineItem) => lineItem.lineNumber);
    this.voidLines(lineNumbers);

    this.props.navigation.dispatch(popTo("main"));
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request,
  productInquiryRequest: productInquiry.request
};

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    settings: state.settings,
    productInquiryItem: state.productInquiry.itemFromPricing,
    productInquiryState: state.productInquiry
  };
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof UnavailableQuantitiesDetail>()(UnavailableQuantitiesDetail));
