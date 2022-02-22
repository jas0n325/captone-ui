import i18n from "../../../config/I18n";
import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { IValueCertificateResult, StoredValueCertificateSessionState, UiInputKey, VOID_LINE_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, alert, businessOperation, feedbackNoteAction, searchValueCertificates, updateUiMode } from "../../actions";
import { AppState, BusinessState, FeedbackNoteState, SettingsState, UiState, UI_MODE_TENDERING, UI_MODE_VALUE_CERTIFICATE_SEARCH, ValueCertificateState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import ToastPopUp from "../common/ToastPopUp";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ValueCertificateProps } from "./interfaces";
import ValueCertificatePhone from "./phone/ValueCertificate";
import ValueCertificateTablet from "./tablet/ValueCertificate";
import { isRedeemConfirmationPromptEnabled } from "./ValueCertificateUtilities";

interface StateProps {
  businessState: BusinessState;
  feedbackNoteState: FeedbackNoteState;
  valueCertificateState: ValueCertificateState;
  settings: SettingsState;
  uiState: UiState;
}

interface DispatchProps {
  searchValueCertificates: ActionCreator;
  feedbackNoteSuccess: ActionCreator;
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  alert: ActionCreator;
}

export interface Props extends StateProps, DispatchProps, ValueCertificateProps,
    NavigationScreenProps<"valueCertificate"> {}

interface State {
  tempInfoMessage: string;
}

class ValueCertificateScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      tempInfoMessage: undefined
    };
  }

  public componentDidMount(): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.TENDER_SUB_TYPE, this.props.subType));
    this.props.searchValueCertificates(this.props.settings.deviceIdentity, uiInputs);
    this.props.updateUiMode(UI_MODE_VALUE_CERTIFICATE_SEARCH);
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode === UI_MODE_VALUE_CERTIFICATE_SEARCH) {
          //check if we are still in a transaction
      if (this.props.businessState.stateValues.get("transaction.waitingToClose") !== true &&
          this.props.businessState.stateValues.get("transaction.type")) {
        this.props.updateUiMode(UI_MODE_TENDERING);
      } else {
        this.props.updateUiMode(undefined);
      }
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.businessState.inProgress && !prevProps.businessState.inProgress) {
      // clear active feedback notes
      this.props.feedbackNoteSuccess();

    } else if (!this.props.businessState.inProgress && prevProps.businessState.inProgress) {
      if (prevProps.businessState.displayInfo?.tenderDisplayLines?.length <
          this.props.businessState.displayInfo?.tenderDisplayLines?.length) {
        this.setState({tempInfoMessage: i18n.t("applied")});
      }
      if (Theme.isTablet &&
          this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.isChangeInProgress") &&
          !prevProps.businessState.stateValues.get("EndOfTransactionTenderingSession.isChangeInProgress")) {
        this.props.onExit();
      }
    }
  }

  public render(): JSX.Element {
    const ValueCertificate = Theme.isTablet ? ValueCertificateTablet : ValueCertificatePhone;
    const isReversalInProgress = this.props.businessState.stateValues.get("StoredValueCertificateSession.state") ===
        StoredValueCertificateSessionState.ReversalInProgress;
    return (
        <BaseView style={Theme.styles.miscellaneous.fill}>
          <ValueCertificate
              appLogo={this.props.appLogo}
              totalDue={this.props.businessState.stateValues.get("transaction.balanceDue")}
              valueCertificateState={this.props.valueCertificateState}
              onApply={(valueCertificate: IValueCertificateResult) => this.onRedeem(valueCertificate)}
              onExit={this.props.onExit}
              businessState={this.props.businessState}
              feedbackNoteState={this.props.feedbackNoteState}
              isReversalInProgress={isReversalInProgress}
              onVoid={(valueCertificate: IValueCertificateResult) => this.onVoid(valueCertificate)}
              subType={this.props.subType}
          />
          { this.renderToast() }
        </BaseView>
    );
  }

  private renderToast = (): React.ReactNode => (
    this.state.tempInfoMessage &&
    <ToastPopUp
      textToDisplay={this.state.tempInfoMessage}
      hidePopUp={this.hideTempInfoPopUp.bind(this)}
    />
  )

  private getRedeemAmount(valueCertificate: IValueCertificateResult): string {
    const balanceDue: Money = this.props.businessState.stateValues.get("transaction.balanceDue");
    let tenderAmount: string = valueCertificate.balance.amount;
    if (this.props.partialRedeemEnabled && balanceDue.lte(valueCertificate.balance)) {
      tenderAmount = balanceDue.amount;
    }

    return tenderAmount;
  }

  private onRedeem(valueCertificate: IValueCertificateResult): void {
    const redeemAmount = this.getRedeemAmount(valueCertificate);
    if (isRedeemConfirmationPromptEnabled(this.props.settings.configurationManager)) {
      this.props.alert(
          undefined,
          i18n.t("redeemValueCertificatePrompt"),
          [
            { text: i18n.t("cancel"), style: "cancel" },
            { text: i18n.t("redeem"), onPress: () => { this.props.onApply(valueCertificate, redeemAmount); } }
          ],
          { cancellable: true }
      )
    } else {
      this.props.onApply(valueCertificate, redeemAmount);
    }
  }

  private onVoid(valueCertificate: IValueCertificateResult): void {
    this.props.alert(
      i18n.t("voidTender"),
      i18n.t("voidTenderExplanation"),
      [ { text: i18n.t("cancel"), style: "cancel" },
        {
          text: i18n.t("okCaps"), onPress: () => {
            this.props.businessOperation(this.props.settings.deviceIdentity, VOID_LINE_EVENT, [new UiInput("lineNumber", valueCertificate.tenderLineNumber)]);
          }
        }
      ],
      { cancellable: true }
    );
  }

  private hideTempInfoPopUp(): void {
    this.setState({
      tempInfoMessage: undefined
    });
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    feedbackNoteState: state.feedbackNote,
    valueCertificateState: state.valueCertificate,
    settings: state.settings,
    uiState: state.uiState
  };
}

export default connect<StateProps, DispatchProps, NavigationScreenProps<"valueCertificate">>(mapStateToProps, {
  searchValueCertificates: searchValueCertificates.request,
  feedbackNoteSuccess: feedbackNoteAction.success,
  businessOperation: businessOperation.request,
  alert: alert.request,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof ValueCertificateScreen>()(ValueCertificateScreen));
