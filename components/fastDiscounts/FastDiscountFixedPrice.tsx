import * as React from "react";
import {Text, View} from "react-native";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import {CurrencyInput} from "../common/FieldValidation";
import {fastDiscountStyles} from "./styles";

interface Props {
  priceChangeDisplayText: string;
  price: string;
  currency: string;
  onFocus: () => void;
  onBlur: () => void;
  onSubmitEditing: () => {};
  onRef: (ref: any) => void;
}

const FastDiscountFixedPrice = (props: Props) => {
  const styles = Theme.getStyles(fastDiscountStyles());

  return (
    <View style={styles.root}>
      <View style={styles.priceChangePanel}>
        <Text style={styles.priceChangeText}>
          {`${props.priceChangeDisplayText}: ${props.price}`}
        </Text>
      </View>
      <CurrencyInput
        name="fixedPrice"
        onRef={props.onRef}
        blurOnSubmit={false}
        placeholder={I18n.t("newFixedPrice")}
        style={styles.inputFormArea}
        inputStyle={styles.inputForm}
        errorStyle={styles.errorTextStyle}
        currency={props.currency}
        keyboardType={"phone-pad"}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onSubmitEditing={props.onSubmitEditing}
      />
    </View>
  );
};

export default FastDiscountFixedPrice;
