import * as React from "react";

import BaseInput, { BaseInputProps } from "./BaseInput";


interface Props extends BaseInputProps {
  alphaNumericOnly?: boolean;
}

interface State {
  textValue: string;
}

export default class DefaultTextInput extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      textValue : undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.value !== this.props.value) {
      this.setState({
        textValue: this.props.alphaNumericOnly ? this.cleanNonAlphaNumericChars(this.props.value) : this.props.value
      });
    }
  }

  public render(): JSX.Element {
    return (
      <BaseInput
        {...this.props}
        value={this.props.value || this.state.textValue}
        onChangeText={this.handleChangeText.bind(this)}
      />
    );
  }

  private cleanNonAlphaNumericChars(text: string): string {
    if (!text || typeof text !== "string") {
      return "";
    }
    text = text.replace(/[\W_]/g, "");
    return text;
  }

  private handleChangeText(textValue: string): void {
    let text: string = textValue;
    if (this.props.alphaNumericOnly) {
      text = this.cleanNonAlphaNumericChars(textValue);
    }
    this.setState({ textValue: text });
    this.props.onChangeText(text);
  }
}
