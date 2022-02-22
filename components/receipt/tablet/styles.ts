import Theme from "../../../styles";


export const receiptSummaryScreenStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, textAlign, spacing } = Theme.styles;

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
    detailsArea: {
      flexDirection: "row",
      paddingHorizontal: padding.md - 4
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
    bottomSection: {
      flex: 1,
      justifyContent : "flex-start"
    },
    transactionArea: {
      alignSelf: "stretch",
      padding: 0
    },
    subtitleArea: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      marginTop: padding.sm,
      paddingTop: padding.sm - 2,
      paddingHorizontal: padding.md - 4,
      paddingBottom: padding.sm - 2
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.xs + 1
    },
    itemsTitle: {
      marginBottom: padding.sm
    },
    itemLine : {
      backgroundColor: colors.white,
      borderRadius: padding.sm - 2,
      justifyContent: "space-between",
      margin: padding.sm - 2,
      marginTop: 0,
      padding: padding.sm - 2,
      paddingBottom: padding.xs - 1
    },
    itemLineValue: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    itemDescriptionText: {
      fontSize: fonts.fontSize.md - 1,
      paddingBottom: padding.xs - 1
    },
    itemText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      paddingBottom: padding.xs - 1
    },
    itemAmount: {
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingBottom: padding.xs - 1,
      ...textAlign.tar
    },
    previousUnitPriceText: {
      textDecorationLine: "line-through",
      textDecorationStyle: "solid"
    },
    newUnitPriceText: {
      color: colors.itemDiscountsText
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
    changeDueArea: {
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: colors.white,
      padding: padding.md + 4
    },
    changeDueTitle: {
      fontSize: fonts.fontSize.sm
    },
    changeDueAmount: {
      fontSize: fonts.fontSize.bt + 1,
      fontWeight: fonts.fontWeight.bold
    },
    receiptMethodContainer: {
      alignItems:  "center",
      justifyContent : "flex-start",
      padding: padding.md + 4,
      width: "100%"
    },
    receiptArea: {
      minHeight: 356,
      width: 356
    },
    receiptOptions: {
      backgroundColor: colors.white
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
    }
  });
};
