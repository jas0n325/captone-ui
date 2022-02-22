import { Container } from "inversify";
import { sortBy, uniq } from "lodash";
import * as React from "react";
import { Alert, View } from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { connect } from "react-redux";
import * as Device from "react-native-device-detection";

import { DataSyncRole, DataSyncStatus, PeerServiceInfo } from "@aptos-scp/scp-component-rn-datasync";
import { getFeatureAccessConfig, IRetailLocation, UiInputKey, UPLOAD_DEVICE_LOGS_EVENT } from "@aptos-scp/scp-component-store-selling-features";
import { IPaymentStatus, StatusCode, UpdateFirmwareStatus } from "@aptos-scp/scp-types-commerce-devices";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core/lib/domain";

import I18n from "../../../config/I18n";
import {
  alert,
  ActionCreator,
  AlertRequest,
  businessOperation,
  DeviceServiceType,
  getRetailLocationAction,
  IPaymentDeviceFirmwareUpdate,
  updateDeviceFirmware
} from "../../actions";
import { AppState, BusinessState, RetailLocationsState, SettingsState, UiState } from "../../reducers";
import Theme from "../../styles";
import { RenderSelectOptions } from "../common/FieldValidation";
import PaymentDeviceSelection from "../payment/PaymentDeviceSelection";
import { getPaymentDevicesAsRenderSelect } from "../payment/PaymentDevicesUtils";
import DataSyncInformation from "./DataSyncInformation";
import GeneralInformation from "./GeneralInformation";
import { informationStyle } from "./styles";

interface FlatListData {
  key: string;
}

interface DispatchProps {
  alert: AlertRequest;
  getRetailLocation: ActionCreator;
  updateDeviceFirmware: ActionCreator;
  businessOperation: ActionCreator;
}

interface StateProps {
  businessState: BusinessState;
  businessStateError: Error;
  businessStateEventType: string;
  dataSyncRole: DataSyncRole;
  diContainer: Container;
  dataSyncStatus: DataSyncStatus;
  paymentStatus: Map<string, IPaymentStatus>;
  peerServices: PeerServiceInfo[];
  pendingTransactionCount: number;
  retailLocations: RetailLocationsState;
  settings: SettingsState;
  stateValues: Readonly<Map<string, any>>;
  deviceIdentity: DeviceIdentity;
  uiState: UiState;
}

interface Props extends StateProps, DispatchProps {
  parentStyles?: object;
  updateRefreshing: (enable: boolean) => void;
  updateInformation: boolean;
}

interface State {
  deviceId: string;
  segmentedControlSelectedIndex: number;
  showPaymentDeviceSelection: boolean;

  updateEnabled: boolean;
  logUploadAvailable: boolean;
  logUploadEnabled: boolean;
}

class MainInformation extends React.Component<Props, State> {
  private readonly styles: any;
  private paymentDevicesOptions: RenderSelectOptions[] = [];

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles({ ...informationStyle(), ...props.parentStyles });

    const logUploadAvailable = this.isLogUploadAvailable();

