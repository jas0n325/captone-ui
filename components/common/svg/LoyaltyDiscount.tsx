import * as React from "react";
import {G, Path, Rect} from "react-native-svg";
import Theme from "../../../styles";

/* tslint:disable */
const LoyaltyDiscount = {
  svg:
      <G transform="translate(-861 -296)">
        <G transform="translate(861 296)" fill={Theme.styles.colors.white} stroke={Theme.styles.colors.white} stroke-width="1">
          <Rect width="24" height="24" stroke="none"/>
          <Rect x="0.5" y="0.5" width="23" height="23" fill="none"/>
        </G>
        <G transform="translate(861 296)">
          <Path d="M20.667,19H3.333A1.369,1.369,0,0,1,2,17.6V6.4A1.369,1.369,0,0,1,3.333,5H20.667A1.369,1.369,0,0,1,22,6.4V17.6A1.369,1.369,0,0,1,20.667,19ZM3.333,5.7a.685.685,0,0,0-.667.7V17.6a.684.684,0,0,0,.667.7H20.667a.684.684,0,0,0,.667-.7V6.4a.685.685,0,0,0-.667-.7Z"/>
          <G>
            <Path d="M12,9a3,3,0,1,0,3,3A3,3,0,0,0,12,9Zm0,5a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z"/>
          </G>
          <G>
            <Path d="M20,10H16.578a4.95,4.95,0,0,1,0,4H20l-1-2Z"/>
            <Path d="M7.422,14a4.95,4.95,0,0,1,0-4H4l1,2L4,14Z"/>
          </G>
        </G>
      </G>,
  viewBox: "0 0 24 24"
};

export default LoyaltyDiscount;
