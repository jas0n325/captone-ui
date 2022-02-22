import * as _ from "lodash";

import { IValueCertificateResult } from "@aptos-scp/scp-component-store-selling-features";
import { ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";

import i18n from "../../../config/I18n";
import { BusinessState } from "../../reducers";

export function valueCertificateInquiryResultsUpdated(businessState: BusinessState,
                                                      prevBusinessState: BusinessState): boolean {
  const currentInquiryResults = businessState.stateValues.get("StoredValueCertificateSession.inquiryResults");
  const prevInquiryResults = prevBusinessState.stateValues.get("StoredValueCertificateSession.inquiryResults");
  return currentInquiryResults !== prevInquiryResults;
}

export function sortAppliedCertificate(valueCertificates: IValueCertificateResult[]): IValueCertificateResult[] {
  return valueCertificates?.sort((vc1, vc2) => vc1.tenderLineNumber - vc2.tenderLineNumber);
}

export function getTypeDisplayText(valueCertificateType: ValueCertSubType): string {
  switch (valueCertificateType) {
    case ValueCertSubType.StoreCredit:
      return i18n.t("storeCredit");
    case ValueCertSubType.GiftCertificate:
      return i18n.t("giftCertificate");
    default:
      return "";
  }
}
