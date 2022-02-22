import * as React from "react";
import { TouchableHighlight, View } from "react-native";

import Theme from "../../styles";
import { iconStyles } from "./styles";
import VectorIcon from "./VectorIcon";


export interface SvgProps {
  fill?: string;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  width?: number;
  viewBox?: string;
}

export interface Props {
  name: string;
  size: number;
  color?: string;
  iconStyle?: SvgProps;
  component?: any;
  onLongPress?: () => void;
  onPress?: () => void;
  underlayColor?: string;
  reverse?: boolean;
  raised?: boolean;
  containerStyle?: any;
  reverseColor?: string;
  justifyContent?: string;
}

// tslint:disable-next-line:cyclomatic-complexity
const Icon = (props: Props) => {
  let Component: any = View;
  if (props.onPress) {
    Component = TouchableHighlight;
  }
  if (props.component) {
    Component = props.component;
  }

  const styles = Theme.getStyles(iconStyles());
  const underlayColor: string =  props.underlayColor || "white";
  const reverse: boolean = props.reverse || false;
  const raised: boolean =  props.raised || false;
  const size: number = props.size || 24;
  const color: string = props.color || "black";
  const reverseColor: string = props.reverseColor || "white";

  return (
    <Component
      underlayColor={reverse ? color : underlayColor || color}
      style={[
        (reverse || raised) && styles.button,
        (reverse || raised) && {
          borderRadius: size + 4,
          height: size * 2 + 4,
          width: size * 2 + 4
        },
        raised && styles.raised,
        {
          backgroundColor: reverse ? color : raised ? "white" : "transparent",
          alignItems: "center",
          justifyContent: "center"
        },
        props.containerStyle
      ]}
      onLongPress={props.onLongPress}
      onPress={props.onPress}
    >
      <View>
        <VectorIcon
          fill={reverse ? reverseColor : color}
          height={props.iconStyle && props.iconStyle.height || props.size}
          name={props.name}
          stroke={props.iconStyle && props.iconStyle.stroke}
          strokeWidth={props.iconStyle && props.iconStyle.strokeWidth}
          width={props.iconStyle && props.iconStyle.width || props.size}
          viewBox={props.iconStyle && props.iconStyle.viewBox}
        />
      </View>
    </Component>
  );
};

export default Icon;
