import * as React from "react";
import {G, Path, Rect} from "react-native-svg";

const ChevronUp = {
  svg:
      <G>
        <Rect width="24" height="24" fill="none"/>
        <Path d="M12 7.75l-7.09 7.09 1.42 1.41L12 10.58l5.67 5.67 1.42-1.41z" transform="translate(.09 .25)"/>
      </G>,
  viewBox: "0 0 24 24"
};

export default ChevronUp;
