import * as React from "react";
import { KeyboardTypeOptions, Platform } from "react-native";

import { AllowedContent } from "@aptos-scp/scp-component-store-selling-features";

import BaseInput, { BaseInputProps } from "./BaseInput";

export interface Props extends BaseInputProps {
  allowedContent?: AllowedContent;
}
export interface State {
  textValue: string;
}

export default class RestrictedContentInput extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      textValue : this.props.value
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.value !== this.props.value) {
      this.setState({ textValue: this.props.value});
    }
  }

  public render(): JSX.Element {
    return (
      <BaseInput
        {...this.props}
        value={this.state.textValue}
        onChangeText={this.handleChangeText.bind(this)}
        keyboardType={this.getKeyboard()}
      />
    );
  }

  private cleanAllowedContent(text: string): string {
    for (let i = 0; i < text.length; i++) {
    const char = text.substr(i, 1);
     if (!validateAllowedContent(char, this.props.allowedContent)) {
        text = text.substring(0, i) + text.substring(i + 1);
        // decrement value to avoid skipping character
        i--;
      }
    }
    return text;
  }

  private getKeyboard(): KeyboardTypeOptions {
    if (this.props.keyboardType) {
      return this.props.keyboardType;
    }
    else if (this.props.allowedContent) {
      return this.getAllowedContentKeyboardType();
    } else {
      return "default";
    }
  }

  private getAllowedContentKeyboardType(): KeyboardTypeOptions {
    if (this.props.allowedContent === AllowedContent.NumbersOnly) {
      return "number-pad";
    } else if (this.props.allowedContent === AllowedContent.NumbersWithDashes) {
      return Platform.OS === "ios" ? "numbers-and-punctuation" : "default";
    } else {
      return "default";
    }
  }

  private handleChangeText = (text: string): void => {
    let textValue: string = text;
    if (this.props.allowedContent) {
      textValue = this.cleanAllowedContent(textValue);
    }
    this.setState({ textValue });
    this.props.onChangeText(textValue);
  }
}

export function validateAllowedContent(value: string,allowedContent: AllowedContent): boolean {
  switch (allowedContent) {
    case AllowedContent.LettersAndNumbers:
      return /^[a-zA-Z 0-9]+$/.test(value);
    case AllowedContent.NumbersOnly:
      return /^[0-9 ]+$/.test(value);
    case AllowedContent.NumbersWithDashes:
      return /^[0-9 \-]+$/.test(value);
    default:
      return true;
  }
}
