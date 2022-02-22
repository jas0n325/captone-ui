import * as React from "react";
import { Text, View } from "react-native";

import Theme from "../../styles";
import {getDisplayableDate, getTestIdProperties} from "./utilities";
import {detailHeaderStyles} from "./styles";

interface Props {
  name: string;
  value: string;
  type?: string;
  testModuleId: string;
  id: string;
}

interface State {}

export class DetailRow extends React.PureComponent<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(detailHeaderStyles());
  }

  public render(): JSX.Element {
    return (
        <View style={this.styles.detailHeaderElementContainer}>
          <View style={this.styles.detailHeaderNameElement}>
            <Text
                {...getTestIdProperties(this.props.testModuleId, this.props.id + "Label")}
                style={this.styles.detailHeaderRowNameText}>
              { this.props.name }
            </Text>
          </View>
          <View style={this.styles.detailHeaderValueElement}>
            <Text
                {...getTestIdProperties(this.props.testModuleId, this.props.id)}
                style={this.styles.detailHeaderRowValueText}>
              { this.formatDataType(this.props.value, this.props.type) }
            </Text>
          </View>
        </View>
    );
  }

  private formatDataType(value: string, type: string): string {
    if (!type){
      return value;
    }
    if (type.toLowerCase() === "datetime") {
      return getDisplayableDate(value)
    } else {
      return value;
    }
  }
}
