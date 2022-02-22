import * as React from "react";

import OfflineAuthorization from "./OfflineAuthorization";
import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends NavigationScreenProps<"offlineAuthorization"> {}

const OfflineAuthorizationScreen = (props: Props) => {
  return (
    <OfflineAuthorization
      {...props.route.params}
      navigation={props.navigation}
    />
  );
};

export default OfflineAuthorizationScreen;
