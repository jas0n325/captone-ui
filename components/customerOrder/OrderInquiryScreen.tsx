import _ from "lodash";
import * as React from "react";
import { Text, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { DecoratedComponentClass, Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { PosBusinessError, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { SSF_ORDERS_API_ERROR_CODE, UiInputKey } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, clearOrders, dataEvent, getOrders, updateUiMode } from "../../actions";
import {AppState, BusinessState, OrdersState, SettingsState, UI_MODE_ORDER_REFERENCE_INQUIRY} from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import ActionButton from "../common/ActionButton";
import BaseView from "../common/BaseView";
import FeedbackNote from "../common/FeedbackNote";
import { renderInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import { cameraScannerInputStyles } from "../common/styles";
import { ButtonType, getTestIdProperties } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps, StackNavigatorParams } from "../StackNavigatorParams";
import { OrderInquiryScreenProps } from "./interfaces";
import { orderInquiryScreenStyle } from "./styles";

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
  uiMode: string;
  ordersState: OrdersState;
}

interface DispatchProps {
  updateUiMode: ActionCreator;
  dataEventRequest: ActionCreator;
  getLocalOrders: ActionCreator;
  clearOrders: ActionCreator;
}

interface Props extends OrderInquiryScreenProps, StateProps, DispatchProps, NavigationScreenProps<"orderInquiry"> {}

interface State {
  isCustomerOrder: boolean;
}

interface OrderInquiryForm {
  searchValue: string;
}

export class OrderInquiryScreen extends React.Component<Props & InjectedFormProps<OrderInquiryForm, Props> &
  FormInstance<OrderInquiryForm, undefined>, State> {
  private styles: any;
  private inputStyles: any;
  private testID: string;

  constructor(props: Props & InjectedFormProps<OrderInquiryForm, Props> &
    FormInstance<OrderInquiryForm, undefined>) {
    super(props);

    this.testID = "OrderInquiryScreen";

    this.styles = Theme.getStyles(orderInquiryScreenStyle());
    this.inputStyles = Theme.getStyles(cameraScannerInputStyles());

    this.state = {
      isCustomerOrder: false
    };
  }

  public componentDidMount(): void {
    if (this.props.orderReferenceId) {
      this.searchItems(undefined, 0, this.props.orderReferenceId);
      this.setState({isCustomerOrder: true});
    } else if (this.props.uiMode !== UI_MODE_ORDER_REFERENCE_INQUIRY) {
      this.props.updateUiMode(UI_MODE_ORDER_REFERENCE_INQUIRY);
    }
  }

  public componentWillUnmount(): void {
    this.props.clearOrders();
    if (this.props.uiMode === UI_MODE_ORDER_REFERENCE_INQUIRY) {
      this.props.updateUiMode(undefined);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.hasOrder(this.props) && !this.hasOrder(prevProps)){
      if (this.state.isCustomerOrder) {
        this.props.navigation.replace("orderInquiryDetail", {
            orderReferenceId: this.props.orderReferenceId,
            settings: this.props.settings,
            onExit: () => this.props.navigation.dispatch(popTo(this.props.parentScene as keyof StackNavigatorParams)),
            isCustomerOrder: true,
            isCustomerHistory: this.props.isCustomerHistory
        });
      } else {
        this.props.navigation.navigate("orderInquiryDetail", {
            orderReferenceId: this.props.ordersState.orderRequestId,
            settings: this.props.settings,
            onExit: () => {
              this.exitFromDetailsScreen();
            },
            isCustomerOrder: false
          });
      }
    }

    if ((this.props.ordersState.searched && this.props.ordersState.error) &&
        !(prevProps.ordersState.searched && prevProps.ordersState.error)) {
      this.initializeForm();
    }
  }

  public render(): JSX.Element {
    const { handleSubmit, settings } = this.props;
    const purchaseHistory = _.get(settings.configurationManager.getFunctionalBehaviorValues().
      customerFunctionChoices, "customerProfile.purchaseHistory.visible", false) === true;
    const searched: boolean = (!this.hasOrder(this.props) && this.props.ordersState.searched);

    return (
      <BaseView style={this.styles.fill}>
        <Header
          testID={this.testID}
          isVisibleTablet={true}
          title={I18n.t("orderInquiry")}
          backButton={{
            name: "Back",
            action: () => this.state.isCustomerOrder ?
                this.props.navigation.dispatch(popTo(this.props.parentScene as keyof StackNavigatorParams)) :
                this.props.navigation.dispatch(popTo("main")),
            title: this.getBackButtonTitle()
          }}
          rightButton={!this.state.isCustomerOrder && {
            title: I18n.t("searchButton"),
            action: handleSubmit((data: OrderInquiryForm) => this.searchItems(data, 0))
          }}
        />
        <View style={this.styles.root}>
          { !this.state.isCustomerOrder && this.renderOrderInquiryForm() }
          <View style={this.styles.resultSection}>
            { searched && this.renderOrderNotFound() }
            { purchaseHistory && !this.state.isCustomerOrder && this.renderCustomerHistoryCard() }
          </View>
        </View>
      </BaseView>
    );
  }

  private getBackButtonTitle(): string {
    if (Theme.isTablet){
      if (this.state.isCustomerOrder) {
        return I18n.t("salesHistory");
      } else {
        return I18n.t("basket");
      }
    } else {
      return "";
    }
  }

  private renderOrderInquiryForm(): JSX.Element {
    const { handleSubmit } = this.props;
    const name = "searchValue";
    const inputStyles = this.inputStyles;

    return (
      <View style={this.styles.fieldWrapper}>
        <Field
          id="orderInquirySearchText"
          name={name}
          testID={`${this.testID}-${name}`}
          component={renderInputField}
          overrideOnSubmitEditing={handleSubmit((data: OrderInquiryForm) => this.searchItems(data, 0))}
          returnKeyType={"search"}
          style={inputStyles.inputPanel}
          inputStyle={inputStyles.inputField}
          cameraIcon={{
            icon: "Camera",
            size: inputStyles.cameraIcon.fontSize,
            color: inputStyles.cameraIcon.color,
            position: "right",
            style: inputStyles.cameraIconPanel
          }}
          placeholder={I18n.t("orderReferenceNumber")}
          placeholderSentenceCase={false}
          placeholderStyle={inputStyles.placeholderStyle}
          settings={this.props.settings}
          inputType={InputType.text}
        />
      </View>
    );
  }

  private renderOrderNotFound(): JSX.Element {
    let message: string = I18n.t("noOrdersFound");
    let subtextMessage: string = I18n.t("orderSearch") + " " + this.props.ordersState.orderRequestId;
    if (!this.hasOrder(this.props) && this.props.ordersState.searched && this.props.ordersState.error) {
      const error = this.props.ordersState.error as PosBusinessError;
      if (error.localizableMessage.i18nCode === SSF_ORDERS_API_ERROR_CODE) {
        message = I18n.t("orderRetrievalError");
        subtextMessage = I18n.t("checkConnection");
      }
    }
    return (
      <View style={this.styles.feedbackNoteContainer}>
        <FeedbackNote
          messageType={FeedbackNoteType.Error}
          messageTitle={message}
          message={subtextMessage}
        />
      </View>
    );
  }

  private renderCustomerHistoryCard(): JSX.Element {
    const message: string = I18n.t("noOrderReferenceNumber");
    const linkText: string = I18n.t("searchCustomerHistory");

    return (
      <View style={this.styles.customerHistorySection}>
        <Text
          style={this.styles.customerHistoryMessageText}
          {...getTestIdProperties(this.testID, "customerHistoryMessage")}>
          {message}
        </Text>
        <View style={this.styles.customerHistoryButtonContainer}>
          <ActionButton
            testID={this.testID}
            type={ButtonType.Tertiary}
            title={linkText}
            onPress={() => this.handleCustomerHistory()}
            allowTextWrap={true}
          />
        </View>
      </View>
    );
  }

  private handleCustomerHistory = (): void => {
    this.props.navigation.replace("customer", {
      isTransactionStarting: true,
      assignCustomer: false,
      hideCreateCustomer: true,
      returnMode: false,
      backNavigationTitle: I18n.t("orderInquiry"),
      onExit: () => this.props.navigation.dispatch(popTo("main")),
      onCancel: () => this.props.navigation.push("orderInquiry")
    });
  }

  private searchItems(data: any, offset: number, orderRefId?: string): void {
    const orderReferenceId: string = data && data.searchValue || orderRefId;
    if (orderReferenceId && orderReferenceId.length > 0) {
      const uiInputs: UiInput[] = [];
      uiInputs.push(new UiInput(UiInputKey.ORDER_REFERENCE_ID, orderReferenceId));
      this.props.getLocalOrders(this.props.settings.deviceIdentity, uiInputs);
    }
  }

  private initializeForm(): void {
    this.props.initialize(undefined);
    this.props.untouch();
  }

  private exitFromDetailsScreen(): void {
    this.props.clearOrders();
    this.props.updateUiMode(UI_MODE_ORDER_REFERENCE_INQUIRY);
    this.initializeForm();
    this.props.navigation.navigate("orderInquiry");
  }

  private hasOrder(props: Props): boolean {
    let result: boolean = false;
    if (!props.ordersState.inProgress) {
      result = props?.ordersState?.orders?.length > 0;
    }
    return result;
  }
}

const OrderInquiryForm = reduxForm<OrderInquiryForm, Props>({
  form: "orderInquiry",
  validate : (values: OrderInquiryForm) => {
    const errors: { searchValue: string } = { searchValue: undefined };
    if (!values.searchValue) {
      errors.searchValue = I18n.t("suspendMissingReference");
    }
    return errors;
  },
  enableReinitialize: true,
  initialValues: { searchValue: undefined }
})(OrderInquiryScreen);

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    ordersState: state.orders,
    businessState: state.businessState,
    uiMode: state.uiState.mode
  };
}

const mapDispatchToProps: DispatchProps = {
  dataEventRequest: dataEvent.request,
  updateUiMode: updateUiMode.request,
  getLocalOrders: getOrders.request,
  clearOrders: clearOrders.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<DecoratedComponentClass<OrderInquiryForm, Props>>()(OrderInquiryForm));
