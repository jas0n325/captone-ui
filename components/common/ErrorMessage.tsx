import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import BaseView from "./BaseView";
import { errorMessageStyles } from "./styles";

interface Props {
  onAccept: () => void;
  text: string;
}

const ErrorMessage = (props: Props): JSX.Element => {
  const styles = Theme.getStyles(errorMessageStyles());
  return (
    <BaseView style={styles.modalContainer}>
      <View style={styles.modalView}>
        <View style={styles.textPanel}>
          <Text style={styles.primaryText}>{props.text}</Text>
        </View>
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => { props.onAccept(); }} >
            <Text style={styles.closeButtonText}>{I18n.t("ok")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseView>
  );
};

export default ErrorMessage;
