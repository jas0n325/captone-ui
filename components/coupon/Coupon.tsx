import * as React from "react";
import { Field, FormInstance, formValueSelector, InjectedFormProps, reduxForm } from "redux-form";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { IPromotionCouponDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, BusinessState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import CouponLine from "../common/CouponLine";
import { renderInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import { couponStyles } from "./styles";
import { cameraScannerInputStyles } from "../common/styles";


export interface CouponForm {
  couponCode: string;
}

interface StateProps {
  businessState: BusinessState;
  couponCode: string;
}

interface Props extends StateProps {
  lines: IPromotionCouponDisplayLine[];
  settings: SettingsState;
  onVoid: (lineNumber: number) => void;
  onCancel: () => void;
}

interface State {
}

class Coupon extends React.Component<Props & InjectedFormProps<CouponForm, Props> &
    FormInstance<CouponForm, undefined>, State> {
  private couponCodeRef: any;
  private styles: any;
  private inputStyles: any;

  public constructor(props: Props & InjectedFormProps<CouponForm, Props> &
      FormInstance<CouponForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(couponStyles());
    this.inputStyles = Theme.getStyles(cameraScannerInputStyles());
  }

  public componentDidMount(): void {
    this.couponCodeRef.focus();
  }

  public componentDidUpdate(prevProps: Props & InjectedFormProps<CouponForm, Props>): void {
    if ((!prevProps.businessState.inProgress && this.props.businessState.inProgress &&
          prevProps.couponCode !== this.props.couponCode && this.props.couponCode === "") ||
        (prevProps.lines.length !== this.props.lines.length)) {
      this.props.reset();
    }
  }

  public render(): JSX.Element {
    const inputStyles = this.inputStyles;

    return (
      <View style={this.styles.root}>
        <Header
            title={I18n.t("coupons")}
            backButton={{name: "Back", action: this.props.onCancel }}
        />
        <Field
            name="couponCode"
            onRef={(ref: any) => this.couponCodeRef = ref}
            component={renderInputField}
            returnKeyType={"search"}
            inputContainerStyle={inputStyles.transparentBackground}
            style={inputStyles.inputPanel}
            inputStyle={inputStyles.inputField}
            errorStyle={inputStyles.inputError}
            placeholderStyle={inputStyles.placeholderStyle}
            placeholder={I18n.t("couponCode")}
            settings={this.props.settings}
            inputType={InputType.text}
            cameraIcon={{
              icon: "Camera",
              size: inputStyles.cameraIcon.fontSize,
              color: inputStyles.cameraIcon.color,
              position: "right",
              style: inputStyles.cameraIconPanel
            }}
        />
        {Theme.isTablet &&
        <View style={this.styles.actions}>
          <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.button]}
            onPress={this.props.onCancel}
          >
            <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
          </TouchableOpacity>
        </View>
        }
        {this.props.lines && this.props.lines.length > 0 &&
        <View style={this.styles.couponList}>
          <View style={this.styles.couponHeader}>
            <Text style={this.styles.couponHeaderText}>{I18n.t("appliedCoupons")}</Text>
          </View>
          <FlatList
              data={this.props.lines}
              renderItem={({ item }) =>
                  <CouponLine
                      line={item}
                      onVoid={this.props.onVoid} /> }
              keyExtractor={(item) => item.lineNumber.toString() } />
        </View>
        }
      </View>
    );
  }
}

const CouponForm = reduxForm<CouponForm, Props>({
  form: "coupon",
  validate: (values: CouponForm, props: Props) => {
    const errors: CouponForm = { couponCode: undefined };
    if (!values.couponCode) {
      errors.couponCode = I18n.t("missingCouponCode");
    }
    return errors;
  }
})(Coupon);

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const selector = formValueSelector("coupon");
  return {
    initialValues: {
      couponCode: ""
    },
    businessState: state.businessState,
    couponCode: selector(state, "couponCode")
  };
};

export default connect<StateProps>(mapStateToProps)(CouponForm);
