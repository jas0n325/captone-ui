import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  ITEM_PICKUP_SIGNATURE_EVENT,
  RETURN_SIGNATURE_EVENT,
  TENDER_REFUND_LINE_TYPE,
  TENDER_SIGNATURE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, businessOperation } from "../../actions";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { printAmount } from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { SignatureCaptureScreenProps } from "./interfaces";
import SignatureCapture from "./SignatureCapture";
import { signatureCaptureScreenStyles } from "./styles";
import Orientation from "react-native-orientation-locker";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.signature.SignatureCaptureScreen");

export interface StateProps {
  settings: SettingsState;
}

export interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

export interface Props extends
    SignatureCaptureScreenProps, StateProps, DispatchProps, NavigationScreenProps<"signatureCapture"> {}

export interface State { }

class SignatureCaptureScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(signatureCaptureScreenStyles());
  }

  public render(): JSX.Element {
    const tenderAmount: string = (!this.props.isReturnSignature && !this.props.isItemPickupSignature) ? (
        this.props.tenderLine.lineType === TENDER_REFUND_LINE_TYPE ?
            `(${printAmount(this.props.tenderLine.tenderAmount)})` : printAmount(this.props.tenderLine.tenderAmount)) :
        undefined;
    return (
      <BaseView style={this.styles.fill}>
        <SignatureCapture
            amount={tenderAmount}
            tenderLine={this.props.tenderLine}
            onSave={this.onSave.bind(this)}
            isReturnSignature={this.props.isReturnSignature}
            isItemPickupSignature={this.props.isItemPickupSignature}/>
      </BaseView>
    );
  }

  private onSave(encoded: string, encodedDataPoints: string): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("signature", encoded));
    uiInputs.push(new UiInput("signaturePoints", encodedDataPoints));

    // tslint:disable-next-line:max-line-length
    logger.debug(() => `In signature capture: Calling performBusinessOperation with ${encoded} and params: ${JSON.stringify(uiInputs)}`);

    let signatureEvent = TENDER_SIGNATURE_EVENT;
    if (this.props.isReturnSignature) {
      signatureEvent = RETURN_SIGNATURE_EVENT;
    } else if (this.props.isItemPickupSignature) {
      signatureEvent = ITEM_PICKUP_SIGNATURE_EVENT;
    }

    this.props.performBusinessOperation
          (this.props.settings.deviceIdentity,
            signatureEvent, uiInputs);

    this.props.navigation.pop();
    if (!Theme.isTablet && this.props.isReturnSignature) {
      Orientation.lockToPortrait();
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings
  };
};

export default connect<StateProps, DispatchProps, NavigationScreenProps<"signatureCapture">>(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(withMappedNavigationParams()(SignatureCaptureScreen));
