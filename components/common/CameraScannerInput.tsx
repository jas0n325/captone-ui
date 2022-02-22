import * as React from "react";

import Theme from "../../styles";
import { BaseInputProps } from "./customInputs/BaseInput";
import { IconType } from "./constants";
import Input, { InputType } from "./Input";
import { cameraScannerInputStyles } from "./styles";

interface CameraScannerInputProps extends BaseInputProps {
  testId?: string;
  inputType?: InputType;
  terminalIsOpen?: boolean;
  consecutiveScanningEnabled?: boolean;
  consecutiveScanningDelay?: number;
  clearText?: boolean;
}

class CameraScannerInput extends React.Component<CameraScannerInputProps> {
  private styles: any;

  constructor(props: CameraScannerInputProps) {
    super(props);

    this.styles = Theme.getStyles(cameraScannerInputStyles());
  }

  public get terminalIsClosed(): boolean {
    // In the case that an input does not set "terminalIsOpen" because it
    // can't be accessed unless it is open, terminalIsOpen will be undefined
    // so this only checks for false
    return this.props.terminalIsOpen === false;
  }

  public get cameraIcon(): IconType {
    return {
      icon: "Camera",
      size: this.styles.cameraIcon.fontSize,
      color: this.terminalIsClosed ? this.styles.closedTerminalCameraIconStyles.color : this.styles.cameraIcon.color,
      position: "right",
      style: Object.assign({}, this.styles.cameraIconPanel, this.terminalIsClosed &&
          this.styles.closedTerminalCameraIconStyles)
    };
  }

  public render(): React.ReactNode {
    return (
      <Input
        {...this.props}
        testID={this.props.testId}
        inputType={this.props.inputType}
        style={this.styles.inputPanel}
        inputStyle={[this.styles.inputField, this.terminalIsClosed && this.styles.closedTerminalStyles]}
        cameraIcon={this.cameraIcon}
        showCamera={true}
        placeholderTextColor={this.terminalIsClosed && this.styles.closedTerminalStyles.color}
        disabled={this.terminalIsClosed}
      />
    );
  }
}

export default CameraScannerInput;
