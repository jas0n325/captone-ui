import * as React from "react";

import ReceiptPhoneNumberForm from "./ReceiptPhoneNumberForm";
import { NavigationScreenProps } from "../../StackNavigatorParams";

interface Props extends NavigationScreenProps<"receiptPhoneNumberForm"> {}

const ReceiptPhoneNumberFormScreen = (props: Props) => {
  return <ReceiptPhoneNumberForm {...props.route.params} navigation={props.navigation} />;
};

export default ReceiptPhoneNumberFormScreen;
