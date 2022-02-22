import { Container } from "inversify";
import _ from "lodash";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager, IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";
import {
  AllowRefund,
  getTenderAuthCategoryFromTenderType,
  IDisplayInfo,
  IItemDisplayLine,
  ILabel,
  IOriginalLineReference,
  IOriginalTender as IOriginalTenderInfo,
  IOriginalTransactionDetails as IOriginalTransactionDetailsInfo,
  IPinRules,
  ITenderGroup,
  TenderAdjustmentType,
  TenderAuthCategory,
  TenderAuthorizationState,
  TenderDenominationRoundings,
  TenderType,
  TENDER_CHANGE_LINE_TYPE,
  TENDER_PAYMENT_LINE_TYPE,
  TENDER_REFUND_LINE_TYPE
} from "@aptos-scp/scp-component-store-selling-features";
import {
  IAuthorizationResponse,
  IPaymentStatus,
  TenderSubType,
  TenderType as TenderTypeName,
  ValueCertSubType
} from "@aptos-scp/scp-types-commerce-devices";
import { IOtherTransactionLineReference, LineType } from "@aptos-scp/scp-types-commerce-transaction";
import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";

import I18n from "../../../config/I18n";
import { BusinessState } from "../../reducers/businessState";
import { RenderSelectOptions } from "../common/FieldValidation";
import { printAmountDue } from '../common/utilities';
import { MaskService } from "react-native-masked-text";

const mapTenderTypeToI18nCode = new Map<string, string>([
  [TenderTypeName.Credit, "tenderTypeCredit"],
  [TenderTypeName.Debit, "tenderTypeDebit"],
  [TenderTypeName.Cash, "tenderTypeCash"],
  [TenderTypeName.PaymentDevice, "tenderTypePaymentDevice"],
  [TenderTypeName.Gift, "tenderTypeGift"],
  [TenderTypeName.ValueCertificate, "tenderTypeValueCertificate"],
  [TenderTypeName.Wallet, "tenderTypeWallet"],
  [TenderTypeName.Unknown, "tenderTypeUnknown"]
]);

export const MAX_TENDER_BUTTONS: number = 4;

export interface ITenderType {
  tenderAuthCategory: TenderAuthCategory;
  tenderId: string;
  tenderType: string;
  tenderLabel: ILabel;
  tenderName: string;
  pluralTenderName: string;
  pinRules: IPinRules;
  allowRefund: AllowRefund[];
  subType?: string;
  isForeignTender?: boolean;
  currencyCode?: string;
}

export interface IOriginalTender {
  showReference: boolean;
  isMappedTender: boolean;
  tenderAuthCategory: TenderAuthCategory;
  tenderId: string;
  tenderName: string;
  tenderType: string;
  lastFour?: string;
  originalTransactionReferences: IOriginalTransactionRefundReference[];
  originalTenderAmount: Money;
  refundedAmount: Money;
  previouslyRefundedAmount: Money;
  adjustmentType?: TenderAdjustmentType;
  adjustmentAmount?: Money;
  isForeignTender?: boolean;
  currencyCode?: string;
  subType?: TenderSubType;
}

export interface IOriginalTransactionRefundReference {
  transactionLineReference: IOtherTransactionLineReference;
  refundableAmount: Money;
}

export interface IOriginalTransactionDetails {
  originalTransactionReferenceNumber: string;
  originalTenders: IOriginalTender[];
  returnTotalAmount: Money;
  originalTransactionId: string;
}

export function paymentStatusToRenderSelectOptions(status: IPaymentStatus): RenderSelectOptions {
  return {
    code: status.deviceId,
    description: status.deviceDescription
  };
}

export function isPaymentDeviceAvailable(status: IPaymentStatus): boolean {
  return status.deviceAvailable;
}

export function getPaymentDevicesAsRenderSelect(paymentStatus: Map<string, IPaymentStatus>,
                                                filterFunction: (status: IPaymentStatus) => boolean,
                                                skipAvailableCheck?: boolean
                                               ): RenderSelectOptions[] {
  return getPaymentDevices(paymentStatus, filterFunction, skipAvailableCheck).map(paymentStatusToRenderSelectOptions);
}

export function getPaymentDevices(paymentStatus: Map<string, IPaymentStatus>,
                                  filterFunction: (status: IPaymentStatus) => boolean,
                                  skipAvailableCheck?: boolean): IPaymentStatus[] {
  const filteredDevices = Array.from(paymentStatus.values()).filter(filterFunction);
  const availableFilteredDevice = skipAvailableCheck ? filteredDevices : filteredDevices.filter(isPaymentDeviceAvailable);
  return _.sortBy(
    availableFilteredDevice,
    ["code"]
  );
}

export function makePrimaryDeviceTypeFilter(configurationManager: IConfigurationManager,
                                            deviceId: string): (status: IPaymentStatus) => boolean {

  const peripheralsConfig: IConfigurationValues = configurationManager.getPeripheralsValues();
  let primaryDeviceId: string | string[] = [];

  try {
    primaryDeviceId =
      peripheralsConfig.paymentType.primaryDevicesByTerminalId &&
      peripheralsConfig.paymentType.primaryDevicesByTerminalId[deviceId]
      || peripheralsConfig.paymentType.primaryDeviceId;

    return  makePaymentDeviceTypeFilter(primaryDeviceId);

  } catch (error) {
    return (): boolean => true;
  }
}

