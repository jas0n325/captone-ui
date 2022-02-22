import * as React from "react";
import { Keyboard } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  IDepartment,
  IFeatureAccessConfig,
  ITEM_NOT_ON_FILE_EVENT,
  QUANTITY_CHANGE_EVENT,
  RETURN_ITEM_NOT_ON_FILE_EVENT,
  SELL_ITEM_NOT_ON_FILE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import {
  ActionCreator,
  businessOperation,
  getDepartments,
  updateUiMode
} from "../../actions";
import { AppState, BusinessState, DepartmentsState, SettingsState, UiState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { compareRenderSelectOptions, RenderSelectOptions } from "../common/FieldValidation";
import { getCurrencyCode, getCurrencyMinimumDenomination, MinimumDenomination } from "../common/utilities";
import { getFeatureAccessConfig, getMaximumAllowedFieldLength } from "../common/utilities/configurationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { NotOnFileScreenProps } from "./interfaces";
import NotOnFile from "./NotOnFile";
import { notOnFileScreenStyles } from "./styles";


interface StateProps {
  businessState: BusinessState;
  departments: DepartmentsState;
  settings: SettingsState;
  uiState: UiState;
  retailLocationCurrency: string;
  configManager: IConfigurationManager;
  i18nLocation: string
}

interface DispatchProps {
  businessOperation: ActionCreator;
  getDepartments: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends NotOnFileScreenProps, StateProps, DispatchProps, NavigationScreenProps<"notOnFile"> {}

interface State {
  itemKey: string;
  itemKeyType: string;
  inputSource: string;
  departments: RenderSelectOptions[];
}

class NotOnFileScreen extends React.Component<Props, State> {
  private maxAllowedLength: number;
  private minimumDenomination: MinimumDenomination;
  private currency: string;
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(notOnFileScreenStyles());

    this.maxAllowedLength = getMaximumAllowedFieldLength(this.props.settings.configurationManager);
    this.currency = getCurrencyCode(this.props.businessState.stateValues, this.props.retailLocationCurrency);
    this.minimumDenomination = getCurrencyMinimumDenomination(this.props.configManager, this.currency,
        this.props.i18nLocation);

    this.state = {
      itemKey: props.itemKey,
      itemKeyType: props.itemKeyType,
      inputSource: props.inputSource,
      departments: []
    };
  }

  public componentDidMount(): void {
    /**
     * If department are required than we will fetch the departments
     */
    if (this.isDepartmentRequired()) {
      if (!this.props.departments.departments || !this.props.departments.departments.length) {
        this.props.getDepartments();
      } else {
        this.setState({ departments: this.formatDepartments(this.props.departments) });
      }
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress && !this.props.businessState.error) {
      this.props.navigation.pop();
    }

    if (prevProps.departments.inProgress && !this.props.departments.inProgress) {
      this.setState({ departments: this.formatDepartments(this.props.departments) });
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.fill}>
        <NotOnFile
          businessState={this.props.businessState}
          retailLocationCurrency={this.props.settings.retailLocationCurrency}
          departments={this.state.departments}
          itemKey={this.state.itemKey}
          maxAllowedLength={this.maxAllowedLength}
          quantityDisabled={this.quantityDisabled}
          currency={this.currency}
          minimumDenomination={this.minimumDenomination}
          onSave={this.handleNotOnFile.bind(this)}
          isDepartmentInputsRequired={this.isDepartmentRequired.bind(this)}
          onCancel={this.pop}
          navigation={this.props.navigation}
        />
      </BaseView>
    );
  }

  private handleNotOnFile(departmentId: string, description: string, price: string, quantity: string): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("itemKey", this.state.itemKey, "string", this.state.inputSource));
    uiInputs.push(new UiInput("itemKeyType", this.state.itemKeyType, "string", this.state.inputSource));

    if (this.isDepartmentRequired()) {
      const department: RenderSelectOptions = this.state.departments.find(
        (r) => r.code === departmentId);
      uiInputs.push(new UiInput("departmentId", department.code));
    }

    uiInputs.push(new UiInput("description", description));
    uiInputs.push(new UiInput("price", price));
    uiInputs.push(new UiInput(UiInputKey.QUANTITY, quantity));
    this.props.businessOperation(this.props.settings.deviceIdentity, ITEM_NOT_ON_FILE_EVENT, uiInputs);

    Keyboard.dismiss();
  }

  private formatDepartments(departments: DepartmentsState): Array<RenderSelectOptions> {
    // Using those, build selection list (Sorted in ascending order of department name)
    return departments.departments
          .map((department: IDepartment): RenderSelectOptions => {
            return {
              code: department.departmentId,
              description: department.name
            };
          })
          .sort((dept1, dept2): number => {
            return compareRenderSelectOptions(dept1, dept2);
          });

  }

  private isDepartmentRequired(): boolean {
    const configuredFeatures: Array<IFeatureAccessConfig> = this.props.settings.configurationManager &&
        this.props.settings.configurationManager.getFeaturesValues() as Array<IFeatureAccessConfig>;
    const itemNotOnFileEvent: string = this.props.businessState && this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get("ItemHandlingSession.isReturning") ?
        RETURN_ITEM_NOT_ON_FILE_EVENT : SELL_ITEM_NOT_ON_FILE_EVENT;
    const eventConfig: IFeatureAccessConfig = configuredFeatures.find((item: IFeatureAccessConfig) =>
        item.uiBusinessEventType === itemNotOnFileEvent);
    return eventConfig && eventConfig.promptForDepartmentField;
  }

  private get quantityDisabled(): boolean {
    const quantityChangeFeatureConfig: IFeatureAccessConfig = getFeatureAccessConfig(
      this.props.settings.configurationManager,
      QUANTITY_CHANGE_EVENT
    );
    return quantityChangeFeatureConfig && quantityChangeFeatureConfig.enabled === false;
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

function mapStateToProps(state: AppState): any {
  return {
    businessState: state.businessState,
    departments: state.departments,
    settings: state.settings,
    uiState: state.uiState,
    retailLocationCurrency: state.settings.retailLocationCurrency,
    configManager: state.settings.configurationManager,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect(mapStateToProps, {
  businessOperation: businessOperation.request,
  getDepartments: getDepartments.request,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof NotOnFileScreen>()(NotOnFileScreen));
