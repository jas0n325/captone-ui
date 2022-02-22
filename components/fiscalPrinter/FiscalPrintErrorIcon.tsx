import React from "react";
import { View } from "react-native";
import VectorIcon from "../common/VectorIcon";

export interface Props {
  fill: string;
  height: number;
  styles: any;
  stroke?: string;
  strokeWidth?: number;
  width?: number;
  viewBox?: string;
}

const ErrorIcon = (props: Props) => {
  return (
    <View style={props.styles}>
      <VectorIcon
        name={"CautionCircle"}
        fill={props.fill}
        height={props.height}
      />
    </View>
  )
}

export default ErrorIcon;