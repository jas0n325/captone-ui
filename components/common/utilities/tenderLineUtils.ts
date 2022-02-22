import { IConfigurationValues } from "@aptos-scp/scp-component-store-selling-core";
import { ITenderDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export const tenderOpensCashDrawer = (line: ITenderDisplayLine, tenderDefinitions: IConfigurationValues[]): boolean => {
  if (line) {
    const configuredTenders = tenderDefinitions.filter((tender) =>
        (!tender.hasOwnProperty("active") || tender.active) && !!tender.opensCashDrawerFor
    );

    return configuredTenders.some((tender) =>
        tender.tenderId === line.tenderId && tender.opensCashDrawerFor.indexOf(line.lineType) > -1
    );
  }
};
