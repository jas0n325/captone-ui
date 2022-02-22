import _ from "lodash";
import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { DecoratedFormProps, FormInstance, formValueSelector, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_SUBSCRIPTION_EVENT,
  getDeliveryFrequencyText,
  IDeliveryFrequency,
  IItemDisplayLine,
  ISubscriptionInfo,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { DeliveryFrequency } from "@aptos-scp/scp-types-store-items";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, getSubscriptionFrequencies, updateUiMode } from "../../actions";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { RenderSelectOptions } from "../common/FieldValidation";
import Header from "../common/Header";
import { getFeatureAccessConfig, handleFormSubmission, warnBeforeLosingChanges } from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import { getFrequencyFieldName, getQuantityFieldName, hasFrequencyCodesFromLine } from "./constants";
import { ItemSubscriptionProps } from "./interfaces";
import { itemSubscriptionScreenStyle } from "./styles";
import SubscribableItemLine from "./SubscribableItemLine";

interface ItemSubscriptionForm {
  subscriptions: Array<ISubscriptionInfo>;
  [key: string]: any;
}

interface StateProps {
  configFrequencies: Array<IDeliveryFrequency>;
  dataFrequencies: Array<DeliveryFrequency>;
  deviceIdentity: DeviceIdentity;
  subscriptions: Array<ISubscriptionInfo>;
  initialValues: ItemSubscriptionForm;
  retailLocationLocale: string;
  subscriptionFrequenciesInProgress: boolean;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  getSubscriptionFrequencies: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends ItemSubscriptionProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

interface State {
  selectedFrequencies: {
    [key: string]: RenderSelectOptions
  };
}

type ItemSubscriptionWithFormProps = Props & InjectedFormProps<ItemSubscriptionForm, Props> &
    FormInstance<ItemSubscriptionForm, undefined>;

const logger: ILogger =
    LogManager.getLogger("com.aptos.storeselling.ui.components.subscriptions.ItemSubscriptionScreen");

class ItemSubscription extends React.Component<ItemSubscriptionWithFormProps, State> {
  private styles: any;

  constructor(props: ItemSubscriptionWithFormProps) {
    super(props);

    const selectedFrequencies = {};
    const configRenderSelects = this.loadRenderSelectFromConfig();
    props.lines.forEach((line) => {
      if (line.deliveryCode || line.deliveryInterval) {
        const fieldName = getFrequencyFieldName(line.lineNumber);
        selectedFrequencies[fieldName] = configRenderSelects[props.configFrequencies.findIndex((configFrequency) => {
          return configFrequency.code === line.deliveryCode &&
              _.isEqual(configFrequency.timeInterval, line.deliveryInterval);
        })];
        if (selectedFrequencies[fieldName]) {
          props.change(fieldName, selectedFrequencies[fieldName].code);
        }
      }
    });

    this.state = {
      selectedFrequencies
    };
    this.styles = Theme.getStyles(itemSubscriptionScreenStyle(props.isCheckout));
  }

  public componentDidMount(): void {
    if (this.props.lines.some((line) => !!line.subscriptionFrequencyCodes?.length)) {
      const subscriptionFrequencyCodes: string[] = _.flatten(
        this.props.lines.filter(line => line.subscriptionFrequencyCodes).map(line => line.subscriptionFrequencyCodes)
      ).filter((code, index, self) => index === self.indexOf(code));

      this.props.getSubscriptionFrequencies(subscriptionFrequencyCodes, subscriptionFrequencyCodes.length);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.subscriptionFrequenciesInProgress && !this.props.subscriptionFrequenciesInProgress) {
      const selectedFrequencies = _.cloneDeep(this.state.selectedFrequencies);
      this.props.lines.forEach((line) => {
        if (line.deliveryCode && hasFrequencyCodesFromLine(line, this.props.dataFrequencies)) {
          const dataFrequencyIndex = this.props.dataFrequencies.findIndex((dataFrequency) => {
            return dataFrequency.code === line.deliveryCode;
          });
          if (dataFrequencyIndex > -1) {
            const fieldName = getFrequencyFieldName(line.lineNumber);
            selectedFrequencies[fieldName] = this.loadRenderSelectFromData(line).find((renderSelectOption) => {
              return renderSelectOption.code === dataFrequencyIndex.toString();
            });
            if (selectedFrequencies[fieldName]) {
              this.props.change(fieldName, selectedFrequencies[fieldName].code);
            }
          }
        }
      });

      this.setState({ selectedFrequencies });
    }
  }

