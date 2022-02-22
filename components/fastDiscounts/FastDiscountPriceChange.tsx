import * as React from "react";
import {Text, View} from "react-native";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import {CurrencyInput} from "../common/FieldValidation";
import {fastDiscountStyles} from "./styles";

interface Props {
  priceChangeDisplayText: string;
  price: string;
  newPriceDisplayText: string;
  currency: string;
  onFocus: () => void;
  onBlur: () => void;
  onSubmitEditing: () => {};
  onRef: (ref: any) => void;
  onChange: (price: string) => void;
}

const FastDiscountPriceChange = (props: Props) => {
  const styles = Theme.getStyles(fastDiscountStyles());

  return (
    <View style={styles.discountPanel}>
      <Text style={styles.priceChangeText}>
        {`${props.priceChangeDisplayText}: ${props.price}`}
      </Text>
      <Text style={styles.newPriceText}>
        {props.newPriceDisplayText}
      </Text>
      <View style={styles.formArea}>
        <CurrencyInput
          name="price"
          onRef={props.onRef}
          blurOnSubmit={false}
          placeholder={I18n.t("enterNewPrice")}
          style={styles.inputFormArea}
          inputStyle={styles.inputForm}
          errorStyle={styles.errorTextStyle}
          currency={props.currency}
          keyboardType={"phone-pad"}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onSubmitEditing={props.onSubmitEditing}
          onChange={props.onChange}
        />
      </View>
    </View>
  );
};

export default FastDiscountPriceChange;
