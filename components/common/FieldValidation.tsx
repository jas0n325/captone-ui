import { useNavigation } from "@react-navigation/native";
import _ from "lodash";
import Moment from "moment";
import * as React from "react";
import { KeyboardTypeOptions, ReturnKeyType, Switch, Text, TouchableOpacity, View } from "react-native";
import { MaskService, TextInputMask } from "react-native-masked-text";
import RNPickerSelect from "react-native-picker-select";
import { connect } from "react-redux";
import { Field, WrappedFieldProps } from "redux-form";

import { AllowedContent, TimerUpdateType } from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, DataEventType, IKeyedData, sceneTitle, updateTimers } from "../../actions";
import Theme from "../../styles";
import { colors } from "../../styles/styles";
import { NavigationProp } from "../StackNavigatorParams";
import BaseView from "./BaseView";
import DefaultTextInput from "./customInputs/DefaultTextInput";
import NumericInput from "./customInputs/NumericInput";
import PercentageInput from "./customInputs/PercentageInput";
import RestrictedContentInput from "./customInputs/RestrictedContentInput";
import Input, { InputType } from "./Input";
import {
  fieldValidationStyle,
  selectOptionsStyle,
  selectReasonStyle,
  switchStyle,
  textInputStyle
} from "./styles";
import {
  combineComponentStyleWithPropStyles,
  getCurrencyMask,
  getDateFromISODateString,
  getTestIdProperties
} from "./utilities";
import VectorIcon from "./VectorIcon";

interface DispatchProps {
  updateTimers: ActionCreator;
  sceneTitle: ActionCreator;
}

export interface RenderSelectOptions {
  code: string;
  description: string;
  disabled?: boolean;
  localiseDesc?: string;
}

/**
 * Helper function suitable for use to "sort" Array of RenderSelectOptions, sorting them in ascending order of
 * the RenderSelectOptions.description attribute.
 * @param {RenderSelectOptions} select1
 * @param {RenderSelectOptions} select2
 * @returns {number}
 */
export function compareRenderSelectOptions(select1: RenderSelectOptions, select2: RenderSelectOptions): number {
  //TODO: Consider using "localeCompare" function instead of toUpperCase below to be correct for non-English languages.
  //  Perhaps with "base" sensitivity in the options.
  //  Question: Is the variation of localeCompare accepting an options parameter supported/available in React Native?
  //  The W3Schools docs (https://www.w3schools.com/jsref/jsref_localecompare.asp) don’t show the options parameter,
  //  so it isn’t clear if it's available in the JS runtime used by react native.
  //  Other References:
  //  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
  //  https://docs.microsoft.com/en-us/scripting/javascript/reference/localecompare-method-string-javascript
  //
  if (select1.description.toUpperCase() < select2.description.toUpperCase()) {
    return -1;
  } else {
    if (select1.description.toUpperCase() > select2.description.toUpperCase()) {
      return 1;
    } else {
      return 0;
    }
  }
}

export interface Props {
  style?: any;
  errorStyle?: any;
  hasError: boolean;
  error: string;
  errorTestID?: string;
}
export interface State {
}

export class FieldValidation extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(fieldValidationStyle());
  }

  public render(): JSX.Element {
    return (
      <BaseView style={[this.styles.viewStyle, this.props.style || {}]}>
          {this.props.children}
          {this.props.hasError && this.props.error &&
          <Text
            {...getTestIdProperties(this.props.errorTestID)}
            style={[this.styles.errorStyle,
            this.props.errorStyle || {}]}>
              { this.props.error }
          </Text>
          }
      </BaseView>
    );
  }
}

interface RenderTextInputFieldProps extends WrappedFieldProps {
  input: any;
  placeholder: string;
  onRef?: any;
  returnKeyType?: ReturnKeyType;
  onSubmitEditing?: () => void;
  style?: any;
  inputStyle?: any;
  border?: any;
  placeholderStyle?: any;
  errorStyle?: any;
  secureTextEntry?: boolean;
  keyboardType?: string;
  trimLeadingZeroes?: boolean;
  disabled?: boolean;
  placeholderSentenceCase?: boolean;
  persistPlaceholder?: boolean;
  clearOnFocus?: boolean;
  persistPlaceholderStyle?: any;
  autoCapitalize?: string;
  maxLength?: number;
  errorText?: string;
  useCounter?: boolean;
  alphaNumericOnly?: boolean;
  testID?: string;
  selectTextOnFocus?: boolean;
}

