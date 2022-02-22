import moment from "moment";
import * as React from "react";
import { Alert, Keyboard, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  DecoratedFormProps,
  Field,
  FormErrors,
  FormInstance,
  getFormMeta,
  getFormSyncErrors,
  InjectedFormProps,
  reduxForm
} from "redux-form";

import { LocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { QualificationError, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  convertToBusinessDayDate,
  OfflineReturnReference,
  SEARCH_HISTORICAL_TRANSACTIONS_EVENT,
  SSF_TRANSACTION_HISTORY_OFFLINE_ERROR_I18N_CODE
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  updateUiMode,
  userNotification
} from "../../actions";
import {
  AppState,
  SettingsState,
  TransactionsState,
  UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { renderDateInputField, renderNumericInputField, renderTextInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import Input from "../common/Input";
import { handleFormSubmission, updateScroll, warnBeforeLosingChanges } from "../common/utilities";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { returnSearchStyles } from "./styles";
import OfflineNotice from "../common/OfflineNotice";

interface ReturnSearchForm {
  retailLocationId?: string;
  deviceId?: string;
  transactionNumber?: number;
  businessDayDate?: string;
  referenceNumber?: string;
}

interface StateProps {
  returnMode: boolean;
  settings: SettingsState;
  transactionState: TransactionsState;
  formErrors: FormErrors<ReturnSearchForm>;
  formMeta: any;
}

interface DispatchProps {
  performBusinessOperation: ActionCreator;
  updateUiMode: ActionCreator;
  userNotification: ActionCreator;
}

interface Props extends StateProps, DispatchProps, NavigationScreenProps<"returnSearch"> {}

interface State {
  referenceNumber: string;
  isScrolling: boolean;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.return.ReturnSearchScreen");

class ReturnSearchScreen extends React.PureComponent<Props & InjectedFormProps<ReturnSearchForm, Props> &
    FormInstance<ReturnSearchForm, undefined>, State> {
  private retailLocationId: any;
  private deviceId: any;
  private transactionNumber: any;
  private businessDayDate: any;
  private styles: any;

  public constructor(props: Props & InjectedFormProps<ReturnSearchForm, Props> &
        FormInstance<ReturnSearchForm, undefined>) {
    super(props);

    this.styles = Theme.getStyles(returnSearchStyles());
    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleOfflineReturn = this.handleOfflineReturn.bind(this);

    this.state = {
      referenceNumber: undefined,
      isScrolling: false
    };
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH);

    if (this.retailLocationId) {
      this.retailLocationId.focus();
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.transactionState.inProgress && !this.props.transactionState.inProgress) {
      if (this.props.transactionState.error && this.props.transactionState.error instanceof QualificationError ) {
        const error: QualificationError = this.props.transactionState.error;
        const errorCode: string = error.localizableMessage.i18nCode;
        const collectedData: Map<string, any> = error.collectedData;
        if ( errorCode === SSF_TRANSACTION_HISTORY_OFFLINE_ERROR_I18N_CODE) {
          const offlineReference = collectedData.get("offlineReturnReference");
          setTimeout(() => Alert.alert("", I18n.t("transactionHistoryOfflineError"), [
            {text: I18n.t("cancel"), style: "cancel"},
            {text: I18n.t("ok"), onPress: () =>
                this.handleOfflineReturn(offlineReference)
            }
          ], { cancelable: false }), 500);
        }
      } else {
        this.props.navigation.replace("returnWithTransactionSearchResult", {
          inputSource: this.props.transactionState.inputSource
        });
      }
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const businessDayDate = this.props.formMeta && this.props.formMeta.businessDayDate;
    return (
      <BaseView style={this.styles.base}>
        <Header
          title={I18n.t("returnSearch")}
          backButton={{
            name: "Back",
            action: () => warnBeforeLosingChanges(this.props.dirty, this.replaceWithReturnTransaction)
          }}
          rightButton={{ title: I18n.t("search"), action: () => handleFormSubmission(logger, this.props.submit) }}
          isVisibleTablet={Theme.isTablet}
          returnMode={this.props.returnMode}
        />
        <OfflineNotice isScrolling={this.state.isScrolling}/>
        <KeyboardAwareScrollView onScrollEndDrag={this.handleScroll.bind(this)}
         enableOnAndroid={true}>
          <View style={this.styles.root}>
            <Input
                showCamera
                value={this.state.referenceNumber}
                onChangeText={this.handleChangeText}
                placeholder={I18n.t("scanReceiptOrOrder")}
                cameraIcon={{
                  icon: "Camera",
                  size: this.styles.cameraIcon.fontSize,
                  color: this.styles.cameraIcon.color,
                  position: "right",
                  style: this.styles.cameraIconPanel
                }}
                style={this.styles.inputArea}
            />
            <Field
              name={"retailLocationId"}
              onRef={(ref: any) => this.retailLocationId = ref}
              placeholder={I18n.t("storeNumber")}
              autoCapitalize="words"
              style={this.styles.textInput}
              errorStyle={this.styles.textInputError}
              returnKeyType={"next"}
              component={renderTextInputField}
              persistPlaceholder={true}
              onSubmitEditing={() => this.handleSubmitEditing("deviceId")}
            />
            <Field
              name={"deviceId"}
              onRef={(ref: any) => this.deviceId = ref}
              placeholder={I18n.t("device")}
              style={this.styles.textInput}
              errorStyle={this.styles.textInputError}
              keyboardType="numbers-and-punctuation"
              returnKeyType={"next"}
              component={renderTextInputField}
              persistPlaceholder={true}
              onSubmitEditing={() => this.handleSubmitEditing("transactionNumber")}
            />
            <Field
              name={"transactionNumber"}
              onRef={(ref: any) => this.transactionNumber = ref}
              placeholder={I18n.t("transactionNumber")}
              style={this.styles.textInput}
              errorStyle={this.styles.textInputError}
              returnKeyType={"next"}
              component={renderNumericInputField}
              persistPlaceholder={true}
              onSubmitEditing={() => this.handleSubmitEditing("businessDayDate")}
            />
            <Field
              name={"businessDayDate"}
              onRef={(ref: any) => this.businessDayDate = ref}
              placeholder={I18n.t("saleDate")}
              style={this.styles.textInput}
              errorStyle={this.styles.textInputError}
              keyboardType="numbers-and-punctuation"
              returnKeyType={"search"}
              dateFormat={I18n.t("date.format")}
              component={renderDateInputField}
              persistPlaceholder={true}
              onSubmitEditing={this.props.submit}
              showErrorOnFocusOut={true}
            />
            {!(businessDayDate && businessDayDate.touched && !businessDayDate.active &&
                this.props.formErrors.businessDayDate) &&
            <Text style={this.styles.dateFormat}>{I18n.t("date.format")}</Text>
            }
          </View>
        </KeyboardAwareScrollView>
      </BaseView>
    );
  }

  private handleChangeText(newText: string): void {
    this.setState({ referenceNumber: newText });
    this.props.change("referenceNumber", newText);
  }

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }

  private handleOfflineReturn(offlineReturnReference?: OfflineReturnReference): void {
    this.props.navigation.replace("returnTransaction", {
      offlineReturnReference
    });
  }

  private handleSubmitEditing = (next: string): void => {
    switch (next) {
      case "retailLocationId":
        this.retailLocationId.focus();
        break;
      case "deviceId":
        this.deviceId.focus();
        break;
      case "transactionNumber":
        this.transactionNumber.focus();
        break;
      case "businessDayDate":
        this.businessDayDate.focus();
        break;
      default:
        break;
    }
  }

  private replaceWithReturnTransaction = () => {
    this.props.navigation.replace("returnTransaction");
  }
}

const ReturnSearchScreenForm = reduxForm({
  form: "returnSearch",
  validate: (values: ReturnSearchForm, props: DecoratedFormProps<ReturnSearchForm, Props>) => {
    const errors: FormErrors<ReturnSearchForm> = { retailLocationId: undefined, deviceId: undefined,
      transactionNumber: undefined, businessDayDate: undefined };

    const dateFormat = I18n.t("date.format");
    if (values.businessDayDate && (values.businessDayDate.length !== dateFormat.length ||
        !moment(values.businessDayDate, dateFormat).isValid() ||
        moment(values.businessDayDate, dateFormat).isAfter(moment(new Date())))) {
      errors.businessDayDate = I18n.t("invalidDate");
    }
    return errors;
  },
  initialValues: {
    retailLocationId: undefined,
    deviceId: undefined,
    transactionNumber: undefined,
    businessDayDate: undefined
  },
  onSubmit: (data: ReturnSearchForm, dispatch: Dispatch<any>, props: Props) => {
    if (!(data.retailLocationId || data.deviceId || data.transactionNumber ||
        data.businessDayDate || data.referenceNumber)) {
      props.userNotification(new LocalizableMessage("returnSearchCriteriaMissing"));
    } else {
      const uiInputs: UiInput[] = [];
      Object.keys(data).forEach((key: string) => {
        if (data[key] !== undefined) {
          if (key === "businessDayDate") {
            uiInputs.push(new UiInput("businessDayDate", convertToBusinessDayDate(moment(data.businessDayDate,
                I18n.t("date.format")).toDate())));
          } else {
            uiInputs.push(new UiInput(key, data[key]));
          }
        }
      });
      props.performBusinessOperation(props.settings.deviceIdentity, SEARCH_HISTORICAL_TRANSACTIONS_EVENT, uiInputs);
      Keyboard.dismiss();
    }
  }
})(ReturnSearchScreen);

const mapStateToProps = (state: AppState): StateProps => ({
  returnMode: state.businessState.stateValues.get("ItemHandlingSession.isReturning"),
  settings: state.settings,
  transactionState: state.transactions,
  formErrors: getFormSyncErrors("returnSearch")(state),
  formMeta: getFormMeta("returnSearch")(state)
});

const mapDispatchToProps: DispatchProps = {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request,
  userNotification: userNotification.request
};

export default connect(mapStateToProps, mapDispatchToProps)(ReturnSearchScreenForm);
