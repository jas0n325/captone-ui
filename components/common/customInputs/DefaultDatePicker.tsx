import * as React from "react";
import DatePicker, { DatePickerProps } from "react-native-date-picker";
import { connect } from "react-redux";

import { TimerUpdateType } from "@aptos-scp/scp-component-store-selling-features";

import { ActionCreator, updateTimers } from "../../../actions";


interface DispatchProps {
  updateTimers: ActionCreator;
}

interface Props extends DispatchProps, DatePickerProps {}

const DefaultDatePicker = (props: Props): JSX.Element => {
  const handleInteraction = (event: Date): void => {
    props.updateTimers(TimerUpdateType.UiInteraction);

    if (props.onDateChange) {
      props.onDateChange(event);
    }
  };

  return (
    <DatePicker
      { ...props }
      onDateChange={handleInteraction}
    />
  );
};

export default connect(undefined, { updateTimers })(DefaultDatePicker);
