import * as React from "react";

import SvgIcon from "react-native-svg-icon";
import Svg from "./svg/Svg";


export interface Props {
  fill?: string;
  height?: number;
  name: string;
  stroke?: string;
  strokeWidth?: number;
  width?: number;
  viewBox?: string;
  testId?: string;
}

const VectorIcon = (props: Props) => <SvgIcon
    fill={props.fill}
    height={props.height}
    name={props.name}
    stroke={props.stroke}
    strokeWidth={props.strokeWidth}
    width={props.width ? props.width : props.height}
    viewBox={props.viewBox}
    svgs={Svg}
    testId={props.testId}
  />;

export default VectorIcon;
