import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";
import { RenderSelectOptions } from "../FieldValidation";

export interface TextScreenProps {
  onCancel: () => void;
  displayText: string;
}

export interface ReasonCodeListScreenProps {
  /**
   * if resetTitle is true use the default title "Reason Code".
   * Otherwise use the custom title coming from sceneTitlesState.
   */
  resetTitle?: boolean;
  currentSelectedOption?: RenderSelectOptions | RenderSelectOptions[];
  options: RenderSelectOptions[];
  multiSelect?: boolean;
  onOptionChosen: (chosenOption: RenderSelectOptions) => void;
  onClose?: () => void;
  onExitNavigation?: () => void;
}

export interface CommentsProps {
  line: IItemDisplayLine;
  onItemFreeTextComment: (
    line: IItemDisplayLine,
    itemCommentIsFreeText: boolean
  ) => void;
  onExit: (line: IItemDisplayLine) => void;
}

export interface FreeTextCommentProps {
  lineNumber: number;
  freeTextCommentValue: string;
  onExit: () => void;
  onDone: (lineNumber: number, comment?: string) => void;
  styles?: any;
  showHeader?: boolean;
}
