import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import { renderNumericInputField, renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { handleFormSubmission } from "../common/utilities";
import { isItemSearchBehaviorsIsNumeric } from "../common/utilities/configurationUtils";
import { notFoundStyle } from "./styles";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.notFound.NotFound");

interface NotFoundForm {
  itemKey: string;
}

interface Props {
  itemKey: string;
  settings: SettingsState;
  onSave: (itemKey: string) => void;
  onCancel: () => void;
}

class NotFound extends React.Component<Props & InjectedFormProps<NotFoundForm, Props> &
    FormInstance<NotFoundForm, undefined>> {
  private styles: any;

  public constructor(props: Props & InjectedFormProps<NotFoundForm, Props> &
      FormInstance<NotFoundForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(notFoundStyle());
  }

  public componentDidMount(): void {
    this.props.initialize({ itemKey : this.props.itemKey });
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("itemNotFoundTitle")}
          backButton={{ name: "Back", action: this.props.onCancel }}
          rightButton={{ title: I18n.t("search"), action: () => handleFormSubmission(logger, this.props.submit) }}
        />
        <Field
          name="itemKey"
          placeholder={I18n.t("enterItemNumber")}
          style={this.styles.textInput}
          component={isItemSearchBehaviorsIsNumeric(this.props.settings.configurationManager)
              ? renderNumericInputField
              : renderTextInputField
          }
          errorStyle={this.styles.textInputError}
          onSubmitEditing={() => handleFormSubmission(logger, this.props.submit)}
          trimLeadingZeroes={false}
        />
        <Text style={this.styles.message}>{I18n.t("itemNotFoundMessage")}</Text>
        {
          Theme.isTablet &&
          <View style={this.styles.actions}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.button, !this.props.valid && this.styles.btnDisabled]}
              disabled={!this.props.valid}
              onPress={() => handleFormSubmission(logger, this.props.submit)}
            >
              <Text style={[this.styles.btnPrimaryText, !this.props.valid && this.styles.btnTextDisabled]}>
                {I18n.t("search")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.button]}
              onPress={() => this.props.onCancel()}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }
}

export default reduxForm<NotFoundForm, Props>({
  form: "notFound",
  validate : (values: any) => {
    const errors: { itemKey: string } = { itemKey: undefined};
    if (!values.itemKey) {
      errors.itemKey = I18n.t("itemKeyMissing");
    }
    return errors;
  },
  initialValues: { itemKey: undefined },
  onSubmit : (data: NotFoundForm, dispatch: Dispatch<any>, props: Props) => {
    props.onSave(data.itemKey);
    Keyboard.dismiss();
  }
})(NotFound);
