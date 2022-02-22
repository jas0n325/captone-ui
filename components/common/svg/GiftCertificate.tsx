import * as React from "react";
import { G, Path } from "react-native-svg";

const GiftCertificate = {
  svg:
      <G>
        <Path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H4V6h16z"/>
        <Path d="M8.55 14a3.91 3.91 0 0 1 0-4H5l2 2-2 2z" transform="rotate(-90 13.025 9.025)"/>
        <Path d="M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" transform="translate(4 -2)"/>
        <Path d="M0 0h5v2H0z" transform="translate(6 9)"/>
        <Path d="M0 0h5v2H0z" transform="translate(6 13)"/>
      </G>,
  viewBox: "0 0 24 24",
  width: "24",
  height: "24"
};

export default GiftCertificate;
