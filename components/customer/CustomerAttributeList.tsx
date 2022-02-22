import _ = require("lodash");
import * as React from "react";
import {Text, View} from "react-native";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { IServiceCustomerAttribute } from "@aptos-scp/scp-component-store-selling-features";
import {
    AttributeDataElementDefinition,
    AttributeGroupDefinition,
    AttributeGroupDefinitionList
} from "@aptos-scp/scp-types-customer";

import I18n from "../../../config/I18n";
import { BusinessState } from "../../reducers";
import SectionLine from "../common/SectionLine";
import { SectionRow } from "../common/SectionRow";
import SectionSubHeader from "../common/SectionSubHeader";
import { getDateFromISODateString } from "../common/utilities";
import {
  attributeGroupCompare,
  attributeGroupDataElementCompare,
  getTranslationDataElement,
  getTranslationGroupDefStrings
} from "./CustomerUtilities";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.customerattributelist");

export interface Props {
    titleKey?: string;
    styles?: any;
    custAttributes: IServiceCustomerAttribute[];
    attributeDefs: AttributeGroupDefinitionList;
    businessState: BusinessState;
}

export const CustomerAttributeList: React.FunctionComponent<Props> = (props) => {
    if (!props.attributeDefs || !props.attributeDefs.data || !props.custAttributes) {
      return null;
    }
    const visibleSortedAttrDefs = props.attributeDefs.data.filter((ad) =>
      props.custAttributes.findIndex((ca) => ca.groupCode === ad.groupCode) > -1).sort(attributeGroupCompare);

    if (!visibleSortedAttrDefs || visibleSortedAttrDefs.length === 0) {
      return null;
    }

    return (
        <View style={props.styles.attributesSection}>
          {
            props.attributeDefs &&
            <View>
              {
                props.titleKey &&
                <View>
                  <Text style={props.styles.attributesSectionTitle}>{I18n.t(props.titleKey)}</Text>
                </View>
              }
              {/* Render section for FIRST attribute group sorted  */}
              {renderCustomerAttributeGroupSection(visibleSortedAttrDefs.shift(), props, true)}
              {/* Render section for each attribute group sorted  */}
              {visibleSortedAttrDefs.map(
                  (attrGroup) => renderCustomerAttributeGroupSection(attrGroup, props))}
            </View>
          }
        </View>
        );
};


function renderCustomerAttributeGroupSection(attrGroup: AttributeGroupDefinition,
                                             props: Props, isFirst?: boolean): any {
    //find all the customer attributes in this attribute group
    const custAttrs = attrGroup && props.custAttributes.filter((cu) => cu.groupCode === attrGroup.groupCode);
    //if none found then don't render
    if (_.isEmpty(custAttrs)) {
      return;
    }
    const preferredLanguage: string = props.businessState.stateValues.get("UserSession.user.preferredLanguage");
    return (
      <>
        <View style={isFirst ? props.styles.attributeDefinitionSectionFirst :
            props.styles.attributeDefinitionSection}>
          <View >
            <Text style={props.styles.attributeGroupTitleText}>
              {getTranslationGroupDefStrings(attrGroup, preferredLanguage).description}
            </Text>
            {/* Render section for FIRST customer attributes */}
            {renderCustomerAttributeRow(custAttrs.shift(), attrGroup, props, true)}
            {/* Render section for remaining customer attributes */}
            {custAttrs.map((attr) => renderCustomerAttributeRow(attr, attrGroup, props))}
          </View>
        </View>
      </>
    );
}

function renderCustomerAttributeRow(attr: IServiceCustomerAttribute,
                                    attrGroup: AttributeGroupDefinition, props: Props, isFirst?: boolean): any {
    return (
      <>
        <View style={isFirst ? undefined : props.styles.attributeDataElementSection}>
          <SectionRow styles={props.styles}>
            {attrGroup.dataElementDefinitions.sort(attributeGroupDataElementCompare).map((attrDefDataElem) =>
                renderCustomerAttributeDataElementRow(attr, attrDefDataElem, attrGroup, props))
            }
          </SectionRow>
        </View>
      </>
    );
}

function renderCustomerAttributeDataElementRow(attr: IServiceCustomerAttribute,
                                               attrDefDataElem: AttributeDataElementDefinition,
                                               attrDef: AttributeGroupDefinition, props: Props): any {

    //find matching customer attribute data element
    const custAttrDataElement = attr.dataElements.find((de) => de.key === attrDefDataElem.key);
    //if not found then don't render
    if (_.isEmpty(custAttrDataElement)) {
      return;
    }
    //find the matching value
    let valueArr: string[] = [];
    const preferredLanguage: string = props.businessState.stateValues.get("UserSession.user.preferredLanguage");
    try {
      if (attrDefDataElem.fieldType === "enum") {
        valueArr = custAttrDataElement.value.map((v) => {
            const matchingEnumEntry = attrDefDataElem.enumValues.find((ev) => ev.code === v);
            return getTranslationDataElement(matchingEnumEntry, preferredLanguage);
          });
        } else if (attrDefDataElem.fieldType === "number") {
            valueArr = custAttrDataElement.value.map((v) => {
            //convert t
            return Number(v).toString();
          });
        } else if (attrDefDataElem.fieldType === "date") {
          const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "numeric",
            day: "numeric"
          };
          valueArr = custAttrDataElement.value.map((v) => {
            const dt = getDateFromISODateString(v);
            return dt.toLocaleDateString(undefined, options);
          });
        } else if (attrDefDataElem.fieldType === "boolean") {
          //bool should be Yes or No
          valueArr = [I18n.t(custAttrDataElement.value[0] === "true" ? "yes" : "no")];
        } else {
          valueArr = custAttrDataElement.value;
        }
    } catch (ex) {
      logger.warn("Unable to render attribute value.", ex);
    }

    return (
      <>
        <View style={props.styles.attributeDataElementRow}>
          <SectionSubHeader styles={props.styles}>
            {getTranslationDataElement(attrDefDataElem, preferredLanguage)}
          </SectionSubHeader>
          <SectionLine styles={props.styles}>{valueArr.join(", ")}</SectionLine>
        </View>
      </>
    );
}


