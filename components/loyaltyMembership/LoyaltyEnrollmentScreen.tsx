import _ from "lodash";
import * as React from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { DecoratedComponentClass, Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";
import { isEmail } from "validator";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import {
  CollectedDataKey,
  ENROLL_CUSTOMER_EVENT,
  TENDER_CHANGE_CANCEL_EVENT,
  TENDER_CHANGE_EVENT,
  TENDER_CHANGE_FALLBACK_EVENT,
  Usage
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, feedbackNoteAction, sceneTitle, updatePendingPayment } from "../../actions";
import { AppState, BusinessState, FeedbackNoteState, SettingsState } from "../../reducers";
import { PendingPaymentMode } from "../../reducers/pendingPayment";
import Theme from "../../styles";
import FeedbackNote from "../common/FeedbackNote";
import { renderOptionsSelect, RenderSelectOptions, renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { handleFormSubmission } from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { loyaltyPlanCompare } from "../customer/CustomerUtilities";
import { NavigationScreenProps, StackNavigatorParams } from "../StackNavigatorParams";
import { LoyaltyEnrollmentScreenProps } from "./interfaces";
import { loyaltyEnrollmentStyle } from "./styles";

interface LoyaltyEnrollmentForm {
  loyaltyPlan: string;
  membershipType: string;
  emailAddress: string;
}

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
  feedbackNoteState: FeedbackNoteState;
  pendingPaymentMode: PendingPaymentMode;
}

interface DispatchProps {
  sceneTitle: ActionCreator;
  feedbackNoteSuccess: ActionCreator;
  updatePendingPayment: ActionCreator;
}

interface Props extends LoyaltyEnrollmentScreenProps,
    NavigationScreenProps<"loyaltyEnrollment">, StateProps, DispatchProps {}

interface State {
  loyaltyPlans: RenderSelectOptions[];
  loyaltyPlan: RenderSelectOptions;
  membershipType: RenderSelectOptions;
  feedbackNoteMessage: string;
}

interface FieldConfig {
  display: boolean;
  editable: boolean;
  required: boolean;
}

const logger: ILogger = LogManager.getLogger(
    "com.aptos.storeselling.ui.components.loyaltyMembership.LoyaltyEnrollmentScreen"
);

class LoyaltyEnrollmentScreen extends React.Component<Props & InjectedFormProps<LoyaltyEnrollmentForm, Props> &
    FormInstance<LoyaltyEnrollmentForm, Props>, State> {
  private styles: any;
  private membershipTypes: RenderSelectOptions[];
  // @ts-ignore
  private emailAddress: string;
  private readonly emailConfig: FieldConfig;

  public constructor(props: Props & InjectedFormProps<LoyaltyEnrollmentForm, Props> &
      FormInstance<LoyaltyEnrollmentForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(loyaltyEnrollmentStyle());

    this.emailAddress = this.props.emailAddress;
    this.emailConfig = getEmailFieldBehavior(this.props);

    this.state = {
      loyaltyPlans: undefined,
      loyaltyPlan: undefined,
      membershipType: undefined,
      feedbackNoteMessage: undefined
    };
  }

  public componentDidMount(): void {
    (async () => {
      //default will be first entry
      const selectedPlan = this.props.customer.availableLoyaltyPlans[0];
      const loyaltyPlans =
          this.props.customer.availableLoyaltyPlans.sort(loyaltyPlanCompare).map((value) => {
            return {
              code: value.loyaltyPlanKey,
              description: value.description || value.name
            };
          });
      this.setState({
        loyaltyPlans,
        loyaltyPlan: {
          code: selectedPlan.loyaltyPlanKey,
          description: selectedPlan.description
        },
        feedbackNoteMessage: undefined
      }, () => {this.props.change("loyaltyPlan", selectedPlan?.loyaltyPlanKey);});

      this.props.initialize({
        loyaltyPlan: selectedPlan?.loyaltyPlanKey,
        emailAddress: this.props.emailAddress
      });

    })().catch((error) => { throw logger.throwing(error, "loadLoyaltyEnrollmentFormData", LogLevel.WARN); });
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!(prevProps.feedbackNoteState && prevProps.feedbackNoteState.message) &&
        this.props.feedbackNoteState && this.props.feedbackNoteState.message) {
      this.setState({feedbackNoteMessage: this.props.feedbackNoteState.message});
      this.props.feedbackNoteSuccess();
    }

    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress &&
        this.props.businessState.eventType === ENROLL_CUSTOMER_EVENT &&
        !this.props.businessState.nonContextualData.has(CollectedDataKey.LoyaltyEnrollmentFailureMessage)) {
      this.onExit(false);
    }

    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress &&
        this.props.businessState.eventType === TENDER_CHANGE_CANCEL_EVENT ||
        this.props.businessState.eventType === TENDER_CHANGE_EVENT ||
        this.props.businessState.eventType === TENDER_CHANGE_FALLBACK_EVENT) {
      this.onExit(false);
    }
  }

  public render(): JSX.Element {
    let selectedMembershipType = this.state.membershipType;
    if (this.state.loyaltyPlan) {
      const selectedPlan = this.props.customer.availableLoyaltyPlans.find((plan) => (
          plan.loyaltyPlanKey === this.state.loyaltyPlan.code
      ));
      const canAssignMembershipTypes = selectedPlan.membershipTypes.filter((memType) => (memType.assignAtPos));
      this.membershipTypes = canAssignMembershipTypes && canAssignMembershipTypes.map((type) => {
        return {
          code: type.membershipTypeKey,
          description: type.description || type.name
        };
      });
      const minType = !selectedMembershipType &&
          selectedPlan.membershipTypes.reduce((min, mType) => min.level < mType.level ? min : mType);
      if (!selectedMembershipType) {
        selectedMembershipType = {
          code: minType.membershipTypeKey,
          description: minType.description || minType.name
        };
      }
    }
    if (selectedMembershipType) {
      this.props.change("membershipType", selectedMembershipType.code);
    }
    return (
      <View style={this.styles.fill}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("loyalty")}
          backButton={{ name: "Back", action: () => this.onExit(true) }}
          rightButton={{
            title: I18n.t("enroll"),
            action: () => handleFormSubmission(logger, this.props.submit)
          }}
        />
        <KeyboardAwareScrollView>
          <View style={this.styles.root}>
            {this.renderConditionalError()}
            <View>
              <Field
                name="loyaltyPlan"
                component={renderOptionsSelect}
                errorStyle={this.styles.errorText}
                placeholder={I18n.t("plan")}
                scene="loyaltyPlans"
                options={this.state.loyaltyPlans}
                onOptionChosen={this.changeLoyaltyPlan.bind(this)}
                selectedOption={this.state.loyaltyPlan}
                style={this.styles.loyaltyMain}
              />
            </View>
            <View>
              <Field
                name="membershipType"
                component={renderOptionsSelect}
                errorStyle={this.styles.errorText}
                placeholder={I18n.t("type")}
                scene="membershipTypes"
                style={this.styles.loyaltyMain}
                options={this.membershipTypes}
                onOptionChosen={this.changeMembershipType.bind(this)}
                selectedOption={selectedMembershipType}
              />
            </View>
            {this.renderAdditionalInformationSection()}
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  private onExit(forcePop: boolean): void {
    if (this.props.pendingPaymentMode === PendingPaymentMode.WaitingOnLoyalty) {
      this.props.updatePendingPayment(PendingPaymentMode.WaitingOnPayment);
    } else {
      if (this.props.returnToCustomerScene && !forcePop) {
        this.props.navigation.dispatch(popTo(this.props.returnToCustomerScene as keyof StackNavigatorParams));
      } else {
        this.props.navigation.pop();
      }
    }
  }

  private renderAdditionalInformationSection(): JSX.Element {
    if (!this.emailConfig.display) { return undefined; }
    return (
        <>
          <View style={this.styles.subtitleArea}>
            <Text style={this.styles.subtitleText}>{I18n.t("additionalInformation")}</Text>
          </View>
          <Field name="emailAddress"
                 onRef={(ref: any) => this.emailAddress = ref}
                 disabled={!this.emailConfig.editable}
                 placeholder={I18n.t("email") + (this.emailConfig.required ? "*" : "")}
                 style={this.styles.textInput}
                 inputStyle={{}}
                 keyboardType="email-address"
                 component={renderTextInputField}
                 persistPlaceholder={true}
                 errorStyle={this.styles.errorText} />
        </>
    );
  }

  private renderConditionalError(): JSX.Element {
    return ( this.state.feedbackNoteMessage &&
        <FeedbackNote message={this.state.feedbackNoteMessage}
          style={this.styles}
        />
    );
  }

  private changeLoyaltyPlan(newValue: RenderSelectOptions): void {
    this.setState({loyaltyPlan: newValue, membershipType: undefined, feedbackNoteMessage: undefined}, () => {
      this.props.change("loyaltyPlan", newValue.code);
    });
  }

  private changeMembershipType(newValue: RenderSelectOptions): void {
    this.setState({membershipType: newValue, feedbackNoteMessage: undefined}, () => {
      this.props.change("membershipType", newValue.code);
    });
  }
}

