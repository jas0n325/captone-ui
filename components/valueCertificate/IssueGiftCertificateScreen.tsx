import * as React from "react";

import { NavigationScreenProps } from "../StackNavigatorParams";
import IssueGiftCertificateComponent from "./IssueGiftCertificateComponent";

interface Props extends NavigationScreenProps<"issueGiftCertificate"> {}

const IssueGiftCertificateScreen = (props: Props) => {
  return <IssueGiftCertificateComponent {...props.route.params} navigation={props.navigation}/>;
};

export default IssueGiftCertificateScreen;