export function getIsGiftCardDeviceFilter(configurationManager: IConfigurationManager,
                                          deviceId: string) : (status: IPaymentStatus) => boolean {
  const peripheralsConfig: IConfigurationValues = configurationManager?.getPeripheralsValues();

  const giftCardDeviceId: string | string[] = peripheralsConfig.paymentType.giftCardDevicesByTerminalId &&
      peripheralsConfig.paymentType.giftCardDevicesByTerminalId[deviceId]
      || peripheralsConfig.paymentType.giftCardDeviceId;

  return makePaymentDeviceTypeFilter(giftCardDeviceId);
}

export function makePaymentDeviceTypeFilter(deviceIds: string | string[]): (status: IPaymentStatus) => boolean {
  const devices: string [] = typeof deviceIds === "string" ?  [deviceIds] : deviceIds;
  return (status: IPaymentStatus): boolean => devices.indexOf(status.deviceId) > -1;
}

export function getMaskedCardNumber(authResponse: IAuthorizationResponse): string {
  if (authResponse && authResponse.cardNumber && authResponse.cardNumber.length > 4) {
    const cardNumber = authResponse.cardNumber;
    return new Array(cardNumber.length - 3).join("x") + cardNumber.substr(cardNumber.length - 4, 4);
  }
  return "";
}

export function beginProgressTenderAuthorization(prevState: any , newState: any): boolean {
  return (newState === TenderAuthorizationState.InProgress ||
      newState === TenderAuthorizationState.BalanceInquiryInProgress ||
      newState === TenderAuthorizationState.GiftCardIssueInProgress) &&
      (prevState !== TenderAuthorizationState.InProgress ||
      prevState !== TenderAuthorizationState.BalanceInquiryInProgress ||
      prevState !== TenderAuthorizationState.GiftCardIssueInProgress);
}

export function completedTenderAuthorization(prevState: any , newState: any): boolean {
  return newState === TenderAuthorizationState.Completed && prevState !== TenderAuthorizationState.Completed;
}

export function businessEventCompletedWithError(prevBusinessState: BusinessState,
                                                currentBusinessState: BusinessState): boolean {
  return !currentBusinessState.inProgress && prevBusinessState.inProgress && !!currentBusinessState.error;
}

export function businessEventCompletedWithoutError(prevBusinessState: BusinessState,
                                                   currentBusinessState: BusinessState): boolean {
  return !currentBusinessState.inProgress && prevBusinessState.inProgress && !currentBusinessState.error;
}

export function tenderAuthorizationInProgress(authState: string): boolean {
  return authState === TenderAuthorizationState.InProgress ||
      authState === TenderAuthorizationState.BalanceInquiryInProgress ||
      authState === TenderAuthorizationState.GiftCardIssueInProgress;
}

export function getActiveTenderTypes(diContainer: Container,
                                     accountingCurrency: string,
                                     amount?: Money,
                                     displayInfo?: IDisplayInfo): ITenderType[] {
  const activeTenders = getActiveTenders(diContainer, accountingCurrency, amount, displayInfo);
  const activeTenderTypes: ITenderType[] = [];
  if (activeTenders) {
    activeTenders.forEach((aTender: TenderType) => {
      activeTenderTypes.push(
        {
          tenderAuthCategory: aTender.tenderAuthCategory,
          tenderId: aTender.id,
          tenderName: aTender.tenderName,
          pluralTenderName: aTender.pluralTenderName,
          tenderLabel: aTender.tenderLabel,
          tenderType: aTender.tenderTypeName,
          pinRules: aTender.pinRules,
          allowRefund: aTender.allowRefund,
          subType: aTender.subType,
          isForeignTender: aTender.isForeignTender,
          currencyCode: aTender.currencyCode
        }
      );
    });
  }
  return activeTenderTypes;
}

function getChangeTenders(diContainer: Container,
                          accountingCurrency: string,
                          tenderAuthCategory: TenderAuthCategory,
                          tenderTypeName: string,
                          tenderSubType: string,
                          balanceDue: Money,
                          tenderAmount: Money): ITenderType[] {
  const activeTenders = TenderType.getActiveConfiguredTenders(diContainer, accountingCurrency);
  const storedValueTender = activeTenders && activeTenders.find((tender) =>
      tender.tenderTypeName === tenderTypeName &&
      tender.subType === tenderSubType &&
      tender.tenderAuthCategory === tenderAuthCategory);
  const changeTenders = storedValueTender?.getChangeTenderType(diContainer, accountingCurrency, balanceDue,
      tenderAmount);
  return changeTenders?.map((changeTender) => ({
    tenderAuthCategory: changeTender.tenderAuthCategory,
    tenderId: changeTender.id,
    tenderName: changeTender.tenderName,
    pluralTenderName: changeTender.pluralTenderName,
    tenderLabel: changeTender.tenderLabel,
    tenderType: changeTender.tenderTypeName,
    pinRules: changeTender.pinRules,
    allowRefund: changeTender.allowRefund,
    subType: changeTender.subType
  }));
}

