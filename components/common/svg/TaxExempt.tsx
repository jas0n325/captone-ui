import * as React from "react";
import { Circle, G, Path } from "react-native-svg";

const TaxExempt = {
  svg:
    <G>
      <Circle cx="1.5" cy="1.5" r="1.5" transform="translate(7 5)"/>
      <Path d="M0 0H10V1.5H0z" transform="rotate(-53 16.25 -1.125)"/>
      <Circle cx="1.5" cy="1.5" r="1.5" transform="translate(12 10)"/>
      <Path d="M22.54 15A4.87 4.87 0 0 0 21 14V4h2V2H1v2h2v18h2a1 1 0 0 1 2 0h2a1 1 0 0 1 2 0h2a1 1 0 0 1 2 0h.4l.06.08A5.006 5.006 0 1 0 22.54 15zM5 19V4h14v9.54A5 5 0 0 0 14 19zm16.83 1l-1.42 1.41L19 20l-1.41 1.41L16.17 20l1.42-1.42-1.42-1.41 1.42-1.42L19 17.13l1.41-1.42 1.42 1.42-1.42 1.41z" transform="translate(-1 -1)"/>
    </G>,
  viewBox: "0 0 24 23.546"
};

export default TaxExempt;


