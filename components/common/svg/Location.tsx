import * as React from "react";
import { Circle, G, Path } from "react-native-svg";

const Location = {
  svg:
    <G>
      <Circle cx="3" cy="3" r="3" transform="translate(9 6)"/>
      <Path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zM7 9a5 5 0 1 1 10 0c0 2.52-2.66 6.79-5 9.84C9.66 15.79 7 11.52 7 9z"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default Location;