export function getActiveTenders(diContainer: Container,
                                 accountingCurrency: string,
                                 amount?: Money,
                                 displayInfo?: IDisplayInfo): TenderType[] {
  if (amount && amount.isNegative()) {
    const returnWithTransaction = displayInfo.itemDisplayLines &&
        displayInfo.itemDisplayLines.find((displayLine: IItemDisplayLine) => {
          return displayLine.lineType === LineType.ItemReturn &&
              displayLine.lineNumberFromReturnTransaction !== undefined &&
              displayLine.sublineIndexFromReturnItem !== undefined;
        });
    const returnWithoutTransaction = displayInfo.itemDisplayLines &&
        displayInfo.itemDisplayLines.find((displayLine: IItemDisplayLine) => {
          return displayLine.lineType === LineType.ItemCancel ||
              (displayLine.lineType === LineType.ItemOrder && displayLine.cancelled) ||
              (displayLine.lineType === LineType.ItemReturn &&
              displayLine.lineNumberFromReturnTransaction === undefined &&
              displayLine.sublineIndexFromReturnItem === undefined);
        });
    const returnWithOfflineTransaction = displayInfo.itemDisplayLines &&
        displayInfo.itemDisplayLines.find((displayLine: IItemDisplayLine) => {
          return displayLine.lineType === LineType.ItemReturn &&
              displayLine.offlineReturnReferenceNumber !== undefined;
         });
    const withTransactionTenders = returnWithTransaction &&
        TenderType.getActiveRefundConfiguredTenders(diContainer, accountingCurrency, true,
        !!returnWithOfflineTransaction) || [];
    const withoutTransactionTenders = returnWithoutTransaction &&
        TenderType.getActiveRefundConfiguredTenders(diContainer, accountingCurrency, false,
        !!returnWithOfflineTransaction) || [];
    let combineTenders = withTransactionTenders.concat(withoutTransactionTenders);
    combineTenders = combineTenders.filter((tender, i) => {
      return combineTenders.findIndex((matchingTender) => matchingTender.id === tender.id) === i;
    });
    return combineTenders;
  } else {
    return TenderType.getActiveConfiguredTenders(diContainer, accountingCurrency);
  }
}

export function getActiveTenderGroups(diContainer: Container,
                                      accountingCurrency: string,
                                      amount: Money,
                                      displayInfo: IDisplayInfo,
                                      activeTenders: TenderType[],
                                      originalTransactionsDetails: IOriginalTransactionDetailsInfo[]): ITenderGroup[] {
  if (amount && amount.isNegative()) {
    const returnWithTransaction = displayInfo.itemDisplayLines &&
        displayInfo.itemDisplayLines.find((displayLine: IItemDisplayLine) => {
          return displayLine.lineType === LineType.ItemReturn &&
              displayLine.lineNumberFromReturnTransaction !== undefined &&
              displayLine.sublineIndexFromReturnItem !== undefined;
      });
    const returnWithoutTransaction = displayInfo.itemDisplayLines &&
        displayInfo.itemDisplayLines.find((displayLine: IItemDisplayLine) => {
          return displayLine.lineType === LineType.ItemCancel ||
               (displayLine.lineType === LineType.ItemOrder && displayLine.cancelled) ||
               (displayLine.lineType === LineType.ItemReturn &&
               displayLine.lineNumberFromReturnTransaction === undefined &&
               displayLine.sublineIndexFromReturnItem === undefined);
      });
    const returnWithOfflineTransaction = displayInfo.itemDisplayLines &&
        displayInfo.itemDisplayLines.find((displayLine: IItemDisplayLine) => {
          return displayLine.lineType === LineType.ItemReturn &&
              displayLine.offlineReturnReferenceNumber !== undefined;
    });
    const withTransactionTenderGroups = returnWithTransaction &&
        TenderType.getActiveRefundConfiguredTenderGroups(diContainer, accountingCurrency, true,
        activeTenders, originalTransactionsDetails, !!returnWithOfflineTransaction) || [];
    const withoutTransactionTenderGroups = returnWithoutTransaction &&
        TenderType.getActiveRefundConfiguredTenderGroups(diContainer, accountingCurrency, false,
        activeTenders, undefined, !!returnWithOfflineTransaction) || [];
    let combineTenderGroups = withTransactionTenderGroups.concat(withoutTransactionTenderGroups);
    combineTenderGroups = combineTenderGroups.filter((group, i) => {
      return combineTenderGroups.findIndex((matchingGroup) => _.isEqual(matchingGroup, group)) === i;
    });
    return combineTenderGroups;
  } else {
    return TenderType.getActiveConfiguredTenderGroups(diContainer, accountingCurrency, activeTenders);
  }
}

export function didStoredValueCardSessionStateChange(prevStateValues: Map<string, any>, stateValues: Map<string, any>): boolean {
  return prevStateValues && stateValues && prevStateValues.get("StoredValueCardSession.state") !== stateValues.get("StoredValueCardSession.state");
}

export function didStoredValueCertSessionStateChange(prevStateValues: Map<string, any>, stateValues: Map<string, any>): boolean {
  return prevStateValues && stateValues && prevStateValues.get("StoredValueCertificateSession.state") !== stateValues.get("StoredValueCertificateSession.state");
}

export function isRefund(stateValues: Map<string, any>): boolean {
  return stateValues.get("transaction.balanceDue") &&
      stateValues.get("transaction.balanceDue").isNegative();
}

