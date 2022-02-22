import { IEmployee, IUser } from "@aptos-scp/scp-types-commerce-transaction";
import { Associate } from "@aptos-scp/scp-types-orders";


export function getFormattedAssociateName(associate: (IEmployee | IUser | Associate)): string {
  return associate &&
    ((associate as (IEmployee | IUser)).firstName || (associate as Associate).name?.firstName) + " " +
    ((associate as (IEmployee | IUser)).lastName || (associate as Associate).name?.lastName) + " " +
    "(" +
    ((associate as IEmployee).employeeNumber || (associate as IUser).username || (associate as Associate).operator?.loginName) +
    ")";
}
