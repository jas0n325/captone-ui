import * as React from "react";
import { G, Path } from "react-native-svg";

const EmployeePlaceholder = {
  svg:
    <G transform="translate(32 32)">
      <G fill="none">
        <Path d="M0 0h32v32H0z"/>
        <Path fill="rgba(0,0,0,0.38)" d="M1 1v30h30V1H1M0 0h32v32H0V0z"/>
      </G>
      <Path fill="rgba(0,0,0,0.38)" d="M1612 3005.536l6.5-11.932 2.2 4.04 3.741-6.871 1.762-3.236 9.8 18z" transform="translate(-1608 -2978.053)"/>
    </G>,
  viewbox: "0 0 32 32",
  width: "32",
  height: "32"
};

export default EmployeePlaceholder;
