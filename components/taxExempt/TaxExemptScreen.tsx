import * as React from "react";
import TaxExemptComponent from "./TaxExemptComponent";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"taxExempt"> {}

const TaxExemptScreen = (props: Props) => {
  return <TaxExemptComponent {...props.route.params} navigation={props.navigation} />
};

export default TaxExemptScreen;
