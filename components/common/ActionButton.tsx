import * as React from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

import Theme from "../../styles";
import { IconType } from "./constants";
import { actionButtonStyle } from "./styles";
import { ButtonType, getTestIdProperties } from "./utilities";
import VectorIcon from "./VectorIcon";

interface Props {
  style?: StyleProp<ViewStyle>;
  type?: ButtonType;
  disabledStyle?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  icon?: IconType;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  subTitle?: string;
  subTitleStyle?: StyleProp<TextStyle>;
  allowTextWrap?: boolean;
  onPress: () => void;
  testID?: string;
}

interface State {
  pressStatus: boolean;
}

export default class ActionButton extends React.PureComponent<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.state = {
      pressStatus: false
    };

    this.styles = Theme.getStyles(actionButtonStyle());
  }

  public render(): JSX.Element {
    const { icon, title, subTitle, testID, ...attributes} = this.props;
    let buttonTypeStyle;
    let titleTextStyle;
    let subTitleTextStyle;
    if (this.props.type) {
      switch (this.props.type) {
        case ButtonType.Primary:
          titleTextStyle = this.styles.btnPrimaryText;
          buttonTypeStyle = this.styles.btnPrimary;
          subTitleTextStyle = this.styles.btnSubTitleText;
          break;
        case ButtonType.Secondary:
          titleTextStyle = this.styles.btnSecondayText;
          buttonTypeStyle = this.props.subTitle ? this.styles.btnSecondayDetailed : this.styles.btnSeconday;
          subTitleTextStyle = this.styles.btnSubTitleText;
          break;
        case ButtonType.Tertiary:
          titleTextStyle = this.styles.btnTertiaryText;
          buttonTypeStyle = this.styles.btnTertiary;
          subTitleTextStyle = this.styles.btnSubTitleText;
          break;
        case ButtonType.Tile:
        default:
          titleTextStyle = [this.styles.btnText, this.styles.btnIconText];
          buttonTypeStyle = this.styles.btnAction;
          subTitleTextStyle = this.styles.btnActionText;
          break;
      }
    } else {
      titleTextStyle = [this.styles.btnText, this.styles.btnIconText];
      buttonTypeStyle = this.styles.btnAction;
      subTitleTextStyle = this.styles.btnActionText;
    }

    return (
        <TouchableOpacity
            {...attributes}
            activeOpacity={1}
            style={[
              buttonTypeStyle,
              this.props.style || {},
              this.state.pressStatus ? Object.assign(this.styles.btnHover,
                  this.props.hoverStyle || {}) : {},
              this.props.disabled ? this.props.disabledStyle || this.styles.btnDisabled : {}
            ]}
            {...getTestIdProperties(testID, "actionButton-button")}
            disabled={this.props.disabled}
            onPress={this.props.onPress}
            onPressIn={() => this.setState({pressStatus: true})}
            onPressOut={() => this.setState({pressStatus: false})}
        >
          {icon && this.getIcon(icon)}
          {title &&
          <Text
              style={[
                titleTextStyle,
                this.props.disabled ? this.styles.btnTextDisabled : {},
                this.props.titleStyle || {}
              ]}
              {...getTestIdProperties(testID, "actionButton-title")}
              adjustsFontSizeToFit={!this.props.allowTextWrap}
              numberOfLines={this.props.allowTextWrap ? 2 : 1}
          >
            {title}
          </Text>
          }
          {subTitle &&
          <Text
              style={[
                subTitleTextStyle,
                this.props.disabled ? this.styles.btnTextDisabled : {},
                this.props.subTitleStyle || {}
              ]}
              {...getTestIdProperties(testID, "actionButton-subtitle")}
              adjustsFontSizeToFit={!this.props.allowTextWrap}
              numberOfLines={this.props.allowTextWrap ? 2 : 1}
          >
            {subTitle}
          </Text>
          }
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
        fill={icon.color || (this.props.disabled ? this.styles.btnIconDisabled : this.styles.btnIcon).color}
      />
    );
  }
}
