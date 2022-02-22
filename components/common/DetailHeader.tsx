import * as React from "react";
import {Text, TouchableOpacity, View} from "react-native";
import Collapsible from 'react-native-collapsible';

import Theme from "../../styles";
import {
  detailHeaderStyles
} from "./styles";
import {DetailRow} from "./DetailRow";
import Icon from "./Icon";
import {getTestIdProperties} from "./utilities";
import {colors} from "../../styles/styles";

const ChevronDown: string = "ChevronDown";
const ChevronUp: string = "ChevronUp";

export enum DefaultBehavior {
  collapsed = "collapsed",
  expanded = "expanded"
}

export interface DetailRowAttribute {
  name: string;
  value: string;
  type?: string;
  id: string;
}

interface Props {
  rows : DetailRowAttribute[];
  topRow: DetailRowAttribute;
  testModuleId: string;
  defaultBehavior?: DefaultBehavior;
}

interface State {
  collapsed: boolean;
}

export class DetailHeader extends React.PureComponent<Props, State> {
  private styles: any;

 public static setDetailRow (
      name: string,
      value: string,
      id: string,
      type?: string): DetailRowAttribute {
    return {name, value, type: type ? type : undefined, id}
  }

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(detailHeaderStyles());
    this.state = {
      collapsed: this.defaultContainerBehavior()
    };
    this.togglePanel = this.togglePanel.bind(this);
  }

  public render(): JSX.Element {
    return (
        <View style={this.styles.detailMainHeader}>
          <View style={this.styles.detailHeaderContainer}>
            <View>
              {this.renderHeader(this.props.topRow)}
            </View>
            <Collapsible collapsed={this.state.collapsed} duration={500}>
              {this.renderRows(this.props.rows)}
            </Collapsible>
          </View>
        </View>
    );
  }

  private defaultContainerBehavior(): boolean {
      return this.props.defaultBehavior && this.props.defaultBehavior === DefaultBehavior.collapsed;
  }
  private togglePanel(): void {
    this.setState({collapsed: !this.state.collapsed});
  }

  private renderHeader(row: DetailRowAttribute): JSX.Element {
    const iconToUse = this.state.collapsed ? ChevronDown : ChevronUp;
    return (
        <TouchableOpacity onPress={this.togglePanel}>
          <View>
            <View>
              <Text
                  {...getTestIdProperties(this.props.testModuleId, "DetailHeaderLabel")}
                  style={this.styles.detailHeaderName}>
                { row.name }
              </Text>
            </View>
            <View style={this.styles.containerHeader}>
              <View style={this.styles.containerHeaderValue}>
                <Text
                    {...getTestIdProperties(this.props.testModuleId, "DetailHeaderValue")}
                    style={this.styles.detailHeaderValue}>
                  { row.value }
                </Text>
              </View>
              <View style={this.styles.containerHeaderIcon}>
                <Icon name={iconToUse}
                      underlayColor="transparent"
                      size={24}
                      color={colors.action}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
    );
  }

  private renderRows(rows: DetailRowAttribute[]): JSX.Element[] {
      return rows.map((row : DetailRowAttribute) => (
          <DetailRow
            name={row.name}
            value={row.value}
            type={row.type}
            testModuleId={this.props.testModuleId}
            id={row.id}
          />
      ))
  }
}
