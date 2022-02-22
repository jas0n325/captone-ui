import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import ScanLottery from "./ScanLottery";

interface Props extends NavigationScreenProps<"scanLottery"> {}

const ScanLotteryScreen = (props: Props) => {
  return <ScanLottery {...props.route.params} navigation={props.navigation} />;
};

export default ScanLotteryScreen;
