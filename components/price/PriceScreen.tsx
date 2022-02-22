import * as React from "react";

import PriceComponent from "./PriceComponent";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"price"> {}

const PriceScreen = (props: Props) => {
  return (
    <PriceComponent {...props.route.params} navigation={props.navigation} />
  );
};

export default PriceScreen;
