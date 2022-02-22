import * as React from "react";
import {
  FlatList,
  Keyboard,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Dispatch } from "redux";
import {
  Field,
  FormErrors,
  FormInstance,
  InjectedFormProps,
  reduxForm
} from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  ITaxAuthoritiesForExemption,
  ITaxExemptDisplayLine
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator } from "../../actions";
import Theme from "../../styles";
import {
  FieldValidation,
  renderReasonSelect,
  RenderSelectOptions,
  renderTextInputField
} from "../common/FieldValidation";
import Header from "../common/Header";
import TaxExemptLine from "../common/TaxExemptLine";
import {
  handleFormSubmission,
  warnBeforeLosingChanges
} from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { taxExemptStyles } from "./styles";
import { MessageType, TaxExemptMessage } from "./interfaces";

const logger: ILogger = LogManager.getLogger(
  "com.aptos.storeselling.ui.components.taxExempt.TaxExempt"
);

export interface TaxExemptForm {
  taxId: string;
  reasonCode: any;
  lineNumber: string;
  exemptedTaxAuthority: ITaxAuthoritiesForExemption;
}

interface Props {
  reasonCodeRequired: boolean;
  taxIdRequired: boolean;
  reasons: RenderSelectOptions[];
  lines: ITaxExemptDisplayLine[];
  onSave: (
    taxId: string,
    reasonCodeId: string,
    lineNumber: string,
    exemptedTaxAuthority: ITaxAuthoritiesForExemption
  ) => void;
  onVoid: (lineNumber: number) => void;
  onCancel: () => void;
  taxAuthoritiesForExemption: ITaxAuthoritiesForExemption[];
  onSelect: ActionCreator;
  selectedTaxAuthority?: ITaxAuthoritiesForExemption;
  displayMessage: TaxExemptMessage;
  onBack: () => void;
}

interface State {
  reasonCode: RenderSelectOptions;
  selectedLine: ITaxExemptDisplayLine;
  currentSelectedOption: boolean;
  editTaxExempt: boolean;
}

class TaxExempt extends React.Component<
  Props &
    InjectedFormProps<TaxExemptForm, Props> &
    FormInstance<TaxExemptForm, undefined>,
  State
