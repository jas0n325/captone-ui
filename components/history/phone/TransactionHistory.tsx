import * as React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Menu, { MenuItem } from "react-native-material-menu";
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
import Theme from "../../../styles";
import { renderReasonSelect } from "../../common/FieldValidation";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import ToastPopUp from "../../common/ToastPopUp";
import { popTo } from "../../common/utilities/navigationUtils";
import VectorIcon from "../../common/VectorIcon";
import ReceiptOptionForm from "../../receipt/ReceiptOptionForm";
import { StackNavigatorParams } from "../../StackNavigatorParams";
import TransactionDisplay from "../TransactionDisplay";
import { transactionHistoryStyles } from "./styles";
import { getCurrentRouteNameWithNavigationRef } from "../../RootNavigation";
import { TransactionHistoryProps } from "../interfaces";
import { isManagerApprovalModalCancelled } from "../../common/utilities/modalUtils";
import {
  didQualificationErrorWithoutRequiredInputsOccur,
  getOrderReferenceId,
  hasOrderItem,
  updateScroll
} from "../../common/utilities";
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

class TransactionHistory extends React.PureComponent<Props & InjectedFormProps<ReasonForm, Props> &
    FormInstance<ReasonForm, undefined>, State> {
  private styles: any;
  private menu: any;
  private testID: string;

  constructor(props: Props & InjectedFormProps<ReasonForm, Props> &
      FormInstance<ReasonForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(transactionHistoryStyles());

    this.state = {
      showReceiptForm: false,
      showTempInfoPopUp: false,
      hideBackButton: false,
      isScrolling: false
    };
    this.testID = "TransactionHistory";

    this.handleReceiptOptionFormClose =  this.handleReceiptOptionFormClose.bind(this);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.businessState.inProgress &&
        this.props.businessState.eventType === REPRINT_TRANSACTION_RECEIPTS_EVENT) {
      const managerApprovalModalDismissed =
          isManagerApprovalModalCancelled(prevProps.modalState, this.props.modalState);
      const errorWithoutRequiredInputsOccurred =
          didQualificationErrorWithoutRequiredInputsOccur(prevProps.businessState, this.props.businessState);

      if (managerApprovalModalDismissed || errorWithoutRequiredInputsOccurred) {
        this.setState({showReceiptForm: false, showTempInfoPopUp: false, hideBackButton: false},
            () => {
              const currentScreen = getCurrentRouteNameWithNavigationRef() as keyof StackNavigatorParams;
              if (currentScreen !== "transactionHistory") {
                this.props.navigation.dispatch(popTo("transactionHistory"));
              }
            });
      }
    }
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("saleDetails")}
          testID={this.testID}
          backButton={!this.state.hideBackButton ? {
            name: "Back",
            action: this.pop
          } : <View/>}
          rightButton={
            (!this.props.isPostVoidMode &&
            !this.state.showReceiptForm) ? this.getKebabMenu() : undefined
          }
        />
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
        {
          this.props.isPostVoidMode &&
          <Footer style={this.styles.footer}>
            {
              this.props.reasons && this.props.reasons.length > 0 &&
              <Field
                name="reason"
                placeholder={I18n.t("selectReason")}
                component={renderReasonSelect}
                reasons={this.props.reasons}
                selectedReasonCode={this.props.selectedReasonCode}
              />
            }
            <TouchableOpacity style={this.styles.postVoidButton} onPress={this.props.submit} >
              <Text style={this.styles.btnPrimaryText}>
                {I18n.t("postVoid")}
              </Text>
            </TouchableOpacity>
          </Footer>
        }
        {
          (this.state.showReceiptForm || this.props.showReceiptFormForPostVoid) &&
          <ScrollView style={this.styles.receiptOptionsArea}>
            <ReceiptOptionForm
              allowCancel={true}
              providedReceiptCategory={this.props.showReceiptFormForPostVoid
                  ? ReceiptCategory.PostVoid
                  : ReceiptCategory.ReprintReceipt
              }
              transactionToReprint={this.props.transaction}
              onClose={this.handleReceiptOptionFormClose}
              incomingDataEvent={this.props.incomingDataEvent}
              navigation={this.props.navigation}
            />
          </ScrollView>
        }
        {
          this.state.showTempInfoPopUp &&
          <ToastPopUp
            textToDisplay={I18n.t("receiptSent")}
            hidePopUp={() => this.setState({showTempInfoPopUp: false})}
          />
        }
      </View>
    );
  }

  private getKebabMenu(): JSX.Element {
    return (
      <View>
        <Menu
          ref={this.setMenuRef}
          button={
            <TouchableOpacity style={this.styles.menuIcon} onPress={() => this.showMenu()} >
              <VectorIcon
                name={"Kebab"}
                fill={this.styles.menuIcon.color}
                height={this.styles.menuIcon.fontSize}
              />
            </TouchableOpacity>}
        >
          {
            this.props.reprintReceiptFeatureEnabled &&
            this.props.reprintReceiptAllowed &&
            <MenuItem disabled={!this.props.enableReprintButton} onPress={this.handleReprint}> {I18n.t("reprint")}</MenuItem>
          }
          {
            this.props.transaction &&
            this.props.transaction.taxFreeFormKey &&
            this.props.taxFreeVoidEnabled &&
            <MenuItem onPress={this.voidTaxFree}> {I18n.t("voidTaxFree")} </MenuItem>
          }
          {
            hasOrderItem(this.props.transaction) &&
            <MenuItem onPress={this.handleViewOrder}> {I18n.t("viewOrder")} </MenuItem>
          }
        </Menu>
      </View>);
  }

  private handleReprint = (): void => {
    this.hideMenu();
    this.setState({ hideBackButton: true, showReceiptForm: true });
  }

  private voidTaxFree = (): void => {
    this.hideMenu();
    this.setState({ hideBackButton: true });
    this.props.onVoidTaxFreeForm();
  }

  private handleViewOrder = () => {
    this.hideMenu();
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

  private setMenuRef = (ref: any) => {
    this.menu = ref;
  }

  private hideMenu = (): void => {
    this.menu.hide();
  }

  private showMenu = (): void => {
    this.menu.show();
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }

  private handleReceiptOptionFormClose(): void {
    this.props.navigation.dispatch(popTo("main"));
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
})(TransactionHistory);
