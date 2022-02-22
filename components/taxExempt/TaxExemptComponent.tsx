import * as React from "react";
import { Keyboard } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  DeviceIdentity,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  IItemDisplayLine,
  IReasonCodeLists,
  ITaxAuthoritiesForExemption,
  ITaxExemptDisplayLine,
  ITEM_TAX_EXEMPT_EVENT,
  TRANSACTION_TAX_EXEMPT_EVENT,
  UiInputKey,
  VOID_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import {
  TaxExemptType,
  TaxOverrideType
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  loadTaxAuthoritiesForExemption,
  sceneTitle,
  selectTaxAuthorityForExemption
} from "../../actions";
import {
  AppState,
  BusinessState,
  SettingsState,
  TaxAuthorityForExemptionState
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import {
  compareRenderSelectOptions,
  RenderSelectOptions
} from "../common/FieldValidation";
import { getFeatureAccessConfig } from "../common/utilities/configurationUtils";
import { NavigationProp } from "../StackNavigatorParams";
import {
  MessageType,
  TaxExemptComponentProps,
  TaxExemptMessage
} from "./interfaces";
import { taxExemptScreenStyles } from "./styles";
import TaxExempt from "./TaxExempt";

interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  settings: SettingsState;
  taxAuthorityState: TaxAuthorityForExemptionState;
}

interface DispatchProps {
  businessOperation: ActionCreator;
  sceneTitle: ActionCreator;
  selectTaxAuthorityForExemption: ActionCreator;
  loadTaxAuthoritiesForExemption: ActionCreator;
}

interface Props extends TaxExemptComponentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  reasonCodeRequired: boolean;
  inProgress: boolean;
}

class TaxExemptComponent extends React.Component<Props, State> {
  private reasons: RenderSelectOptions[] = [];
  private reasonListType: string;
  private taxIdRequired: boolean;
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.loadReasonCodes();

    this.styles = Theme.getStyles(taxExemptScreenStyles());
    this.props.loadTaxAuthoritiesForExemption();
    this.props.selectTaxAuthorityForExemption(undefined);

