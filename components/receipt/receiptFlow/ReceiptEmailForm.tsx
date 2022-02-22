import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { DecoratedFormProps, Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";
import { isEmail } from "validator";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";
import { Customer } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { ActionCreator, setReceiptEmail, Settings } from "../../../actions";
import { AppState, BusinessState, ReceiptState } from "../../../reducers";
import Theme from "../../../styles";
import BaseView from "../../common/BaseView";
import { renderTextInputField } from "../../common/FieldValidation";
import Header from "../../common/Header";
import { handleFormSubmission } from "../../common/utilities";
import { getAdvanceEmailVerification, loadEmailVerification } from "../../customer/CustomerUtilities";
import { NavigationProp } from "../../StackNavigatorParams";
import { ReceiptEmailFormScreenProps } from "./interfaces";
import { receiptEmailFormStyles } from "./styles";
import OfflineNotice from "../../common/OfflineNotice";


const logger: ILogger = LogManager.getLogger(
  "com.aptos.storeselling.ui.components.receipt.receiptFlow.ReceiptEmailForm"
);

interface EmailForm {
  receiptEmail: string;
}

interface StateProps {
  customer: Customer;
  receiptEmail: string;
  settings: Settings;
  businessState: BusinessState;
  receiptState: ReceiptState;
}

interface DispatchProps {
  setReceiptEmail: ActionCreator;
}

interface Props extends ReceiptEmailFormScreenProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

type ReceiptEmailFormProps = Props & InjectedFormProps<EmailForm, Props> & FormInstance<EmailForm, undefined>;

class ReceiptEmailForm extends React.Component<ReceiptEmailFormProps> {
  private canContinueWithCustomerEmail: boolean = false;
  private receiptEmailRef: any;
  private styles: any;

  public constructor(props: ReceiptEmailFormProps) {
    super(props);

    this.styles = Theme.getStyles(receiptEmailFormStyles());
  }

  public componentDidMount(): void {
    if (this.props.customer && this.props.customer.emailAddress) {
      this.props.change("receiptEmail", this.props.customer.emailAddress);
    }

    if (this.receiptEmailRef) {
      this.receiptEmailRef.focus();
    }
  }

  public componentDidUpdate(prevProps: ReceiptEmailFormProps): void {
    const reprintTransactionEventType: boolean = this.props.receiptState.isReprintLastReceipt
        || !!this.props.receiptState.transactionToReprint;
    const emailWasSet: boolean = prevProps.receiptEmail !== this.props.receiptEmail
        && !!this.props.receiptEmail;
    const userWantsToUseCustomerEmail: boolean = this.props.customer && this.props.submitSucceeded
        && this.canContinueWithCustomerEmail;
    const reprintWithEmail: boolean = this.props.submitSucceeded && this.canContinueWithCustomerEmail
        && this.props.receiptEmail && reprintTransactionEventType;
    if (emailWasSet || userWantsToUseCustomerEmail || reprintWithEmail) {
      this.canContinueWithCustomerEmail = false; // Prevent multiple usages of this.props.onContinue
      this.props.onContinue();
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("receipt")}
          backButton={this.props.onCancel && { name: "Back", action: this.props.onCancel }}
          rightButton={!Theme.isTablet && { title: I18n.t("continue"), action: this.handleContinue }}
        />
        {!Theme.isTablet && <OfflineNotice />}
        {
          this.renderEmailFieldContainer(
            <Field
              name={"receiptEmail"}
              onRef={(ref: any) => this.receiptEmailRef = ref}
              component={renderTextInputField}
              errorStyle={this.styles.errorText}
              placeholder={I18n.t("email")}
              settings={this.props.settings}
              style={this.styles.inputText}
            />
          )
        }
        {
          Theme.isTablet &&
          <View style={this.styles.buttonArea}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.progressionButton]}
              onPress={this.handleContinue}
            >
              <Text style={this.styles.btnPrimaryText}>{I18n.t("continue")}</Text>
            </TouchableOpacity>
            {
              this.props.onCancel &&
              <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.progressionButton]}
                onPress={this.props.onCancel}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            }
          </View>
        }
      </BaseView>
    );
  }

  private renderEmailFieldContainer(emailField: React.ReactNode): JSX.Element {
    return (
      <>
        {
          !Theme.isTablet &&
          <KeyboardAwareScrollView style={this.styles.fill} contentContainerStyle={this.styles.fill}>
            {emailField}
          </KeyboardAwareScrollView>
        }
        {
          Theme.isTablet &&
          <View style={this.styles.fill}>
            {emailField}
          </View>
        }
      </>
    );
  }

  private handleContinue = (): void => {
    if (this.props.valid) {
      this.formSubmissionMethod();

      this.canContinueWithCustomerEmail = true;
    }
  }

  private formSubmissionMethod = (): void => {
    handleFormSubmission(logger, this.props.submit);
  }
}

const reduxFormAttachedReceiptEmailForm = reduxForm({
  form: "receiptEmailAddress",
  validate: (values: EmailForm): EmailForm => {
    if (!values.receiptEmail) {
      return { receiptEmail: I18n.t("emailMissing") };
    }

    if (!isEmail(values.receiptEmail)) {
      return { receiptEmail: I18n.t("invalidEmail") };
    }
  },
  asyncValidate: async (values: EmailForm, dispatch: Dispatch,
                        props: DecoratedFormProps<EmailForm, Props>): Promise<EmailForm> => {
    if (getAdvanceEmailVerification(props.settings.configurationManager)) {
      let externalEmailValidationResult: string;
      try {
        externalEmailValidationResult = await loadEmailVerification(
          props.settings.diContainer,
          props.settings.configurationManager,
          values.receiptEmail
        );
      } catch (error) {
        logger.warn("Error during email verification, bypassing to allow email submission.", error);
      }
      if (externalEmailValidationResult) {
        const functionalBehaviors: IConfigurationValues = props.settings.configurationManager.
            getFunctionalBehaviorValues();
        const advancedEmailVerification: IConfigurationValues = functionalBehaviors.advancedVerificationBehaviors;
        const invalidWithByPassEmailMessageConfigs: IConfigurationValues = advancedEmailVerification &&
            advancedEmailVerification.invalidWithByPassEmailMessage;
        const invalidWithByPassEmailMessage: string = invalidWithByPassEmailMessageConfigs &&
                                                      invalidWithByPassEmailMessageConfigs[I18n.currentLocale()];

        const externalEmailValidationFailedWithBypass: boolean = externalEmailValidationResult ===
            invalidWithByPassEmailMessage || externalEmailValidationResult === I18n.t("invalidWithBypassEmailMessage");

        if (!externalEmailValidationFailedWithBypass) {
          return { receiptEmail: externalEmailValidationResult };
        }
      }
    }

    return { receiptEmail: undefined };
  },
  asyncBlurFields: ["receiptEmail"],
  onSubmit: (data: EmailForm, dispatch: Dispatch<any>, props: Props) => {
    props.setReceiptEmail(data.receiptEmail);
  }
})(ReceiptEmailForm);

const mapStateToProps = (state: AppState): StateProps => {
  return {
    customer: state.businessState.stateValues.get("transaction.customer"),
    receiptEmail: state.receipt.receiptEmail,
    settings: state.settings,
    receiptState: state.receipt,
    businessState: state.businessState
  };
};

const mapDispatchToProps: DispatchProps = {
  setReceiptEmail: setReceiptEmail.request
};


export default connect<
StateProps,
DispatchProps,
Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, mapDispatchToProps)(reduxFormAttachedReceiptEmailForm);
