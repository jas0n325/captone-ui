import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";

import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  Employee,
  IItemDisplayLine,
  MULTI_LINE_EVENT,
  SALESPERSON_ASSOCIATION_EVENT,
  SALESPERSON_VALIDATION_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  dataEvent,
  DataEventType,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  DataEventState,
  SettingsState,
  UiState,
  UI_MODE_WAITING_FOR_INPUT
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationProp } from "../StackNavigatorParams";
import AssignSalesperson from "./AssignSalesperson";
import { AssignSalespersonComponentProps } from "./interfaces";
import { assignSalespersonStyle } from "./styles";

interface StateProps {
  settings: SettingsState;
  businessState: BusinessState;
  incomingDataEvent: DataEventState;
  uiState: UiState;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  dataEventSuccess: ActionCreator;
}

interface Props
  extends AssignSalespersonComponentProps,
    StateProps,
    DispatchProps {
  navigation: NavigationProp;
}

interface State {
  error?: string;
  employeeId: string;
}

class AssignSalespersonComponent extends React.Component<Props, State> {
  private styles: any;
  private allowSkip: any;

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(assignSalespersonStyle());

    this.allowSkip =
      this.props.settings.configurationManager.getFunctionalBehaviorValues().salespersonBehaviors.allowSalespersonPromptAtTransactionStartToBeSkipped;

    this.state = {
      error: undefined,
      employeeId: undefined
    };
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_WAITING_FOR_INPUT);
  }

  public componentDidUpdate(prevProps: Props): void {
    setTimeout(() => this.checkOrAssignSalesperson(prevProps));

    if (
      this.props.incomingDataEvent &&
      this.props.incomingDataEvent.eventType === DataEventType.ScanData &&
      this.props.uiState.mode === UI_MODE_WAITING_FOR_INPUT
    ) {
      const currentCardNumber = this.state.employeeId;

      const incomingIdNumber =
        this.props.incomingDataEvent &&
        this.props.incomingDataEvent.data &&
        this.props.incomingDataEvent.data.data;

      if (incomingIdNumber) {
        if (currentCardNumber !== incomingIdNumber) {
          this.setState({ employeeId: incomingIdNumber });
        }
        // Clear the props
        this.props.dataEventSuccess(this.props.incomingDataEvent, false);
      }
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <AssignSalesperson
          onAssign={this.onAssign}
          onSkip={this.onSkip}
          employeeId={this.state.employeeId}
          canSkip={
            this.allowSkip &&
            this.props.assignToTransaction &&
            this.props.isTransactionStarting
          }
          isTransactionStarting={this.props.isTransactionStarting}
        />
      </BaseView>
    );
  }

  private performSalespersonAssign = (
    assignToTransaction: boolean,
    salesperson: Employee
  ) => {
    const uiInputs: UiInput[] = [];
    const salespersonInput = new UiInput(UiInputKey.SALESPERSON, salesperson);

    const assignToTransactionInput = new UiInput(
      UiInputKey.ASSIGN_TO_TRANSACTION,
      assignToTransaction
    );
    if (this.props.lineNumbers && this.props.lineNumbers.length > 0) {
      uiInputs.push(
        new UiInput(UiInputKey.LINE_NUMBERS, this.props.lineNumbers)
      );
      uiInputs.push(
        new UiInput(UiInputKey.UI_BUSINESS_EVENT, SALESPERSON_ASSOCIATION_EVENT)
      );
      uiInputs.push(
        new UiInput(UiInputKey.UI_INPUTS, [
          salespersonInput,
          assignToTransactionInput
        ])
      );
      this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        MULTI_LINE_EVENT,
        uiInputs
      );
    } else {
      uiInputs.push(salespersonInput);
      uiInputs.push(assignToTransactionInput);
      this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        SALESPERSON_ASSOCIATION_EVENT,
        uiInputs
      );
    }
  };

  private onAssign = (salesperson: string): void => {
    if (salesperson) {
      const uiInputs: UiInput[] = [];
      const salespersonIdInput = new UiInput(
        UiInputKey.SALESPERSON_ID,
        salesperson
      );
      uiInputs.push(salespersonIdInput);
      this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        SALESPERSON_VALIDATION_EVENT,
        uiInputs
      );
    }
  };

  private onSkip = (): void => {
    this.props.onExit(true);
  };

  private checkOrAssignSalesperson = (prevProps: Props) => {
    const nextSalesPerson = this.props.businessState.stateValues.get(
      "transaction.salesperson"
    );
    const prevSalesPerson = prevProps.businessState.stateValues.get(
      "transaction.salesperson"
    );

    let nextLineSalesPerson = undefined;
    let prevLineSalesPerson = undefined;

    if (this.props.lineNumbers) {
      nextLineSalesPerson =
        this.props.businessState.displayInfo.itemDisplayLines.find(
          (line: IItemDisplayLine) =>
            this.props.lineNumbers.some(
              (lineNum) => lineNum === line.lineNumber
            )
        );
      prevLineSalesPerson =
        prevProps.businessState.displayInfo.itemDisplayLines.find(
          (line: IItemDisplayLine) =>
            prevProps.lineNumbers.some((lineNum) => lineNum === line.lineNumber)
        );
    }

    if (
      !prevProps.businessState.nonContextualData.has(
        CollectedDataKey.Salesperson
      ) &&
      this.props.businessState.nonContextualData.has(
        CollectedDataKey.Salesperson
      )
    ) {
      const salesperson: Employee =
        this.props.businessState.nonContextualData.get(
          CollectedDataKey.Salesperson
        );
      if (!this.props.assignToTransaction) {
        setTimeout(
          () =>
            Alert.alert(
              I18n.t("applySalespersonToTransaction"),
              undefined,
              [
                {
                  text: I18n.t("no"),
                  style: "cancel",
                  onPress: () => {
                    this.performSalespersonAssign(false, salesperson);
                  }
                },
                {
                  text: I18n.t("yes"),
                  onPress: () => {
                    this.performSalespersonAssign(true, salesperson);
                  }
                }
              ],
              { cancelable: false }
            ),
          500
        );
      } else {
        this.performSalespersonAssign(true, salesperson);
      }
    }

    if (
      (nextSalesPerson && nextSalesPerson !== prevSalesPerson) ||
      nextLineSalesPerson !== prevLineSalesPerson
    ) {
      this.props.businessState.nonContextualData.delete(
        CollectedDataKey.Salesperson
      );
      this.props.onExit();
    }
  };
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings,
    businessState: state.businessState,
    uiState: state.uiState,
    incomingDataEvent: state.dataEvent
  };
};

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request,
  dataEventSuccess: dataEvent.success
})(AssignSalespersonComponent);
