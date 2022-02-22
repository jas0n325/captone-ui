import * as React from "react";

import { InputType } from "../Input";
import BaseInput, { BaseInputProps } from "./BaseInput";


export interface Props extends BaseInputProps {
  decimalPrecision?: number;
  onPress?: () => void;
  preconfiguredEmployeeDiscount?: boolean;
}

export interface State {
  textValue: string;
}

export default class PercentageInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      textValue : this.props.decimalPrecision ? this.handleDecimalPrecision(props.value) : this.filterText(props.value)
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.value !== this.props.value && !this.props.decimalPrecision) {
      this.setState({ textValue: this.filterText(this.props.value) });
    }
  }

  public render(): JSX.Element {
    return (
      <BaseInput
        {...this.props}
        value={this.state.textValue}
        onChangeText={this.handleChangeText.bind(this)}
        keyboardType={this.props.keyboardType || InputType.numeric}
        onPress={this.props.onPress}
        preconfiguredEmployeeDiscount={this.props.preconfiguredEmployeeDiscount}
      />
    );
  }

  private handleChangeText(text: string): void {
    const textValue: string = this.props.decimalPrecision ?
      this.handleDecimalPrecision(text) : this.filterText(text);
    this.setState({ textValue });
    this.props.onChangeText(textValue);
  }

  private handleDecimalPrecision(text: string): string {
    const regex = new RegExp(`(^([0-9]{0,}\.?)(?:[0-9]{0,${this.props.decimalPrecision}})?)|%$`, "g");
    const checkForMultiplePercent = text.match(/%/g);
    if (checkForMultiplePercent) {
      text = text.replace(/%/g, "");
      text += "%";
    }
    const isValidRegex: RegExpMatchArray = text.match(regex);
    let resultString = "";
    if (isValidRegex) {
      resultString = isValidRegex.join("");
    }
    if (this.textLengthWasReduced(resultString)) {
      resultString = resultString.substring(0, resultString.length - 1);
      if (!resultString) {
        resultString += "%";
      }
    }
    if (resultString.length && resultString.indexOf("%") === -1) {
      resultString += "%";
    }
    return resultString;
  }

  private filterText(enteredString: string): string {
    let resultString: string = "";

    if (this.shouldSetupTextValue(enteredString)) {
      resultString = "";
    } else {

      if (this.enteredStringIsEmpty(enteredString)) {
        resultString = this.state.textValue;
      } else {
        resultString = this.filterEnteredText(enteredString);
      }

      if (this.textLengthWasReduced(resultString)) {
        resultString = this.handleTextDecrease(resultString);
      } else if (this.textLengthIncreased(resultString)) {
        resultString = this.handleTextIncrease(resultString);
      }

      if (resultString.indexOf("%") === -1) {
        resultString += "%";
      }
    }

    return resultString;
  }

  private shouldSetupTextValue(enteredString: string): boolean {
    return !this.state && !enteredString;
  }

  private enteredStringIsEmpty(enteredString: string): boolean {
    return this.state && this.state.textValue && !enteredString;
  }

  private filterEnteredText(enteredString: string): string {
    let result: string = "";
    const filteredCharacters = enteredString.match(/(\d|%)/g);
    filteredCharacters ? filteredCharacters.forEach((char: string) => result += char) : result = "";
    return result;
  }

  private textLengthWasReduced(enteredString: string): boolean {
    return this.state && this.state.textValue && enteredString.length < this.state.textValue.length;
  }

  private handleTextDecrease(data: string): string {
    // User hit backspace on the '%', remove the last number instead
    if (data.indexOf("%") === -1) {
      data = data.substring(0, data.length - 1) + "%";
    }
    return data;
  }

  private textLengthIncreased(enteredString: string): boolean {
    return this.state && this.state.textValue && enteredString.length > this.state.textValue.length;
  }

  private handleTextIncrease(data: string): string {
    // User added a '%' at the end of the string, remove it
    const checkForMultiplePercent = data.match(/%/g);
    if (checkForMultiplePercent && checkForMultiplePercent.length > 1) {
      data = this.state.textValue;
    }

    // User added numbers after the '%', move them before the percent
    if (data.indexOf("%") < data.length - 1) {
      data = data.replace("%", "");
      data += "%";
    }

    return data;
  }
}
