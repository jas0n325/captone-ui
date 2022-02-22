import * as React from "react";
import { Text, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  NO_SALE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { renderReasonSelect, RenderSelectOptions, renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { handleFormSubmission, warnBeforeLosingChanges } from "../common/utilities";
import { getTitle18nCode } from "../common/utilities/tillManagementUtilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { TillVarianceReasonScreenProps } from "./interfaces";
import { tillVarianceReasonStyles } from "./styles";

interface TillVarianceReasonForm {
  reasonCode: RenderSelectOptions;
  comment: string;
}

interface Props extends TillVarianceReasonScreenProps, NavigationScreenProps<"varianceReason"> {}

interface State {}

const logger: ILogger = LogManager.getLogger(
  "com.aptos.storeselling.ui.components.tillManagement.TillVarianceReasonScreen"
);

class TillVarianceReasonScreen extends React.Component<Props & InjectedFormProps<
    TillVarianceReasonForm, Props> & FormInstance<TillVarianceReasonForm, undefined>, State> {
  private styles: any;

  public constructor(props: Props & InjectedFormProps<TillVarianceReasonForm, Props> &
      FormInstance<TillVarianceReasonForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(tillVarianceReasonStyles());
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <Header
          isVisibleTablet={Theme.isTablet}
          title = {I18n.t(this.props.eventType === NO_SALE_EVENT ? "noSaleHeader" : "varianceReasonHeader")}
          backButton={!this.props.hideBackButton ? {
            name: "Back",
            title: Theme.isTablet ? I18n.t(getTitle18nCode(this.props.eventType)) : undefined,
            action: () => warnBeforeLosingChanges(this.props.dirty, this.pop)
          } : <View />}
          rightButton={{
            title: I18n.t("proceed"),
            action: () => handleFormSubmission(logger, this.props.submit)
          }}
        />
        <View style={this.styles.root}>
          {
            this.props.reasons &&
            <>
              <View style={this.styles.header}>
                <Text style={this.styles.textTitle}>
                  {
                    I18n.t(this.props.eventType === NO_SALE_EVENT ? "selectReasonCode" : "selectReasonVariance")
                  }
                </Text>
              </View>
              <View style={this.styles.reason}>
                <Field
                  name={"reasonCode"}
                  component={renderReasonSelect}
                  errorStyle={this.styles.errorText}
                  placeholder={I18n.t("reasonCode")}
                  reasons={this.props.reasons}
                  style={this.styles.reasonCodeInput}
                />
              </View>
            </>
          }
          <View style={this.styles.commentHeader}>
            <Field
              name={`comment`}
              component={renderTextInputField}
              placeholder={I18n.t("comments")}
              style={this.styles.field}
              inputStyle={this.styles.inputField}
              multiline={true}
              numberOfLines={3}
            />
          </View>
       </View>
      </BaseView>
    );
  }

  private pop = () => {
    this.props.navigation.pop();
  }

}
const TillVarianceForm = reduxForm<TillVarianceReasonForm, Props>({
  form: "tillVarianceReason",
  validate: (values: TillVarianceReasonForm, props: Props) => {
    const errors: { reasonCode: string, comment: string } = { reasonCode: undefined, comment: undefined };

    if (!values.reasonCode || !values.reasonCode.code) {
      errors.reasonCode = I18n.t("required", { field: I18n.t("reasonCode") });
    }

    return errors;
  },
  initialValues: {
    reasonCode: undefined,
    comment: undefined
  },
  onSubmit(data: TillVarianceReasonForm, dispatch: Dispatch<any>, props: Props): void {
    props.onSave(data.comment, data.reasonCode);
  }
})(TillVarianceReasonScreen);

export default withMappedNavigationParams<typeof TillVarianceForm>()(TillVarianceForm);
