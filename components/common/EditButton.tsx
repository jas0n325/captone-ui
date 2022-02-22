
import * as React from "react";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";

import Theme from "../../styles";
import { IconType } from "./constants";
import { editButtonStyle } from "./styles";
import VectorIcon from "./VectorIcon";

interface Props {
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  icon?: IconType;
  onPress: () => void;
  disabled?: boolean;
}

interface State {
  pressStatus: boolean;
}

export default class EditButton extends React.PureComponent<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(editButtonStyle());
    this.state = {
      pressStatus: false
    };
  }

  public render(): JSX.Element {
    const { icon} = this.props;
    return (
        <TouchableOpacity
            activeOpacity={.6}
            style={[
              this.props.style || {},
              this.styles.editButtonArea,
              this.state.pressStatus ? Object.assign(this.styles.btnHover,
                this.props.hoverStyle || {}) : {}
            ]}
            onPress={this.props.onPress}
            disabled={this.props.disabled}
        >
          {icon && this.getIcon(icon)}
          {this.props.children}
        </TouchableOpacity>
    );
  }

  private getIcon(icon: IconType): JSX.Element {
    return (
      <VectorIcon
        name={icon.icon as string}
        height={icon.size || this.styles.btnIcon.fontSize}
        width={icon.size || this.styles.btnIcon.fontSize}
        fill={icon.color ||  this.styles.btnIcon.color}
      />
    );
  }
}
