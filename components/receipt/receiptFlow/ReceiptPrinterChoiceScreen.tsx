import * as React from "react";

import { NavigationScreenProps } from "../../StackNavigatorParams";
import ReceiptPrinterChoice from "./ReceiptPrinterChoice";

interface Props extends NavigationScreenProps<"receiptPrinterChoice"> {}

const ReceiptPrinterChoiceScreen = (props: Props) => {
  return <ReceiptPrinterChoice {...props.route.params} navigation={props.navigation} />;
};

export default ReceiptPrinterChoiceScreen;
