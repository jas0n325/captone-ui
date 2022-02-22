import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import TaxActionPanel from "./TaxActionPanel";

interface Props extends NavigationScreenProps<"taxActionPanel"> {}

const TaxActionPanelScreen = (props: Props) => {
  return <TaxActionPanel {...props.route.params} navigation={props.navigation}/>;
};

export default TaxActionPanelScreen;
