import * as React from "react";
import { View } from "react-native";

import { IPerformanceTimeline } from "@aptos-scp/scp-component-store-selling-core";


export interface Props {
  performanceTL: IPerformanceTimeline;
  markName: string;
  measureName?: string;
  startMarkName?: string;
}
export interface State {}

/**
 * The PerformanceComponent can be inserted into the "render" method of other components to allow marks/measurements
 * to be made while the JSX.Element returned by that render method is being executed.
 */
class PerformanceComponent extends React.Component<Props, State> {
  public render(): JSX.Element {
    if (this.props.measureName) {
      this.props.performanceTL.markAndMeasure(this.props.markName, this.props.measureName, this.props.startMarkName);
    } else {
      this.props.performanceTL.mark(this.props.markName);
    }
    return (
      <View/>
    );
  }
}

export default PerformanceComponent;
