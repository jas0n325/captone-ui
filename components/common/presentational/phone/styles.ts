import Theme from "../../../../styles";


export const transactionTotalsFooterStyles = () => {
  const { colors, fonts, spacing, textAlign } = Theme.styles;

  return {
    root: {
      alignSelf: "stretch",
      padding: spacing.xs,
      backgroundColor: colors.lighterGrey,
      borderColor: colors.darkerGrey,
      borderTopWidth: 2
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
      padding: spacing.xs,
      backgroundColor: colors.lighterGrey,
      borderColor: colors.darkGrey,
      borderTopWidth: 2
    },
    topSection: {
      alignSelf: "stretch",
      flexDirection: "row",
      paddingBottom: spacing.xs,
      borderColor: colors.grey
    },
    section: {
      paddingBottom: spacing.sm
    },
    returnLabelSection: {
      borderColor: colors.grey,
      borderBottomWidth: 1
    },
    tenderText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm,
      fontWeight: fonts.fontWeight.semibold,
      paddingBottom: spacing.xxs
    },
    labelAndAmountRow: {
      flexDirection: "row",
      alignSelf: "stretch",
      marginTop: spacing.xs
    },
    labelAndAmountText: {
      color: colors.black,
      fontSize: fonts.fontSize.sm
    },
    amountText: {
      ...textAlign.tar,
      flex: 1,
      paddingLeft: spacing.sm
    }
  };
};
