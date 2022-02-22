import * as _ from "lodash";
import * as React from "react";
import { FlatList, View } from "react-native";

import { IRetailLocation } from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction, ITenderControlTransaction} from "@aptos-scp/scp-types-commerce-transaction";

import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";
import CustomerHistoryTransaction from "./CustomerHistoryTransaction";


interface Props {
  transactions: Array<IMerchandiseTransaction | TransactionWithAdditionalData | ITenderControlTransaction>;
  retailLocations: IRetailLocation[];
  onTransactionSelected?: (item: IMerchandiseTransaction | TransactionWithAdditionalData | ITenderControlTransaction) => void;
  styles: any;
}

export default class CustomerHistoryTransactionList extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = props.styles;
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.transactionArea}>
        <FlatList
          data={this.props.transactions}
          renderItem={({ item }: { item: TransactionWithAdditionalData }) => {
            return (<CustomerHistoryTransaction retailLocations={this.props.retailLocations} transaction={item.transaction as IMerchandiseTransaction}
                onTransactionSelected={(transaction: IMerchandiseTransaction) => {
                  this.props.onTransactionSelected(transaction);
                }} />);
          }}
          keyExtractor={(item: IMerchandiseTransaction) => item.transactionId}
        />
      </View>
    );
  }
}