export function getOriginalTenderRefundableAmount(originalTender: IOriginalTender, refundDue: Money,
                                                  originalTransactionDetails: IOriginalTransactionDetails[]): Money {
  if (!originalTender) {
    return undefined;
  }
  let refundableAmount: Money = new Money(0, refundDue.currency);
  const mergedTransactionReferences: IOriginalTransactionRefundReference[] = [];

  if (originalTender.originalTransactionReferences && originalTender.originalTransactionReferences.length > 0) {
    originalTender.originalTransactionReferences.forEach((ref) => {
      const matchingRef = mergedTransactionReferences.find((matching) =>
          matching.transactionLineReference.transactionId === ref.transactionLineReference.transactionId);
      if (matchingRef) {
        matchingRef.refundableAmount = matchingRef.refundableAmount.plus(ref.refundableAmount);
      } else {
        mergedTransactionReferences.push(Object.assign({},ref));
      }
    })
    mergedTransactionReferences.forEach((origTranRef) => {
      const originalTenderReferenceTranId = origTranRef.transactionLineReference && origTranRef.transactionLineReference.transactionId;
      const originalTran: IOriginalTransactionDetails = originalTransactionDetails && originalTransactionDetails.find((origTran) =>
          origTran.originalTransactionId === originalTenderReferenceTranId);
      if (refundDue) {
        const returnTotalAmount = originalTran && originalTran.returnTotalAmount && originalTran.returnTotalAmount.abs();
        // If transaction was partially returned, tranRef.refundableAmount will have the full original tender amount, default to the partial return total amount
        const originalTenderAmount = getLowestRefundDue(undefined, returnTotalAmount, adjustAmount(origTranRef.refundableAmount, originalTender.adjustmentAmount));
        // Mapped tenders will only use their transaction references for refund amount calculation, if they have been fully tendered,
        // they will not have transaction references, do not subtract refunded amount
        const currentTranRefundableAmount = calculateRefundableAmount(originalTenderAmount,
            originalTender.isMappedTender ? undefined : originalTender.refundedAmount, returnTotalAmount, refundDue);
        // Multi receipt transactions with the same mapped tender will have have multiple transaction references, refundDue will be the total
        // of the current transaction, returnTotal amount is the original total of the individual transactions. Do not allow refundable amount
        // to be greater than the refundDue, do not account for the individual original totals here or the amounts won't be combined
        refundableAmount = getLowestRefundDue(refundableAmount.plus(currentTranRefundableAmount), undefined, refundDue);
      }
    });
  }
  return originalTender.isMappedTender ? refundableAmount :
      refundableAmount.ne(new Money(0, refundDue.currency)) && refundableAmount || originalTender.refundedAmount;
}

function calculateRefundableAmount(originalTenderAmount: Money,
                                   refundedAmount: Money, returnTotalAmount: Money, refundDue: Money): Money {
  const remainingTenderAmount = refundedAmount && originalTenderAmount &&
      originalTenderAmount.minus(refundedAmount) || originalTenderAmount;
  return getLowestRefundDue(refundDue, returnTotalAmount, remainingTenderAmount);
}

function calculateTotalRefundedAmount(previouslyRefundedAmount: Money, refundedAmount: Money): Money {
  if (previouslyRefundedAmount && refundedAmount) {
    return previouslyRefundedAmount.plus(refundedAmount);
  } else {
    return previouslyRefundedAmount || refundedAmount;
  }
}
function getLowestRefundDue(refundDue: Money, returnTotalAmount: Money, remainingTenderAmount: Money): Money {
  const lowestRefundDue = returnTotalAmount && refundDue && returnTotalAmount.gt(refundDue) ? refundDue : returnTotalAmount || refundDue;
  return (remainingTenderAmount && lowestRefundDue && remainingTenderAmount.gt(lowestRefundDue) ? lowestRefundDue : remainingTenderAmount) || lowestRefundDue;
}

function adjustAmount(amount: Money, adjustmentAmount: Money): Money {
  return adjustmentAmount && amount && amount.plus(adjustmentAmount) || amount;
}

export function getOriginalTenderLabel(originalTenderDetails: IOriginalTender): string {
  if (originalTenderDetails.showReference && originalTenderDetails.lastFour) {
    return `${originalTenderDetails.tenderName} (...${originalTenderDetails.lastFour})`
  } else {
    return originalTenderDetails.tenderName;
  }
}

export function getOriginalTransactionDetails(originalTransactions: IOriginalTransactionDetailsInfo[],
                                              activeSuggestedTenders: ITenderType[],
                                              configuration: IConfigurationManager,
                                              refundDue: Money): IOriginalTransactionDetails[] {
  const originalTransactionDetails: IOriginalTransactionDetails[] = [];
  if (originalTransactions && originalTransactions.length) {
    originalTransactions.forEach((origTran) => {
      const origTranDetail: IOriginalTransactionDetails = {
        originalTenders: [],
        returnTotalAmount: origTran.returnTotalAmount,
        originalTransactionReferenceNumber: origTran.originalTransactionReferenceNumber,
        originalTransactionId: origTran.originalTransactionId
      };
      let referencedOriginalTenders: IOriginalTender[] = [];
      const unreferencedOriginalTenders: IOriginalTender[] = [];
      const mappedOriginalTenders: IOriginalTender[] = [];
      if (origTran && origTran.originalTenders && origTran.originalTenders.length) {
        origTran.originalTenders.forEach((originalTender) => {
          if (originalTender.refundAllowed) {
            const configuredTender = activeSuggestedTenders && activeSuggestedTenders.find((tender: ITenderType) =>
                tender.tenderId === originalTender.tenderId);
            if (configuredTender) {
              if (originalTender.showReference) {
                referencedOriginalTenders.push(getOriginalTender(originalTender, origTran.originalTransactionId, activeSuggestedTenders, true));
              } else if (originalTender.tenderAuthCategory !== TenderAuthCategory.LoyaltyVoucherService) {
                unreferencedOriginalTenders.push(getOriginalTender(originalTender, origTran.originalTransactionId, activeSuggestedTenders, false));
              }
            }
            const mappedTenders: IOriginalTender[] = getMappedTenders(originalTender, configuredTender, configuration,
                origTran.originalTransactionId, originalTransactions, refundDue);
            if (mappedTenders && mappedTenders.length > 0) {
              mappedTenders.map((mappedTender) => {
                const alreadyMapped = mappedOriginalTenders.find((mTender) =>
                    mTender.tenderType === mappedTender.tenderType && mTender.tenderId === mappedTender.tenderId);
                if (!alreadyMapped) {
                  mappedOriginalTenders.push(mappedTender);
                } else {
                  alreadyMapped.refundedAmount = alreadyMapped.refundedAmount.plus(
                      originalTender.refundedAmount);
                  alreadyMapped.previouslyRefundedAmount = alreadyMapped.previouslyRefundedAmount.plus(
                      originalTender.previouslyRefundedAmount);
                  alreadyMapped.originalTenderAmount = alreadyMapped.originalTenderAmount.plus(
                      originalTender.originalTenderAmount);
                  if (mappedTender.originalTransactionReferences) {
                    alreadyMapped.originalTransactionReferences = alreadyMapped.originalTransactionReferences &&
                        alreadyMapped.originalTransactionReferences.concat(mappedTender.originalTransactionReferences) ||
                        mappedTender.originalTransactionReferences;
                  }
                }
              })
            }
          }
        });
      }
      referencedOriginalTenders = sortOriginalTenders(referencedOriginalTenders);
      origTranDetail.originalTenders = [...referencedOriginalTenders, ...unreferencedOriginalTenders, ...mappedOriginalTenders];
      originalTransactionDetails.push(origTranDetail);
    });
  }
  return originalTransactionDetails;
}

