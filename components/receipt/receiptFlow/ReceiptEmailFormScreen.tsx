import * as React from "react";

import ReceiptEmailForm from "./ReceiptEmailForm";
import { NavigationScreenProps } from "../../StackNavigatorParams";

interface Props extends NavigationScreenProps<"receiptEmailForm"> {}

const ReceiptEmailFormScreen = (props: Props) => {
  return <ReceiptEmailForm {...props.route.params} navigation={props.navigation} />;
};

export default ReceiptEmailFormScreen;