    this.state = {
      reasonCodeRequired: !!this.reasonListType,
      inProgress: false
    };
  }

  public componentWillMount(): void {
    this.props.sceneTitle("reasonCodeList", "reasonCode");
  }

  public componentWillReceiveProps(nextProps: Props): void {
    if (
      !nextProps.businessState.inProgress &&
      this.props.businessState.inProgress &&
      !nextProps.businessState.error &&
      this.state.inProgress
    ) {
      this.setState({ inProgress: false });
      this.props.onExit();
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <TaxExempt
          reasonCodeRequired={this.state.reasonCodeRequired}
          taxIdRequired={this.taxIdRequired}
          reasons={this.reasons}
          lines={this.loadTaxExemptDisplayLines()}
          onSave={this.handleOnSave.bind(this)}
          onVoid={this.handleOnVoid.bind(this)}
          onCancel={this.props.onExit}
          onSelect={this.props.selectTaxAuthorityForExemption}
          selectedTaxAuthority={
            this.props.taxAuthorityState.selectedTaxAuthority
          }
          taxAuthoritiesForExemption={
            this.props.taxAuthorityState.validTaxAuthorities
          }
          displayMessage={this.checkEligibilityAndDisplayMessage()}
          onBack={this.pop}
        />
      </BaseView>
    );
  }

  private static combineDisplayMessages(
    firstMsg: TaxExemptMessage,
    secondMsg: TaxExemptMessage
  ): TaxExemptMessage {
    if (!firstMsg || !secondMsg) {
      return firstMsg || secondMsg;
    }
    if (
      firstMsg.type === MessageType.Error ||
      secondMsg.type === MessageType.Error
    ) {
      return {
        type: MessageType.Error,
        messages: TaxExemptComponent.combineMessages(
          firstMsg,
          secondMsg,
          MessageType.Error
        ),
        allowProceed: firstMsg.allowProceed && secondMsg.allowProceed
      };
    } else if (
      firstMsg.type === MessageType.Warning ||
      secondMsg.type === MessageType.Warning
    ) {
      return {
        type: MessageType.Warning,
        messages: TaxExemptComponent.combineMessages(
          firstMsg,
          secondMsg,
          MessageType.Warning
        ),
        allowProceed: firstMsg.allowProceed && secondMsg.allowProceed
      };
    } else {
      return {
        type: MessageType.Info,
        messages: TaxExemptComponent.combineMessages(
          firstMsg,
          secondMsg,
          MessageType.Info
        ),
        allowProceed: firstMsg.allowProceed && secondMsg.allowProceed
      };
    }
  }

  private static combineMessages(
    firstMsg: TaxExemptMessage,
    secondMsg: TaxExemptMessage,
    type: MessageType
  ): string[] {
    return [
      ...(firstMsg.type === type ? firstMsg.messages : []),
      ...(secondMsg.type === type ? secondMsg.messages : [])
    ].filter((msg) => msg);
  }

  private loadReasonCodes(): void {
    // Get configured reason codes
    const eventType = this.props.showLine
      ? ITEM_TAX_EXEMPT_EVENT
      : TRANSACTION_TAX_EXEMPT_EVENT;
    const featureConfig = getFeatureAccessConfig(
      this.props.settings.configurationManager,
      eventType
    );
    this.reasonListType = featureConfig.reasonCodeListType;
    this.taxIdRequired = !!featureConfig.taxIdRequired
      ? featureConfig.taxIdRequired
      : featureConfig.taxIdRequired === undefined;

    if (!!this.reasonListType) {
      const configuredReasonCodeLists: IReasonCodeLists =
        this.props.settings.configurationManager.getReasonCodesValues()
          .reasonCodeLists as IReasonCodeLists;
      const configuredReasonCodeList =
        configuredReasonCodeLists &&
        configuredReasonCodeLists[this.reasonListType];
      const configuredReasonCodes =
        configuredReasonCodeList &&
        configuredReasonCodeList.reasonCodeDefinitions;
      if (configuredReasonCodes) {
        // Using those, build selection list (Sorted in ascending order of reason code name)
        this.reasons = Object.keys(configuredReasonCodes)
          .map((aReasonCode: string): RenderSelectOptions => {
            return {
              code: aReasonCode,
              description: configuredReasonCodes[aReasonCode].name
            };
          })
          .sort((reason1, reason2): number => {
            return compareRenderSelectOptions(reason1, reason2);
          });
      }
    }
  }

  private loadTaxExemptDisplayLines(): ITaxExemptDisplayLine[] {
    if (this.props.showLine) {
      const itemLineNumbers: number[] = this.props.itemLines.map(
        (x) => x.lineNumber
      );
      return this.props.businessState.displayInfo.taxExemptDisplayLines.filter(
        (x) =>
          x.taxExemptType === TaxExemptType.Item &&
          this.isExists(
            itemLineNumbers,
            x.exemptedItemLineReferences.map((y) => y.lineNumber)
          )
      );
    } else {
      return this.props.businessState.displayInfo.taxExemptDisplayLines.filter(
        (x) => x.taxExemptType === TaxExemptType.Transaction
      );
    }
  }

  private isExists(inputArray: number[], lookupArray: number[]): boolean {
    return (
      !!inputArray &&
      !!lookupArray &&
      !inputArray.find((x: number) => !lookupArray.some((y: number) => x === y))
    );
  }

  private handleOnSave(
    taxId: string,
    reason: RenderSelectOptions,
    lineNumber: string,
    exemptedTaxAuthority: ITaxAuthoritiesForExemption
  ): void {
    if (
      (this.taxIdRequired && !taxId) ||
      (this.state.reasonCodeRequired && !reason) ||
      (this.props.taxAuthorityState.validTaxAuthorities &&
        !exemptedTaxAuthority) ||
      (this.props.showLine && !this.props.itemLines)
    ) {
      return;
    }

    const uiInputs: UiInput[] = [];
    if (this.props.showLine) {
      // excludes item with tax override and non taxable item :-
      const itemLineNumbers: number[] = this.props.itemLines
        .filter(
          (itemDisplayLine: IItemDisplayLine) =>
            !itemDisplayLine.taxOverride &&
            itemDisplayLine.taxAuthority.some(
              (authority) =>
                !!authority.taxExemption ||
                Money.fromIMoney(authority.tax).isNotZero()
            )
        )
        .map((itemDisplayLine: IItemDisplayLine) => itemDisplayLine.lineNumber);
      uiInputs.push(new UiInput("lineNumbers", itemLineNumbers));
    }

    uiInputs.push(new UiInput(UiInputKey.TAX_EXEMPT_CERTIFICATE_ID, taxId));
    if (lineNumber) {
      uiInputs.push(
        new UiInput(
          UiInputKey.TAX_EXEMPT_LINE_NUMBER,
          Number.parseInt(lineNumber, 10)
        )
      );
    }
    if (
      this.props.taxAuthorityState.validTaxAuthorities &&
      exemptedTaxAuthority
    ) {
      uiInputs.push(
        new UiInput(UiInputKey.EXEMPTED_TAX_AUTHORITIES, exemptedTaxAuthority)
      );
    }
    if (this.state.reasonCodeRequired && reason) {
      uiInputs.push(new UiInput(UiInputKey.REASON_CODE, reason.code));
      uiInputs.push(
        new UiInput(UiInputKey.REASON_DESCRIPTION, reason.description)
      );
      uiInputs.push(
        new UiInput(UiInputKey.REASON_LIST_TYPE, this.reasonListType)
      );
    }
    this.props.businessOperation(
      this.props.deviceIdentity,
      this.props.showLine
        ? ITEM_TAX_EXEMPT_EVENT
        : TRANSACTION_TAX_EXEMPT_EVENT,
      uiInputs
    );
    this.setState({ inProgress: true });

    Keyboard.dismiss();
  }

  private handleOnVoid(lineNumber: number): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", lineNumber));
    this.props.businessOperation(
      this.props.deviceIdentity,
      VOID_LINE_EVENT,
      uiInputs
    );
    this.setState({ inProgress: true });
  }

  private checkEligibilityAndDisplayMessage(): TaxExemptMessage {
    const taxOverrideMessage: TaxExemptMessage =
      this.checkTransactionTaxOverrides() || this.checkItemTaxOverrides();
    const taxExemptMessage: TaxExemptMessage = this.checkItemTaxExemptions();
    const nonTaxableItemMessage: TaxExemptMessage = this.checkNonTaxableItem();
    return TaxExemptComponent.combineDisplayMessages(
      TaxExemptComponent.combineDisplayMessages(
        taxOverrideMessage,
        taxExemptMessage
      ),
      nonTaxableItemMessage
    );
  }

  private checkNonTaxableItem(): TaxExemptMessage {
    let showMessage: boolean = false;
    let allowProceed: boolean = true;
    let type: MessageType = MessageType.Warning;
    let message: string = I18n.t("nonTaxableItemSkipped");
    if (!!this.props.itemLines) {
      showMessage = this.props.itemLines.some(
        (item) =>
          !item.taxOverride &&
          !item.taxAuthority.some(
            (authority) =>
              !!authority.taxExemption ||
              Money.fromIMoney(authority.tax).isNotZero()
          )
      );
      allowProceed = this.props.itemLines.length > 1;
      type = allowProceed ? type : MessageType.Error;
      message = allowProceed ? message : I18n.t("itemNotQualifiedForTaxExempt");
    } else {
      showMessage = this.props.businessState.displayInfo.itemDisplayLines.some(
        (item) =>
          !item.taxOverride &&
          !item.taxAuthority.some(
            (authority) =>
              !!authority.taxExemption ||
              Money.fromIMoney(authority.tax).isNotZero()
          )
      );
    }
    return showMessage
      ? { type, messages: [message], allowProceed }
      : undefined;
  }

  private checkItemTaxExemptions(): TaxExemptMessage {
    let showMessage: boolean = false;
    const itemTaxExemptLines =
      this.props.businessState.displayInfo.taxExemptDisplayLines.filter(
        (line) => line.taxExemptType === TaxExemptType.Item
      );
    if (!!this.props.itemLines) {
      if (this.props.itemLines.length > 1) {
        const itemLineNumbers: number[] = this.props.itemLines.map(
          (line) => line.lineNumber
        );
        showMessage = itemTaxExemptLines.some((line) =>
          this.isExists(
            line.exemptedItemLineReferences.map(
              (reference) => reference.lineNumber
            ),
            itemLineNumbers
          )
        );
      } else {
        showMessage = false;
      }
    } else {
      showMessage = !!itemTaxExemptLines && itemTaxExemptLines.length > 0;
    }
    return showMessage
      ? {
          type: MessageType.Warning,
          messages: [I18n.t("previouslyAppliedTaxModifierOverridden")],
          allowProceed: true
        }
      : undefined;
  }

  private checkItemTaxOverrides(): TaxExemptMessage {
    const showMessage = !!this.props.itemLines
      ? this.props.itemLines.some(
          (line) =>
            !!line.taxOverride &&
            line.taxOverride.taxOverrideType === TaxOverrideType.Item
        )
      : this.props.businessState.displayInfo.itemDisplayLines.some(
          (line) =>
            !!line.taxOverride &&
            line.taxOverride.taxOverrideType === TaxOverrideType.Item
        );
    if (showMessage) {
      if (
        this.props.showLine &&
        !!this.props.itemLines &&
        this.props.itemLines.length === 1
      ) {
        return {
          type: MessageType.Info,
          messages: [I18n.t("taxOverrideAppliedToItem")],
          allowProceed: false
        };
      } else {
        return {
          type: MessageType.Warning,
          messages: [I18n.t("itemTaxOverrideWillBeSkipped")],
          allowProceed: true
        };
      }
    }
  }

  private checkTransactionTaxOverrides(): TaxExemptMessage {
    const showMessage =
      this.props.businessState.displayInfo.itemDisplayLines.some(
        (line) =>
          !!line.taxOverride &&
          line.taxOverride.taxOverrideType === TaxOverrideType.Transaction
      );
    return showMessage
      ? {
          type: MessageType.Error,
          messages: [I18n.t("taxOverrideApplied")],
          allowProceed: false
        }
      : undefined;
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    settings: state.settings,
    taxAuthorityState: state.taxAuthorityForExemption
  };
}

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  businessOperation: businessOperation.request,
  sceneTitle: sceneTitle.request,
  selectTaxAuthorityForExemption: selectTaxAuthorityForExemption.request,
  loadTaxAuthoritiesForExemption: loadTaxAuthoritiesForExemption.request
})(TaxExemptComponent);
