import * as React from "react";
import { Circle, G } from "react-native-svg";
import Theme from "../../../styles";

/* tslint:disable */
const Unchecked = {
  svg:
    <G fill={Theme.styles.colors.white} stroke={Theme.styles.colors.grey} strokeWidth={1}>
      <Circle cx="12" cy="12" r="12" fill={Theme.styles.colors.transparent} stroke={Theme.styles.colors.transparent}/>
      <Circle cx="12" cy="12" r="11.5" fill={Theme.styles.colors.transparent} />
    </G>,
  viewBox: "0 0 24 24"
};

export default Unchecked;
