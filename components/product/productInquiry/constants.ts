import { FulfillmentType } from "@aptos-scp/scp-types-commerce-transaction";
import { DeliveryMethodResult, InventoryItem } from "@aptos-scp/scp-types-inventory";
import { Quantity } from "@aptos-scp/scp-component-business-core";

export enum ProductInquiryButtonType {
  primary,
  secondary
}

export const getCarryoutAvailableInventory = (inventory: InventoryItem[]): number => {
  const carryoutQuantities = inventory && inventory.length && inventory[0].deliveryMethods.find((deliveryResponse: DeliveryMethodResult) => {
    return deliveryResponse.deliveryMethod === "cashAndCarry";
  });
  return carryoutQuantities && new Quantity(carryoutQuantities.quantities[0].quantity.amount).amount;
};

export const getCarryoutAvailableInventoryByStore = (inventory: InventoryItem[], storeId: string): number => {
  const carryoutQuantities = inventory && inventory.length && inventory[0].deliveryMethods.find((deliveryResponse: DeliveryMethodResult) => {
    return deliveryResponse.deliveryMethod === "cashAndCarry" && deliveryResponse.businessUnit.businessUnitID === storeId;
  });
  return carryoutQuantities && new Quantity(carryoutQuantities.quantities[0].quantity.amount).amount;
};

export const getNetworkAvailableInventory = (inventory: InventoryItem[]): DeliveryMethodResult[] => {
  return inventory && inventory.length && inventory[0].deliveryMethods &&
      inventory[0].deliveryMethods.filter((deliveryResponse: DeliveryMethodResult) => {
        return deliveryResponse.deliveryMethod === FulfillmentType.shipToStore ||
            deliveryResponse.deliveryMethod === FulfillmentType.shipToCustomer;
      });
};
