import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import TenderPromptRules from "./TenderPromptRules";

interface Props extends NavigationScreenProps<"tenderReference"> {}

const TenderPromptRulesScreen = (props: Props) => {
  return <TenderPromptRules {...props.route.params} navigation={props.navigation}/>;
};

export default TenderPromptRulesScreen;
