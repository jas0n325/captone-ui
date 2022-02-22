import Theme from "../../../styles";


export const paymentStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing, textAlign } = Theme.styles;
  return ({
    ...buttons,
    ...miscellaneous,
    ...textAlign,
    ...forms,
    root: {
      ...miscellaneous.fill,
      ...miscellaneous.statusBarHeight,
      flexDirection: "row"
    },
    leftPanel: {
      ...miscellaneous.actionPanel,
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      borderRightColor:  colors.grey,
      borderRightWidth: 1,
      justifyContent: "center"
    },
    rightPanel: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flex: 1,
      justifyContent: "center"
    },
    header: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      height: forms.input.height,
      justifyContent: "center",
      padding: padding.xs - 1
    },
    headerLogo: {
      alignSelf: "stretch",
      flex: 1,
      width: undefined,
      height: undefined
    },
    transaction: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.lighterGrey,
      borderBottomColor:  colors.grey,
      borderBottomWidth: 1,
      flexDirection: "row",
      height: forms.input.height,
      justifyContent: "space-between"
    },
    transactionLeft: {
      alignItems: "center",
      alignSelf: "flex-start",
      flex: 1,
      height: forms.input.height,
      justifyContent: "center",
      marginLeft: padding.md - 4,
      marginRight: padding.xl
    },
    transactionRight: {
      alignItems: "center",
      alignSelf: "flex-end",
      height: forms.input.height,
      flex: 2,
      justifyContent: "center",
      marginRight: padding.md - 4
    },
    transactionPanel: {
      alignItems: "center",
      alignSelf: "stretch",
      flex: 1,
      flexDirection: "column",
      justifyContent: "center"
    },
    transactionTextTitle: {
      alignSelf: "stretch",
      color: colors.black,
      fontSize: fonts.fontSize.xs
    },
    transactionTextValue: {
      alignSelf: "stretch",
      color: colors.black,
      fontSize: fonts.fontSize.md,
      fontWeight: "bold"
    },
    titleArea: {
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      height: forms.input.height * 2,
      justifyContent: "flex-end",
      paddingBottom: padding.sm,
      paddingLeft: padding.md - 4
    },
    titleText: {
      alignSelf: "flex-start",
      color: colors.loginAndHeaderText,
      fontSize: fonts.fontSize.lg + 2,
      fontWeight: fonts.fontWeight.bold
    },
    topSection: {
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "flex-start",
      paddingTop: padding.md,
      paddingBottom: padding.sm,
      width: 350
    },
    paymentTextArea: {
      alignItems: "center"
    },
    totalDueTitle: {
      fontSize: fonts.fontSize.sm
    },
    totalDueAmount: {
      fontSize: fonts.fontSize.bt + 1,
      fontWeight: fonts.fontWeight.bold
    },
    paymentTitle: {
      alignSelf: "stretch",
      marginTop: padding.md - 4
    },
    paymentLabel: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    balanceInput: {
      ...forms.input,
      ...forms.inputText,
      alignSelf: "stretch",
      fontSize: fonts.fontSize.fm,
      marginTop: padding.xs
    },
    errorStyle: {
      ...forms.inputErrorText,
      backgroundColor: colors.white,
      paddingBottom: padding.sm,
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
      alignSelf: "stretch",
      padding: padding.sm
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
    tenderArea: {
      ...miscellaneous.fill,
      alignSelf: "center",
      paddingVertical: padding.sm,
      width: 350
    },
    bottomSection: {
      flex: 3
    },
    detailsArea: {
      flex: 1,
      flexDirection: "row",
      padding: padding.md - 4,
      paddingTop: 0
    },
    issueArea: {
      padding: padding.md - 4
    },
    detailsSide: {
      flex: 1,
      justifyContent: "space-evenly"
    },
    detailsRightSide: {
      alignItems: "flex-end"
    },
    detailsText: {
      fontSize: fonts.fontSize.sm,
      paddingTop: padding.sm - 2
    },
    bottomPanel: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.lighterGrey,
      borderTopColor:  colors.grey,
      borderTopWidth: 1,
      flexDirection: "row",
      height: 100,
      justifyContent: "space-evenly",
      paddingVertical: padding.xs + 1
    },
    btnAction: {
      ...buttons.btnTertiary,
      backgroundColor: colors.lighterGrey,
      fontSize: fonts.fontSize.bt,
      height: 88,
      width: 88,
      justifyContent: "flex-start"
    },
    btnActionText: {
      fontSize: fonts.fontSize.sm
    },
    btnDisabled: {
      ...buttons.btnDisabled,
      backgroundColor: colors.lighterGrey
    },
    button: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm
    },
    cancelButton: {
      marginHorizontal: padding.sm
    },
    footerArea: {
      alignSelf: "stretch",
      marginHorizontal: spacing.xs,
      marginTop: spacing.sm
    },
    suggestedTendersSection: {
      alignSelf: "stretch"
    },
    originalReferencedTenderSection: {
      borderColor: colors.grey,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      paddingBottom: spacing.xs
    },
    sectionTitleText: {
      color: colors.darkerGrey,
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
    buttonArea: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end"
    },
    rightButton: {
      marginRight: spacing.sm
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
      marginHorizontal: -padding.md,
      marginBottom: spacing.sm
    }
  });
};

