import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Dispatch } from "redux";
import {
  Field,
  FormInstance,
  InjectedFormProps,
  reduxForm,
  SubmissionError
} from "redux-form";

import {
  ReceiptCategory,
  REPRINT_TRANSACTION_RECEIPTS_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import {
  UI_MODE_RECEIPT_PRINTER_CHOICE,
  UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION
} from "../../../reducers";
import Theme from "../../../styles";
import { renderReasonSelect } from "../../common/FieldValidation";
import Header from "../../common/Header";
import ToastPopUp from "../../common/ToastPopUp";
import { popTo } from "../../common/utilities/navigationUtils";
import ReceiptOptionForm from "../../receipt/ReceiptOptionForm";
import TransactionDisplay from "../TransactionDisplay";
import { transactionHistoryStyles } from "./styles";
import { TransactionHistoryProps } from "../interfaces";
import { isManagerApprovalModalCancelled } from "../../common/utilities/modalUtils";
import { didQualificationErrorWithoutRequiredInputsOccur } from "../../common/utilities/handlingErrors";
import { getOrderReferenceId, hasOrderItem, updateScroll } from "../../common/utilities";
import OfflineNotice from "../../common/OfflineNotice";

export interface ReasonForm {
  reason: any;
}

interface Props extends TransactionHistoryProps {}

interface State {
  showReceiptForm: boolean;
  showTempInfoPopUp: boolean;
  hideBackButton: boolean;
  isScrolling: boolean;
}

class TransactionHistoryScreen extends React.PureComponent<Props & InjectedFormProps<ReasonForm, Props> &
    FormInstance<ReasonForm, undefined>, State> {
  private styles: any;
  private testID: string;

  constructor(props: Props & InjectedFormProps<ReasonForm, Props> &
      FormInstance<ReasonForm, undefined>) {
    super(props);
    this.testID = "TransactionHistoryScreen";
    this.styles = Theme.getStyles(transactionHistoryStyles());

    this.state = {
      showReceiptForm: false,
      showTempInfoPopUp: false,
      hideBackButton: false,
      isScrolling: false
    };

    this.handleReceiptOptionFormClose = this.handleReceiptOptionFormClose.bind(this);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.businessState.inProgress &&
        this.props.businessState.eventType === REPRINT_TRANSACTION_RECEIPTS_EVENT) {
      const managerApprovalModalDismissed =
          isManagerApprovalModalCancelled(prevProps.modalState, this.props.modalState);
      const errorWithoutRequiredInputsOccurred =
          didQualificationErrorWithoutRequiredInputsOccur(prevProps.businessState, this.props.businessState);

      if (managerApprovalModalDismissed || errorWithoutRequiredInputsOccurred) {
        this.setState({showReceiptForm: false, showTempInfoPopUp: false, hideBackButton: false});
      }
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  public render(): JSX.Element {
    const showReceiptOptionForm: boolean = this.state.showReceiptForm || this.props.showReceiptFormForPostVoid;

    return (
      <View style = {this.styles.container}>
        <Header
          backButton={!this.state.hideBackButton && {
            name: "Back",
            action: this.pop,
            title: I18n.t(this.headerTitle())
          }}
          testID={this.testID}
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("saleDetails")}
        />
        <View style={this.styles.root}>
          <View style={this.styles.leftPanel}>
          { this.props.isPostVoidMode &&
           <OfflineNotice isScrolling={this.state.isScrolling}/>
          }
          <TransactionDisplay
            handleScroll={this.handleScroll.bind(this)}
            checkIsTenderChange={this.props.checkIsTenderChange}
            checkIsTendered={this.props.checkIsTendered}
            checkIsTenderAdjustment={this.props.checkIsTenderAdjustment}
            transaction={this.props.transaction}
            displayRoundingAdjustment={this.props.displayRoundingAdjustment}
            displayReturnValue={this.props.displayReturnValue}
            configManager={this.props.configManager}
          />
        </View>
          <View style={this.styles.rightPanel}>
          {
            !this.props.isPostVoidMode &&
            !this.state.showReceiptForm &&
            this.props.reprintReceiptFeatureEnabled &&
            this.props.reprintReceiptAllowed &&
            <TouchableOpacity
              disabled={!this.props.enableReprintButton}
              style={[this.styles.reprintButton ,
                !this.props.enableReprintButton && this.styles.btnDisabled]}
              onPress={() => this.setState({ showReceiptForm: true })}>
              <Text style={[this.styles.btnPrimaryText,
                !this.props.enableReprintButton && this.styles.btnTextDisabled]}>
                {I18n.t("reprint")}
              </Text>
            </TouchableOpacity>
          }
          {
            !this.props.isPostVoidMode &&
            !this.state.showReceiptForm &&
            this.props.taxFreeVoidEnabled &&
            this.props.transaction.taxFreeFormKey &&
            <TouchableOpacity
              style={this.styles.reprintButton}
              onPress={this.handleVoidTff}
            >
              <Text style={this.styles.btnPrimaryText}>
                {I18n.t("voidTaxFree")}
              </Text>
            </TouchableOpacity>
          }
          {
            hasOrderItem(this.props.transaction) &&
            <TouchableOpacity
                style={this.styles.reprintButton}
                onPress={this.handleViewOrder}
            >
              <Text style={this.styles.btnPrimaryText}>
                {I18n.t("viewOrder")}
              </Text>
            </TouchableOpacity>
          }
          {
            this.props.isPostVoidMode && !showReceiptOptionForm &&
            <>
              {
                this.props.reasons && this.props.reasons.length > 0 &&
                <Field
                  name="reason"
                  placeholder={I18n.t("selectReason")}
                  component={renderReasonSelect}
                  reasons={this.props.reasons}
                  selectedReasonCode={this.props.selectedReasonCode}
                  style={this.styles.reasonCodeField}
                />
              }
              <TouchableOpacity style={this.styles.postVoidButton} onPress={this.props.submit} >
                <Text style={this.styles.btnPrimaryText}>
                  {I18n.t("postVoid")}
                </Text>
              </TouchableOpacity>
            </>
          }
          {
            showReceiptOptionForm &&
            <ReceiptOptionForm
              allowCancel={true}
              styles={this.styles.receiptOptions}
              providedReceiptCategory={this.props.showReceiptFormForPostVoid
                  ? ReceiptCategory.PostVoid
                  : ReceiptCategory.ReprintReceipt
              }
              transactionToReprint={this.props.transaction}
              onClose={this.handleReceiptOptionFormClose}
              hideBackButton={() => this.setState({ hideBackButton: true })}
              incomingDataEvent={this.props.incomingDataEvent}
              navigation={this.props.navigation}
            />

          }
        </View>
          {
            this.state.showTempInfoPopUp &&
            <ToastPopUp
              textToDisplay={I18n.t("receiptSent")}
              hidePopUp={() => this.setState({showTempInfoPopUp: false})}
            />
          }
      </View>
      </View>
    );
  }

  private handleReceiptOptionFormClose(): void {
    this.props.navigation.dispatch(popTo("main"));
  }

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }

  private handleVoidTff = () => {
    this.setState({hideBackButton: true});
    this.props.onVoidTaxFreeForm();
  }

  private handleViewOrder = () => {
    this.setState({hideBackButton: true});
    const transaction = this.props.transaction;
    const orderReferenceId = getOrderReferenceId(transaction);
    if (orderReferenceId) {
      this.props.navigation.push("orderInquiry", {
        orderReferenceId,
        parentScene: this.props.parentScene,
        isCustomerHistory: this.props.isCustomerHistory
      });
    }
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private headerTitle(): string {
    let headerTitleText: string = "";
    if (this.props.isCustomerHistory) {
      headerTitleText = "customerHistory";
    } else {
      headerTitleText = (this.props.uiState.mode === UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION ||
          this.props.uiState.mode === UI_MODE_RECEIPT_PRINTER_CHOICE)
          ? "storeOperations"
          : "salesHistory";
    }
    return headerTitleText
  }
}

export default reduxForm<ReasonForm, Props>({
  form: "reasonSelect",
  validate: (values: ReasonForm): any => {
    const errors: ReasonForm = { reason: undefined };
    const { reason } = values;
    if (!reason) {
      errors.reason = I18n.t("postVoidReasonCodeRequired");
    }
    return errors;
  },
  initialValues: {
    reason: undefined
  },
  onSubmit: (data: ReasonForm, dispatch: Dispatch<any>, props: Props) => {
    if (props.reasons && props.reasons.length) {
      if (!data.reason) {
        throw new SubmissionError({reason: I18n.t("postVoidReasonCodeRequired")});
      }
      props.onSetReasonCode(data.reason);
    }
    props.onPostVoidTransaction();
  }
})(TransactionHistoryScreen);
