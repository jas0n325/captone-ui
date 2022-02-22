import _ from "lodash";
import * as React from "react";
import { BackHandler, NativeEventSubscription } from "react-native";
import { connect } from "react-redux";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { AuthInstance } from "@aptos-scp/scp-component-rn-auth";
import {
  AuthReduxState,
  loginAction
} from "@aptos-scp/scp-component-rn-auth/redux-saga";
import { PosBusinessError, PosError } from "@aptos-scp/scp-component-store-selling-core";
import {
  IRetailLocation,
  SSF_CLIENT_REGISTRATION_CONFLICT_ERROR_CODE
} from "@aptos-scp/scp-component-store-selling-features";

import { DI_TYPES } from "../../../config";
import { CLIENT_REGISTRATION_TIMEOUT_ERROR_CODE } from "../../../config/ErrorCodes";
import I18n from "../../../config/I18n";
import {
  ActionCreator,
  getRetailLocationsAction,
  initAppSettingsAction,
  setTerminalSettingsAction
} from "../../actions";
import { AppState, RetailLocationsState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { terminalStyle } from "./styles";
import TerminalSettings from "./TerminalSettings";
import { HardwareBackButtonHandler } from "../common/HardwareBackButtonHandler";

export interface StateProps {
  auth: AuthReduxState;
  settings: SettingsState;
  retailLocations: RetailLocationsState;
}
export interface DispatchProps {
  initAppSettings: ActionCreator;
  getRetailLocations: ActionCreator;
  login: ActionCreator;
  setTerminalSettings: ActionCreator;
}

interface Props extends StateProps, DispatchProps, NavigationScreenProps<"terminalSettings"> {}

interface State {
  error?: string;
  retailLocation: IRetailLocation;
  settings: SettingsState;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.settings.TerminalSettingsScreen");

class TerminalSettingsScreen extends React.Component<Props, State> {
  private listener: NativeEventSubscription;
  private styles: any;
  private onBackPress: () => boolean;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(terminalStyle());

    this.state = {
      retailLocation: undefined,
      settings: undefined
    };

    this.onBackPress = () => {
      if (this.isBusy || _.get(this.props, "settings.deviceIdentity.deviceId")) {
        return true;
      }
      this.props.initAppSettings();
      return false;
    };
  }


  public componentDidMount(): void {
    if (this.props.auth.authenticated) {
      this.getRetailLocations();
    } else {
      this.login();
    }
    this.trackError(this.props);
  }

  public componentWillUnmount(): void {
    this.listener?.remove();
    this.listener = undefined;
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  public componentWillReceiveProps(nextProps: Props): void {
    this.trackError(nextProps);
    if (!nextProps.settings.inProgress && this.props.settings.inProgress && nextProps.settings.error) {
      const error: any = nextProps.settings.error;
      if (error.cause && error.cause instanceof PosError &&
          error.cause.errorCode === SSF_CLIENT_REGISTRATION_CONFLICT_ERROR_CODE) {
        if (error.originalCause.domainErrorCode === "clientRegistration.terminalAlreadyBeingRegistered") {
          this.setState({ error: I18n.t("terminalAlreadyBeingRegistered") });
        } else {
          this.props.navigation.push("terminalConflict", {
            retailLocation: this.state.retailLocation,
            deviceId: this.state.settings.deviceIdentity.deviceId,
            onSave: () => this.onConfimRegistration(),
            onCancel: this.pop
          });
        }
      }
    }

    if (!nextProps.auth.authInProgress && this.props.auth.authInProgress) {
      if (nextProps.auth.authenticated) {
        this.getRetailLocations();
      }
    }
  }

  public render(): JSX.Element {
    const auth = this.props.settings.diContainer.get<AuthInstance>(DI_TYPES.AuthClient);

    return (
      <>
        <HardwareBackButtonHandler onBackPress={this.onBackPress}/>
        <BaseView style={this.styles.settings}>
          <TerminalSettings settings={this.props.settings}
                            retailLocations={this.props.retailLocations.retailLocations}
                            isBusy={this.isBusy}
                            auth={auth}
                            onSave={this.onSaveSettings.bind(this)}
                            onLogin={this.login.bind(this)}
                            onCancel={this.onCancel.bind(this)}
                            errorMessage={this.state.error}/>
        </BaseView>
      </>
    );
  }

  private get isBusy(): boolean {
    return this.props.auth.authInProgress || this.props.settings.inProgress;
  }

  private getRetailLocations(): void {
    // FIXME - This timeout is a hack to workaround a race condition between adding the fetch interceptor after the
    // user has logged in and making the retail locations request. The fetch ApiAuthorizationInterceptor needs to be
    // refactored to work dynamically with changing authentication state rather than just take a refresh token.

    const self = this;
    setTimeout(() => self.props.getRetailLocations(), 100);
  }

  private login(): void {
    const { appConfiguration } = this.props.settings;
    if (appConfiguration && ((appConfiguration.clientId && appConfiguration.clientSecret) ||
        (appConfiguration.username && appConfiguration.password))) {
      const { clientId, clientSecret, username, password } = appConfiguration;
      if (clientId && clientSecret) {
        this.props.login({
          credentials: {
            clientSecret
          }
        });
      } else {
        this.props.login({
          credentials: {
            username,
            password
          }
        });
      }
    } else {
      this.props.login({
        redirectUri: this.props.settings.diContainer.get(DI_TYPES.AuthRedirectUrl)
      });
    }
  }

  private onCancel(): void {
    this.props.initAppSettings();
    if (this.props.settings.deviceIdentity.deviceId) {
      this.props.navigation.pop();
    }
  }

  private onConfimRegistration(): void {
    const {deviceIdentity, transactionNumber, configurationProfileName, primaryLanguage,
      retailLocationCurrency} = this.state.settings;
    this.props.setTerminalSettings({
      deviceIdentity,
      transactionNumber,
      configurationProfileName,
      primaryLanguage,
      retailLocationCurrency,
      replaceExistingClientRegistration: true
    });
    this.props.navigation.pop();
  }

  private onSaveSettings(settings: SettingsState): void {
    const {
      deviceIdentity,
      transactionNumber,
      configurationProfileName,
      primaryLanguage,
      retailLocationCurrency
    } = settings;

    if (!deviceIdentity || !deviceIdentity.tenantId || !deviceIdentity.retailLocationId || !deviceIdentity.deviceId ||
        !transactionNumber || !configurationProfileName || !retailLocationCurrency) {
      logger.debug(() =>
          `Cannot save with missing settings: ` +
          `deviceIdentity: ${deviceIdentity ? JSON.stringify(deviceIdentity) : deviceIdentity}, ` +
          `transactionNumber: ${transactionNumber}, ` +
          `configurationProfileName: ${configurationProfileName}, ` +
          `retailLocationCurrency: ${retailLocationCurrency}`);
      this.setState({ error: I18n.t("missingSettings") });
      return;
    }

    const retailLocation =  this.props.retailLocations.retailLocations.find((r) =>
        r.retailLocationId === deviceIdentity.retailLocationId);

    this.props.setTerminalSettings({
      deviceIdentity,
      transactionNumber,
      configurationProfileName,
      primaryLanguage,
      retailLocationCurrency
    });

    this.setState({ retailLocation, settings });
  }

  private trackError(props: Props): void {
    const error: any = props.auth.error || props.settings.error || props.retailLocations.error;

    // Don't show the error if there is an operation in progress or it is related to a terminal conflict
    if ((this.isBusy && !(error?.errorCode === CLIENT_REGISTRATION_TIMEOUT_ERROR_CODE)) ||
        (error && error.cause && error.cause instanceof PosError &&
        error.cause.errorCode === SSF_CLIENT_REGISTRATION_CONFLICT_ERROR_CODE)) {
      this.setState({ error: undefined });
    } else {
      let errorMessage: string = error as string;
      if (error instanceof PosBusinessError) {
        if (error.localizableMessage && !(error?.errorCode === CLIENT_REGISTRATION_TIMEOUT_ERROR_CODE)) {
          errorMessage = I18n.t(error?.localizableMessage.i18nCode);
        } else if (error.errorCode === CLIENT_REGISTRATION_TIMEOUT_ERROR_CODE) {
          errorMessage = I18n.t("errorMessageTimeout");
        }
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }
      this.setState({ error: errorMessage });
    }
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    auth : state.auth,
    retailLocations: state.retailLocations,
    settings: state.settings
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  initAppSettings: initAppSettingsAction,
  getRetailLocations: getRetailLocationsAction.request,
  login: loginAction.request,
  setTerminalSettings: setTerminalSettingsAction
})(TerminalSettingsScreen);
