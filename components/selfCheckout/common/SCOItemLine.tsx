import * as React from "react";
import { Text, View } from "react-native";
import { connect } from "react-redux";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  IDiscountDisplay,
  IItemDisplayLine,
  IPromotionDisplay
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { AppState } from "../../../reducers";
import Theme from "../../../styles";
import { AspectPreservedImage } from "../../common/AspectPreservedImage";
import {
  establishImageSourceToRender,
  getColorName,
  getSizeName,
  getStoreLocale,
  getStoreLocaleCurrencyOptions,
  getStyleName
} from "../../common/utilities";
import { getLineAdjustmentText } from "../../common/utilities/itemLineUtils";
import { scoItemLineStyles } from "./styles";


interface StateProps {
  configManager: IConfigurationManager;
  retailLocationLocale: string;
}

interface Props extends StateProps {
  itemDisplayLine: IItemDisplayLine;
}

const SCOItemLine = (props: Props) => {
  const styles = Theme.getStyles(scoItemLineStyles());
  const line = props.itemDisplayLine;

  const renderLineAdjustment = (lineAdjustment: IPromotionDisplay | IDiscountDisplay): JSX.Element => {
    return (
      <View style={styles.lineAdjustmentRow}>
        <Text
          style={[styles.lineAdjustmentText, styles.leftOfLineAdjustment]}
          numberOfLines={2}
          ellipsizeMode={"middle"}
        >
          {`${getLineAdjustmentText(lineAdjustment)}    `}
        </Text>
        <Text style={[styles.lineAdjustmentText, styles.rightOfLineAdjustment]}>
          {`(${lineAdjustment.amount.toLocaleString(getStoreLocale()
            , getStoreLocaleCurrencyOptions())})`}
        </Text>
      </View>
    );
  };

  const imageSourceToRender = establishImageSourceToRender(props.configManager, styles.imageArea.width,
      styles.imageArea.height, line.itemImageUrl);

  const providedColor: string = getColorName(line, props.retailLocationLocale);
  const providedSize: string = getSizeName(line, props.retailLocationLocale);
  const providedStyle: string = getStyleName(line, props.retailLocationLocale);

  const showLeftDot: boolean = !!(providedColor && (providedSize || providedStyle));
  const showRightDot: boolean = !!(providedSize && providedStyle);

  const originalUnitPrice = line.originalUnitPrice.amount.toLocaleString(getStoreLocale()
    , getStoreLocaleCurrencyOptions());

  const hasLineAdjustments: boolean = line.lineAdjustments && line.lineAdjustments.length > 0;

  return (
    <View style={styles.root}>
      {
        imageSourceToRender &&
        <AspectPreservedImage
          style={styles.imageArea}
          desiredSource={imageSourceToRender}
          rowHeight={styles.imageArea.height}
          rowWidth={styles.imageArea.width}
          defaultSource={undefined}
          defaultSourceHeight={styles.imageArea.height}
          defaultSourceWidth={styles.imageArea.width}
        />
      }
      <View style={styles.itemDetailsArea}>
        <Text style={styles.itemName}>{line.itemShortDescription}</Text>
        <Text style={styles.itemAttributes} numberOfLines={2} ellipsizeMode={"tail"}>
          {providedColor &&
            <Text>
              <Text style={styles.itemAttributeLabel}>{`${I18n.t("color")}: `}</Text>
              <Text style={styles.itemAttribute}>{providedColor}</Text>
              { showLeftDot && <Text style={styles.itemAttributeSeparator}>{" · "}</Text> }
            </Text>
          }
          {providedSize &&
            <Text>
              <Text style={styles.itemAttributeLabel}>{`${I18n.t("size")}: `}</Text>
              <Text style={styles.itemAttribute}>{providedSize}</Text>
              { showRightDot && <Text style={styles.itemAttributeSeparator}>{" · "}</Text> }
            </Text>
          }
          {providedStyle &&
            <Text>
              <Text style={styles.itemAttributeLabel}>{`${I18n.t("style")}: `}</Text>
              <Text style={styles.itemAttribute}>{providedStyle}</Text>
            </Text>
          }
        </Text>
        <Text style={styles.itemKey}>{line.itemIdKey}</Text>
      </View>
      <View style={[styles.priceArea, hasLineAdjustments ? styles.priceAreaWithDiscount : {}]}>
        {
          hasLineAdjustments &&
          <>
            <Text style={styles.deemphasizedText}>{originalUnitPrice}</Text>
            { line.lineAdjustments.map(renderLineAdjustment) }
            <View style={styles.itemAdjustmentsSeparator}/>
          </>
        }
        <Text style={styles.itemPrice}>{
          hasLineAdjustments
            ? line.unitPriceExcludingTransactionDiscounts.amount.toLocaleString(getStoreLocale(),
              getStoreLocaleCurrencyOptions())
              : originalUnitPrice
        }</Text>
      </View>
    </View>
  );
};

const mapStateToProps = (state: AppState): StateProps => {
  return {
    configManager: state.settings && state.settings.configurationManager,
    retailLocationLocale: state.settings.primaryLanguage
  };
};

export default connect(mapStateToProps)(SCOItemLine);
