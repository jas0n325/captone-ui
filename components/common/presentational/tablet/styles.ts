import Theme from "../../../../styles";


export const transactionTotalsFooterStyles = () => {
  const { colors, fonts, spacing, textAlign } = Theme.styles;

  return {
    root: {
      padding: spacing.xs,
      backgroundColor: colors.lighterGrey,
      borderColor: colors.darkerGrey,
      borderTopWidth: 2,
      width: "100%"
    },
    topSection: {
      alignSelf: "stretch",
      flexDirection: "row",
      paddingBottom: spacing.xs,
      borderColor: colors.darkGrey,
      borderBottomWidth: 1
    },
    transactionIcon: {
      color: colors.darkerGrey,
      height: 20,
      width: 20
    },
    transactionNumber: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      marginLeft: spacing.xs
    },
    labelAndAmountRow: {
      flexDirection: "row",
      alignSelf: "stretch",
      marginTop: spacing.xs
    },
    labelAndAmountText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm
    },
    amountText: {
      ...textAlign.tar,
      flex: 1,
      paddingLeft: spacing.sm
    },
    discountText: {
      color: colors.itemDiscountsText
    },
    totalText: {
      color: fonts.color,
      fontWeight: fonts.fontWeight.semibold
    }
  };
};

export const originalTendersFooterStyles = () => {
  const { colors, fonts, spacing, textAlign } = Theme.styles;

  return {
    root: {
      alignSelf: "stretch",
      borderTopWidth: 1,
      borderColor: colors.grey
    },
    topSection: {
      alignSelf: "stretch",
      flexDirection: "row",
      paddingBottom: spacing.xs
    },
    section: {
      paddingBottom: spacing.xs
    },
    returnLabelSection: {
      borderColor: colors.grey,
      borderBottomWidth: 1
    },
    tenderText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm,
      marginLeft: spacing.xs,
      marginTop: spacing.xs,
      fontWeight: fonts.fontWeight.semibold,
      paddingBottom: spacing.xxs
    },
    labelAndAmountRow: {
      flexDirection: "row",
      alignSelf: "stretch",
      marginTop: spacing.xxs
    },
    labelAndAmountText: {
      color: colors.black,
      fontSize: fonts.fontSize.sm,
      marginLeft: spacing.xs
    },
    amountText: {
      ...textAlign.tar,
      fontSize: fonts.fontSize.sm,
      flex: 1,
      paddingRight: spacing.sm
    }
  };
};
