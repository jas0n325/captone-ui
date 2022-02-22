import * as React from "react";
import { G, Path } from "react-native-svg";

const Calculator = {
  svg:
    <G>
      <Path d="M19 3H5a2.006 2.006 0 0 0-2 2v14a2.006 2.006 0 0 0 2 2h14a2.006 2.006 0 0 0 2-2V5a2.006 2.006 0 0 0-2-2zm0 16H5V5h14z" fill="#007aff"/>
      <Path d="M0 0H5V1.5H0z" transform="translate(6.25 7.72)" fill="#007aff"/>
      <Path d="M0 0H5V1.5H0z" transform="translate(13 15.75)" fill="#007aff"/>
      <Path d="M0 0H5V1.5H0z" transform="translate(13 13.25)" fill="#007aff"/>
      <Path d="M8 18h1.5v-2h2v-1.5h-2v-2H8v2H6V16h2z" fill="#007aff"/>
      <Path d="M14.09 10.95l1.41-1.41 1.41 1.41 1.06-1.06-1.41-1.42 1.41-1.41L16.91 6 15.5 7.41 14.09 6l-1.06 1.06 1.41 1.41-1.41 1.42z" fill="#007aff"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default Calculator;