> {
  private taxIdRef: any;
  private styles: any;

  public constructor(
    props: Props &
      InjectedFormProps<TaxExemptForm, Props> &
      FormInstance<TaxExemptForm, undefined>
  ) {
    super(props);

    this.styles = Theme.getStyles(taxExemptStyles());

    this.state = {
      reasonCode: undefined,
      selectedLine: undefined,
      currentSelectedOption: false,
      editTaxExempt: false
    };
  }

  public componentDidMount(): void {
    if (!this.props.displayMessage || this.props.displayMessage.allowProceed) {
      if (this.isAlreadyExempted()) {
        this.updateValues(this.props.lines[0]);
      } else {
        this.taxIdRef.focus();
      }
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (
      this.props.lines &&
      this.props.lines.length === 0 &&
      prevProps.lines.length > 0
    ) {
      this.props["initialize"]({
        taxId: undefined,
        reasonCode: undefined,
        lineNumber: undefined,
        exemptedTaxAuthority: undefined
      });
      this.setState({
        reasonCode: undefined,
        selectedLine: undefined
      });
    }
  }

  public render(): JSX.Element {
    const mapIconName: Map<MessageType, string> = new Map<MessageType, string>([
      [MessageType.Error, "CautionCircle"],
      [MessageType.Warning, "CautionDiamond"],
      [MessageType.Info, "Information"]
    ]);
    const mapIconPanelStyle: Map<MessageType, any> = new Map<MessageType, any>([
      [MessageType.Error, this.styles.errorCautionPanel],
      [MessageType.Warning, this.styles.warningCautionPanel],
      [MessageType.Info, this.styles.infoCautionPanel]
    ]);
    const mapCautionIconStyle: Map<MessageType, any> = new Map<
      MessageType,
      any
    >([
      [MessageType.Error, this.styles.errorCautionIcon],
      [MessageType.Warning, this.styles.warningCautionIcon],
      [MessageType.Info, this.styles.infoCautionIcon]
    ]);

    const allowProceed: boolean =
      !this.props.displayMessage || this.props.displayMessage.allowProceed;

    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("taxExempt")}
          backButton={{
            name: "Back",
            action: () =>
              warnBeforeLosingChanges(
                this.props.dirty,
                this.props.onBack.bind(this)
              )
          }}
          rightButton={{
            title:
              this.props.displayMessage &&
              !this.props.displayMessage.allowProceed
                ? I18n.t("okCaps")
                : this.isAlreadyExempted() && !this.state.editTaxExempt
                ? I18n.t("edit")
                : I18n.t("apply"),
            action: () => this.handleSubmission()
          }}
        />
        {this.props.displayMessage && (
          <View style={mapIconPanelStyle.get(this.props.displayMessage.type)}>
            <View style={this.styles.cautionIconPadding}>
              <VectorIcon
                name={mapIconName.get(this.props.displayMessage.type)}
                fill={
                  mapCautionIconStyle.get(this.props.displayMessage.type).color
                }
                height={
                  mapCautionIconStyle.get(this.props.displayMessage.type)
                    .fontSize
                }
              />
            </View>
            <View style={this.styles.cautionText}>
              {this.props.displayMessage.messages.map((msg) => {
                return (
                  <>
                    <Text>{msg}</Text>
                    <Text />
                  </>
                );
              })}
            </View>
          </View>
        )}
        {allowProceed &&
          (!this.isAlreadyExempted() || this.state.editTaxExempt) && (
            <View>
              <Field
                name="taxId"
                onRef={(ref: any) => (this.taxIdRef = ref)}
                placeholder={I18n.t("taxId")}
                placeholderSentenceCase={false}
                style={this.styles.textInput}
                component={renderTextInputField}
                errorStyle={this.styles.textInputError}
                maxLength={20}
              />
              {this.props.taxAuthoritiesForExemption && (
                <Field
                  name="exemptedTaxAuthority"
                  data={this.props.taxAuthoritiesForExemption}
                  component={renderFlatListField}
                  renderItem={this.renderTaxAuthorityButton}
                  extraData={this.props.selectedTaxAuthority}
                  errorStyle={this.styles.textInputError}
                  style={this.styles.textInput}
                  errorText={I18n.t("required", {
                    field: I18n.t("selectTaxAuthority")
                  })}
                />
              )}
              {this.props.reasonCodeRequired && (
                <Field
                  name={"reasonCode"}
                  component={renderReasonSelect}
                  errorStyle={this.styles.textInputError}
                  placeholder={I18n.t("reasonCode")}
                  reasons={this.props.reasons}
                  style={this.styles.reasonCodeInput}
                  onChange={(reasonCode: any) => this.setState({ reasonCode })}
                />
              )}
            </View>
          )}
        {allowProceed && this.isAlreadyExempted() && !this.state.editTaxExempt && (
          <View style={this.styles.taxExemptList}>
            <View style={this.styles.taxHeader}>
              <Text style={this.styles.taxAppliedTitle}>
                {I18n.t("taxAppliedExemption")}
              </Text>
            </View>
            <FlatList
              data={this.props.lines}
              renderItem={({ item }) => (
                <TaxExemptLine
                  line={item}
                  onSelect={(line: ITaxExemptDisplayLine) => {
                    if (
                      line.lineNumber !== this.state.selectedLine.lineNumber
                    ) {
                      this.updateValues(line);
                    }
                  }}
                  onVoid={this.props.onVoid}
                />
              )}
              keyExtractor={(item) => item.lineNumber.toString()}
            />
          </View>
        )}
        {Theme.isTablet && this.renderTablet(allowProceed)}
      </View>
    );
  }

  private renderTablet = (allowProceed: boolean): JSX.Element => {
    return (
      <View style={this.styles.actions}>
        {allowProceed && (
          <TouchableOpacity
            style={[
              this.styles.btnPrimary,
              this.styles.button,
              !this.isValid() && this.styles.btnDisabled
            ]}
            disabled={!this.isValid()}
            onPress={() => this.handleSubmission()}
          >
            <Text
              style={[
                this.styles.btnPrimaryText,
                !this.isValid() && this.styles.btnTextDisabled
              ]}
            >
              {this.isAlreadyExempted() && !this.state.editTaxExempt
                ? I18n.t("edit")
                : I18n.t("apply")}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[this.styles.btnSeconday, this.styles.button]}
          onPress={this.props.onCancel}
        >
          <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  private renderTaxAuthorityButton = ({
    item
  }: {
    item: ITaxAuthoritiesForExemption;
  }): JSX.Element => {
    return (
      <TouchableOpacity
        style={this.styles.optionButton}
        onPress={() => {
          this.selectTaxAuthorityOptions(item);
        }}
      >
        <View style={this.styles.itemView}>
          <Text style={this.styles.itemText}>{item.name}</Text>
        </View>
        <View>
          {this.props.selectedTaxAuthority &&
            this.props.selectedTaxAuthority.name === item.name && (
              <VectorIcon
                name="Checkmark"
                fill={this.styles.checkIcon.color}
                height={this.styles.checkIcon.fontSize}
              />
            )}
        </View>
      </TouchableOpacity>
    );
  };

  private handleSubmission(): void {
    if (this.props.displayMessage && !this.props.displayMessage.allowProceed) {
      this.props.onCancel();
    } else {
      if (this.isAlreadyExempted() && !this.state.editTaxExempt) {
        this.setState({ editTaxExempt: true });
      } else {
        handleFormSubmission(logger, this.props.submit);
      }
    }
  }

  private isAlreadyExempted(): boolean {
    return this.props.lines && this.props.lines.length > 0;
  }

  private selectTaxAuthorityOptions(item: ITaxAuthoritiesForExemption): void {
    this.props.onSelect(item);
    this.props.change("exemptedTaxAuthority", item);
  }

  private updateValues(line: ITaxExemptDisplayLine): void {
    this.props["initialize"]({
      taxId: line.certificateId,
      reasonCode: {
        code: line.reasonCode,
        description: line.reasonDescription
      } as RenderSelectOptions,
      lineNumber: line.lineNumber.toString(10),
      exemptedTaxAuthority: this.findTaxAuthority(line)
    });

    const selectedReason: RenderSelectOptions = {
      code: line.reasonCode,
      description: line.reasonDescription
    };

    this.setState({
      reasonCode: selectedReason,
      selectedLine: line
    });
  }

  private findTaxAuthority(
    line: ITaxExemptDisplayLine
  ): ITaxAuthoritiesForExemption {
    const selectedIds: string[] =
      line.exemptedTaxAuthorities &&
      line.exemptedTaxAuthorities.map((x) => x.id);
    const selectedTaxAuthority =
      this.props.taxAuthoritiesForExemption &&
      this.props.taxAuthoritiesForExemption.find(
        (y) =>
          this.matchIds(selectedIds, y.taxAuthorityIds) &&
          this.matchIds(y.taxAuthorityIds, selectedIds)
      );
    this.selectTaxAuthorityOptions(selectedTaxAuthority);
    return selectedTaxAuthority;
  }

  private matchIds(checkIds: string[], lookupIds: string[]): boolean {
    return (
      !!checkIds &&
      !!lookupIds &&
      !checkIds.find((x: string) => !lookupIds.some((y: string) => x === y))
    );
  }

  private isValid(): boolean {
    return (
      this.props.valid &&
      (!this.props.reasonCodeRequired || this.state.reasonCode !== undefined)
    );
  }
}

export default reduxForm<TaxExemptForm, Props>({
  form: "taxExempt",
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  validate: (values: TaxExemptForm, props: Props) => {
    const errors: FormErrors<TaxExemptForm> = {
      taxId: undefined,
      reasonCode: undefined,
      lineNumber: undefined,
      exemptedTaxAuthority: undefined
    };
    if (props.taxIdRequired && !values.taxId) {
      errors.taxId = I18n.t("required", { field: I18n.t("taxId") });
    }
    if (!values.reasonCode) {
      errors.reasonCode = I18n.t("required", { field: I18n.t("reasonCode") });
    }

    return errors;
  },
  initialValues: {
    taxId: undefined,
    reasonCode: undefined,
    lineNumber: undefined,
    exemptedTaxAuthority: undefined
  },
  onSubmit(data: TaxExemptForm, dispatch: Dispatch<any>, props: Props): void {
    props.onSave(
      data.taxId,
      data.reasonCode,
      data.lineNumber,
      data.exemptedTaxAuthority
    );
    Keyboard.dismiss();
  }
})(TaxExempt);

// TODO: The below component should be refactored to make it Generic &
// moved to FieldValidation.tsx

const renderFlatListField = (field: {
  input: any;
  data: ITaxAuthoritiesForExemption[];
  renderItem: ListRenderItem<ITaxAuthoritiesForExemption>;
  extraData: ITaxAuthoritiesForExemption;
  meta: {
    form: string;
    dirty: boolean;
    submitFailed: boolean;
    touched: boolean;
    error: string;
    dispatch: any;
  };
  onRef?: any;
  style?: any;
  errorStyle?: any;
  errorText?: string;
}) => {
  const styles = Theme.getStyles(taxExemptStyles());
  const { touched, submitFailed, error } = field.meta;
  const hasError =
    field.data &&
    !field.extraData &&
    (touched || submitFailed) &&
    (!!error || !!field.errorText);

  return (
    <FieldValidation
      hasError={hasError}
      error={field.errorText || error}
      style={field.style || {}}
      errorStyle={field.errorStyle || {}}
    >
      <View>
        <View style={styles.taxHeader}>
          <Text style={styles.taxTitle}>{I18n.t("taxAvailableExemption")}</Text>
        </View>
        <View style={styles.listItemsView}>
          <FlatList
            data={field.data}
            renderItem={field.renderItem}
            keyExtractor={(item, index) => index.toString()}
            extraData={field.extraData}
          />
        </View>
      </View>
    </FieldValidation>
  );
};
