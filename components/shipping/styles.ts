import Theme from "../../../ui/styles/index";

export const tabletShippingMethodsStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    optionsRoot: {
      ...miscellaneous.screen
    },
    spinnerContainer: {
      alignItems: "center",
      justifyContent: "center"
    }
  };
};

export const shippingMethodsStyles = () => {
  const { colors, fonts, miscellaneous, padding, buttons } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill
    },
    optionsRoot: {
      backgroundColor: colors.white,
      paddingHorizontal: padding.md,
      ...miscellaneous.fill
    },
    shippingMethodChoiceText: {
       ...buttons.btnSecondayText
    },
    shippingMethodChoiceButtonText: {
      color: colors.black,
      fontSize: fonts.fontSize.md
    },
    normalText: {
      marginTop: padding.sl,
      color: colors.borderColor,
      fontSize: fonts.fontSize.sm
    },
    row: {
      alignItems: "stretch",
      flex: 1,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignSelf: "stretch"
    },
    shippingMethodChoiceButton: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: padding.sm,
      paddingRight: padding.sm,
      backgroundColor: colors.white,
      fontSize: fonts.fontSize.sm,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1
    },
    resultHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xm,
      padding: padding.md ,
      paddingBottom: padding.xs
    },
    resultHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    checkIcon: {
      fontSize: fonts.fontSize.tl
    },
    spinnerContainer: {
      marginVertical: padding.lg
    }}, Theme.isTablet ? tabletShippingMethodsStyles() : {}
  );
};
