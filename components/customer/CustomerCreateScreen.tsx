import * as _ from "lodash";
import * as React from "react";
import { Alert, Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { FormErrors } from "redux-form";

import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  ASSIGN_CUSTOMER_EVENT,
  CREATE_CUSTOMER_EVENT,
  Customer,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { CustomerType } from "@aptos-scp/scp-types-commerce-transaction";
import { AttributeGroupDefinitionList } from "@aptos-scp/scp-types-customer";
import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { Linking } from "@aptos-scp/scp-component-rn-url-linking";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  businessOperation,
  clearCustomer,
  clearCustomerCreationResult,
  updateUiMode
} from "../../actions";
import { AppState, BusinessState, CustomerState, FeedbackNoteState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { buildExternalClientelingAppRequest, clientelingAppUrl, ExternalClientelingAppInboundAction, promptToAssignCustomer } from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import CustomerAddUpdate, { BirthDateBehavior, CustomerAddUpdateForm } from "./CustomerAddUpdate";
import { filterAttributeGroupDefinitions, loadAttributeDefinitions } from "./CustomerUtilities";
import { CustomerCreateScreenProps } from "./interfaces";
import { baseViewFill } from "./styles";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.customer.CustomerCreateScreen");

interface DispatchProps {
  alert: AlertRequest;
  clearCustomer: ActionCreator;
  clearCustomerCreationResult: ActionCreator;
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface StateProps {
  businessState: BusinessState;
  customerState: CustomerState;
  feedbackNoteState: FeedbackNoteState;
  settings: SettingsState;
  isReprintLastReceipt: boolean;
}

interface Props extends CustomerCreateScreenProps, StateProps, DispatchProps, NavigationScreenProps<"customerCreate">{}

export interface State {
  customerCreatedSuccessfully: boolean;
  attributeDefs: AttributeGroupDefinitionList;
  returnCustomerAdded: boolean;
  feedbackNote: FeedbackNoteState;
  errors: FormErrors<CustomerAddUpdateForm>;
}

class CustomerCreateScreen extends React.Component<Props, State> {
  private customer: Customer;
  private optIns: any;
  private styles: any;
  private birthDateBehavior: BirthDateBehavior;
  private customerCreateConfig: any;
  private requiresOneFromEachGroup: any;

  public constructor(props: Props) {
    super(props);
    this.customer = this.props.customerState.searchParams as Customer;

    this.state = {
      attributeDefs: undefined,
      customerCreatedSuccessfully: false,
      returnCustomerAdded: false,
      feedbackNote: undefined,
      errors: undefined
    };
    const functionalBehaviorValues = this.props.settings.configurationManager.getFunctionalBehaviorValues();
    this.customerCreateConfig = functionalBehaviorValues.customerFunctionChoices.customerCreate;
    this.optIns = this.customerCreateConfig && this.customerCreateConfig.optIns;

    this.requiresOneFromEachGroup = this.customerCreateConfig?.requiresOneFromEachGroup;

    this.styles = Theme.getStyles(baseViewFill());

    const { birthDay, defaultYear } = functionalBehaviorValues.customerFunctionChoices.dateFormat;
    this.birthDateBehavior = {
      editable: true,
      dateFormat: birthDay,
      defaultYear
    };
  }

  public async componentDidMount(): Promise<void> {
    if(clientelingAppUrl(this.props.settings.configurationManager) && !this.props.continueWithNewCustomer) {
      await this.onExternalClientelingNewCustomer();
    }
    try {
      const hiddenAttributeGroupCodes: string[] =
          _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
          customerFunctionChoices, "customerCreate.attributes.hiddenAttributeGroupCodes", []);

      const attributeDefs =  await loadAttributeDefinitions(this.props.settings.diContainer);
      if (attributeDefs?.data) {
        filterAttributeGroupDefinitions(attributeDefs, hiddenAttributeGroupCodes);
        this.setState({ attributeDefs });
      }
    } catch (error) {
      throw logger.throwing(error, "loadAttributeDefinitions", LogLevel.WARN);
    }
  }

  public componentWillUnmount(): void {
    this.props.clearCustomer();
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.customerState.creationResult && !prevProps.customerState.creationResult) {
      if (this.props.customerState.creationResult.createdSuccessfully) {
        this.setState({ customerCreatedSuccessfully: true });
      } else {
        this.props.clearCustomerCreationResult();
        if (this.customerCreateConfig?.discardCustomerOnServiceFailure) {
          this.props.alert(
              I18n.t("customerCreateFailed"), undefined,
              [{ text: I18n.t("ok"), onPress: this.props.onExit }], { cancelable: true });
        }
      }
    }
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress
        && !this.state.returnCustomerAdded) {
      const transactionCustomer = this.props.businessState.stateValues.get("transaction.customer");
      if (transactionCustomer) {
        this.setState({ returnCustomerAdded: true });
        this.props.onExit();
      }
    }
    if (prevProps.feedbackNoteState !== this.props.feedbackNoteState && !this.props.feedbackNoteState.message) {
      // clear error heading on validation success
      this.setState({feedbackNote: undefined});
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <CustomerAddUpdate
            displayEmailOptIn={this.optIns && this.optIns.email || false}
            displayTextOptIn={this.optIns && this.optIns.text || false}
            displayPhoneOptIn={this.optIns && this.optIns.phone || false}
            displayMailOptIn={this.optIns && this.optIns.mail || false}
            birthDateBehavior={this.birthDateBehavior}
            editableCustomer={this.customer}
            isUpdate={false}
            createdCustomer={this.state.customerCreatedSuccessfully}
            onSave={this.onCreate.bind(this)}
            onCancel={this.onCancel.bind(this)}
            onFailed={this.onFailed.bind(this)}
            onFailedWithErrors={this.onFailedWithErrors.bind(this)}
            feedbackNote={this.state.feedbackNote}
            onExit={this.props.onExit}
            displayTaxInformation={false}
            customerUiConfig={this.customerCreateConfig}
            requiresOneFromEachGroup={this.requiresOneFromEachGroup}
            attributeDefs={this.state.attributeDefs}
            vatNumberRequired={true}
            isRucRequired={false}
            customerValidationDetails={undefined}
            scannedCustomerEmail={this.props.scannedCustomerEmail}
            navigation={this.props.navigation}
            errors={this.state.errors}
        />
      </BaseView>
    );
  }

  private onCreate(customer: Customer, taxIdentifier?: string, taxIdentifierName?: string,
                   taxCode?: string, taxCodeName?: string, pecAddress?: string, pecAddressName?: string,
                   addressCode?: string, addressCodeName?: string): void {
    const uiInputs: UiInput[] = [];
    if (this.state.customerCreatedSuccessfully) {
      //assign customer
      uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, this.props.customerState.customer.customerNumber));
      this.props.performBusinessOperation(this.props.settings.deviceIdentity, ASSIGN_CUSTOMER_EVENT, uiInputs);
    } else {
      //create customer  (and assign if assignCustomer)
      uiInputs.push(new UiInput(UiInputKey.CUSTOMER, _.pickBy(customer, _.identity)));
      uiInputs.push(new UiInput(UiInputKey.ASSIGN_CUSTOMER, this.props.assignCustomer));
      const doPromptForLottery = !!(this.props.businessState && this.props.businessState.stateValues &&
          this.props.businessState.stateValues.get("transaction.taxLotteryCustomerCode") &&
          customer && customer.customerType === CustomerType.Business);
      const createCustomerBusinessOperation = () =>
          this.props.performBusinessOperation(this.props.settings.deviceIdentity, CREATE_CUSTOMER_EVENT, uiInputs);
      promptToAssignCustomer(createCustomerBusinessOperation, doPromptForLottery);
    }
  }

  private onFailedWithErrors(errors: FormErrors<CustomerAddUpdateForm>): void {
    if (this.props.feedbackNoteState && this.props.feedbackNoteState.message) {
      this.setState({feedbackNote: {
          message: this.props.feedbackNoteState.message,
          messageId: this.props.feedbackNoteState.messageId,
          feedBackNotes: this.props.feedbackNoteState.feedBackNotes
        }
      });
    }
    if (errors) {
      this.setState({errors});
    }
  }

  private async onExternalClientelingNewCustomer(): Promise<void> {
    if(getCurrentRouteNameWithNavigationRef() === "customerCreate") {
      this.props.onExit();
    }
    const url: string = `${clientelingAppUrl(this.props.settings.configurationManager)}${
      buildExternalClientelingAppRequest(this.props.businessState, ExternalClientelingAppInboundAction.NewCustomer)
    }`;
    try {
      await Linking.openUrl(url, undefined, false);
    } catch (error) {
      this.onContinueNewCustomer();
    }
  }

  private onContinueNewCustomer(): void {
    this.props.navigation.navigate("customerCreate", {
      continueWithNewCustomer: true,
      onExit: this.props.onExit
    });
  }

  private onFailed(): void {
    Alert.alert(I18n.t("customerUnsuccessful"), undefined, [{ text: I18n.t("ok") }], { cancelable: true });
  }

  private onCancel(): void {
    Keyboard.dismiss();
    this.props.navigation.pop();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    customerState: state.customer,
    feedbackNoteState: state.feedbackNote,
    settings : state.settings,
    isReprintLastReceipt: state.receipt && state.receipt.isReprintLastReceipt
  };
}
export default connect(mapStateToProps, {
  alert: alert.request,
  performBusinessOperation: businessOperation.request,
  clearCustomer: clearCustomer.request,
  clearCustomerCreationResult: clearCustomerCreationResult.request,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof CustomerCreateScreen>()(CustomerCreateScreen));
