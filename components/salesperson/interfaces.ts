export interface AssignSalespersonComponentProps {
  assignToTransaction: boolean;
  isTransactionStarting: boolean;
  lineNumbers?: number[];
  onExit: (skipped?: boolean) => void;
}
