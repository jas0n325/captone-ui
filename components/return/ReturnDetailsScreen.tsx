import _ from "lodash";
import * as React from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IMoney, IPrice, LocalizableMessage, Money } from "@aptos-scp/scp-component-business-core";
import { DeviceIdentity, IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  BYPASS_REFUNDED_TAX_FREE_WARNING_EVENT,
  CollectedDataKey,
  EXIT_RETURN_MODE_EVENT,
  IItemDisplayLine,
  ITEM_RETURN_LINE_TYPE,
  START_TAX_REFUND_VOID_EVENT,
  TAX_FREE_FORM_RETURN_VOID_REASON_CODE,
  TaxRefundResultCodes,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import {
  IItemLine,
  IMerchandiseTransaction,
  IPricingAdjustment,
  IProductAttribute,
  isItemLine,
  isTenderLine,
  ISubline,
  ItemType,
  ITenderLine,
  ITransactionLine,
  LineType,
  PricingAdjustmentScope
} from "@aptos-scp/scp-types-commerce-transaction";
import { AdditionalData, TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  feedbackNoteAction,
  gatherReturnedQuantities,
  ReturnTransactionItemsQuantity,
  returnWithTransactionItemImages,
  SublineDisplayLine,
  UniqueIdToImageUrlHash,
  updateReturnAvailableItemQuantities,
  updateReturnItemQuantity,
  updateUiMode
} from "../../actions";
import { AppState, FeedbackNoteState, RetailLocationsState, UI_MODE_RETURN_WITH_TRANSACTION } from "../../reducers";
import Theme from "../../styles";
import { AspectPreservedImage } from "../common/AspectPreservedImage";
import BaseView from "../common/BaseView";
import {DetailHeader, DetailRowAttribute, DefaultBehavior} from "../common/DetailHeader";
import NumericInput from "../common/customInputs/NumericInput";
import Header from "../common/Header";
import TransactionTotalsFooter from "../common/presentational/TransactionTotalsFooter";
import TenderLineList from "../common/TenderLineList";
import {
  formattedAmountFromPosted,
  getFormattedAssociateName,
  getFormattedStoreName,
  getPricingAdjustmentLabel,
  getReturnWithTransactionQuantityChangeMode,
  getSublineAvailableReturnQuantity,
  getTestIdProperties,
  printAmount,
  returnableItemFilter,
  ReturnWithTransactionQuantityChangeMode,
  shouldEnableReturnDoneButton,
  taxRefundErrorCodes
} from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import VectorIcon from "../common/VectorIcon";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ReturnDetailsScreenProps } from "./interfaces";
import { returnDetailsScreen } from "./styles";
import { IVoidableReasonInfo } from "../error/interfaces";

interface StateProps {
  configManager: IConfigurationManager;
  currency: string;
  deviceIdentity: DeviceIdentity;
  eventType: string;
  feedbackNoteState: FeedbackNoteState;
  inputSource: string;
  nonContextualData: Readonly<Map<string, any>>;
  itemDisplayLines: IItemDisplayLine[];
  retailLocationCurrency: string;
  returnMode: boolean;
  currentScreenName: string;
  startingReturnedQuantities: ReturnTransactionItemsQuantity;
  transaction: IMerchandiseTransaction;
  transactionAdditionalData: AdditionalData;
  uiMode: string;
  uniqueIdToImageUrlHash: UniqueIdToImageUrlHash;
  workingReturnedQuantities: ReturnTransactionItemsQuantity;
  retailLocations: RetailLocationsState;
  stateValues: Map<string, any>;
}

interface DispatchProps {
  getItemImages: ActionCreator;
  performBusinessOperation: ActionCreator;
  startReturnWithTransactionSession: ActionCreator;
  updateItemQuantity: ActionCreator;
  updateReturnAvailableItemQuantities: ActionCreator;
  updateUiMode: ActionCreator;
  clearFeedbackNoteState: ActionCreator;
}

