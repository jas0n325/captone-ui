import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import ItemSubscription from "./ItemSubscription";

interface Props extends NavigationScreenProps<"itemSubscription"> {}

const ItemSubscriptionScreen = (props: Props) => {
  return <ItemSubscription {...props.route.params} navigation={props.navigation}/>;
};

export default ItemSubscriptionScreen;
