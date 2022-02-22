import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";

import {
  isMerchandiseTransaction,
  ReceiptCategory,
  REPRINT_LAST_TRANSACTION_RECEIPTS_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import {
  DI_TYPES as CORE_DI_TYPES,
  ITransaction,
  ITransactionRepository
} from "@aptos-scp/scp-component-store-selling-core";
import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import I18n from "../../../config/I18n";
import {
  AppState,
  BusinessState,
  DataEventState,
  ModalState,
  SettingsState
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import ReceiptOptionForm from "./ReceiptOptionForm";
import { reprintReceiptStyles } from "./styles";
import { isManagerApprovalModalCancelled } from "../common/utilities/modalUtils";
import { didQualificationErrorWithoutRequiredInputsOccur } from "../common/utilities/handlingErrors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.receipt.ReprintReceiptScreen");

interface StateProps {
  businessState: BusinessState;
  incomingDataEvent: DataEventState;
  modalState: ModalState;
  settings: SettingsState;
}

interface Props extends StateProps, NavigationScreenProps<"reprintReceipt"> {}

interface State {
  transactionToReprint: IMerchandiseTransaction;
}

class ReprintReceiptScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(reprintReceiptStyles());

    this.popToMain = this.popToMain.bind(this);
    this.state = {
      transactionToReprint: undefined
    };
  }

  public componentDidMount(): void {
    const transactionRepository: ITransactionRepository =
        this.props.settings.diContainer.get(CORE_DI_TYPES.ITransactionRepository) as ITransactionRepository;
    transactionRepository.loadLastTransaction()
        .then((transaction: ITransaction) => {
          if (isMerchandiseTransaction(transaction)) {
            this.setState({ transactionToReprint: transaction as any });
          }
        })
        .catch((e) => {
          logger.warn(e);
        });
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.businessState.inProgress &&
        this.props.businessState.eventType === REPRINT_LAST_TRANSACTION_RECEIPTS_EVENT) {
      const managerApprovalModalDismissed =
          isManagerApprovalModalCancelled(prevProps.modalState, this.props.modalState);
      const errorWithoutRequiredInputsOccurred =
          didQualificationErrorWithoutRequiredInputsOccur(prevProps.businessState, this.props.businessState);

      if (managerApprovalModalDismissed || errorWithoutRequiredInputsOccurred) {
        this.popToMain();
      }
    }
  }

  public render(): JSX.Element {
    const customer = this.props.businessState.lastPrintableTransactionInfo.customer;

    return (
      <BaseView style={this.styles.base}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("reprintLastReceipt")}
          backButton={{ name: "Back", action: this.popToMain }}
        />
        <View style={this.styles.root}>
          <ReceiptOptionForm
            allowCancel={true}
            customer={customer}
            providedReceiptCategory={ReceiptCategory.ReprintReceipt}
            onClose={this.popToMain}
            reprintLastReceipt={true}
            incomingDataEvent={this.props.incomingDataEvent}
            lastTransactionType={this.props.businessState.lastPrintableTransactionInfo.transactionType}
            navigation={this.props.navigation}
            transactionToReprint={this.state.transactionToReprint}
          />
        </View>
      </BaseView>
    );
  }

  private popToMain(): void {
    this.props.navigation.dispatch(popTo("main"));
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    incomingDataEvent: state.dataEvent,
    modalState: state.modalState,
    settings: state.settings
  };
}
export default connect(mapStateToProps, undefined)(ReprintReceiptScreen);
