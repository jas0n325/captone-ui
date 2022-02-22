import Theme from "../../styles";


const phoneTransactionDisplayStyles = () => {
  const { colors, padding, spacing } = Theme.styles;
  return {
    headerLine: {
      paddingHorizontal: padding.md - 4
    },
    transactionData: {
      alignItems: "flex-start",
      flexDirection: "column",
      justifyContent: "center"
    },
    transactionNumberText: {
      paddingBottom: padding.xs - 1
    },
    transactionDateText: {
      color: colors.darkGrey,
      paddingBottom: padding.sm
    },
    separator: {
      marginBottom: padding.sm
    },
    deviceRow: {
    },
    titleText: {
      paddingTop: 0
    },
    foreignDescriptionText: {
      paddingLeft: spacing.md
    }
  };
};

const tabletTransactionDisplayStyles = () => {
  const { colors, fonts, miscellaneous, padding, spacing } = Theme.styles;
  const descriptionTextPadding = padding.md * padding.sm + padding.xxl + padding.xs + 2;
  return {
    header: {
      borderRadius: padding.sm - 2,
      margin: padding.sm - 2,
      marginBottom: 0
    },
    headerLine: {
      paddingHorizontal: padding.sm - 2
    },
    transactionData: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    transactionNumberText: {
      fontSize: fonts.fontSize.tl
    },
    customerText: {
      paddingBottom: padding.md - 4
    },
    transactionDateText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm,
      paddingBottom: padding.md - 4
    },
    deviceRow: {
      flex: 2,
      paddingTop: 2
    },
    titleText: {
      paddingTop: padding.md - 4
    },
    listHeader: {
      padding: padding.sm - 2,
      marginTop: padding.md - 4
    },
    row: {
      paddingLeft: miscellaneous.screen.paddingLeft
    },
    descriptionText: {
      paddingLeft: descriptionTextPadding
    },
    foreignDescriptionText: {
      paddingLeft: descriptionTextPadding + spacing.md
    }
  };
};

export const transactionDisplayStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding, spacing, textAlign } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...textAlign,
    ...miscellaneous,
    scroll: {
      ...miscellaneous.fill
    },
    header: {
      backgroundColor: colors.white
    },
    headerLine: {
      alignSelf: "stretch",
      justifyContent: "center"
    },
    separator: {
      borderColor: colors.borderColor,
      borderBottomWidth: 1
    },
    transactionRow: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    transactionNumberText: {
      color: colors.black,
      fontSize: fonts.fontSize.tl,
      paddingBottom: padding.sm - 2,
      paddingTop: padding.md - 4
    },
    customerText: {
      color: colors.black,
      flex: 1,
      fontSize: fonts.fontSize.fm,
      paddingBottom: padding.sm - 2
    },
    transactionDateText: {
      flex: 1,
      fontSize: fonts.fontSize.sm - 1
    },
    transactionDetail: {
      alignItems: "flex-start",
      flex: 1,
      justifyContent: "center"
    },
    titleText: {
      color: colors.darkGrey,
      flex: 1,
      fontSize: fonts.fontSize.md - 1,
      paddingTop: padding.sm - 2
    },
    transactionText: {
      color: colors.black,
      flex: 1,
      fontSize: fonts.fontSize.fm,
      paddingBottom: padding.md - 4
    },
    listHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs - 1,
      padding: padding.md - 4,
      paddingBottom: padding.xs - 1
    },
    listHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    descriptionCell: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderRadius: padding.sm - 2,
      flex: 1,
      marginHorizontal: padding.sm - 2,
      marginVertical: padding.xs - 1,
      padding: padding.sm - 2
    },
    descriptionCellLine: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between"
    },
    itemDescriptionCell: {
      flex: 1.2
    },
    itemReturnPrice: {
      flex: 1,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xss
    },
    itemReturnPriceText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs - 1,
      fontWeight: fonts.fontWeight.regular
    },
    itemAmountCell: {
      flex: 1
    },
    itemAttribute: {
      paddingRight: padding.md
    },
    pricePadding: {
      paddingRight: padding.sm
    },
    itemDescriptionText: {
      color: colors.black,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.regular
    },
    itemDetailsText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.xs - 1
    },
    itemQuantityText: {
      ...textAlign.tar,
      color: colors.black,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingTop: padding.xs - 1
    },
    amountCell: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "flex-end"
    },
    itemPriceText: {
      ...textAlign.tar,
      color: colors.black,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingTop: padding.xs - 1
    },
    discountText: {
      color: colors.itemDiscountsText
    },
    activeUnitPriceText: {
      color: colors.itemDiscountsText
    },
    discountCellLine: {
      alignItems: "center",
      alignSelf: "stretch",
      borderColor: colors.grey,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      justifyContent: "center",
      marginTop: padding.xs - 1,
      paddingBottom: padding.xs - 1
    },
    row: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: padding.xs - 1,
      paddingHorizontal: padding.md - 4
    },
    descriptionText: {
      flex: 3,
      fontSize: fonts.fontSize.sm - 1
    },
    foreignDescriptionText: {
      flex: 3,
      fontSize: fonts.fontSize.sm - 2,
      color: colors.darkGrey
    },
    amountText: {
      ...textAlign.tar,
      alignSelf: "stretch",
      fontSize: fonts.fontSize.sm - 1
    },
    tagLine: {
      alignItems: "center",
      alignSelf: "stretch",
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: padding.xs - 1,
      paddingTop: padding.xs - 1
    },
    taxOverrideLine: {
      flexDirection: "row",
      justifyContent: "center",
      alignContent: "center"
    },
    taxOverrideColumnAlign: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignContent: "center"
    },
    leftColumn: {
      flex: 1.8
    },
    rightColumn: {
      flex: 1
    }
  }, Theme.isTablet ? tabletTransactionDisplayStyles() : phoneTransactionDisplayStyles());
};

export const baseViewFill = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
