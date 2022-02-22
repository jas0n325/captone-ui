import * as React from "react";
import { View } from "react-native";

import { IServiceCustomerTag } from "@aptos-scp/scp-component-store-selling-features";

import Theme from "../../styles";
import StatusTag, { StatusType } from "./StatusTag";
import { customerTagListStyles } from "./styles";

interface Props {
  style?: any;
  tags: IServiceCustomerTag[];
  preferredLanguage?: string;
  allowMultipleLines?: boolean;
}

interface State {
  panelWidth: number;
  tagWidths: any;
}

export default class CustomerTagList extends React.Component<Props, State> {
  private styles: any;
  private tagMargin: number;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(customerTagListStyles());
    this.tagMargin = this.styles.statusTag.marginHorizontal || 0;

    this.state = {
      panelWidth: 0,
      tagWidths: {}
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.preferredLanguage !== this.props.preferredLanguage) {
      this.setState({ panelWidth: 0, tagWidths: {}});
    }
  }

  public render(): JSX.Element {
    const tagsCopy: IServiceCustomerTag[] = JSON.parse(JSON.stringify(this.props.tags));
    return (
      <View style={[this.styles.root, this.props.style || {}, this.props.allowMultipleLines ? this.styles.multiLine : {}]} onLayout={(event) => {
        const paddingHorizontal = (this.props.style && this.props.style.paddingHorizontal ?
            this.props.style.paddingHorizontal : this.styles.root.paddingHorizontal) || 0;
        this.setState({ panelWidth: event.nativeEvent.layout.width - (paddingHorizontal * 2) });
      }}>
        {this.state.panelWidth > 0 && tagsCopy.sort(this.tagCompare).map((tag, index) =>
          (!this.state.tagWidths[index] || this.state.tagWidths[index].visible) ?
              <StatusTag
                  type={StatusType[tag.connotation]}
                  style={[this.props.allowMultipleLines ?  this.styles.statusTagMultiLine : this.styles.statusTag,
                    this.state.tagWidths[index] ? { maxWidth: this.state.tagWidths[index].width } : {}]}
                  onLayout={(event: any) => this.measureAdjustedTagWidth(event, index)}
                  ellipsizeMode={"tail"}
                  label={this.getTranslationTagLabel(tag)}
              /> : undefined
        )}
      </View>
    );
  }

  private getTranslationTagLabel(tag: IServiceCustomerTag): string {
    return tag && (tag.translations && tag.translations[this.props.preferredLanguage]
        && tag.translations[this.props.preferredLanguage].name || tag.label);
  }

  private tagCompare(a: IServiceCustomerTag, b: IServiceCustomerTag): number {
    if ( a.rank && !b.rank ) {
      //a has a value but b has no value, then a should come before b
      return -1;
    } else if ( !a.rank && b.rank ) {
      //b has a value but a has no value, then b should come before a
      return 1;
    } else if ( !a.rank && !b.rank || (a.rank === b.rank) ) {
      //if both a and b have no rank or equal rank then compare the tagKey
      if (a.tagKey.toUpperCase() < b.tagKey.toUpperCase()) {
        return -1;
      } else if (a.tagKey.toUpperCase() > b.tagKey.toUpperCase()) {
        return 1;
      }
    } else if ( a.rank < b.rank ) {
      return -1;
    } else if ( a.rank > b.rank ) {
      return 1;
    }
    return 0;
  }

  private measureAdjustedTagWidth(event: any, index: number): void {
    const rowWidth: number = event.nativeEvent.layout.width;
    const tag = {};
    tag[index] = {
      width: rowWidth,
      shrinked: false,
      visible: true
    };

    const tagWidths = Object.assign({}, this.state.tagWidths, tag);
    if (!this.props.allowMultipleLines && Object.keys(tagWidths).length === this.props.tags.length) {
      const panelWidth = this.state.panelWidth;
      const keys = Object.keys(tagWidths);
      keys.sort((a: string, b: string) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
      let requiredTagWidth = 0;
      keys.forEach((key) => {
        const position = Number.parseInt(key, 10);
        const previousTag = position > 0 ? tagWidths[`${position - 1}`] : undefined;
        const currentTag = tagWidths[key];

        if ((previousTag && (previousTag.shrinked || !previousTag.visible)) ||
          ((requiredTagWidth + currentTag.width + this.tagMargin * 2) > panelWidth)) {
          currentTag.visible = false;
        }

        requiredTagWidth += currentTag.width + this.tagMargin * 2;
      });
    }

    this.setState({ tagWidths });
  }
}