export function getOriginalTenders(originalTransactionDetails: IOriginalTransactionDetails[],
    balanceDue: Money): IOriginalTender[] {
  const originalTenders: IOriginalTender[] = [];
  originalTransactionDetails.map((origTran) => {
    if (origTran.originalTenders) {
      origTran.originalTenders.map((origTender) => {
        originalTenders.push(origTender);
      });
    }
  });
  return originalTenders;
}

export function getOriginalUnreferencedTenders(originalTenders: IOriginalTender[]): IOriginalTender[] {
  const unreferencedTenders: IOriginalTender[] = [];
  originalTenders.map((origTender) => {
    if (!origTender.showReference) {
      const matchingUnreferencedTender: IOriginalTender = unreferencedTenders
          .find((unreferencedTender) => (
              origTender.tenderId && unreferencedTender.tenderId &&
              unreferencedTender.tenderId === origTender.tenderId) ||
              (origTender.isMappedTender && unreferencedTender.isMappedTender &&
                  origTender.tenderAuthCategory !== TenderAuthCategory.None &&
                  origTender.tenderAuthCategory !== TenderAuthCategory.StoredValueCertificateService &&
                  origTender.tenderType === unreferencedTender.tenderType))
      if (matchingUnreferencedTender) {
        matchingUnreferencedTender.refundedAmount = matchingUnreferencedTender.refundedAmount.plus(
            origTender.refundedAmount);
        matchingUnreferencedTender.previouslyRefundedAmount = matchingUnreferencedTender.previouslyRefundedAmount.plus(
            origTender.previouslyRefundedAmount);
        matchingUnreferencedTender.originalTenderAmount = matchingUnreferencedTender.originalTenderAmount.plus(
            origTender.originalTenderAmount);
        if (matchingUnreferencedTender.adjustmentAmount && origTender.adjustmentAmount) {
          matchingUnreferencedTender.adjustmentAmount = matchingUnreferencedTender.adjustmentAmount.plus(
            origTender.adjustmentAmount);
        }
        if (matchingUnreferencedTender.originalTransactionReferences) {
          if (origTender.originalTransactionReferences && origTender.originalTransactionReferences.length > 0) {
            origTender.originalTransactionReferences.forEach((origTranRef) => {
              const matchingTranReference = matchingUnreferencedTender.originalTransactionReferences.find((ref) =>
                  ref.transactionLineReference.transactionId === origTranRef.transactionLineReference.transactionId &&
                  ref.transactionLineReference.lineNumber === origTranRef.transactionLineReference.lineNumber);
              if (matchingTranReference) {
                matchingTranReference.refundableAmount = origTranRef.refundableAmount;
              } else {
                matchingUnreferencedTender.originalTransactionReferences.push(origTranRef);
              }
            });
          }
        } else {
          matchingUnreferencedTender.originalTransactionReferences = origTender.originalTransactionReferences;
        }
      } else {
        unreferencedTenders.push(origTender);
      }
    }
  });
  return unreferencedTenders;
}

export function getOriginalReferencedTenderButtonsCount(originalTenders: IOriginalTender[]): number {
  return originalTenders && originalTenders.filter((origTender) => {
    return origTender.showReference;
  }).length;
}

function sortOriginalTenders(originalTenders: IOriginalTender[]): IOriginalTender[] {
  return originalTenders && originalTenders.sort((a, b) => {
    return a.originalTenderAmount.gt(b.originalTenderAmount) ? -1 : 0;
  });
}

export function getRoundedBalanceLabel(roundedBalanceDueTender: TenderDenominationRoundings | Money): string {
  const amt: Money = roundedBalanceDueTender && "tenderId" in roundedBalanceDueTender &&
      roundedBalanceDueTender.tenderId &&
      roundedBalanceDueTender.roundedValue || roundedBalanceDueTender as Money;
  return printAmountDue(amt);
}