    this.state = {
      segmentedControlSelectedIndex: 0,
      deviceId: "",
      updateEnabled: false,
      logUploadAvailable,
      logUploadEnabled: false,
      showPaymentDeviceSelection: false
    };
  }

  public componentDidMount(): void {
    this.loadPaymentDevices();
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.paymentStatus !== prevProps.paymentStatus) {
      this.loadPaymentDevices();
    }

    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress &&
        this.props.businessStateEventType === UPLOAD_DEVICE_LOGS_EVENT &&
        this.getRequiredInputs(this.props.businessStateError)?.find(i => i === UiInputKey.USER_CONFIRMATION)) {
      this.confirmUploadLogs();
    }
  }

  public componentWillMount(): void {
    if (!this.props.retailLocations.retailLocation) {
      this.props.getRetailLocation();
    }
  }

  public render(): JSX.Element {
    const {
      activeTabStyle,
      activeTabTextStyle,
      tabStyle,
      tabTextStyle
    } = this.styles;
    return (
      <View>
        <SegmentedControlTab
          activeTabStyle={activeTabStyle}
          activeTabTextStyle={activeTabTextStyle}
          tabStyle={tabStyle}
          tabTextStyle={tabTextStyle}
          values={[I18n.t("general"), I18n.t("dataSync")]}
          selectedIndex={this.state.segmentedControlSelectedIndex}
          onTabPress={(index: number) => { this.setState({ segmentedControlSelectedIndex: index }); }}
        />

        {this.state.segmentedControlSelectedIndex === 0 &&
          <GeneralInformation
            styles={this.styles}
            onUpdate={this.deviceSelections.bind(this)}
            paymentEnvironmentData={this.paymentEnvironmentData()}
            paymentUpdateAvailable={this.state.updateEnabled}
            paymentLogUploadAvailable = {this.state.logUploadAvailable}
            paymentLogUploadEnabled = {this.state.logUploadEnabled}
            onUpload={this.initiateUploadLogs.bind(this)}
            pendingTransactionCount={this.props.pendingTransactionCount}
            settings={this.props.settings}
            stateValues={this.props.stateValues}
            storeTitle={this.getStoreTitle()}
            tenantTitle={this.getTenantTitle()}
          />
        }

          {this.state.segmentedControlSelectedIndex === 1 &&
            <DataSyncInformation
                styles={this.styles}
                dataSyncStatus={this.props.dataSyncStatus}
                dataSyncRole={this.props.dataSyncRole}
                peerServices={this.props.peerServices}
                updateRefreshing = {this.props.updateRefreshing}
                updateInformation = {this.props.updateInformation}
                diContainer = {this.props.diContainer}
            />
          }

        {this.state.showPaymentDeviceSelection &&
          <PaymentDeviceSelection
            onApplyPaymentDeviceSelected={this.onApplyPaymentDeviceSelected.bind(this)}
            paymentDevicesOptions={this.paymentDevicesOptions}
            resetPaymentDeviceSelection={this.resetPaymentDeviceSelection.bind(this)}
          />
        }
      </View>
    );
  }

  private loadPaymentDevices(): void {
    this.paymentDevicesOptions = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, checkUpdateStatus);

    if (this.paymentDevicesOptions.length >= 1) {
      this.setState({ updateEnabled: true });
    }

    const logUploadEnabled = this.isLogUploadEnabled();
    this.setState({logUploadEnabled});

  }

  private isLogUploadAvailable(): boolean {
    return this.logUploadDeviceExists() && this.props.uiState.isAllowed(UPLOAD_DEVICE_LOGS_EVENT)
        && getFeatureAccessConfig(this.props.settings.configurationManager, UPLOAD_DEVICE_LOGS_EVENT)?.enabled && Device.isIos;
  }

  private logUploadDeviceExists(): boolean {
    const logUploadEnabledDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, checkUploadLogsApplicable, true);
    const logUploadEnabled = logUploadEnabledDevices && logUploadEnabledDevices.length > 0;
    return logUploadEnabled;
  }

  private isLogUploadEnabled(): boolean {
    const logUploadEnabledDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus, checkUploadLogsStatus, true);
    const logUploadEnabled = logUploadEnabledDevices && logUploadEnabledDevices.length > 0;
    return logUploadEnabled;
  }

  private getLogUploadDeviceId(paymentStatus: Map<string, IPaymentStatus>): string {
    const logUploadEnabled = getPaymentDevicesAsRenderSelect(paymentStatus, checkUploadLogsStatus, true);
    return logUploadEnabled && logUploadEnabled.length > 0 && logUploadEnabled[0].code;
  }

  private deviceSelections(): void {
    if (this.paymentDevicesOptions.length === 1) {
      this.setState({ deviceId: this.paymentDevicesOptions[0].code }, () => {
        this.updatePaymentDevice();
      });
    } else if (this.paymentDevicesOptions.length > 1) {
      this.setState({ showPaymentDeviceSelection: true });
    }
  }

  private getRequiredInputs(businessStateError: any): string[] {
    return businessStateError?.requiredInputs;
  }

  private initiateUploadLogs(): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.AUTHORIZATION_DEVICE_ID, this.getLogUploadDeviceId(this.props.paymentStatus)));
    this.props.businessOperation(this.props.deviceIdentity, UPLOAD_DEVICE_LOGS_EVENT, uiInputs);
  }

  private confirmUploadLogs(): void {
    const uiInputs: UiInput[] = this.props.businessState.inputs;
    Alert.alert(I18n.t("uploadLogsToAurus"), I18n.t("thisMayTakeSeveralMinutes"), [
      {text: I18n.t("cancel"), style: "cancel"},
      {
        text: I18n.t("uploadLogsButton"), onPress: () => {
          uiInputs.push(new UiInput(UiInputKey.USER_CONFIRMATION, true));
          this.props.businessOperation(this.props.deviceIdentity, UPLOAD_DEVICE_LOGS_EVENT, uiInputs);
        }
      }
    ], {cancelable: true});
  }

  private updatePaymentDevice(): void {
    Alert.alert(I18n.t("updatePaymentDevice"), I18n.t("updatePaymentDeviceUnavailable"), [
      {text: I18n.t("cancel"), style: "cancel"},
      {
        text: I18n.t("updateFirmware"), onPress: () => {
          this.setState({ updateEnabled: false });
          this.sendPaymentUpdate();
        }
      }
    ], {cancelable: true});
  }

  /**
   * Used by the PaymentDeviceSelection Modal
   */
  private resetPaymentDeviceSelection(): void {
    this.setState({ showPaymentDeviceSelection: false });
  }

  /**
   * Used by the PaymentDeviceSelection Modal
   */
  private onApplyPaymentDeviceSelected(deviceId: string): void {
    this.setState({ deviceId: this.paymentDevicesOptions.find((device) => (device.code === deviceId)).code,
      showPaymentDeviceSelection: false}, () => {
      setTimeout(() => {
        this.updatePaymentDevice();
      }, 250);
    });
  }

  private sendPaymentUpdate(): void {
    if (this.paymentDevicesOptions) {
      const deviceUpdate: IPaymentDeviceFirmwareUpdate = { deviceId: this.state.deviceId };
      this.props.updateDeviceFirmware(DeviceServiceType.PaymentDeviceFirmwareUpdate, deviceUpdate);
    }
  }

  private getTenantTitle(): string {
    const tenantConfig = this.props.settings && this.props.settings.tenantConfig;

    if (tenantConfig) {
      return tenantConfig.tenantName;
    }
    return I18n.t("selectTenant");
  }

  private getStoreTitle(): string {
    const settings = this.props.settings;
    const retailLocationId: string = settings.deviceIdentity.retailLocationId;
    const retailLocation: IRetailLocation = this.props.retailLocations.retailLocation;

    if (retailLocation) {
      return `${retailLocationId} -  ${retailLocation.name}`;
    }

    return retailLocationId || I18n.t("selectStore");
  }

  private paymentEnvironmentData(): FlatListData[] {
    // todo: stop-gap until revisit of multi-device support (ZSPFLD-3177).
    // this sorts the payment statuses by `deviceId`, then gets the unique `paymentEnvironment` properties and converts
    // them to the format needed in the FlatList data property.
    return uniq(sortBy(Array.from(this.props.paymentStatus.values()), ["deviceId"]).map(getPaymentEnvironment))
        .map(paymentEnvironmentToFlatListData);
  }
}

