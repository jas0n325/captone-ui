import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import IssueGiftCardComponent from "./IssueGiftCardComponent";

interface Props extends NavigationScreenProps<"issueGiftCard"> {}

const IssueGiftCardScreen = (props: Props) => {
  return <IssueGiftCardComponent {...props.route.params} navigation={props.navigation}/>;
};

export default IssueGiftCardScreen;
