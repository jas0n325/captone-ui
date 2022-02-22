import * as React from "react";
import {Text, TouchableOpacity, View} from "react-native";

import {IFastDiscountButton} from "@aptos-scp/scp-component-store-selling-features";
import {ManualDiscountType} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import {fastDiscountStyles} from "./styles";

interface Props {
  titleText: string;
  fastDiscountButtons: IFastDiscountButton[][];
  onFixedPrice: (fastDiscountButton: IFastDiscountButton) => void;
  onFastDiscount: (fastDiscountButton: IFastDiscountButton) => void;
}

const FastDiscountSelection = (props: Props) => {
  const styles = Theme.getStyles(fastDiscountStyles());

  const renderFastDiscountButtonRows = (buttonRow: IFastDiscountButton[], index: number) => {
    return buttonRow &&
      <View
        style={[
          styles.buttonWrapper,
          index === props.fastDiscountButtons.length - 1 ? {} : styles.buttonWrapperBorder
        ]}
      >
        {
          buttonRow.map((button: IFastDiscountButton) => {
            return renderFastDiscountButton(button);
          })
        }
      </View>;
  };

  const renderFastDiscountButton = (button: IFastDiscountButton) => {
    return (
      <TouchableOpacity
        style={styles.btnDiscountAmounts}
        onPress={
          button.manualDiscountType === ManualDiscountType.ReplacementUnitPrice
              ? () => props.onFixedPrice(button) : () => props.onFastDiscount(button)
        }
      >
        <Text style={styles.discountButtonText}>
          { button.displayText[I18n.currentLocale()] || button.displayText[I18n.defaultLocale || "en"] }
        </Text>
      </TouchableOpacity>
    );
  };

  return (
      <View style={styles.discountPanel}>
        <Text style={styles.discountText}>
          {props.titleText}
        </Text>
        {
          props.fastDiscountButtons.map((buttonRow: IFastDiscountButton[], index: number) => {
            return renderFastDiscountButtonRows(buttonRow, index);
          })
        }
      </View>
  );
};

export default FastDiscountSelection;
