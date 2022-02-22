import * as React from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { Dispatch } from "redux";
import { Field, FormErrors, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  IItemDisplayLine,
  ITaxOverrideLine
} from "@aptos-scp/scp-component-store-selling-features";
import {TaxOverrideType} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import BaseView from "../../common/BaseView";
import { renderPercentageInputField, RenderSelectOptions } from "../../common/FieldValidation";
import Header from "../../common/Header";
import ItemLine from "../../common/ItemLine";
import ItemSummaryLine from "../../common/ItemSummaryLine";
import TaxOverrideLine from "../../common/TaxOverrideLine";
import { handleFormSubmission, warnBeforeLosingChanges } from "../../common/utilities";
import VectorIcon from "../../common/VectorIcon";
import { NavigationProp } from "../../StackNavigatorParams";
import { itemTaxOverrideScreenStyle } from "../styles";

export interface TaxOverrideForm {
  taxRate: string;
  reasonCode: RenderSelectOptions;
  lineNumber: string;
}

interface State {
  reasonCode: RenderSelectOptions;
  currentSelectedOption: boolean;
  editTaxOverride: boolean;
  lineNumber: number;
}

interface Props {
  lines: IItemDisplayLine[];
  showLine: boolean;
  reasonCodeRequired: boolean;
  reasons?: RenderSelectOptions[];
  isItemLevel: boolean;
  onSave: (taxRate: string, reasonCodeId: RenderSelectOptions, lineNumber: string) => void;
  onCancel: () => void;
  taxOverrideDisplayLines?: ITaxOverrideLine[];
  navigation: NavigationProp;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.customer.CustomerAddUpdate");

class TaxOverride extends React.Component<Props & InjectedFormProps<TaxOverrideForm, Props> &
  FormInstance<TaxOverrideForm, undefined>, State> {
  private styles: any;

  public constructor(props: Props & InjectedFormProps<TaxOverrideForm, Props> &
      FormInstance<TaxOverrideForm, undefined>) {
    super(props);
    this.styles = Theme.getStyles(itemTaxOverrideScreenStyle());

    this.state = {
      reasonCode: undefined,
      currentSelectedOption: false,
      editTaxOverride: false,
      lineNumber: undefined
    };
  }

  public componentDidMount(): void {
    this.props["initialize"]({
      taxRate: undefined,
      reasonCode: undefined,
      lineNumber: undefined
    });
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (this.props.lines && this.props.lines.length === 0 && prevProps.lines.length > 0) {
      this.setState({
        reasonCode: undefined
      });
    }
  }

  public render(): JSX.Element {
    const alreadyTaxOverrided = this.isAlreadyOverrided() && !this.state.editTaxOverride &&
        !this.isMultipleTaxOverride();
    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("taxOverride")}
          backButton={{
            name: "Back", action: () => warnBeforeLosingChanges(
              this.props.dirty, this.props.onCancel)
          }}
          rightButton={{
            title: this.canEdit ? I18n.t("edit") : I18n.t("apply"),
            action: this.handleSubmission
          }}
        />
        {
          !Theme.isTablet && this.props.isItemLevel && this.props.lines && this.props.lines.length === 1 &&
          <ItemLine line={this.props.lines[0]} />
        }
        {
          !Theme.isTablet && this.props.isItemLevel && this.props.lines && this.props.lines.length > 1 &&
            this.renderItemSummaryLines()
        }
        { this.isInputEditable() &&
        <View>
          <View>
            { this.warningMessageTaxOverride()}
          </View>
          <View style={{marginTop: 10}}>
            <Field name="taxRate"
              placeholder={I18n.t("taxRate")}
              errorStyle={this.styles.errorText}
              style={this.styles.textInput}
              component={renderPercentageInputField}
              decimalPrecision={4}
            />
            {this.props.reasonCodeRequired && this.props.reasons && this.props.reasons.length ?
              <TouchableOpacity
                style={[this.styles.btnReasonCode, this.isReasonInvalid() ? this.styles.btnInvalidReasonCode : {}]}
                onPress={this.pushReasonCodeList}
              >
                <Text style={[this.styles.btnReasonCodeText, this.styles.tal]}>
                  {!this.state.reasonCode ? I18n.t("reasonCode") : this.state.reasonCode.description}
                </Text>
                <Text style={[this.styles.btnReasonCodeText, this.styles.tar]}>{">"}</Text>
              </TouchableOpacity> : undefined
            }
          </View>
        </View>
        }
        { alreadyTaxOverrided &&
          <View style={this.styles.taxOverrideList}>
            <View style={this.styles.taxHeader}>
              <Text style={this.styles.taxAppliedTitle}>{I18n.t("taxAppliedOverride")}</Text>
            </View>
            <FlatList
                data={this.getTransactionItemTaxOverride(this.props.lines)}
                renderItem={({ item }) =>
                  <TaxOverrideLine
                    line={item}
                    isItemLevel={this.props.isItemLevel}
                    TranscationTaxOverrideLines={this.TranscationTaxOverrideDisplayLines}
                  />
                }
                keyExtractor={(item) => item.lineNumber.toString() } />
          </View>
        }
        {
          Theme.isTablet && this.renderTablet()
        }
      </BaseView>
    );
  }

  private renderItemSummaryLines(): JSX.Element {
    return (
      <View style={this.styles.itemLines}>
        <View style={this.styles.line}>
          <Text style={this.styles.itemLineTitle}>{I18n.t("multipleItem")}</Text>
        </View>
        <FlatList
          style = {this.styles.fullItemLineList}
          data={this.props.lines}
          keyExtractor={(item) => item.lineNumber.toString() }
          renderItem={({ item, index }) =>  <ItemSummaryLine itemLine={item}/>}/>
      </View>
    );
  }

  private handleSubmission = (): void => {
    if (this.isInputEditable()) {
      handleFormSubmission(logger, this.props.submit, this.isValid());
    } else {
      this.setState({ editTaxOverride: true });
      this.updateValues(this.getTransactionItemTaxOverride(this.props.lines));
    }
  }

  private isAlreadyOverrided(): boolean {
    let isAlreadyOverrided;
    if (this.props.isItemLevel) {
      isAlreadyOverrided = this.taxOverrideLevel("Item");
    } else {
      isAlreadyOverrided = this.taxOverrideLevel("Transaction");
      if (!isAlreadyOverrided && this.props.taxOverrideDisplayLines && this.props.taxOverrideDisplayLines.length > 0) {
        const findTransactionOverride = this.TranscationTaxOverrideDisplayLines;
        isAlreadyOverrided = (findTransactionOverride) ? true : false;
      }
    }
    return isAlreadyOverrided;
  }

  private getTransactionItemTaxOverride(lines: IItemDisplayLine[]): IItemDisplayLine[] {

    if (!this.props.isItemLevel) {
      return [lines[0]];
    }
    return lines;
  }

  private get TranscationTaxOverrideDisplayLines (): ITaxOverrideLine {
    return this.props.taxOverrideDisplayLines.find((data) => data.taxOverrideType === TaxOverrideType.Transaction);
  }

  private isMultipleTaxOverride(): boolean {
    return this.props.isItemLevel && this.props.lines.length > 1;
  }

  private isTaxOverrideEditable(): boolean {
    return (!this.state.editTaxOverride && this.isAlreadyOverrided());
  }

  private isInputEditable(): boolean {
    return (this.state.editTaxOverride || !this.isAlreadyOverrided() || this.isMultipleTaxOverride());
  }

  private updateValues(line: IItemDisplayLine[]): void {
    let taxRate;
    let selectedReason: RenderSelectOptions;
    if (this.props.isItemLevel) {
      taxRate = line[0].taxOverride.taxRate;
      selectedReason = {
        code : line[0].taxOverride.reasonCode,
        description: line[0].taxOverride.reasonDescription
      };
    } else {
      const getTransactionTaxOverride = this.TranscationTaxOverrideDisplayLines;
      taxRate = getTransactionTaxOverride.newTaxRate;
      selectedReason = {
        code : getTransactionTaxOverride.reasonCode,
        description: getTransactionTaxOverride.reasonDescription
      };
    }

    this.props.change("taxRate", taxRate);
    this.props.change("reasonCode", selectedReason);

    this.setState({
      reasonCode: selectedReason
    });
  }

  private isReasonInvalid(): boolean {
    return this.props.reasonCodeRequired && this.props.submitFailed && !this.state.reasonCode;
  }

  private get canEdit(): boolean {
    return !this.state.editTaxOverride && this.isAlreadyOverrided() && !this.isMultipleTaxOverride();
  }

  private onChangeReasonCode = (reasonCode: RenderSelectOptions): void => {
    this.setState({ reasonCode });

    this.props.change("reasonCode", reasonCode);
  }

  private renderTablet = (): JSX.Element => {
    return (
      <View style={this.styles.actions}>
        <TouchableOpacity
          style={[this.styles.btnPrimary, this.styles.button, (!this.isTaxOverrideEditable()) && (!this.isValid())
            && this.styles.btnDisabled]}
          disabled={this.isTaxOverrideEditable() ? false : !this.isValid()}
          onPress={this.handleSubmission}
        >
          <Text style={[this.styles.btnPrimaryText, !this.isTaxOverrideEditable() && !this.isValid()
            && this.styles.btnTextDisabled]}>
            {this.canEdit ? I18n.t("edit") : I18n.t("apply")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[this.styles.btnSeconday, this.styles.button]}
          onPress={this.props.onCancel}
        >
          <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  private taxExemptLevel = (taxExemptType: string): boolean => {
    const isTaxExemptApplied = this.props.lines && this.props.lines.length &&
      this.props.lines.filter((line) =>
        !!line.taxAuthority.find((tax) => !!tax.taxExemption));
    return !!(isTaxExemptApplied && !!(isTaxExemptApplied.find((line) =>
    !!(line.taxAuthority.find((tax) => tax.taxExemption
        && tax.taxExemption.taxExemptType === taxExemptType)))));
  }

  private taxOverrideLevel = (taxOverrideType: string): boolean => {
    const isTaxOverrideApplied = this.props.lines && this.props.lines.length &&
      this.props.lines.filter((line) => line.taxOverride !== undefined);

    return !!(isTaxOverrideApplied && isTaxOverrideApplied.length
      && isTaxOverrideApplied.find((line) => line.taxOverride.taxOverrideType === taxOverrideType));
  }

  private warningMessageTaxOverride = (): JSX.Element => {
    const isItemTaxExempt = this.taxExemptLevel("Item");
    const isTransactionTaxExempt = this.taxExemptLevel("Transaction") && !isItemTaxExempt;
    const isItemTaxOverride = this.taxOverrideLevel("Item");
    const isTransactionTaxOverride = this.taxOverrideLevel("Transaction") && !isItemTaxOverride;

    return ((isTransactionTaxOverride || isTransactionTaxExempt || isItemTaxOverride || isItemTaxExempt) ?
      <View style={this.styles.cautionPanel}>
        <View style={this.styles.cautionIconPadding}>
          <VectorIcon
            name={"CautionDiamond"}
            fill={this.styles.cautionIcon.color}
            height={this.styles.cautionIcon.fontSize}
          />
        </View>
        <Text style={this.styles.cautionText}>
          {(isTransactionTaxOverride && I18n.t("transactionTaxOverrideWarning")) ||
            (isTransactionTaxExempt && I18n.t("transactionTaxExemptWarning")) ||
            ((isItemTaxOverride || isItemTaxExempt) && I18n.t("itemTaxOverrideWarning"))}
        </Text>
      </View> : undefined);
  }

  private isValid(): boolean {
    return this.props.valid && (!this.props.reasonCodeRequired || this.state.reasonCode !== undefined);
  }

  private pushReasonCodeList = () => {
    this.props.navigation.push("reasonCodeList", {
      resetTitle: true,
      currentSelectedOption: this.state.reasonCode,
      options: this.props.reasons,
      onOptionChosen: this.onChangeReasonCode
    });
  }
}

export default reduxForm<TaxOverrideForm, Props>({
  form: "taxOverride",
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  validate: (values: TaxOverrideForm, props: Props) => {
    const errors: FormErrors<TaxOverrideForm> = { taxRate: undefined, lineNumber: undefined, reasonCode: undefined };
    if (!values.taxRate) {
      errors.taxRate = I18n.t("required", { field: I18n.t("taxRate") });
    } else if (values.taxRate === undefined || isNaN(parseFloat(values.taxRate))) {
      errors.taxRate = I18n.t("required", { field: I18n.t("taxRate") });
    } else if (parseFloat(values.taxRate) < 0.0 || parseFloat(values.taxRate) > 100.0) {
      errors.taxRate = I18n.t("taxPercentageRange");
    }
    return errors;
  },
  initialValues: {
    taxRate: undefined,
    lineNumber: undefined,
    reasonCode: undefined
  },
  onSubmit(data: TaxOverrideForm, dispatch: Dispatch<any>, props: Props): void {
    props.onSave(data.taxRate, data.reasonCode, data.lineNumber);
    Keyboard.dismiss();
  }
})(TaxOverride);
