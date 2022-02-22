import * as React from "react";
import { View, ViewStyle } from "react-native";

import Theme from "../../styles";
import { MembershipStatus } from "../loyaltyMembership/constants";
import StatusTag, { StatusType } from "./StatusTag";
import { membershipStatusIndicatorStyles } from "./styles";

export interface Props {
  style?: ViewStyle;
  membershipStatusKey: string;
  membershipDescription: string;
}


export default class MembershipStatusIndicator extends React.Component<Props> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(membershipStatusIndicatorStyles());
  }

  public render(): JSX.Element {
    let statusType;
    switch ( this.props.membershipStatusKey ) {
      case MembershipStatus.Active:
        statusType = StatusType.Positive;
        break;
      case MembershipStatus.PendingDowngrade:
      case MembershipStatus.PendingTermination:
        statusType = StatusType.Caution;
        break;
      default:
        statusType = StatusType.Negative;
        break;
    }
    return (
      <View style={this.styles}>
        <StatusTag
            type={statusType}
            label={this.props.membershipDescription}
            wrapperStyle={this.styles.rowView} />
      </View>
    );
  }

}