// tslint:disable-next-line:cyclomatic-complexity
export const renderTextInputField = (field: RenderTextInputFieldProps) => {

  const styles = Theme.getStyles(textInputStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && (!!error || !!field.errorText);
  const hasValue: boolean = !!(field.input.value);
  let placeholder = field.placeholder;
  if (placeholder && placeholder.length > 0 && (field.placeholderSentenceCase === undefined ? true :
      field.placeholderSentenceCase)) {
    placeholder = placeholder.charAt(0).toUpperCase() + placeholder.slice(1).toLowerCase();
  }

  return (
    <FieldValidation
      hasError={hasError}
      error={field.errorText || error}
      errorTestID={field.testID && `${field.testID}-error`}
      style={field.style || {}}
      errorStyle={field.errorStyle || {}}>
      <View style={[styles.inputTextPanel, field.border ? field.border : {}]}>
        <DefaultTextInput
          style={[styles.inputText, field.inputStyle || {}, hasValue ? styles.clearPadding : {},
                  (field.disabled) ? styles.disabled : {}, hasError ? styles.inputTextError : {}]}
          onRef={field.onRef}
          testID={field.testID}
          autoCapitalize={field.autoCapitalize || "none"}
          autoCorrect={false}
          value={field.input.value}
          selectionColor={styles.selectionColor}
          persistPlaceholder={field.persistPlaceholder}
          persistPlaceholderStyle={field.persistPlaceholderStyle}
          placeholder={placeholder}
          placeholderTextColor={
            (field.disabled) ? styles.disabledColor : field.placeholderStyle || styles.placeholderTextColor
          }
          placeholderSentenceCase={field.placeholderSentenceCase}
          returnKeyType={field.returnKeyType || "next"}
          secureTextEntry={field.secureTextEntry || false}
          underlineColorAndroid={styles.underlineColorAndroid}
          onBlur={field.input.onBlur}
          onChangeText={field.input.onChange}
          onFocus={field.input.onFocus}
          onSubmitEditing={field.onSubmitEditing}
          keyboardType={field.keyboardType}
          disabled={field.disabled}
          maxLength={field.maxLength}
          alphaNumericOnly={field.alphaNumericOnly || false}
          selectTextOnFocus={field.selectTextOnFocus || false}
          {...field.input}
        />
      </View>
      {shouldShowFieldCounter(field) &&
        <Text style={styles.counterText}>
          {field.input.value.length}/{field.maxLength}
        </Text>
      }
    </FieldValidation>
  );
};

interface RenderSwitchProps extends WrappedFieldProps, DispatchProps {
  disabled?: boolean;
  textStyle?: any;
  switchStyle?: any;
  style?: any;
  errorStyle?: any;
  scene?: string;
  currentValue?: boolean;
  hasError?: boolean;
  switchText: string;
  onValueChange: (newValue: boolean) => void;
  testID?: string;
}

const wrappedSwitch = (field: RenderSwitchProps) => {
  const styles = Theme.getStyles(switchStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && error !== undefined;

  return (
    <FieldValidation
      hasError={hasError}
      error={error}
      errorTestID={field.testID && `${field.testID}-error`}
      errorStyle={field.errorStyle}
      style={[
        styles.switchPanel,
        field.style,
        field.disabled ? styles.disabled : {},
        hasError ? styles.inputTextError : {}
      ]}
    >
      <View style={styles.switchContainer}>
        <Text style={[styles.switchText, field.disabled ? styles.disabled : {}]}>
          {field.switchText}
        </Text>
        <Switch
          style={styles.switch}
          {...getTestIdProperties(field.testID, "switch")}
          trackColor={{true: colors.action, false: colors.lightGrey}}
          thumbColor={styles.thumbColor.color}
          onValueChange={field.onValueChange}
          value={field.currentValue}
          disabled={field.disabled}
        />
      </View>
    </FieldValidation>
  );
};

export const renderSwitch = connect(undefined, { sceneTitle: sceneTitle.request })(wrappedSwitch);

function shouldShowFieldCounter(field: any): boolean {
  return field.useCounter && field.maxLength && !!field.input.value;
}

interface RenderNumericInputFieldProps extends WrappedFieldProps {
  input: any;
  placeholder: string;
  onRef?: any;
  returnKeyType?: ReturnKeyType;
  onSubmitEditing?: () => void;
  style?: any;
  inputStyle?: any;
  border?: any;
  placeholderStyle?: any;
  errorStyle?: any;
  secureTextEntry?: boolean;
  precision?: number;
  keyboardType?: string;
  trimLeadingZeroes?: boolean;
  disabled?: boolean;
  placeholderSentenceCase?: boolean;
  persistPlaceholder?: boolean;
  clearOnFocus?: boolean;
  persistPlaceholderStyle?: any;
  maxLength?: number;
  testID?: string;
}

export const renderNumericInputField = (field: RenderNumericInputFieldProps) => {

  const styles = Theme.getStyles(textInputStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && error !== undefined;
  const hasValue: boolean = !!(field.input.value);

  return (
    <FieldValidation
      hasError={hasError}
      error={error}
      errorTestID={field.testID && `${field.testID}-error`}
      style={field.style || {}} errorStyle={field.errorStyle || {}}>
      <View style={[styles.inputTextPanel, field.border ? field.border : {}]}>
        <NumericInput
          style={[
            styles.inputText,
            field.inputStyle || {}, hasValue ? styles.clearPadding : {},
            field.disabled ? styles.disabled : {},
            hasError ? styles.inputTextError : {}
          ]}
          onRef={field.onRef}
          testID={field.testID && `${field.testID}-numericInput`}
          value={field.input.value}
          persistPlaceholder={field.persistPlaceholder}
          placeholder={field.placeholder}
          placeholderSentenceCase={field.placeholderSentenceCase}
          placeholderTextColor={
            field.disabled ? styles.disabledColor : field.placeholderStyle || styles.placeholderTextColor
          }
          persistPlaceholderStyle={field.persistPlaceholderStyle}
          returnKeyType={field.returnKeyType || "done"}
          precision={field.precision !== undefined ? field.precision : 2}
          requiredNumericOnly = {true}
          secureTextEntry={field.secureTextEntry || false}
          trimLeadingZeroes={field.trimLeadingZeroes !== undefined ? field.trimLeadingZeroes : true}
          onBlur={field.input.onBlur}
          onChangeText={field.input.onChange}
          onFocus={field.input.onFocus}
          onSubmitEditing={field.onSubmitEditing}
          keyboardType={field.keyboardType}
          disabled={field.disabled}
          clearOnFocus={field.clearOnFocus}
          maxLength={field.maxLength}
          {...field.input}
        />
      </View>
      {shouldShowFieldCounter(field) &&
        <Text style={styles.counterText}>
          {field.input.value.length}/{field.maxLength}
        </Text>
      }
    </FieldValidation>
  );
};

interface RenderRestrictedContentInputFieldProps extends WrappedFieldProps {
  input: any;
  placeholder: string;
  onRef?: any;
  returnKeyType?: ReturnKeyType;
  onSubmitEditing?: () => void;
  style?: any;
  inputStyle?: any;
  border?: any;
  placeholderStyle?: any;
  errorStyle?: any;
  secureTextEntry?: boolean;
  disabled?: boolean;
  placeholderSentenceCase?: boolean;
  persistPlaceholder?: boolean;
  persistPlaceholderStyle?: any;
  autoCapitalize?: string;
  maxLength?: number;
  errorText?: string;
  useCounter?: boolean;
  testID?: string;
  allowedContent?: AllowedContent;
  keyboardType?: KeyboardTypeOptions;
}

// tslint:disable-next-line:cyclomatic-complexity
export const renderRestrictedContentInputField = (field: RenderRestrictedContentInputFieldProps) => {
  const styles = Theme.getStyles(textInputStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && (!!error || !!field.errorText);
  const hasValue: boolean = !!(field.input.value);
  let placeholder = field.placeholder;
  if (placeholder && placeholder.length > 0 && (field.placeholderSentenceCase === undefined ? true :
      field.placeholderSentenceCase)) {
    placeholder = placeholder.charAt(0).toUpperCase() + placeholder.slice(1).toLowerCase();
  }

  return (
    <FieldValidation
      hasError={hasError}
      error={field.errorText || error}
      errorTestID={field.testID && `${field.testID}-error`}
      style={field.style || {}}
      errorStyle={field.errorStyle || {}}>
      <View style={[styles.inputTextPanel, field.border ? field.border : {}]}>
        <RestrictedContentInput
          style={[styles.inputText, field.inputStyle || {}, hasValue ? styles.clearPadding : {},
                  field.disabled ? styles.disabled : {}, hasError ? styles.inputTextError : {}]}
          onRef={field.onRef}
          testID={field.testID}
          autoCapitalize={field.autoCapitalize || "none"}
          autoCorrect={false}
          value={field.input.value}
          selectionColor={styles.selectionColor}
          persistPlaceholder={field.persistPlaceholder}
          persistPlaceholderStyle={field.persistPlaceholderStyle}
          placeholder={placeholder}
          placeholderTextColor={
            field.disabled ? styles.disabledColor : field.placeholderStyle || styles.placeholderTextColor
          }
          placeholderSentenceCase={field.placeholderSentenceCase}
          returnKeyType={field.returnKeyType || "next"}
          secureTextEntry={field.secureTextEntry || false}
          underlineColorAndroid={styles.underlineColorAndroid}
          onBlur={field.input.onBlur}
          onChangeText={field.input.onChange}
          onFocus={field.input.onFocus}
          onSubmitEditing={field.onSubmitEditing}
          disabled={field.disabled}
          maxLength={field.maxLength}
          allowedContent={field.allowedContent}
          keyboardType={field.keyboardType}
          {...field.input}
        />
      </View>
    </FieldValidation>
  );
};

interface RenderCurrencyTextInputMaskProps extends WrappedFieldProps, DispatchProps {
  name: string;
  input: any;
  placeholder: string;
  onRef?: any;
  returnKeyType?: ReturnKeyType;
  onSubmitEditing?: () => void;
  onEndEditing?: () => void;
  style?: any;
  inputStyle?: any;
  border?: any;
  containerStyle?: any;
  placeholderStyle?: any;
  errorStyle?: any;
  currency?: string;
  precision?: number;
  maxAllowedLength?: number;
  placeholderSentenceCase?: boolean;
  updateTimers: ActionCreator;
  editable?: boolean;
  persistPlaceholderStyle?: any;
  persistPlaceholder: boolean;
  testID?: string;
}

const renderCurrencyTextInputMask = (
    field: RenderCurrencyTextInputMaskProps, styles: any, placeholder: string, hasError: boolean) => {
  const hasValue: boolean = field.input.value !== "";
  const currencyMask = getCurrencyMask(field.currency);
  return (
      <TextInputMask
          {...getTestIdProperties(field.testID, "currencyTextInput")}
          style={[styles.inputText, field.inputStyle || {}, hasValue ? styles.clearPadding : {},
            hasError ? styles.inputTextError : {}]}
          refInput={field.onRef}
          value={field.input.value}
          type={"money"}
          options={currencyMask}
          editable={field.editable}
          checkText={
            (previous, next) => {
              if (!field.maxAllowedLength) {
                return true;
              } else {
                return next.replace(/\D/g, "").length <= field.maxAllowedLength;
              }
            }
          }
          placeholder={placeholder}
          placeholderTextColor={field.placeholderStyle || styles.placeholderTextColor}
          returnKeyType={"done"}
          onBlur={(e: any) => {
            field.updateTimers(TimerUpdateType.UiInteraction);
            field.input.onBlur(e);
          }}
          onChangeText={(e: any) => {
            field.updateTimers(TimerUpdateType.UiInteraction);
            field.input.onChange(e);
          }}
          onFocus={(e: any) => {
            field.updateTimers(TimerUpdateType.UiInteraction);
            field.input.onFocus(e);
          }}
          onSubmitEditing={() => {
            field.updateTimers(TimerUpdateType.UiInteraction);
            if (field.onSubmitEditing) {
              field.onSubmitEditing();
            }
          }}
          onEndEditing={() => {
            field.updateTimers(TimerUpdateType.UiInteraction);
            if (field.onEndEditing) {
              field.onEndEditing();
            }
          }}
          keyboardType={InputType.numeric}
          {...field.input}
      />
  );
};

const wrappedCurrencyInputField = (field: RenderCurrencyTextInputMaskProps) => {

  const styles = Theme.getStyles(textInputStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && error !== undefined;
  let placeholder = field.placeholder;
  if (placeholder && placeholder.length > 0 && (field.placeholderSentenceCase === undefined ? true :
      field.placeholderSentenceCase)) {
    placeholder = placeholder.charAt(0).toUpperCase() + placeholder.slice(1).toLowerCase();
  }
  return (
    <FieldValidation
      hasError={hasError}
      error={error}
      errorTestID={field.testID && `${field.testID}-error`}
      style={field.style || {}} errorStyle={field.errorStyle || {}}>
      {
        field.persistPlaceholder &&
        <View style={[styles.inputTextPanel, field.border ? field.border : {}]}>
          <View style={[styles.container, !field.input.value && styles.clearTopPadding || {}, field.containerStyle]}>
            { !!field.input.value &&
              <Text style={[styles.placeholderLabelText, field.persistPlaceholderStyle]}>{placeholder}</Text>
            }
            {renderCurrencyTextInputMask(field, styles, placeholder, hasError)}
          </View>
        </View>
      }
      {
        !field.persistPlaceholder &&
        <View style={[styles.inputTextPanel, field.border ? field.border : {}]}>
          {renderCurrencyTextInputMask(field, styles, placeholder, hasError)}
        </View>
      }
    </FieldValidation>
  );
};

const renderCurrencyInputField = connect(undefined, { updateTimers })(wrappedCurrencyInputField);

export const CurrencyInput = (props: any) => {
  return (
    <Field {...props} component={renderCurrencyInputField}
           normalize={(value: string, previousValue: string) => {
             if (value && value.length > 0) {
               if (props.maxAllowedLength &&
                   value.replace(/\D/, "").replace(/^0+/, "").replace(/\D/g, "").replace(/^0+/, "").length
                      > props.maxAllowedLength) {
                 return previousValue;
               } else {
                 return MaskService.toRawValue("money", value, getCurrencyMask(props.currency));
               }
             } else {
               return value;
             }
           }} />
  );
};

interface RenderDateTextInputMaskProps extends WrappedFieldProps, DispatchProps {
  input: any;
  placeholder: string;
  dateFormat: string;
  helpText?: string;
  onRef?: any;
  onSubmitEditing?: () => void;
  style?: any;
  inputStyle?: any;
  border?: any;
  placeholderStyle?: any;
  errorStyle?: any;
  disabled?: boolean;
  placeholderSentenceCase?: boolean;
  persistPlaceholder: boolean;
  showErrorOnFocusOut?: boolean;
  persistPlaceholderStyle?: any;
  formatStyle?: any;
  helpTextStyle?: any;
  showFormat?: boolean;
  testID?: string;
}

const renderDateTextInputMask = (
    field: RenderDateTextInputMaskProps, styles: any, placeholder: string, hasError: boolean) => {
  const hasValue: boolean = field.input.value !== "";
  return (
    <TextInputMask
      style={[
        styles.inputText, field.inputStyle || {},
        hasValue ? styles.clearPadding : {},
        field.disabled ? styles.disabled : {},
        hasError ? styles.inputTextError : {}
      ]}
      refInput={field.onRef}
      value={field.input.value}
      {...getTestIdProperties(field.testID, "dateTextInput")}
      type={"datetime"}
      options={{
        format: field.dateFormat,
        type: "datetime"
      }}
      placeholder={placeholder}
      placeholderTextColor={
        field.disabled ? styles.disabledColor : field.placeholderStyle || styles.placeholderTextColor
      }
      returnKeyType={"done"}
      onBlur={(e: any) => {
        field.updateTimers(TimerUpdateType.UiInteraction);
        field.input.onBlur(e);
      }}
      onChangeText={(e: any) => {
        field.updateTimers(TimerUpdateType.UiInteraction);
        field.input.onChange(e);
      }}
      onFocus={(e: any) => {
        field.updateTimers(TimerUpdateType.UiInteraction);
        field.input.onFocus(e);
      }}
      onSubmitEditing={() => {
        field.updateTimers(TimerUpdateType.UiInteraction);
        if (field.onSubmitEditing) {
          field.onSubmitEditing();
        }
      }}
      keyboardType={"number-pad"}
      editable={!field.disabled}
      {...field.input}
    />
  );
};

const wrappedDateInputField = (field: RenderDateTextInputMaskProps) => {
  const styles = Theme.getStyles(textInputStyle());
  const { touched, submitFailed, error, active } = field.meta;
  const hasError: boolean = (touched || submitFailed) && error !== undefined &&
      (field.showErrorOnFocusOut === undefined || !field.showErrorOnFocusOut ||
          (field.showErrorOnFocusOut && !active));
  let placeholder = field.placeholder;
  if (placeholder && placeholder.length > 0 && (field.placeholderSentenceCase === undefined ? true :
      field.placeholderSentenceCase)) {
    placeholder = placeholder.charAt(0).toUpperCase() + placeholder.slice(1).toLowerCase();
  }
  //initial formatting of date string
  field.input.value = applyDateFormat(field.input.value, field.dateFormat);

  return renderDateControl(hasError, error, field, styles, placeholder);
};

function renderDateControl(hasError: boolean, error: any,
    field: RenderDateTextInputMaskProps, styles: any, placeholder: string): any {
  return (
    <FieldValidation
      hasError={hasError}
      error={error}
      errorTestID={field.testID && `${field.testID}-error`}
      style={field.style || {}} errorStyle={field.errorStyle || {}}>
      {
        field.persistPlaceholder &&
        <View style={[styles.inputTextPanel, field.border ? field.border : {}]}>
          <View
            style={[
              styles.container,
              !field.input.value && styles.clearTopPadding || {},
              field.disabled ? styles.disabledLabelText : {}
            ]}
          >
            {!!field.input.value &&
              <Text style={[styles.placeholderLabelText, field.persistPlaceholderStyle]}>{placeholder}</Text>}
            {renderDateTextInputMask(field, styles, placeholder, hasError)}
          </View>
        </View>
      }
      {
        !field.persistPlaceholder &&
        <View style={[styles.inputTextPanel, field.border ? field.border : {}]}>
          {renderDateTextInputMask(field, styles, placeholder, hasError)}
        </View>
      }
      { field.showFormat && !hasError &&
        <Text style={[styles.dateFormat, field.formatStyle]}>{field.dateFormat}</Text>
      }
      { field.helpText && !hasError &&
        <Text style={[styles.dateFormat, field.helpTextStyle]}>{field.helpText}</Text>
      }
    </FieldValidation>
  );
}

function applyDateFormat(dateStr: string, format: string): string {
  //only format if the date has not been formatted before (still contains "T")
  if (dateStr && dateStr.indexOf("T") > 0) {
    const dateO = dateStr && getDateFromISODateString(dateStr);
    return dateO && Moment(dateO).format(format);
  } else {
    return dateStr;
  }
}

export const renderDateInputField = connect(undefined, { updateTimers })(wrappedDateInputField);

interface InputFieldProps {
  input: any;
  testID: string;
  placeholder: string;
  settings: any;
  overrideOnSubmitEditing: (eventType: DataEventType, data: IKeyedData) => void;
  meta: { form: string, dirty: boolean, submitFailed: boolean, touched: boolean, error: string, dispatch: any };
  onRef?: any;
  returnKeyType?: ReturnKeyType;
  style?: any;
  inputStyle?: any;
  inputContainerStyle?: any;
  placeholderStyle?: any;
  errorStyle?: any;
  secureTextEntry: boolean;
  clearText?: boolean;
  keyboardType?: string;
  cameraIcon?: any;
  inputType?: InputType;
  placeholderSentenceCase?: boolean;
  maxLength?: number;
  autoCapitalize?: "characters" | "none" | "sentences" | "words";
  disabled?: boolean;
}

export const renderInputField = (field: InputFieldProps) => {
  const styles = Theme.getStyles(textInputStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed)  && error !== undefined;
  const cameraIcon = field.cameraIcon || {
    icon: "Camera",
    size: styles.cameraIcon.fontSize,
    color: styles.cameraIcon.color,
    position: "right",
    style: styles.cameraIconPanel
  };
  if (hasError) {
    cameraIcon.style = combineComponentStyleWithPropStyles(styles.inputTextError, cameraIcon.style || {});
  }

  return (
      <FieldValidation
        hasError={hasError}
        error={error} style={field.style || {}}
        errorTestID={field.testID && `${field.testID}-error`}
        errorStyle={field.errorStyle || {}}>
        <Input
          style={[styles.inputPanel, field.inputContainerStyle]}
          inputStyle={[styles.inputText, field.inputStyle || {}, hasError ? styles.inputTextError : {} ]}
          onRef={field.onRef}
          value={field.input.value}
          testID={field.testID}
          placeholder={field.placeholder}
          placeholderTextColor={field.placeholderStyle || styles.placeholderTextColor}
          placeholderSentenceCase={field.placeholderSentenceCase}
          returnKeyType={field.returnKeyType}
          keyboardType={field.keyboardType || "default"}
          secureTextEntry={field.secureTextEntry}
          cameraIcon={cameraIcon}
          settings={field.settings}
          clearText={field.clearText}
          showCamera={true}
          onBlur={field.input.onBlur}
          onChangeText={field.input.onChange}
          onFocus={field.input.onFocus}
          overrideOnSubmitEditing={field.overrideOnSubmitEditing}
          inputType={field.inputType || InputType.numeric}
          autoCapitalize={field.autoCapitalize}
          maxLength={field.maxLength}
          disabled={field.disabled}
          {...field.input}
        />
      </FieldValidation>
  );
};

interface RenderSelectProps extends RenderTextInputFieldProps, DispatchProps {
  options: RenderSelectOptions[];
}

// tslint:disable-next-line:cyclomatic-complexity
const wrappedSelect = (field: RenderSelectProps) => {
  const styles = Theme.getStyles(textInputStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && !!error;
  const hasValue: boolean = !!(field.input.value);
  let placeholder = field.placeholder;
  if (placeholder && placeholder.length > 0 && (field.placeholderSentenceCase === undefined ? true :
      field.placeholderSentenceCase)) {
    placeholder = placeholder.charAt(0).toUpperCase() + placeholder.slice(1).toLowerCase();
  }

  let value: string = undefined;
  let selectedValue = undefined;
  if (field.input.value && field.input.value.length > 0) {
    value = field.input.value;

    const selectOption = field.options.find((option: RenderSelectOptions) => option.code === value);
    selectedValue = selectOption && selectOption.description;
  }

  return (
      <FieldValidation
          hasError={hasError}
          error={error}
          errorTestID={field.testID && `${field.testID}-error`}
          style={field.style || {}}
          errorStyle={field.errorStyle || {}}>
      <RNPickerSelect
          value={value}
          {...getTestIdProperties(field.testID, "select")}
          onValueChange={() => field.updateTimers(TimerUpdateType.UiInteraction)}
          pickerProps={{ onValueChange: (e: any) => field.input.onChange(e) }}
          items={field.options.map((option: RenderSelectOptions) => ({
            label: option.description,
            value: option.code
          }))}
      >
        <View style={styles.inputTextPanel}>
          <DefaultTextInput
              {...field.input}
              testID={field.testID && `${field.testID}-select-input`}
              style={[styles.inputText, field.inputStyle || {}, hasValue ? styles.clearPadding : {},
                hasError ? styles.inputTextError : {}]}
              onRef={field.onRef}
              autoCapitalize={"none"}
              autoCorrect={false}
              value={selectedValue}
              selectionColor={styles.selectionColor}
              persistPlaceholder={field.persistPlaceholder}
              persistPlaceholderStyle={field.persistPlaceholderStyle}
              placeholder={placeholder}
              placeholderTextColor={field.placeholderStyle || styles.placeholderTextColor}
              placeholderSentenceCase={field.placeholderSentenceCase}
              underlineColorAndroid={styles.underlineColorAndroid}
          />
        </View>
      </RNPickerSelect>
    </FieldValidation>
  );
};

export const renderSelect = connect(undefined, { updateTimers })(wrappedSelect);

interface RenderSelectReasonProps extends WrappedFieldProps {
  reasons: RenderSelectOptions[];
  placeholder: string;
  inputStyle?: any;
  errorStyle?: any;
  style?: any;
  testID?: string;
}

export const renderReasonSelect = (field: RenderSelectReasonProps) => {
  const navigation = useNavigation<NavigationProp>();
  const styles = Theme.getStyles(selectReasonStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && error !== undefined;

  let value: RenderSelectOptions = undefined;
  if (field.input.value && field.input.value.description) {
    value = field.input.value;
  }

  return (
    <FieldValidation
      hasError={hasError}
      error={error}
      errorTestID={field.testID && `${field.testID}-error`}
      style={[
        styles.root,
        field.style || {}
      ]}
      errorStyle={[styles.errorStyle, field.errorStyle || {}]}
    >
      <TouchableOpacity
        {...getTestIdProperties(field.testID, "reasonSelect")}
        style={[
          styles.root,
          styles.btnReasonCode,
          field.inputStyle || {}
        ]}
        onPress={() => navigation.push("reasonCodeList", {
            resetTitle: true,
            currentSelectedOption: value,
            options: field.reasons,
            onOptionChosen: field.input.onChange
          })
        }
      >
        <Text
          {...getTestIdProperties(field.testID, "reasonSelect-description")}
          style={[styles.btnReasonCodeText, styles.tal]}>
          {(value && value.description) || field.placeholder}
        </Text>
        <Text style={[styles.btnReasonCodeText, styles.tar]}>{">"}</Text>
      </TouchableOpacity>
    </FieldValidation>
  );
};

interface RenderOptionsSelectProps extends WrappedFieldProps, DispatchProps {
  placeholder: string;
  inputStyle?: any;
  errorStyle?: any;
  style?: any;
  scene?: string;
  options: RenderSelectOptions[];
  selectedOption?: RenderSelectOptions | RenderSelectOptions[];
  multiSelect?: boolean;
  disabled?: boolean;
  onOptionChosen?: (newValue: any) => void;
  testID?: string;
  onClose?: () => void;
}

const wrappedOptionsSelect = (field: RenderOptionsSelectProps) => {
  const navigation = useNavigation<NavigationProp>();
  const styles = Theme.getStyles(selectOptionsStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && error !== undefined;
  const populated: boolean = Array.isArray(field.selectedOption) ?
      field.selectedOption && field.selectedOption.length > 0 :
      field.selectedOption !== undefined;
  const description: string =
      getSelectedDescription(Array.isArray(field.selectedOption) ?
      field.selectedOption : [field.selectedOption], field.multiSelect);
  return (
      <FieldValidation
          hasError={hasError}
          error={error}
          errorTestID={field.testID && `${field.testID}-error`}
          style={[field.style || {}]}
          errorStyle={[styles.errorStyle, field.errorStyle || {}]}>
        <TouchableOpacity
            disabled={field.disabled}
            {...getTestIdProperties(field.testID, "option")}
            style={[styles.controlsRow, field.inputStyle || {},  hasError ? styles.inputTextError : {},
                field.disabled ? styles.disabled : {}]}
            onPress={() => {
              field.sceneTitle("reasonCodeList", field.scene);
              navigation.push("reasonCodeList", {
                currentSelectedOption: field.selectedOption,
                options: field.options,
                onOptionChosen: field.onOptionChosen || field.input.onChange,
                multiSelect: field.multiSelect,
                onClose: field.onClose
              });
            }}
        >
          {
            populated &&
            <View style={[styles.container, field.disabled ? styles.disabled : {}]}>
              <Text
                style={[styles.placeholderLabelText, field.disabled ? styles.disabled : {}]}
                {...getTestIdProperties(field.testID, "option-label")}>
                  {field.placeholder}
              </Text>
              <Text
                style={[styles.inputText, field.disabled ? styles.disabled : {}]}
                {...getTestIdProperties(field.testID, "option-description")}>
                  {description}
              </Text>
            </View>
          }
          {
            !populated &&
            <Text style={[styles.textStyle, field.disabled ? styles.disabled : {}]}>{field.placeholder}</Text>
          }
          {
            !field.disabled &&
            <View style={styles.arrowArea}>
              <VectorIcon name="Forward" height={styles.icon.fontSize} fill={styles.icon.color} />
            </View>
          }
        </TouchableOpacity>
      </FieldValidation>
  );
};

export const renderOptionsSelect = connect(undefined, { sceneTitle: sceneTitle.request })(wrappedOptionsSelect);

export function getSelectedDescription(selectedOptions: RenderSelectOptions[], multiSelect: boolean): string {
  if (!selectedOptions) {
    return "";
  }
  let description: string;
  if (multiSelect) {
    const combinedDescriptions: string[] = selectedOptions.map((option) => {
      return option && option.description;
    });
    description = combinedDescriptions.join(", ");
    if (description.length > 25) {
      description = _.truncate(description, {length: 25});
    }
  } else {
    const selectedOption: RenderSelectOptions = selectedOptions.length > 0 && selectedOptions[0];
    description = selectedOption && selectedOption.description;
  }

  return description;
}


export const renderPercentageInputField = (field: { input: any, testID?: string, placeholder: string,
  meta: { form: string, dirty: boolean, submitFailed: boolean, touched: boolean, error: string, dispatch: any },
  onRef?: any, returnKeyType?: ReturnKeyType, onSubmitEditing?: () => void,
  onPress?: () => void; style?: any, inputStyle?: any, border?: any,
  placeholderStyle?: any, errorStyle?: any, secureTextEntry?: boolean, keyboardType?: string,
  decimalPrecision?: number, disabled?: boolean, preconfiguredEmployeeDiscount?: boolean,
  disableEditButton?: boolean }) => {

  const styles = Theme.getStyles(textInputStyle());
  const { touched, submitFailed, error } = field.meta;
  const hasError: boolean = (touched || submitFailed) && error !== undefined;
  const hasValue: boolean = !!(field.input.value);

  return (
    <FieldValidation
      hasError={hasError}
      error={error}
      errorTestID={field.testID && `${field.testID}-error`}
      style={field.style || {}} errorStyle={field.errorStyle || {}}>
      <View style={[styles.inputTextPanel, field.border ? field.border : {}]}>
        <PercentageInput
          style={[styles.inputText, field.inputStyle || {}, hasValue ? styles.clearPadding : {},
                  hasError ?  styles.inputTextError : {} ]}
          onRef={field.onRef}
          value={field.input.value}
          testID={field.testID && `${field.testID}-percentageInput`}
          placeholder={field.placeholder}
          placeholderTextColor={field.placeholderStyle || styles.placeholderTextColor}
          returnKeyType={field.returnKeyType || "done"}
          secureTextEntry={field.secureTextEntry || false}
          trimLeadingZeroes={true}
          onBlur={field.input.onBlur}
          onChangeText={field.input.onChange}
          onFocus={field.input.onFocus}
          onSubmitEditing={field.onSubmitEditing}
          onPress={field.onPress}
          preconfiguredEmployeeDiscount={field.preconfiguredEmployeeDiscount}
          keyboardType={field.keyboardType}
          decimalPrecision={field.decimalPrecision}
          disabled={field.disabled}
          disableEditButton={field.disableEditButton}
          {...field.input}
        />
      </View>
    </FieldValidation>
  );
};
