import * as React from "react";

import { NavigationScreenProps } from "../../StackNavigatorParams";
import TaxOverrideComponent from "./TaxOverrideComponent";

interface Props extends NavigationScreenProps<"taxOverrideScreen"> {}

const TaxOverrideScreen = (props: Props) => {
  return <TaxOverrideComponent {...props.route.params} navigation={props.navigation}/>;
};

export default TaxOverrideScreen;