function getOriginalTender(originalTenderDetails: IOriginalTenderInfo, transactionId: string,
                           activeTenders: ITenderType[], referenced: boolean): IOriginalTender {
  const lastFour: string = referenced && originalTenderDetails && originalTenderDetails.maskedCardNumber &&
      originalTenderDetails.maskedCardNumber.length > 4 &&
      originalTenderDetails.maskedCardNumber.substring(originalTenderDetails.maskedCardNumber.length - 4);
  return {
    showReference: referenced,
    isMappedTender: false,
    tenderAuthCategory: originalTenderDetails.tenderAuthCategory,
    tenderId: originalTenderDetails.tenderId,
    tenderName: originalTenderDetails.tenderName,
    tenderType: originalTenderDetails.tenderType,
    subType: originalTenderDetails.subType,
    lastFour,
    originalTransactionReferences: getOriginalTransactionReferences(transactionId, originalTenderDetails.originalLineReferences),
    originalTenderAmount: originalTenderDetails.originalTenderAmount,
    refundedAmount: originalTenderDetails.refundedAmount,
    previouslyRefundedAmount: originalTenderDetails.previouslyRefundedAmount,
    adjustmentType: originalTenderDetails.adjustmentType,
    adjustmentAmount: originalTenderDetails.adjustmentAmount
  }
}

function getOriginalTransactionReferences(transactionId: string, originalLineReferences: IOriginalLineReference[]): IOriginalTransactionRefundReference[] {
  if (originalLineReferences && originalLineReferences.length > 0) {
    return originalLineReferences.map((originalLineReference: IOriginalLineReference) => {
      const previouslyRefundedAmount: Money = originalLineReference.originalReferencePreviouslyRefundedAmount;
      const originalTenderAmount: Money = originalLineReference.originalReferenceTenderAmount;
      const refundableAmount: Money = originalTenderAmount && previouslyRefundedAmount && originalTenderAmount.minus(previouslyRefundedAmount) || originalTenderAmount;
      return {
          transactionLineReference: {
            transactionId,
            lineNumber: originalLineReference.lineNumber
          },
          refundableAmount
      }
    });
  }
}

function getMappedTenders(originalTender: IOriginalTenderInfo, configuredTender: ITenderType,
                          configurationManager: IConfigurationManager, transactionId: string,
                          originalTransactions: IOriginalTransactionDetailsInfo[], refundDue: Money): IOriginalTender[] {
  const mappedTenders: IOriginalTender[] = [];
  if (!configuredTender || configuredTender.allowRefund) {
    const tenderConfig = configurationManager && configurationManager.getTendersValues();
    const tenderTypeBehaviors = tenderConfig && tenderConfig.tenderBehaviors && tenderConfig.tenderBehaviors.tenderTypeBehaviors;
    const tenderTypeBehavior = tenderTypeBehaviors && tenderTypeBehaviors[originalTender.tenderType];
    const refundTenderTypes = tenderTypeBehavior && tenderTypeBehavior.refundTenderTypes;
    const mappedTenderTypeNames = refundTenderTypes && Object.keys(refundTenderTypes).filter((tenderType: string) => {
      const mappedRefundTenderType: IConfigurationValues = refundTenderTypes[tenderType];
      return mappedRefundTenderType && (!mappedRefundTenderType.hasOwnProperty("allowed") || mappedRefundTenderType["allowed"] === true) &&
          allowMappedTender(tenderType, tenderConfig) &&
          isOriginalTenderAmountAllowed(originalTender, mappedRefundTenderType, originalTransactions, refundDue);
    });
    if (mappedTenderTypeNames && mappedTenderTypeNames.length > 0) {
      const tenderDefinitions = tenderConfig && tenderConfig.tenderDefinitions;
      mappedTenderTypeNames.forEach((tenderType) => {
        // For TenderAuthCategory: None tenders and Value certificate tenders need to have a tenderId, so we'll have one mapped tender for each
        // of those tenders.
        const tenderDefs = tenderDefinitions.filter((tenderDef: any) => tenderDef.tenderType === tenderType &&
            tenderDef.allowRefund && tenderDef.allowRefund.indexOf("WhenMapped") > -1 &&
            (tenderDef.tenderAuthCategory === TenderAuthCategory.None ||
             tenderDef.tenderAuthCategory === TenderAuthCategory.StoredValueCertificateService));
        if (tenderDefs && tenderDefs.length > 0) {
          tenderDefs.forEach((tenderDef: any) => {
            const label = tenderDef.tenderType === TenderTypeName.Cash ?
                I18n.t(mapTenderTypeToI18nCode.get(tenderType), {defaultValue: tenderDef.tenderName}) :
                (tenderDef.tenderLabel && I18n.t(tenderDef.tenderLabel.i18nCode,
                {defaultValue: tenderDef.tenderLabel.default})) || tenderDef.tenderName;
            mappedTenders.push(buildMappedOriginalTender(originalTender, label, tenderDef.tenderType,
                tenderDef.tenderId, tenderDef.tenderAuthCategory, transactionId, originalTransactions,
                tenderDef.subType));
          });
        } else {
          const tenderName = I18n.t(mapTenderTypeToI18nCode.get(tenderType), {defaultValue: tenderType});
          mappedTenders.push(buildMappedOriginalTender(originalTender, tenderName, tenderType, undefined,
              getTenderAuthCategoryFromTenderType(tenderType), transactionId, originalTransactions, undefined));
        }
      });
    }
  }
  return mappedTenders;
}

function allowMappedTender(tenderType: string, tenderConfig: IConfigurationValues): boolean {
  return tenderConfig.tenderDefinitions.some((tender: any) => tender.tenderType === tenderType && tender.allowRefund &&
      tender.allowRefund.indexOf("WhenMapped") > -1);
}

