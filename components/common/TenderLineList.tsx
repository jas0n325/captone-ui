import * as React from "react";
import { FlatList, Text, View } from "react-native";

import { ITenderDisplayLine, TenderAuthCategory, TENDER_AUTHORIZATION_TOKEN_LINE_TYPE } from "@aptos-scp/scp-component-store-selling-features";
import { ITenderLine, LineType } from "@aptos-scp/scp-types-commerce-transaction";
import { TenderType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { tenderLineListStyles } from "./styles";
import TenderLine from "./TenderLine";


interface Props {
  allowTenderVoid: boolean;
  preventScroll?: boolean;
  style?: any;
  tenderDisplayLines?: ITenderDisplayLine[];
  tenderLines?: ITenderLine[];
}

interface State {}

export default class TenderLineList extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(tenderLineListStyles());
  }

  public render(): JSX.Element {
    const tenderLine = this.props.tenderLines && this.props.tenderLines[0];
    return (
      <View style={[this.styles.root, this.props.style || {}]}>
        {
          !this.props.allowTenderVoid &&
          <View style={this.styles.subtitleArea}>
            {tenderLine && <Text style={this.styles.subtitleText}>{I18n.t("tenderCaps")}</Text>}
          </View>
        }
        {
          this.props.preventScroll &&
          this.props.tenderDisplayLines &&
          this.props.tenderDisplayLines.map(this.renderTenderLine)
        }
        {
          !this.props.preventScroll &&
          this.props.tenderDisplayLines &&
          <FlatList
            data={this.props.tenderDisplayLines}
            renderItem={({ item }) => this.renderTenderLine(item)}
            keyExtractor={(item) => item.lineNumber.toString() }
          />
        }
        {
          this.props.preventScroll &&
          this.props.tenderLines &&
          this.props.tenderLines.map(this.renderTenderLine)
        }
        {
          !this.props.preventScroll &&
          this.props.tenderLines &&
          <FlatList
            data={this.props.tenderLines}
            renderItem={({ item }) => this.renderTenderLine(item)}
            keyExtractor={(item) => item.lineNumber.toString() }
          />
        }
      </View>
    );
  }

  private renderTenderLine = (tenderLine: ITenderDisplayLine | ITenderLine) => {
    if (!isCashTenderChangeLine(tenderLine) && tenderLine.lineType !== LineType.TenderAdjustment &&
          tenderLine.lineType !== TENDER_AUTHORIZATION_TOKEN_LINE_TYPE) {
      return <TenderLine line={tenderLine} allowVoidTender={this.props.allowTenderVoid} />;
    }
  }
}

function isCashTenderChangeLine(tenderLine: ITenderDisplayLine | ITenderLine): boolean {
  return (tenderLine.lineType === LineType.TenderChange &&
      ((tenderLine as ITenderDisplayLine).tenderAuthCategory === TenderAuthCategory.None ||
      (tenderLine as ITenderLine).tenderType === TenderType.Cash));
}
