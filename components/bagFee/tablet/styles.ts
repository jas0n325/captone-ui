import Theme from "../../../styles";


export const bagFeeStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing, textAlign } = Theme.styles;

  return {
    ...buttons,
    ...miscellaneous,
    ...textAlign,
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
      justifyContent: "flex-start"
    },
    rightPanel: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flex: 1,
      justifyContent: "flex-start"
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
      flex: 1,
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
    bottomSection: {
      flex: 3
    },
    detailsArea: {
      flex: 1,
      flexDirection: "row",
      padding: padding.md - 4,
      paddingTop: 0
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
      paddingTop: padding.md - 4
    },
    controlsArea: {
      alignSelf: "stretch",
      minHeight: 356,
      paddingHorizontal: "25%",
      paddingTop: padding.md - 4
    },
    bagFeeExplainedText: {
      fontSize: fonts.fontSize.sm - 1,
      color: colors.darkerGrey
    },
    quantityControls: {
      alignItems: "center",
      borderColor: colors.darkGrey,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      height: forms.input.height,
      paddingHorizontal: padding.md - 4,
      marginTop: padding.lg,
      width: "100%"
    },
    generalText: {
      fontSize: fonts.fontSize.fm,
      color: colors.black
    },
    generalTextArea: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.sm - 2
    },
    generalButton: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: padding.sm - 2
    },
    feedbackNoteContainer: {
      marginTop: spacing.md,
      marginBottom: spacing.sm + 1
    },
    disabledText: {
      color: colors.darkGrey
    }
  };
};
