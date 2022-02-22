import * as React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { QualificationError } from "@aptos-scp/scp-component-store-selling-core";
import {
  SSF_CUSTOMER_NOT_FOUND_I18N_CODE,
  TRANSACTION_FEE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { ICustomer } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { ActionCreator, updateUiMode } from "../../actions";
import {
  AppState,
  BusinessState,
  UiState,
  UI_MODE_ASSIGN_MEMBER_TO_TRANSACTION,
  UI_MODE_WAITING_TO_CLOSE
} from "../../reducers";
import Theme from "../../styles";
import { SCOScreenKeys, SCOScreenProps } from "./common/constants";
import SCOPopup from "./common/SCOPopup";
import { memberScreenStyles } from "./styles";
import { NavigationProp } from "../StackNavigatorParams";

interface DispatchProps {
  updateUiMode: ActionCreator;
}

interface StateProps {
  businessState: BusinessState;
  uiState: UiState;
}

interface Props extends SCOScreenProps, DispatchProps, StateProps {
  navigation: NavigationProp;
}

interface State {
  showMemberErrorPopUp: boolean;
}

class MemberScreen extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(memberScreenStyles());

    this.state = {
      showMemberErrorPopUp: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_ASSIGN_MEMBER_TO_TRANSACTION);
  }

  public componentDidUpdate(prevProps: Props): void {

    if (this.props.businessState.error instanceof QualificationError &&
        this.props.businessState.error.localizableMessage &&
        this.props.businessState.error.localizableMessage.i18nCode === SSF_CUSTOMER_NOT_FOUND_I18N_CODE &&
        !this.props.businessState.inProgress && prevProps.businessState.inProgress) {
      this.setState({showMemberErrorPopUp: true});
    } else if (this.IsValidMemberScanned(prevProps)) {
      this.props.navigateToNextScreen(SCOScreenKeys.Payment);
    }
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode !== UI_MODE_WAITING_TO_CLOSE) {
      this.props.updateUiMode(undefined);
    }
  }

  public render(): JSX.Element {
    const stateValues: Map<string, any> = this.props.businessState.stateValues;
    const customer: ICustomer = stateValues && stateValues.get("transaction.customer");
    return (
      <>
        <View style={this.styles.root}>
          <View style={this.styles.leftSide}>
            <Image
              // FIXME: Make the name of this image configurable instead of hardcoded
              source={{ uri: Platform.OS === "ios" ? "hm_sco_member_screen.png" : "asset:/hm_sco_member_screen.png" }}
              style={this.styles.image}
              resizeMethod={"resize"}
            />
          </View>
          <View style={this.styles.rightSide}>
            <View style={this.styles.textArea}>
              <Text style={this.styles.subtitle}>{I18n.t("areYouAMember")}</Text>
              <Text style={this.styles.title}>{I18n.t("scanYourApp")}</Text>
              <Text>
                <Text style={this.styles.bulletPoint}>{"· "}</Text>
                <Text style={this.styles.infoText}>{I18n.t("collectPoints")}</Text>
              </Text>
              <Text>
                <Text style={this.styles.bulletPoint}>{"· "}</Text>
                <Text style={this.styles.infoText}>{I18n.t("useOffers")}</Text>
              </Text>
            </View>
            <View style= {this.styles.buttonArea}>
              <TouchableOpacity
                style={this.styles.backButton}
                onPress={this.handleBackScreenNavigation}
              >
                <Text style={this.styles.backText}>{I18n.t("back")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={this.styles.continueButton}
                onPress={() => this.props.navigateToNextScreen(SCOScreenKeys.Payment)}
              >
                <Text style={this.styles.continueText}>{I18n.t(customer ? "continue" : "continueAsGuest")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {
          this.state.showMemberErrorPopUp && this.memberErrorPopUp()
        }
      </>
    );
  }

  private memberErrorPopUp(): JSX.Element {
    return (
      <SCOPopup allowToggleApplicationMode={true} navigation={this.props.navigation}>
        <View style={this.styles.helpPopUpArea}>
          <Text style={this.styles.popUpTitle}>{I18n.t("memberAccountNotFoundTitle")}</Text>
          <View style={this.styles.popUpSubtitleParent}>
            <Text style={this.styles.popUpSubtitle}>
              {I18n.t("memberAccountNotFoundText")}
              {" "}{I18n.t("tryAgainOrSelect")}
              <Text style={this.styles.popUpSubtitleBold}> {I18n.t("help")} </Text>
              {I18n.t("forAssistance")}
            </Text>
          </View>
          <TouchableOpacity style={this.styles.closePopUpButton} onPress={() => this.closePopUp()} >
            <Text style={this.styles.closePopUpButtonText}>{I18n.t("ok")}</Text>
          </TouchableOpacity>
        </View>
      </SCOPopup>);
  }

  private closePopUp(): void {
    this.setState({showMemberErrorPopUp: false});
  }

  private IsValidMemberScanned(prevProps: Props): boolean {
    const stateValues: Map<string, any> = this.props.businessState.stateValues;
    const previousStateValues: Map<string, any> = prevProps.businessState.stateValues;
    const customer: ICustomer = stateValues && stateValues.get("transaction.customer");
    const prevCustomer: ICustomer = previousStateValues && previousStateValues.get("transaction.customer");

    return customer && customer.customerNumber && prevCustomer !== customer;
  }

  private handleBackScreenNavigation = (): void => {
    if (this.props.uiState.isAllowed(TRANSACTION_FEE_EVENT)) {
      this.props.navigateToNextScreen(SCOScreenKeys.BagFee);
    } else {
      this.props.navigateToNextScreen(SCOScreenKeys.ShoppingBag);
    }
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    uiState: state.uiState
  };
}
export default connect(mapStateToProps, {updateUiMode: updateUiMode.request})(MemberScreen);
