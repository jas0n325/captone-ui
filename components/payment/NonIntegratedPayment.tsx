import * as React from "react";
import { Keyboard } from "react-native";
import { connect } from "react-redux";

import {
  DeviceIdentity, DI_TYPES, IConfigurationManager, IConfigurationValues, UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  AllowRefund,
  INonIntegratedFields,
  OPEN_CASH_DRAWER_EVENT,
  TenderAuthorizationState,
  TenderType,
  TENDER_AUTH_STATUS_EVENT,
  UiInputKey,
  VOID_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { IAuthorizationResponse, TenderType as DeviceTenderType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, sceneTitle, updateUiMode } from "../../actions";
import { AppState, BusinessState, SettingsState, UI_MODE_TENDERING } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { RenderSelectOptions } from "../common/FieldValidation";
import { appIsWaitingForSignature, getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import { popAndReplace, popTo } from "../common/utilities/navigationUtils";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationProp } from "../StackNavigatorParams";
import AuthorizationInputs from "./AuthorizationInputs";
import { NonIntegratedPaymentProps } from "./interfaces";
import NonIntegratedPaymentConfirmation from "./NonIntegratedPaymentConfirmation";
import { getActiveTenders } from "./PaymentDevicesUtils";
import { offlineAuthorizationScreenStyles } from "./styles";

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  currentScreenName: string;
}

interface DispatchProps {
  sceneTitle: ActionCreator;
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends NonIntegratedPaymentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  inProgress: boolean;
  authorizationCodeFocus: boolean;
}

class NonIntegratedPayment extends React.Component<Props, State> {
  private styles: any;
  private amountDue: string;
  private validTenders: RenderSelectOptions[];
  private selectedTender: TenderType;
  private activeValidTenders: TenderType[];
  private origScreenName: string;
  /**
   * @deprecated authorizationCodeLength is deprecated use authorizationMaxLength and authorizationMinLength instead.
   */
  private authorizationCodeLength: number;
  private authorizationCodeMaxLength: number;
  private authorizationCodeMinLength: number;
  private requestFields: INonIntegratedFields;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(offlineAuthorizationScreenStyles());

    this.requestFields = this.props.businessState.stateValues.get("TenderAuthorizationSession.nonIntegratedFields");

