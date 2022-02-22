import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import I18n from "../../../config/I18n";
import  {
  ActionCreator,
  showFiscalErrorScreen,
  updateUiMode
} from "../../actions";
import { AppState, UI_MODE_STORE_OPERATION } from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import FeedbackNote from "../common/FeedbackNote";
import Header from "../common/Header";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { FiscalPrinterReceiptErrorScreenProps } from "./interface";
import { fiscalPrinterScreenStyles } from "./styles";

interface DispatchProps {
  updateUiMode: ActionCreator;
  showFiscalErrorScreen: ActionCreator;
}

interface  StateProps {
  hideFiscalPrinterErrorScreen: boolean;
}

interface Props extends FiscalPrinterReceiptErrorScreenProps, DispatchProps, StateProps,
    NavigationScreenProps<"fiscalPrinterReceiptError"> {}

class FiscalReceiptErrorScreen extends React.Component<Props> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(fiscalPrinterScreenStyles());
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_STORE_OPERATION);
  }

  public render(): JSX.Element {
      return (
        <BaseView style={this.styles.fill}>
          <Header
              isVisibleTablet={Theme.isTablet}
              title={I18n.t("receipt")}
          />
            <KeyboardAwareScrollView contentContainerStyle={this.styles.root}>
            {
              this.renderTenderInDetails()
            }
          </KeyboardAwareScrollView>
        </BaseView>
    );
  }

  private renderTenderInDetails(): JSX.Element {
    return (
        <View style={this.styles.feedBackNote}>
            <FeedbackNote message={I18n.t("didReceiptPrint")}
            style={this.styles}
            messageType = {FeedbackNoteType.Notification}
            />
             <View style = { Theme.isTablet ? this.styles.actions :
                    [this.styles.fiscalFooterContainer, this.styles.printReportButtonMargin]}>
                  {this.renderYesButton()}
                  {this.renderNoButton()}
              </View>
        </View>
    );
  }

  private renderYesButton(): JSX.Element {
    return (
      <TouchableOpacity
         style={[this.styles.btnSeconday,
              Theme.isTablet && this.styles.button,
              this.styles.printReportButtonMargin]}
          onPress={() => this.handleYesButton()}>
        <Text style={this.styles.btnSecondayText}>{I18n.t("yes")}</Text>
      </TouchableOpacity>
    );
  }

  private renderNoButton(): JSX.Element {
    return (
      <TouchableOpacity
         style={[this.styles.btnSeconday,
              Theme.isTablet && this.styles.button,
              this.styles.printReportButtonMargin]}
          onPress={() => this.handleNoButton()}>
        <Text style={this.styles.btnSecondayText}>{I18n.t("no")}</Text>
      </TouchableOpacity>
    );
  }

  private handleYesButton(): void {
    this.props.navigation.push("fiscalPrinterEnterDocument");
  }

  private handleNoButton(): void {
    if(this.props.hideFiscalPrinterErrorScreen) {
      this.props.showFiscalErrorScreen(false);
    }
    this.props.navigation.push("fiscalPrinterError", {
      onContinue: this.props.onContinue,
      onCancel: this.props.onCancel
    });
  }
}

const mapDispatchToProps: DispatchProps = {
  updateUiMode: updateUiMode.request,
  showFiscalErrorScreen: showFiscalErrorScreen.request
};

const mapStateToProps = (state: AppState): StateProps => {
  return {
    hideFiscalPrinterErrorScreen: state.receipt.hideFiscalPrinterErrorScreen
  };
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof FiscalReceiptErrorScreen>()(FiscalReceiptErrorScreen));
