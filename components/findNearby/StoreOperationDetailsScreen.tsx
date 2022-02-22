import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import StoreOperationDetails from "./StoreOperationDetails";

interface Props extends NavigationScreenProps<"storeOperationDetails"> {}

const StoreOperationDetailsScreen = (props: Props) => {
  return <StoreOperationDetails {...props.route.params} navigation={props.navigation}/>;
};

export default StoreOperationDetailsScreen;
