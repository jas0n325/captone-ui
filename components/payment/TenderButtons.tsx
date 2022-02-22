import * as _ from "lodash";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  ExchangeRateEntryType,
  ILabel,
  ITenderGroup,
  TenderAuthCategory,
  TenderDenominationRoundings
} from "@aptos-scp/scp-component-store-selling-features";
import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";
import { TenderSubType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import { BusinessState } from "../../reducers";
import Theme from "../../styles";
import { getTestIdProperties, printAmountDue } from "../common/utilities";
import {
  exchangeRatesConfiguredAndDefined,
  filterMappedTendersFromGroups,
  getOriginalReferencedTenderButtonsCount,
  getOriginalTenderLabel,
  getOriginalTenderRefundableAmount,
  getRoundedBalanceLabel,
  IOriginalTender,
  IOriginalTransactionDetails,
  isForeignTenderGroup,
  isRefund,
  isTenderCurrentlyRefunded,
  ITenderType,
  MAX_TENDER_BUTTONS
} from "./PaymentDevicesUtils";
import { paymentStyles } from "./tablet/styles";

interface Props {
  styles: any;
  activeTenderGroups: ITenderGroup[];
  disablePaymentScreenButtons: boolean;
  businessState: BusinessState;
  allowsRefundOriginalTenders?: ITenderType[];
  stateValues: Map<string, any>;
  cardsAreDisabled: boolean;
  giftCardsAreDisabled: boolean;
  storeCreditIsDisabled: boolean;
  walletsAreDisabled: boolean;
  nonIntegratedAreDisabled: boolean;
  onApplyPayment:
    (tenderAuthCategory: string, tenderIds: string[], roundedAmount?: Money, originalTender?: IOriginalTender) => void;
  onApplyWalletPayment: (originalTender: IOriginalTender) => void;
  onLoyaltyVoucher: (tenderName: string) => void;
  showOtherTendersMenu?: boolean;
  onApplyOtherPayment?: () => void;
  onApplyGCPayment: (originalTender: IOriginalTender) => void;
  onApplyValueCertificatePayment: (originalTender: IOriginalTender, subType: TenderSubType) => void;
  valueCertificateTenderName: string;
  valueCertificatePluralTenderName: string;
  configuration?: IConfigurationManager;
  getRoundingBalanceDueTender: (tenderId: string, amount?: Money) => TenderDenominationRoundings;
  displayMoreTenderButtons: boolean;
  originalTransactionDetails: IOriginalTransactionDetails[];
  originalTenders?: IOriginalTender[];
  originalUnreferencedTenders?: IOriginalTender[];
  testID?: string;
  foreignTenderType?: ITenderType;
  exchangeRates?: ExchangeRate[];
  cancelForeignTender?: () => void;
  activeTenders: ITenderType[];
}

interface State {
  activeTenderGroups: ITenderGroup[]
}

export default class TenderButtons extends React.PureComponent<Props, State> {
  private moreTendersNeeded: boolean = false;
  private maxTenderButtons: number;
  private originalTenderButtonsCount: number;
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(paymentStyles());
    const filteredGroups = this.updateVariablesAndGroups(props);

    this.state = {
      activeTenderGroups: filteredGroups
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.foreignTenderType !== prevProps.foreignTenderType ||
          (this.props.originalUnreferencedTenders.length !== prevProps.originalUnreferencedTenders.length)) {
      const filteredGroups = this.updateVariablesAndGroups(this.props);
      this.setState({ activeTenderGroups: filteredGroups });
    }
  }

  public updateVariablesAndGroups(props: Props): ITenderGroup[] {
    const mappedTenders = props.originalUnreferencedTenders &&
        props.originalUnreferencedTenders.filter((tender) =>  tender.isMappedTender);
    const filteredGroups: ITenderGroup[] = this.getFilteredGroups(props, mappedTenders);

    this.originalTenderButtonsCount = isRefund(props.stateValues) &&
        getOriginalReferencedTenderButtonsCount(props.originalTenders) + props.originalUnreferencedTenders.length || 0;
    this.maxTenderButtons = this.originalTenderButtonsCount + 1 > MAX_TENDER_BUTTONS ?
        this.originalTenderButtonsCount + 1 : MAX_TENDER_BUTTONS;
    this.moreTendersNeeded = this.getMoreTendersNeeded(filteredGroups);

    return filteredGroups;
  }

  public getFilteredGroups(props: Props, mappedTenders: IOriginalTender[]): ITenderGroup[] {
    const activeTenderGroups = props.activeTenderGroups.filter((group: ITenderGroup) => {
      return (props.foreignTenderType && group.tenderIds?.includes(props.foreignTenderType.tenderId)) ||
          !props.foreignTenderType;
    });
    return filterMappedTendersFromGroups(mappedTenders, activeTenderGroups);
  }

  public getMoreTendersNeeded(filteredGroups: ITenderGroup[]): boolean {
    return filteredGroups && filteredGroups.length + this.originalTenderButtonsCount > this.maxTenderButtons;
  }

  public render(): JSX.Element {
    return (
      <View style={this.props.styles.paymentMethodContainer}>
        { this.props.displayMoreTenderButtons &&
          this.getMoreTenderButtons()
        }
        { !this.props.displayMoreTenderButtons &&
          <View style={this.props.styles.paymentMethodContainer}>
            { isRefund(this.props.stateValues) && this.props.originalTenders && this.props.originalTenders.length > 0 &&
              this.renderOriginalTenderButtonsSection()
            }
            { this.state.activeTenderGroups && this.state.activeTenderGroups.length > 0 &&
              this.getMainTenderButtons()
            }
            { this.moreTendersNeeded &&
              <TouchableOpacity
                {...getTestIdProperties(this.props.testID, "otherTenders-button")}
                style={[this.props.styles.paymentMethodButton, this.otherTendersAreDisabled && this.props.styles.btnDisabled]}
                onPress={() => this.props.onApplyOtherPayment()}
                disabled={this.otherTendersAreDisabled}
              >
                <Text
                  style={[this.props.styles.paymentButtonTitle, this.otherTendersAreDisabled &&
                    this.props.styles.btnTextDisabled]}
                  {...getTestIdProperties(this.props.testID, "otherTenders-text")}>
                  {I18n.t("otherTenders")}
                </Text>
              </TouchableOpacity>
            }
          </View>
        }
        {
          Theme.isTablet && this.props.foreignTenderType &&
          <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.cancelButton]}
            onPress={this.props.cancelForeignTender}
          >
            <Text style={this.styles.btnSecondayText} adjustsFontSizeToFit={true} numberOfLines={1}>
              {I18n.t("cancel")}
            </Text>
          </TouchableOpacity>
        }
      </View>
    );
  }

  private renderOriginalTenderButtonsSection(): JSX.Element {
    return (
      <View style={this.props.styles.suggestedTendersSection}>
        {this.props.originalTransactionDetails &&
          this.props.originalTransactionDetails.map((origTran) => {
            const referencedTenderFound: boolean = origTran.originalTenders && origTran.originalTenders.findIndex((origTender) => {
              return origTender.showReference;
            }) !== -1;
            if (referencedTenderFound) {
              return (
                <View style={this.props.styles.originalReferencedTenderSection}>
                  <Text style={this.props.styles.sectionTitleText} numberOfLines={1} adjustsFontSizeToFit={true}>
                    {I18n.t("return")}: {origTran.originalTransactionReferenceNumber}
                  </Text>
                  { origTran.originalTenders && origTran.originalTenders.map((tender) => {
                    if (tender.showReference) {
                      return this.renderOriginalTenderButton(tender);
                    }
                  })}
                </View>
              );
            }
          })
        }
        { this.props.originalUnreferencedTenders &&
          this.props.originalUnreferencedTenders.map((unreferencedTender) => {
            return this.renderOriginalTenderButton(unreferencedTender);
          })
        }
      </View>

    );
  }

  private getMainTenderButtons(): JSX.Element[] {
    if (!this.props.foreignTenderType) {
      const mainButtonsCount: number = this.maxTenderButtons - (this.moreTendersNeeded ? 1 : 0) - this.originalTenderButtonsCount;
      const mainTenderGroups: ITenderGroup[] = this.state.activeTenderGroups &&
          this.state.activeTenderGroups.length >= mainButtonsCount &&
          [...this.state.activeTenderGroups].splice(0, mainButtonsCount) || this.state.activeTenderGroups;

      if (mainTenderGroups && mainTenderGroups.length > 0) {
        return mainTenderGroups.map((group) => {
          return this.getTenderButtonByGroup(group);
        });
      }
    } else {
      const foreignTenderGroups: ITenderGroup[] = this.state.activeTenderGroups.filter((group) => group.tenderIds?.includes(this.props.foreignTenderType.tenderId));
      return [this.getTenderButtonByGroup(foreignTenderGroups[0])];
    }
  }

  private getMoreTenderButtons(): JSX.Element[] {
    const mainButtonsCount: number = this.maxTenderButtons - (this.moreTendersNeeded ? 1 : 0) -  this.originalTenderButtonsCount;

    if (this.moreTendersNeeded) {
      const moreTenderGroups: ITenderGroup[] = this.state.activeTenderGroups && [...this.state.activeTenderGroups];
      if (moreTenderGroups && moreTenderGroups.length >= mainButtonsCount) {
        moreTenderGroups.splice(0, mainButtonsCount);
      }

    if (moreTenderGroups && moreTenderGroups.length > 0) {
        return moreTenderGroups.map((group) => {
          return this.getTenderButtonByGroup(group, undefined, true);
        });
      }
    }
  }

  private get otherTendersAreDisabled(): boolean {
    return !this.moreTendersNeeded || this.props.disablePaymentScreenButtons;
  }

  private renderOriginalTenderButton(originalTender: IOriginalTender): JSX.Element {
    return this.getTenderButtonByGroup(undefined, originalTender);
  }

  private getFirstTenderId(group: ITenderGroup): string  {
    return group.tenderIds && group.tenderIds.length === 1 && group.tenderIds[0];
  }

  private getTenderLabel(tenderGroup: ITenderGroup, defaultText: string): string {

    if (tenderGroup && tenderGroup.groupLabel) {
      return I18n.t(tenderGroup.groupLabel.i18nCode,
          {defaultValue: tenderGroup.groupLabel.default});
    }
    return defaultText;
  }

  private getSecondaryLabel(originalTender: IOriginalTender, balanceDue: Money, refundableAmount: Money,
                            roundedBalanceDueTender?: TenderDenominationRoundings): string {
    if (roundedBalanceDueTender && roundedBalanceDueTender.roundedValue.ne(balanceDue)) {
      return getRoundedBalanceLabel(roundedBalanceDueTender);
    }
    if (originalTender && refundableAmount && balanceDue &&
        (originalTender.showReference || originalTender.isMappedTender && balanceDue.ne(refundableAmount)
        && refundableAmount.ne(new Money("0", refundableAmount.currency)) &&
        !isTenderCurrentlyRefunded(originalTender, refundableAmount))) {
      return printAmountDue(refundableAmount);
    }
    return undefined;
  }

  private getTenderButton(disabled: boolean, onPress: () => void, textLabel: string,
                          isOtherTender?: boolean, secondRowLabel?: string): JSX.Element {

    const buttonStyle = isOtherTender ?
        [this.props.styles.button, disabled && this.props.styles.btnDisabled] :
        [secondRowLabel ? this.props.styles.paymentMethodButtonDetailed : this.props.styles.paymentMethodButton,
        disabled && this.props.styles.btnDisabled];
    const textStyle = isOtherTender ?
        [this.props.styles.btnPrimaryText, disabled && this.props.styles.btnTextDisabled] :
        [this.props.styles.paymentButtonTitle, disabled && this.props.styles.btnTextDisabled];

    return <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled}
            {...getTestIdProperties(this.props.testID, `${textLabel}-button`)}
          >
            <Text
              style={textStyle}
              {...getTestIdProperties(this.props.testID, `${textLabel}-label-text`)}>
                {textLabel}
            </Text>
            {secondRowLabel &&
              <Text
                style={[this.props.styles.paymentButtonSubTitle, disabled && this.props.styles.btnTextDisabled]}
                {...getTestIdProperties(this.props.testID, `${textLabel}-secondRowlabel-text`)}>
                  {secondRowLabel}
              </Text>
            }
          </TouchableOpacity>;
  }

  // tslint:disable-next-line: cyclomatic-complexity
  private getTenderButtonByGroup(group: ITenderGroup, originalTender?: IOriginalTender, isOtherTender: boolean = false): JSX.Element {

    let tenderAuthCategory: TenderAuthCategory;
    let tenderIds: string[];
    let label;
    let secondaryLabel;
    let defaultDisabled;
    let roundedBalanceDueTender: TenderDenominationRoundings;
    let subType: TenderSubType;
    const activeTenders = Object.assign([], this.props.activeTenders);
    if (group) {
      tenderAuthCategory = group.tenderAuthCategory;
      tenderIds = group.tenderIds;
      subType = group.subType;
      const firstTenderId: string = this.getFirstTenderId(group);
      roundedBalanceDueTender = firstTenderId &&
          this.props.getRoundingBalanceDueTender(firstTenderId);
      const tenderDefinitions = this.props.configuration?.getTendersValues()?.tenderDefinitions;
      const isForeignTender = tenderDefinitions?.find((tender: any) => tender.tenderId === firstTenderId)?.isForeignTender;
      secondaryLabel = isForeignTender ? undefined : roundedBalanceDueTender && getRoundedBalanceLabel(roundedBalanceDueTender);
      label = this.getTenderLabel(group, this.getDefaultLabelByCategory(tenderAuthCategory));

      if (this.props.foreignTenderType) {
        roundedBalanceDueTender = this.props.getRoundingBalanceDueTender(this.props.foreignTenderType.tenderId);
        tenderIds = group.tenderIds.filter((tenderId: string) => tenderId === this.props.foreignTenderType.tenderId);
        const configLabel: ILabel = this.props.foreignTenderType && this.props.foreignTenderType.tenderLabel;
        secondaryLabel = roundedBalanceDueTender && getRoundedBalanceLabel(roundedBalanceDueTender);
        label = configLabel && I18n.t(configLabel.i18nCode, {defaultValue: configLabel.default});
      } else if (isForeignTenderGroup(group, activeTenders) &&
          !exchangeRatesConfiguredAndDefined(group, activeTenders, this.props.exchangeRates)) {
        const functionalBehavior = this.props.configuration?.getFunctionalBehaviorValues();
        const exchangeRateManualEntryAllowed = functionalBehavior?.foreignCurrencyBehaviors?.allowExchangeRateEntry;

        secondaryLabel = I18n.t("noRates");
        defaultDisabled = !exchangeRateManualEntryAllowed || exchangeRateManualEntryAllowed === ExchangeRateEntryType.Never;
      }
    } else {
      const balanceDue: Money = this.props.stateValues.get("transaction.balanceDue").abs();
      tenderAuthCategory = originalTender.tenderAuthCategory;
      tenderIds = [originalTender.tenderId];
      subType = originalTender.subType;
      const refundableAmount: Money = (originalTender.showReference || originalTender.isMappedTender) &&
          getOriginalTenderRefundableAmount(originalTender, balanceDue, this.props.originalTransactionDetails);
      roundedBalanceDueTender = originalTender.tenderId &&
          this.props.getRoundingBalanceDueTender(originalTender.tenderId, refundableAmount);
      //If rounded value is zero, then don't return a button for this tender
      const roundedBalanceZero: boolean = _.get(roundedBalanceDueTender, "roundedValue") && roundedBalanceDueTender.roundedValue.isZero();
      if (roundedBalanceZero && (!originalTender.refundedAmount || originalTender.refundedAmount.isZero())) {
        return undefined;
      }
      label = this.getTenderLabel(undefined, getOriginalTenderLabel(originalTender));
      secondaryLabel = this.getSecondaryLabel(originalTender, balanceDue, refundableAmount, roundedBalanceDueTender);
      defaultDisabled = roundedBalanceZero || isTenderCurrentlyRefunded(originalTender, refundableAmount);
    }

    switch (tenderAuthCategory) {
      case TenderAuthCategory.PaymentDevice:
        return this.getTenderButton(this.props.cardsAreDisabled || defaultDisabled,
            () => this.props.onApplyPayment(TenderAuthCategory.PaymentDevice, undefined, undefined, originalTender),
            label, isOtherTender, secondaryLabel);
      case TenderAuthCategory.NonIntegratedDevice:
        return this.getTenderButton(this.props.nonIntegratedAreDisabled || defaultDisabled,
            () => this.props.onApplyPayment(TenderAuthCategory.NonIntegratedDevice, undefined, undefined, originalTender),
            label, isOtherTender, secondaryLabel);
      case TenderAuthCategory.Wallet:
        return this.getTenderButton(this.props.walletsAreDisabled || defaultDisabled, () => this.props.onApplyWalletPayment(originalTender),
            label, isOtherTender, secondaryLabel);
      case TenderAuthCategory.GiftDevice:
      case TenderAuthCategory.StoredValueCardService:
        return this.getTenderButton(this.props.giftCardsAreDisabled || defaultDisabled, () => this.props.onApplyGCPayment(originalTender),
            label, isOtherTender, secondaryLabel);
      case TenderAuthCategory.StoredValueCertificateService:
        return this.getTenderButton(this.props.storeCreditIsDisabled || defaultDisabled, () => this.props.onApplyValueCertificatePayment(originalTender, subType),
            label, isOtherTender, secondaryLabel);
      case TenderAuthCategory.LoyaltyVoucherService:
        return this.getTenderButton(this.props.disablePaymentScreenButtons || defaultDisabled, () =>
            this.props.onLoyaltyVoucher(this.props.valueCertificateTenderName),
            this.getTenderLabel(group, this.props.valueCertificateTenderName), isOtherTender);
      default:
        return this.getTenderButton(this.props.disablePaymentScreenButtons || defaultDisabled, () => this.props.onApplyPayment(
            tenderAuthCategory, tenderIds,
            roundedBalanceDueTender && roundedBalanceDueTender.roundedValue ?
            roundedBalanceDueTender.roundedValue : undefined, originalTender),
            label, isOtherTender, secondaryLabel);
    }
  }

  private getDefaultLabelByCategory(tenderAuthCategory: TenderAuthCategory): string {
    switch (tenderAuthCategory) {
      case TenderAuthCategory.PaymentDevice:
        return I18n.t("card");
      case TenderAuthCategory.NonIntegratedDevice:
        return I18n.t("nonIntegrated");
      case TenderAuthCategory.Wallet:
        return I18n.t("wallets");
      case TenderAuthCategory.GiftDevice:
      case TenderAuthCategory.StoredValueCardService:
        return I18n.t("giftCard");
      case TenderAuthCategory.StoredValueCertificateService:
        return I18n.t("valueCertificate");
      case TenderAuthCategory.LoyaltyVoucherService:
        return this.props.valueCertificateTenderName;
      default:
        return I18n.t("cash");
    }
  }
}
