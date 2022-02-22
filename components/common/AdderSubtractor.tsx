import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import Theme from "../../styles";
import { adderSubtractorStyles } from "./styles";
import { getTestIdProperties } from "./utilities";


interface Props {
  maximum?: number;
  minimum?: number;
  onValueUpdate: (newValue: number) => void;
  value: number;
  style?: any;
  disabled?: boolean;
}

const AdderSubtractor = (props: Props): JSX.Element => {
  const styles = Theme.getStyles(adderSubtractorStyles());
  const customButtonAreaStyle = props.style && props.style.buttonArea;
  const customIconTextStyle = props.style && props.style.iconText;
  const testID = "AdderSubtractor";
  const onAdd = () => {
    const newValue = props.value + 1;
    if (props.maximum === undefined || newValue <= props.maximum) {
      props.onValueUpdate(newValue);
    }
  };

  const onSubtract = () => {
    const newValue = props.value - 1;
    if (props.minimum === undefined || newValue >= props.minimum) {
      props.onValueUpdate(newValue);
    }
  };

  return (
    <View style={[styles.root, props.style || {}]}>
      <TouchableOpacity {...getTestIdProperties(testID, "quantity-subtract")}
        style={[styles.buttonArea, props.disabled && styles.disabledButtonArea,
          styles.subtractorArea, customButtonAreaStyle]}
        onPress={onSubtract} disabled={props.disabled}>
        <Text style={[styles.iconText, props.disabled && styles.disabledIconText, customIconTextStyle]}>-</Text>
      </TouchableOpacity>
      <TouchableOpacity  {...getTestIdProperties(testID, "quantity-add")}
        style={[styles.buttonArea, props.disabled && styles.disabledButtonArea,
          styles.adderArea, customButtonAreaStyle]}
          onPress={onAdd} disabled={props.disabled}>
        <Text style={[styles.iconText, props.disabled && styles.disabledIconText, customIconTextStyle]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdderSubtractor;
