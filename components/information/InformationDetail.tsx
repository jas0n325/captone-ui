import * as React from "react";
import { Text, View } from "react-native";


export interface IDProps {
  styles: any;
  label: string;
  value?: any;
  children?: JSX.Element;
  forceMultiLine?: boolean;
}

const InformationDetail = (props: IDProps): JSX.Element => {
  return (
    <View>
      <View style={props.styles.informationLine}>
        <Text style={props.styles.informationTitle}>{props.label}</Text>
        {!props.forceMultiLine && (props.children ||
            (!props.children && <Text style={props.styles.informationText}>{props.value}</Text> ))}
        {props.forceMultiLine && (<Text style={[props.styles.informationText, { height: 0 }]} />)}
      </View>
      {props.forceMultiLine && ((!props.children &&
        <View style={props.styles.informationSecondaryLine}>
          <Text style={props.styles.informationText}>{props.value}</Text>
        </View>
      ) || props.children)}
    </View>
  );
};

export default InformationDetail;
