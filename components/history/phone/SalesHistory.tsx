import * as React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { LocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { POST_VOID_TRANSACTION_EVENT } from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import { ActionCreator, dataEvent, DataEventType } from "../../../actions";
import { SettingsState, TransactionsState } from "../../../reducers";
import Theme from "../../../styles";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Input, { InputType } from "../../common/Input";
import Transaction from "../../common/Transaction";
import { isItemSearchBehaviorsIsNumeric } from "../../common/utilities/configurationUtils";
import { getConfiguredMessage } from "../../common/utilities/localizationUtilities";
import { salesHistoryStyles } from "./styles";
import { cameraScannerInputStyles } from "../../common/styles";
import OfflineNotice from "../../common/OfflineNotice";
import { updateScroll } from "../../common/utilities";

interface DispatchProps {
  dataEvent: ActionCreator;
}

interface Props extends DispatchProps {
  getLastTransactionAction: () => void;
  getTodaysTransactionsAction: () => void;
  settings: SettingsState;
  transactionChosen: (chosenTransaction: IMerchandiseTransaction) => void;
  transactions: IMerchandiseTransaction[];
  transactionsState: TransactionsState;
  isPostVoidMode?: boolean;
  onBack: () => void;
}

interface State {
  inputValue: string;
  isScrolling: boolean;
}

class SalesHistory extends React.PureComponent<Props, State> {
  private styles: any;
  private inputStyles: any;
  private testID: string;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(salesHistoryStyles());
    this.inputStyles = Theme.getStyles(cameraScannerInputStyles());
    this.testID = "SalesHistory";

    this.state = {
      inputValue: "",
      isScrolling: false
    };
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t(this.props.isPostVoidMode ? "postVoid" : "salesHistory")}
          testID={this.testID}
          backButton={{name: "Back", action: () => this.props.onBack()}}
          rightButton={{title: I18n.t("search"), action: () => this.props.dataEvent(DataEventType.KeyedData, {
            inputText: this.state.inputValue })
          }}
        />
        { this.props.isPostVoidMode &&
          <OfflineNotice isScrolling={this.state.isScrolling} />
        }
        <View style={this.styles.fill}>
          <View style={this.styles.root}>
            <Input
              inputType={isItemSearchBehaviorsIsNumeric(this.props.settings.configurationManager) ?
                InputType.numeric : InputType.text}
              style={this.styles.inputPanel}
              inputStyle={this.styles.input}
              cameraIcon={{
                icon: "Camera",
                size: this.inputStyles.cameraIcon.fontSize,
                color: this.inputStyles.cameraIcon.color,
                position: "right",
                style: this.inputStyles.cameraIconPanel
              }}
              value={this.state.inputValue}
              showCamera={true}
              onChangeText={this.updateInput.bind((this))}
              placeholder={I18n.t("scanTransactionId")}
              placeholderSentenceCase={false}
              autoCapitalize={"none"}
            />
          </View>
          <View style={this.styles.listArea} >
            {
              this.props.transactions &&
              !this.props.transactionsState.error &&
              <FlatList
                  style={this.styles.list}
                  alwaysBounceVertical={true}
                  data={this.props.transactions}
                  ItemSeparatorComponent={() => <View style={this.styles.divider} />}
                  keyExtractor={(item: IMerchandiseTransaction, index: number) => item.transactionId}
                  contentContainerStyle={this.styles.contentContainer}
                  onScrollEndDrag={this.handleScroll.bind(this)}
                  ListHeaderComponent={
                    <View style={this.styles.listHeader}>
                      <Text style={this.styles.listHeaderText}>{I18n.t("results").toUpperCase()}</Text>
                    </View>
                  }
                  ListEmptyComponent={
                    <View style={this.styles.emptyList}>
                      <Text style={this.styles.emptyListText}> {I18n.t("transactionNotFound")} </Text>
                    </View>
                  }
                  renderItem={({ item }) =>
                      <Transaction
                          onTransactionChosen={this.props.transactionChosen}
                          transaction={item}
                          displayTaxFreeDocId={true}
                      />
                  }
              />
            }
            {
              this.props.transactionsState.error &&
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
          {
            !this.props.isPostVoidMode &&
            <Footer style={this.styles.footer}>
              <TouchableOpacity onPress={() => this.props.getLastTransactionAction()} >
                <Text style={this.styles.btnSecondayText}>{I18n.t("lastSale")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.getTodaysTransactionsAction()} >
                <Text style={this.styles.btnSecondayText}>{I18n.t("todaysSales")}</Text>
              </TouchableOpacity>
            </Footer>
          }
        </View>
      </View>
    );
  }

  private updateInput(inputValue: string): void {
    this.setState({ inputValue });
  }

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }
}

export default connect(undefined, {
  dataEvent: dataEvent.request
})(SalesHistory);
