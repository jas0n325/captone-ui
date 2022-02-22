import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../styles";

export const itemSubscriptionScreenTabletStyles = () => {
  const { colors } = Theme.styles;

  return {
    root: {
      backgroundColor: colors.white
    },
    list: {
      marginTop: 0,
      flexGrow: 0
    }
  };
}

export const itemSubscriptionScreenStyle = (isCheckout?: boolean) => {
  const { buttons, colors, miscellaneous, spacing } = Theme.styles;
  let tabletStyles;

  if (Theme.isTablet) {
    tabletStyles = Theme.merge(
      itemSubscriptionScreenTabletStyles(),
      isCheckout ? itemSubscriptionScreenCheckoutTabletStyles() : {}
    );
  }

  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      paddingBottom: getBottomSpace()
    },
    actions: {
      ...miscellaneous.panel,
      paddingTop: spacing.sm,
      marginBottom: spacing.xs
    },
    button: {
      justifyContent: "center",
      marginBottom: spacing.xs
    },
    list: {
      marginTop: spacing.md
    },
    contentContainerStyle: Theme.isTablet ? {
      flexGrow: 1
    } : {
      flex: 1
    }
  }, tabletStyles);
}

export const itemSubscriptionScreenCheckoutTabletStyles = () => {
  const { colors, spacing } = Theme.styles;

  return {
    root: {
      backgroundColor: colors.lightGrey,
      alignItems: "center"
    },
    list: {
      flexWrap: "wrap",
      marginTop: spacing.md
    }
  };
}

export const subscribableItemLineTabletStyles = () => {
  const { colors, spacing } = Theme.styles;

  return {
    item: {
      backgroundColor: colors.white,
      marginHorizontal: 0,
      marginTop: 0,
      marginBottom: 0,
      padding: 0,
      borderRadius: 0,
      elevation: 0
    },
    switchPanel: {
      maxWidth: "100%",
      paddingRight: spacing.sm + 3
    }
  }
};

export const subscribableItemLineStyle = (isCheckout?: boolean) => {
  const { buttons, colors, fonts, forms, miscellaneous, spacing, textAlign } = Theme.styles;
  let tabletStyles;

  if (Theme.isTablet) {
    tabletStyles = Theme.merge(
      subscribableItemLineTabletStyles(),
      isCheckout ? subscribableItemLineCheckoutTabletStyles() : {}
    );
  }

  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    item: {
      backgroundColor: colors.white,
      marginHorizontal: spacing.xs,
      marginBottom: spacing.xs,
      padding: spacing.xs,
      borderRadius: 5,
      shadowOpacity: 0.24,
      shadowOffset:{ width: 0, height: 0 },
      shadowRadius: 1,
      elevation: 1
    },
    detailRow: {
      flexDirection: "row",
      marginBottom: spacing.xxs
    },
    imageArea: {
      width: 62,
      marginRight: spacing.sm
    },
    imageSize: {
      height: 64,
      width: 62
    },
    detailArea: {
      ...miscellaneous.fill
    },
    itemDescription: {
      color: fonts.color,
      fontSize: fonts.fontSize.md
    },
    itemDetailText: {
      fontSize: fonts.fontSize.nw,
      color: colors.darkestGrey
    },
    attributes: {
      flexDirection: "column"
    },
    quantityPriceRow: {
      flexDirection: "row",
      paddingTop: spacing.xs,
      paddingBottom: spacing.md,
      justifyContent: "space-between",
      ...miscellaneous.fill
    },
    quantity: {
      width: 62,
      backgroundColor: colors.lighterGrey
    },
    quantityText: {
      fontSize: fonts.fontSize.fm,
      color: fonts.color,
      paddingVertical: spacing.sm,
      ...textAlign.tac
    },
    price: {
      justifyContent: "center",
      marginRight: spacing.xs,
      fontSize: fonts.fontSize.md
    },
    originalPrice: {
      color: fonts.color,
      ...textAlign.tar
    },
    lineThroughOriginalPrice: {
      fontSize: fonts.fontSize.xs,
      textDecorationLine: "line-through",
      textDecorationStyle: "solid",
      color: colors.darkestGrey
    },
    newPrice: {
      color: colors.good,
      ...textAlign.tar
    },
    subscribe: {
      flexDirection: "row"
    },
    subscribeMessageText: {
      color: fonts.color,
      fontSize: fonts.fontSize.md
    },
    amountToSave: {
      fontSize: fonts.fontSize.nw,
      color: colors.darkestGrey
    },
    switchPanel: {
      justifyContent: "center",
      // Would prefer to not have to subtract, but the components are a couple pixels too far to the right
      paddingLeft: spacing.xs - 2,
      paddingRight: spacing.xs,
      ...forms.input
    },
    switch: {
      backgroundColor: colors.action
    },
    inputContainer: {
      ...miscellaneous.fill,
      paddingLeft: 0
    },
    input: {
      ...miscellaneous.fill,
      paddingLeft: spacing.xs - 2
    },
    persistPlaceholderStyle: {
      paddingLeft: spacing.xs - 2
    }
  }, tabletStyles);
};

