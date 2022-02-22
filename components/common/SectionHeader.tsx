import * as React from "react";
import { Text, View } from "react-native";

export interface Props {
    styles?: any;
}

export const SectionHeader: React.FunctionComponent<Props> = (props) => {
    return (
            <View style={props.styles.sectionHeader}>
                <Text style={props.styles.subtitleText}>{props.children}</Text>
            </View>
    );
};

export default SectionHeader;
