import * as React from "react";
import { AlertButton, Platform, Text, TouchableHighlight, TouchableWithoutFeedback, View } from "react-native";
import { connect } from "react-redux";
import { connectModal, InjectedProps } from "redux-modal";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertModalProps,
  blockModal,
  destroyModal,
  hideModal,
  unblockModal
} from "../../actions";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "./BaseView";
import { alertModalStyles } from "./styles";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.AlertModal");

export const ALERT_MODAL: string = "ALERT_MODAL";

export interface AlertModalButton extends AlertButton {
  text: string;
}

interface StateProps {
  alertModalProps: AlertModalProps;
}

interface DispatchProps {
  blockModal: ActionCreator;
  clearAlertModalProps: ActionCreator;
  destroyModal: ActionCreator;
  hideModal: ActionCreator;
  unblockModal: ActionCreator;
}

interface Props extends InjectedProps, StateProps, DispatchProps {}

interface State {}

class AlertModal extends React.Component<Props, State> {
  private someButtonWasPressed: boolean = false;
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(alertModalStyles());
  }

  public componentDidMount(): void {
    this.props.blockModal();

    if (this.props.alertModalProps.buttons && this.props.alertModalProps.buttons.length > 3) {
      logger.debug(() => "AlertModal was provided more than 3 buttons.");
    }
  }

  public componentWillUnmount(): void {
    if (!this.someButtonWasPressed) {
      this.handleCleanup();

      const shouldFireDefaultAction: boolean = !!this.props.alertModalProps.buttons &&
          this.props.alertModalProps.alertModalOptions &&
          this.props.alertModalProps.alertModalOptions.defaultButtonIndex !== undefined;

      if (shouldFireDefaultAction) {
        const buttonToUse: AlertModalButton = this.props.alertModalProps.buttons[
          this.props.alertModalProps.alertModalOptions.defaultButtonIndex
        ];

        if (buttonToUse && buttonToUse.onPress) {
          buttonToUse.onPress();
        }
      }
    }

    this.someButtonWasPressed = false; // Reset after this logic is fired
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <View style={this.styles.alertArea}>
          <View style={this.styles.nonButtonArea}>
            <Text
              style={this.styles.alertTitle}
              ellipsizeMode={Platform.OS === "ios" ? undefined : "tail"}
            >
              {this.props.alertModalProps.title}
            </Text>
            {
              this.props.alertModalProps.message &&
              <Text style={this.styles.alertDescription}>{this.props.alertModalProps.message}</Text>
            }
          </View>
          { Platform.OS === "ios" && this.renderIosButtonArea() }
          { Platform.OS !== "ios" && this.renderAndroidButtons() }
        </View>
      </BaseView>
    );
  }

  private renderIosButtonArea(): JSX.Element {
    return (
      <View style={[
        this.styles.iosButtonsArea,
        this.renderButtonsSideBySide && this.styles.iosTwoButtonArea
      ]}>
        {
          this.renderButtonsSideBySide &&
          <>
            {
              this.props.alertModalProps.buttons.map((button: AlertModalButton) => {
                if (button.style === "cancel") {
                  return this.renderIosButton(button);
                }
              })
            }
            {
              this.props.alertModalProps.buttons.map((button: AlertModalButton) => {
                if (button.style !== "cancel") {
                  return this.renderIosButton(button);
                }
              })
            }
          </>
        }
        {
          this.props.alertModalProps.buttons &&
          !this.renderButtonsSideBySide &&
          <>
            {
              this.props.alertModalProps.buttons.map((button: AlertModalButton) => {
                if (button.style !== "cancel") {
                  return this.renderIosButton(button);
                }
              })
            }
            {
              this.props.alertModalProps.buttons.map((button: AlertModalButton) => {
                if (button.style === "cancel") {
                  return this.renderIosButton(button);
                }
              })
            }
          </>
        }
        { !this.props.alertModalProps.buttons && this.renderIosButton({ text: I18n.t("ok") }) }
      </View>
    );
  }

  private renderIosButton(button?: AlertModalButton): JSX.Element {
    if (!button) {
      return;
    }

    return (
      <TouchableHighlight
        underlayColor={this.styles.iosButtonActive.color}
        activeOpacity={1}
        style={[
          this.styles.iosButton,
          this.renderButtonsSideBySide && this.styles.iosTwoButtonDivider
        ]}
        onPress={this.getButtonOnPress(button)}
      >
        <Text
          style={[
            this.styles.iosButtonDefaultText,
            button.style === "cancel" && this.styles.iosCancelButtonText,
            button.style === "destructive" && this.styles.iosDestructiveButtonText
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
          ellipsizeMode={"tail"}
        >
          {button.text}
        </Text>
      </TouchableHighlight>
    );
  }

  private renderAndroidButtons(): JSX.Element {
    const buttonArrayCopy: AlertModalButton[] = this.props.alertModalProps.buttons &&
        [...this.props.alertModalProps.buttons];

    const firstButton: AlertModalButton = this.props.alertModalProps.buttons && buttonArrayCopy.shift();
    const secondButton: AlertModalButton = this.atLeastTwoButtonsProvided && buttonArrayCopy[0];
    const thirdButton: AlertModalButton = this.threeButtonsProvided && buttonArrayCopy.pop();

    return (
      <View style={[
        this.styles.androidButtonArea,
        (this.threeButtonsProvided || (this.atLeastTwoButtonsProvided && !this.renderButtonsSideBySide)) && this.styles.threeButtons
      ]}>
        { firstButton && this.renderAndroidButton(firstButton, true) }
        { !firstButton && this.renderAndroidButton({ text: I18n.t("ok") }) }
        { secondButton && this.renderAndroidButton(secondButton) }
        { thirdButton && this.renderAndroidButton(thirdButton) }
      </View>
    );
  }

  private renderAndroidButton(button: AlertModalButton, firstButton?: boolean): JSX.Element {
    return (
      <TouchableWithoutFeedback onPress={this.getButtonOnPress(button)} >
        <Text style={[this.styles.androidButtonText, firstButton && this.styles.firstAndroidButton]} >
          {button.text}
        </Text>
      </TouchableWithoutFeedback>
    );
  }

  private getButtonOnPress(button: AlertModalButton): () => void {
    return (): void => {
      this.someButtonWasPressed = true;

      this.handleCleanup();
      this.props.hideModal(ALERT_MODAL);
      this.props.destroyModal(ALERT_MODAL);

      if (button.onPress) {
        button.onPress();
      }
    };
  }

  private get renderButtonsSideBySide(): boolean {
    return this.props.alertModalProps.buttons && this.props.alertModalProps.buttons.length === 2 &&
        !(this.props.alertModalProps.alertModalOptions && this.props.alertModalProps.alertModalOptions.renderButtonsInRows);
  }

  private get atLeastTwoButtonsProvided(): boolean {
    return this.props.alertModalProps.buttons && this.props.alertModalProps.buttons.length >= 2;
  }

  private get threeButtonsProvided(): boolean {
    return this.props.alertModalProps.buttons && this.props.alertModalProps.buttons.length === 3;
  }

  private handleCleanup(): void {
    this.props.unblockModal();
    this.props.clearAlertModalProps();
  }
}

const connectedAlertModal = connectModal({ name: ALERT_MODAL })(AlertModal);

const mapStateToProps = (state: AppState): StateProps => {
  return {
    alertModalProps: state.alertModalState.alertModalProps
  };
};

const mapDispatchToProps: DispatchProps = {
  blockModal,
  clearAlertModalProps: alert.success,
  destroyModal,
  hideModal,
  unblockModal
};

export default connect(mapStateToProps, mapDispatchToProps)(connectedAlertModal);
