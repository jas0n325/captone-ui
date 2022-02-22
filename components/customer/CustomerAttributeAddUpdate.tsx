import _ from "lodash";
import Moment from "moment";
import * as React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import { Field } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  ConditionType,
  IConditionalAttributeBehaviorRuleAttributeGroups,
  IConditionalAttributeBehaviorRuleConfig,
  IConditionalAttributeBehaviorRuleDefinition,
  IConditionalAttributeBehaviorRuleSubmitResult,
  IServiceCustomerAttribute,
  IServiceCustomerAttributeDataElement
} from "@aptos-scp/scp-component-store-selling-features";
import {
    AttributeDataElementDefinition,
    AttributeGroupDefinition,
    AttributeGroupDefinitionList
} from "@aptos-scp/scp-types-customer";

import I18n from "../../../config/I18n";
import { BusinessState, CustomerState, SettingsState } from "../../reducers";
import FeedbackNote from "../common/FeedbackNote";
import {
  renderDateInputField,
  renderNumericInputField,
  renderOptionsSelect,
  RenderSelectOptions,
  renderSwitch,
  renderTextInputField
} from "../common/FieldValidation";
import { InputType } from "../common/Input";
import { SectionRow } from "../common/SectionRow";
import { getDateFromISODateString, getStoreLocale } from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import {
  attributeGroupCompare,
  attributeGroupDataElementCompare,
  getTranslationDataElement,
  getTranslationGroupDefStrings,
  mapDataElementDefOptionsToRenderSelect
} from "./CustomerUtilities";
import VectorIcon from "../common/VectorIcon";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.customerAttributeAddUpdate");

export interface IConditionalAttributeRuleErrors {
  [ruleCode: string]: IConditionalAttributeBehaviorRuleSubmitResult;
}

interface StateProps {
  customerState: CustomerState;
  settings: SettingsState;
  businessState: BusinessState;
}

export interface Props extends StateProps {
    titleKey?: string;
    styles?: any;
    custAttributes: IServiceCustomerAttribute[];
    attributeDefs: AttributeGroupDefinitionList;
    isUpdate?: boolean;
    singleGroupMode?: boolean;
    onChange: (field: string, value: any) => void;
    onDelete?: any;
    onConditionalRuleErrorChange?: (preventSubmit: boolean) => void;
    uiId?: any;
    customerUiConfig?: any;
    navigation: NavigationProp;
    setAttributeRef?: (ref: any, key: string) => void;
}

export interface State {
  custAttributes: IServiceCustomerAttribute[];
  conditionalRules: IConditionalAttributeBehaviorRuleConfig;
  conditionalRuleErrors: IConditionalAttributeRuleErrors;
  errors: { [key: string]: string; };
}

class CustomerAttributeAddUpdate extends React.Component<Props, State> {
  private preferredLanguage: string;

  constructor(props: Props) {
    super(props);
    this.preferredLanguage = props.businessState.stateValues.get("UserSession.user.preferredLanguage");
    this.state = {
      custAttributes: props.custAttributes,
      conditionalRules: {},
      conditionalRuleErrors: {},
      errors: {}
    };
  }

