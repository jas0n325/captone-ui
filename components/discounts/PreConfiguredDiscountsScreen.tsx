import * as React from "react";

import PreConfiguredDiscounts from "./PreConfiguredDiscounts";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"preConfiguredDiscounts"> {}

const PreConfiguredDiscountsScreen = (props: Props) => {
  return (
    <PreConfiguredDiscounts
      {...props.route.params}
      navigation={props.navigation}
    />
  );
};

export default PreConfiguredDiscountsScreen;