function checkUpdateStatus(device: IPaymentStatus): boolean {
  if (device.updateFirmwareStatus === UpdateFirmwareStatus.UpdateAvailable) {
    return true;
  }
}

function checkUploadLogsStatus(device: IPaymentStatus): boolean {
  return device.uploadLogsAvailable;
}

function checkUploadLogsApplicable(device: IPaymentStatus): boolean {
  return device.uploadLogsAvailable || device.statusCode === StatusCode.LogUploadInProgress;
}

function getPaymentEnvironment(status: IPaymentStatus): string {
  const description: string = status.deviceDescription ? `${status.deviceDescription} - ` : "";
  return `${description}${I18n.t(status.paymentEnvironment.i18nCode)}`;
}

function paymentEnvironmentToFlatListData(paymentEnvironment: string): FlatListData {
  return { key: paymentEnvironment };
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    businessStateError: state.businessState.error,
    businessStateEventType: state.businessState.eventType,
    diContainer: state.settings.diContainer,
    dataSyncStatus: state.dataSyncStatus.status,
    dataSyncRole: state.dataSyncStatus.role,
    peerServices: state.dataSyncStatus.peerServices,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    pendingTransactionCount: state.pendingTransactionCount.pendingTransactionCount,
    settings: state.settings,
    retailLocations: state.retailLocations,
    stateValues: state.businessState && state.businessState.stateValues,
    deviceIdentity: state.settings.deviceIdentity,
    uiState: state.uiState
  };
}

export default connect(mapStateToProps, {
  alert: alert.request,
  getRetailLocation: getRetailLocationAction.request,
  updateDeviceFirmware: updateDeviceFirmware.request,
  businessOperation: businessOperation.request
})(MainInformation);


