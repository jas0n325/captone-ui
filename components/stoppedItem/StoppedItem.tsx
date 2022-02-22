import * as React from "react";
import { Text, TouchableOpacity } from "react-native";

import { Status } from "@aptos-scp/scp-component-store-items";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import Header from "../common/Header";
import ItemLine from "../common/ItemLine";
import { StoppedItemProps } from "./interfaces";
import { stoppedItemScreenStyles } from "./styles";
import { NavigationProp } from "../StackNavigatorParams";

interface Props extends StoppedItemProps {
  navigation: NavigationProp;
}

const StoppedItem = (props: Props): JSX.Element => {
  const styles = Theme.getStyles(stoppedItemScreenStyles());

  const sellSoftStopItem = () =>
    props.onSellSoftStoppedItem(
      props.stoppedItem.itemIdKey,
      props.stoppedItem.itemIdKeyType
    );

  return (
    <BaseView style={styles.root}>
      <Header
        title={I18n.t(
          props.stoppedItemStatus === Status.HardStop
            ? "hardStopItem"
            : "softStopItem"
        )}
        backButton={{
          name: "Back",
          action: props.onResetFromStoppedItem
        }}
        rightButton={
          props.stoppedItemStatus === Status.SoftStop && {
            title: I18n.t("addItem"),
            action: sellSoftStopItem
          }
        }
      />
      {!Theme.isTablet && (
        <ItemLine line={props.stoppedItem} hideImage={true} />
      )}
      <Text style={styles.stoppedExplainedText}>
        {I18n.t("itemNotAddedToBasket")}
      </Text>
      <Text style={styles.stoppedExplainedText}>
        <Text style={[styles.stoppedExplainedText, styles.reasonText]}>
          {I18n.t("reason") + ": "}
        </Text>
        <Text style={styles.stoppedExplainedText}>
          {props.stoppedItemStatusMessage}
        </Text>
      </Text>
      {Theme.isTablet && (
        <TouchableOpacity
          style={[styles.button, styles.btnPrimary]}
          onPress={
            props.stoppedItemStatus === Status.HardStop
              ? props.onResetFromStoppedItem
              : sellSoftStopItem
          }
        >
          <Text style={styles.btnPrimaryText}>
            {I18n.t(
              props.stoppedItemStatus === Status.HardStop ? "ok" : "addItem"
            )}
          </Text>
        </TouchableOpacity>
      )}
      {Theme.isTablet && props.stoppedItemStatus === Status.SoftStop && (
        <TouchableOpacity
          style={[styles.button, styles.btnSeconday]}
          onPress={props.onResetFromStoppedItem}
        >
          <Text style={styles.btnSecondayText}>{I18n.t("cancel")}</Text>
        </TouchableOpacity>
      )}
    </BaseView>
  );
};

export default StoppedItem;
