import * as React from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IValueCertificateInquiryResults, IValueCertificateResult, TENDER_AUTH_STATUS_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { BusinessState, ValueCertificateState } from "../../../reducers";
import { FeedbackNoteState, FeedbackNoteType } from "../../../reducers/feedbackNote";
import Theme from "../../../styles";
import FeedbackNote from "../../common/FeedbackNote";
import Header from "../../common/Header";
import Input, { InputType } from "../../common/Input";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../../common/utilities";
import { getTypeDisplayText, sortAppliedCertificate } from "../common";
import { valueCertificateResultsStyles } from "../styles";
import ValueCertificateLine from "../ValueCertificateLine";

interface Props {
  appLogo: any; // Provided via this class's <Scene /> in RootContainer.tsx
  totalDue: Money;
  isReversalInProgress: boolean;
  valueCertificateState: ValueCertificateState;
  businessState: BusinessState;
  feedbackNoteState: FeedbackNoteState;
  onApply: (item: IValueCertificateResult) => void;
  onVoid: (item: IValueCertificateResult) => void;
  onExit: () => void;
}

interface State {
  inquiryResults: IValueCertificateInquiryResults;
  inputValue: string;
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
      inquiryResults: undefined,
      inputValue: ""
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
    return (
        <View style={this.styles.root}>
          <View style={this.styles.leftPanel}>
            {this.renderLeftPanel()}
          </View>
          <View style={this.styles.rightPanel}>
            {this.renderRightPanel()}
          </View>
        </View>
    );
  }

  private renderLeftPanel(): JSX.Element {
    const appliedValueCertificate: IValueCertificateResult[] = sortAppliedCertificate(this.state.inquiryResults?.valueCertificates?.filter(
      (valueCertificate:IValueCertificateResult) => !!valueCertificate.tenderLineNumber));
    const balanceDue = this.props.totalDue || new Money("0", this.props.totalDue.currency);
    const appliedTotal: Money = this.state.inquiryResults?.totalApplied ||
        new Money("0", this.props.totalDue.currency);
    return <View style={this.styles.fill}>
      <Header
          image={this.props.appLogo}
          isVisibleTablet={true}
      />
      <View style={this.styles.totalArea}>
        <View style={this.styles.totalBox}>
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
        </View>
      </View>
      { appliedValueCertificate && appliedValueCertificate.length > 0 &&
        <ScrollView>
          <FlatList
              style={this.styles.appliedCertificatesArea}
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
        </ScrollView>
      }
    </View>
  }

  private renderRightPanel(): JSX.Element {
    const valueCertificates: IValueCertificateResult[] = this.state.inquiryResults?.valueCertificates

    return <View style={this.styles.fill}>
      <View style={this.styles.inputArea}>
        <Input
            inputType={InputType.text}
            keyboardType={"numbers-and-punctuation"}
            style={this.styles.inputPanel}
            inputStyle={this.styles.inputField}
            cameraIcon={{
              icon: "Camera",
              size: this.styles.cameraIcon.fontSize,
              color: this.styles.cameraIcon.color,
              position: "right",
              style: this.styles.cameraIconPanel
            }}
            onChangeText={this.updateInput.bind((this))}
            showCamera={true}
            value={this.state.inputValue}
            placeholder={I18n.t("valueCertificate")}
            placeholderSentenceCase={false}
            clearText={false}
            autoCapitalize={"none"}
        />
      </View>
      {
        (!this.props.valueCertificateState.inProgress && !valueCertificates?.length) &&
        !this.props.feedbackNoteState?.message &&
        <View style={this.styles.valueCertificates}>
          <View style={this.styles.feedbackNote}>
            <FeedbackNote
                messageType={FeedbackNoteType.Info}
                message={I18n.t("valueCertificatesNotFoundForCustomer")}
            />
          </View>
        </View>
      }
      {
        this.props.feedbackNoteState?.message && !this.props.isReversalInProgress &&
        <View style={this.styles.feedbackNote}>
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
        <View style={this.styles.feedbackNote}>
          <FeedbackNote
              messageType={FeedbackNoteType.Error}
              message={I18n.t("pendingReversalInstructions")}
              messageTitle={I18n.t("pendingReversal")}
          />
        </View>
      }
      {!this.props.valueCertificateState.inProgress && !this.props.valueCertificateState.error &&
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
      </ScrollView>
      }
      {
        <View style={this.styles.doneButton}>
          <TouchableOpacity
              style={[this.styles.btnPrimary]}
              onPress={() => this.props.onExit()}
          >
            <Text style={this.styles.btnPrimaryText}>
              {I18n.t("done")}
            </Text>
          </TouchableOpacity>
        </View>
      }
      </View>
  }

  private updateInput(inputValue: string): void {
    this.setState({ inputValue });
  }
}
