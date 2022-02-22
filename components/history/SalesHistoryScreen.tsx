import * as React from "react";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";

import { ActionCreator, clearPostVoidSearchResult, getLastTransaction, getTodaysTransactions,
  updateUiMode } from "../../actions";
import { AppState, SettingsState, TransactionsState, UI_MODE_TRANSACTION_HISTORY } from "../../reducers";
import {UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION} from "../../reducers/uiState";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps, StackNavigatorParams } from "../StackNavigatorParams";
import { SalesHistoryScreenProps } from "./interfaces";
import SalesHistoryPhone from "./phone/SalesHistory";
import { baseViewFill } from "./styles";
import SalesHistoryTablet from "./tablet/SalesHistory";

interface StateProps {
  transactionsState: TransactionsState;
  settings: SettingsState;
}

interface DispatchProps {
  clearPostVoidSearch: ActionCreator;
  getLastTransactionAction: ActionCreator;
  getTodaysTransactionsAction: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends SalesHistoryScreenProps, StateProps, DispatchProps, NavigationScreenProps<"salesHistory"> {}

interface State {
  transactions: IMerchandiseTransaction[];
  inputValue: string;
}

export class SalesHistoryScreen extends React.PureComponent<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(baseViewFill());

    this.state = {
      transactions: undefined,
      inputValue: undefined
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(this.props.isPostVoidMode ?
        UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION : UI_MODE_TRANSACTION_HISTORY);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.transactionsState && this.props.transactionsState &&
          prevProps.transactionsState.transactions !== this.props.transactionsState.transactions) {
      if (this.props.transactionsState.transactions && this.props.transactionsState.transactions.length === 1) {
        this.transactionChosen(this.props.transactionsState.transactions[0] as IMerchandiseTransaction);
      }
      this.setState({ transactions: this.props.transactionsState.transactions as Array<IMerchandiseTransaction> });
    }
  }

  public componentWillUnmount(): void {
    this.props.clearPostVoidSearch();
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const SalesHistory = Theme.isTablet ? SalesHistoryTablet : SalesHistoryPhone;
    return (
      <BaseView style={this.styles.fill}>
        <SalesHistory
          getLastTransactionAction={this.props.getLastTransactionAction.bind(this)}
          getTodaysTransactionsAction={this.props.getTodaysTransactionsAction.bind(this)}
          settings={this.props.settings}
          transactionChosen={this.transactionChosen.bind(this)}
          transactions={this.state.transactions}
          transactionsState={this.props.transactionsState}
          isPostVoidMode={this.props.isPostVoidMode}
          onBack={(popToScreen?: keyof StackNavigatorParams) => {
            if (popToScreen) {
              this.props.navigation.dispatch(popTo(popToScreen));
            } else {
              this.props.navigation.pop();
          }}}
        />
      </BaseView>
    );
  }

  private transactionChosen(chosenTransaction: IMerchandiseTransaction): void {
    this.props.navigation.push("transactionHistory", {
      transaction: chosenTransaction,
      isPostVoidMode: this.props.isPostVoidMode,
      parentScene: "salesHistory"
    });
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    transactionsState: state.transactions,
    settings: state.settings
  };
};

export default connect(mapStateToProps, {
  clearPostVoidSearch: clearPostVoidSearchResult.request,
  getTodaysTransactionsAction: getTodaysTransactions.request,
  getLastTransactionAction: getLastTransaction.request,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof SalesHistoryScreen>()(SalesHistoryScreen));
