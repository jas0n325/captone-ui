import * as React from "react";
import { Text, View } from "react-native";
import Icon from "./Icon";
import { getTestIdProperties } from "./utilities";

export interface Props {
    icon?: string;
    isVisible?: boolean;
    styles?: any;
    testID?: string;
}

export const SectionRow: React.FunctionComponent<Props> = (props) => {
  const wrapWithText: boolean = React.Children.count(props.children) === 1
    && typeof React.Children.toArray(props.children)[0] === "string";
  return (
    !(props.isVisible === false) &&
    <View style={[props.styles.sectionRow]}>
      {props.icon && (
        <View style={props.styles.iconPanel}>
          <Icon
            name={props.icon}
            size={props.styles.icon.fontSize}
            color={props.styles.icon.color}
          />
        </View>
      )}
      {wrapWithText ? (
        <Text {...getTestIdProperties(props.testID,"section")} style={props.styles.detailsText}>{props.children}</Text>
      ) : (
        <View style={{flex: 1}}>{props.children}</View>
      )}
    </View>
  );
};

