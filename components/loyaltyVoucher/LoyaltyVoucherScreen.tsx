import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { ILoyaltyVoucher, LoyaltyVoucherStatus, UiInputKey } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, searchLoyaltyVouchers } from "../../actions";
import { AppState, BusinessState, LoyaltyVoucherState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import ToastPopUp from "../common/ToastPopUp";
import {
  businessEventCompletedWithError,
  completedTenderAuthorization
} from "../payment/PaymentDevicesUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { LoyaltyVoucherScreenProps } from "./interfaces";
import LoyaltyVoucher from "./LoyaltyVoucher";

interface StateProps {
  businessState: BusinessState;
  loyaltyVoucherState: LoyaltyVoucherState;
  settings: SettingsState;
}

interface DispatchProps {
  searchLoyaltyVouchers: ActionCreator;
}

interface Props extends LoyaltyVoucherScreenProps, StateProps, DispatchProps, NavigationScreenProps<"loyaltyVoucher"> {}

interface State {
  isApplyingLoyaltyVoucher: boolean;
  showLoyaltyVoucherApplied: boolean;
}

class LoyaltyVoucherScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isApplyingLoyaltyVoucher: false,
      showLoyaltyVoucherApplied: false
    };
  }

  public componentDidMount(): void {
    const uiInputs: Array<UiInput> = [];
    uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_STATUS, [LoyaltyVoucherStatus.active]));

    this.props.searchLoyaltyVouchers(this.props.settings.deviceIdentity, uiInputs);
  }

  public componentDidUpdate(prevProps: Props): void {
    const { stateValues, displayInfo } = this.props.businessState;
    if (!(stateValues.get("transaction.balanceDue") as Money).isPositive()) {
      this.props.onExit();
    } else if (completedTenderAuthorization(prevProps.businessState.stateValues.get("TenderAuthorizationSession.state"),
        stateValues.get("TenderAuthorizationSession.state")) ||
        businessEventCompletedWithError(prevProps.businessState, this.props.businessState)) {
      this.setState({
        isApplyingLoyaltyVoucher: false,
        showLoyaltyVoucherApplied: displayInfo.tenderDisplayLines.length !==
            prevProps.businessState.displayInfo.tenderDisplayLines.length});
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={Theme.styles.miscellaneous.fill}>
        <LoyaltyVoucher
            tenderName={this.props.tenderName}
            pluralTenderName={this.props.pluralTenderName}
            totalDue={this.props.businessState.stateValues.get("transaction.balanceDue")}
            tenderLines={this.props.businessState.displayInfo.tenderDisplayLines}
            loyaltyVoucherState = {this.props.loyaltyVoucherState}
            onApply={(loyaltyVoucher: ILoyaltyVoucher) =>
                this.setState({ isApplyingLoyaltyVoucher: true },
                    () => this.props.onApply(loyaltyVoucher))}
            onExit={this.props.onExit}
        />
        {this.state.showLoyaltyVoucherApplied &&
        <ToastPopUp
            textToDisplay={I18n.t("loyaltyVoucherApplied", { tenderName: this.props.tenderName })}
            hidePopUp={() => this.setState({ showLoyaltyVoucherApplied: false })}
        />
        }
      </BaseView>
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    loyaltyVoucherState: state.loyaltyVoucher,
    settings: state.settings
  };
}

export default connect<StateProps>(mapStateToProps, {
  searchLoyaltyVouchers: searchLoyaltyVouchers.request
})(withMappedNavigationParams<typeof LoyaltyVoucherScreen>()(LoyaltyVoucherScreen));
