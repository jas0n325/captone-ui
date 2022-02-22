import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import CardRedeemComponent from "./CardRedeemComponent";

interface Props extends NavigationScreenProps<"redeem"> {}

const CardRedeemScreen = (props: Props) => {
  return <CardRedeemComponent {...props.route.params} navigation={props.navigation}/>;
};

export default CardRedeemScreen;
