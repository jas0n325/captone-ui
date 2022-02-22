import * as React from "react";
import { G, Path } from "react-native-svg";

const Note = {
  svg:
      <G>
        <Path fill="none" d="M0 0h24v24H0z" />
        <Path d="M7 6h10v2H7zM7 10h10v2H7zM7 14h4v2H7z" />
        <Path d="M19 2H5a2 2 0 00-2 2v16a2 2 0 002 2h9l2-2 3-3 2-2V4a2 2 0 00-2-2zm0 12h-6v6H5V4h14z" />
      </G>,
  viewBox: "0 0 24 24"
};

export default Note;
