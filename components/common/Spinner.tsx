import * as React from "react";
import { ActivityIndicator, View, ViewStyle } from "react-native";
import { activityIndicatorColor } from "../styles";


const styles: { [name: string]: ViewStyle } = {
  spinnerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  overlaySpinnerStyle: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center"
  }
};

export interface Props {
  overlay?: boolean;
  size?: number;
  containerStyle?: ViewStyle;
}
export interface State {}

class Spinner extends React.Component<Props, State> {

  public render(): JSX.Element {
    const spinnerStyle = this.props.overlay ? styles.overlaySpinnerStyle : styles.spinnerStyle;

    return (
      <View style={[spinnerStyle, this.props.containerStyle || {}]}>
        <ActivityIndicator size={this.props.size || "large"} color={activityIndicatorColor} />
      </View>
    );
  }
}

export default Spinner;
