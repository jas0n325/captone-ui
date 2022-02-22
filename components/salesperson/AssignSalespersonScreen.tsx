import * as React from "react";
import AssignSalespersonComponent from "./AssignSalespersonComponent";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"assignSalesperson"> {}

const AssignSalespersonScreen = (props: Props) => {
  return (
    <AssignSalespersonComponent
      {...props.route.params}
      navigation={props.navigation}
    />
  );
};

export default AssignSalespersonScreen;
