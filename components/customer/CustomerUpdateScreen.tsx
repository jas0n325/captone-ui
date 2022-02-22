import _ from "lodash";
import * as React from "react";
import { Alert, Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { FormErrors } from "redux-form";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { PosBusinessError, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  ASSIGN_CUSTOMER_EVENT,
  CollectedDataKey,
  CUSTOMER,
  Customer,
  CUSTOMER_UPDATE_RESULT,
  SSF_CUSTOMER_FIELD_VALIDATION_I18N_CODE,
  UiInputKey,
  UPDATE_CUSTOMER_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { AttributeGroupDefinitionList } from "@aptos-scp/scp-types-customer";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, clearCustomerUpdateResult, updateCustomer } from "../../actions";
import { AppState, BusinessState, CustomerState, FeedbackNoteState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationScreenProps } from "../StackNavigatorParams";
import CustomerAddUpdate, { BirthDateBehavior, CustomerAddUpdateForm } from "./CustomerAddUpdate";
import { filterAttributeGroupDefinitions, loadAttributeDefinitions } from "./CustomerUtilities";
import { CustomerUpdateScreenProps } from "./interfaces";
import { baseViewFill } from "./styles";
import { buildExternalClientelingAppRequest, clientelingAppUrl, ExternalClientelingAppInboundAction } from "../common/utilities";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { Linking } from "@aptos-scp/scp-component-rn-url-linking";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.customer.CustomerUpdateScreen");

interface StateProps {
  businessState: BusinessState;
  customerState: CustomerState;
  feedbackNoteState: FeedbackNoteState;
  settings: SettingsState;
}

interface DispatchProps {
  updateCustomer: ActionCreator;
  performBusinessOperation: ActionCreator;
  clearCustomerUpdateResult: ActionCreator;
}

interface Props extends CustomerUpdateScreenProps, StateProps, DispatchProps, NavigationScreenProps<"customerUpdate"> {}

export interface State {
  attributeDefs: AttributeGroupDefinitionList;
  feedbackNote: FeedbackNoteState;
  errors: FormErrors<CustomerAddUpdateForm>;
}

class CustomerUpdateScreen extends React.Component<Props, State> {
  private customer: Customer;
  private assignCustomer: boolean;
  private optIns: any;
  private styles: any;
  private birthDateBehavior: BirthDateBehavior;
  private customerEditConfig: any;
  private requiresOneFromEachGroup: any;

  public constructor(props: Props) {
    super(props);

    let editableCustomer: Customer;
    if (this.props.businessState.nonContextualData.has(CUSTOMER)) {
      editableCustomer = this.props.businessState.nonContextualData.get(CUSTOMER);
    } else if (this.props.businessState.nonContextualData.has(CUSTOMER_UPDATE_RESULT)) {
      editableCustomer = this.props.businessState.nonContextualData.get(CUSTOMER_UPDATE_RESULT).customer;
    }
    this.customer = editableCustomer ? editableCustomer : this.props.businessState.stateValues.get("transaction.customer") ||
        this.props.customerState.customer;
    this.assignCustomer = this.props.businessState.nonContextualData.get(CollectedDataKey.AssignCustomer);

    this.customerEditConfig = this.props.settings.configurationManager.getFunctionalBehaviorValues()
        .customerFunctionChoices.customerEdit;
    this.optIns = this.customerEditConfig && this.customerEditConfig.optIns;

    this.requiresOneFromEachGroup = this.customerEditConfig?.requiresOneFromEachGroup;

    this.styles = Theme.getStyles(baseViewFill());

    const { birthDay, defaultYear } = this.props.settings.configurationManager.getFunctionalBehaviorValues()
        .customerFunctionChoices.dateFormat;
    this.birthDateBehavior = {
      dateFormat: birthDay,
      defaultYear
    };

    this.state = {
      attributeDefs: undefined,
      feedbackNote: undefined,
      errors: undefined
    };
  }

  public componentWillUnmount(): void {
    this.props.updateCustomer(this.customer);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress &&
        (!this.props.businessState.error || !(this.props.businessState.error instanceof PosBusinessError &&
            this.props.businessState.error.localizableMessage.i18nCode === SSF_CUSTOMER_FIELD_VALIDATION_I18N_CODE))) {
      if (this.props.businessState.stateValues.get("transaction.customer")) {
        this.props.businessState.nonContextualData.delete(CollectedDataKey.AssignCustomer);
        this.props.clearCustomerUpdateResult();
        this.props.onExit();
      } else {
        this.props.navigation.pop();
      }
    }
    if (prevProps.feedbackNoteState !== this.props.feedbackNoteState && !this.props.feedbackNoteState.message) {
      // clear error heading on validation success
      this.setState({feedbackNote: undefined});
    }
  }

  public async componentDidMount(): Promise<void> {
    if(clientelingAppUrl(this.props.settings.configurationManager) && !this.props.continueWithCustomerEdit) {
      await this.onExternalClientelingCustomerSearch();
    }
    try {
      const hiddenAttributeGroupCodes: string[] =
          _.get(this.props.settings.configurationManager.getFunctionalBehaviorValues().
          customerFunctionChoices, "customerEdit.attributes.hiddenAttributeGroupCodes", []);

      const attributeDefs =  await loadAttributeDefinitions(this.props.settings.diContainer);
      if (attributeDefs?.data) {
        filterAttributeGroupDefinitions(attributeDefs, hiddenAttributeGroupCodes);
        this.setState({ attributeDefs });
      }
    } catch (error) {
      throw logger.throwing(error, "loadAttributeDefinitions", LogLevel.WARN);
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
            isUpdate={true}
            assignCustomer={this.assignCustomer}
            onSave={this.onUpdate.bind(this)}
            onExit={this.props.onExit}
            onCancel={this.onCancel.bind(this)}
            onFailed={this.onFailed.bind(this)}
            onFailedWithErrors={this.onFailedWithErrors.bind(this)}
            feedbackNote={this.state.feedbackNote}
            assignCustomerAction={this.assignCustomerAction.bind(this)}
            customerUiConfig={this.customerEditConfig}
            requiresOneFromEachGroup={this.requiresOneFromEachGroup}
            attributeDefs={this.state.attributeDefs}
            vatNumberRequired={true}
            isRucRequired={false}
            customerValidationDetails={undefined}
            navigation={this.props.navigation}
            errors={this.state.errors}
        />
      </BaseView>
    );
  }

  private async onExternalClientelingCustomerSearch(): Promise<void> {
    if(getCurrentRouteNameWithNavigationRef() === "customerUpdate") {
      this.props.onExit();
    }
    const url: string = `${clientelingAppUrl(this.props.settings.configurationManager)}${
      buildExternalClientelingAppRequest(this.props.businessState, ExternalClientelingAppInboundAction.EditCustomer, this.customer.customerNumber)
    }`;
    try {
      await Linking.openUrl(url, undefined, false);
    } catch (error) {
      Alert.alert(I18n.t("unableToOpen"), I18n.t("externalClientelingAppNotFoundErrorMessage"), [
        { text: I18n.t("cancel"), onPress: () => this.props.onExit()},
        { text: I18n.t("continue"), style: "cancel", onPress: () => this.onContinueCustomerEdit() }
      ], {cancelable: true});
    }
  }

  private onContinueCustomerEdit(): void {
    this.props.navigation.navigate("customerUpdate", {
      continueWithCustomerEdit: true,
      onExit: this.props.onExit
    });
  }

  private onUpdate(customer: Customer): void {
    const uiInputs: UiInput[] = [];

    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_OLD, this.customer));
    const updatedCustomer = _.pickBy(Object.assign({}, this.customer || {}, customer), _.identity);
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER, Object.assign({}, updatedCustomer,
        {allowPromptForLoyaltyEnrollment: this.customer && this.customer.allowPromptForLoyaltyEnrollment})));
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, this.customer.customerNumber));
    uiInputs.push(new UiInput(UiInputKey.ASSIGN_CUSTOMER, this.assignCustomer));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, UPDATE_CUSTOMER_EVENT, uiInputs);
    Keyboard.dismiss();
  }

  private onCancel(): void {
    Keyboard.dismiss();
    this.props.navigation.pop();
  }

  private onFailedWithErrors(errors: FormErrors<CustomerAddUpdateForm>): void {
    if (this.props.feedbackNoteState && this.props.feedbackNoteState.message) {
      this.setState({feedbackNote: {
          message: this.props.feedbackNoteState.message,
          messageId: this.props.feedbackNoteState.messageId,
          feedBackNotes: this.props.feedbackNoteState.feedBackNotes
        }});
    }
    if (errors) {
      this.setState({errors});
    }
  }

  private onFailed(): void {
    Alert.alert(I18n.t("customerUpdateUnsuccessful"), undefined, [{ text: I18n.t("ok") }], { cancelable: true });

    Keyboard.dismiss();
  }

  private assignCustomerAction(customerNumber: string): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, customerNumber));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity,
        ASSIGN_CUSTOMER_EVENT, uiInputs);
  }
}



function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    customerState: state.customer,
    feedbackNoteState: state.feedbackNote,
    settings : state.settings
  };
}
export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  updateCustomer: updateCustomer.request,
  clearCustomerUpdateResult: clearCustomerUpdateResult.request
})(withMappedNavigationParams<typeof CustomerUpdateScreen>()(CustomerUpdateScreen));
