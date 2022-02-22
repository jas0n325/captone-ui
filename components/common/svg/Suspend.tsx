import * as React from "react";
import { G, Path } from "react-native-svg";

const Suspend = {
  svg:
    <G>
      <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
      <Path d="M0 0h2v8H0z" transform="translate(9 8)"/>
      <Path d="M0 0h2v8H0z" transform="translate(13 8)"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default Suspend;
