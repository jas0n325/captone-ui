import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  UiInputKey,
  UPDATE_USER_PREFERENCES_EVENT,
  UPDATE_USER_PREFERRED_LANGUAGE_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, sceneTitle } from "../../actions";
import { AppState, BusinessState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { RenderSelectOptions } from "../common/FieldValidation";
import Header from "../common/Header";
import {
  getLanguageList,
  handleFormSubmission,
  promptSaveBeforeLosingChanges,
  userPreferenceUpdatePrompt
} from "../common/utilities";
import { popTo } from "../common/utilities/navigationUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { preferencesUpdateStyle } from "./styles";
import VectorIcon from "../common/VectorIcon";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.preferences.PreferencesScreen");

export interface LanguageForm {
  preferredLanguage: string;
}

export interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
}

export interface DispatchProps {
  deviceIdentity: DeviceIdentity;
  sceneTitle: ActionCreator;
  businessOperation: ActionCreator;
}

export interface Props extends StateProps, DispatchProps, NavigationScreenProps<"preferenceScreen"> {}

export interface State {
  languages: RenderSelectOptions[];
  preferredLanguage: RenderSelectOptions;
  prefLanguage: string;
}

class PreferencesScreen extends React.Component<Props & InjectedFormProps<LanguageForm, Props>  &
    FormInstance<LanguageForm, Props>, State> {

  private styles: any;

  public constructor(props: Props & InjectedFormProps<LanguageForm, Props> &
      FormInstance<LanguageForm, Props>) {

    super(props);

    this.styles = Theme.getStyles(preferencesUpdateStyle());

    this.state = {
      languages: undefined,
      preferredLanguage: undefined,
      prefLanguage: undefined
    };
  }

  public componentDidMount(): void {
    const prefLang = this.state.prefLanguage;
    if (prefLang) {

      this.state["initialize"]({
        prefLang
      });
    }

    (async () => {
      const languages: RenderSelectOptions[] = getLanguageList();
      const languagesFromApi = this.props.settings.languages;
      if (languagesFromApi && languagesFromApi.length > 0) {
        const missingLanguages = languagesFromApi.filter((l) => {
          return languages.filter((x) => x.code === l.localeId).length === 0;
        });
        if (missingLanguages.length > 0) {
          const mappedArray = missingLanguages.map<RenderSelectOptions>((x) => {
            const result =  {
              code: x.localeId,
              description: `${x.language}`,
              localiseDesc: `${x.localizedLanguage}`
            };
            if (x.country) {
              result.description += ` (${x.country})`;
            }
            if (x.localizedCountry) {
              result.localiseDesc += ` (${x.localizedCountry})`;
            }
            return result;
          });
          languages.push(...mappedArray);
        }
      }
      this.setState({
        languages,
        preferredLanguage: prefLang ? languages.find((lang) => lang.code === prefLang) : undefined
      });
      this.props.change("preferredLanguage",
          this.props.businessState.stateValues.get("UserSession.user.preferredLanguage"));
    })().catch((error) => {
          throw logger.throwing(error, "preferencesScreen.setupPreferredLanguage", LogLevel.WARN);
        });
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.businessState.inProgress && !this.props.businessState.inProgress && !this.props.businessState.error) {
      userPreferenceUpdatePrompt(this.props.businessState.nonContextualData,
          () => this.props.navigation.dispatch(popTo("main")));
    }
  }

  public render(): JSX.Element {
    const selectedLanguage = this.props.businessState.stateValues.get("UserSession.user.preferredLanguage");
    let SelectedLanguageName;
    if (this.state.languages !== undefined && Object.keys(this.state.languages).length > 0 && selectedLanguage) {
        SelectedLanguageName = selectedLanguage ?
            this.state.languages.find((lang) => lang.code === selectedLanguage) : undefined;
    }

    return (
      <BaseView style={this.styles.root}>
        <Header
          isVisibleTablet={true}
          title={I18n.t("preference")}
          backButton={{
            name: "Back",
            title: Theme.isTablet ? I18n.t("basket") : undefined,
            action: () => {
              if (this.state.preferredLanguage) {
                promptSaveBeforeLosingChanges(this.props.dirty, this.pop,
                    () => handleFormSubmission(logger, this.props.submit));
              } else {
                promptSaveBeforeLosingChanges(!this.props.dirty, this.pop,
                    () => handleFormSubmission(logger, this.props.submit));
              }
            }}}
          rightButton={!Theme.isTablet && {
            title: I18n.t("save"),
            action: () => handleFormSubmission(logger, this.props.submit)
          }}
        />
        <View style={this.styles.screen}>
          <TouchableOpacity
            style={this.styles.controlsRow}
            onPress={() => {
              this.props.sceneTitle("reasonCodeList", "preferredLanguage");
              this.props.navigation.push("reasonCodeList", {
                currentSelectedOption: this.state.preferredLanguage,
                options: this.state.languages,
                onOptionChosen: this.changePreferredLanguage.bind(this)
              });
            }}
          >
            <Text style={this.styles.textStyle}>
            {!this.state.preferredLanguage ? (SelectedLanguageName !== undefined)
              ? SelectedLanguageName.description :
              I18n.t("preferredLanguage") :
                      this.state.preferredLanguage.description}
            </Text>
            <View style={this.styles.arrowArea}>
              <VectorIcon name="Forward" height={this.styles.icon.fontSize} fill={this.styles.icon.color} />
            </View>
          </TouchableOpacity>
          {Theme.isTablet &&
            <View style={this.styles.actions}>
              <TouchableOpacity
                style={[this.styles.btnPrimary, this.styles.button]}
                onPress={() => handleFormSubmission(logger, this.props.submit)}
              >
                <Text style={this.styles.btnPrimaryText}>
                  {I18n.t("save")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.button]}
                onPress={() => promptSaveBeforeLosingChanges(this.props.dirty, this.pop,
                    () => handleFormSubmission(logger, this.props.submit))}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
      </BaseView>
    );
  }

  private pop = () => {
    this.props.navigation.pop();
  }

  private changePreferredLanguage(newValue: RenderSelectOptions): void {
    this.setState({ preferredLanguage: newValue }, () => {
      this.props.change("preferredLanguage", newValue.code);
    });
  }
}

const form =  reduxForm<LanguageForm, Props>({
  form: "languageform",
  initialValues: {preferredLanguage: undefined},
  onSubmit: (data: LanguageForm, dispatch: Dispatch<any>, props: Props) => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.PREFERREDLANGUAGE, data.preferredLanguage));
    props.businessOperation(props.deviceIdentity, UPDATE_USER_PREFERENCES_EVENT, uiInputs );
    props.businessOperation(props.deviceIdentity, UPDATE_USER_PREFERRED_LANGUAGE_EVENT, uiInputs );
  }
});

function mapStateToProps(state: AppState): any {
  return {
    businessState: state.businessState,
    settings : state.settings,
    deviceIdentity: state.settings.deviceIdentity
  };
}
export default connect(mapStateToProps, {
  sceneTitle: sceneTitle.request,
  businessOperation: businessOperation.request
})((form)(PreferencesScreen));
