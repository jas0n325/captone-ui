import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { AuthInstance } from "@aptos-scp/scp-component-rn-auth";
import { Authenticated, Unauthenticated } from "@aptos-scp/scp-component-rn-auth/react";
import { DeviceIdentity } from "@aptos-scp/scp-component-store-selling-core";
import { IRetailLocation } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  getLastTransactionNumberAction
} from "../../actions";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import {
  renderNumericInputField,
  renderSelect,
  RenderSelectOptions,
  renderTextInputField
} from "../common/FieldValidation";
import Footer from "../common/Footer";
import Spinner from "../common/Spinner";
import AptosLogoNavigationBar from "./AptosLogoNavigationBar";
import { terminalStyle } from "./styles";

export interface TerminalSettingForm {
  retailLocationId: string;
  deviceId: string;
  transactionNumber: string;
}

export interface OwnProps {
  isBusy: boolean;
  auth: AuthInstance;
  settings: SettingsState;
  retailLocations: Array<IRetailLocation>;
  onSave: (settings: SettingsState) => void;
  onCancel: () => void;
  onLogin: () => void;
  errorMessage?: string;
}

export interface StateProps {
  terminalSettingForm?: { values: TerminalSettingForm };
}

export interface DispatchProps {
  getLastTransactionNumberAction: ActionCreator;
}

export interface Props extends OwnProps, StateProps {
}

export interface State {
  retailLocations: RenderSelectOptions[];
  searchTransactionNumber: boolean;
}

class TerminalSettings extends React.Component<Props & DispatchProps & InjectedFormProps<TerminalSettingForm,
    OwnProps> & FormInstance<TerminalSettingForm, OwnProps>, State> {
  private transactionNumber: any;
  private styles: any;

  public constructor(props: Props & DispatchProps & InjectedFormProps<TerminalSettingForm, OwnProps> &
      FormInstance<TerminalSettingForm, OwnProps>) {
    super(props);

    this.styles = Theme.getStyles(terminalStyle());

    this.state = {
      retailLocations: [],
      searchTransactionNumber: false
    };
  }

  // tslint:disable-next-line:cyclomatic-complexity
  public componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.retailLocations.length > 0 && this.props.retailLocations.length === 0) {
      const retailLocations: RenderSelectOptions[] = [];
      nextProps.retailLocations.forEach((location) => {
        retailLocations.push({code: location.retailLocationId,
          description: `${location.name} (${location.retailLocationId})`});
      });

      this.setState({ retailLocations });

      const { appConfiguration, transactionNumber, deviceIdentity } = nextProps.settings;
      if (!appConfiguration) {
        this.props.initialize(
          {
            retailLocationId : deviceIdentity ? deviceIdentity.retailLocationId : undefined,
            deviceId : deviceIdentity ? deviceIdentity.deviceId : undefined,
            transactionNumber : (transactionNumber >= 0) ? Number(transactionNumber).toString(10) : undefined
          });
      } else {
        this.props.initialize({
          retailLocationId: appConfiguration.retailLocationId,
          deviceId: appConfiguration.deviceId,
          transactionNumber : (transactionNumber >= 0) ? Number(transactionNumber).toString(10) : undefined
        });

        if (appConfiguration.retailLocationId && appConfiguration.deviceId && !transactionNumber) {
          this.props.getLastTransactionNumberAction(appConfiguration.retailLocationId, appConfiguration.deviceId);
        }
      }
    }

    if (nextProps.terminalSettingForm && nextProps.terminalSettingForm.values.retailLocationId &&
        nextProps.terminalSettingForm.values.deviceId && (nextProps.terminalSettingForm.values.retailLocationId !==
            this.props.terminalSettingForm.values.retailLocationId ||
            nextProps.terminalSettingForm.values.deviceId !== this.props.terminalSettingForm.values.deviceId)) {
      this.setState({searchTransactionNumber: true});
    }

    if ((nextProps.settings.transactionNumber >= 0) &&
        nextProps.settings.transactionNumber !== this.props.settings.transactionNumber) {
      this.props.autofill("transactionNumber", (nextProps.settings.transactionNumber + 1).toString(10));
      this.setState({searchTransactionNumber: false});

      const { appConfiguration } = nextProps.settings;
      if (appConfiguration && appConfiguration.retailLocationId && appConfiguration.deviceId) {
        // Submit the form if it is all set
        const self = this;
        setTimeout(() => self.props.submit(), 100);
      }
    }
  }

  public render(): JSX.Element {
    const auth = this.props.auth;
    const tenantName = this.props.settings && this.props.settings.tenantConfig &&
        this.props.settings.tenantConfig.tenantName;

    return (
      <View style={this.styles.fill}>
        <AptosLogoNavigationBar styles={this.styles}/>
        <Authenticated auth={auth}>
          <View style={this.styles.root}>
            <KeyboardAwareScrollView contentContainerStyle={this.styles.fill}>
              <View style={this.styles.terminal}>
                <Text style={this.styles.pageTitle}>{I18n.t("settings")}</Text>
                {this.props.errorMessage &&
                <View style={this.styles.error}>
                  <View style={this.styles.errorContainer}>
                    <Text style={this.styles.errorText}>{this.props.errorMessage}</Text>
                  </View>
                </View>
                }

                <Text style={this.styles.title}>{tenantName}</Text>

                <Field name="retailLocationId" placeholder={I18n.t("selectStore")} persistPlaceholder={true}
                       style={this.styles.textInput} errorStyle={this.styles.textInputError} component={renderSelect}
                       options={this.state.retailLocations}/>

                <Field name="deviceId" placeholder={I18n.t("settingsDevice")} persistPlaceholder={true}
                       style={this.styles.textInput} errorStyle={this.styles.textInputError}
                       component={renderTextInputField} keyboardType="numbers-and-punctuation"
                       onSubmitEditing={() => this.transactionNumber.focus() } />

                <Field name="transactionNumber" onRef={(ref: any) => this.transactionNumber = ref }
                       placeholder={I18n.t("settingsTransactionNumber")} persistPlaceholder={true}
                       style={this.styles.textInput} errorStyle={this.styles.textInputError} precision={0}
                       component={renderNumericInputField} onFocus={this.getLastTransactionNumber.bind(this)}
                       onSubmitEditing={() => this.props.submit()} />
              </View>
            </KeyboardAwareScrollView>
            <Footer style={this.styles.footer}>
              <TouchableOpacity onPress={this.props.onCancel.bind(this)}
                                style={this.styles.button}
                                disabled={this.props.isBusy}>
                <Text style={this.styles.buttonText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.submit()}
                                style={this.styles.button}
                                disabled={this.props.isBusy}>
                <Text style={this.styles.buttonText}>{I18n.t("done")}</Text>
              </TouchableOpacity>
            </Footer>
            {
              !!this.props.isBusy &&
              <Spinner overlay={true}/>
            }
          </View>
        </Authenticated>
        <Unauthenticated auth={auth}>
          <View style={this.styles.settings}>
            {
              !this.props.isBusy &&
              <TouchableOpacity onPress={this.props.onLogin} style={this.styles.button} >
                <Text style={this.styles.buttonText}>
                  {I18n.t("setupLogIn")}
                </Text>
              </TouchableOpacity>
            }
          </View>
        </Unauthenticated>
      </View>
    );
  }

  private getLastTransactionNumber(): void {
    if (this.state.searchTransactionNumber) {
      const {retailLocationId, deviceId} = this.props.terminalSettingForm.values;
      this.props.getLastTransactionNumberAction(retailLocationId, deviceId);
    }
  }
}

