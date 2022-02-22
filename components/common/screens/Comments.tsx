import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  COMMENT_ITEM_EVENT,
  IFeatureAccessConfig,
  ITranslatableMessage,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { ActionCreator, businessOperation } from "../../../actions";
import { AppState, SettingsState } from "../../../reducers";
import Theme from "../../../styles";
import { NavigationProp } from "../../StackNavigatorParams";
import { commentsScreen } from "./styles";
import BaseView from "../BaseView";
import Header from "../Header";
import { getFeatureAccessConfig } from "../utilities/configurationUtils";
import { CommentsProps } from "./interfaces";
import VectorIcon from "../VectorIcon";

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface StateProps {
  settings: SettingsState;
}

interface Props extends CommentsProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

class Comments extends React.Component<Props> {
  private styles: any;
  private customCommentsEnabled: boolean;
  private customCommentLabelText?: string;
  private itemCommentIsFreeText: boolean;
  private itemCommentData: string[] = [];

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(commentsScreen());

    const configurationManager = this.props.settings.configurationManager;
    const itemCommentConfiguration: IFeatureAccessConfig =
        getFeatureAccessConfig(configurationManager, COMMENT_ITEM_EVENT);
    if (itemCommentConfiguration?.enabled && itemCommentConfiguration.commentsList?.length) {
      const notNullCommentsList: ITranslatableMessage[] = itemCommentConfiguration.commentsList.filter((element) => {
        if (element !== null && element !== undefined) {
           return element[I18n.currentLocale()] || element["en"];
        }
      });
      this.itemCommentData = notNullCommentsList.map((element) => {
           return element[I18n.currentLocale()] || element["en"];
      }) || [];
      if (this.props.line.comment) {
        this.itemCommentIsFreeText = !this.itemCommentData.some((ele) => ele === this.props.line.comment);
      }
    }
    this.customCommentsEnabled = itemCommentConfiguration?.customComments?.enabled;
    this.customCommentLabelText = itemCommentConfiguration?.customComments?.labelText?.[I18n.currentLocale()];
  }

  public render(): JSX.Element {

    return (
      <BaseView style={this.styles.fill}>
        <Header
            title={I18n.t("comments")}
            backButton={{name: "Back", action: () => this.props.onExit(undefined)}}
        />
        <View>
        <FlatList
            data={this.itemCommentData}
            renderItem={({item}) => {
              return (
                <View>
                  <TouchableOpacity
                      style={this.styles.optionButton}
                      onPress={this.onCommentModeSelection.bind(this, item)}
                  >
                    <Text style={this.styles.optionText}>{item}</Text>
                    {
                      this.props.line.comment && this.props.line.comment === item &&
                      <VectorIcon
                        name="Checkmark"
                        fill={this.styles.checkIcon.color}
                        height={this.styles.checkIcon.fontSize}
                      />
                    }
                  </TouchableOpacity>
                  </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
        />
          { this.customCommentsEnabled &&
            <TouchableOpacity
              style={this.styles.freeTextCommentButton}
              onPress={() =>
                this.props.onItemFreeTextComment(this.props.line, this.itemCommentIsFreeText)}
            >
              <View>
                <Text style={this.styles.optionText}>
                  { this.customCommentLabelText || I18n.t("enterFreeTextComment")}
                </Text>
                {
                 this.props.line && this.props.line.comment && this.itemCommentIsFreeText ?
                      <Text style={this.styles.freeTextCommentText}>
                        {this.props.line.comment}
                      </Text> : undefined
                }
              </View>
              <View style={this.styles.arrowArea}>
                <VectorIcon name="Forward" height={this.styles.icon.fontSize} fill={this.styles.icon.color} />
              </View>
            </TouchableOpacity>
          }
        {
          Theme.isTablet &&
          <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.button]}
            onPress={() => this.props.onExit(undefined)}
          >
            <Text style={this.styles.btnSecondayText}>
              {I18n.t("cancel")}
            </Text>
          </TouchableOpacity>
        }
        </View>
      </BaseView>
    );
  }

  private onCommentModeSelection = (comment: string): void => {
    this.onOptionChosen(comment);
  }

  private onOptionChosen(comment: string): void {
    this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        COMMENT_ITEM_EVENT,
        [
          new UiInput(UiInputKey.LINE_NUMBER, this.props.line.lineNumber),
          new UiInput(UiInputKey.ITEM_COMMENT, this.props.line.comment === comment ? undefined : comment)
        ]
    );
    this.props.onExit(undefined);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings
  };
};

export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(Comments);
