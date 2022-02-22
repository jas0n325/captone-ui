import * as React from "react";
import { Alert, AlertButton, Image, Platform, TouchableOpacity, View } from "react-native";
import { appDetailsSettings } from "react-native-android-open-settings";
import { RNCamera } from "react-native-camera";
import * as RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";
import Permissions from "react-native-permissions";
import { connect } from "react-redux";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  setTerminalStateSync
} from "../../actions";
import Theme from "../../styles";
import { ImageData } from "../tillManagement/PaidAddReceipt";
import { cameraStyle } from "./styles";
import { getStoreLocale } from "./utilities";
import VectorIcon from "./VectorIcon";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.Camera");

interface DispatchProps {
  setTerminalStateSync: ActionCreator;
}

interface Props extends DispatchProps {
  handleImages: (uri: any) => void;
}

interface State {
  cameraPermission: string;
  canOpenCameraSettings: boolean;
}

class Camera extends React.Component<Props, State> {
  private camera: any;
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(cameraStyle());
    this.requestPermission =  this.requestPermission.bind(this);
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
            throw logger.throwing(error, "Camera.Permissions.canOpenSettings", LogLevel.WARN);
          });
    } else if (Platform.OS === "android") {
      // react-native-android-open-settings always opens up settings page, as long as the package doesn't change.
      this.setState({ canOpenCameraSettings: true });
    }

    this.checkCameraPermission();
    this.openCamera();
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.container}>
        { this.cameraPermissionAuthorized() && this.goToCameraScreen() }
      </View>
    );
  }

  private checkCameraPermission(): void {
    Permissions.check("camera")
      .then((response) => {
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        this.setState({ cameraPermission: response });
      }).catch((error) => {
        throw logger.throwing(error, "Camera.checkCameraPermission", LogLevel.WARN);
      });
  }

  private requestPermission(): void {
    Permissions.request("camera").then((response) => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({cameraPermission: response});

      if (response === "authorized") {
        this.goToCameraScreen();
      } else {
        /**
         * Using timeout to prevent a terminal state sync after the user presses "Don't allow" as it still fires
         * otherwise.
         */
        setTimeout(() => this.props.setTerminalStateSync(true), 1000);
      }
    }).catch((e) => logger.warn(e));
  }

  // For Camera
  private openCamera(): void {
    // iOS and Android have different meanings for permissions, deal with accordingly
    if (this.cameraPermissionAuthorized()) {
      this.goToCameraScreen();
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
        throw logger.throwing(error, "Camera.openSettings", LogLevel.WARN);
      });
    } else if (Platform.OS === "android") {
      appDetailsSettings();
    }
  }

  private goToCameraScreen = (): JSX.Element => {
    return (<>
            <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={this.styles.preview}
              type={RNCamera.Constants.Type.back}
              captureAudio={false}
              flashMode={RNCamera.Constants.FlashMode.on}
            />
            <View style={this.styles.captureArea}>
              <TouchableOpacity onPress={this.takePicture.bind(this)} style={this.styles.capture}>
              <VectorIcon
                name={"Camera"}
                fill={this.styles.cameraIconStyle.color}
                height={this.styles.cameraIconStyle.height}
                width={this.styles.cameraIconStyle.width}
                stroke={this.styles.cameraIconStyle.backgroundColor}
                strokeWidth={this.styles.cameraIconStyle.fontSize}
              />
              </TouchableOpacity>
            </View>
          </>);
  }

  private takePicture = async () => {
    if (this.camera) {
      const options = { quality: 1, base64: true };
      const data: ImageData = await this.camera.takePictureAsync(options);
      this.imageResize(data);
    }
  }

  private imageResize = (data: ImageData) => {
    const expectedSizeInKB: number = 50;
    const factor: number = data && Math.ceil(data.base64.length / (1024 * expectedSizeInKB));
    const updatedResult: string = data && `data:image/jpeg;base64,${data.base64}`;

      // Get the image width and height to scale it proportionally
      Image.getSize(updatedResult, (width: number, height: number) => {
        ImageResizer.createResizedImage(updatedResult, width / 2, height / 2,
            "JPEG", Math.floor(100 / factor)).then(({uri, size}) => {
          return RNFS.readFile(uri, "base64");
        }).then((encoded) => {
          data.base64 = `data:image/jpeg;base64,${encoded}`;
          this.props.handleImages(data);
        }).catch((err) => {
          logger.catching(err, `Error while converting ${updatedResult} to JPEG`);
          data.base64 = `data:image/jpeg;base64,${data.base64}`;
          this.props.handleImages(data);
        });
      }, (err: any) => {
        logger.catching(err, `Error while getting the size for ${data.base64}`);
        data.base64 = `data:image/jpeg;base64,${data.base64}`;
        this.props.handleImages(data);
      });
  }

}

export default connect(null, {
  setTerminalStateSync: setTerminalStateSync.request
})(Camera);
