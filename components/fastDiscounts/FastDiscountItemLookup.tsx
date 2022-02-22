import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { IFeatureAccessConfig } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import { renderInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import { warnBeforeLosingChanges } from "../common/utilities";
import { fastDiscountStyles } from "./styles";
import { cameraScannerInputStyles } from "../common/styles";

interface StateProps {
  settings: SettingsState;
}

interface Props extends StateProps {
  fastDiscountFeature: IFeatureAccessConfig;
  searchItems: (data: FastDiscountItemLookupForm) => void;
  onExit: () => void;
}

export interface FastDiscountItemLookupForm {
  searchValue: string;
}

type FastDiscountItemLookupProps = Props & InjectedFormProps<FastDiscountItemLookupForm, Props>
    & FormInstance<FastDiscountItemLookupForm, undefined>;

class FastDiscountItemLookup extends React.Component<FastDiscountItemLookupProps> {
  private styles: any;
  private inputStyles: any;

  constructor(props: FastDiscountItemLookupProps) {
    super(props);

    this.styles = Theme.getStyles(fastDiscountStyles());
    this.inputStyles = Theme.getStyles(cameraScannerInputStyles());
  }

  public render(): JSX.Element {
    const { handleSubmit } = this.props;
    const inputStyles = this.inputStyles;

    return (
      <View style={this.styles.root}>
        <Header
          title={this.props.fastDiscountFeature.discountNameDisplayText[I18n.currentLocale()] || I18n.t("fastDiscount")}
          backButton={{
            name: "Back",
            action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onExit)
          }}
        />
        <View style={this.styles.inputWrapper}>
          <Field
            name="searchValue"
            component={renderInputField}
            overrideOnSubmitEditing={handleSubmit(this.props.searchItems)}
            returnKeyType={"search"}
            inputContainerStyle={inputStyles.transparentBackground}
            style={inputStyles.inputPanel}
            inputStyle={inputStyles.inputField}
            cameraIcon={{
              icon: "Camera",
              size: inputStyles.cameraIcon.fontSize,
              color: inputStyles.cameraIcon.color,
              position: "right",
              style: inputStyles.cameraIconPanel
            }}
            placeholder={I18n.t("enterOrScanItem")}
            settings={this.props.settings}
            inputType={InputType.text}
            errorStyle={inputStyles.inputError}
            placeholderStyle={inputStyles.placeholderStyle}
          />
        </View>
        {
          Theme.isTablet &&
          <View style={this.styles.actions}>
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.button]}
              onPress={() => warnBeforeLosingChanges(
                this.props.dirty,
                this.props.onExit
              )}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }
}

const FastDiscountItemLookupForm = reduxForm<FastDiscountItemLookupForm, Props>({
  form: "fastDiscount",
  validate : (values: FastDiscountItemLookupForm) => {
    const errors: { searchValue: string } = { searchValue: undefined };
    if (!values.searchValue) {
      errors.searchValue = I18n.t("itemDescriptionMissing");
    }
    return errors;
  },
  initialValues: { searchValue: undefined }
})(FastDiscountItemLookup);


function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings
  };
}

export default connect(mapStateToProps, {})(FastDiscountItemLookupForm);
