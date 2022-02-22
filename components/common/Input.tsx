import * as React from "react";
import { Text, View } from "react-native";
import { connect } from "react-redux";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../config/I18n";
import { ActionCreator, dataEvent, DataEventType, IKeyedData, IScannerData } from "../../actions";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import CameraScannerButton from "./CameraScannerButton";
import { IconType, StyleGroupProp } from "./constants";
import { BaseInputProps } from "./customInputs/BaseInput";
import DefaultTextInput from "./customInputs/DefaultTextInput";
import NumericInput from "./customInputs/NumericInput";
import { inputStyle } from "./styles";
import { combineComponentStyleWithPropStyles, getTestIdProperties } from "./utilities";


export enum InputType {
  numeric = "numeric",
  text = "text"
}

interface StateProps {
  configManager: IConfigurationManager;
}

interface DispatchProps {
  dataEvent: ActionCreator;
}

interface Props extends Omit<BaseInputProps, "onSubmitEditing">, StateProps, DispatchProps {
  showCamera: boolean;
  cameraIcon?: IconType;
  consecutiveScanningEnabled?: boolean;
  consecutiveScanningDelay?: number;
  clearText?: boolean;
  inputStyle?: StyleGroupProp;
  inputType?: InputType;
  precision?: number;
  style?: StyleGroupProp;
  trimZeros?: boolean;
  maxLength?: number;
  overrideOnSubmitEditing?: () => void;
  testID?: string;
}

class Input extends React.PureComponent<Props> {
  private treatScannerAsKeyboard: boolean = false;
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(inputStyle());

