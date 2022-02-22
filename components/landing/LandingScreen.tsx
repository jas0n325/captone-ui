import * as React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import I18n from "../../../config/I18n";
import {AppState, BusinessState, SettingsState} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import VectorIcon from "../common/VectorIcon";
import {getLandingDefinition, ILandingPageBehaviors, ILandingPageButton, ScreenAction} from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { LandingScreenProps } from "./interfaces";
import { landingStyle } from "./styles";

interface StateProps {
  appResources: Map<string, string>;
  businessState: BusinessState;
  settings: SettingsState;
}

interface Props extends LandingScreenProps, StateProps, NavigationScreenProps<"landing"> {}

class LandingScreen extends React.Component<Props> {
  private styles: any;
  private landingPage: ILandingPageBehaviors;
  private landingPageButtonRows: ILandingPageButton[];

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(landingStyle());

    this.landingPage = getLandingDefinition(this.props.settings.configurationManager);
    this.landingPageButtonRows = this.landingPage.landingPageButtonRows &&
        this.landingPage.landingPageButtonRows.filter(button => {
      if (button.screenAction === ScreenAction.customer) {
        return props.isCustomerSearchAvailable();
      } else if (button.screenAction === ScreenAction.orderInquiry) {
        return props.isOrderInquiryEnabled();
      } else if (button.screenAction === ScreenAction.balanceInquiry) {
        return props.isGiftCardEnabled();
      } else if (button.screenAction === ScreenAction.storeOperations) {
        return props.isStoreOperationsEnabled();
      } else {
        return true;
      }
    });
  }

  public render(): JSX.Element {
    const { stateValues } = this.props.businessState;
    const isTablet = Theme.isTablet;
    return (
      <BaseView style={this.styles.root}>
        <Header backButton={{ name: "Menu", action: this.props.onMenuToggle }}
                image={this.props.appLogo}
                style={this.styles.header}
                renderInSingleLine={true} isVisibleTablet={isTablet} />
        {isTablet ? this.renderTablet(stateValues) : this.renderPhone(stateValues)}
      </BaseView>
    );
  }

  private renderMessage(stateValues?: Map<string, any>): JSX.Element {
    return (
      <Text style={this.styles.message}>
        {
          I18n.t(this.landingPage.message.i18nCode, {
            defaultValue: this.landingPage.message.default, "operator": stateValues &&
                stateValues.get("UserSession.user.displayName")})
        }
      </Text>
    )
  }

  private renderMainButtons(): JSX.Element {
    const { startBasket, resume } = this.landingPage.landingPageMainButtons;

    return (
      <View style={this.styles.mainPanel}>
        <TouchableOpacity style={this.styles.mainButton}
                          onPress={this.props.onScreenAction.bind(this, ScreenAction.main)}>
          <VectorIcon name="Basket" height={60} fill={this.styles.icon.color}/>
          <Text style={this.styles.mainButtonText} numberOfLines={2} ellipsizeMode={"tail"}>
            {I18n.t(startBasket.displayText.i18nCode, { defaultValue: startBasket.displayText.default })}
          </Text>
        </TouchableOpacity>
        {resume && resume.enabled && <View style={this.styles.separator} />}
        {resume && resume.enabled &&
          <TouchableOpacity style={this.styles.mainButton}
                            onPress={this.props.onScreenAction.bind(this, ScreenAction.resumeSuspendedTransactions)}>
            <VectorIcon name="Resume" height={60} fill={this.styles.icon.color}/>
            <Text style={this.styles.mainButtonText} numberOfLines={2} ellipsizeMode={"tail"}>
              {I18n.t(resume.displayText.i18nCode, { defaultValue: resume.displayText.default })}
            </Text>
          </TouchableOpacity>
        }
      </View>
    );
  }

  private renderButton(rowButton: ILandingPageButton): JSX.Element {
    return (
      <TouchableOpacity style={this.styles.rowButton}
                        onPress={this.props.onScreenAction.bind(this, this.getScreenAction(rowButton.screenAction))}>
        <Image source={{ uri: this.props.appResources.get(rowButton.imageName) }}
               style={this.styles.imageArea} resizeMode="cover"/>
        <View style={this.styles.rowButtonTextPanel}>
          <Text style={this.styles.rowButtonText} numberOfLines={2} ellipsizeMode={"tail"}>
            {I18n.t(rowButton.displayText.i18nCode, { defaultValue: rowButton.displayText.default })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  private renderPhone(stateValues?: Map<string, any>): JSX.Element {
    let buttonRows = [];
    if (this.landingPageButtonRows && this.landingPageButtonRows.length > 0) {
      buttonRows = this.landingPageButtonRows.reduce(
          (result, value, index, sourceArray) => index % 2 === 0 ?
              [...result, sourceArray.slice(index, index + 2)] : result, []);
    }
    return (
      <ScrollView style={this.styles.landing} showsVerticalScrollIndicator={false}>
        {this.renderMessage(stateValues)}
        <View style={this.styles.buttonPanel}>
          {this.renderMainButtons()}
          {buttonRows.length > 0 &&
          <View style={this.styles.rowPanel}>
            {buttonRows.map(rowButton =>
              <View style={this.styles.rowButtonPanel}>
                {this.renderButton(rowButton[0])}
                {rowButton[1] && this.renderButton(rowButton[1])}
              </View>
            )}
          </View>
          }
        </View>
      </ScrollView>
    )
  }

  private renderTablet(stateValues?: Map<string, any>): JSX.Element {
    return (
      <View style={this.styles.landing}>
        {this.renderMessage(stateValues)}
        <View style={this.styles.buttonPanel}>
          {this.landingPageButtonRows && this.landingPageButtonRows.length > 0 &&
          <View style={this.styles.rowPanel}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              {this.landingPageButtonRows.map(rowButton => this.renderButton(rowButton))}
            </ScrollView>
          </View>
          }
          {this.renderMainButtons()}
        </View>
      </View>
    )
  }

  private getScreenAction(screenAction: string): ScreenAction {
    switch (screenAction) {
      case "customer":
        return ScreenAction.customer;
      case "productInquiry":
        return ScreenAction.productInquiry;
      case "orderInquiry":
        return ScreenAction.orderInquiry;
      case "salesHistory":
        return ScreenAction.salesHistory;
      case "balanceInquiry":
        return ScreenAction.balanceInquiry;
      case "storeOperations":
        return ScreenAction.storeOperations;
      default:
        return undefined;
    }
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    appResources: state.appResources.resources,
    businessState: state.businessState,
    settings: state.settings
  };
}

export default connect(mapStateToProps)(withMappedNavigationParams<typeof LandingScreen>()(LandingScreen));

