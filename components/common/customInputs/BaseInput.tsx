import * as React from "react";
import {
  KeyboardTypeOptions,
  ReturnKeyType,
  Text,
  TextInput,
  View
} from "react-native";
import { connect } from "react-redux";

import { TimerUpdateType } from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, updateTimers } from "../../../actions";
import Theme from "../../../styles";
import { StyleGroupProp } from "../constants";
import EditButton from "../EditButton";
import { textInputStyle } from "../styles";
import { combineComponentStyleWithPropStyles, getTestIdProperties } from "../utilities";


export interface BaseInputProps {
  autoCapitalize?: "characters" | "none" | "sentences" | "words";
  style?: StyleGroupProp;
  onRef?: any;
  placeholder?: string;
  placeholderSentenceCase?: boolean;
  placeholderTextColor?: string;
  returnKeyType?: ReturnKeyType;
  value: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: (value?: string) => void;
  onChangeText: (inputValue: string) => void;
  onSubmitEditing?: () => void;
  onPress?: () => void;
  persistPlaceholder?: boolean;
  persistPlaceholderStyle?: StyleGroupProp;
  testID?: string;
  preconfiguredEmployeeDiscount?: boolean;
  selectTextOnFocus?: boolean;
}

interface DispatchProps {
  updateTimers: ActionCreator;
}

interface Props extends BaseInputProps, DispatchProps {
  disableEditButton?: boolean;
}

class BaseInput extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(textInputStyle());
  }

  public render(): JSX.Element {
    let placeholder = this.props.placeholder ? this.props.placeholder : "";
    if (placeholder.length > 0 && (this.props.placeholderSentenceCase === undefined ? true :
        this.props.placeholderSentenceCase)) {
      placeholder = placeholder.charAt(0).toUpperCase() + placeholder.slice(1).toLowerCase();
    }
    return (
        <>
          {
            this.props.persistPlaceholder &&
            <View style={[
                this.styles.container, !this.props.value && this.styles.clearTopPadding || {},
                this.props.disabled ? this.styles.disabledLabelText : {}]}
            >
              {!!this.props.value &&
                <Text
                {...getTestIdProperties(this.props.testID, "label")}
                style={[
                    this.styles.placeholderLabelText,
                    this.props.persistPlaceholderStyle,
                    this.props.disabled ? this.styles.disabledLabelText : {}
                  ]}
                >
                  {placeholder}
                </Text>}
              {this.renderTextInput(placeholder)}
            </View>
          }
          {
            !this.props.persistPlaceholder &&
            this.renderTextInput(placeholder)
          }
        </>

    );
  }

  private renderTextInput(placeholder: string): JSX.Element {
    return (
      <>
        <TextInput
          style={combineComponentStyleWithPropStyles(
            this.props.style,
            this.styles.inputText
          )}
          value={this.props.value}
          ref={this.props.onRef}
          {...getTestIdProperties(this.props.testID, "textInput")}
          autoCapitalize={this.props.autoCapitalize || undefined}
          autoCorrect={false}
          blurOnSubmit={true}
          selectionColor={this.styles.selectionColor}
          keyboardType={this.props.keyboardType}
          returnKeyType={this.props.returnKeyType ? this.props.returnKeyType : "next"}
          placeholder={placeholder}
          placeholderTextColor={this.props.placeholderTextColor || this.styles.placeholderTextColor}
          secureTextEntry={this.props.secureTextEntry || false}
          selectTextOnFocus={this.props.selectTextOnFocus || false}
          underlineColorAndroid={this.styles.underlineColorAndroid}
          editable={!this.props.disabled}
          maxLength={this.props.maxLength}
          onFocus={() => {
            this.props.updateTimers(TimerUpdateType.UiInteraction);

            if (this.props.onFocus) {
              this.props.onFocus();
            }
          }}
          onBlur={() => {
            this.props.updateTimers(TimerUpdateType.UiInteraction);

            if (this.props.onBlur) {
              this.props.onBlur(this.props.value);
            }
          }}
          onChangeText={(text: string) => {
            this.props.updateTimers(TimerUpdateType.UiInteraction);
            this.props.onChangeText(text);
          }}
          onSubmitEditing={() => {
            this.props.updateTimers(TimerUpdateType.UiInteraction);

            if (this.props.onSubmitEditing) {
              this.props.onSubmitEditing();
            }
          }}
        />
        {
          this.props.preconfiguredEmployeeDiscount && this.props.disabled &&
          <EditButton
            icon={{icon: "Pencil", size: this.styles.icon.fontSize}}
            onPress={this.props.onPress}
            style={this.props.style}
            disabled={this.props.disableEditButton}
          />
        }
      </>
    );
  }

}

export default connect(undefined, { updateTimers })(BaseInput);