interface CurrentState {
  enableDoneButton: boolean;
}

interface Props extends ReturnDetailsScreenProps, StateProps, DispatchProps, NavigationScreenProps<"returnDetails"> {}

export enum SourceForReturns {
  OMS = "OMS",
  TransactionHistory = "TransactionHistory"
}

interface State {}

class ReturnDetailsScreen extends React.PureComponent<Props, State> {
  private testID: string;
  private useSelectLineForQuantityChange: boolean;
  private isReturnAllEnabled: boolean;
  private hasReturnableItems: boolean;
  private numericInputReferences: { [lineNumber: number]: { [sublineIndex: number]: any } } = {};
  private styles: any;
  private showItemImages: boolean;

  public constructor(props: Props) {
    super(props);
    this.testID = "TestId_ReturnDetailsScreen";
    this.styles = Theme.getStyles(returnDetailsScreen());

    const quantityChangeMode: ReturnWithTransactionQuantityChangeMode = getReturnWithTransactionQuantityChangeMode(
      this.props.configManager
    );

    const functionalBehaviors = this.props.configManager.getFunctionalBehaviorValues();
    const returnsBehaviors = functionalBehaviors.returnsBehaviors;

    this.useSelectLineForQuantityChange = quantityChangeMode === ReturnWithTransactionQuantityChangeMode.SelectLine;
    this.isReturnAllEnabled = returnsBehaviors && returnsBehaviors.returnWithTransactionBehaviors &&
        returnsBehaviors.returnWithTransactionBehaviors.enableReturnAll;
    this.hasReturnableItems = false;

    this.showItemImages = functionalBehaviors.lineItemImage &&
                          functionalBehaviors.lineItemImage.showItemImagesOnTransactionHistoryResults;

    this.handleBackButtonPressed = this.handleBackButtonPressed.bind(this);
    this.handleExitReturnMode = this.handleExitReturnMode.bind(this);
    this.applyReturnWithTransactionItems = this.applyReturnWithTransactionItems.bind(this);
    this.renderItemElement = this.renderItemElement.bind(this);
    this.renderSublinePriceAdjustments = this.renderSublinePriceAdjustments.bind(this);
    this.handleReturnAllButtonPressed = this.handleReturnAllButtonPressed.bind(this);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_RETURN_WITH_TRANSACTION);
    this.props.startReturnWithTransactionSession();

    if (this.showItemImages) {
      const itemUniqueIdsWithPossibleDuplicates: string[] = this.props?.transaction?.lines?.
        map((line: ITransactionLine) => isItemLine(line) && (
            line.lineType === LineType.ItemSale || line.lineType === LineType.ItemFulfillment
          ) && !line.voided && line.itemUniqueId
        )?.
        filter((uniqueId: string | undefined) => !!uniqueId);

      this.props.getItemImages([...new Set(itemUniqueIdsWithPossibleDuplicates)]);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.returnMode && !this.props.returnMode) {
      const returnedItems = this.props.workingReturnedQuantities && Object.values(this.props.workingReturnedQuantities);
      const hasReturnedItems = returnedItems?.some((line: any) => line &&
            Object.values(line).find((subLine: any) => subLine?.quantity !== "0"));

      if (this.props.transaction?.taxFreeFormKey && hasReturnedItems) {
        const inputs: UiInput[] = [];
        inputs.push(new UiInput(UiInputKey.RETRIEVED_TRANSACTION, this.props.transaction));
        this.props.performBusinessOperation(this.props.deviceIdentity, START_TAX_REFUND_VOID_EVENT, inputs);
      } else {
        this.props.navigation.dispatch(popTo("main"));
      }
    }