const loyaltyEnrollmentForm = reduxForm<LoyaltyEnrollmentForm, Props>( {
  form: "loyaltyEnrollment",
  validate: (values: LoyaltyEnrollmentForm, props: Props) => {
    const errors: { loyaltyPlan: string, membershipType: string, emailAddress: string } = {
      loyaltyPlan: undefined,
      membershipType: undefined,
      emailAddress: undefined
    };

    const emailConfig = getEmailFieldBehavior(props);

    if (!values.loyaltyPlan) {
      errors.loyaltyPlan = I18n.t("required", { field: I18n.t("loyaltyPlan") });
    }

    if (!values.membershipType) {
      errors.membershipType = I18n.t("required", { field: I18n.t("membershipType") });
    }

    if (emailConfig.required && !values.emailAddress) {
      errors.emailAddress = I18n.t("required", { field: I18n.t("emailAddress") });
    } else if (values.emailAddress && !isEmail(values.emailAddress)) {
      errors.emailAddress = I18n.t("invalidEmail");
    }
    return errors;
  },
  initialValues: {
    loyaltyPlan: undefined,
    membershipType: undefined,
    emailAddress: undefined
  },
  onSubmit(data: LoyaltyEnrollmentForm, dispatch: Dispatch<any>, props: Props): void {
    const email: string = data.emailAddress !== props.emailAddress ? data.emailAddress : undefined;
    props.onSave(data.loyaltyPlan, data.membershipType, email);
  }
});

