import * as React from "react";
import { View } from "react-native";
import Dialog from "react-native-dialog";
import { Dispatch } from "redux";
import {Field, FormInstance, InjectedFormProps, reduxForm, SubmissionError} from "redux-form";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { renderSelect, RenderSelectOptions } from "../common/FieldValidation";
import { paymentDeviceSelectionStyle } from "./styles";


interface DeviceSelectionForm {
  paymentId: string;
}

export interface Props {
  onApplyPaymentDeviceSelected: (deviceId: string) => void;
  paymentDevicesOptions: RenderSelectOptions[];
  resetPaymentDeviceSelection: () => void;
}

export interface State {
}

class PaymentDeviceSelection extends React.Component<Props & InjectedFormProps<DeviceSelectionForm, Props> &
    FormInstance<DeviceSelectionForm, Props>, State>  {
  private styles: any;

  public constructor(props: Props & InjectedFormProps<DeviceSelectionForm, Props> &
      FormInstance<DeviceSelectionForm, Props>) {
    super(props);

    this.styles = Theme.getStyles(paymentDeviceSelectionStyle());

    if (props.paymentDevicesOptions?.length === 1) {
      // auto accept if there is only a single option
      props.onApplyPaymentDeviceSelected(props.paymentDevicesOptions[0].code);
    }
  }

  public render(): JSX.Element {
    return (
      <Dialog.Container visible={true} contentStyle={this.styles.dialog}>
        <Dialog.Title>{I18n.t("paymentDevice")}</Dialog.Title>
        <View style={this.styles.root}>
          <Field name="paymentId" placeholder={I18n.t("selectPaymentDevice")} style={this.styles.input}
                 component={renderSelect} inputStyle={this.styles.inputField}
                 options={this.props.paymentDevicesOptions} />
        </View>
        <Dialog.Button label={I18n.t("closePaymentDeviceSelection")} onPress={this.props.resetPaymentDeviceSelection} />
        <Dialog.Button label={I18n.t("acceptPaymentDeviceSelection")} onPress={() => this.props.submit()} />
      </Dialog.Container>
    );
  }
}

export default reduxForm<DeviceSelectionForm, Props>({
  form: "paymentDevice",
  validate: (values: DeviceSelectionForm): any => {
    const errors: DeviceSelectionForm = { paymentId: undefined };
    const { paymentId } = values;
    if (!paymentId) {
      errors.paymentId = I18n.t("paymentDeviceChoiceIsMissing");
    }
    return errors;
  },
  initialValues: {
    paymentId: undefined
  },
  onSubmit: (data: DeviceSelectionForm, dispatch: Dispatch<any>, props: Props) => {
    if (!data.paymentId) {
      throw new SubmissionError({paymentId: I18n.t("paymentDeviceChoiceIsMissing")});
    }
    props.onApplyPaymentDeviceSelected(data.paymentId);
  }
})(PaymentDeviceSelection);
