import * as React from "react";

import I18n from "../../../../config/I18n";
import { InputType } from "../Input";
import BaseInput, { BaseInputProps } from "./BaseInput";

export interface Props extends BaseInputProps {
  trimLeadingZeroes: boolean;
  negative?: boolean;
  precision?: number;
  clearOnFocus?: boolean;
  requiredNumericOnly?: boolean;
  maxValue?: number;
  minValue?: number;
}
export interface State {
  textValue: string;
}

export default class NumericInput extends React.Component<Props, State> {
  private separator: string;

  constructor(props: Props) {
    super(props);
    this.separator = I18n.t("currency.format.decimalSeparator");
    this.state = {
      textValue : this.cleanNonNumericChars(props.value)
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.value !== this.props.value) {
      this.setState({ textValue: this.cleanNonNumericChars(this.props.value) });
    }
  }

  public render(): JSX.Element {
    return (
      <BaseInput
        {...this.props}
        value={this.state.textValue}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onChangeText={this.handleChangeText}
        keyboardType={this.props.keyboardType || InputType.numeric}
      />
    );
  }

  /**
   * Clean the entered value.
   *
   * @param text the text
   *
   * @return cleaned String with only [0-9.-] chars
   */
  private cleanNonNumericChars(text: string): string {
    if (!text || typeof text !== "string") {
      return "";
    }
    return this.trimLeadingZeroes(this.removeUnneededDashes(this.removeNonNumericals(text)));
  }

  private removeNonNumericals(text: string): string {
    // Remove non numeric and non .- chars
    if (this.props.precision === 0 || this.props.requiredNumericOnly) {
      text = text.replace(/[^\d-]/g, "");
    } else {
      if (this.separator === ",") {
        text = text.replace(/[^\d,-]/g, "");
      } else {
        text = text.replace(/[^\d.-]/g, "");
      }
      // Remove extra periods ('.', only one, at most left allowed in the string)
      const splitText = text.split(this.separator);
      text = splitText.shift() + (splitText.length ? this.separator + splitText[0].slice(
          0, this.props.precision || 2) : "");
    }

    return text;
  }

  private removeUnneededDashes(text: string): string {
    // Remove '-' signs if there is more than one, or if it is not most left char
    for (let i = this.props.negative ? 1 : 0; i < text.length; i++)     {
      const char = text.substr(i, 1);
      if (char === "-") {
        text = text.substr(0, i) + text.substr(i + 1);
        // decrement value to avoid skipping character
        i--;
      }
    }

    return text;
  }

  private trimLeadingZeroes(text: string): string {
    // Remove leading zeros
    if (this.props.trimLeadingZeroes) {
      text = text.replace(/^(-)?0+(?=\d)/, "$1"); //?=\d is a positive lookahead, which matches any digit 0-9
    }

    return text;
  }

  private handleChangeText = (text: string): void => {
    let textValue: string = this.cleanNonNumericChars(text);

    let textValueAsInt: number = parseInt(textValue, 10);
    if (Number.isSafeInteger(textValueAsInt) && this.props && (this.props.minValue || this.props.maxValue)) {
      if (this.props.minValue !== undefined && textValueAsInt < this.props.minValue) {
        textValueAsInt = 0;
      } else if (this.props.maxValue !== undefined && textValueAsInt >= this.props.maxValue) {
        textValueAsInt = this.props.maxValue;
      }
      textValue = textValueAsInt.toString();
    }

    this.setState({ textValue });
    this.props.onChangeText(textValue);
  }

  private onFocus = (): void => {
    if (this.props.clearOnFocus) {
      this.setState({ textValue: "" });
    }
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }

  private onBlur = (): void => {
    if (this.replaceValueInTextBoxOnBlur) {
      this.setState({ textValue: this.props.value});
    }
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }

  private get replaceValueInTextBoxOnBlur(): boolean {
    return this.props.clearOnFocus && this.state.textValue.length === 0;
  }
}
