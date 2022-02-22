import * as React from "react";
import { Alert, AlertButton, Platform, TouchableOpacity, View } from "react-native";
import { appDetailsSettings } from "react-native-android-open-settings";
import Permissions from "react-native-permissions";
import { connect } from "react-redux";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  hideCameraScanner,
  setTerminalStateSync,
  showCameraScanner
} from "../../actions";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import { IconType } from "./constants";
import Header from "./Header";
import { cameraScannerButtonStyle } from "./styles";
import { getStoreLocale, getTestIdProperties } from "./utilities";
import VectorIcon from "./VectorIcon";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.CameraScannerButton");

interface DispatchProps {
  setTerminalStateSync: ActionCreator;
  showCameraScanner: ActionCreator;
  hideCameraScanner: ActionCreator;
}

interface StateProps {
  settings: SettingsState;
}

interface Props extends StateProps, DispatchProps {
  visible: boolean;
  cameraIcon?: IconType;
  containerStyles?: any;
  disabled?: boolean;
  consecutiveScanningEnabled?: boolean;
  consecutiveScanningDelay?: number;
  testID?: string;
}

interface State {
  cameraPermission: string;
  canOpenCameraSettings: boolean;
}

class CameraScannerButton extends React.Component<Props, State> {
  private enableCameraScanner: boolean = false;
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(cameraScannerButtonStyle());
    this.requestPermission =  this.requestPermission.bind(this);
    const peripheralsConfig: any = this.props.settings.configurationManager.getPeripheralsValues();
    this.enableCameraScanner = peripheralsConfig && peripheralsConfig.scannerType &&
        peripheralsConfig.scannerType.enableCameraScanner;

