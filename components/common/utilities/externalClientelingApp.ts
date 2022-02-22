import { Linking, UrlComponent } from "@aptos-scp/scp-component-rn-url-linking";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";

import { BusinessState } from "../../../reducers";

export enum ExternalClientelingAppInboundAction {
  SearchForCustomer = "searchForCustomer",
  NotifyNotInReadyState = "notifyNotInReadyState",
  EditCustomer = "editCustomer",
  NewCustomer= "newCustomer"
}

export enum ExternalClientelingAppOutboundAction {
  ApplySelectedCustomer = "applySelectedCustomer",
  CancelCustomerActivity = "cancelCustomerActivity",
  NotifyError = "notifyError"
}

export function getExternalClientelingAppURI(route: string): string {
  const routeRequest = route.split("/");
  return routeRequest.length > 0 ? routeRequest[0] : "";
}

export function getExternalClientelingAppAction(url: string): any {
  const route = url.replace(/^.*?:\/\//g, "");
  const request = route.replace(this.getExternalClientelingAppURI(route) + "/v1/", "");
  const action = this.getExternalClientelingAppURI(decodeURI(request));
  return action;
}

export function clientelingAppUrl(configManager: IConfigurationManager): string {
  return configManager && configManager.getFunctionalBehaviorValues()
      .customerFunctionChoices.clientelingAppUrl;
}

export function getExternalClientelingAppComponent(url: string): UrlComponent {
  return Linking.getUrlComponent(url);
}

export function getUrlScheme(url?: string): string {
  return (url || "aptos-store-selling") + "://";
}

export function buildExternalClientelingAppRequest(businessState: BusinessState, action: ExternalClientelingAppInboundAction, customerKey?: string): string {
  const appUrl: string = `${getUrlScheme()}v1/applySelectedCustomer/`;
  const cancelUrl: string = `${getUrlScheme()}v1/cancelCustomerActivity/`;
  const errorUrl: string = `${getUrlScheme()}v1/notifyError/`;
  const userId: string = businessState.stateValues.get("UserSession.user.id");
  const username: string = businessState.stateValues.get("UserSession.user.username");
  switch (action){
    case ExternalClientelingAppInboundAction.SearchForCustomer:
      return `v1/${action}/?appUrl=${appUrl}&cancelUrl=${cancelUrl}&errorUrl=${errorUrl}&userId=${userId}&username=${username}`;
    case ExternalClientelingAppInboundAction.NotifyNotInReadyState:
      return `v1/${action}/?appUrl=${appUrl}&userId=${userId}&username=${username}`;
    case ExternalClientelingAppInboundAction.EditCustomer:
      const customerKeyString = (customerKey) ? `&customerKey=${customerKey}` : "";
      return `v1/${action}/?appUrl=${appUrl}&cancelUrl=${cancelUrl}&errorUrl=${errorUrl}&userId=${userId}&username=${username}${customerKeyString}`;
    case ExternalClientelingAppInboundAction.NewCustomer:
      return `v1/${action}/?appUrl=${appUrl}&cancelUrl=${cancelUrl}&errorUrl=${errorUrl}&userId=${userId}&username=${username}`;
    default:
      return undefined;
  }
}
