import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import CustomerResults from "./CustomerResults";

interface Props extends NavigationScreenProps<"customerList"> {}

const CustomerResultsScreen = (props: Props) => {
  return <CustomerResults {...props.route.params} navigation={props.navigation}/>;
};

export default CustomerResultsScreen;
