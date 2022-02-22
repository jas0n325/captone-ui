import * as React from "react";
import { FlatList, ScrollView, Text, View } from "react-native";

import { IMerchandiseTransaction as SuspendedTransactions } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { SuspendedTransactionsState } from "../../../reducers";
import Theme from "../../../styles";
import Header from "../../common/Header";
import { InputType } from "../../common/Input";
import Transaction from "../Transaction";
import { resumeTransactionsStyle } from "./styles";
import CameraScannerInput from "../../common/CameraScannerInput";


interface Props {
  onCancel: () => void;
  transactions: SuspendedTransactions[];
  transactionsState: SuspendedTransactionsState;
  transactionChosen: (transaction: SuspendedTransactions) => void;
  loadAllItems: () => void;
  onBack: () => void;
}

interface State {
  inputValue: string;
}

export default class SuspendedTransactionsCard extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(resumeTransactionsStyle());
    this.state = {
      inputValue: ""
    };
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("resumeSuspendedTransactions")}
          backButton={{ name: "Back", action: this.props.onBack }}
        />
        <View style={this.styles.fill}>
          <View style={this.styles.header}>
            <CameraScannerInput
              inputType={InputType.text}
              value={this.state.inputValue}
              onChangeText={this.updateInput.bind(this)}
              placeholder={I18n.t("scanTransactionId")}
              placeholderSentenceCase={false}
              clearText={false}
              autoCapitalize={"none"}
            />
            {
              this.props.transactions && this.props.transactions.length === 0
              && !this.props.transactionsState.error &&
              <View style={this.styles.emptyList}>
                <Text style={this.styles.emptyListTextWithNewLine}> {I18n.t("noResults")} </Text>
                <Text style={this.styles.subtitleText}>{I18n.t("noMatchingTransactionFound")}</Text>
              </View>
            }
          </View>
          <ScrollView>
            <View style={this.styles.listArea} >
              {
                this.props.transactions && this.props.transactions.length > 0 &&
                !this.props.transactionsState.error &&
                <>
                  <View style={this.styles.subtitleArea}>
                    <Text style={this.styles.subtitleText}>
                      {I18n.t("suspendedTransactions")}
                    </Text>
                  </View>
                  <FlatList
                      style={this.styles.list}
                      alwaysBounceVertical={true}
                      data={this.props.transactions}
                      ItemSeparatorComponent={() => <View style={this.styles.divider} />}
                      keyExtractor={(item: SuspendedTransactions) => item.transactionId}
                      renderItem={({ item }) => {
                          return <Transaction
                              onTransactionChosen={this.props.transactionChosen}
                              transaction={item}
                              loadAllItems={this.props.loadAllItems}
                          />;
                        }
                      }
                  />
                </>
              }
              {
                this.props.transactionsState.error &&
                <Text style={[this.styles.emptyList, this.styles.errorText]}>{I18n.t("retrievalError")}</Text>
              }
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  private updateInput(inputValue: string): void {
    this.setState({ inputValue });
  }
}