function isOriginalTenderAmountAllowed(originalTender: IOriginalTenderInfo, refundRules: IConfigurationValues,
                                       originalTransactionDetailsInfo: IOriginalTransactionDetailsInfo[],
                                       refundDue: Money): boolean {

  if (refundRules && (refundRules.minimumAmount || refundRules.maximumAmount)) {
    const refundableAmount: Money = getRefundableAmountByTenderType(originalTender.tenderType, originalTransactionDetailsInfo, refundDue);
    const maximumAmount: Money = refundRules.maximumAmount && new Money(refundRules.maximumAmount, refundDue.currency);
    const minimumAmount: Money = refundRules.minimumAmount && new Money(refundRules.minimumAmount, refundDue.currency);
    return refundableAmount && (!maximumAmount || refundableAmount.lte(maximumAmount)) && (!minimumAmount || refundableAmount.gte(minimumAmount));
  }
  return true;
}

function getRefundableAmountByTenderType(tenderType: string, originalTransactionsDetails: IOriginalTransactionDetailsInfo[], refundDue: Money): Money {
  if (refundDue) {
    let totalRefundableAmount = new Money("0", refundDue.currency);
    originalTransactionsDetails.forEach((originalTransaction) => {
      const filteredOriginalTenders = originalTransaction && originalTransaction.originalTenders &&
          originalTransaction.originalTenders.filter((originalTender) => originalTender && originalTender.tenderType === tenderType);
      if (filteredOriginalTenders) {
        filteredOriginalTenders.forEach((tenderDetails) => {
          const tenderRefundableAmount = calculateRefundableAmount(tenderDetails.originalTenderAmount,
              tenderDetails.refundedAmount, originalTransaction.returnTotalAmount && originalTransaction.returnTotalAmount.abs(), refundDue)
          if (tenderRefundableAmount) {
            totalRefundableAmount = totalRefundableAmount.plus(tenderRefundableAmount);
          }
        });
      }
    })

    return totalRefundableAmount;
  }
}

function buildMappedOriginalTender(originalTender: IOriginalTenderInfo, tenderName: string, tenderType: string,
                                   tenderId: string, tenderAuthCategory: TenderAuthCategory, transactionId: string,
                                   originalTransactions: IOriginalTransactionDetailsInfo[],
                                   subType: TenderSubType): IOriginalTender {
  const originalTran = originalTransactions && originalTransactions.find((origTran) =>
      origTran.originalTransactionId === transactionId);
  const returnTotalAmount = originalTran && originalTran.returnTotalAmount && originalTran.returnTotalAmount.abs();
  return {
    showReference: false,
    isMappedTender: true,
    tenderAuthCategory,
    tenderId,
    tenderName,
    tenderType,
    subType,
    originalTransactionReferences: isOriginalTenderFullyRefunded(originalTender, returnTotalAmount) ? undefined :
        getOriginalTransactionReferences(transactionId, originalTender.originalLineReferences),
    originalTenderAmount: originalTender.originalTenderAmount,
    refundedAmount: originalTender.refundedAmount,
    previouslyRefundedAmount: originalTender.previouslyRefundedAmount,
    adjustmentAmount: originalTender.adjustmentAmount,
    adjustmentType: originalTender.adjustmentType
  }
}

function isOriginalTenderFullyRefunded(originalTender: IOriginalTenderInfo, returnTotalAmount: Money): boolean {
  const totalRefundedAmount = originalTender && calculateTotalRefundedAmount(originalTender.previouslyRefundedAmount,
      originalTender.refundedAmount);
  const adjustedOriginalTenderAmount = adjustAmount(originalTender.originalTenderAmount, originalTender.adjustmentAmount);
  return totalRefundedAmount && totalRefundedAmount.gte(adjustedOriginalTenderAmount) ||
      originalTender.refundedAmount.gte(returnTotalAmount);
}

export function isTenderCurrentlyRefunded(originalTender: IOriginalTender, refundableAmount: Money, isMapped?: boolean): boolean {
  const refundedAmount: Money = adjustAmount(originalTender.refundedAmount, originalTender.adjustmentAmount);
  return refundableAmount && (isMapped || originalTender.isMappedTender ? refundableAmount && !refundableAmount.isPositive() : refundedAmount.gte(refundableAmount));
}

export function filterMappedTendersFromGroups(mappedTenders: IOriginalTender[],
                                              activeTenderGroups: ITenderGroup[]): ITenderGroup[] {
  let filteredGroups: ITenderGroup[] = undefined;
  if (mappedTenders && activeTenderGroups && activeTenderGroups.length) {
    filteredGroups = [];
    activeTenderGroups.forEach((group) => {
      const filteredGroup: ITenderGroup = Object.assign({}, group);
      if (group.tenderIds) {
        filteredGroup.tenderIds = group.tenderIds.filter((tenderId) =>
            !mappedTenders.some((mappedTender) => mappedTender.tenderId === tenderId));
      }
      if (!filteredGroup.tenderIds || filteredGroup.tenderIds.length > 0) {
        filteredGroups.push(filteredGroup);
      }
    })
  } else {
    filteredGroups = activeTenderGroups;
  }
  return filteredGroups;
}

export function fullTaxInvoiceText(typeChoicesConfig: any): string {
  return typeChoicesConfig?.fullTaxInvoiceButtonText[I18n.currentLocale()] || I18n.t("fullTaxInvoice");
}

