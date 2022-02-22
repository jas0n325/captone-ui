import _ from "lodash";
import * as React from "react";
import {Text, View} from "react-native";
import {connect} from "react-redux";

import {Linking} from "@aptos-scp/scp-component-rn-url-linking";

import I18n from "../../../config/I18n";
import {AppState, SettingsState} from "../../reducers";
import Theme from "../../styles";
import ActionButton from "../common/ActionButton";
import { ButtonType, getTestIdProperties } from "../common/utilities";
import {customerOrderDisplayStyles} from "./styles";

interface StateProps {
  settings: SettingsState;
}

export interface Props extends StateProps {
  trackingLinkLabel?: string;
  trackingId?: string;
  trackingUrl?: string;
}

interface State {
}

class CustomerOrderTrackingLink extends React.PureComponent<Props, State> {
  private styles: any;
  private testID: string;

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(customerOrderDisplayStyles());
    this.testID = "CustomerOrderTrackingLink";
  }

  public render(): JSX.Element {
    let isTrackingUrlPresent: boolean = false;
    if (!_.isEmpty(this.props.trackingUrl)) {
      isTrackingUrlPresent = true;
    }

    return (
        <View style={this.styles.trackingInfoContainer}>
          {isTrackingUrlPresent &&
            <ActionButton
                testID={this.testID}
                type={ButtonType.Secondary}
                title={this.props.trackingLinkLabel}
                allowTextWrap={false}
                subTitle={this.cleanUpVariable(this.props.trackingId)}
                onPress={this.onPress}
            />
          }
          {!isTrackingUrlPresent && this.cleanUpVariable(this.props.trackingId) &&
          <View>
            <Text
              {...getTestIdProperties(this.testID, "trackingNumber-label")}
              style={this.styles.btnSubTitleLabelText}>
                {I18n.t("trackingNumber")}
            </Text>
            <Text
              {...getTestIdProperties(this.testID, "trackingNumber-text")}
              style={this.styles.btnSubTitleText}>
                {this.cleanUpVariable(this.props.trackingId)}
            </Text>
          </View>
          }
        </View>
    );
  }

  private onPress = async () => {
    if (!_.isEmpty(this.props.trackingUrl)) {
      await this.openUrl(this.props.trackingUrl);
    }
  }

  private cleanUpVariable (variable?: string): string {
    if (variable) {
      if (variable.length === 0) {
        return undefined;
      }
      return variable;
    } else {
      return undefined;
    }
  }

  private openUrl(url: string): Promise<void> {
    const { colors } = Theme.styles;
    return Linking.openUrl(url, {
      textColor: colors.loginAndHeaderText,
      backgroundColor: colors.loginAndHeaderBackground
    });
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings
  };
};

export default connect(mapStateToProps)(CustomerOrderTrackingLink);
