import * as React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

import { LocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { POST_VOID_TRANSACTION_EVENT } from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { SettingsState, TransactionsState } from "../../../reducers";
import Theme from "../../../styles";
import Header from "../../common/Header";
import { InputType } from "../../common/Input";
import Transaction from "../../common/Transaction";
import { isItemSearchBehaviorsIsNumeric } from "../../common/utilities/configurationUtils";
import { getConfiguredMessage } from "../../common/utilities/localizationUtilities";
import { StackNavigatorParams } from "../../StackNavigatorParams";
import { salesHistoryStyles } from "./styles";
import CameraScannerInput from "../../common/CameraScannerInput";
import OfflineNotice from "../../common/OfflineNotice";

interface Props {
  getLastTransactionAction: () => void;
  getTodaysTransactionsAction: () => void;
  settings: SettingsState;
  transactionChosen: (chosenTransaction: IMerchandiseTransaction) => void;
  transactions: IMerchandiseTransaction[];
  transactionsState: TransactionsState;
  isPostVoidMode?: boolean;
  onBack: (popToScreen?: keyof StackNavigatorParams) => void;
}

interface State {
  inputValue: string;
}

export default class SalesHistory extends React.PureComponent<Props, State> {
  private styles: any;
  private testID: string;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(salesHistoryStyles());
    this.testID = "SalesHistory";

    this.state = {
      inputValue: ""
    };
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.fill}>
        <Header
          isVisibleTablet={true}
          testID={this.testID}
          backButton={{
            name: "Back",
            title: I18n.t(!this.props.isPostVoidMode ? "basket" : "storeOperations"),
            action: () => {
              const popToScreen = !this.props.isPostVoidMode ? "main" : "storeOperations";
              this.props.onBack(popToScreen);
            }
          }}
          title={I18n.t(this.props.isPostVoidMode ? "postVoid" : "salesHistory")}
          rightButton={
            !this.props.isPostVoidMode &&
            <View style={this.styles.headerButtonsArea}>
              <TouchableOpacity onPress={() => this.props.getLastTransactionAction()} >
                <Text style={this.styles.transactionButtonText}>{I18n.t("lastSale")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={this.styles.transactionButton}
                onPress={() => this.props.getTodaysTransactionsAction()}
              >
                <Text style={this.styles.transactionButtonText}>{I18n.t("todaysSales")}</Text>
              </TouchableOpacity>
            </View>
          }/>
        { this.props.isPostVoidMode &&
          <OfflineNotice />
        }
        <View style={this.styles.root}>
          <View style={this.styles.inputWrapper}>
            <CameraScannerInput
              inputType={isItemSearchBehaviorsIsNumeric(this.props.settings.configurationManager) ?
                  InputType.numeric : InputType.text}
              value={this.state.inputValue}
              onChangeText={this.updateInput.bind((this))}
              placeholder={I18n.t("scanTransactionId")}
              placeholderSentenceCase={false}
              autoCapitalize={"none"}
            />
          </View>
          {this.props.transactions && this.props.transactions.length === 0 && !this.props.transactionsState.error &&
            <Text style={this.styles.emptyList}> {I18n.t("transactionNotFound")} </Text>
          }
          {this.props.transactions && this.props.transactions.length > 0 && !this.props.transactionsState.error &&
            <FlatList
              alwaysBounceVertical={true}
              data={this.props.transactions}
              keyExtractor={(item: IMerchandiseTransaction, index: number) => item.transactionId}
              renderItem={({ item }) =>
                <Transaction onTransactionChosen={this.props.transactionChosen} transaction={item} displayTaxFreeDocId={true} />
              }
            />
          }
          {this.props.transactionsState.error &&
            <View style = {this.styles.errorContainer}>
              <View style = {this.styles.errorMessageView}>
                <Image source = {require("../../../../../assets/img/Danger.png")}
                     style = {this.styles.imageView}
                />
                <Text style = {this.styles.errorMessageText}>
                  {this.props.isPostVoidMode ?
                      getConfiguredMessage(new LocalizableMessage(this.props.transactionsState.error.message),
                          POST_VOID_TRANSACTION_EVENT,
                          this.props.settings && this.props.settings.configurationManager) :
                      I18n.t("retrievalError")}
                </Text>
              </View>
            </View>
          }
        </View>
      </View>
    );
  }

  private updateInput(inputValue: string): void {
    this.setState({ inputValue });
  }
}
