import * as React from "react";
import { G, Path } from "react-native-svg";

const LoyaltyCard = {
  svg:
    <G data-name="Layer 2">
      <Path fill="none" d="M0 0h24v24H0z"/>
      <Path
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H4V6h16z"
        data-name="Layer 1"/>
      <Path d="M19 14l-2-2 2-2h-3.55a3.91 3.91 0 0 1 0 4z"/>
      <Path d="M8.55 14a3.91 3.91 0 0 1 0-4H5l2 2-2 2z" />
      <Path d="M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
    </G>,
  viewBox: "0 0 24 24"
};

export default LoyaltyCard;
