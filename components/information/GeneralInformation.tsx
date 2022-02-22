import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import VersionNumber from "react-native-version-number";

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import { getDisplayableDateOnly } from "../common/utilities/utils";
import InformationDetail from "./InformationDetail";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";


interface Props {
  paymentEnvironmentData: any;
  paymentUpdateAvailable: boolean;
  paymentLogUploadAvailable: boolean;
  paymentLogUploadEnabled: boolean;
  pendingTransactionCount: number;
  settings: SettingsState;
  stateValues: Readonly<Map<string, any>>;
  storeTitle: string;
  styles: any;
  tenantTitle: string;
  onUpdate: () => void;
  onUpload: () => void;
}

// tslint:disable-next-line:cyclomatic-complexity
const GeneralInformation = (props: Props): JSX.Element => {
  const { stateValues, styles } = props;
  const isTablet = Theme.isTablet;
  const appVersion = `${VersionNumber.appVersion}${I18n.t("appBuild", { build: VersionNumber.buildVersion })}`;

  const terminalIsOpen: boolean = stateValues && stateValues.get("TerminalSession.isOpen");
  const terminalIsClosed: boolean = stateValues && stateValues.get("TerminalSession.isClosed");
  const cashDrawerKey: boolean = stateValues && stateValues.get("TerminalSession.cashDrawerKey");
  const accountabilityMode: boolean = stateValues && stateValues.get("TerminalSession.accountabilityMode");
  const terminalStateIsKnown: boolean = terminalIsOpen || terminalIsClosed;

  const businessDayDate: Date = stateValues && stateValues.get("TerminalSession.lastActiveBusinessDay");

  return (
    <View style={styles.informationSection}>
      <InformationDetail styles={styles} label={I18n.t("domain")} value={props.settings.domain}/>
      <InformationDetail styles={styles} label={I18n.t("tenant")} value={props.tenantTitle}/>
      <InformationDetail styles={styles} label={I18n.t("storeNameGeneralInformation")} value={props.storeTitle}/>
      <InformationDetail styles={styles} label={I18n.t("deviceGeneralInformation")} value={props.settings.deviceIdentity.deviceId}/>
      {
        accountabilityMode &&
        <InformationDetail styles={styles} label={I18n.t("accountability")} value={accountabilityMode}/>
      }
      {
        cashDrawerKey &&
        <InformationDetail styles={styles} label={I18n.t("drawerIDGeneralInformation")} value={cashDrawerKey}/>
      }
      <InformationDetail
        styles={styles}
        label={I18n.t("terminalState")}
        value={terminalIsOpen && !terminalIsClosed ? I18n.t("open") : I18n.t("closed")}
      />
      {
        terminalStateIsKnown &&
        <InformationDetail
          styles={styles}
          label={terminalIsOpen ? I18n.t("currentBusinessDayDate") : I18n.t("lastBusinessDayDate")}
          value={getDisplayableDateOnly(businessDayDate && businessDayDate.toISOString())}
        />
      }
      {
        terminalStateIsKnown &&
        <InformationDetail
          styles={styles}
          label={terminalIsOpen ? I18n.t("openingTransactionNumber") : I18n.t("closingTransactionNumber")}
          value={terminalIsOpen
              ? stateValues && stateValues.get("TerminalSession.openingTransactionNumber")
              : stateValues && stateValues.get("TerminalSession.closingTransactionNumber")}
        />
      }
      <InformationDetail styles={styles}
                         label={I18n.t("transactionNumberGeneralInformation")}
                         value={props.settings.transactionNumber} />
      <InformationDetail styles={styles}
                         label={I18n.t("pendingTransactions")}
                         value={props.pendingTransactionCount} />
      <InformationDetail styles={styles} label={I18n.t("appVersion")} value={appVersion} />
      <InformationDetail styles={styles} label={I18n.t("appConfiguration")}>
        { renderConfigDetail(styles, props.settings.configurationManager) }
      </InformationDetail>
      <InformationDetail styles={styles} label={I18n.t("paymentEnvironment")} forceMultiLine={isTablet}>
        <View style={styles.informationSecondaryLine}>
            <FlatList data={props.paymentEnvironmentData}
                      renderItem={(i) => renderPaymentEnvironmentText(i, styles.informationText)}
                      style={styles.flatList} />
        </View>
      </InformationDetail>
      <View style={styles.btnArea}>
        <TouchableOpacity
          style={[styles.btnPrimary, styles.button, !props.paymentUpdateAvailable ? styles.btnDisabled : {}]}
          onPress={props.onUpdate}
          disabled={!props.paymentUpdateAvailable}
        >
          <Text style={[styles.btnPrimaryText,
            !props.paymentUpdateAvailable ? styles.btnTextDisabled : {}]}>{I18n.t("updateFirmware")}</Text>
        </TouchableOpacity>
      </View>
      {
        props.paymentLogUploadAvailable &&
        <InformationDetail styles={styles} label={I18n.t("uploadLogs")} forceMultiLine={isTablet}>
          <View style={styles.btnArea}>
          <TouchableOpacity
            style={[styles.btnPrimary, styles.button, !props.paymentLogUploadEnabled ? styles.btnDisabled : {}]}
            onPress={props.onUpload}
            disabled={!props.paymentLogUploadEnabled}
          >
            <Text style={[styles.btnPrimaryText,
              !props.paymentLogUploadEnabled ? styles.btnTextDisabled : {}]}>{I18n.t("uploadLogsButton")}</Text>
          </TouchableOpacity>
          </View>
        </InformationDetail>
      }
    </View>
  );
};

const renderConfigDetail = (styles: any, configurationManager: IConfigurationManager): JSX.Element => {
  const profileName = configurationManager?.configurationProfileName;
  const consumerVersion = configurationManager.consumerSpecification?.configurationConsumerVersion;

  if (profileName) {
    // FIXME - remove this when config V1 is no longer supported
    return (
        <View style={styles.fill}>
          <Text style={styles.informationText}>
            {I18n.t(
                "configurationProfileName",
                { name: profileName })
            }</Text>
          <Text style={styles.informationText}>
            {I18n.t(
                "configurationConsumerVersion",
                { version: consumerVersion })
            }</Text>
        </View>
    );
  }

  const revision = configurationManager.revision || 0;
  const specializationKeyEntries = JSON.parse(configurationManager.specializationKey);
  const specialization = specializationKeyEntries.length > 0 ? specializationKeyEntries.join(",") :
      I18n.t("configurationEnterpriseSpecialization");

  return (
      <View style={styles.fill}>
        <Text style={styles.informationText}>
          {I18n.t( "configurationSpecialization", { specialization })
          }</Text>
        <Text style={styles.informationText}>
          {I18n.t( "configurationRevision", { revision })
          }</Text>
      </View>
  );
};

const renderPaymentEnvironmentText = (input: any, informationTextStyle: any) => {
  // todo: localize during ZSPFLD-3175.
  return <Text style={informationTextStyle}>{input.item.key}</Text>;
};

export default GeneralInformation;