    this.state = {
      cameraPermission: "undetermined",
      canOpenCameraSettings: false
    };
  }

  public componentDidMount(): void {
    if (Platform.OS === "ios") {
      Permissions.canOpenSettings()
          .then((canOpenSettings) => {
            this.setState({ canOpenCameraSettings: canOpenSettings });
          }).catch((error) => {
            throw logger.throwing(error, "CameraScannerButton.Permissions.canOpenSettings", LogLevel.WARN);
          });
    } else if (Platform.OS === "android") {
      // react-native-android-open-settings always opens up settings page, as long as the package doesn't change.
      this.setState({ canOpenCameraSettings: true });
    }

    this.checkCameraPermission();
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.cameraIconArea, this.props.cameraIcon && this.props.cameraIcon.style || {}]} >
        {
          this.props.visible && this.getEnableCameraScanner() &&
          <TouchableOpacity
            style={this.styles.cameraIconButton}
            onPress={() => this.openScanner()}
            disabled={this.props.disabled}
            {...getTestIdProperties(this.props.testID, "camera")}
          >
            <VectorIcon
              name={this.props.cameraIcon?.icon || "Camera"}
              fill={this.props.cameraIcon?.color || this.styles.defaultIconStyle.color}
              height={this.props.cameraIcon?.size || this.styles.defaultIconStyle.fontSize}
            />
          </TouchableOpacity>
        }
      </View>
    );
  }

  private checkCameraPermission(): void {
    Permissions.check("camera")
      .then((response) => {
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        this.setState({ cameraPermission: response });
      }).catch((error) => {
        throw logger.throwing(error, "CameraScannerButton.checkCameraPermission", LogLevel.WARN);
      });
  }

  private requestPermission(): void {
    Permissions.request("camera").then((response) => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({cameraPermission: response});

      if (response === "authorized") {
        this.goToCameraScannerScreen();
      } else {
        /**
         * Using timeout to prevent a terminal state sync after the user presses "Don't allow" as it still fires
         * otherwise.
         */
        setTimeout(() => this.props.setTerminalStateSync(true), 1000);
      }
    }).catch((e) => logger.warn(e));
  }

  private getEnableCameraScanner(): boolean {
    return this.enableCameraScanner && (
      this.cameraPermissionAuthorized() ||
      this.canRequestCameraPermissions() ||
      this.canOpenCameraSettings()
    );
  }

  // For Camera Scanner
  private openScanner(): void {
    // iOS and Android have different meanings for permissions, deal with accordingly
    if (this.cameraPermissionAuthorized()) {
      this.goToCameraScannerScreen();
    } else {
      let alertTitle: string;
      let alertMessage: string;
      const buttons: AlertButton[] = [];

      this.props.setTerminalStateSync(false);
      const locale =  getStoreLocale();
      if (this.canRequestCameraPermissions()) {
        this.props.setTerminalStateSync(true);
        this.requestPermission();
      } else if (this.canOpenCameraSettings()) {
        alertTitle = I18n.t("cameraAccessRestricted" , { locale });
        alertMessage = I18n.t("cameraAccessRestrictedExplained", { locale });
        buttons.push(
          { text: I18n.t("cancel", { locale }), onPress: () => this.props.setTerminalStateSync(true), style: "cancel" },
          { text: I18n.t("openSettings", { locale }), onPress: this.openSettings.bind(this) }
        );
        Alert.alert(alertTitle, alertMessage, buttons);
      } else {
        alertTitle = I18n.t("cameraPrevented", { locale });
        alertMessage = I18n.t("cameraPreventedExplained", { locale });
        buttons.push({ text: I18n.t("ok", { locale }), onPress: () => this.props.setTerminalStateSync(true) });
        Alert.alert(alertTitle, alertMessage, buttons);
      }
    }
  }

  private cameraPermissionAuthorized(): boolean {
    return this.state.cameraPermission === "authorized";
  }

  private canRequestCameraPermissions(): boolean {
    if (Platform.OS === "ios") {
      return this.state.cameraPermission === "undetermined";
    } else if (Platform.OS === "android") {
      return this.state.cameraPermission === "undetermined" || this.state.cameraPermission === "denied";
    }
  }

  private canOpenCameraSettings(): boolean {
    if (Platform.OS === "ios") {
      return this.state.cameraPermission === "denied" && this.state.canOpenCameraSettings;
    } else if (Platform.OS === "android") {
      return this.state.cameraPermission === "restricted" && this.state.canOpenCameraSettings;
    }
  }

  private openSettings(): void {
    this.props.setTerminalStateSync(true);

    if (Platform.OS === "ios") {
      Permissions.openSettings().catch((error) => {
        throw logger.throwing(error, "CameraScannerButton.openSettings", LogLevel.WARN);
      });
    } else if (Platform.OS === "android") {
      appDetailsSettings();
    }
  }

  private goToCameraScannerScreen = (): void => {
    this.props.showCameraScanner(this.props.consecutiveScanningEnabled, this.props.consecutiveScanningDelay,
        this.renderHeader(), this.renderGoodIcon(), this.renderBadIcon(),
        () => this.handlePopScreen(), (key: string) => I18n.t(key));
  }

  private renderHeader = (): JSX.Element => {
    return (
      <Header
        backButton={{ name: "Back", action: this.handlePopScreen }}
        isVisibleTablet={Theme.isTablet}
        title={I18n.t("scan")}
      />
    );
  }

  private  renderBadIcon = (): JSX.Element => {
    return (
      <VectorIcon
        name={"CautionCircle"}
        fill={this.styles.iconStyle.cautionColor}
        height={this.styles.iconStyle.height}
      />
    );
  }

  private  renderGoodIcon = (): JSX.Element => {
    return (
      <VectorIcon
        name={"SuccessCircle"}
        fill={this.styles.iconStyle.successColor}
        height={this.styles.iconStyle.height}
      />
    );
  }

  private handlePopScreen = (): void => {
    this.props.setTerminalStateSync(true);
    this.props.hideCameraScanner();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings
  };
}

export default connect(mapStateToProps, {
  showCameraScanner: showCameraScanner.request,
  hideCameraScanner: hideCameraScanner.request,
  setTerminalStateSync: setTerminalStateSync.request
})(CameraScannerButton);