const form = reduxForm<TerminalSettingForm, OwnProps>({
  form: "terminalSetting",
  validate : (values: TerminalSettingForm) => {
    const errors: TerminalSettingForm = {
        retailLocationId: undefined, deviceId: undefined, transactionNumber: undefined };

    if (!values.retailLocationId) {
      errors.retailLocationId = I18n.t("storeMissing");
    }
    if (!values.deviceId) {
      errors.deviceId = I18n.t("deviceNumberMissing");
    }
    if (!values.transactionNumber) {
      errors.transactionNumber = I18n.t("transactionNumberMissing");
    } else if (Number.parseInt(values.transactionNumber, 10) < 1) {
      errors.transactionNumber = I18n.t("transactionNumberInvalid");
    }

    return errors;
  },
  initialValues: {
    retailLocationId: undefined,
    deviceId: undefined,
    transactionNumber: undefined
  },
  onSubmit: (data: TerminalSettingForm, dispatch: Dispatch<any>, props: Props) => {
    const givenSettings: SettingsState = props.settings;
    const settings: SettingsState = Object.assign({}, givenSettings);

    settings.deviceIdentity = new DeviceIdentity(givenSettings.tenantConfig.tenantId,
        data.retailLocationId, data.deviceId, "store-selling");
    const retailLocation = props.retailLocations.find((r) => r.retailLocationId === data.retailLocationId);
    settings.configurationProfileName = retailLocation.configurationProfileName;
    settings.transactionNumber = Number.parseInt(data.transactionNumber, 10);
    settings.primaryLanguage = (retailLocation.primaryLanguage) ?
      retailLocation.primaryLanguage.trim() : "";
    settings.retailLocationCurrency = retailLocation.currencyCode;

    props.onSave(settings);
    Keyboard.dismiss();
  }
});

function mapStateToProps(state: any): StateProps {
  return {
    terminalSettingForm: state.form["terminalSetting"]
  };
}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, {
  // FIXME: This is a presentation component and should not be connected to the redux store
  getLastTransactionNumberAction: getLastTransactionNumberAction.request
})((form)(TerminalSettings));
