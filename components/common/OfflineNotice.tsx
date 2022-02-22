import React from 'react';
import { View, Text } from 'react-native';
import Theme from '../../styles';
import { offlineNoticeStyle } from "./styles";
import I18n from "../../../config/I18n";
import { SettingsState } from '../../reducers/settings';
import { connect } from 'react-redux';
import {  DI_TYPES as FEATURES_DI_TYPES,
          II18nLocationProvider } from '@aptos-scp/scp-component-store-selling-features';

interface Props {
  settings: SettingsState;
  isNetConnected: boolean;
  isScrolling?: boolean;
}

interface State {
  enableRealTimeEInvoicing: boolean
};

class OfflineNotice extends React.PureComponent<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    const i18nLocationProvider: II18nLocationProvider =
        props.settings.diContainer?.get(FEATURES_DI_TYPES.II18nLocationProvider);
    const countrySpecificConfigValues = props.settings.configurationManager.getI18nCountryConfigValues(i18nLocationProvider?.i18nLocation);
    this.state = {
      enableRealTimeEInvoicing: countrySpecificConfigValues?.invoicing?.enableRealTimeEInvoicing
    };
    this.styles = Theme.getStyles(offlineNoticeStyle());
  }

  public render():  JSX.Element {
    if (this.state.enableRealTimeEInvoicing && !this.props.isNetConnected &&
        !this.props.isScrolling) {
      return this.offlineSign();
    }
    return null;
  }

  private offlineSign(): JSX.Element {
    return (
      <View style={this.styles.offlineContainer}>
        <Text style={this.styles.offlineText}> {I18n.t("noInternetConnection")} </Text>
      </View>
    );
  }

}

const mapStateToProps = (state: any) => {
  return {
    settings: state.settings,
    isNetConnected: state.netConnectedStatus.isNetConnected
  };
};

export default connect(mapStateToProps, {})(OfflineNotice);
