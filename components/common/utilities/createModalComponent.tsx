import * as React from "react";
import { connectModal } from "redux-modal";

import ModalView from "../ModalView";


export const createModalComponent = (name: string) => {
  const modalName = name;
  const WrappedModal = connectModal({ name })(ModalView);

  return class extends React.Component {
    public render(): JSX.Element {
      const props = {
        ...this.props,
        name: modalName
      };

      return (
        <WrappedModal {...props}>
          {this.props.children}
        </WrappedModal>
      );
    }
  };
};

