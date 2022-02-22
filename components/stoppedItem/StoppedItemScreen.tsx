import * as React from "react";

import StoppedItem from "./StoppedItem";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"stoppedItem"> {}

const StoppedItemScreen = (props: Props) => {
  return <StoppedItem {...props.route.params} navigation={props.navigation} />;
};

export default StoppedItemScreen;
