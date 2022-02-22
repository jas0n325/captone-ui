import * as React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import VectorIcon from "../common/VectorIcon";

interface Props {
  styles: {
    navigationBarTitleWrapper?: StyleProp<ViewStyle>,
    navigationBarTitle?: StyleProp<ViewStyle>,
    aptosLogo: {
      color?: string,
      height?: number,
      width?: number
    }
  };
}

export default function AptosLogoNavigationBar(props: Props): JSX.Element {
  const styles = props.styles;
  return (
    <View style={styles.navigationBarTitleWrapper}>
      <View style={styles.navigationBarTitle}>
        <VectorIcon
          name={"Aptos"}
          fill={styles.aptosLogo.color}
          height={styles.aptosLogo.height}
          width={styles.aptosLogo.width}
        />
      </View>
    </View>);
  }
