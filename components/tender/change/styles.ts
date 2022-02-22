import Theme from "../../../styles";

export const tenderChangeStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding, spacing } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    textInput: {
      alignSelf: "stretch"
    },
    textInputError: {
      paddingLeft: padding.xs,
      paddingBottom: padding.xs
    },
    button: {
      justifyContent: "center"
    },
    activeTabStyle: {
      backgroundColor: colors.action
    },
    activeTabTextStyle: {
      color: colors.white
    },
    tabStyle: {
      borderColor: colors.action,
      marginTop: padding.sm,
      padding: padding.sm
    },
    controlArea: {
      marginBottom: padding.sm
    },
    inputDisabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    },
    tabTextStyle: {
      color: colors.action
    },
    topSection: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      width: "100%",
      borderColor: colors.lightGrey,
      borderBottomWidth: 2
    },
    totalArea: {
      justifyContent: "center",
      alignItems: "center",
      paddingTop: padding.md,
      paddingBottom: padding.sm
    },
    totalText: {
      fontSize: fonts.fontSize.sm,
      paddingBottom: padding.xxs,
      color: colors.darkGrey
    },
    totalAmountText: {
      fontSize: fonts.fontSize.tl,
      fontWeight: fonts.fontWeight.semibold
    },
    paddingBottom: {
      paddingBottom: padding.md - padding.xs,
      backgroundColor: colors.white
    },
    buttonsSection: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      width: "98%",
      borderColor: colors.lightGrey,
      borderBottomWidth: 2
    },
    paymentMethodContainer: {
      alignSelf: "stretch",
      padding: padding.sm,
      paddingBottom: padding.md,
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderBottomWidth: 2,
      marginBottom: padding.md
    },
    scrollContainer: {
      alignSelf: "stretch"
    },
    paymentMethodButton: {
      ...buttons.btnSeconday,
      marginTop: padding.sm
    },
    paymentMethodButtonDetailed: {
      ...buttons.btnPrimaryDetailed,
      width: "100%",
      backgroundColor: colors.white,
      marginTop: padding.sm
    },
    paymentButtonTitle: {
      ...buttons.btnSecondayText
    },
    paymentButtonSubTitle: {
      ...buttons.btnSecondayText,
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      paddingTop: padding.xs
    },
    footerContainer: {
      width: "100%",
      alignItems: "center"
    },
    footerArea: {
      marginHorizontal: spacing.xs,
      marginTop: spacing.sm,
      maxWidth: 521
    }
  }, Theme.isTablet ? tabletTenderChangeStyle() : phoneTenderChangeStyle());
};

export const tabletTenderChangeStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white,
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "flex-start",
      paddingTop: padding.sm,
      paddingBottom: padding.sm,
      width: 350
    },
    actions: {
      margin: 0,
      marginTop: padding.md - padding.xxs,
      width: "100%"
    },
    button: {
      marginBottom: padding.sm - 2,
      width: "100%"
    }
  };
};

export const phoneTenderChangeStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    actions: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flexDirection: "row",
      padding: padding.md - padding.xxs,
      paddingLeft: 0
    },
    button: {
      flex: 1,
      marginLeft: padding.md - padding.xxs
    }
  };
};
