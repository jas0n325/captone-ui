import * as React from "react";

import FreeTextComment from "./FreeTextComment";
import { NavigationScreenProps } from "../../StackNavigatorParams";

interface Props extends NavigationScreenProps<"comment"> {}

const FreeTextCommentScreen = (props: Props) => {
  return (
    <FreeTextComment {...props.route.params} navigation={props.navigation} />
  );
};

export default FreeTextCommentScreen;
