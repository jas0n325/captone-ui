import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { UiInputKey } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation } from "../../actions";
import { AppState} from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import DefaultDatePicker from "../common/customInputs/DefaultDatePicker";
import FeedbackNote from "../common/FeedbackNote";
import Header from "../common/Header";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { openCloseTerminalScreenStyles } from "./styles";

interface DispatchProps {
  performBusinessOperation: ActionCreator;
}

interface StateProps {
  deviceIdentity: DeviceIdentity;
  stateValues: Map<string, any>;
  inputs: UiInput[];
  eventType: string;
}

interface Props extends DispatchProps, StateProps, NavigationScreenProps<"openCloseTerminal"> {}

interface State {
  chosenBusinessDate: Date;
}

class OpenCloseTerminalScreen extends React.Component<Props, State> {
  private styles: any;
  private YESTERDAYS_DATE_SENTINEL: Date;
  private WEEK_FROM_NOW_DATE_SENTINEL: Date;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(openCloseTerminalScreenStyles());

    this.YESTERDAYS_DATE_SENTINEL = new Date();
    this.WEEK_FROM_NOW_DATE_SENTINEL = new Date();
    this.YESTERDAYS_DATE_SENTINEL.setDate(this.YESTERDAYS_DATE_SENTINEL.getDate() - 1);
    this.WEEK_FROM_NOW_DATE_SENTINEL.setDate(this.WEEK_FROM_NOW_DATE_SENTINEL.getDate() + 7);

    this.state = {
      chosenBusinessDate: new Date()
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (this.props.stateValues.get("TerminalSession.isOpen") && !prevProps.stateValues.get("TerminalSession.isOpen")) {
      this.props.navigation.pop();
    }
  }

  public render(): JSX.Element {
    const currentLocale = I18n.currentLocale();
    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("businessDay")}
          backButton={{
            name: "Back",
            title: Theme.isTablet ? I18n.t("basket") : undefined,
            action: this.handleCancel
          }}
          rightButton={!Theme.isTablet && { title: I18n.t("continue"), action: this.handleOpenTerminalOffline }}
          isVisibleTablet={Theme.isTablet}
        />
        <View style={this.styles.contentBase} >
          <FeedbackNote
            message={I18n.t("selectABusinessDayToContinue")}
            messageType={FeedbackNoteType.Notification}
            style={this.styles}
          />
          <Text style={this.styles.contentText}>{I18n.t("businessDay")}</Text>
          <View style={this.styles.datePickerArea}>
            <DefaultDatePicker
              date={this.state.chosenBusinessDate}
              fadeToColor={"none"}
              locale={currentLocale}
              mode={"date"}
              minimumDate={this.YESTERDAYS_DATE_SENTINEL}
              maximumDate={this.WEEK_FROM_NOW_DATE_SENTINEL}
              onDateChange={this.handleChosenDateUpdate}
            />
          </View>
          {
            Theme.isTablet &&
            <>
              <TouchableOpacity
                style={[this.styles.tabletButtons, this.styles.btnPrimary]}
                onPress={this.handleOpenTerminalOffline}
              >
                <Text style={this.styles.btnPrimaryText}>{I18n.t("continue")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[this.styles.tabletButtons, this.styles.btnSeconday]}
                onPress={this.handleCancel}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            </>
          }
        </View>
      </BaseView>
    );
  }

  private handleOpenTerminalOffline = (): void => {
    this.props.inputs.push(new UiInput(UiInputKey.OFFLINE_BUSINESS_DAY_DATE, this.state.chosenBusinessDate));
    this.props.performBusinessOperation(this.props.deviceIdentity, this.props.eventType, this.props.inputs);
  }

  private handleCancel = (): void => {
    this.props.navigation.pop();
  }

  private handleChosenDateUpdate = (chosenDate: Date): void => {
    this.setState({ chosenBusinessDate: chosenDate });
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    deviceIdentity: state.settings.deviceIdentity,
    stateValues: state.businessState && state.businessState.stateValues,
    inputs: state.businessState.inputs,
    eventType: state.businessState.eventType
  };
};

export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request
})(OpenCloseTerminalScreen);
