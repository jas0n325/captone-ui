import { ReceiptState } from "@aptos-scp/scp-component-store-selling-features";
import { ReceiptCategory, ReceiptType } from "@aptos-scp/scp-types-commerce-transaction";

import { RetailLocationsState, UiState } from "../../../reducers";
import { isFranceLocation } from "../../common/utilities";
import {
  BaseReceiptScreen,
  BaseReceiptScreenDispatchProps,
  BaseReceiptScreenProps,
  BaseReceiptScreenState,
  BaseReceiptScreenStateProps
} from "../../receipt/BaseReceiptScreen";
import { inTransaction } from "../common/constants";


export interface SCOPrintManagerDispatchProps extends BaseReceiptScreenDispatchProps {
}

export interface SCOPrintManagerStateProps extends BaseReceiptScreenStateProps {
  stateValues: Map<string, any>;
  uiState: UiState;
  retailLocations: RetailLocationsState;
}

export interface SCOPrintManagerProps extends SCOPrintManagerStateProps, SCOPrintManagerDispatchProps,
  BaseReceiptScreenProps {}

export interface SCOPrintManagerState extends BaseReceiptScreenState {
  isPrinting?: boolean;
}

export class SCOPrintManagerComponent<P extends SCOPrintManagerProps, S extends SCOPrintManagerState>
    extends BaseReceiptScreen<P, S> {

  constructor(props: SCOPrintManagerProps & P) {
    super(props);
  }

  public componentDidUpdate(prevProps: P, prevState: S): void {
    if (this.printingCompleted(prevProps)) {
      // With the current implementation this page will only be on the stack if
      // a merchandise transactions is completed. Anything else should already have been printed
      // by attendant mode.
      this.setState({isPrinting: false});
    }
    if (this.shouldPrint()) {
      this.setState({isPrinting: true});
      let category = this.props.stateValues.get("ReceiptSession.receiptCategory") || ReceiptCategory.Receipt;
      if (isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
        category = ReceiptCategory.VatReceipt;
      }
      this.startPrint(ReceiptType.Print, category);
    }

    if (!inTransaction(prevProps.stateValues) && inTransaction(this.props.stateValues)) {
      // Reset the receipt information when starting a transaction.
      // Receipt information is cleared when the transaction completes and the constructor is only called once in SCO.
      this.handleSetup();
    }
  }

  private startPrint(receiptType: ReceiptType, receiptCategory: ReceiptCategory): void {
    this.props.setReceiptType(receiptType);
    this.props.setReceiptCategory(receiptCategory);
    //Note needed to allow time to get the configured printers
    setTimeout(() => this.safePrintReceipt(), 250);
  }

  private printingCompleted(prevProps: P): boolean {
    return this.state.isPrinting && (this.props.stateValues.get("ReceiptSession.state") === ReceiptState.Completed ||
        this.props.stateValues.get("ReceiptSession.state") === ReceiptState.Inactive);
  }

  private shouldPrint(): boolean {
    return !this.state.isPrinting &&
        this.props.stateValues.get("ReceiptSession.state") === ReceiptState.WaitingForOptions;
  }
}