    if (prevProps.eventType === EXIT_RETURN_MODE_EVENT &&
        this.props.eventType === START_TAX_REFUND_VOID_EVENT) {
      const error = this.props.stateValues.get("TaxRefundSession.error");

      if (error && taxRefundErrorCodes(error.localizableMessage?.i18nCode)) {
        const resultCode = this.props.nonContextualData.get(CollectedDataKey.TaxRefundResultCode);
        const metaError = this.props.nonContextualData.get(CollectedDataKey.TaxRefundMetaError);
        const voidableReasonInfo: IVoidableReasonInfo = {
          reasonCode: TAX_FREE_FORM_RETURN_VOID_REASON_CODE,
          reasonDescription: I18n.t("taxFreeFormReturnVoid")
        }

        if (resultCode === TaxRefundResultCodes.VoidedOrRefunded) {
          this.props.navigation.push("voidableErrorScreen", {
            errorMessageString: metaError,
            errorMessageTitle: new LocalizableMessage("transactionReturnWithTaxFreeWarning"),
            isWarning: true,
            headerTitle: I18n.t("returnMode"),
            isReturnMode: true,
            voidableReasonInfo,
            onOK: () => this.props.performBusinessOperation(this.props.deviceIdentity, BYPASS_REFUNDED_TAX_FREE_WARNING_EVENT, [])
          });
        } else {
          this.props.navigation.push("voidableErrorScreen", {
            errorMessage: new LocalizableMessage("transactionReturnWithTaxFreeError"),
            headerTitle: I18n.t("returnMode"),
            isReturnMode: true,
            voidableReasonInfo
          });
        }
      } else {
        this.props.navigation.dispatch(popTo("main"));
      }
      this.props.clearFeedbackNoteState();
    }