    const peripheralsConfig: any = this.props.configManager.getPeripheralsValues();
    this.treatScannerAsKeyboard = peripheralsConfig && peripheralsConfig.scannerType &&
        peripheralsConfig.scannerType.treatScannerAsKeyboard;
  }

  public render(): JSX.Element {
    const { cameraIcon } = this.props;
    return (
      <View style={combineComponentStyleWithPropStyles(this.props.style, this.styles.root)}>
        {this.props.showCamera && !(cameraIcon && cameraIcon.position === "right") &&
          <CameraScannerButton
            cameraIcon={this.props.cameraIcon}
            disabled={this.props.disabled}
            visible={this.props.showCamera}
            consecutiveScanningEnabled={this.props.consecutiveScanningEnabled}
            consecutiveScanningDelay={this.props.consecutiveScanningDelay}
            testID={this.props.testID}
          />
        }
        {this.treatScannerAsKeyboard &&
        <Text
          style={this.styles.textInput}
          {...getTestIdProperties(this.props.testID, "input")}>
            {this.props.value}
        </Text>
        }
        {!this.treatScannerAsKeyboard && this.renderInputType()}
        {this.props.showCamera && (cameraIcon && cameraIcon.position === "right") &&
          <CameraScannerButton
            cameraIcon={this.props.cameraIcon}
            disabled={this.props.disabled}
            visible={this.props.showCamera}
            consecutiveScanningEnabled={this.props.consecutiveScanningEnabled}
            consecutiveScanningDelay={this.props.consecutiveScanningDelay}
            testID={this.props.testID}
          />
        }
      </View>
    );
  }

  // For Keypad
  private handleClear(): void {
    this.props.onChangeText("");
  }

  // For TextInput
  private handleChangeText(text: string): void {
    let inputValue: string = text;
    let submitEditing: boolean = false;

    // For scanners that act as keyboards.
    // Note: if we keep this, then we should make the prefix and suffix values configurable.
    // This will handle scanners when the prefix is configured to be "<" and suffix 1 is ">" and suffix 2 is ">".
    // Scanners that use LF or CR+LF as the suffix will have handleSubmitEditing called by the TextInput.
    if (inputValue.startsWith("<") && inputValue.endsWith(">>")) {
      // Scanner input with 1 prefix character and 2 suffix characters.
      inputValue = inputValue.substr(1, inputValue.length - 3);
      submitEditing = true;

      // If somehow, a CR or LF suffix gets into here, handle that also.
    } else if (inputValue.endsWith("\n") || inputValue.endsWith("\r")) {
      inputValue = inputValue.trim();
      submitEditing = true;
    }

    // Note: We might want to hide the scanner prefix, code type and suffix from the user.
    // That is capture the prefix, AIM prefix and suffix separate from the displayed value.
    this.props.onChangeText(inputValue);

    if (submitEditing) {
      // Note: This passes the inputValue to handleSubmitEditing instead of just letting it get the value from the
      // state, because the state is not always updated by the time handleSubmitEditing asks it for the inputValue, and
      // it gets the old value with the prefix and suffix still attached.
      this.handleSubmitEditing(inputValue);
    }
  }

  // For scanners that act as keyboards
  private handleSubmitEditing = (inputValue?: string): void => {
    // Sometimes the state doesn't update fast enough, so if we have a parameter, prefer that.
    if (! inputValue) {
      inputValue = this.props.value;
    }
    let barcodeType: string;

    // For scanners that act as keyboards
    if (this.treatScannerAsKeyboard) {
      if (inputValue.startsWith("]")) {// AIM prefix from Symbol scanner
        const response: {inputValue: string, barcodeType: string} = this.parseAimPrefix(inputValue);
        inputValue = response.inputValue;
        barcodeType = response.barcodeType;
      }
    }

    this.props.onChangeText(inputValue);

    if (barcodeType) {
      // Submit a data event, and let the data event saga sort-out what to do with it.
      const data: IScannerData = {
        encoding: barcodeType,
        data: inputValue
      };

      this.props.dataEvent(DataEventType.ScanData, data);
    } else {
      const data: IKeyedData = {
        inputText: inputValue
      };
      this.props.dataEvent(DataEventType.KeyedData, data);
    }

    if (this.props.clearText === undefined || this.props.clearText) {
      this.handleClear();
    }
  }

  // For scanners that act as keyboards
  private parseAimPrefix(text: string): { inputValue: string, barcodeType: string } {
    let inputValue: string = text;
    let barcodeType: string;

    const aimBarcodeType = inputValue.charAt(1);
    // tslint:disable-next-line:no-small-switch to preserve commented code
    switch (aimBarcodeType) {
        // case "A":
        //   barcodeType = "Code 39";
        //   break;
        // case "C":
        //   barcodeType = "Code 128";
        //   break;
      case "E":
        // The E type adds an extra
        const aimBarcodeOption = inputValue.charAt(2);
        inputValue = inputValue.substr(3);
        switch (aimBarcodeOption) {
          case "0": // UPC-A, UPC-E, and EAN-13
            // The symbol DS6878 scanner doc. says "Standard data packet in full EAN format, i.e. 13 digits", so if we
            // always get 13 digits, how do we know which type it is: UPC-A, UPC-E or EAN-13?
            // Actually, its even worse, because the UPC-E (8 digit) value is not only returned as 13 digits, the digits
            // are also rearranged.
            // For now, assuming EAN-13, since that's what the scanner seems to be providing.
            // if (inputValue.length === 13) {
            barcodeType = "EAN-13";
            // } else if (inputValue.length === 12) {
            //   barcodeType = "UPC-A";
            // } else if (inputValue.length === 8) {
            //   barcodeType = "UPC-E";
            //   // Could also be EAN-8
            // } else {
            //   throw new Error(`Unrecognized `);
            // }
            break;
          case "4": //EAN-8
            barcodeType = "EAN-8";
            break;
          default:
            throw new Error(`Unsupported barcode AIM Option: "${aimBarcodeOption}".`);
        }
        break;
        // case "Q":
        //   barcodeType = "QR Code";
        //   break;
      default:
        throw new Error(`Unsupported barcode AIM Code: "${aimBarcodeType}".`);
    }

    return { inputValue, barcodeType };
  }

  private renderInputType(): JSX.Element {
    switch (this.props.inputType) {
      case InputType.numeric:
        return this.getNumericInput();
      case InputType.text:
        return this.getDefaultInput();
      default:
        return this.getDefaultInput();
    }
  }

  private getNumericInput(): JSX.Element {
    return (
      <NumericInput
        style={combineComponentStyleWithPropStyles(this.props.inputStyle, this.styles.fill)}
        onRef={this.props.onRef}
        value={this.props.value}
        testID={this.props.testID}
        placeholder={this.props.placeholder || I18n.t("enterOrScanItem")}
        placeholderSentenceCase={this.props.placeholderSentenceCase}
        returnKeyType={this.props.returnKeyType || "done"}
        keyboardType={this.props.keyboardType}
        secureTextEntry={this.props.secureTextEntry || false}
        precision={this.props.precision || 0}
        trimLeadingZeroes={this.props.trimZeros || false}
        onBlur={this.props.onBlur}
        onChangeText={this.handleChangeText.bind(this)}
        onFocus={this.props.onFocus}
        onSubmitEditing={
          typeof this.props.overrideOnSubmitEditing === "function" ?
              this.props.overrideOnSubmitEditing :
              this.handleSubmitEditing}
        placeholderTextColor={this.props.placeholderTextColor}
        maxLength={this.props.maxLength}
        disabled={this.props.disabled}
      />
    );
  }

  private getDefaultInput(): JSX.Element {
    return (
      <DefaultTextInput
          style={combineComponentStyleWithPropStyles(this.props.inputStyle, this.styles.fill)}
          onRef={this.props.onRef}
          value={this.props.value}
          testID={this.props.testID}
          placeholder={this.props.placeholder || I18n.t("enterOrScanItem")}
          placeholderSentenceCase={this.props.placeholderSentenceCase}
          returnKeyType={this.props.returnKeyType || "search"}
          keyboardType={this.props.keyboardType}
          secureTextEntry={this.props.secureTextEntry || false}
          onBlur={this.props.onBlur}
          onChangeText={this.handleChangeText.bind(this)}
          onFocus={this.props.onFocus}
          onSubmitEditing={
            typeof this.props.overrideOnSubmitEditing === "function" ?
                this.props.overrideOnSubmitEditing :
                this.handleSubmitEditing}
          placeholderTextColor={this.props.placeholderTextColor}
          maxLength={this.props.maxLength}
          disabled={this.props.disabled}
          autoCapitalize={this.props.autoCapitalize}
      />
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    configManager: state.settings.configurationManager
  };
};

export default connect(mapStateToProps, {
  dataEvent: dataEvent.request
})(Input);
