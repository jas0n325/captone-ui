import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { ITenderGroup, TenderAuthCategory, TenderDenominationRoundings } from "@aptos-scp/scp-component-store-selling-features";
import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";

import I18n from "../../../config/I18n";
import { AppState, BusinessState } from "../../reducers";
import Theme from "../../styles";
import { IOriginalTender, IOriginalTransactionDetails, ITenderType } from './PaymentDevicesUtils';
import { paymentOptionsStyles } from "./styles";
import TenderButtons from './TenderButtons';

interface StateProps {
  configurationManager: IConfigurationManager;
}

interface Props extends StateProps {
  retryOnlyAuthMode?: boolean;
  onOfflineAuthorization: () => void;
  cancelOffline: () => void;
  onRetry: () => void;
  onGiftCard?: () => void;
  onApplyValueCertificatePayment?: () => void;
  onWallet?: () => void;
  onLoyaltyVoucher?: (tenderName: string) => void;
  cancelTendersMenu?: () => void;
  showOtherTenderOptions?: boolean;
  otherTenders?: TenderAuthCategory[];
  giftCardDisabled?: boolean;
  walletDisabled?: boolean;
  storeCreditIsDisabled?: boolean;
  valueCertificateTenderName?: string;
  moreTenderButtons?: JSX.Element[];
  activeTenderGroups?: ITenderGroup[];
  disablePaymentScreenButtons?: boolean;
  businessState?: BusinessState;
  stateValues?: Map<string, any>;
  cardsAreDisabled?: boolean;
  giftCardsAreDisabled?: boolean;
  walletsAreDisabled?: boolean;
  nonIntegratedAreDisabled?: boolean;
  onApplyPayment?: () => void;
  valueCertificatePluralTenderName?: string;
  originalTransactionDetails?: IOriginalTransactionDetails[];
  originalTenders?: IOriginalTender[];
  originalUnreferencedTenders?: IOriginalTender[];
  getRoundingBalanceDueTender?: (tenderId: string, amount?: Money) => TenderDenominationRoundings;
  activeTenders?: ITenderType[];
  exchangeRates?: ExchangeRate[];
}

class PaymentOptions extends React.Component<Props> {
  private paymentOptionsMessage: string;

  private styles: any;

  constructor(props: Props) {
    super(props);

    if (!this.props.retryOnlyAuthMode) {
      const functionalBehaviorValues = props.configurationManager.getFunctionalBehaviorValues();

      const retryOrCallForAuthMessageTranslations = functionalBehaviorValues.offlineAuthorizationBehaviors &&
          functionalBehaviorValues.offlineAuthorizationBehaviors.retryOrCallForAuthorizationMessage;

      this.paymentOptionsMessage = retryOrCallForAuthMessageTranslations &&
          retryOrCallForAuthMessageTranslations[I18n.currentLocale()] || I18n.t("offlineWarning");
    } else {
      this.paymentOptionsMessage = I18n.t("paymentNotProcessedTryAgain");
    }

    this.styles = Theme.getStyles(paymentOptionsStyles());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        {
          this.props.showOtherTenderOptions &&
          <View style={this.styles.mainArea}>
            {
              <TenderButtons
                styles={this.styles}
                activeTenderGroups={this.props.activeTenderGroups}
                disablePaymentScreenButtons={this.props.disablePaymentScreenButtons}
                businessState={this.props.businessState}
                stateValues={this.props.stateValues}
                cardsAreDisabled={this.props.cardsAreDisabled}
                giftCardsAreDisabled={this.props.giftCardsAreDisabled}
                storeCreditIsDisabled={this.props.storeCreditIsDisabled}
                walletsAreDisabled={this.props.walletsAreDisabled}
                nonIntegratedAreDisabled={this.props.nonIntegratedAreDisabled}
                onApplyPayment={this.props.onApplyPayment.bind(this)}
                onApplyValueCertificatePayment={this.props.onApplyValueCertificatePayment.bind(this)}
                onApplyWalletPayment={this.props.onWallet.bind(this)}
                onLoyaltyVoucher={this.props.onLoyaltyVoucher.bind(this)}
                onApplyGCPayment={this.props.onGiftCard.bind(this)}
                valueCertificateTenderName={this.props.valueCertificateTenderName}
                valueCertificatePluralTenderName={this.props.valueCertificatePluralTenderName}
                getRoundingBalanceDueTender={this.props.getRoundingBalanceDueTender.bind(this)}
                displayMoreTenderButtons={true}
                originalTransactionDetails={this.props.originalTransactionDetails}
                originalTenders={this.props.originalTenders}
                originalUnreferencedTenders={this.props.originalUnreferencedTenders}
                activeTenders={this.props.activeTenders}
                configuration={this.props.configurationManager}
                exchangeRates={this.props.exchangeRates}
              />
            }
            <TouchableOpacity
              style={this.styles.btnSeconday}
              onPress={this.props.cancelTendersMenu}
            >
              <Text style={this.styles.btnSecondayText} adjustsFontSizeToFit={true} numberOfLines={1}>
                {I18n.t("cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        }
        {
          !this.props.showOtherTenderOptions &&
          <View style={this.styles.mainArea}>
            <Text style={this.styles.mainText}>
              {this.paymentOptionsMessage}
            </Text>
            <TouchableOpacity style={this.styles.button} onPress={this.props.onRetry} >
              <Text style={this.styles.btnPrimaryText} adjustsFontSizeToFit={true} numberOfLines={1}>
                {I18n.t("retry")}
              </Text>
            </TouchableOpacity>
            {
              !this.props.retryOnlyAuthMode &&
              <TouchableOpacity style={this.styles.button} onPress={this.props.onOfflineAuthorization} >
                <Text style={this.styles.btnPrimaryText} adjustsFontSizeToFit={true} numberOfLines={1}>
                  {I18n.t("offlineAuthorization")}
                </Text>
              </TouchableOpacity>
            }
            <TouchableOpacity style={this.styles.btnSeconday} onPress={this.props.cancelOffline} >
              <Text style={this.styles.btnSecondayText} adjustsFontSizeToFit={true} numberOfLines={1}>
                {I18n.t("cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    configurationManager: state.settings.configurationManager
  };
};

export default connect(mapStateToProps)(PaymentOptions);
