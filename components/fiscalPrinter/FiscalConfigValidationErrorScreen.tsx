import * as React from "react";
import { Image, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";

import { CollectedDataKey } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, BusinessState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { fiscalConfigScreenStyles } from "./styles";

interface StateProps {
  businessState: BusinessState;
}
interface Props extends StateProps, NavigationScreenProps<"fiscalConfigValidationError"> {}

interface IFiscalErrorMessage {
  errorMessage: string;
  headerTitle: string;
}

interface State {
  validationList: Array<string>;
}

class FiscalConfigValidationErrorScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(fiscalConfigScreenStyles());
    this.state = {
      validationList: undefined
    };
  }

  public componentDidMount(): void {
    const errorMessage = this.props.businessState;
    if (errorMessage && errorMessage.nonContextualData &&
        errorMessage.nonContextualData.get(CollectedDataKey.FiscalConfigValidation)) {
        if (errorMessage.nonContextualData.get(CollectedDataKey.FiscalConfigValidation).length > 0) {
          this.setState({
              validationList: errorMessage.nonContextualData.get(CollectedDataKey.FiscalConfigValidation)
          });
        }
        this.props.businessState.nonContextualData.delete(CollectedDataKey.FiscalConfigValidation);
    }
  }

  public render(): JSX.Element {
    const { errorMessage, headerTitle } = this.printErrorMessage();
    return (
      <BaseView style={this.styles.fill}>
        <Header
            isVisibleTablet={Theme.isTablet}
            title={headerTitle}
            backButton={{
              name: "Back",
              action: this.handleCancel
            }}
            rightButton={{
              title: I18n.t("okCaps"),
              action: this.handleCancel
            }}
        />
        <KeyboardAwareScrollView style={Theme.isTablet ? this.styles.tabletRoot : this.styles.root}>
          <View style={this.styles.terminalErrorView}>
            <View style={this.styles.errorMessageView}>
              <Image source={require("../../../../assets/img/Danger.png")}
                  style={this.styles.imageView}
              />
              <Text style={this.styles.errorMessageText}>{errorMessage}</Text>
            </View>
            {this.renderErrorDescription()}
          </View>
        </KeyboardAwareScrollView>
      </BaseView>
    );
  }

  private renderErrorDescription(): JSX.Element {
    const errorMessage = this.state.validationList;
    const renderedErrorMessage =  errorMessage && errorMessage.length > 0 &&
        errorMessage.map((errorDesc: string) => {
      return  <Text style={this.styles.errorDescriptionText}>{I18n.t(errorDesc)}</Text>;
    });

    return (
        <View style = {this.styles.errorDescView}>
          {renderedErrorMessage}
        </View>
      );
  }

  private printErrorMessage(): IFiscalErrorMessage {
    const errorMessage: string = I18n.t("fiscalConfigErrorMessage");
    const headerTitle: string = I18n.t("placeholderError");
    return { errorMessage, headerTitle };
  }

  private handleCancel = (): void => {
    this.props.navigation.pop();
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    businessState: state.businessState
  };
};

export default connect(mapStateToProps, null)(FiscalConfigValidationErrorScreen);
