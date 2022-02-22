import * as React from "react";

import { NavigationScreenProps } from "../../StackNavigatorParams";
import ReceiptCategoryChoice from "./ReceiptCategoryChoice";

interface Props extends NavigationScreenProps<"receiptCategoryChoice"> {}

const ReceiptCategoryChoiceScreen = (props: Props) => {
  return <ReceiptCategoryChoice {...props.route.params} navigation={props.navigation} />;
};

export default ReceiptCategoryChoiceScreen;
