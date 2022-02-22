import * as React from "react";
import {
  FlatList,
  ScrollView,
  Text,
  View
} from "react-native";
import { Field } from "redux-form";

import { ITenderControlTransaction } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { DataEventType } from "../../actions";
import { TransactionsState, UiState, UI_MODE_PAID_OPERATION } from "../../reducers";
import Theme from "../../styles";
import { renderInputField } from "../common/FieldValidation";
import { InputType } from "../common/Input";
import { scanDrawerStyle } from "./styles";
import Transaction from "./Transaction";

interface Props {
  dataEventType?: DataEventType;
  onTransactionChosen: (transaction: ITenderControlTransaction, dataEventType: DataEventType) => void;
  updateUiMode: (mode: string) => void;
  transactionsState: TransactionsState;
  uiState: UiState;
}

interface State {
  inputValue: string;
}

class LinkToTransaction extends React.Component<Props, State> {
  private styles: any;
  private transactionNumberInputRef: any;

  public constructor(props: Props) {
    super(props);
    this.state = {
      inputValue: undefined
    };
    this.styles = Theme.getStyles(scanDrawerStyle());
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_PAID_OPERATION);
    this.transactionNumberInputRef.focus();
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    const uiModeWasChanged: boolean = prevProps.uiState.mode === UI_MODE_PAID_OPERATION &&
        this.props.uiState.mode !== UI_MODE_PAID_OPERATION;

    if (uiModeWasChanged) {
      this.props.updateUiMode(UI_MODE_PAID_OPERATION);
    }
  }

  public render(): JSX.Element {
    return (
        <View>
          <Field
              name="transactionNumber"
              inputType={InputType.numeric}
              onRef={(ref: any) => this.transactionNumberInputRef = ref}
              component={renderInputField}
              style={this.styles.inputPanel}
              inputStyle={this.styles.inputField}
              cameraIcon={{
                icon: "Camera",
                size: this.styles.cameraIcon.fontSize,
                color: this.styles.cameraIcon.color,
                position: "right",
                style: this.styles.cameraIconPanel
              }}
              value={this.state.inputValue}
              showCamera={true}
              onChangeText={this.updateInput.bind(this)}
              placeholder={I18n.t("scanPaidOutTransactionID")}
              placeholderSentenceCase={false}
              clearText={false}
              autoCapitalize={"none"}
              returnKeyType={"search"}
          />

          {
            this.props.transactionsState && this.props.transactionsState.transactions &&
            this.props.transactionsState.transactions.length === 0 && !this.props.transactionsState.error &&
            <View style={this.styles.emptyList}>
              <Text style={this.styles.emptyListTextWithNewLine}> {I18n.t("noResults")} </Text>
              <Text style={this.styles.emptySubtitleText}>{I18n.t("noMatchingTransactionFound")}</Text>
            </View>
          }
          <ScrollView>
            <View style={this.styles.listArea} >
              {
                this.props.transactionsState && this.props.transactionsState.transactions &&
                this.props.transactionsState.transactions.length > 0 && !this.props.transactionsState.error &&
                <>
                  <View style={this.styles.subtitleArea}>
                    <Text style={this.styles.subtitleText}>
                      {I18n.t("results")}
                    </Text>
                  </View>
                  <FlatList
                      style={this.styles.list}
                      alwaysBounceVertical={true}
                      data={this.props.transactionsState && this.props.transactionsState.transactions}
                      ItemSeparatorComponent={() => <View style={this.styles.divider} />}
                      keyExtractor={(item: ITenderControlTransaction) => item.transactionId}
                      renderItem={({ item }) => {
                        return <Transaction
                            onTransactionChosen={this.props.onTransactionChosen}
                            transaction={item as ITenderControlTransaction}
                            dataEventType={this.props.dataEventType}
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
    );
  }

  private updateInput(inputValue: string): void {
    this.setState({ inputValue });
  }

}

export default LinkToTransaction;
