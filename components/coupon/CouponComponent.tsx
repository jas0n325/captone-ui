import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";

import {
  DeviceIdentity,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  IPromotionCouponDisplayLine,
  VOID_COUPON_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, updateUiMode } from "../../actions";
import {
  AppState,
  BusinessState,
  SettingsState,
  UI_MODE_COUPON_SCREEN
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { NavigationProp } from "../StackNavigatorParams";
import Coupon from "./Coupon";
import { CouponComponentProps } from "./interfaces";
import { couponScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
  deviceIdentity: DeviceIdentity;
  settings: SettingsState;
}

interface DispatchProps {
  businessOperation: ActionCreator;
  updateUiMode: ActionCreator;
}

interface State {
  inProgress: boolean;
}

interface Props extends CouponComponentProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}
class CouponComponent extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(couponScreenStyles());
    this.state = {
      inProgress: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_COUPON_SCREEN);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.businessState.inProgress &&
      !this.props.businessState.inProgress
    ) {
      if (this.state.inProgress && !this.props.businessState.error) {
        this.setState({ inProgress: false }, () =>
          setTimeout(
            () =>
              Alert.alert(
                I18n.t("couponRemovedTitle"),
                I18n.t("couponRemovedMessage"),
                [{ text: I18n.t("ok") }],
                { cancelable: true }
              ),
            500
          )
        );
      }
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const { promotionCouponDisplayLines } =
      this.props.businessState.displayInfo;

    const promotionCouponLines: IPromotionCouponDisplayLine[] =
      promotionCouponDisplayLines &&
      promotionCouponDisplayLines.filter(
        (line: IPromotionCouponDisplayLine) => !line.isAutoCoupon
      );

    return (
      <BaseView style={this.styles.fill}>
        <Coupon
          lines={promotionCouponLines}
          settings={this.props.settings}
          onVoid={this.handleOnVoid.bind(this)}
          onCancel={this.props.onExit}
        />
      </BaseView>
    );
  }

  private handleOnVoid(lineNumber: string): void {
    Alert.alert(
      I18n.t("voidCoupon"),
      I18n.t("voidCouponExplanation"),
      [
        { text: I18n.t("cancel"), style: "cancel" },
        {
          text: I18n.t("confirm"),
          onPress: () => {
            this.setState({ inProgress: true }, () => {
              this.props.businessOperation(
                this.props.deviceIdentity,
                VOID_COUPON_LINE_EVENT,
                [new UiInput("lineNumber", lineNumber)]
              );
            });
          }
        }
      ],
      { cancelable: true }
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    settings: state.settings
  };
}

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  businessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(CouponComponent);