export function isCustomerRequiredForTender(tenderType: string, tenderSubType: string, tenderAuthCategory: TenderAuthCategory,
                                            diContainer: Container, tenderAmount: string, currency: string,
                                            balanceDue: Money, configurationManager: IConfigurationManager): boolean {
  const tendersConfig = configurationManager?.getTendersValues();
  const tenderAuthCategoryDefinition = tendersConfig?.tenderAuthCategoryDefinitions?.[tenderAuthCategory];

  if (tenderAuthCategoryDefinition?.requireCustomerFor) {
    if (tenderSubType) {
      return isCustomerRequiredForState(tenderAuthCategoryDefinition.requireCustomerFor, diContainer, tenderAmount,
          currency, balanceDue, tenderAuthCategory, tenderType, tenderSubType);
    } else {
      return isCustomerRequiredForState(tenderAuthCategoryDefinition.requireCustomerFor, diContainer, tenderAmount,
          currency, balanceDue, tenderAuthCategory, tenderType, ValueCertSubType.StoreCredit) ||
          isCustomerRequiredForState(tenderAuthCategoryDefinition.requireCustomerFor, diContainer, tenderAmount,
              currency, balanceDue, tenderAuthCategory, tenderType, ValueCertSubType.GiftCertificate);
    }
  } else {
    const matchingTenderDefinitions = tendersConfig?.tenderDefinitions?.filter((tenderDef: any) => {
      return tenderDef.tenderType === tenderType && (!tenderSubType || tenderDef.subType === tenderSubType) &&
          tenderDef.tenderAuthCategory === tenderAuthCategory;
    });
    return !!matchingTenderDefinitions?.find((tender: any) => {
       return tender.requireCustomerFor && isCustomerRequiredForState(tender.requireCustomerFor, diContainer, tenderAmount,
        currency, balanceDue, tenderAuthCategory, tenderType, tender.subType);
    });
  }
}

export function isCustomerRequiredForChangeTender(changeTender: TenderType,
                                                  configurationManager: IConfigurationManager): boolean {
  const tendersConfig = configurationManager?.getTendersValues();
  const tenderAuthCategoryDefinition = tendersConfig?.tenderAuthCategoryDefinitions?.[changeTender.tenderAuthCategory];
  let customerRequired: boolean;
  if (tenderAuthCategoryDefinition?.requireCustomerFor) {
    customerRequired = !!(tenderAuthCategoryDefinition.requireCustomerFor.indexOf(TENDER_CHANGE_LINE_TYPE) > -1);
  } else {
    const tenderConfig = tendersConfig?.tenderDefinitions?.find((tenderDef: any) => tenderDef.tenderId === changeTender.id);
    customerRequired = !!(tenderConfig?.requireCustomerFor?.indexOf(TENDER_CHANGE_LINE_TYPE) > -1);
  }
  return customerRequired;
}

function isCustomerRequiredForState(requireCustomerFor: string[],
                                    diContainer: Container,
                                    tenderAmount: string,
                                    currency: string,
                                    balanceDue: Money,
                                    tenderAuthCategory: TenderAuthCategory,
                                    tenderType: string,
                                    tenderSubType?: string): boolean {
  const changeTenders = getChangeTenders(diContainer, currency, tenderAuthCategory, tenderType, tenderSubType,
      balanceDue, new Money(tenderAmount, currency));
    if (tenderAmount && balanceDue && !balanceDue.isNegative() && isChangeDue(tenderAmount, currency, balanceDue) &&
        changeTenders?.length === 1) {
      if (requireCustomerFor && requireCustomerFor.indexOf(TENDER_CHANGE_LINE_TYPE) > -1) {
        return true;
      }
    }
    const lineType = balanceDue && balanceDue.isNegative() ? TENDER_REFUND_LINE_TYPE : TENDER_PAYMENT_LINE_TYPE;
    return !!(requireCustomerFor && requireCustomerFor.indexOf(lineType) > -1);
  }

export function isValueCertificatePartialRedeemEnabled(configurationManager: IConfigurationManager): boolean {
  const functionalBehaviors: IConfigurationValues = configurationManager?.getFunctionalBehaviorValues();
  return functionalBehaviors?.valueCertificateServiceBehaviors?.certificateInquiry?.enablePartialRedemptions;
}

export function isChangeDue(tenderAmount: string, currency: string, balanceDue: Money): boolean {
  const changeDue = balanceDue.minus(new Money(tenderAmount, currency));
  return changeDue.lt(new Money("0", currency))
}

export const isForeignTenderGroup = (group: ITenderGroup, activeTenders: ITenderType[]): boolean => {
  const { tenderIds } = group;
  const tendersInGroup = activeTenders?.filter((tender: ITenderType) => tenderIds?.includes(tender.tenderId));

  if (tendersInGroup?.length > 0) {
    return tendersInGroup.every((tender: ITenderType) => tender.isForeignTender);
  }

  return false;
};

export const exchangeRatesConfiguredAndDefined = (
  group: ITenderGroup,
  activeTenders: ITenderType[],
  exchangeRates: ExchangeRate[]
): boolean => {
  const { tenderIds } = group;
  const tendersInGroup = activeTenders?.filter((tender: ITenderType) => tenderIds?.includes(tender.tenderId));
  const foreignTenders = tendersInGroup?.filter((tender: ITenderType) => tender.isForeignTender);

  const exchangeRatesConfigured = exchangeRates?.filter((exchangeRate: ExchangeRate) => {
    return foreignTenders.some((tender: ITenderType) => tender.currencyCode === exchangeRate.from);
  });

  return exchangeRatesConfigured?.length > 0;
}

export function getMappedTenderType(originalTender: IOriginalTender): string {
  // FIXME: Need to provide a better way to indicate that a tender is mapped other than simply providing tenderType
  return originalTender?.isMappedTender && originalTender?.tenderType;
}


export function getAmount(amount: string): string {
  if (amount.trim().length > 0) {
    return MaskService.toRawValue("money", amount, this.currencyMask);
  }

  return "0";
}
