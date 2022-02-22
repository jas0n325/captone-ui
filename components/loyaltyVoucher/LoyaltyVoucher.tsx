import * as React from "react";
import { FlatList, Text, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";
import {
  ILoyaltyVoucher,
  ITenderDisplayLine,
  LoyaltyVoucherStatus
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { LoyaltyVoucherState } from "../../reducers";
import Theme from "../../styles";
import Header from "../common/Header";
import LoyaltyResultLine from "../common/LoyaltyVoucherLine";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import { loyaltyResultsStyles } from "./styles";

interface Props {
  tenderName: string;
  pluralTenderName: string;
  totalDue: Money;
  tenderLines: ITenderDisplayLine[];
  loyaltyVoucherState: LoyaltyVoucherState;
  onApply: (item: ILoyaltyVoucher) => void;
  onExit: () => void;
}

interface State {
  loyaltyVouchers: ILoyaltyVoucher[];
}

export default class LoyaltyVoucher extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(loyaltyResultsStyles());
    this.state = {
      loyaltyVouchers: props.loyaltyVoucherState.loyaltyVouchers || []
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.loyaltyVoucherState.inProgress && prevProps.loyaltyVoucherState.inProgress) {
      this.setState({ loyaltyVouchers: this.props.loyaltyVoucherState.loyaltyVouchers });
    } else if (this.props.tenderLines.length !== prevProps.tenderLines.length) {
      this.setState({ loyaltyVouchers: this.getLoyaltyVouchers(this.props) });
    }
  }

  public render(): JSX.Element {
    let errorMessage: string;
    const tenderName = this.props.tenderName;
    const pluralTenderName = this.props.pluralTenderName;
    if (this.props.loyaltyVoucherState.error) {
      const { error } = this.props.loyaltyVoucherState;
      if (error instanceof PosBusinessError && error.localizableMessage) {
        errorMessage = I18n.t(error.localizableMessage.i18nCode, { tenderName: pluralTenderName.toLowerCase() });
      } else {
        errorMessage = I18n.t("loyaltyVoucherDefaultErrorMessage", { tenderName });
      }
    }

    const loyaltyVouchers: ILoyaltyVoucher[] = this.state.loyaltyVouchers;
    let voucherTotal: Money = new Money("0", this.props.totalDue.currency);
    this.props.tenderLines.forEach((tenderLine) => {
      if (tenderLine.valueCertificateNumber) {
        voucherTotal = voucherTotal.plus(tenderLine.tenderAmount);
      }
    });
    return (
      <View style={this.styles.root}>
        <Header
          isVisibleTablet
          title={this.props.pluralTenderName}
          backButton={{name: "Back", action: this.props.onExit}}
        />
        {
          (this.props.loyaltyVoucherState.inProgress ||
              (this.props.loyaltyVoucherState.error || !loyaltyVouchers.length)) &&
          <View style={this.styles.fill}>
            <View style={this.styles.subTitleArea}>
              <Text style={this.styles.subTitleText}>
                {I18n.t("loyaltyVoucherResults", { tenderName: pluralTenderName.toUpperCase() })}
              </Text>
            </View>
            <View style={this.styles.loyaltyErrorArea}>
              {this.props.loyaltyVoucherState.inProgress &&
                <Text style={this.styles.titleText}>
                  {I18n.t("searchingLoyaltyVouchers", { tenderName: pluralTenderName.toLowerCase() })}
                </Text>
              }
              {!this.props.loyaltyVoucherState.inProgress &&
              <View>
                <Text style={this.styles.titleText}>
                  {I18n.t("loyaltyVouchersNotFound", { tenderName: pluralTenderName.toLowerCase() })}
                </Text>
                { errorMessage &&
                <Text style={this.styles.subTitleText}>{errorMessage}</Text>
                }
                { !errorMessage &&
                <Text style={this.styles.subTitleText}>
                  {I18n.t("loyaltyVouchersHelpText", { tenderName: pluralTenderName.toLowerCase() })}
                </Text>
                }
              </View>
              }
            </View>
          </View>
        }
        {!this.props.loyaltyVoucherState.inProgress && !this.props.loyaltyVoucherState.error &&
        loyaltyVouchers.length > 0 &&
          <View style={this.styles.loyaltyVouchers}>
            <View style={this.styles.totalArea}>
              <View style={this.styles.totalLine}>
                <Text style={this.styles.totalText}>
                  {I18n.t("totalDueCaps")}
                </Text>
                <Text style={this.styles.totalText}>
                {this.props.totalDue && this.props.totalDue.toLocaleString(getStoreLocale(),
                  getStoreLocaleCurrencyOptions())}
                </Text>
              </View>
              <View style={this.styles.totalLine}>
                <Text style={this.styles.totalText} numberOfLines={1} ellipsizeMode={"middle"}>
                  {I18n.t("loyaltyVoucherTotal", { tenderName: tenderName.toUpperCase() })}
                </Text>
                <Text style={this.styles.totalText}>
                {voucherTotal.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
                </Text>
              </View>
            </View>
            <View style={this.styles.subTitleArea}>
              <Text style={this.styles.subTitleText}>
                {I18n.t("loyaltyVoucherResults", { tenderName: pluralTenderName.toUpperCase() })}
              </Text>
            </View>
            <FlatList
              data={loyaltyVouchers}
              keyExtractor={(item: ILoyaltyVoucher) => item.voucherKey }
              renderItem={
                ({ item }) => <LoyaltyResultLine loyaltyVoucher={item} onApply={() => this.props.onApply(item)} />
              }
            />
          </View>
        }
      </View>
    );
  }

  private getLoyaltyVouchers(props: Props): ILoyaltyVoucher[] {
    return props.loyaltyVoucherState.loyaltyVouchers.filter((voucher: ILoyaltyVoucher) =>
        voucher.status === LoyaltyVoucherStatus.active ||
        props.tenderLines.find((tenderLine) => tenderLine.valueCertificateNumber === voucher.voucherKey))
        .map((voucher: ILoyaltyVoucher) => {
          if (props.tenderLines.find((tenderLine) => tenderLine.valueCertificateNumber === voucher.voucherKey)) {
            return Object.assign({}, voucher, { status: LoyaltyVoucherStatus.consumed });
          } else {
            return voucher;
          }
        });
  }
}
