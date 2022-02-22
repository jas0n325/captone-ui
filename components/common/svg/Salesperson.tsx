import * as React from "react";
import { Circle, G, Path } from "react-native-svg";

const Salesperson = {
  svg:
    <G>
      <Path d="M18 3h-5V2h-2v1H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 17H6V5h5v1h2V5h5z"/>
      <Circle cx="2" cy="2" r="2" transform="translate(10 9)"/>
      <Path d="M12.84 14h-1.68a1.06 1.06 0 0 0-.31.05l-2.17.72a1 1 0 0 0-.68 1V17h8v-1.28a1 1 0 0 0-.68-1L13.15 14a1.06 1.06 0 0 0-.31 0z"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default Salesperson;

