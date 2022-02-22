import * as React from "react";
import {G, Path, Rect} from "react-native-svg";

const ChevronDown = {
  svg:
      <G>
        <Rect width="24" height="24" fill="none"/>
        <Path d="M17.67 7.75L12 13.42 6.33 7.75 4.91 9.16 12 16.25l7.09-7.09z" transform="translate(.09 .25)"/>
      </G>,
  viewBox: "0 0 24 24"
};

export default ChevronDown;
