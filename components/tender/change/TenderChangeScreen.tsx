import * as React from "react";

import { NavigationScreenProps } from "../../StackNavigatorParams";
import TenderChangeComponent from "./TenderChangeComponent";

interface Props extends NavigationScreenProps<"tenderChange"> {}

const IssueGiftCertificateScreen = (props: Props) => {
  return <TenderChangeComponent {...props.route.params} navigation={props.navigation}/>;
};

export default IssueGiftCertificateScreen;
