import * as React from "react";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  DeviceIdentity
} from "@aptos-scp/scp-component-store-selling-core";
import { isStoredValueCardServiceAvailable, TERMINAL_STATE_SYNC_EVENT, ValueCardAction } from "@aptos-scp/scp-component-store-selling-features";

import {
  ActionCreator, businessOperation, dataEvent, DataEventType, IDataEventData, IKeyListenerData, updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  DataEventState,
  SettingsState,
  UiState,
  UI_MODE_GIFTCARD_ISSUE
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { RenderSelectOptions } from "../common/FieldValidation";
import {
  businessEventCompletedWithoutError,
  didStoredValueCardSessionStateChange,
  getIsGiftCardDeviceFilter,
  getPaymentDevicesAsRenderSelect
} from "../payment/PaymentDevicesUtils";
import { NavigationProp } from "../StackNavigatorParams";
import { getCurrency, getMaximumIssueAmount, getMinimumIssueAmount, getQuickChoiceAmounts } from "./GiftCardUtilities";
import { IssueGiftCardComponentProps } from "./interfaces";
import IssueGiftCard from "./IssueGiftCard";
import { issueGiftCardStyle } from "./styles";

interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
  deviceIdentity: DeviceIdentity;
  uiState: UiState;
  incomingDataEvent: DataEventState;
  paymentStatus: Map<string, any>;
 }

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  dataEventSuccess: ActionCreator;
}

interface Props extends IssueGiftCardComponentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  cardNumber: string;
  swipe: boolean;
  swipeButtonEnabled: boolean;
  primaryGiftDevices: RenderSelectOptions[];
}

class IssueGiftCardComponent extends React.Component<Props, State> {
  private styles: any;
  private minimumIssueAmount: Money;
  private maximumIssueAmount: Money;
  private quickChoiceAmounts: Money[];
  private currency: string;
  private existingCard: boolean;
  private issueEnabledGCService: boolean;
  private reloadEnabledGCService: boolean;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(issueGiftCardStyle());

    const primaryGiftDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus,
        getIsGiftCardDeviceFilter(this.props.settings.configurationManager, this.props.settings.deviceIdentity.deviceId));

    this.minimumIssueAmount = getMinimumIssueAmount(props.settings.configurationManager);
    this.maximumIssueAmount = getMaximumIssueAmount(props.settings.configurationManager);
    this.quickChoiceAmounts = getQuickChoiceAmounts(props.settings.configurationManager);
    this.currency = getCurrency(props.settings.configurationManager);
    this.issueEnabledGCService =
        isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
            this.props.businessState.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Issue);
    this.reloadEnabledGCService =
        isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
            this.props.businessState.stateValues.get("StoredValueCardSession.state"), ValueCardAction.AddValue);
    this.state = {
      primaryGiftDevices,
      cardNumber: null,
      swipe: false,
      swipeButtonEnabled: false
    };
  }

  public componentWillMount(): void {
    this.props.updateUiMode(UI_MODE_GIFTCARD_ISSUE);
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.incomingDataEvent?.data && this.props.incomingDataEvent.data !== prevProps.incomingDataEvent?.data &&
      this.props.uiState.mode === UI_MODE_GIFTCARD_ISSUE) {
        let incomingScannerData: IDataEventData;
        let incomingCardNumber: string;
        if (this.props.incomingDataEvent.eventType === DataEventType.KeyListenerData) {
          incomingCardNumber = (this.props.incomingDataEvent.data as IKeyListenerData).inputText;
        } else if (this.props.incomingDataEvent.eventType === DataEventType.ScanData) {
          incomingScannerData = this.props.incomingDataEvent.data ? this.props.incomingDataEvent.data: undefined;
          incomingCardNumber = incomingScannerData ? incomingScannerData.data : undefined;
        }
        const currentCardNumber = this.state.cardNumber;
        if (currentCardNumber !== incomingCardNumber) {
          this.setState({cardNumber: incomingCardNumber});
          // Clear the props
          this.props.dataEventSuccess(this.props.incomingDataEvent, false);
        }
    }
    if (didStoredValueCardSessionStateChange(this.props.businessState && this.props.businessState.stateValues,
        prevProps.businessState && prevProps.businessState.stateValues)) {
      this.issueEnabledGCService = isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
          this.props.businessState.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Issue);
      this.reloadEnabledGCService = isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
          this.props.businessState.stateValues.get("StoredValueCardSession.state"), ValueCardAction.AddValue);
    }

    if (prevProps.paymentStatus !== this.props.paymentStatus) {
      const primaryGiftDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus,
          getIsGiftCardDeviceFilter(this.props.settings.configurationManager,
          this.props.settings.deviceIdentity.deviceId));
      this.setState({primaryGiftDevices});
    }

    if (businessEventCompletedWithoutError(prevProps.businessState, this.props.businessState)
        && this.props.businessState.eventType !== TERMINAL_STATE_SYNC_EVENT) {
      this.handleComponentClose();
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={[this.styles.root, this.props.style]}>
        <IssueGiftCard
            currency={this.props.businessState.stateValues.get("transaction.accountingCurrency")}
            configuredCurrency={this.currency}
            settings={this.props.settings}
            primaryGiftDevices={this.state.primaryGiftDevices}
            minimumIssueAmount={this.minimumIssueAmount}
            maximumIssueAmount={this.maximumIssueAmount}
            quickChoiceAmounts={this.quickChoiceAmounts}
            scannedCardNumber={this.state.cardNumber}
            onIssue={this.onIssue.bind(this)}
            onSwipe={this.onSwipe.bind(this)}
            swipe ={this.state.swipe}
            swipeButtonEnabled={this.state.swipeButtonEnabled}
            toggleSwipeButton={this.toggleSwipeButton.bind(this)}
            onCancel={this.handleComponentClose.bind(this)}
            onChangeExistingCard={this.onChangeExistingCard.bind(this)}
            issueEnabledGCService={this.issueEnabledGCService}
            reloadEnabledGCService={this.reloadEnabledGCService}
            isRefund={this.props.isRefund}
            amount={this.props.amount}
            isChange={this.props.isChange}
          />
      </BaseView>
    );
  }

  private onIssue(cardNumber: string, amount: string, inputSource: string, useSwipe?: boolean): void {
    this.props.onGCIssue(cardNumber, amount, inputSource, useSwipe, this.existingCard);
  }

  private handleComponentClose(): void {
    this.props.updateUiMode(undefined);
    this.props.onExit();
    this.setState({swipe: false});
  }

  private onSwipe(): void {
    this.setState({swipe: true});
  }

  private onChangeExistingCard(existingCard: boolean): void {
    this.existingCard = existingCard;
  }

  private toggleSwipeButton(swipeButtonEnabled: boolean): void {
    if (this.state.swipeButtonEnabled !== swipeButtonEnabled) {
      this.setState({swipeButtonEnabled});
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    settings: state.settings,
    deviceIdentity: state.settings.deviceIdentity,
    uiState: state.uiState,
    incomingDataEvent: state.dataEvent
  };
};

export default connect<StateProps, DispatchProps, Omit<Props, keyof (StateProps & DispatchProps)>>(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  dataEventSuccess: dataEvent.success,
  updateUiMode: updateUiMode.request
})(IssueGiftCardComponent);
