import * as React from "react";
import { G, Path, Rect } from "react-native-svg";

/* tslint:disable */
const CautionCircle = {
  svg:
      <G transform="translate(2 2)">
        <Path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" transform="translate(-2 -2)" />
        <Rect width="2" height="6" transform="translate(9 5)" />
        <Rect width="2" height="2" transform="translate(9 13)" />
      </G>,
  viewBox: "0 0 24 24"
};

export default CautionCircle;
