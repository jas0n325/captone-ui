import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { Customer } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { ActionCreator, setReceiptPhoneNumber, Settings } from "../../../actions";
import { AppState } from "../../../reducers";
import Theme from "../../../styles";
import BaseView from "../../common/BaseView";
import { renderNumericInputField } from "../../common/FieldValidation";
import Header from "../../common/Header";
import { handleFormSubmission } from "../../common/utilities";
import { NavigationProp } from "../../StackNavigatorParams";
import { ReceiptPhoneNumberFormScreenProps } from "./interfaces";
import { receiptPhoneNumberFormStyles } from "./styles";


const logger: ILogger = LogManager.getLogger(
  "com.aptos.storeselling.ui.components.receipt.receiptFlow.ReceiptEmailForm"
);

interface PhoneNumberForm {
  receiptPhoneNumber: string;
}

interface StateProps {
  customer: Customer;
  receiptPhoneNumber: string;
  settings: Settings;
}

interface DispatchProps {
  setReceiptPhoneNumber: ActionCreator;
}

interface Props extends ReceiptPhoneNumberFormScreenProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

type ReceiptPhoneNumberFormProps = Props & InjectedFormProps<PhoneNumberForm, Props> &
                                   FormInstance<PhoneNumberForm, undefined>;

class ReceiptPhoneNumberForm extends React.Component<ReceiptPhoneNumberFormProps> {
  private canContinueWithCustomerPhoneNumber: boolean = false;
  private receiptPhoneNumberRef: any;
  private styles: any;

  public constructor(props: ReceiptPhoneNumberFormProps) {
    super(props);

    this.styles = Theme.getStyles(receiptPhoneNumberFormStyles());
  }

  public componentDidMount(): void {
    if (this.props.customer && this.props.customer.phoneNumber) {
      this.props.change("receiptPhoneNumber", this.props.customer.phoneNumber);
    }

    if (this.receiptPhoneNumberRef) {
      this.receiptPhoneNumberRef.focus();
    }
  }

  public componentDidUpdate(prevProps: ReceiptPhoneNumberFormProps): void {
    const phoneNumberWasSet: boolean = prevProps.receiptPhoneNumber !== this.props.receiptPhoneNumber &&
                                       !!this.props.receiptPhoneNumber;

    const userWantsToUseCustomerPhoneNumber: boolean = this.props.customer && this.props.submitSucceeded &&
        this.canContinueWithCustomerPhoneNumber;

    if (phoneNumberWasSet || userWantsToUseCustomerPhoneNumber) {
      this.canContinueWithCustomerPhoneNumber = false; // Prevent multiple usages of this.props.onContinue

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
        <KeyboardAwareScrollView style={this.styles.fill} contentContainerStyle={this.styles.fill}>
          <Field
            name={"receiptPhoneNumber"}
            onRef={(ref: any) => this.receiptPhoneNumberRef = ref}
            component={renderNumericInputField}
            errorStyle={this.styles.errorText}
            placeholder={I18n.t("phoneNumber")}
            settings={this.props.settings}
            style={this.styles.inputText}
          />
        </KeyboardAwareScrollView>
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

  private handleContinue = (): void => {
    if (this.props.valid) {
      this.formSubmissionMethod();

      this.canContinueWithCustomerPhoneNumber = true;
    }
  }

  private formSubmissionMethod = (): void => {
    handleFormSubmission(logger, this.props.submit);
  }
}

const reduxFormAttachedReceiptPhoneNumberForm = reduxForm({
  form: "receiptPhoneNumber",
  validate: (values: PhoneNumberForm): PhoneNumberForm => {
    if (!values.receiptPhoneNumber) {
      return { receiptPhoneNumber: I18n.t("phoneNumberMissing") };
    }

    if (values.receiptPhoneNumber.length < 4) {
      return { receiptPhoneNumber: I18n.t("invalidPhoneNumber") };
    }
  },
  onSubmit: (data: PhoneNumberForm, dispatch: Dispatch<any>, props: Props) => {
    props.setReceiptPhoneNumber(data.receiptPhoneNumber);
  }
})(ReceiptPhoneNumberForm);

const mapStateToProps = (state: AppState): StateProps => {
  return {
    customer: state.businessState.stateValues.get("transaction.customer"),
    receiptPhoneNumber: state.receipt.receiptPhoneNumber,
    settings: state.settings
  };
};

const mapDispatchToProps: DispatchProps = {
  setReceiptPhoneNumber: setReceiptPhoneNumber.request
};


export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, mapDispatchToProps)(reduxFormAttachedReceiptPhoneNumberForm);

