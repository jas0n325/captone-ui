import * as React from "react";
import { FlatList, ScrollView, Text, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IValueCertificateInquiryResults, IValueCertificateResult, TENDER_AUTH_STATUS_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { BusinessState, ValueCertificateState } from "../../../reducers";
import { FeedbackNoteState, FeedbackNoteType } from "../../../reducers/feedbackNote";
import Theme from "../../../styles";
import FeedbackNote from "../../common/FeedbackNote";
import Header from "../../common/Header";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../../common/utilities";
import { getTypeDisplayText, sortAppliedCertificate } from "../common";
import { valueCertificateResultsStyles } from "../styles";
import ValueCertificateLine from "../ValueCertificateLine";

interface Props {
  totalDue: Money;
  isReversalInProgress: boolean;
  valueCertificateState: ValueCertificateState;
  businessState: BusinessState;
  feedbackNoteState: FeedbackNoteState;
  subType?: string;
  onApply: (item: IValueCertificateResult) => void;
  onVoid: (item: IValueCertificateResult) => void;
  onExit: () => void;
}

interface State {
  inquiryResults: IValueCertificateInquiryResults;
}

export default class ValueCertificate extends React.Component<Props, State> {
  private styles: any;
  private initialBalanceDue: Money;
  private voidProcessingTenderType: string;

  constructor(props: Props) {
    super(props);

    this.initialBalanceDue = this.props.totalDue || new Money("0", this.props.totalDue.currency);
    this.styles = Theme.getStyles(valueCertificateResultsStyles());
    this.state = {
      inquiryResults: undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress) {
      const inquiryResults = this.props.businessState.stateValues.get("StoredValueCertificateSession.inquiryResults");
      if (!inquiryResults || !inquiryResults.valueCertificates || !inquiryResults.valueCertificates.find((valueCert: IValueCertificateResult) => !valueCert.tenderLineNumber)) {
        if (this.props.businessState.eventType === TENDER_AUTH_STATUS_EVENT) {
          if (prevProps.businessState.displayInfo?.tenderDisplayLines?.length <
              this.props.businessState.displayInfo?.tenderDisplayLines?.length) {
            // we are out of certificates to apply, exit
            this.props.onExit();
          }
        }
      }
      if (inquiryResults !== this.state.inquiryResults) {
        this.setState({inquiryResults});
      }
    }
  }

  public render(): JSX.Element {
    const valueCertificates: IValueCertificateResult[] = this.state.inquiryResults?.valueCertificates;
    const appliedValueCertificate: IValueCertificateResult[] = sortAppliedCertificate(this.state.inquiryResults?.valueCertificates?.filter(
      (valueCertificate:IValueCertificateResult) => !!valueCertificate.tenderLineNumber));
    const balanceDue = this.props.totalDue || new Money("0", this.props.totalDue.currency);
    const appliedTotal: Money = this.state.inquiryResults?.totalApplied ||
        new Money("0", this.props.totalDue.currency);
    return (
      <View style={this.styles.root}>
        <Header
          isVisibleTablet={true}
          rightButton={{title: I18n.t("done"), action: () => this.props.onExit()}}
          showInput={true}
          inputDisabled={this.props.isReversalInProgress}
          inputCameraIcon={{
            icon: "Camera",
            color: this.styles.cameraIcon.color,
            size: this.styles.cameraIcon.fontSize,
            style: Object.assign({}, this.styles.cameraIconPanel),
            position: "right"
          }}
          inputPlaceholder={I18n.t("valueCertificate")}
          inputKeyboardType={"numbers-and-punctuation"}
        />
        {
          <View style={this.styles.fill}>
            <View style={this.styles.totalArea}>
              <View style={this.styles.totalLine}>
                <Text style={this.styles.totalText}>
                  {I18n.t("totalDue")}
                </Text>
                <Text style={this.styles.totalText}>
                  {this.initialBalanceDue.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
                </Text>
              </View>
              <View style={this.styles.totalLine}>
                <Text style={this.styles.totalText} numberOfLines={1} ellipsizeMode={"middle"}>
                  {I18n.t("applied")}
                </Text>
                <Text style={this.styles.totalText}>
                  {appliedTotal.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
                </Text>
              </View>
              <View style={this.styles.totalLine}>
                <Text style={this.styles.remainingText} numberOfLines={1} ellipsizeMode={"middle"}>
                  {I18n.t("remaining")}
                </Text>
                <Text style={this.styles.remainingText}>
                  {balanceDue.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
                </Text>
              </View>
              {
                this.props.feedbackNoteState?.message && !this.props.isReversalInProgress &&
                <View style={this.styles.totalAreaFeedbackNote}>
                  <FeedbackNote
                    messageType={FeedbackNoteType.Error}
                    message={this.props.feedbackNoteState.message}
                    messageTitle={this.voidProcessingTenderType ?
                        I18n.t("valueCertificatesNotVoided", {tenderType: this.voidProcessingTenderType}) :
                        I18n.t("valueCertificatesNotApplied")}
                  />
                </View>
              }
              {
                this.props.isReversalInProgress &&
                <View style={this.styles.totalAreaFeedbackNote}>
                  <FeedbackNote
                    messageType={FeedbackNoteType.Error}
                    message={I18n.t("pendingReversalInstructions")}
                    messageTitle={I18n.t("pendingReversal")}
                  />
                </View>
              }
            </View>
            <View style={this.styles.subTitleArea}>
              <Text style={this.styles.subTitleText}>
                {I18n.t("available")}
              </Text>
            </View>
            {
              (!this.props.valueCertificateState.inProgress && !valueCertificates?.length) &&
              <View style={this.styles.feedbackNote}>
                <FeedbackNote
                  messageType={FeedbackNoteType.Info}
                  message={I18n.t("valueCertificatesNotFoundForCustomer")}
                />
              </View>
            }
            {
              !this.props.valueCertificateState.inProgress && !this.props.valueCertificateState.error &&
              valueCertificates?.length > 0 &&
              <ScrollView style={this.styles.valueCertificates}>
                <FlatList
                  data={valueCertificates}
                  keyExtractor={(item: IValueCertificateResult) => item.accountNumber }
                  renderItem={
                    ({ item }) =>
                      <ValueCertificateLine
                        valueCertificate={item}
                        onApply={() => {
                          this.voidProcessingTenderType = undefined;
                          this.props.onApply(item);
                        }}
                        isVoidable={false}
                        isReversalInProgress={this.props.isReversalInProgress}
                      />
                  }
                />
                {
                  appliedValueCertificate && appliedValueCertificate.length > 0 &&
                  <>
                    <View style={this.styles.subTitleArea}>
                      <Text style={this.styles.subTitleText}>
                        {I18n.t("applied")}
                      </Text>
                    </View>
                    <FlatList
                      data={appliedValueCertificate}
                      keyExtractor={(item: IValueCertificateResult) => item.accountNumber }
                      renderItem={
                        ({ item }) =>
                          <ValueCertificateLine
                            valueCertificate={item}
                            onApply={() => {
                              this.voidProcessingTenderType = undefined;
                              this.props.onApply(item);
                            }}
                            isVoidable={true}
                            isReversalInProgress={this.props.isReversalInProgress}
                            onVoid={() => {
                              this.voidProcessingTenderType = getTypeDisplayText(item.valueCertificateType);
                              this.props.onVoid(item);
                            }}
                          />
                      }
                    />
                  </>
                }
              </ScrollView>
            }
          </View>
        }
      </View>
    );
  }
}
