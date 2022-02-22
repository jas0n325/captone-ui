import * as React from "react";
import { Circle, G, Path } from "react-native-svg";

const Cash = {
  svg:
    <G>
      <Path d="M22 5H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM5 17a2 2 0 0 0-2-2V9a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2z"/>
      <Circle cx="3" cy="3" r="3" transform="translate(9 9)"/>
      <Circle cx="1" cy="1" r="1" transform="translate(5 11)"/>
      <Circle cx="1" cy="1" r="1" transform="translate(17 11)"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default Cash;
