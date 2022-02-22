import * as React from "react";
import { Keyboard } from "react-native";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  PosBusinessError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  CANCEL_TENDER_SESSION_EVENT,
  IOfflineAuthorizationFields,
  TENDER_AUTH_STATUS_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { TenderAuthorizationStatus } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import {
  AppState,
  BusinessState,
  SettingsState,
  UI_MODE_TENDERING
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationProp } from "../StackNavigatorParams";
import AuthorizationInputs from "./AuthorizationInputs";
import { OfflineAuthorizationProps } from "./interfaces";
import { offlineAuthorizationScreenStyles } from "./styles";

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
}

interface DispatchProps {
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface State {
  inProgress: boolean;
}

interface Props extends OfflineAuthorizationProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

class OfflineAuthorization extends React.Component<Props, State> {
  private callForAuthInstructions: string;
  private captureApprovalCode: boolean = true;
  private validateApprovalCode: boolean = false;
  private captureAuthorizationCode: boolean = false;
  private approvalCodeLength: number;
  private authorizationCodeLength: number;
  private offlineAuthorizationFields: IOfflineAuthorizationFields;
  private styles: any;

  public constructor(props: Props) {
    super(props);

    const functionalBehaviorValues =
      props.settings.configurationManager.getFunctionalBehaviorValues();

    const callForAuthorizationInstructionsTranslations =
      functionalBehaviorValues.offlineAuthorizationBehaviors &&
      functionalBehaviorValues.offlineAuthorizationBehaviors
        .callForAuthorizationInstructions;

    this.callForAuthInstructions =
      callForAuthorizationInstructionsTranslations &&
      callForAuthorizationInstructionsTranslations[I18n.currentLocale()];

    this.captureApprovalCode =
      functionalBehaviorValues.offlineAuthorizationBehaviors &&
      functionalBehaviorValues.offlineAuthorizationBehaviors
        .captureApprovalCode;

    this.validateApprovalCode =
      functionalBehaviorValues.offlineAuthorizationBehaviors &&
      functionalBehaviorValues.offlineAuthorizationBehaviors
        .validateApprovalCode !== false;

    this.captureAuthorizationCode =
      functionalBehaviorValues.offlineAuthorizationBehaviors &&
      functionalBehaviorValues.offlineAuthorizationBehaviors
        .captureAuthorizationCode;

    if (
      this.captureApprovalCode === undefined &&
      this.captureAuthorizationCode === undefined
    ) {
      this.captureApprovalCode = true;
    }

    this.validateApprovalCode =
      this.captureApprovalCode &&
      functionalBehaviorValues.offlineAuthorizationBehaviors &&
      functionalBehaviorValues.offlineAuthorizationBehaviors
        .validateApprovalCode;

    this.approvalCodeLength =
      (functionalBehaviorValues.offlineAuthorizationBehaviors &&
        functionalBehaviorValues.offlineAuthorizationBehaviors
          .approvalCodeLength) ||
      6;

    this.authorizationCodeLength =
      (functionalBehaviorValues.offlineAuthorizationBehaviors &&
        functionalBehaviorValues.offlineAuthorizationBehaviors
          .authorizationCodeLength) ||
      8;

    this.offlineAuthorizationFields = this.props.businessState.stateValues.get(
      "TenderAuthorizationSession.offlineAuthorizationFields"
    );

    this.styles = Theme.getStyles(offlineAuthorizationScreenStyles());

    this.state = {
      inProgress: false
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.businessState.inProgress &&
      this.state.inProgress &&
      !this.props.businessState.inProgress &&
      !this.props.businessState.error
    ) {
      this.setState({ inProgress: false });
      this.props.onCancel();
    }
  }

  public componentWillUnmount(): void {
    if (this.props.isGiftCardIssue) {
      this.props.updateUiMode(undefined);
    } else {
      this.props.updateUiMode(UI_MODE_TENDERING);
    }
  }

  public render(): JSX.Element {
    const error: Error = this.props.businessState.error;
    let message;
    if (error instanceof PosBusinessError) {
      message = I18n.t(
        error.localizableMessage.i18nCode,
        error.localizableMessage.parameters || new Map<string, any>()
      );
    }
    return (
      <BaseView style={this.styles.fill}>
        <AuthorizationInputs
          settings={this.props.settings}
          errorMessage={message}
          instructionsText={this.callForAuthInstructions}
          onSave={this.handleOfflineAuthorization.bind(this)}
          onCancel={this.handleCancelOfflineAuthorization.bind(this)}
          stateValues={this.props.businessState.stateValues}
          title={I18n.t("offlineAuthorization")}
          authCodePlaceholder={I18n.t("offlineAuthorizationCode")}
          approvalCodePlaceholder={I18n.t("offlineApprovalCode")}
          captureApprovalCode={this.captureApprovalCode}
          approvalCodeLength={this.approvalCodeLength}
          captureAuthorizationCode={this.captureAuthorizationCode}
          authorizationCodeLength={this.authorizationCodeLength}
          validateApprovalCode={this.validateApprovalCode}
          offlineAuthorizationFields={this.offlineAuthorizationFields}
        />
      </BaseView>
    );
  }

  private handleOfflineAuthorization(
    offlineAuthorizationCode: string,
    offlineApprovalCode: string
  ): void {
    const uiInputs: UiInput[] = [];
    if (offlineAuthorizationCode) {
      uiInputs.push(
        new UiInput(
          UiInputKey.TENDER_OFFLINE_AUTH_RESPONSE_CODE,
          offlineAuthorizationCode
        )
      );
    }
    if (offlineApprovalCode) {
      uiInputs.push(
        new UiInput(
          UiInputKey.TENDER_OFFLINE_APPROVAL_CODE,
          offlineApprovalCode
        )
      );
    }
    uiInputs.push(
      new UiInput(
        UiInputKey.TENDER_AUTH_STATUS,
        TenderAuthorizationStatus.UpdateAuthorizationStarted
      )
    );

    this.props.businessOperation(
      this.props.deviceIdentity,
      TENDER_AUTH_STATUS_EVENT,
      uiInputs
    );
    this.setState({ inProgress: true });
    Keyboard.dismiss();
  }

  private handleCancelOfflineAuthorization(
    offlineAuthorizationCode: string,
    offlineApprovalCode: string
  ): void {
    const uiInputs: UiInput[] = [];
    if (offlineAuthorizationCode) {
      // only save if offlineAuthorizationCode exists - otherwise this should be treated as a standard cancel
      uiInputs.push(
        new UiInput(
          UiInputKey.TENDER_OFFLINE_AUTH_RESPONSE_CODE,
          offlineAuthorizationCode
        )
      );
      if (offlineApprovalCode) {
        uiInputs.push(
          new UiInput(
            UiInputKey.TENDER_OFFLINE_APPROVAL_CODE,
            offlineApprovalCode
          )
        );
      }
    }
    this.props.businessOperation(
      this.props.settings.deviceIdentity,
      CANCEL_TENDER_SESSION_EVENT,
      uiInputs
    );
    this.props.onCancel();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity
  };
}

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  businessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(OfflineAuthorization);
