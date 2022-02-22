import { CollectedDataKey } from "@aptos-scp/scp-component-store-selling-features";
import { IServiceResult } from "@aptos-scp/scp-types-commerce-transaction";

import { Alert } from "react-native";
import I18n from "../../../../config/I18n";


export const userPreferenceUpdateStatus = (nonContextualData: Readonly<Map<string, any>>): boolean => {
  let successful: boolean = true;
  if (nonContextualData && nonContextualData.has(CollectedDataKey.ServiceResult)) {
    const serviceResult: IServiceResult = nonContextualData.get(CollectedDataKey.ServiceResult);
    successful = serviceResult.successful;
  }
  return successful;
};

export const userPreferenceUpdatePrompt = (nonContextualData: Readonly<Map<string, any>>,
                                           onExit: () => void): void => {
  const prefereneSuccess: boolean = userPreferenceUpdateStatus(nonContextualData);
  if (!prefereneSuccess) {
    setTimeout(() => Alert.alert(I18n.t("offline"), I18n.t("offlineSaveMsg"), [
      { text: I18n.t("ok"), onPress: onExit }
    ], { cancelable: true }), 500);
  } else {
    onExit();
  }
};
