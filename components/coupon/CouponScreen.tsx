import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import CouponComponent from "./CouponComponent";

interface Props extends NavigationScreenProps<"coupon"> {}

const CouponScreen = (props: Props) => {
  return <CouponComponent {...props.route.params} navigation={props.navigation} />;
};

export default CouponScreen;
