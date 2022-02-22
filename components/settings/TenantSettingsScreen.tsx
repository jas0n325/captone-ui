import _ from "lodash";
import * as React from "react";
import { BackHandler, NativeEventSubscription } from "react-native";
import { connect } from "react-redux";

import I18n from "../../../config/I18n";
import { ActionCreator, setTenantSettingsAction } from "../../actions";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { HardwareBackButtonHandler } from "../common/HardwareBackButtonHandler";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { tenantSettingsScreenStyles } from "./styles";
import TenantSettings from "./TenantSettings";


export interface StateProps {
  settings: SettingsState;
}
export interface DispatchProps {
  setTenant: ActionCreator;
}

interface Props extends StateProps, DispatchProps, NavigationScreenProps<"tenantSettings"> {}

interface State {
  error?: string;
}

/**
 * This component manages collecting and dispatching the domain used to discover and initialize tenant related settings.
 */
class TenantSettingsScreen extends React.Component<Props, State> {
  private listener: NativeEventSubscription;
  private styles: any;
  private onBackPress: () => boolean;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(tenantSettingsScreenStyles());

    this.state = { };

    this.onBackPress = () => {
      return true;
    };
  }

  public componentDidMount(): void {
    if (this.props.settings.appConfiguration && this.props.settings.appConfiguration.platformDomain) {
      this.onSelectDomain(this.props.settings.appConfiguration.platformDomain);
    }
  }

  public componentWillUnmount(): void {
    this.listener?.remove();
    this.listener = undefined;
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  public render(): JSX.Element {
    return (
      <>
        <HardwareBackButtonHandler onBackPress={this.onBackPress}/>
        <BaseView style={this.styles.container}>
          <TenantSettings domain={this.props.settings.domain}
                          onSave={this.onSelectDomain.bind(this)}
                          error={this.getError()}/>
        </BaseView>
      </>
    );
  }

  private getError(): string {
    return this.state.error || _.get(this.props.settings, "error.message");
  }

  private onSelectDomain(domain: string): void {
    if (!domain) {
      this.setState({ error: I18n.t("missingDomainSettings") });
      return;
    }
    this.props.setTenant(domain);
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    settings: state.settings
  };
}
export default connect(mapStateToProps, {
  setTenant: setTenantSettingsAction
})(TenantSettingsScreen);