function getEmailFieldBehavior(props: Props): FieldConfig {
  const fieldConfig: FieldConfig = {
    display: false,
    editable: false,
    required: false
  };
  const loyaltyConfig = props.settings.configurationManager.getCustomerValues().loyalty;
  const enrollmentConfig = loyaltyConfig && loyaltyConfig.enrollment;
  const emailConfig = getEmailConfig(enrollmentConfig);

  fieldConfig.display = emailConfig &&
      ((emailConfig.usage === Usage.Required || emailConfig.usage === Usage.Optional) &&
      !props.emailAddress || props.emailAddress && emailConfig.displayBehavior === "Always");
  fieldConfig.editable = fieldConfig.display &&
      (!props.emailAddress || emailConfig && emailConfig.editableBehavior === "Always");
  fieldConfig.required = fieldConfig.display && fieldConfig.editable && emailConfig &&
      emailConfig.usage === Usage.Required;
  return fieldConfig;
}

function getEmailConfig(enrollment: any): any {
  if (!enrollment) return undefined;
  const emailConfig = _.get(enrollment, "customerFields.emailAddress", {
      usage: Usage.Optional, displayBehavior: "Always", editableBehavior: "Always" });
  // The lodash .get defaults only get applied if customerFields.emailAddress is missing.
  // So provide defaults for any missing customerFields.emailAddress fields.
  return {
    usage: emailConfig.usage || Usage.Optional,
    displayBehavior: emailConfig.displayBehavior || "Always",
    editableBehavior: emailConfig.editableBehavior || "Always"
  };
}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings,
    businessState: state.businessState,
    feedbackNoteState: state.feedbackNote,
    pendingPaymentMode: state.pendingPayment?.mode
  };
}

const mapDispatchToProps: DispatchProps = {
  sceneTitle: sceneTitle.request,
  feedbackNoteSuccess: feedbackNoteAction.success,
  updatePendingPayment: updatePendingPayment.request
};

export default connect<StateProps, DispatchProps, NavigationScreenProps<"loyaltyEnrollment">>(mapStateToProps,
    mapDispatchToProps)(withMappedNavigationParams<DecoratedComponentClass<LoyaltyEnrollmentForm, Props>>()
    (loyaltyEnrollmentForm(LoyaltyEnrollmentScreen)));