  public componentDidMount(): void {
    //Get list of rules that apply to this screen
    const currentRuleKeys = _.get(this, "props.customerUiConfig.conditionalAttributeBehaviorRules");
    //Load conditional attribute settings for screen
    this.setState({conditionalRules: this.getConditionalAttributeBehaviorRules(currentRuleKeys)},
        this.processAttributeConditions);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.custAttributes !== this.state.custAttributes) {
      this.setState({custAttributes: this.props.custAttributes});
    }
  }

  public render(): JSX.Element {
    if (!this.props.attributeDefs || !this.state.custAttributes) {
      return null;
    }
    const visibleSortedAttrDefs =  this.props.attributeDefs && this.props.attributeDefs.data.filter((ad) =>
        this.state.custAttributes.findIndex((ca) => ca.groupCode === ad.groupCode) > -1).sort(attributeGroupCompare);
    return (
      <>
      { visibleSortedAttrDefs && visibleSortedAttrDefs.length > 0 &&
          <View style={!this.props.singleGroupMode ? this.props.styles.attributesSection : undefined}>
          {this.props.attributeDefs &&
          <View>
            {this.props.titleKey &&
              <View>
                <Text style={this.props.styles.attributeTitle}>
                  {I18n.t(this.props.titleKey)}
                </Text>
              </View>
            }
            {this.renderAttributesError()}
            <View style={this.props.styles.attributesContainer}>
              {/* Render section for FIRST attribute group sorted  */}
              {this.renderCustomerAttributeGroupSection(visibleSortedAttrDefs.shift(), this.props, true)}
              {/* Render section for each attribute group sorted  */}
              {visibleSortedAttrDefs.map(
                  (attrGroup) => this.renderCustomerAttributeGroupSection(attrGroup, this.props))}
            </View>
          </View>
        }
        </View>
      }
      </>
    );
  }

  private renderAttributesError(): JSX.Element {
    const ruleErrors = Object.values(this.state.conditionalRuleErrors || []);
    const ruleErrorMessages =
        ruleErrors.map((re) =>
          I18n.t(re.errorText.i18nCode, { defaultValue: re.errorText.default})
        ).filter((elem, index, self) => index === self.indexOf(elem));
    return ( !_.isEmpty(ruleErrors) &&
          <View >
            {ruleErrorMessages.map((message) =>
              <FeedbackNote message={message} style={this.props.styles} />
            )}
          </View>
    );
  }

  private renderCustomerAttributeGroupSection(attrGroup: AttributeGroupDefinition,
                                              props: Props, isFirst?: boolean): any {
    //find all the customer attributes in this attribute group
    const custAttrs = attrGroup && this.state.custAttributes.filter((cu) => cu.groupCode === attrGroup.groupCode);
    //if none found then don't render
    if (_.isEmpty(custAttrs) && !props.isUpdate) {
        return;
    }
    const preferredLanguage: string = props.businessState.stateValues.get("UserSession.user.preferredLanguage");
    const {description, longDescription, longDescriptionExpanded} =
        getTranslationGroupDefStrings(attrGroup, preferredLanguage);
    const sectionStyle =
        isFirst ? props.styles.attributeDefinitionSectionFirst : props.styles.attributeDefinitionSection;
    return (
      <>
        <View  style={!this.props.singleGroupMode ? sectionStyle : undefined}>
            <View >
                <View style={props.styles.subtitleArea}>
                <Text style={props.styles.subtitleText}>{description}</Text>
                </View>
                {!props.singleGroupMode && !_.isEmpty(longDescription) &&
                  <View style={props.styles.longDescriptionArea}>
                    <TouchableOpacity
                      onPress={!_.isEmpty(longDescriptionExpanded) ? () => {
                        this.props.navigation.push("textScreen", {
                          onCancel: this.pop,
                          displayText: longDescriptionExpanded
                        });
                      } : undefined}>
                      <Text
                        style={
                          longDescriptionExpanded ?
                              props.styles.longDescriptionTextLink : props.styles.longDescriptionText
                        }
                      >
                        {longDescription}
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                {/* Render section for FIRST customer attributes */}
                {this.renderCustomerAttributeRow(custAttrs && custAttrs.shift(), attrGroup, props, true)}
                {/* Render section for remaining customer attributes */}
                {custAttrs.map((attr) => this.renderCustomerAttributeRow(attr, attrGroup, props))}
            </View>
        </View>
      </>
    );
  }

  private renderCustomerAttributeRow(attr: IServiceCustomerAttribute,
                                     attrGroup: AttributeGroupDefinition, props: Props, isFirst?: boolean): any {
    const sortedDataElementDefs: AttributeDataElementDefinition[] =
        attrGroup.dataElementDefinitions.sort(attributeGroupDataElementCompare);
    const sectionStyle = isFirst ?
        [props.styles.attributeDataElementSection, props.styles.attributeDataElementSectionTop] :
        props.styles.attributeDataElementSection;
    return (
      <>
        <View  style={!this.props.singleGroupMode ? sectionStyle : undefined}>
          <SectionRow styles={props.styles}>
              {sortedDataElementDefs.map((attrDefDataElem, i) =>
                i === sortedDataElementDefs.length - 1 ?
                  this.renderCustomerAttributeDataElementRow(attr, attrDefDataElem, attrGroup, props, true) :
                  this.renderCustomerAttributeDataElementRow(attr, attrDefDataElem, attrGroup, props))
              }
          </SectionRow>
          {
            !this.props.singleGroupMode && !attrGroup.isReadOnly && !attrGroup.promptOnCreate &&
            <TouchableOpacity
              style={props.styles.attributeDeleteButton}
              onPress={() => this.handleDeleteAttribute(attr)}
            >
              <VectorIcon
                name="Clear"
                height={props.styles.attributeDeleteIcon.fontSize}
                width={props.styles.attributeDeleteIcon.fontSize}
                fill={props.styles.attributeDeleteIcon.color}
                stroke={props.styles.attributeDeleteIcon.color}
              />
            </TouchableOpacity>
          }
        </View>
      </>
    );
  }

  private renderCustomerAttributeDataElementRow(attr: IServiceCustomerAttribute,
                                                attrDefDataElem: AttributeDataElementDefinition,
                                                attrDef: AttributeGroupDefinition, props: Props,
                                                lastElement?: boolean): any {
    //find matching customer attribute data element
    //if in update, render all data elements
    const custAttrDataElement = attr.dataElements.find((de) => de.key === attrDefDataElem.key) ||
        props.isUpdate && {key: attrDefDataElem.key, value: []};
    //if not found then don't render
    if (_.isEmpty(custAttrDataElement)) {
        return;
    }
    try {
        if (attrDefDataElem.fieldType === "enum") {
           return this.renderAttributeSelect(attr, custAttrDataElement, attrDefDataElem, attrDef, lastElement);

        } else if (attrDefDataElem.fieldType === "number") {
          return this.renderAttributeNumber(attr, custAttrDataElement, attrDefDataElem, attrDef, lastElement);

        } else if (attrDefDataElem.fieldType === "date") {
          return this.renderAttributeDate(attr, custAttrDataElement, attrDefDataElem, attrDef, lastElement);

        } else if (attrDefDataElem.fieldType === "boolean") {
          return this.renderAttributeBoolean(attr, custAttrDataElement, attrDefDataElem, attrDef, lastElement);

        } else if (attrDefDataElem.fieldType === "string") {
          return this.renderAttributeString(attr, custAttrDataElement, attrDefDataElem, attrDef, lastElement);
        } else {
          logger.warn("Invalid field type for attribute " + attrDefDataElem.key);
          return undefined;
        }
    } catch (ex) {
      logger.warn("Unable to render attribute value.", ex);
      return;
    }
}

private renderAttributeSelect(attr: IServiceCustomerAttribute,
                              custAttrDataElement: IServiceCustomerAttributeDataElement,
                              attrDefDataElem: AttributeDataElementDefinition,
                              attrDef: AttributeGroupDefinition,
                              lastElement?: boolean): JSX.Element {
  const options: RenderSelectOptions[] =
      mapDataElementDefOptionsToRenderSelect(attrDefDataElem, this.preferredLanguage);
  const selectedOption: RenderSelectOptions[] = custAttrDataElement.value &&
      custAttrDataElement.value.map((custValue) => {
        return options.find((o) => o.code === custValue);
      });
  const choiceStyle = lastElement ?
      [this.props.styles.attributeChoice, this.props.styles.attributeLastElement] : this.props.styles.attributeChoice;
  const multiSelect: boolean = attrDefDataElem.enumMultiSelect;
  return (
    <Field
      name={attr.id + "-" + attrDefDataElem.key}
      ref={this.props.setAttributeRef && this.props.setAttributeRef.bind(this)}
      component={renderOptionsSelect}
      placeholder={getTranslationDataElement(attrDefDataElem, this.preferredLanguage) + (attrDefDataElem.isRequired ? "*" : "")}
      options={options}
      onOptionChosen={this.handleSelectionChange.bind(this, attr, custAttrDataElement, multiSelect)}
      selectedOption={selectedOption}
      scene={"attributes"}
      style={choiceStyle}
      inputStyle={this.props.styles.attributeChoiceInput}
      disabled={attrDef.isReadOnly}
      multiSelect={multiSelect}
      errorStyle={this.props.styles.textInputError}
    />
  );
}

private renderAttributeString(attr: IServiceCustomerAttribute,
                              custAttrDataElement: IServiceCustomerAttributeDataElement,
                              attrDefDataElem: AttributeDataElementDefinition,
                              attrDef: AttributeGroupDefinition,
                              lastElement?: boolean): JSX.Element {
  const stringVal: string = custAttrDataElement.value && custAttrDataElement.value.length > 0 &&
      custAttrDataElement.value[0];
  const textStyle = lastElement ? [this.props.styles.attributeTextInput, this.props.styles.attributeLastElement] :
      this.props.styles.attributeTextInput;
  return (
    <Field
      name={attr.id + "-" + attrDefDataElem.key}
      disabled={attrDef.isReadOnly}
      placeholder={getTranslationDataElement(attrDefDataElem, this.preferredLanguage) + (attrDefDataElem.isRequired ? "*" : "")}
      persistPlaceholderStyle={this.props.styles.attributePersistPlaceHolder}
      style={textStyle}
      component={renderTextInputField}
      persistPlaceholder={true}
      currentValue={stringVal}
      onChange={this.handleChange.bind(this, attr, custAttrDataElement)}
      inputStyle={this.props.styles.attributeTextValue}
      errorStyle={this.props.styles.attributeTextInputError}
      maxLength={attrDefDataElem.stringMaxLength}
    />
  );
}

private renderAttributeBoolean(attr: IServiceCustomerAttribute,
                               custAttrDataElement: IServiceCustomerAttributeDataElement,
                               attrDefDataElem: AttributeDataElementDefinition,
                               attrDef: AttributeGroupDefinition,
                               lastElement?: boolean): JSX.Element {
  const boolVal: boolean = custAttrDataElement.value && custAttrDataElement.value.length > 0 &&
      custAttrDataElement.value[0] === "true";
  const switchStyle: any = lastElement ?
      [this.props.styles.switchPanel, this.props.styles.attributeLastElement] : this.props.styles.switchPanel;
  return (
    <Field
      name={attr.id + "-" + attrDefDataElem.key}
      component={renderSwitch}
      onValueChange={this.handleBooleanChange.bind(this, attr, custAttrDataElement)}
      style={switchStyle}
      scene={"attributes"}
      switchText={attrDefDataElem.label + (attrDefDataElem.isRequired ? "*" : "")}
      disabled={attrDef.isReadOnly}
      currentValue={boolVal}
      errorStyle={this.props.styles.attributeTextInputError}
    />
  );
}

private renderAttributeNumber(attr: IServiceCustomerAttribute,
                              custAttrDataElement: IServiceCustomerAttributeDataElement,
                              attrDefDataElem: AttributeDataElementDefinition,
                              attrDef: AttributeGroupDefinition,
                              lastElement?: boolean): JSX.Element {
  const rawNumber: string = custAttrDataElement.value && custAttrDataElement.value.length > 1 &&
      custAttrDataElement[0];
  const numO: number = rawNumber && Number(rawNumber);
  const numVal: string = numO && numO.toLocaleString();
  const numericStyle = lastElement ?
      [this.props.styles.attributeTextInput, this.props.styles.attributeLastElement] :
      this.props.styles.attributeTextInput;
  return (
    <Field
      name={attr.id + "-" + attrDefDataElem.key}
      disabled={attrDef.isReadOnly}
      placeholder={getTranslationDataElement(attrDefDataElem, this.preferredLanguage) + (attrDefDataElem.isRequired ? "*" : "")}
      persistPlaceholderStyle={this.props.styles.attributePersistPlaceHolder}
      style={numericStyle}
      component={renderNumericInputField}
      persistPlaceholder={true}
      value={numVal}
      keyboardType={InputType.numeric}
      onChange={this.handleNumericChange.bind(this, attr, custAttrDataElement)}
      inputStyle={this.props.styles.attributeTextValue}
      errorStyle={this.props.styles.attributeTextInputError}
      maxLength={attrDefDataElem.stringMaxLength}
    />
  );
}

private renderAttributeDate(attr: IServiceCustomerAttribute,
                            custAttrDataElement: IServiceCustomerAttributeDataElement,
                            attrDefDataElem: AttributeDataElementDefinition,
                            attrDef: AttributeGroupDefinition,
                            lastElement?: boolean): JSX.Element {
  const locale = getStoreLocale();
  const format = I18n.t("date.format", {locale});
  const rawDate = custAttrDataElement && custAttrDataElement.value &&
      custAttrDataElement.value.length > 0 && custAttrDataElement.value[0];
  const dateO = rawDate && getDateFromISODateString(rawDate);
  const dateVal = dateO && Moment(dateO).format(format);
  const fieldName = attr.id + "-" + custAttrDataElement.key;
  return (
    <>
      <Field
        name={fieldName}
        disabled={attrDef.isReadOnly}
        placeholder={getTranslationDataElement(attrDefDataElem, this.preferredLanguage) + (attrDefDataElem.isRequired ? "*" : "")}
        persistPlaceholderStyle={this.props.styles.attributePersistPlaceHolder}
        style={this.props.styles.attributeTextInput}
        component={renderDateInputField}
        dateFormat={format}
        persistPlaceholder={true}
        onChange={
          this.handleDateChange.bind(this, attr, custAttrDataElement, this.convertDateStringsToISO, fieldName, format)
        }
        inputStyle={this.props.styles.attributeTextValue}
        errorStyle={this.props.styles.attributeTextInputError}
        value={dateVal}
      />
      { this.state.errors && this.state.errors[fieldName] &&
        <Text style={this.props.styles.dateInputError}>{this.state.errors[fieldName]}</Text>
      }
      <Text style={[this.props.styles.dateFormat, attrDef.isReadOnly ? this.props.styles.disabled : {}]}>
        {format}
      </Text>
    </>
  );
}

  private handleDeleteAttribute(attr: any): void {
    Alert.alert(I18n.t("attributeRemove"), I18n.t("attributeRemoveExplanation"), [
      { text: I18n.t("cancel"), style: "cancel" },
      { text: I18n.t("remove"), onPress: () => {
        this.props.onDelete(attr);
        this.setState({
            custAttributes: this.state.custAttributes.filter((a) =>
                !(a.id === attr.id && a.groupCode === attr.groupCode))
          });
        }
      }
    ], {cancelable: true});
  }

  private convertDateStringsToISO(dateVals: string[], dateFormat: string): string[] {
    return dateVals.map(d => {
      if (_.isEmpty(d)) {
        return d;
      }
      const date = Moment(d, dateFormat, true);
      if (date.isValid()) {
        let dtString = date.toISOString();
        dtString = dtString.substr(0, dtString.indexOf("T")) + "T00:00:00";
        return dtString;
      }
      return d;
    });
  }

  private handleSelectionChange(attr: IServiceCustomerAttribute,
                                custAttrDataElement: IServiceCustomerAttributeDataElement,
                                multiSelect: boolean,
                                option: RenderSelectOptions): void {
    if (attr.dataElements.findIndex((de) => de.key === custAttrDataElement.key) === -1) {
      attr.dataElements.push(custAttrDataElement);
    }
    if (multiSelect) {
      const newSelection: boolean =
          custAttrDataElement.value.findIndex((selectedOption) => selectedOption === option.code) === -1;
      custAttrDataElement.value = newSelection ? [...custAttrDataElement.value, option.code] :
          custAttrDataElement.value.filter((selectedOption) => selectedOption !== option.code);
    } else {
      custAttrDataElement.value = [option.code];
    }
    this.props.onChange(attr.id + "-" + custAttrDataElement.key, [option.code]);
    this.setState({
      custAttributes : this.state.custAttributes
    });
  }

  private handleDateChange(attr: IServiceCustomerAttribute,
                     custAttrDataElement: IServiceCustomerAttributeDataElement,
                     valueConverter: (val: string[], dateFormat: string) => string[],
                     fieldName: string,
                     dateFormat: string,
                     e: any): void {
    try {
      if (e.nativeEvent) {
        this.handleChange(attr, custAttrDataElement, e.nativeEvent.text, valueConverter, dateFormat);
        this.state.errors[fieldName] = undefined;
      }
    } catch (error) {
      this.state.errors[fieldName] = error.message;
    }
    this.setState({
      errors : this.state.errors
    });
  }

  private handleChange(attr: IServiceCustomerAttribute,
                       custAttrDataElement: IServiceCustomerAttributeDataElement,
                       val: any,
                       converter: (val: string[], dateFormat?: string) => string[],
                       dateFormat?: string): void {
    if (val !== undefined) {
      const newStringVal: string[] = [val && val.toString()];
      if (attr && attr.dataElements && attr.dataElements.findIndex((de) =>
          de.key === custAttrDataElement.key) === -1) {
        attr.dataElements.push(custAttrDataElement);
      }
      custAttrDataElement.value = converter && {}.toString.call(converter) === '[object Function]' ?
          converter(newStringVal, dateFormat) : newStringVal;
      this.props.onChange(attr.id + "-" + custAttrDataElement.key, custAttrDataElement.value);

      this.setState({
        custAttributes : this.state.custAttributes
      });
    }
  }

  private handleBooleanChange(attr: IServiceCustomerAttribute,
                              custAttrDataElement: IServiceCustomerAttributeDataElement,
                              value: boolean): void {
    if (value !== undefined) {
      const newStringVal: string[] = [value && value.toString()];
      if (attr && attr.dataElements && attr.dataElements.findIndex((de) =>
          de.key === custAttrDataElement.key) === -1) {
        attr.dataElements.push(custAttrDataElement);
      }
      custAttrDataElement.value = newStringVal;
      this.props.onChange(attr.id + "-" + custAttrDataElement.key, custAttrDataElement.value);

      this.processAttributeConditions(attr.groupCode, custAttrDataElement);

      this.setState({
        custAttributes : this.state.custAttributes
      });
    }
  }

  private processAttributeConditions(groupCode?: string, custAttrDataElement?: IServiceCustomerAttributeDataElement,
                                     skipModify?: boolean): void {
    const rules = this.state.conditionalRules && Object.entries(this.state.conditionalRules || []);
    if (!rules) {
      return;
    }

    let applicableRules:  [string, IConditionalAttributeBehaviorRuleDefinition][] = [];
    if (groupCode && custAttrDataElement) {
      //If a groupCode and dataElement were provided, then check to see if it is being used in any conditional rule
      applicableRules = rules.filter(([key, crDef]) =>
          this.ruleGroupHasDataElement(crDef.conditions, groupCode, custAttrDataElement));
    } else {
      //If no data element was provided then check all of the boolean attribute values against the list of rules
      applicableRules = rules;
      //do not apply any actions that are defined in the rules (just validation)
      skipModify = true;
    }

    //Go through each applicable rules and evaluate
    applicableRules.forEach(([key, crDef]) => {
      if(this.evaluateRule(key, crDef)) {
        //perform the resulting actions
        this.applyRules([[key, crDef]], skipModify);
      }
    });

    //evaluate other rules that are in the error collection
    const errorRules = Object.keys(this.state.conditionalRuleErrors || []);
    errorRules.forEach((rKey) => {
      //make sure it has not already been evaluated
      if(!applicableRules.some(([k,e]) => k === rKey)) {
        const errorRule = this.state.conditionalRules[rKey];
        if(this.evaluateRule(rKey, errorRule)) {
          this.applyRules([[rKey, errorRule]], true);
        }
      }
    });
  }

  private applyRules(rules: [string, IConditionalAttributeBehaviorRuleDefinition][], skipModify?: boolean): void {
    rules.forEach(([key, crDef]) => {
      const rule = crDef;
      //modify data elements
      if (!skipModify && rule.results && rule.results.attributeResults) {
        const ruleGroupKeys = Object.keys(rule.results.attributeResults || []);
        ruleGroupKeys.forEach((gKey) => {
          //find matching group in customer attributes
          const customerAttributeGroup = this.state.custAttributes.find((cag) => cag.groupCode === gKey);
          if (customerAttributeGroup) {
            const ruleDataElemKeys = Object.keys(rule.results.attributeResults[gKey] || []);
            ruleDataElemKeys.forEach((deKey) => {
              //find matching data element in customer attribute group
              const dataElement = customerAttributeGroup.dataElements.find((de) => de.key === deKey);
              const newValue = [JSON.stringify(rule.results.attributeResults[gKey][deKey].value)];
              if (dataElement && (dataElement.value === undefined || newValue !== dataElement.value)) {
                //if matching data element found and value is different then modify value
                dataElement.value = newValue;

                //apply rules associated with dataElement without modify
                this.processAttributeConditions(gKey, dataElement, true);
              }
            });
          }
        });
      }

      //set the submit result state
      if (_.get(rule, "results.submitResults.disallowSaveCustomer")) {
        //This rule is causing form not to be saved. Add to error dict
        this.state.conditionalRuleErrors[key] = rule.results.submitResults;
        //block submit in parent form
        this.props.onConditionalRuleErrorChange(true);
      }
    });
  }

  private evaluateRule(key: string, rule: IConditionalAttributeBehaviorRuleDefinition): boolean {
    //find and clear any existing entry in conditionalRuleErrors that matches
    if (this.state.conditionalRuleErrors && this.state.conditionalRuleErrors[key]) {
      this.deleteConditionalRuleError(key);
    }
    const attrGroups = Object.keys(rule.conditions || []);

    //go through the attributeGroups and check if any of them pass
    return attrGroups.some((agKey) => {
      //filter out data elements that do not have boolean values
      const dataElementKeys = Object.keys(rule.conditions[agKey] || []).filter(
        (deKey) => typeof rule.conditions[agKey][deKey].value === "boolean"
      );
      if (rule.conditionType === ConditionType.AllOf) {
        //all of the conditions must be met
        return dataElementKeys.every(
          (deKey) => this.evaluateRuleDataElement(agKey, deKey, rule.conditions[agKey][deKey].value)
        );
      } else {
        //any of the conditions must be met
        return dataElementKeys.some(
          (deKey) => this.evaluateRuleDataElement(agKey, deKey, rule.conditions[agKey][deKey].value)
        );
      }
    });
  }

  private deleteConditionalRuleError(key: string): void {
    delete this.state.conditionalRuleErrors[key];
    if (Object.keys(this.state.conditionalRuleErrors || []).length === 0) {
      //unblock submit in parent form
      this.props.onConditionalRuleErrorChange(false);
    }
  }

  private evaluateRuleDataElement(agKey: string, deKey: string, deValue: any) : boolean {
    //does the rule value for data element match what the current value is for the data element
    const attributeGroup = this.state.custAttributes.find((ca) => ca.groupCode === agKey);
    if (attributeGroup) {
      //find the matching customer attribute data element in the given group
      const dataElement = attributeGroup.dataElements.find((de) => de.key === deKey);
      //if the data element was found and the values match OR data element was not found and expected val is falsy.
      return (dataElement && deValue === JSON.parse(_.get(dataElement, "value[0]", false))) ||
          (!dataElement && !deValue);
    }

    return false;
  }

  private ruleGroupHasDataElement(conditions: IConditionalAttributeBehaviorRuleAttributeGroups,
                                  groupCode?: string,
                                  custAttrDataElement?: IServiceCustomerAttributeDataElement): boolean {
    const dataElements = conditions && conditions[groupCode];
    return !!(dataElements && custAttrDataElement && dataElements[custAttrDataElement.key]);
  }

  private getConditionalAttributeBehaviorRules(filterRuleKeys: string[]): IConditionalAttributeBehaviorRuleConfig {
    //if no rules defined for screen then return undefined
    if(!filterRuleKeys) {
      return undefined;
    }

    //get all defined rules
    const conditionalRules: IConditionalAttributeBehaviorRuleConfig =
        this.props.settings.configurationManager.getFunctionalBehaviorValues()
        .customerFunctionChoices.conditionalAttributeBehaviorRules;
    const conditionalRulesCopy = _.cloneDeep(conditionalRules);
    const ruleArray = Object.entries(conditionalRules || []);

    //if no rules defined in config then return undefined
    if(_.isEmpty(ruleArray)) {
      return undefined;
    }

    //remove groups and data elements that don't exist in the attributes definitions
    ruleArray.forEach(([ruleKey,r]) => {
      if (!filterRuleKeys.find((frk) => frk === ruleKey)) {
        //do not include in collection of attribute rules to apply
        delete conditionalRulesCopy[ruleKey];
      } else {
        const attrGroups = Object.keys(r.conditions || []);
        attrGroups.forEach((agKey) => {
          const attrGroupDef = this.props.attributeDefs.data.find((ag) => ag.groupCode === agKey);
          if (!attrGroupDef) {
            //if group key is not found in definitions then remove it from the rule
            delete conditionalRulesCopy[ruleKey].conditions[agKey];
          } else {
            //look at the data elements
            const dataElementArray = Object.keys(r.conditions[agKey] || []);
            const elementsToDelete: string[] = [];
            dataElementArray.forEach((deKey) => {
              if (!attrGroupDef.dataElementDefinitions.find((ded) => ded.key === deKey)) {
                elementsToDelete.push(deKey);
              }
            });
            elementsToDelete.forEach((key) =>{
              delete conditionalRulesCopy[ruleKey].conditions[agKey][key];
            });
          }
        });
      }
    });

    return conditionalRulesCopy;
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private handleNumericChange(attr: IServiceCustomerAttribute,
                              custAttrDataElement: IServiceCustomerAttributeDataElement,
                              val: string): void {
    const newNumberVal: string[] = [val.replace(",", "")];
    if (attr.dataElements.findIndex((de) => de.key === custAttrDataElement.key) === -1) {
      attr.dataElements.push(custAttrDataElement);
    }
    custAttrDataElement.value = newNumberVal;
    this.props.onChange(attr.id + "-" + custAttrDataElement.key, newNumberVal);
    this.setState({
      custAttributes : this.state.custAttributes
    });
  }
}
function mapStateToProps(state: any): StateProps {
  return {
    customerState: state.customer,
    settings: state.settings,
    businessState: state.businessState
  };
}
export default connect(mapStateToProps)(CustomerAttributeAddUpdate);

