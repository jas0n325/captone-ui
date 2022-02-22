import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import Product from "./Product";

interface Props extends NavigationScreenProps<"product"> {}

const ProductScreen = (props: Props) => {
  return <Product {...props.route.params} navigation={props.navigation} />;
};

export default ProductScreen;
