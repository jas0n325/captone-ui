import * as _ from "lodash";
import * as React from "react";
import { Text } from "react-native";
import { getTestIdProperties } from "./utilities/utils";

export interface Props {
    isVisible?: boolean;
    styles?: any;
    isBold?: boolean;
    testID?: string;
}

export const SectionLine: React.FunctionComponent<Props> = (props) => {
    return (
      !(props.isVisible === false) && !_.isEmpty(props.children) && !_.isNil(props.children) &&
      <Text
        style={props.styles.detailsText}
        {...getTestIdProperties(props.testID, "section")}>
        {props.children}
      </Text>
    );
  };

export default SectionLine;
