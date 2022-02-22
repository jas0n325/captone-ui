import * as React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Orientation, { OrientationType } from "react-native-orientation-locker";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  IConfigurationManager,
  PosBusinessError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  UiInputKey,
  VOID_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator } from "../../actions/actions";
import { businessOperation } from "../../actions/businessState";
import { updateUiMode } from "../../actions/updateUiState";
import {
  AppState,
  BusinessState,
  UI_MODE_VOID_TRANSACTION,
  UI_MODE_WAITING_TO_CLEAR_TRANSACTION,
  UI_MODE_WAITING_TO_CLOSE
} from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import FeedbackNote from "../common/FeedbackNote";
import Header from "../common/Header";
import { getReasonListType } from "../common/utilities/configurationUtils";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { activityIndicatorColor } from "../styles";
import { VoidableErrorScreenProps } from "./interfaces";
import { VoidableErrorStyle } from "./styles";

interface StateProps{
  businessState: BusinessState;
  businessStateError: Error;
  configurationManager: IConfigurationManager;
  deviceIdentity: DeviceIdentity;
  uiMode: string;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends VoidableErrorScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"voidableErrorScreen"> {}

interface State {
  voidPressed: boolean;
  okPressed: boolean;
}


class VoidableErrorScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(VoidableErrorStyle());
    this.state = {
      voidPressed: false,
      okPressed: false
    };

    this.onOk = this.onOk.bind(this);
    this.onVoid = this.onVoid.bind(this);
  }

  public componentDidMount(): void {
    /*
     * FIXME: Refactor orientation logic in DSS-15470.
     * If this screen was added to the stack while the signature screen is still present on phone form factor then
     * the orientation will be in landscape still.
     */
    if (!Theme.isTablet) {
      Orientation.getOrientation((orientation: OrientationType) => {
        if (orientation !== "PORTRAIT") {
          Orientation.lockToPortrait();
        }
      })
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    this.exitIfResolved(prevProps);

    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress &&
        !this.props.businessState.error && this.props.isWarning && this.state.okPressed) {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  public render(): JSX.Element {
    const error = this.props.businessStateError;
    const headerTitle = this.props.headerTitle ? this.props.headerTitle : I18n.t("placeholderError");

    let errorMessage: string;
    let errorMessageTitle: string;
    if (this.props.errorMessage) {
      errorMessage = I18n.t(this.props.errorMessage.i18nCode);
    } else if (this.props.errorMessageString) {
      errorMessage = this.props.errorMessageString;
    } else if (error instanceof PosBusinessError) {
      errorMessage = I18n.t(error.localizableMessage.i18nCode);
    } else if (error && error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = I18n.t("unexpectedError");
    }

    if (this.props.errorMessageTitle) {
      errorMessageTitle = I18n.t(this.props.errorMessageTitle.i18nCode);
    }

    return (
      <BaseView style={this.styles.fill}>
        <Header
            style={this.styles.header}
            titleStyle={this.styles.titleStyle}
            isVisibleTablet={Theme.isTablet}
            title={headerTitle}
            returnMode={this.props.isReturnMode}
        />
        <View style={[this.styles.root, this.styles.fill]}>
          <View style={this.styles.errorDisplay}>
            <FeedbackNote
              message={errorMessage}
              style={this.styles}
              messageType={this.props.isWarning ? FeedbackNoteType.Warning : FeedbackNoteType.Error}
              messageTitle={errorMessageTitle}
            />
            { this.props.isWarning &&
              <TouchableOpacity
                  style={this.styles.btnPrimary}
                  onPress={this.onOk}
              >
                <Text style={this.styles.btnPrimaryText}>
                  {I18n.t("okCaps")}
                </Text>
              </TouchableOpacity>
            }
            <TouchableOpacity
                style={[
                  this.props.isWarning ? this.styles.btnSecondary : this.styles.btnPrimary,
                  this.state.voidPressed && this.props.businessState.inProgress && this.styles.btnDisabled
                ]}
                onPress={this.onVoid}
                disabled={this.props.businessState.inProgress}
            >
              <Text
                style={[
                  this.props.isWarning ? this.styles.btnSecondayText : this.styles.btnPrimaryText,
                  this.state.voidPressed && this.props.businessState.inProgress && this.styles.btnTextDisabled
                ]}
              >
                {I18n.t("voidCancelTransactionTitle")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        { this.state.voidPressed && this.props.businessState.inProgress &&
          <View style={this.styles.modalBackground}>
            <View style={this.styles.activityIndicatorContainerView}>
              <ActivityIndicator
                size="large"
                style={this.styles.spinnerStyle}
                animating={true}
                color={activityIndicatorColor}
              />
            </View>
          </View>
        }
      </BaseView>
    );
  }

  public onVoid(): void {
    const uiInputs: Array<UiInput> = [];
    const voidTransactionReasonListType =
        getReasonListType(this.props.configurationManager, VOID_TRANSACTION_EVENT);
    uiInputs.push(new UiInput(UiInputKey.REASON_CODE, this.props.voidableReasonInfo.reasonCode));
    uiInputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION, this.props.voidableReasonInfo.reasonDescription));
    uiInputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE, voidTransactionReasonListType));
    this.props.performBusinessOperation(this.props.deviceIdentity, VOID_TRANSACTION_EVENT, uiInputs);
    this.props.updateUiMode(UI_MODE_VOID_TRANSACTION);
    this.setState({ voidPressed: true, okPressed: false });
  }

  public onOk(): void {
    this.setState({ okPressed: true, voidPressed: false });
    if (this.props.onOK) {
      this.props.onOK();
    }
  }

  public exitIfResolved(prevProps: Props): void {
    const uiModeIsWaitingToClose: boolean =
        this.props.uiMode === UI_MODE_WAITING_TO_CLOSE || this.props.uiMode === UI_MODE_WAITING_TO_CLEAR_TRANSACTION;

    if (prevProps.uiMode === UI_MODE_VOID_TRANSACTION && uiModeIsWaitingToClose) {
      this.props.navigation.dispatch(popTo("main"));
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState,
    businessStateError: state.businessState.error,
    configurationManager: state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity,
    uiMode: state.uiState.mode
  };
};

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof VoidableErrorScreen>()(VoidableErrorScreen));