  public onSubscriptionChange(subscribed: boolean, lineNumber: number): void {
    const { subscriptions } = this.props;
    const index = _.findIndex(subscriptions, (subscription: ISubscriptionInfo) => subscription.lineNumber === lineNumber);
    if (index >= 0) {
      subscriptions.splice(index, 1, {...subscriptions[index], subscribed});
    } else {
      subscriptions.push({
        lineNumber,
        subscribed,
        frequency: undefined,
        quantity: undefined,
        deliveryfrequencyDescription: undefined
      });
    }
    this.props.change("subscriptions", subscriptions);
  }

  public onOptionChosen(chosenOption: RenderSelectOptions, lineNumber: number): void {
    const { selectedFrequencies } = this.state;
    selectedFrequencies[getFrequencyFieldName(lineNumber)] = chosenOption;
    this.props.change(getFrequencyFieldName(lineNumber), chosenOption.code);
    this.setState({ selectedFrequencies });
    this.onSubscriptionChange(true, lineNumber);
  }

  public onClose(lineNumber: number): void {
    this.onSubscriptionChange(false, lineNumber);
  }

  public render(): React.ReactNode {
    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("subscribe")}
          backButton={{
            name: "Back",
            action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onExit)
          }}
          rightButton={{
            title: this.props.isCheckout? I18n.t("continue") : I18n.t("apply"),
            action: () => handleFormSubmission(logger, this.props.submit, this.isValid())
          }}
          isVisibleTablet={this.props.isCheckout}
        />
        <KeyboardAwareScrollView contentContainerStyle={this.styles.contentContainerStyle}>
          <FlatList
            style={this.styles.list}
            data={this.props.lines}
            renderItem={({ item }) => (
              <SubscribableItemLine
                line={item}
                onClose={() => this.onClose(item.lineNumber)}
                onSubscriptionChange={(subscribed: boolean) => this.onSubscriptionChange(subscribed, item.lineNumber)}
                onOptionChosen={(chosenOption: RenderSelectOptions) => this.onOptionChosen(chosenOption, item.lineNumber)}
                isValid={this.isValid()}
                currentFrequency={this.state.selectedFrequencies[getFrequencyFieldName(item.lineNumber)]}
                isCheckout={this.props.isCheckout}
                frequencyList={hasFrequencyCodesFromLine(item, this.props.dataFrequencies) ?
                    this.loadRenderSelectFromData(item) : this.loadRenderSelectFromConfig()}
                navigation={this.props.navigation}
              />
            )}
          />
          {
            Theme.isTablet && !this.props.isCheckout &&
            <View style={this.styles.actions}>
              <TouchableOpacity
                style={[this.styles.btnPrimary, this.styles.button, !this.isValid() && this.styles.btnDisabled]}
                disabled={!this.isValid()}
                onPress={() => handleFormSubmission(logger, this.props.submit, this.isValid())}
              >
                <Text style={[this.styles.btnPrimaryText, !this.isValid() && this.styles.btnTextDisabled]}>
                  {I18n.t("apply")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[this.styles.btnSeconday, this.styles.button]} onPress={this.props.onExit}>
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          }
        </KeyboardAwareScrollView>
      </BaseView>
    );
  }

  private isValid(): boolean {
    return this.props.valid;
  }

  private loadRenderSelectFromConfig(): RenderSelectOptions[] {
    return this.props.configFrequencies.map((frequency, index): RenderSelectOptions => {
      return {
        code: index.toString(),
        description: I18n.t(frequency.displayText.i18nCode, {defaultValue: frequency.displayText.default})
      };
    });
  }

  private loadRenderSelectFromData(line: IItemDisplayLine): RenderSelectOptions[] {
    const selectOptions: RenderSelectOptions[] = [];

    line.subscriptionFrequencyCodes.forEach((frequencyCode: string) => {
      const index: number = this.props.dataFrequencies
          ?.findIndex((frequency: DeliveryFrequency) => frequency.code === frequencyCode);

      if (index) {
        const description = getDeliveryFrequencyText(this.props.configFrequencies, this.props.dataFrequencies,
            undefined, frequencyCode, I18n.locale);
        if (description) {
          selectOptions.push({code: index.toString(), description});
        }
      }
    });

    return selectOptions;
  }
}

