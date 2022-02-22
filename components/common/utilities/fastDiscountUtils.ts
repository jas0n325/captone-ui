import { IFastDiscountButton } from "@aptos-scp/scp-component-store-selling-features";
import { ManualDiscountType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";

export const getFixedPriceDisplayText = (fastDiscountButtons: IFastDiscountButton[][]): string => {
  if (fastDiscountButtons) {
    let buttonDisplayText: string;
    fastDiscountButtons.find((buttonRow: IFastDiscountButton[]) => {
      const priceButton = buttonRow.find((button: IFastDiscountButton) =>
          button.manualDiscountType === ManualDiscountType.ReplacementUnitPrice
      );
      buttonDisplayText = priceButton && priceButton.displayText[I18n.currentLocale()];
      return !!priceButton;
    });
    return buttonDisplayText;
  } else {
    return undefined;
  }
}
