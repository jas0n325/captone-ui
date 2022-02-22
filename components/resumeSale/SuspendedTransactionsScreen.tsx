import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";

import {
  UiInput,
  UIINPUT_SOURCE_BARCODE,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import {
  IFeatureAccessConfig,
  TRANSACTION_RESUME_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction as SuspendedTransactions} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  dataEvent,
  DataEventType,
  getSuspendedTransactions,
  updateUiMode
} from "../../actions";
import {
  AppState,
  DataEventState,
  SettingsState,
  SuspendedTransactionsState,
  UiState,
  UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import SuspendedTransactionsForPhone from "./phone/SuspendedTransactions";
import { resumeSuspendedTransactionScreenStyles } from "./styles";
import SuspendedTransactionsForTablet from "./tablet/SuspendedTransactions";

interface StateProps {
  settings: SettingsState;
  uiState: UiState;
  transactionsState: SuspendedTransactionsState;
  incomingDataEvent: DataEventState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  dataEventRequest: ActionCreator;
  searchSuspendedTransaction: ActionCreator;
  onExit: () => void;
}

interface Props extends StateProps, DispatchProps, NavigationScreenProps<"resumeSuspendedTransactions"> {}

interface State {
  inputValue: string;
  isScanned: boolean;
}

class SuspendedTransactionsScreen extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(resumeSuspendedTransactionScreenStyles());

    this.state = {
      inputValue: undefined,
      isScanned: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS);
    if (!this.state.isScanned) {
      this.props.searchSuspendedTransaction();
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public componentDidUpdate(previousProps: Props, previousState: State): void {
    if ((this.props.incomingDataEvent.eventType === DataEventType.ScanData ||
      this.props.incomingDataEvent.eventType === DataEventType.KeyListenerData)
      && !this.state.isScanned && this.props.transactionsState.inProgress) {
      this.setState({
        isScanned: true
      });
      // Clear the props
      this.props.dataEventRequest(this.props.incomingDataEvent, false);
    } else if (this.state.isScanned &&
      this.props.transactionsState.suspendedTransactions.length === 0 &&
      !this.props.transactionsState.inProgress) {
      setTimeout(() => {
        Alert.alert(I18n.t("unableToResume"), this.displayErrorMessage(), [
          {
            text: I18n.t("close"),
            onPress: () => {
              this.setState({ isScanned: false });
              this.props.searchSuspendedTransaction();
            }
          }
        ], { cancelable: false });
      }, 250);
    } else if (this.state.isScanned &&
      this.props.transactionsState.suspendedTransactions.length === 1 &&
      !this.props.transactionsState.inProgress) {
      this.transactionChosen(this.props.transactionsState.suspendedTransactions[0], DataEventType.ScanData);
      this.setState({
        isScanned: false
      });
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        {
          !Theme.isTablet &&
          <SuspendedTransactionsForPhone
            onCancel={this.handleComponentClose.bind(this)}
            transactionChosen={this.transactionChosen.bind(this)}
            transactions={this.props.transactionsState.suspendedTransactions}
            transactionsState={this.props.transactionsState}
            loadAllItems={() => this.props.searchSuspendedTransaction()}
            onBack={this.pop}
          />
        }
        {
          Theme.isTablet &&
          <SuspendedTransactionsForTablet
            onCancel={this.handleComponentClose.bind(this)}
            transactionChosen={this.transactionChosen.bind(this)}
            transactions={this.props.transactionsState.suspendedTransactions}
            transactionsState={this.props.transactionsState}
            loadAllItems={() => this.props.searchSuspendedTransaction()}
            onBack={this.pop}
          />
        }
      </BaseView>
    );
  }

  private transactionChosen(transaction: SuspendedTransactions,
                            eventType: DataEventType = DataEventType.KeyedData): void {
    if (transaction) {
      const uiInputs: UiInput[] = [];
      uiInputs.push(new UiInput(UiInputKey.ORIGINAL_TRANSACTION_ID, transaction.transactionId, undefined,
          eventType === DataEventType.ScanData ? UIINPUT_SOURCE_BARCODE : UIINPUT_SOURCE_KEYBOARD));
      this.props.performBusinessOperation(this.props.settings.deviceIdentity, TRANSACTION_RESUME_EVENT, uiInputs);
    }
    this.props.navigation.dispatch(popTo("main"));
  }

  private handleComponentClose(): void {
    this.props.updateUiMode(undefined);
    this.props.onExit();
  }

  private displayErrorMessage(): string {
    const configuredFeatures: Array<IFeatureAccessConfig> = this.props.settings.configurationManager &&
    this.props.settings.configurationManager.getFeaturesValues() as Array<IFeatureAccessConfig>;
    const configuredFeature: IFeatureAccessConfig = configuredFeatures.find((item: IFeatureAccessConfig) =>
      item.uiBusinessEventType === "ResumeTransaction");
    //TODO: Change the event type to “TransactionResume” to make it consistent
    // with the other features config.
    return configuredFeature.unableToResumeErrorMessage[I18n.currentLocale()] ||
        I18n.t("unableToResumeErrorMessage");
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings,
    uiState: state.uiState,
    transactionsState: state.suspendedTransactions,
    incomingDataEvent: state.dataEvent
  };
};

export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  dataEventRequest: dataEvent.request,
  updateUiMode: updateUiMode.request,
  searchSuspendedTransaction: getSuspendedTransactions.request
})(SuspendedTransactionsScreen);
