import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import NonIntegratedPayment from "./NonIntegratedPayment";

interface Props extends NavigationScreenProps<"nonIntegratedAuthorization"> {}

const NonIntegratedPaymentScreen = (props: Props) => {
  return <NonIntegratedPayment {...props.route.params} navigation={props.navigation}/>;
};

export default NonIntegratedPaymentScreen;