    const amountDueMoney = this.requestFields && this.requestFields.tenderAmount;
    this.amountDue = amountDueMoney && amountDueMoney.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions());
    this.setValidTendersAsOptions(props, this.requestFields);

    this.origScreenName = props.originalScreen || "nonIntegratedAuthorization";

    this.state = {
      inProgress: false,
      authorizationCodeFocus: !this.validTenders
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.businessState.inProgress && this.state.inProgress && !this.props.businessState.inProgress &&
          !this.props.businessState.error) {
      const tenderAuthSessionState: TenderAuthorizationState =
          this.props.businessState.stateValues.get("TenderAuthorizationSession.state");
      //If still in state waitingForNonIntegratedInput or WaitingForTransactionVoid don't exit
      if (tenderAuthSessionState !== TenderAuthorizationState.WaitingForNonIntegratedInput &&
            tenderAuthSessionState !== TenderAuthorizationState.WaitingForTransactionVoid) {
        if (!Theme.isTablet && this.proceedToScanDrawer(prevProps)) {
          this.props.navigation.dispatch(popAndReplace("scanDrawer", {
            eventType: OPEN_CASH_DRAWER_EVENT
          }));
          //On tablet handle this in paymentScreen since we may need to move to the signatureCapture scene first
        } else if ((!Theme.isTablet || !appIsWaitingForSignature(this.props))) {
          if (Theme.isTablet && (this.props.originalEventType === VOID_TRANSACTION_EVENT ||
              this.props.originalEventType === TENDER_AUTH_STATUS_EVENT)) {
            this.props.navigation.dispatch(popTo("payment", "main"));
          } else if (!Theme.isTablet) {
            this.props.navigation.pop();
          }
        }
        this.setState({ inProgress: false });
      }
    }

    if (prevProps.currentScreenName === "reasonCodeList" && this.props.currentScreenName === this.origScreenName) {
       if (this.isCaptureTenderTypeRequired() && !this.selectedTender) {
        this.props.onCancel();
       } else {
         this.setState({authorizationCodeFocus: true});
       }
    }
  }

  public componentDidMount(): void {
    if (this.isCaptureTenderTypeRequired()) {
      this.props.sceneTitle("reasonCodeList", "cardType");
      this.props.navigation.push("reasonCodeList", {
        options: this.validTenders,
        onOptionChosen: this.onSelectTender.bind(this)
      });
    }
  }

  public componentWillUnmount(): void {
    //check if we are still in a transaction
    if (this.props.businessState.stateValues.get("transaction.waitingToClose") !== true) {
      if (this.props.isTendering && this.props.businessState.stateValues.get("transaction.type")) {
        this.props.updateUiMode(UI_MODE_TENDERING);
      } else {
        this.props.updateUiMode(undefined);
      }
    }
  }

  public render(): JSX.Element {
    this.setConfiguredAuthorizationCodeLength(this.props);
    return (
      <BaseView style={this.styles.fill}>
        { !this.isAuthorizationPromptEnabled() &&
          <NonIntegratedPaymentConfirmation
            settings={this.props.settings}
            onSave={this.handleConfirmation.bind(this)}
            onCancel={this.props.onCancel.bind(this)}
            stateValues={this.props.businessState.stateValues}
            amountDue={this.amountDue}
          />
        }
        { this.isAuthorizationPromptEnabled() &&
          <AuthorizationInputs
            settings={this.props.settings}
            instructionsText={I18n.t("nonIntegratedPaymentInstructions")}
            onSave={this.handleConfirmation.bind(this)}
            onCancel={this.props.onCancel.bind(this)}
            stateValues={this.props.businessState.stateValues}
            title={I18n.t("nonIntegratedAuthorization")}
            authCodePlaceholder={I18n.t("nonIntegratedAuthorizationCode")}
            amountDue={this.amountDue}
            authorizationCodeLength={this.authorizationCodeLength}
            authorizationCodeMaxLength={this.authorizationCodeMaxLength}
            authorizationCodeMinLength={this.authorizationCodeMinLength}
            authorizationCodeFocus={this.state.authorizationCodeFocus}
            captureAuthorizationCode={true}
          />
        }
      </BaseView>
    );
  }

  private proceedToScanDrawer(prevProps: Props): boolean {
    return this.props.businessState.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer") &&
        !appIsWaitingForSignature(this.props) && (appIsWaitingForSignature(prevProps) ||
            !prevProps.businessState.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer"));
  }

  private handleConfirmation(authorizationCode?: string): void {
    //Remove extra auth confirmations in the case of tran voids
    const inputs: UiInput[] = [];

    if (this.requestFields) {
      // Add inputs from request fields
      inputs.push(new UiInput(UiInputKey.TENDER_AMOUNT,
          this.requestFields.tenderAmount && this.requestFields.tenderAmount.amount));
    }

    if (authorizationCode || this.selectedTender) {
      const authResponse: IAuthorizationResponse = {};
      if (authorizationCode) {
        authResponse.approvalCode = authorizationCode;
      }
      if (this.selectedTender) {
        authResponse.tenderType = this.selectedTender.tenderTypeName as DeviceTenderType;
        authResponse.cardType = this.selectedTender.cardType;
        authResponse.customCardType = this.selectedTender.customCardType;
      }
      inputs.push(new UiInput(UiInputKey.TENDER_AUTH_RESPONSE, authResponse));
    }

    inputs.push(new UiInput(UiInputKey.TENDER_NON_INTEGRATED_CONFIRMATION, true));

    this.props.businessOperation(this.props.deviceIdentity, TENDER_AUTH_STATUS_EVENT, inputs);
    this.setState({inProgress: true});
    Keyboard.dismiss();
  }

  private isAuthorizationPromptEnabled(): boolean {
    return this.props.requiredInputs?.find((item) =>
        item === UiInputKey.TENDER_AUTH_RESPONSE);
  }


  private onSelectTender(newValue: RenderSelectOptions): void {
    this.selectedTender = this.activeValidTenders &&
        this.activeValidTenders.find((tender: TenderType) => tender.id === newValue.code);
  }

  private setValidTendersAsOptions(props: Props, requestFields: INonIntegratedFields): void {
    if (this.requiredInputsHasKey(UiInputKey.TENDER_ID)) {
      const validTenderTypes: string[] =
          requestFields.mappedRefundTenderTypeName && [requestFields.mappedRefundTenderTypeName] ||
          this.getValidTenderTypesConfig(props);
      let activeTenders: TenderType[] = [];
      if (requestFields.originalTenderId) {
        activeTenders = TenderType.getActiveSuggestedRefundTenders(props.settings.diContainer,
            props.businessState.stateValues.get("transaction.accountingCurrency"));
        activeTenders = activeTenders && activeTenders.filter((suggestedTender: TenderType) =>
            suggestedTender.id === requestFields.originalTenderId);
      } else {
        if (requestFields.mappedRefundTenderTypeName) {
          activeTenders = TenderType.getActiveSuggestedRefundTenders(props.settings.diContainer,
            props.businessState.stateValues.get("transaction.accountingCurrency"), true);
          // If we have mappedRefundTenderTypeName then we are only allowing WhenMapped tenders
          activeTenders = activeTenders && activeTenders.filter((tender: TenderType) =>
              tender.allowRefund && tender.allowRefund.indexOf(AllowRefund.WhenMapped) >= 0);
        } else {
          activeTenders = getActiveTenders(props.settings.diContainer,
              props.businessState.stateValues.get("transaction.accountingCurrency"),
              props.businessState.stateValues.get("transaction.total"),
              props.businessState.displayInfo);
        }

      }
        this.activeValidTenders = activeTenders && validTenderTypes &&
            activeTenders.filter((tender: TenderType) => validTenderTypes.indexOf(tender.tenderTypeName) >= 0 &&
            requestFields.tenderAuthCategory === tender.tenderAuthCategory);


      this.validTenders = this.activeValidTenders && Object.keys(this.activeValidTenders)
          .map((key: string): RenderSelectOptions => {
            return {
              code: this.activeValidTenders[key].id,
              description: this.activeValidTenders[key].tenderName
            };
          });

      if (this.validTenders && this.validTenders.length === 1) {
        // There is only one valid tender set selected tender
        this.onSelectTender(this.validTenders[0]);
      }
    }
  }

  private getValidTenderTypesConfig(props: Props): string[] {

    const deviceDefinition = this.getDeviceDefinition(props);
    if (deviceDefinition && deviceDefinition.vendorConfiguration) {
      return deviceDefinition && deviceDefinition.vendorConfiguration.validTenderTypes;
    }
  }

  private setConfiguredAuthorizationCodeLength(props: Props): void {
    if (!this.authorizationCodeLength || !this.authorizationCodeMaxLength || !this.authorizationCodeMinLength) {
      const deviceDefinition = this.getDeviceDefinition(props);
      if (deviceDefinition && deviceDefinition.vendorConfiguration) {
        this.authorizationCodeLength = (deviceDefinition && deviceDefinition.vendorConfiguration &&
            deviceDefinition.vendorConfiguration.authorizationCodeLength);
        this.authorizationCodeMaxLength = (deviceDefinition && deviceDefinition.vendorConfiguration &&
            deviceDefinition.vendorConfiguration.authorizationCodeMaxLength);
        this.authorizationCodeMinLength = (deviceDefinition && deviceDefinition.vendorConfiguration &&
          deviceDefinition.vendorConfiguration.authorizationCodeMinLength);
      }
    }
  }

  private getDeviceDefinition(props: Props): any {
    const deviceId: string = this.requestFields && this.requestFields.deviceId;

    const peripheralsConfig: IConfigurationValues = this.props.settings.diContainer
         .get<IConfigurationManager>(DI_TYPES.IConfigurationManager).getPeripheralsValues();
    const deviceDefinitions = peripheralsConfig && peripheralsConfig.paymentType &&
        peripheralsConfig.paymentType.deviceDefinitions;
    return deviceDefinitions &&
        (deviceDefinitions.find((definition: any) => definition.id === deviceId)) ||
        (deviceDefinitions.find((definition: any) => definition.vendorClass === "NonIntegratedDevice"));
  }

  private isCaptureTenderTypeRequired(): boolean {
    const tenderIdRequired: boolean = this.requiredInputsHasKey(UiInputKey.TENDER_ID);

    return tenderIdRequired && this.validTenders && this.validTenders.length > 0 && !this.selectedTender;
  }

  private requiredInputsHasKey(inputKey: string): boolean {
    return this.props.requiredInputs?.find((item) =>
        item === inputKey);
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    currentScreenName: getCurrentRouteNameWithNavigationRef()
  };
}

export default connect<StateProps, DispatchProps, Omit<Props, keyof (StateProps & DispatchProps)>>(mapStateToProps, {
  businessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request,
  sceneTitle: sceneTitle.request
})(NonIntegratedPayment);
