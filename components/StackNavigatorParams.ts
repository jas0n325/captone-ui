import {
  NativeStackNavigationProp,
  NativeStackScreenProps
} from "react-native-screens/native-stack";

import {
  GenericPrinterScreenProps
} from "@aptos-scp/scp-component-rn-device-services";

import { BagFeeScreenProps } from "./bagFee/interfaces";
import { BasketActionsScreenProps } from "./basketActions/interfaces";
import { CameraScannerScreenWrapperProps } from "./camera/interfaces";
import {
  CommentsProps,
  FreeTextCommentProps,
  ReasonCodeListScreenProps,
  TextScreenProps
} from "./common/screens/interfaces";
import { CouponComponentProps } from "./coupon/interfaces";
import {
  AddressSearchScreenProps,
  AttributeGroupCodeScreenProps,
  CustomerAttributeEditorScreenProps,
  CustomerCreateScreenProps,
  CustomerDisplayProps,
  CustomerNipScreenProps,
  CustomerResultsProps,
  CustomerSearchScreenProps,
  CustomerTaxInvoiceScreenProps,
  CustomerUpdateScreenProps,
  PhoneCountryCodeScreenProps
} from "./customer/interfaces";
import {
  OrderInquiryDetailScreenProps,
  OrderInquiryScreenProps
} from "./customerOrder/interfaces";
import {
  DiscountComponentProps,
  DiscountTypeSelectionProps,
  PreConfiguredDiscountsScreenProps
} from "./discounts/interfaces";
import { DonationScreenProps } from "./donation/interfaces";
import { VoidableErrorScreenProps } from "./error/interfaces";
import {
  FastDiscountDetailsScreenProps,
  FastDiscountProps
} from "./fastDiscounts/interfaces";
import {
  FindNearbyScreenProps,
  StoreOperationDetailsScreenProps
} from "./findNearby/interfaces";
import {
  FiscalPrinterEnterDocumentNumberScreenProps,
  FiscalPrinterErrorScreenProps,
  FiscalPrinterReceiptErrorScreenProps
} from "./fiscalPrinter/interface";
import {
  BalanceInquiryScreenProps,
  CardRedeemComponentProps,
  IssueGiftCardComponentProps
} from "./giftCard/interfaces";
import {
  SalesHistoryScreenProps,
  TransactionHistoryScreenProps
} from "./history/interfaces";
import { InitScreenProps } from "./init/interfaces";
import { LandingScreenProps } from "./landing/interfaces";
import { LoginScreenProps } from "./login/interfaces";
import { ScanLotteryProps } from "./lottery/interfaces";
import {
  LoyaltyDiscountComponentProps,
  LoyaltyEnrollmentScreenProps,
  LoyaltyMembershipDetailScreenProps
} from "./loyaltyMembership/interfaces";
import { LoyaltyVoucherScreenProps } from "./loyaltyVoucher/interfaces";
import { MainScreenProps } from "./main/interfaces";
import { NonMerchProps } from "./nonMerch/interfaces";
import { NotFoundScreenProps } from "./notFound/interfaces";
import { NotOnFileScreenProps } from "./notOnFile/interfaces";
import {
  OrderDeliveryAddressScreenProps,
  OrderPickupDetailsScreenProps
} from "./orderContact/interfaces";
import { UnavailableQuantitiesDetailScreenProps } from "./orderInventory/interfaces";
import {
  NonIntegratedPaymentProps,
  OfflineAuthorizationProps,
  PaymentScreenProps,
  TenderPromptRulesProps
} from "./payment/interfaces";
import { PriceProps, ZeroPricedScreenProps } from "./price/interfaces";
import {
  ProductInquiryDetailScreenProps,
  ProductProps
} from "./product/interfaces";
import { QuantityProps } from "./quantity/interfaces";
import { ReceiptSummaryScreenProps } from "./receipt/interfaces";
import {
  ReceiptCategoryChoiceProps,
  ReceiptEmailFormScreenProps,
  ReceiptPhoneNumberFormScreenProps,
  ReceiptPrinterChoiceProps
} from "./receipt/receiptFlow/interfaces";
import {
  ReturnDetailsScreenProps,
  ReturnWithTransactionScreenProps,
  ReturnWithTransactionSearchResultScreenProps
} from "./return/interfaces";
import { AssignSalespersonComponentProps } from "./salesperson/interfaces";
import { SCOMainScreenProps } from "./selfCheckout/interfaces";
import { TerminalConflictScreenProps } from "./settings/interfaces";
import { ShippingMethodScreenProps } from "./shipping/interfaces";
import { SignatureCaptureScreenProps } from "./signature/interfaces";
import { StoppedItemProps } from "./stoppedItem/interfaces";
import {
  ItemSubscriptionProps,
  SubscriptionsAuthorizationScreenProps
} from "./subscriptions/interfaces";
import { TaxExemptComponentProps } from "./taxExempt/interfaces";
import { TaxFreeScreenProps } from "./taxFree/interfaces";
import { TaxActionPanelProps } from "./taxModifiers/interfaces";
import { TaxOverrideComponentProps } from "./taxModifiers/taxOverride/interfaces";
import { TenderExchangeScreenProps } from "./tender/exchange/interfaces";
import {
  CurrencyCalculatorScreenProps,
  PaidDetailScreenProps,
  ScanDrawerScreenProps,
  TillDetailScreenProps,
  TillSuccessScreenProps,
  TillVarianceReasonScreenProps,
  TillVarianceScreenProps
} from "./tillManagement/interfaces";
import { ChangePasswordScreenProps } from "./user/interface";
import { IssueGiftCertificateComponentProps, ValueCertificateProps } from "./valueCertificate/interfaces";
import { TenderChangeComponentProps } from "./tender/change/interfaces";

