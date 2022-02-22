import * as React from "react";
import { connect } from "react-redux";

import { DeviceIdentity, PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";
import { UiInputKey } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import { AppState, BusinessState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import { TenderPromptRulesProps } from "./interfaces";
import { offlineAuthorizationScreenStyles } from "./styles";
import TenderPromptInputs from "./TenderPromptInputs";


interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
}

interface DispatchProps {
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends TenderPromptRulesProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  inProgress: boolean;
}

class TenderPromptRules extends React.Component<Props, State> {
  private tenderPromptInstructions: string = "";
  private captureReferenceNumber: boolean = false;
  private referenceNumberMaxLength: number;
  private referenceNumberMinLength: number;
  private referenceNumberLabel: string;
  private tenderLabel: string;
  private tenderAmount: string;
  private styles: any;
  private keyboardType: "default" | "number-pad" = "default";

  public constructor(props: Props) {
    super(props);


    if (this.props.requiredInputs) {
      const tenderReferenceReqInput = this.props.requiredInputs.find((requiredInput) =>
          requiredInput && requiredInput.inputKey === UiInputKey.TENDER_REFERENCE_DATA);
      const promptRules = tenderReferenceReqInput && tenderReferenceReqInput.inputRules;
      if (promptRules) {

        this.tenderPromptInstructions = promptRules.instructionsText &&
            I18n.t(promptRules.instructionsText.i18nCode, {defaultValue: promptRules.instructionsText.default}) || "";

        this.captureReferenceNumber = !!promptRules.referenceNumber;
        if (this.captureReferenceNumber) {

          const validationRules = promptRules.referenceNumber && promptRules.referenceNumber.validationRules;
          if (validationRules) {
            this.referenceNumberMaxLength = validationRules.maxLength;
            this.referenceNumberMinLength = validationRules.minLength;
          }

          if (promptRules.referenceNumber && promptRules.referenceNumber.labelText) {
            this.referenceNumberLabel = I18n.t(promptRules.referenceNumber.labelText.i18nCode,
                {defaultValue: promptRules.referenceNumber.labelText.default});
          } else {
            this.referenceNumberLabel = I18n.t("referenceNumber");
          }
          if (promptRules.referenceNumber && promptRules.referenceNumber.fieldType) {
            this.keyboardType = promptRules.referenceNumber.fieldType === "numeric" ? "number-pad" : "default";
          }
        }
        if (tenderReferenceReqInput && tenderReferenceReqInput.tenderLabel) {
          this.tenderLabel = I18n.t(tenderReferenceReqInput.tenderLabel.i18nCode,
              {defaultValue: tenderReferenceReqInput.tenderLabel.default});
        }

        if (tenderReferenceReqInput && tenderReferenceReqInput.tenderAmount) {
          this.tenderAmount = tenderReferenceReqInput.tenderAmount &&
            tenderReferenceReqInput.tenderAmount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions());
        }

      }
    }
    this.styles = Theme.getStyles(offlineAuthorizationScreenStyles());

    this.state = {
      inProgress: false
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.businessState.inProgress && this.state.inProgress && !this.props.businessState.inProgress &&
        !this.props.businessState.error) {
      this.setState({ inProgress: false });
    }
  }

  public render(): JSX.Element {
    const error: Error = this.props.businessState.error;
    let message;
    if (error instanceof PosBusinessError) {
      message = I18n.t(error.localizableMessage.i18nCode,
          error.localizableMessage.parameters || new Map<string, any>());
    }
    return (
      <BaseView style={this.styles.fill}>
        <TenderPromptInputs
          settings={this.props.settings}
          errorMessage={message}
          instructionsText={this.tenderPromptInstructions}
          onSave={saveTenderReference.bind(this)}
          onCancel={this.props.onCancel.bind(this)}
          stateValues={this.props.businessState.stateValues}
          title={I18n.t("payment")}
          referenceNumberPlaceholder={this.referenceNumberLabel}
          captureReferenceNumber={this.captureReferenceNumber}
          referenceNumberMinLength={this.referenceNumberMinLength}
          referenceNumberMaxLength={this.referenceNumberMaxLength}
          tenderLabel={this.tenderLabel}
          amount={this.tenderAmount}
          keyboardType={this.keyboardType}
        />
      </BaseView>
    );
  }
}
function saveTenderReference(referenceNumber: string): void {
  this.setState({inProgress: true});
  this.props.onSave(referenceNumber);
}


function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  businessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(TenderPromptRules);
