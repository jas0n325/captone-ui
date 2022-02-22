import Color from "color";
import * as React from "react";
import { Image, KeyboardTypeOptions, StatusBar, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { connect } from "react-redux";

import { AppState, UiState } from "../../reducers";
import Theme from "../../styles";
import { IconType } from "../common/constants";
import { getTestIdProperties } from "../common/utilities";
import { StyleGroupProp } from "./constants";
import Input, { InputType } from "./Input";
import { headerStyles } from "./styles";
import VectorIcon from "./VectorIcon";

interface StateProps {
  uiState: UiState;
}

interface OwnProps {
  title?: string;
  titleStyle?: TextStyle;
  backButton?: HeaderButton;
  rightButton?: HeaderButton;
  rightButtons?: HeaderButton[];
  style?: ViewStyle;
  isVisibleTablet?: boolean;
  image?: any;
  showInput?: boolean;
  returnMode?: boolean;
  inputCameraIcon?: IconType;
  consecutiveScanningEnabled?: boolean;
  consecutiveScanningDelay?: number;
  inputDisabled?: boolean;
  isNumeric?: boolean;
  renderInSingleLine?: boolean;
  inputStyle?: {
    inputAreaStyle: StyleGroupProp;
    inputTextBoxStyle: StyleGroupProp;
    placeholderTextColor: string;
  };
  testID?: string;
  inputPlaceholder?: string;
  inputKeyboardType?: KeyboardTypeOptions;
}

interface Props extends StateProps, OwnProps {}

export type HeaderButton = JSX.Element | VectorIconButton;

interface VectorIconButton {
  name?: string;
  action: () => void;
  title?: string;
  testID?: string;
  accessibilityLabel?: string;
}

interface State {
  inputValue: string;
}

class Header extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(headerStyles());

    this.state = { inputValue: undefined };
  }

  public render(): JSX.Element {
    if (Theme.isTablet) {
      return this.props.isVisibleTablet ? this.renderTablet() : <View />;
    }
    return this.renderPhone();
  }

  public renderPhone(): JSX.Element {
    const { title, backButton, rightButton, rightButtons,
      image, showInput, renderInSingleLine, testID } = this.props;
    if (showInput || renderInSingleLine) {
        return this.getSingleRowHeader();
    } else if (title || backButton || rightButton || image) {
      return (
        <View style={[this.styles.root, this.props.style || {}, this.props.returnMode && this.styles.returnMode]}>
          {(backButton || rightButton || rightButtons) &&
            <View style={this.styles.actions}>
              {backButton && this.getBackButton()}
              {(rightButtons || rightButton) && this.getRightButtons()}
            </View>
          }
          {title &&
            <View style={this.styles.panel}>
              <Text
                {...getTestIdProperties(testID, "header-title")}
                style={[this.styles.title, this.props.titleStyle || {}]}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>
          }
        </View>
      );
    } else {
      return (
        <View style={[this.styles.root, this.props.style || {}]} />
      );
    }
  }

  public renderTablet(): JSX.Element {
    const { title, backButton, rightButton, image, testID } = this.props;

    const headerColor = this.props.returnMode ? this.styles.returnMode.backgroundColor : this.styles.base.backgroundColor;
    const statusBarColor = Color(headerColor).mix(Color(this.styles.black), 0.32);

    return (
      <>
        <View style={this.styles.statusBar}>
          <StatusBar translucent={false} barStyle={statusBarColor.isDark() ? "light-content" : "dark-content"} />
        </View>
        <View style={[this.styles.root, this.props.style || {}, this.styles.tabletRoot,
          this.props.returnMode && this.styles.returnMode]}>
          <View style={[this.styles.elementWrapper, this.styles.leftElement]}>
            { backButton && this.getBackButton() }
          </View>
          {
            this.props.showInput &&
            <View style={this.styles.elementWrapper}>
              { this.renderInput() }
            </View>
          }
          {
            !this.props.showInput &&
            <>
              { image && this.getImage(image)}
              {
                !image &&
                <View style={[this.styles.elementWrapper, this.styles.tabletPanel]}>
                  {
                    title &&
                    <Text
                      {...getTestIdProperties(testID, "header-title")}
                      style={[this.styles.tabletTitle, this.props.titleStyle || {}]}
                      numberOfLines={2}
                    >
                      {title}
                    </Text>
                  }
                </View>
              }
            </>
          }
          <View style={[this.styles.elementWrapper, this.styles.rightElement]}>
            { rightButton && this.getRightButtons() }
          </View>
        </View>
      </>
    );
  }

  private getSingleRowHeader(): JSX.Element {
    const { title, backButton, rightButton, image, showInput, testID } = this.props;
    const shouldCollapse = this.props.uiState.isScrolling && showInput && (!this.props.returnMode ||
        (this.props.returnMode && !rightButton));
    return (
      <View style={[this.styles.base, this.props.style || {}, this.props.returnMode && this.styles.returnMode]}>
        {!shouldCollapse &&
        <>
          <View style={[this.styles.row, this.styles.topRow]}>
            <View style={this.styles.leftArea}>
              {
                backButton &&
                this.getVectorIconButton(this.props.backButton as VectorIconButton, "none")
              }
            </View>
            { image && this.getImage(image) }
            {
              !image && title &&
              <View style={this.styles.centerArea}>
                <Text
                    style={[this.styles.title, this.styles.topRowTitle, this.props.titleStyle || {}]}
                    numberOfLines={2}
                    {...getTestIdProperties(testID, "header-title")}
                >
                  {title}
                </Text>
              </View>
            }
            <View style={this.styles.rightArea}>
              { rightButton && this.getRightButtons() }
            </View>
          </View>
          { showInput &&
          <View style={this.styles.row}>
            { this.renderInput() }
          </View>
          }
        </>
        }
        {shouldCollapse &&
        <View style={[this.styles.row, this.styles.topRow]}>
          <View style={this.styles.leftIcon}>
            {
              backButton &&
              this.getVectorIconButton(this.props.backButton as VectorIconButton, "none")
            }
          </View>
          <View style={[this.styles.row, this.styles.input]}>
            {this.renderInput()}
          </View>
        </View>
        }
      </View>
    );
  }

  private getImage(image: any): JSX.Element {
    return <Image source={image} style={this.styles.headerLogo} resizeMode="contain" />;
  }

  private getVectorIconButton(button: VectorIconButton, direction: string): JSX.Element {
    return (
      <TouchableOpacity
        style={this.styles.vectorButton}
        onPress={button.action}
        {...getTestIdProperties(this.props.testID, `header-${direction}-button`)}
      >
        {
          button.name && (
            <VectorIcon
              name={button.name}
              fill={this.styles.vectorButtonIcon.color}
              height={this.styles.vectorButtonIcon.fontSize}
            />
          )
        }
        <Text style={this.styles.actionTitle}>{button.title}</Text>
      </TouchableOpacity>
    )
  }

  private getBackButton(): JSX.Element {
    if (this.props.backButton.hasOwnProperty("props")) {
      return this.props.backButton as JSX.Element;
    } else if ((this.props.backButton as VectorIconButton).name) {
      return this.getVectorIconButton(this.props.backButton as VectorIconButton, "left");
    }
  }

  private getRightButtons(): JSX.Element {
    if (this.props.rightButtons) {
      return (
        <View style={this.styles.rightButtonsArea}>
          {this.props.rightButtons.map((button) => this.createRightButton(button))}
        </View>
      );
    } else {
      return this.createRightButton(this.props.rightButton);
    }
  }

  private createRightButton(buttonProp: HeaderButton): JSX.Element {
    if (buttonProp.hasOwnProperty("props")) {
      return buttonProp as JSX.Element;
    } else {
      return this.getVectorIconButton(buttonProp as VectorIconButton, "right");
    }
  }

  private renderInput(): JSX.Element {
    const { inputStyle, isNumeric, testID } = this.props;
    return (
      <Input
        inputType={isNumeric ? InputType.numeric : InputType.text}
        keyboardType={this.props.inputKeyboardType}
        cameraIcon={this.props.inputCameraIcon}
        style={inputStyle && inputStyle.inputAreaStyle}
        {...getTestIdProperties(testID, "header-input")}
        inputStyle={inputStyle && inputStyle.inputTextBoxStyle}
        showCamera={!!this.props.inputCameraIcon}
        consecutiveScanningEnabled={this.props.consecutiveScanningEnabled}
        consecutiveScanningDelay={this.props.consecutiveScanningDelay}
        placeholderTextColor={inputStyle && inputStyle.placeholderTextColor}
        value={this.state.inputValue}
        onChangeText={(newInputValue: string) => this.setState({ inputValue: newInputValue })}
        disabled={this.props.inputDisabled}
        placeholder={this.props.inputPlaceholder}
      />
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    uiState: state.uiState
  };
};


export default connect<StateProps, {}, OwnProps>(mapStateToProps, undefined)(Header);
