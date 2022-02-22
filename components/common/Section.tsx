import * as React from "react";
import { View} from "react-native";

import I18n from "../../../config/I18n";
import SectionHeader from "./SectionHeader";

export interface Props {
    titleKey?: string;
    styles?: any;
}

export const Section: React.FunctionComponent<Props> = (props) => {
    return (
        <View style={props.styles.section}>
            <View style={props.styles.sectionBody}>
                {props.titleKey && <SectionHeader styles={props.styles}>{I18n.t(props.titleKey)}</SectionHeader>}
                <View>
                    {props.children}
                </View>
            </View>
        </View>
    );
};


