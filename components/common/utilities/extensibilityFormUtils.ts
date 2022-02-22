import {
  APTOS_ITEM_COMMENTS_FORM,
  APTOS_STORE_SELLING_NAMESPACE,
  IItemDisplayLine,
  ITEM_SALE_LINE_TYPE
} from "@aptos-scp/scp-component-store-selling-features";

//TODO: DSS-13052 - adjust formName checks once more extensibility forms are available.

export function itemDisplayLineHasValidExtensibilityForms(itemDisplayLine: IItemDisplayLine): boolean {
  return itemDisplayLine.lineType === ITEM_SALE_LINE_TYPE && itemDisplayLine.extensibilityForms?.some((form) =>
      form.namespace === APTOS_STORE_SELLING_NAMESPACE && form.formName === APTOS_ITEM_COMMENTS_FORM);
}

export function getCurrentValueOfField(itemDisplayLine: IItemDisplayLine, fieldName: string): any {
  return itemDisplayLine.extensibilityFormData?.find(
      (form) => form.formName === APTOS_ITEM_COMMENTS_FORM && form.namespace === APTOS_STORE_SELLING_NAMESPACE
  )?.fields?.[fieldName];
}
