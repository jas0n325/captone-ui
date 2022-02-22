import * as React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { LogManager, ILogger } from "@aptos-scp/scp-component-logging";
import { SYNC_STATE_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  updateUiMode
} from "../../actions";
import {
  AppState,
  UI_MODE_THANKYOU_SCREEN,
  UI_MODE_WAITING_TO_CLOSE,
  UiState,
  BusinessState,
  SettingsState
} from "../../reducers";
import Theme from "../../styles";
import {AspectPreservedImage} from "../common/AspectPreservedImage";
import { SCOScreenKeys, SCOScreenProps } from "./common/constants";
import { thankYouScreenStyles } from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.selfCheckout.ThankYouScreen");

interface DispatchProps {
  updateUiMode: ActionCreator;
  performBusinessOperation: ActionCreator;
}

interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
  uiState: UiState;
}

interface Props extends DispatchProps, StateProps, SCOScreenProps {}

interface State {
  timeoutExceeded: boolean;
}

class ThankYouScreen extends React.Component<Props, State> {
  private handleCloseTimeoutReference: number;
  private thankYouGif: any;

  public constructor(props: Props) {
    super(props);

    this.state = {
      timeoutExceeded: false
    };

    this.thankYouGif = Platform.select({
      android: { uri: "asset:/hardtag_animation_draft_5_0423.gif" },
      ios: require("../../../../assets/img/hardtag_animation_draft_5_0423.gif")
    });
  }

  public componentDidMount(): void {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, SYNC_STATE_EVENT, []);
    const checkoutModeBehaviors = this.props.settings.configurationManager.getFunctionalBehaviorValues()
        .selfCheckoutModeBehaviors;
    const timeoutSeconds = checkoutModeBehaviors && checkoutModeBehaviors.thankYouScreenDuration;
    if (timeoutSeconds) {
      this.handleCloseTimeoutReference = setTimeout(this.onTimeout.bind(this), timeoutSeconds * 1000);
    } else {
      logger.debug("Configurations for checkoutModeBehavior does not exist or does not include thankYouScreenDuration.");
    }
    this.props.updateUiMode(UI_MODE_THANKYOU_SCREEN);
  }

  public componentDidUpdate(): void {
    if (this.state.timeoutExceeded) {
      this.handleClose();
    }

    // Is here so when transaction is posted and clears ui mode, we can disable scanning in this screen
    if (this.props.uiState.mode === undefined) {
      this.props.updateUiMode(UI_MODE_THANKYOU_SCREEN);
    }
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode !== UI_MODE_WAITING_TO_CLOSE) {
      this.props.updateUiMode(undefined);
    }
  }

  public render(): JSX.Element {

    const styles = Theme.getStyles(thankYouScreenStyles());

    return (
      <TouchableOpacity style={styles.root} onPress={this.handleClose} >
        <View style={styles.textArea}>
          <Text style={styles.title}>{I18n.t("yourPurchaseIsComplete")}</Text>
          <Text style={styles.generalText}>{I18n.t("yourReceiptIsBeingPrinted")}</Text>
        </View>
        <AspectPreservedImage
          rowWidth={styles.securityTagIcon.width}
          rowHeight={styles.securityTagIcon.height}
          desiredSource={this.thankYouGif}
          defaultSourceWidth={styles.securityTagIcon.width}
          defaultSourceHeight={styles.securityTagIcon.height}
          defaultSource={require("../../../../assets/img/no-image.png")}
        />
        <View style={styles.textArea}>
          <Text style={styles.subtitle}>{I18n.t("deactivateSecurityTagsReminder")}</Text>
          <Text style={styles.generalText}>{I18n.t("pleaseFollowTheInstructionsOffscreen")}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  private onTimeout(): void {
    this.setState({timeoutExceeded: true});
    this.handleClose();
  }

  private handleClose = (): void => {
    if (this.transactionHasBeenPosted()) {
      clearTimeout(this.handleCloseTimeoutReference);
      this.props.navigateToNextScreen(SCOScreenKeys.Start);
    }
  }

  private transactionHasBeenPosted(): boolean {
    return !this.props.businessState.stateValues.get("transaction.id") ||
        this.props.businessState.stateValues.get("transaction.closed");
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    settings: state.settings,
    uiState: state.uiState
  };
};

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  updateUiMode: updateUiMode.request,
  performBusinessOperation: businessOperation.request
})(ThankYouScreen);
