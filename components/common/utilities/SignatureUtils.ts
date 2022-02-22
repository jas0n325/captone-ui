import { TenderAuthorizationState } from "@aptos-scp/scp-component-store-selling-features";

import { BusinessState } from "../../../reducers";


interface Props {
  businessState: BusinessState;
}

export function shouldOpenSignatureScreen(currentProps: Props, nextProps: Props): boolean {
  return (nextProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForSignature &&
      currentProps.businessState.stateValues.get("TenderAuthorizationSession.state") !==
          TenderAuthorizationState.WaitingForSignature);
}

export function appIsWaitingForSignature(currentProps: Props): boolean {
  return currentProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
      TenderAuthorizationState.WaitingForSignature;
}
