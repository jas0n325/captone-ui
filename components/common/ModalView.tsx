import * as React from "react";
import { Modal } from "react-native";
import { connect } from "react-redux";
import { InjectedProps } from "redux-modal";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import { AppState, ModalState } from "../../reducers";


interface StateProps {
  modalState: ModalState;
}

interface Props extends StateProps, InjectedProps {
  name: string;
}

interface State {
  visible: boolean;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.ModalView");

class ModalView extends React.Component<Props, State> {

  public static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> {
    const { name, modalState } = nextProps;
    if (modalState[name] && modalState[name].show && !prevState.visible) {
      return { visible: true };
    } else if ((!modalState[name] || !modalState[name].show) && prevState.visible) {
      return { visible: false };
    }

    return undefined;
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      visible: false
    };
  }

  public render(): JSX.Element {
    return (
      <Modal
        animationType={"none"}
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => logger.debug("Waiting...")}
        supportedOrientations={["portrait", "landscape"]}
      >
        {this.props.children}
      </Modal>
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    modalState: state.modalState
  };
}

export default connect<StateProps, undefined, undefined>(mapStateToProps, undefined)(ModalView);
