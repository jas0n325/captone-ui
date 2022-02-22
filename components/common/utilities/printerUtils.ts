import { IPrintResult } from "@aptos-scp/scp-component-rn-device-services";
import { PrintStatus } from "@aptos-scp/scp-types-commerce-transaction";

export function getPrintStatusFromPrintResult(result: IPrintResult): PrintStatus {
  let printStatus: PrintStatus;
  if (result.successful) {
    printStatus = PrintStatus.Sent;
  } else if (result.reason) {
    printStatus = PrintStatus.Error;
  } else {
    printStatus = PrintStatus.NotSent;
  }
  return printStatus;
}
