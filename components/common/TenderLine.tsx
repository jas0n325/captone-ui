import * as React from "react";
import { Alert, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  ITenderDisplayLine,
  TenderType,
  TENDER_CHANGE_LINE_TYPE,
  TENDER_REFUND_LINE_TYPE,
  VOID_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { ITenderLine } from "@aptos-scp/scp-types-commerce-transaction";
import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";

import I18n from "../../../config/I18n";
import { ActionCreator, dataEvent, DataEventType, IUIData } from "../../actions";
import Theme from "../../styles";
import { AppState, BusinessState, SettingsState } from "../../reducers";
import { getActiveTenders } from '../payment/PaymentDevicesUtils';
import { tenderLineStyles } from "./styles";
import { printAmount } from "./utilities";
import VectorIcon from "./VectorIcon";

interface StateProps {
  businessState: BusinessState;
  exchangeRates: ExchangeRate[];
  settings: SettingsState;
}

interface DispatchProps {
  dataEvent: ActionCreator;
}

export interface Props extends StateProps, DispatchProps {
  allowVoidTender: boolean;
  line: ITenderDisplayLine | ITenderLine;
  style?: ViewStyle;
}

export interface State {}

class TenderLine extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(tenderLineStyles());
  }

  public getTenderAmount(): string {
    const line: ITenderDisplayLine & ITenderLine = this.props.line as ITenderDisplayLine & ITenderLine;
    if (line.lineType === TENDER_REFUND_LINE_TYPE || line.lineType === TENDER_CHANGE_LINE_TYPE ) {
      return `(${printAmount(new Money(this.props.line.tenderAmount.amount, this.props.line.tenderAmount.currency))})`;
    } else {
      return printAmount(new Money(this.props.line.tenderAmount.amount, this.props.line.tenderAmount.currency));
    }
  }

  public getForeignTenderAmount(): string {
    const line: ITenderDisplayLine & ITenderLine = this.props.line as ITenderDisplayLine & ITenderLine;
    const amount: string = printAmount(new Money(this.props.line.foreignTenderAmount.amount, this.props.line.foreignTenderAmount.currency));
    if (line.lineType === TENDER_REFUND_LINE_TYPE || line.lineType === TENDER_CHANGE_LINE_TYPE ) {
      return `(${amount})`;
    } else {
      return amount;
    }
  }

  public getActiveTenderLabel(): string {
    const line: ITenderDisplayLine & ITenderLine = this.props.line as ITenderDisplayLine & ITenderLine;
    const activeTenders: TenderType[] = getActiveTenders(this.props.settings.diContainer,
        this.props.businessState.stateValues.get("transaction.accountingCurrency"));
    const activeTender = activeTenders.find((tender) => {
      return tender.id === line.tenderId;
    });

    if (activeTender.tenderLabel) {
      return I18n.t(activeTender.tenderLabel.i18nCode,
          {defaultValue: activeTender.tenderLabel.default});
    }
    return undefined;
  }

  public render(): JSX.Element {
    // There should always be an extendedAmount.
    const tenderAmount: string = this.getTenderAmount();
    const line: ITenderDisplayLine & ITenderLine = this.props.line as ITenderDisplayLine & ITenderLine;
    const isDisabled = !line.isVoidable;
    const renderAsButton = this.props.allowVoidTender;

    return (
      <>
        <View style={[
          this.styles.row,
          this.props.style ? this.props.style : {},
          renderAsButton && this.styles.voidableLine,
          renderAsButton && isDisabled && this.styles.disabled
        ]}>
          {
            renderAsButton &&
            <VectorIcon
                name={this.props.line.tenderName === "Cash" ? "Cash" : "CardPayment"}
                height={this.styles.icon.fontSize}
                width={this.styles.icon.fontSize}
                fill={this.styles.icon.color}
                stroke={this.styles.icon.color}
            />
          }
          <View style={this.styles.column}>
            <View style={this.styles.textArea}>
              <Text
                style={[this.styles.textStyle, this.styles.tenderTypeText, renderAsButton && isDisabled && this.styles.disabled]}
                ellipsizeMode={"middle"}
                numberOfLines={1}
              >
                { this.getTenderDescriptionText(line) }
              </Text>
              <Text
                  style={[this.styles.textStyle, this.styles.tenderAmountText, renderAsButton && isDisabled && this.styles.disabled]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
              >
                { tenderAmount }
              </Text>
            </View>
            {
              line.foreignTenderAmount &&
              renderAsButton &&
              this.renderForeignTender(!renderAsButton, false, isDisabled)
            }
          </View>
          {
            renderAsButton && !isDisabled &&
            <TouchableOpacity style={this.styles.voidIcon} onPress={() => this.onVoidTender()} >
              <VectorIcon
                name="Clear"
                height={this.styles.icon.fontSize}
                width={this.styles.icon.fontSize}
                fill={this.styles.icon.color}
                stroke={this.styles.icon.color}
              />
            </TouchableOpacity>
          }
        </View>
        {
          line.foreignTenderAmount &&
          !renderAsButton &&
          this.renderForeignTender(renderAsButton, true, isDisabled)
        }
      </>
    );
  }

  private getTenderDescriptionText(line: ITenderDisplayLine & ITenderLine): string {
    let tenderNameText: string = I18n.t(
      this.props.line.tenderName.toLowerCase(),
      { defaultValue: this.props.line.tenderName }).toUpperCase();

    const cardNumber: string = line.tenderDetails && line.tenderDetails.cardNumber || line.cardNumber;
    if (cardNumber) {
      const shortenedCardNumber: string = "..." + cardNumber.substring(cardNumber.length - 4, cardNumber.length);

      tenderNameText = `${tenderNameText} (${shortenedCardNumber})`;
    }

    return tenderNameText;
  }

  private renderForeignTender(renderAsButton: boolean, leftAlign: boolean,
                              isDisabled: boolean): JSX.Element {
    return (
      <View style={[
        this.styles.foreignTenderRow,
        this.props.style ? this.props.style : {},
        renderAsButton && this.styles.voidableLine,
        renderAsButton && isDisabled && this.styles.disabled
      ]}>
        {
          !leftAlign &&
          <Text
            style={[
             this.styles.textStyle,
             this.styles.foreignLabelText,
             renderAsButton && isDisabled && this.styles.disabled
            ]}
            numberOfLines={1}
          >
            { this.getActiveTenderLabel() }
          </Text>
        }
        <Text
          style={[
            this.styles.textStyle,
            leftAlign ? this.styles.foreignTenderText : this.styles.foreignAmountText,
            renderAsButton && isDisabled && this.styles.disabled
          ]}
          numberOfLines={1}
        >
          { this.getForeignTenderAmount() }
        </Text>
      </View>
    );
  }

  private onVoidTender(): void {
    Alert.alert(I18n.t("voidTender"), I18n.t("voidTenderExplanation"), [
      { text: I18n.t("cancel"), style: "cancel" },
      { text: I18n.t("okCaps"), onPress: () => {
          // FIXME: Rework this to call businessOperation.request: https://jira.aptos.com/browse/DSS-3186
          // This is an anti-pattern:  Everything that is needed to be known is known here, so there is no reason to
          // create a IUIData event, and then have the resolveDataEvent's handleUIData do what should have been done
          // here.  There is no value added in resolveDataEvent's handleUIData.
          const uiData: IUIData = {
            eventType: VOID_LINE_EVENT,
            data: { lineNumber: this.props.line.lineNumber }
          };
          this.props.dataEvent(DataEventType.IUIData, uiData);
        }
      }
    ], {cancelable: true});
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  businessState: state.businessState,
  exchangeRates: state.exchangeRate.exchangeRates,
  settings: state.settings
});

const mapDispatchToProps = {
  dataEvent: dataEvent.request
};

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(TenderLine);
