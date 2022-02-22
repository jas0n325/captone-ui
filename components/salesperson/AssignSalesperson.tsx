import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { warnBeforeLosingChanges } from "../common/utilities";
import { assignSalespersonStyle } from "./styles";


export interface AssignSalespersonForm {
  salesperson: string;
}

export interface OwnProps {
  onAssign: (salesperson: string) => void;
  employeeId: string;
  onSkip: () => void;
  canSkip: boolean;
  isTransactionStarting: boolean;
}

export interface Props extends OwnProps {}

export interface State {}

class AssignSalesperson extends React.Component<Props & InjectedFormProps<AssignSalespersonForm, OwnProps> &
    FormInstance<AssignSalespersonForm, OwnProps>, State> {
  private styles: any;

  public constructor(props: Props & InjectedFormProps<AssignSalespersonForm, Props> &
      FormInstance<AssignSalespersonForm, OwnProps>) {
    super(props);

    this.styles = Theme.getStyles(assignSalespersonStyle());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("salesperson")}
          backButton={!this.props.isTransactionStarting ? {
            name: "Back",
            action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onSkip)
          } : <View /> }
          rightButton={this.props.canSkip && { title: I18n.t("skip"), action: this.props.onSkip }}
        />
        <Field name="salesperson" placeholder={I18n.t("enterSalesperson")} placeholderSentenceCase={false}
               style={this.styles.textInput} component={renderTextInputField} errorStyle={this.styles.textInputError}
               keyboardType="numbers-and-punctuation" onSubmitEditing={() => this.props.submit()}/>
        <View style={this.styles.actions}>
          <TouchableOpacity
            style={[this.styles.btnPrimary, this.styles.button, !this.props.valid && this.styles.btnDisabled]}
            disabled={!this.props.valid}
            onPress={() => this.props.submit()}
          >
            <Text style={[this.styles.btnPrimaryText, !this.props.valid && this.styles.btnTextDisabled]}>
              {I18n.t("assign")}
            </Text>
          </TouchableOpacity>
          {
            Theme.isTablet && (this.props.canSkip || !this.props.isTransactionStarting) &&
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.button]}
              onPress={() => this.props.onSkip()}
            >
              <Text style={this.styles.btnSecondayText}>
                {I18n.t(this.props.canSkip ? "skip" : "cancel")}
              </Text>
            </TouchableOpacity>
          }
        </View>
      </View>
    );
  }

  public componentDidUpdate(prevProps: Props & InjectedFormProps<AssignSalespersonForm>): void {
    const employeeId = this.props.employeeId;
    if (employeeId && employeeId !== prevProps.employeeId) {
      this.props.change("salesperson", employeeId);
    }
  }
}

export default reduxForm<AssignSalespersonForm, OwnProps>({
  form: "assignSalesperson",
  validate: (values: AssignSalespersonForm) => {
    const errors: { salesperson: string } = {salesperson: undefined};
    if (!values.salesperson) {
      errors.salesperson = I18n.t("required", {field: I18n.t("salesperson")});
    }
    return errors;
  },
  initialValues: {
    salesperson: undefined
  },
  onSubmit: (data: AssignSalespersonForm, dispatch: Dispatch<any>, props: Props) => {
    props.onAssign(data.salesperson);
    Keyboard.dismiss();
  }
})(AssignSalesperson);