    this.preserveUiMode(prevProps);
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const currentState: {
      enableDoneButton: boolean;
    } = this.getCurrentState();
    return (
      <BaseView style={this.styles.base}>
        <Header
          backButton={{ name: "Back", action: this.handleBackButtonPressed }}
          rightButton={this.hasReturnableItems ?
              { title: I18n.t("returnAll"), action: this.handleReturnAllButtonPressed } : undefined }
          isVisibleTablet={Theme.isTablet}
          returnMode={this.props.returnMode}
          showInput={true}
          inputCameraIcon={{
            icon: "Camera",
            size: this.styles.cameraIcon.fontSize,
            color: this.styles.cameraIcon.color,
            position: "right",
            style: this.styles.cameraIconPanel
          }}
          isNumeric={true}
          inputStyle={{
            inputAreaStyle: this.styles.inputStyle,
            inputTextBoxStyle: [this.styles.inputStyle],
            placeholderTextColor: this.styles.headerLabel.color
          }}
        />
        <View style={this.styles.root}>
          <ScrollView style={this.styles.contentArea}>
            { this.renderTransactionHeader() }
            { this.renderItemsList() }
            { this.renderFooter() }
          </ScrollView>
          { this.renderDoneButton(currentState.enableDoneButton) }
        </View>
      </BaseView>
    );
  }

  private getCurrentState(): CurrentState {
    let enableDoneButton: boolean = false;
    if (this.props.workingReturnedQuantities) {
      enableDoneButton = shouldEnableReturnDoneButton(this.props.workingReturnedQuantities);
    }
    return {
      enableDoneButton
    };
  }

  private renderDoneButton(enabled: boolean): JSX.Element {
    return (
        <View style={this.styles.doneArea}>
          <TouchableOpacity
              {...getTestIdProperties(this.testID, "done-button")}
              style={[this.styles.doneButton,
                this.styles.button,
                !enabled && this.styles.btnDisabled]}
              onPress={this.applyReturnWithTransactionItems}
              disabled={!enabled}>
            <Text
                {...getTestIdProperties(this.testID, "done-button-text")}
                style={[this.styles.doneText,
                  !enabled && this.styles.btnTextDisabled]}>
              {I18n.t("done")}</Text>
          </TouchableOpacity>
        </View>
    );
  }

  private renderTransactionHeader(): JSX.Element {
    const { transaction } = this.props;
    const topDetailRow = transaction?.order
      ? DetailHeader.setDetailRow(I18n.t("orderReferenceNumber"), transaction.order.orderReferenceId,"orderReferenceId")
      : DetailHeader.setDetailRow(I18n.t("transactionRefNum"), transaction?.referenceNumber, "referenceNumber");
    const returnDetail: DetailRowAttribute[] = [];
    this.getHeaderDetail(returnDetail);

    return (
      <DetailHeader
        topRow={topDetailRow}
        rows = {returnDetail}
        testModuleId={this.testID}
        defaultBehavior={DefaultBehavior.expanded}
      />
    );
  }

  private renderItemsList(): JSX.Element {
    return (
      <View style={this.styles.itemListArea}>
        <Text style={this.styles.itemsLabel}>{I18n.t("items")}</Text>
        <FlatList
          data={this.returnableSublineDisplayLines}
          renderItem={this.renderItemElement}
          keyExtractor={(item: SublineDisplayLine, index: number) => index.toString()}
        />
      </View>
    );
  }

  private renderItemElement({ item }: { item: SublineDisplayLine }): JSX.Element {
    const { itemLine, sublineIndex } = item;

    const sublineDiscountLines: IPricingAdjustment[] = itemLine.sublines[sublineIndex].adjustments;
    const discountLinesPresent: boolean = !!sublineDiscountLines && !!sublineDiscountLines.length;

    const { sublineAvailableQuantity, previouslyReturned } = getSublineAvailableReturnQuantity(
      item,
      this.props.transactionAdditionalData
    );

    const isReturnable = this.isReturnable(itemLine);
    let displayItemLineAsDisabled: boolean = sublineAvailableQuantity === 0 || !isReturnable;
    if (this.isReturnAllEnabled && !this.hasReturnableItems && !displayItemLineAsDisabled) {
      this.hasReturnableItems = true;
    }

    const isOMSOrderHistory = this.getSourceForOrderHistory(itemLine.lineType);

    if (isOMSOrderHistory) {
      displayItemLineAsDisabled = true;
    }

    const disableSelectableItem: boolean = !this.useSelectLineForQuantityChange || displayItemLineAsDisabled;
    const disableManualEntry: boolean = this.useSelectLineForQuantityChange || displayItemLineAsDisabled;

    const activeReturnQuantity = this.getActiveReturnQuantity(itemLine, sublineIndex);
    const itemAtMaximumReturnQuantity: boolean = Number(activeReturnQuantity) === sublineAvailableQuantity;

    return (
      <TouchableWithoutFeedback
        style={this.styles.fill}
        onPress={() => this.props.updateItemQuantity(item, itemAtMaximumReturnQuantity ? 0 : sublineAvailableQuantity)}
        disabled={disableSelectableItem}
      >
        <View style={this.styles.itemContainer}>
          {
            !disableSelectableItem &&
            <View style={this.styles.checkBoxArea}>
              <VectorIcon
                name={itemAtMaximumReturnQuantity ? "CheckedBox" : "UncheckedBox"}
                fill={this.styles.checkBox.color}
                height={this.styles.checkBox.height}
                width={this.styles.checkBox.height}
              />
            </View>
          }
          <View style={[this.styles.itemArea, displayItemLineAsDisabled && this.styles.itemDisabled || {}]}>
            <View style={this.styles.topHalf}>
              {
                this.showItemImages &&
                this.renderItemImage(itemLine)
              }
              <View style={this.styles.itemDetailsArea}>
                <View style={this.styles.descriptionAndQuantityArea}>
                  <Text
                    style={[this.styles.fill, this.styles.itemDescription]}
                    numberOfLines={2}
                    ellipsizeMode={"tail"}
                  >
                    {itemLine.itemShortDescription}
                  </Text>
                  <TouchableWithoutFeedback
                    onPress={() => this.goToNumericInput(itemLine.lineNumber, sublineIndex)}
                    disabled={disableManualEntry}
                  >
                    {
                      this.renderQuantityArea(sublineAvailableQuantity, item, disableManualEntry, activeReturnQuantity)
                    }
                  </TouchableWithoutFeedback>
                </View>
                <View style={this.styles.itemSection}>
                  {
                    this.renderMutedText(itemLine.enteredLookupKey.keyType, itemLine.enteredLookupKey.value)
                  }
                  {
                    itemLine.productAttributes &&
                    !!itemLine.productAttributes.length &&
                    itemLine.productAttributes.map((attribute: IProductAttribute) => {
                      return this.renderMutedText(
                        attribute.attributeType,
                        attribute.attributeDescription || attribute.attributeCode
                      );
                    })
                  }
                </View>
                <View>
                  {
                    isOMSOrderHistory &&
                    <Text
                      style={[this.styles.row, this.styles.rowMargin,this.styles.notReturnableLabelText,
                          this.styles.minimizedText, this.styles.tar]}
                    >
                      {I18n.t("notReturnable")}
                    </Text>
                  }
                </View>
                <View style={[this.styles.itemSection, this.styles.itemBottomSection]}>
                  {
                    previouslyReturned !== undefined &&
                    <Text style={[this.styles.row, this.styles.rowMargin, this.styles.minimizedText, this.styles.tar]}>
                      {`${I18n.t("previouslyReturned")}: ${previouslyReturned.toString()}`}
                    </Text>
                  }
                </View>
              </View>
            </View>
            <View style={this.styles.pricingInformationListArea}>
              { this.renderPricingInformationRow(I18n.t("originalSale"), this.getOriginalSaleDisplayText(item)) }
              {
                discountLinesPresent &&
                sublineDiscountLines.map(this.renderSublinePriceAdjustments)
              }
              <Text style={[this.styles.row, this.styles.totalPriceText]}>
                {
                  printAmount(Money.fromIMoney(
                    itemLine?.sublines[sublineIndex]?.extendedAmount || this.placeHolderIMoney
                  ))
                }
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  private renderQuantityArea(
    sublineAvailableQuantity: number,
    sublineDisplayLine: SublineDisplayLine,
    disableManualEntry: boolean,
    activeReturnQuantity: string
  ): JSX.Element {
    const { itemLine, sublineIndex } = sublineDisplayLine;

    return (
      <View style={[
        this.styles.quantityButton,
        this.useSelectLineForQuantityChange && this.styles.removePadding
      ]}>
        {
          this.useSelectLineForQuantityChange &&
          <Text style={this.styles.returnQuantityText}>{sublineAvailableQuantity}</Text>
        }
        {
          !this.useSelectLineForQuantityChange &&
          <>
            <NumericInput
              onRef={(ref: any) => {
                if (!this.numericInputReferences[itemLine.lineNumber]) {
                  this.numericInputReferences[itemLine.lineNumber] = {};
                }

                this.numericInputReferences[itemLine.lineNumber][sublineIndex] = ref;
              }}
              testID={`${this.testID}-${itemLine.lineNumber}-${sublineIndex}-quantity`}
              style={[this.styles.numericInputStylesToUndo, this.styles.returnQuantityText]}
              disabled={disableManualEntry}
              value={activeReturnQuantity}
              trimLeadingZeroes
              onChangeText={(newQuantity: string) => this.props.updateItemQuantity(
                sublineDisplayLine,
                parseInt(newQuantity, 10)
              )}
              maxValue={sublineAvailableQuantity}
              minValue={0}
              clearOnFocus
            />
            <Text style={this.styles.oldTransactionQuantityText}>{`/${sublineAvailableQuantity}`}</Text>
          </>
        }
      </View>
    );
  }

  private renderItemImage(itemLine: IItemLine): JSX.Element {
    const itemUrl: string = this.props.uniqueIdToImageUrlHash[itemLine.itemUniqueId];

    return (
      <View style={this.styles.imageArea}>
        <AspectPreservedImage
          defaultSource={require("../../../../assets/img/no-image.png")}
          defaultSourceWidth={this.styles.imageSize.width}
          defaultSourceHeight={this.styles.imageSize.height}
          desiredSource={itemUrl && { uri: itemUrl } || require("../../../../assets/img/no-image.png")}
          rowWidth={this.styles.imageSize.width}
          rowHeight={this.styles.imageSize.height}
        />
      </View>
    );
  }

  private renderMutedText(label: string, info: string): JSX.Element {
    return (
      <Text style={this.styles.attributeText} numberOfLines={1} ellipsizeMode={"clip"} >{`${label}: ${info}`}</Text>
    );
  }

  private getOriginalSaleDisplayText(sublineDisplayLine: SublineDisplayLine): string {
    const { itemLine, sublineIndex } = sublineDisplayLine;

    const quantity: number = itemLine.sublines[sublineIndex].quantity;

    const priceToUse: IPrice = itemLine.originalUnitPrice || itemLine.unitPrice;

    const unitPriceDisplayString: string = printAmount(new Money(priceToUse.amount, priceToUse.currency));

    const totalUnitPriceDisplayString: string = printAmount(new Money(
      Number(priceToUse.amount) * quantity,
      priceToUse.currency
    ));

    return `${quantity} @ ${unitPriceDisplayString} = ${totalUnitPriceDisplayString}`;
  }

  private renderSublinePriceAdjustments(pricingAdjustment: IPricingAdjustment): JSX.Element {
    return pricingAdjustment.adjustmentScope !== PricingAdjustmentScope.Transaction
        ? this.renderPricingInformationRow(
          getPricingAdjustmentLabel(pricingAdjustment, this.props.transaction),
          formattedAmountFromPosted(pricingAdjustment.lineAdjustment)
        )
        : <></>;
  }

  private renderPricingInformationRow(label: string, data: string): JSX.Element {
    return (
      <View style={this.styles.row}>
        <Text style={[this.styles.minimizedText, this.styles.pricingLabel]} numberOfLines={2} ellipsizeMode={"clip"}>
          { label }
        </Text>
        <Text style={[this.styles.minimizedText, this.styles.pricingAmount, this.styles.tar]} numberOfLines={2}>
          { data }
        </Text>
      </View>
    );
  }

  private renderFooter(): JSX.Element {
    const { transaction } = this.props;

    return (
      <View style={this.styles.footerArea}>
        <TransactionTotalsFooter
          style={this.styles.transactionTotals}
          transactionNumber={transaction?.transactionNumber?.toString()}
          referenceNumber={transaction?.referenceNumber}
          orderReferenceNumber={transaction?.order?.orderReferenceId}
          subtotal={Money.fromIMoney(transaction?.transactionSubTotal || this.placeHolderIMoney)}
          totalDiscounts={Money.fromIMoney(transaction?.transactionTotalSavings || this.placeHolderIMoney)}
          tax={new Money(
            transaction?.transactionTax?.amount || this.placeHolderIMoney.amount,
            transaction?.transactionTax?.currency || this.placeHolderIMoney.currency
          )}
          donation={new Money(
            transaction?.transactionTotalDonations?.amount || this.placeHolderIMoney.amount,
            transaction?.transactionTotalDonations?.currency || this.placeHolderIMoney.currency
          )}
          total={new Money(
            transaction?.transactionTotal?.amount || this.placeHolderIMoney.amount,
            transaction?.transactionTotal?.currency || this.placeHolderIMoney.currency
          )}
          totalFee={new Money(
            transaction?.transactionTotalFee?.amount || this.placeHolderIMoney.amount,
            transaction?.transactionTotalFee?.currency || this.placeHolderIMoney.currency
          )}
        />
        <TenderLineList
          allowTenderVoid={false}
          style={this.styles.tenderList}
          tenderLines={this.tenderLines}
        />
      </View>
    );
  }

  private get placeHolderIMoney(): IMoney {
    return { amount: "0", currency: this.props.currency || this.props.retailLocationCurrency };
  }

  private get returnableSublineDisplayLines(): SublineDisplayLine[] {
    const resultItemList: SublineDisplayLine[] = [];

    this.props.transaction?.lines?.filter(returnableItemFilter)?.forEach((itemLine: IItemLine) =>
        itemLine.sublines.forEach((subline: ISubline, index: number) =>
            resultItemList.push({ itemLine, sublineIndex: index })
    ));

    return resultItemList;
  }

  private getHeaderDetail(returnDetail: DetailRowAttribute[]): void {
    const { transaction } = this.props;

    if (transaction?.customer?.firstName && transaction?.customer?.lastName) {
      returnDetail.push(DetailHeader.setDetailRow(
        I18n.t("customer"),
        transaction.customer.firstName + " " + transaction.customer.lastName,
        "customer"));
    }

    if (transaction?.startDateTime) {
      returnDetail.push(DetailHeader.setDetailRow(
        I18n.t("transactionDate"),
        transaction.startDateTime,
        "transactionDate",
        "dateTime"));
    }

    if (transaction?.retailLocationId || transaction?.storeName) {
      const storeName: string = getFormattedStoreName(transaction.storeName, transaction.retailLocationId);
      if (storeName) {
        returnDetail.push(DetailHeader.setDetailRow(
          I18n.t("storeName"),
          storeName,
          "store"
        ));
      }
    }

    if (transaction?.deviceId) {
      returnDetail.push(DetailHeader.setDetailRow(
        I18n.t("terminal"),
        transaction?.deviceId,
        "terminal"));
    }

    if (transaction?.transactionNumber) {
      returnDetail.push(DetailHeader.setDetailRow(
        I18n.t("transaction"),
        transaction.transactionNumber.toString(),
        "transactionNumber"));
    }

    if (transaction?.performingUser) {
      const associateName: string = getFormattedAssociateName(transaction.performingUser);
      returnDetail.push(DetailHeader.setDetailRow(
        I18n.t("associate"),
        associateName,
        "associate"));
    }
  }

  private getSourceForOrderHistory(lineType: LineType): boolean {
    const storeOmniChannelValues = this.props.configManager.getStoreOmniChannelValues();
    const configValue = storeOmniChannelValues && storeOmniChannelValues.sourceForOrderHistory;
    return configValue && configValue === SourceForReturns.OMS && lineType === LineType.ItemOrder;
  }

  private getActiveReturnQuantity(itemLine: IItemLine, sublineIndex: number): string {
    return this.props.workingReturnedQuantities[itemLine.lineNumber] &&
      this.props.workingReturnedQuantities[itemLine.lineNumber][sublineIndex] &&
      this.props.workingReturnedQuantities[itemLine.lineNumber][sublineIndex].quantity || "0";

  }

  private get tenderLines(): ITenderLine[] {
    return this.props.transaction?.lines?.filter(
      (line: ITransactionLine) => isTenderLine(line) && line.lineType !== LineType.TenderDecline && !line.voided
    ) as ITenderLine[];
  }

  private applyReturnWithTransactionItems(): void {
    const inputs: UiInput[] = [];
    inputs.push(new UiInput(UiInputKey.RETRIEVED_TRANSACTION, this.props.transaction, undefined,
        this.props.inputSource));
    inputs.push(new UiInput("selectedReturnItems", this.props.workingReturnedQuantities));
    inputs.push(new UiInput(
      UiInputKey.RETURN_WITH_TRANSACTION_QUANTITIES_CHANGED,
      !_.isEqual(this.props.startingReturnedQuantities, this.props.workingReturnedQuantities)
    ));
    this.props.performBusinessOperation(this.props.deviceIdentity, EXIT_RETURN_MODE_EVENT, inputs);
  }

  private handleExitReturnMode(): void {
    this.props.performBusinessOperation(this.props.deviceIdentity, EXIT_RETURN_MODE_EVENT, []);
  }

  private handleBackButtonPressed(): void {
    if (this.props.autoMove || (
        this.props.itemDisplayLines &&
        this.props.itemDisplayLines.some((line: IItemDisplayLine) => line.lineType === ITEM_RETURN_LINE_TYPE))) {
      this.handleExitReturnMode();
    } else {
      this.props.navigation.replace("returnWithTransactionSearchResult", {
        inputSource: this.props.inputSource,
        returning: true
      });
    }
  }

  private preserveUiMode(prevProps: Props): void {
    if (this.props.currentScreenName === "returnDetails" && prevProps.uiMode !== this.props.uiMode &&
        this.props.uiMode !== UI_MODE_RETURN_WITH_TRANSACTION) {
      this.props.updateUiMode(UI_MODE_RETURN_WITH_TRANSACTION);
    }
  }

  private isReturnable(itemLine: IItemLine): boolean {
    return (itemLine.itemType === ItemType.Merchandise || itemLine.itemType === ItemType.NonMerch) &&
        itemLine.returnable !== false && !itemLine.tenderId;
  }

  private goToNumericInput(lineNumber: number, sublineIndex: number): void {
    this.numericInputReferences[lineNumber][sublineIndex].focus();
  }

  private handleReturnAllButtonPressed(): void {
    this.props.updateReturnAvailableItemQuantities(this.returnableSublineDisplayLines.filter(
        (subline: SublineDisplayLine) => this.isReturnable(subline.itemLine)));
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const transactionInformationForReturn: TransactionWithAdditionalData = state.businessState.stateValues.get(
    "ItemHandlingSession.transactionInformationForReturn"
  );

  return {
    configManager: state.settings.configurationManager,
    currency: state.businessState.stateValues.get("transaction.accountingCurrency"),
    deviceIdentity: state.settings.deviceIdentity,
    eventType: state.businessState.eventType,
    feedbackNoteState: state.feedbackNote,
    itemDisplayLines: state.businessState.displayInfo && state.businessState.displayInfo.itemDisplayLines,
    nonContextualData: state.businessState.nonContextualData,
    returnMode: state.businessState.stateValues.get("ItemHandlingSession.isReturning"),
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    inputSource: state.businessState.stateValues.get("ItemHandlingSession.inputSource"),
    startingReturnedQuantities: state.returnState.startingReturnedQuantities,
    transaction: transactionInformationForReturn &&
                 transactionInformationForReturn.transaction as IMerchandiseTransaction,
    transactionAdditionalData: transactionInformationForReturn && transactionInformationForReturn.additionalData,
    uiMode: state.uiState.mode,
    uniqueIdToImageUrlHash: state.returnState.uniqueIdToImageUrlHash,
    workingReturnedQuantities: state.returnState.workingReturnedQuantities,
    retailLocations: state.retailLocations,
    stateValues: state.businessState.stateValues,
    retailLocationCurrency: state.settings.retailLocationCurrency
  };
};

const mapDispatchToProps: DispatchProps = {
  getItemImages: returnWithTransactionItemImages.request,
  performBusinessOperation: businessOperation.request,
  startReturnWithTransactionSession: gatherReturnedQuantities.request,
  updateItemQuantity: updateReturnItemQuantity.request,
  updateReturnAvailableItemQuantities: updateReturnAvailableItemQuantities.request,
  updateUiMode: updateUiMode.request,
  clearFeedbackNoteState: feedbackNoteAction.success
};

export default connect(mapStateToProps, mapDispatchToProps)
  (withMappedNavigationParams<typeof ReturnDetailsScreen>()(ReturnDetailsScreen));
