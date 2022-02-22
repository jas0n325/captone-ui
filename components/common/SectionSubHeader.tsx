import * as React from "react";
import { Text, View } from "react-native";

import { getTestIdProperties } from "./utilities/utils";

export interface Props {
    styles?: any;
    testID?: string;
}

export const SectionSubHeader: React.FunctionComponent<Props> = (props) => {
    return (
            <View style={props.styles.sectionSubHeader}>
                <Text
                    style={props.styles.sectionSubHeaderText}
                    {...getTestIdProperties(props.testID, "section")}>
                    {props.children}
                </Text>
            </View>
    );
};

export default SectionSubHeader;