export const subscribableItemLineCheckoutTabletStyles = () => {
  const { colors, forms, spacing } = Theme.styles;

  return {
    item: {
      backgroundColor: colors.white,
      marginHorizontal: spacing.xs,
      marginBottom: spacing.xs,
      padding: spacing.xs,
      borderRadius: 5,
      shadowOpacity: 0.24,
      shadowOffset:{ width: 0, height: 0 },
      shadowRadius: 1,
      elevation: 1,
      width: 560
    },
    switchPanel: {
      justifyContent: "center",
      paddingLeft: spacing.xs - 2,
      paddingRight: 0,
      ...forms.input
    },
    quantityPriceRow: {
      maxWidth: "50%",
      flex: 0.5
    },
    subscribeMessage: {
      padding: 0
    }
  }
};

export const subscriptionAuthorizationStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding, spacing } = Theme.styles;

  return {
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.screen,
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    tokenContainer: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      padding: padding.sm
    },
    buttonContainer: {
      paddingTop: padding.sm
    },
    cardButton: {
      ...buttons.btnPrimary,
      marginVertical: padding.xs
    },
    removeButton: {
      ...buttons.btnSeconday,
      marginBottom: padding.sm
    },
    summaryContainer: {
      backgroundColor: colors.lighterGrey,
      marginTop: padding.md,
      marginHorizontal: spacing.xs
    },
    titleSection: {
      alignSelf: "stretch",
      flexDirection: "row",
      paddingBottom: spacing.xs,
      borderColor: colors.darkGrey,
      borderBottomWidth: 1
    },
    titleText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      marginLeft: spacing.xs
    },
    detailsText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm,
      marginLeft: spacing.xs
    }
  };
}
export const subscriptionSummaryDetailsStyles = () => {
  const { colors, fonts, padding, spacing, textAlign } = Theme.styles;

  return {
    root: {
      alignSelf: "stretch",
      padding: padding.xs,
      paddingHorizontal: padding.sm,
      backgroundColor: colors.lighterGrey,
      borderColor: colors.borderColor,
      borderTopWidth: 2
    },
    topSection: {
      alignSelf: "stretch",
      flexDirection: "row",
      paddingVertical: spacing.xxs,
      borderColor: colors.grey
    },
    section: {
      paddingVertical: spacing.xs,
      borderColor: colors.lightGrey,
      borderTopWidth: 1
    },
    topText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.md,
      fontWeight: fonts.fontWeight.semibold,
      paddingBottom: spacing.xxs
    },
    addressRow: {
      flexDirection: "row",
      alignSelf: "stretch"
    },
    detailsRow: {
      flexDirection: "row",
      alignSelf: "stretch",
      marginTop: spacing.xs
    },
    detailsText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.sm
    },
    subDetailsText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.xs
    },
    amountText: {
      ...textAlign.tar,
      flex: 1,
      paddingLeft: spacing.sm
    }
  };
};
