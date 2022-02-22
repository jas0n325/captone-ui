import * as React from "react";

import { NavigationScreenProps } from "../../StackNavigatorParams";
import Comments from "./Comments";

interface Props extends NavigationScreenProps<"comments"> {}

const CommentsScreen = (props: Props) => {
  return <Comments {...props.route.params} navigation={props.navigation} />;
};

export default CommentsScreen;
