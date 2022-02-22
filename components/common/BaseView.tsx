import * as React from "react";
import { GestureResponderEvent, Keyboard, View, ViewProps } from "react-native";
import { connect } from "react-redux";

import { TimerUpdateType } from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator } from "../../actions";
import { updateTimers } from "../../actions/timers";


interface DispatchProps {
  updateTimers: ActionCreator;
}

interface Props extends ViewProps, DispatchProps {}

class BaseView extends React.PureComponent<React.PropsWithChildren<Props>> {
  private keyboardIsUp: boolean = false;

  public componentDidMount(): void {
    Keyboard.addListener("keyboardDidShow", this.handleKeyboardWasShown);
    Keyboard.addListener("keyboardDidHide", this.handleKeyboardWasHidden);
  }

  public componentWillUnmount(): void {
    Keyboard.removeListener("keyboardDidShow", this.handleKeyboardWasShown);
    Keyboard.removeListener("keyboardDidHide", this.handleKeyboardWasHidden);
  }

  public render(): JSX.Element {
    const finalProps: Props = Object.assign({}, this.props, {
        onTouchStart: (event: GestureResponderEvent) => {
          this.handleUpdateTimers();

          if (this.keyboardIsUp) {
            Keyboard.dismiss();
          }

          if (this.props.onTouchStart) {
            this.props.onTouchStart(event);
          }
        }
    });

    return (
      <View {...finalProps}>
        { this.props.children }
      </View>
    );
  }

  private handleUpdateTimers = () => {
    this.props.updateTimers(TimerUpdateType.UiInteraction);
  }

  private handleKeyboardWasShown = (): void => {
    this.keyboardIsUp = true;
  }

  private handleKeyboardWasHidden = (): void => {
    this.keyboardIsUp = false;
  }
}

export default connect<undefined, DispatchProps>(undefined, { updateTimers })
    (BaseView);
