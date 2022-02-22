import * as React from "react";
import { Circle, G, Path } from "react-native-svg";
import Theme from "../../../styles";

/* tslint:disable */
const Checked = {
  svg:
      <G transform="translate(-8 -132)">
        <Circle cx="12" cy="12" r="12" transform="translate(8 132)" stroke={Theme.styles.colors.action} />
        <Path d="M1110,2701.8l5.058,5.244,8.855-8.812" transform="translate(-1097 -2559)" fill={Theme.styles.colors.transparent} stroke={Theme.styles.colors.white} strokeLinecap="round" strokeWidth={3}/>
      </G>,
  viewBox: "0 0 24 24"
};

export default Checked;
