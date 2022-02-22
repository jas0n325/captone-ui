import Theme from "../../styles";

export const tabletFastDiscountStyles = () => {
  const { buttons, colors, miscellaneous, padding } = Theme.styles;
  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    button: {
      marginVertical: padding.md - padding.xs,
      justifyContent: "center"
    },
    discountPanel: {
      paddingHorizontal: padding.sm
    },
    priceChangePanel: {
      paddingHorizontal: padding.sm
    }
  };
};

export const phoneFastDiscountStyles = () => {
  return {};
};

export const fastDiscountStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    btnDiscountAmounts: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.white,
      marginRight: padding.sm,
      paddingHorizontal: padding.sm,
      marginTop: padding.sm
    },
    discountButtonText: {
      ...buttons.btnSecondayText,
      fontSize: fonts.fontSize.xs
    },
    buttonWrapper: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    buttonWrapperBorder: {
      paddingBottom: padding.sm + padding.xs,
      marginBottom: padding.sm - padding.xs,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1
    },
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    inputPanel: {
      alignSelf: "stretch"
    },
    formArea: {
      alignItems: "center",
      alignSelf: "stretch",
      justifyContent: "flex-start",
      paddingTop: Theme.isTablet ? 0 : padding.xs,
      paddingBottom: padding.xs
    },
    inputFormArea: {
      alignSelf: "stretch"
    },
    discountPanel: {
      backgroundColor: colors.white,
      alignSelf: "stretch",
      marginTop: padding.sm - padding.xs,
      marginBottom: padding.sm,
      paddingHorizontal: padding.md,
      paddingVertical: padding.sm + padding.xs
    },
    priceChangeText: {
      color: fonts.color,
      fontSize: fonts.fontSize.md,
      fontWeight: fonts.fontWeight.regular,
      marginBottom: padding.sm + padding.xs
    },
    newPriceText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs,
      fontWeight: fonts.fontWeight.regular
    },
    priceChangePanel: {
      backgroundColor: colors.white,
      alignSelf: "stretch",
      paddingHorizontal: padding.md,
      paddingTop: padding.sm + padding.xs,
      marginBottom: padding.sm + padding.xs
    },
    actions: {
      ...miscellaneous.panel,
      margin: padding.md - padding.xs
    },
    discountText: {
      color: fonts.color,
      fontSize: fonts.fontSize.md,
      fontWeight: fonts.fontWeight.regular,
      marginBottom: padding.sm
    }
  }, Theme.isTablet ? tabletFastDiscountStyles() : phoneFastDiscountStyles());
};
