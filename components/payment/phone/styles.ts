import Theme from "../../../styles";

export const paymentStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;
  return ({
    ...buttons,
    root: {
      ...miscellaneous.fill,
      alignItems: "stretch",
      backgroundColor: colors.lightGrey
    },
    keyboardAwareScrollView: {
      ...miscellaneous.fill
    },
    topSection: {
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: colors.white,
      paddingTop: padding.sm
    },
    paymentTextArea: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: padding.sm
    },
    totalDueTitle: {
      fontSize: fonts.fontSize.xs
    },
    totalDueAmount: {
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.semibold
    },
    paymentTitle: {
      alignSelf: "stretch",
      marginTop: padding.md - 4,
      marginHorizontal: padding.md
    },
    paymentLabel: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    balanceInput: {
      ...forms.input,
      ...forms.inputText,
      alignSelf: "stretch",
      marginTop: padding.xs,
      marginHorizontal: padding.md
    },
    errorStyle: {
      ...forms.inputErrorText,
      backgroundColor: colors.white,
      padding: padding.sm,
      alignSelf: "stretch",
      marginTop: padding.xs,
      marginHorizontal: padding.md
    },
    exchangeRate: {
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.sm,
      paddingLeft: 0,
      textAlign: "left",
      paddingTop: padding.xs - 1,
      color: colors.darkestGrey,
      backgroundColor: colors.white,
      paddingRight: padding.sm,
      alignSelf: "stretch",
      marginTop: padding.xs,
      marginHorizontal: padding.md
    },
    enteredExchangeRate: {
      paddingLeft: padding.md
    },
    inputTextError: {
      ...forms.inputError
    },
    placeholderStyle: {
      color: colors.placeholderTextColor
    },
    paymentMethodContainer: {
      flexDirection: "column",
      justifyContent : "center",
      alignItems:  "center",
      width: "100%",
      padding: padding.sm
    },
    paymentMethodButton: {
      ...buttons.btnPrimary,
      width: "100%",
      backgroundColor: colors.white,
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
    bottomSection: {
      flex: 3
    },
    detailsArea: {
      flex: 1,
      flexDirection: "row",
      padding: padding.md - 4,
      paddingBottom: padding.xs
    },
    detailsSide: {
      flex: 1,
      justifyContent: "space-evenly"
    },
    detailsRightSide: {
      alignItems: "flex-end"
    },
    detailsText: {
      fontSize: fonts.fontSize.xs
    },
    button: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm
    },
    footerArea: {
      alignSelf: "stretch",
      marginHorizontal: spacing.xs,
      marginTop: spacing.sm
    },
    suggestedTendersSection: {
      alignSelf: "stretch",
      borderColor: colors.grey,
      borderTopWidth: 1
    },
    originalReferencedTenderSection: {
      borderColor: colors.grey,
      borderBottomWidth: 1,
      paddingBottom: spacing.xs
    },
    sectionTitleText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      marginLeft: spacing.xs,
      marginTop: spacing.xxs,
      fontWeight: fonts.fontWeight.semibold
    },
    topBorder: {
      borderTopWidth: 1,
      borderColor: colors.grey,
      marginTop: spacing.lg
    },
    menuIcon: {
      color: colors.navigationText,
      fontSize: fonts.fontSize.lg,
      paddingTop: spacing.xxs
    },
    disabledInput: {
      backgroundColor: colors.lightGrey,
      color: colors.darkGrey
    },
    exchangeRateEntry: {
      alignSelf: "stretch",
      marginHorizontal: -padding.md
    }
  });
};

