import * as React from "react";
import { Text, View} from "react-native";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import Icon from "./Icon";
import { statusTagStyles } from "./styles";
import { getTestIdProperties } from "./utilities";

export interface Props {
  type: StatusType;
  label?: string;
  labelCode?: string;
  name?: string;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  onLayout?: (event: any) => void;
  style?: any;
  wrapperStyle?: any;
  iconName?: string;
  testID?: string;
}

export enum StatusType {
  Icon = "Icon",
  Positive = "Positive",
  Negative = "Negative",
  Neutral = "Neutral",
  Info = "Info",
  Caution = "Caution",
  Undefined = "Undefined"
}

export const STATUS_TAG_NAME_LABEL = {
  "GiftReceipt": "gift",
  "Store": "pickUp",
  "DeliveryTruck": "delivery",
  "CommentReceipt": "comment",
  "Returns": "returnTransaction",
  "Reserved": "reserved"
};

export default class StatusTag extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(statusTagStyles());
  }

  public render(): JSX.Element {
    let textProps = {};
    if (this.props.ellipsizeMode) {
      textProps = {
        numberOfLines: 1,
        ellipsizeMode: this.props.ellipsizeMode
      };
    }

    const isIcon = (this.props.type && this.props.type === StatusType.Icon && this.props.name);

    return (
      <View style={this.props.wrapperStyle}>
        <View
          style={[this.styles.statusTag, this.props.style ? this.props.style : {}]}
          onLayout={(event) => this.props.onLayout && this.props.onLayout(event) }
        >
          {
            isIcon &&
            <Icon name={this.props.iconName || this.props.name}
              underlayColor="transparent"
              color={this.styles.statusIcon.color}
              size={this.styles.statusIcon.fontSize}
            />
          }
          {
            !isIcon &&
            <View style={{...this.styles.statusTagCircle, backgroundColor: this.getStatusColor(this.props.type)}}/>
          }
          <Text
            {...textProps}
            {...getTestIdProperties(this.props.testID, "status-tag")}
            style={this.styles.statusTagText}>
              {this.props.labelCode ? I18n.t(this.props.labelCode) : this.props.label}
          </Text>
        </View>
      </View>
    );
  }

  private getStatusColor(statusType: StatusType): any {
    let statusColor;
    switch (statusType) {
      case StatusType.Positive:
        statusColor = this.styles.good;
        break;
      case StatusType.Negative:
        statusColor = this.styles.bad;
        break;
      case StatusType.Neutral:
        statusColor = this.styles.neutral;
        break;
      case StatusType.Info:
        statusColor = this.styles.info;
        break;
      case StatusType.Caution:
        statusColor = this.styles.caution;
        break;
      case StatusType.Undefined:
        statusColor = this.styles.transparent;
        break;
      default:
        statusColor = this.styles.neutral;
    }
    return statusColor;
  }
}

