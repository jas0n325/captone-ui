import * as React from "react";
import { Text, View } from "react-native";
import { FeedbackNoteType } from "../../reducers/feedbackNote";

import Theme from "../../styles";
import { feedbackNoteStyle } from "./styles";
import { getTestIdProperties } from "./utilities/utils";
import VectorIcon from "./VectorIcon";


export interface Props {
  message: string;
  style?: any;
  messageTitle?: string;
  /**
   * Defaults to Error message - red with caution circle
   */
  messageType?: FeedbackNoteType;
  testID?: string;
}
export interface State {}


export default class FeedbackNote extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(feedbackNoteStyle(this.props.messageType));
  }

  public render(): JSX.Element {
    return (
        <View style={[this.styles.cautionPanel, this.props.style && this.props.style.cautionPanel]}>
          <View style={this.styles.cautionIconPadding}>
            <VectorIcon
              name={getIconName(this.props.messageType)}
              fill={this.styles.cautionIcon.color}
              height={this.styles.cautionIcon.fontSize}
            />
          </View>
          {this.props.messageTitle &&
            <>
              <View style={this.styles.cautionText}>
                <Text {...getTestIdProperties(this.props.testID, "feedbackTitle-text")}>
                  {this.props.messageTitle}
                </Text>
                <Text
                  style={this.styles.cautionSubTitleText}
                  {...getTestIdProperties(this.props.testID, "feedbackMessage-text")}>
                    {this.props.message}
                </Text>
              </View>
            </>
          }
          {!this.props.messageTitle &&
            <View style={this.styles.cautionText}>
              <Text
                {...getTestIdProperties(this.props.testID, "feedbackMessage-text")}>
                  {this.props.message}
              </Text>
            </View>
          }
        </View>
    );
  }
}

function getIconName(messageType: FeedbackNoteType): string {
  const mapIconName: Map<FeedbackNoteType, string> = new Map<FeedbackNoteType, string>([
    [FeedbackNoteType.Error, "CautionCircle"],
    [FeedbackNoteType.Warning, "CautionDiamond"],
    [FeedbackNoteType.Notification, "CautionTriangle"],
    [FeedbackNoteType.Info, "Information"]
  ]);
  return mapIconName.get(messageType) || "CautionCircle";
}
