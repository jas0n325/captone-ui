import * as React from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";

import Theme from "../../styles";
import { toastPopUpStyles } from "./styles";


interface Props {
  textToDisplay: string;
  hidePopUp: () => void;
}

const ToastPopUp = (props: Props): JSX.Element => {
  const styles = Theme.getStyles(toastPopUpStyles());

  const closeToastTimeoutId = setTimeout(props.hidePopUp, 5000);

  const handlePopUpPressed = (): void => {
    clearTimeout(closeToastTimeoutId);
    props.hidePopUp();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePopUpPressed}>
      <View style={styles.root}>
        <Text style={styles.displayedText} numberOfLines={2} ellipsizeMode={"tail"}>
          {props.textToDisplay}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ToastPopUp;
