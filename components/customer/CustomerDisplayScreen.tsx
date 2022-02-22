import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import CustomerDisplay from "./CustomerDisplay";

interface Props extends NavigationScreenProps<"customerDisplay"> {}

const CustomerDisplayScreen = (props: Props) => {
  return <CustomerDisplay {...props.route.params} navigation={props.navigation}/>;
};

export default CustomerDisplayScreen;