const itemSubscriptionForm = reduxForm<ItemSubscriptionForm, Props>({
  form: "itemSubscriptionForm",
  validate: (values: ItemSubscriptionForm, props: DecoratedFormProps<ItemSubscriptionForm, Props>) => {
    const errors = {};

    props.lines.forEach((line: IItemDisplayLine) => {
      const quantity = values[getQuantityFieldName(line.lineNumber)];

      if (!quantity || quantity <= 0) {
        Object.assign(errors, { [getQuantityFieldName(line.lineNumber)]: I18n.t("insufficientQuantity") });
      }
    });

    return errors;
  },
  onSubmit: (data: ItemSubscriptionForm, dispatch: Dispatch<any>, props: Props) => {
    data.subscriptions.forEach((subscriptionInfo: ISubscriptionInfo) => {
      const subscriptionline = props.lines.find((line) => line.lineNumber === subscriptionInfo.lineNumber);

      const quantityFieldName = getQuantityFieldName(subscriptionInfo.lineNumber);
      subscriptionInfo.quantity = parseInt(data[quantityFieldName], 10);
      const frequencyFieldName = getFrequencyFieldName(subscriptionInfo.lineNumber);
      subscriptionInfo.frequency = hasFrequencyCodesFromLine(subscriptionline, props.dataFrequencies) ?
          props.dataFrequencies[parseInt(data[frequencyFieldName], 10)] :
          props.configFrequencies[parseInt(data[frequencyFieldName], 10)];
      subscriptionInfo.deliveryfrequencyDescription = subscriptionInfo.frequency ?
          getDeliveryFrequencyText(props.configFrequencies, props.dataFrequencies,
          subscriptionInfo.frequency.timeInterval, subscriptionInfo.frequency.code,  props.retailLocationLocale) : undefined
    });

    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.SUBSCRIPTIONS, data.subscriptions));

    props.performBusinessOperation(props.deviceIdentity, APPLY_ITEM_SUBSCRIPTION_EVENT, uiInputs);

    if (props.onContinue) {
      props.onContinue();
    }
  }
})(ItemSubscription);

const mapStateToProps = (state: AppState, ownProps: Props): StateProps => {
  const selector = formValueSelector("itemSubscriptionForm");
  const subscriptions: Array<ISubscriptionInfo> = selector(state, "subscriptions");

  const configFrequencies = getFeatureAccessConfig(state.settings.configurationManager, APPLY_ITEM_SUBSCRIPTION_EVENT).deliveryFrequency;
  const dataFrequencies = state.subscriptionFrequencies.subscriptionFrequencies;
  const subscriptionFrequenciesInProgress: boolean = state.subscriptionFrequencies.inProgress;

  const quantities = {};
  const frequencies = {};

  ownProps.lines.forEach((line: IItemDisplayLine) => {
    const quantity: string = !!line.subscriptionQuantity ? line.subscriptionQuantity.toString() : "1";
    const hasLineCodes: boolean = hasFrequencyCodesFromLine(line, dataFrequencies);
    let index: number = -1;

    if (line.deliveryCode) {
      if (hasLineCodes) {
        index = dataFrequencies.findIndex((dataFrequency) => dataFrequency.code === line.deliveryCode);
      } else {
        index = configFrequencies.findIndex((configFrequency) => configFrequency.code === line.deliveryCode);
      }
    } else if (line.deliveryInterval) {
      index = configFrequencies.findIndex((configFrequency) => configFrequency.timeInterval === line.deliveryInterval);
    }

    const frequency: string = index.toString();
    Object.assign(quantities, { [getQuantityFieldName(line.lineNumber)]: quantity });
    Object.assign(frequencies, { [getFrequencyFieldName(line.lineNumber)]: frequency });
  });

  return {
    deviceIdentity: state.settings.deviceIdentity,
    subscriptions,
    subscriptionFrequenciesInProgress,
    configFrequencies,
    dataFrequencies,
    initialValues: {
      subscriptions: ownProps.lines.map((line: IItemDisplayLine) => ({
        lineNumber: line.lineNumber,
        subscribed: !!line.subscribed,
        frequency: undefined,
        quantity: undefined,
        deliveryfrequencyDescription: undefined
      })),
      ...quantities,
      ...frequencies
    },
    retailLocationLocale: state.settings.primaryLanguage
  };
};

const mapStateToDispatch: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  getSubscriptionFrequencies: getSubscriptionFrequencies.request,
  updateUiMode: updateUiMode.request
};

export default connect<StateProps, DispatchProps, Omit<Props, keyof (StateProps & DispatchProps)>>(
  mapStateToProps, mapStateToDispatch
)(itemSubscriptionForm);
