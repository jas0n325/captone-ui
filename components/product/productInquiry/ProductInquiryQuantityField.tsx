import * as React from "react";
import { Text, View } from "react-native";
import { Field } from "redux-form";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import AdderSubtractor from "../../common/AdderSubtractor";
import { renderNumericInputField } from "../../common/FieldValidation";
import { productInquiryDetailStyle } from "../styles";
import { getTestIdProperties } from "../../common/utilities";

interface Props {
  quantity: string;
  onChange: (newQuantity: string) => void;
  isValid: boolean;
  allowQuantityChange: boolean;
}

class ProductInquiryQuantityField extends React.Component<Props> {
  private styles: any;
  private testID: string;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(productInquiryDetailStyle());
    this.testID = "ProductInquiryQuantityField";
  }

  public render(): React.ReactNode {
    return (
        <View style={this.styles.quantityContainer}>
          <View style={[this.styles.quantityRow, !this.props.isValid && this.styles.quantityRowError]}>
            <View style={this.quantityColumnStyle}>
              <View style={this.styles.textPromptPanel}>
                <Text {...getTestIdProperties(this.testID, "quantity-text")} style={this.styles.textPrompt}>
                  { I18n.t("quantity") }
                </Text>
              </View>
              <Field
                name="quantity"
                {...getTestIdProperties(this.testID, "quantity-field")}
                component={renderNumericInputField}
                style={this.styles.inputContainer}
                border={this.styles.inputTextPanel}
                errorStyle={this.styles.textInputError}
                inputStyle={this.styles.input}
                returnKeyType={"done"}
                precision={0}
                disabled={!this.props.allowQuantityChange}
                trimLeadingZeroes
                clearOnFocus
              />
            </View>
            {
              this.props.allowQuantityChange &&
              <AdderSubtractor
                minimum={1}
                onValueUpdate={(newQuantity: number) => this.props.onChange(newQuantity.toString())}
                value={parseInt(this.props.quantity, 10)}
              />
            }
          </View>
        </View>
    );
  }

  private get quantityColumnStyle(): any {
    return [this.styles.quantityColumn, !this.props.allowQuantityChange && this.styles.quantityColumnFullWidth];
  }
}

export default ProductInquiryQuantityField;
