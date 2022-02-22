import * as React from "react";

import { GenericPrinterScreen, GenericPrinterScreenProps } from "@aptos-scp/scp-component-rn-device-services";

import { NavigationScreenProps } from "../StackNavigatorParams";

interface Props extends GenericPrinterScreenProps, NavigationScreenProps<"genericPrinter"> {}

export const GenericPrinterScreenWrapper: React.FunctionComponent<Props> = (props) => {
  const params = props.route.params;
  return <GenericPrinterScreen {...params} />;
};