export type StackNavigatorParams = {
  init: InitScreenProps;
  tenantSettings: undefined;
  downloadProgress: undefined;
  terminalSettings: undefined;
  terminalConflict: TerminalConflictScreenProps;
  login: LoginScreenProps;
  landing: LandingScreenProps;
  main: MainScreenProps;
  nonIntegratedAuthorization: NonIntegratedPaymentProps;
  loyaltyEnrollment: LoyaltyEnrollmentScreenProps;
  changePassword: ChangePasswordScreenProps;
  notOnFile: NotOnFileScreenProps;
  notFound: NotFoundScreenProps;
  scoMainScreen: SCOMainScreenProps;
  scan: CameraScannerScreenWrapperProps;
  zeroPriced: ZeroPricedScreenProps;
  quantity: QuantityProps;
  preferenceScreen: undefined;
  price: PriceProps;
  customer: CustomerSearchScreenProps;
  customerList: CustomerResultsProps;
  customerCreate: CustomerCreateScreenProps;
  customerNip: CustomerNipScreenProps;
  customerTaxInvoice: CustomerTaxInvoiceScreenProps;
  customerUpdate: CustomerUpdateScreenProps;
  customerDisplay: CustomerDisplayProps;
  textScreen: TextScreenProps;
  phoneCountryCode: PhoneCountryCodeScreenProps;
  payment: PaymentScreenProps;
  signatureCapture: SignatureCaptureScreenProps;
  receiptSummary: ReceiptSummaryScreenProps;
  receiptCategoryChoice: ReceiptCategoryChoiceProps;
  receiptEmailForm: ReceiptEmailFormScreenProps;
  receiptPhoneNumberForm: ReceiptPhoneNumberFormScreenProps;
  receiptPrinterChoice: ReceiptPrinterChoiceProps;
  offlineAuthorization: OfflineAuthorizationProps;
  tenderReference: TenderPromptRulesProps;
  redeem: CardRedeemComponentProps;
  reprintReceipt: undefined;
  information: undefined;
  balanceInquiry: BalanceInquiryScreenProps;
  productInquiry: undefined;
  orderInquiry: OrderInquiryScreenProps;
  orderInquiryDetail: OrderInquiryDetailScreenProps;
  productInquiryDetail: ProductInquiryDetailScreenProps;
  nonMerch: NonMerchProps;
  salesHistory: SalesHistoryScreenProps;
  transactionHistory: TransactionHistoryScreenProps;
  fatalError: undefined;
  product: ProductProps;
  taxActionPanel: TaxActionPanelProps;
  taxOverrideScreen: TaxOverrideComponentProps;
  assignSalesperson: AssignSalespersonComponentProps;
  coupon: CouponComponentProps;
  issueGiftCard: IssueGiftCardComponentProps;
  issueGiftCertificate: IssueGiftCertificateComponentProps;
  reasonCodeList: ReasonCodeListScreenProps;
  attributeDefList: AttributeGroupCodeScreenProps;
  attributeEditor: CustomerAttributeEditorScreenProps;
  addressSearch: AddressSearchScreenProps;
  comments: CommentsProps;
  comment: FreeTextCommentProps;
  orderPickupDetailsConfirmation: OrderPickupDetailsScreenProps;
  orderDeliveryAddressConfirmation: OrderDeliveryAddressScreenProps;
  discountTypeSelection: DiscountTypeSelectionProps;
  discountScreen: DiscountComponentProps;
  fastDiscountScreen: FastDiscountProps;
  fastDiscountSelection: FastDiscountDetailsScreenProps;
  bagFee: BagFeeScreenProps;
  donation: DonationScreenProps;
  resumeSuspendedTransactions: undefined;
  stoppedItem: StoppedItemProps;
  taxExempt: TaxExemptComponentProps;
  storeOperations: undefined;
  tenderExchange: TenderExchangeScreenProps;
  fiscalConfigValidationError: undefined;
  fiscalPrinter: undefined;
  fiscalPrinterError: FiscalPrinterErrorScreenProps;
  fiscalPrinterReceiptError: FiscalPrinterReceiptErrorScreenProps;
  fiscalPrinterEnterDocument: FiscalPrinterEnterDocumentNumberScreenProps;
  fiscalSyncReportError: undefined;
  tillManagement: undefined;
  scanDrawer: ScanDrawerScreenProps;
  scanLottery: ScanLotteryProps;
  preConfiguredDiscounts: PreConfiguredDiscountsScreenProps;
  tillDetail: TillDetailScreenProps;
  currencyCalculator: CurrencyCalculatorScreenProps;
  tillSuccess: TillSuccessScreenProps;
  openCloseTerminal: undefined;
  loyaltyVoucher: LoyaltyVoucherScreenProps;
  varianceReason: TillVarianceReasonScreenProps;
  loyaltyDiscount: LoyaltyDiscountComponentProps;
  loyaltyMembershipDetails: LoyaltyMembershipDetailScreenProps;
  paidDetail: PaidDetailScreenProps;
  returnTransaction: ReturnWithTransactionScreenProps;
  returnWithTransactionSearchResult: ReturnWithTransactionSearchResultScreenProps;
  returnDetails: ReturnDetailsScreenProps;
  returnSearch: undefined;
  taxFree: TaxFreeScreenProps;
  genericPrinter: GenericPrinterScreenProps;
  basketActions: BasketActionsScreenProps;
  shippingMethod: ShippingMethodScreenProps;
  findNearbyLocation: FindNearbyScreenProps;
  unavailableQuantities: UnavailableQuantitiesDetailScreenProps;
  itemSubscription: ItemSubscriptionProps;
  subscriptionAuthorization: SubscriptionsAuthorizationScreenProps;
  valueCertificate: ValueCertificateProps;
  voidableErrorScreen: VoidableErrorScreenProps;
  storeOperationDetails: StoreOperationDetailsScreenProps;
  customerPreviewDisplay: CustomerDisplayProps;
  creatingCouchbaseIndexes: undefined;
  tillVariance: TillVarianceScreenProps;
  tenderChange: TenderChangeComponentProps;
};

export const INITIAL_ROUTE: keyof StackNavigatorParams = "init";

export interface NavigationScreenProps<T extends keyof StackNavigatorParams>
  extends NativeStackScreenProps<StackNavigatorParams, T> {}

export type NavigationProp = NativeStackNavigationProp<StackNavigatorParams>;
