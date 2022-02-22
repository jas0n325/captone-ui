import * as React from "react";
import { G, Path } from "react-native-svg";

const Camera = {
  svg:
    <G>
      <Path d="M20 5h-3l-2-2H9L7 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 14H4V7h3.83l.58-.59L9.83 5h4.34l1.42 1.41.58.59H20z"/>
      <Path d="M12 8a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default Camera;
