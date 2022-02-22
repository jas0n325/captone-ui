import * as React from "react";
import { G, Path } from "react-native-svg";

const QuantityChange = {
  svg:
    <G>
      <Path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9z"/>
      <Path d="M13 6h-2v3H8v2h3v3h2v-3h3V9h-3z"/>
      <Path d="M0 0H8V2H0z" transform="translate(8 16)"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default QuantityChange;

