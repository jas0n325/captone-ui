import * as React from "react";
import { G, Path } from "react-native-svg";

const Comment = {
  svg:
    <G>
      <Path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14l4 4V4a2 2 0 0 0-2-2zm0 14v1.17l-.59-.58-.58-.59H4V4h16z"/>
      <Path d="M0 0H10V2H0z" transform="translate(7 7)"/>
      <Path d="M0 0H7V2H0z" transform="translate(7 11)"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default Comment;

