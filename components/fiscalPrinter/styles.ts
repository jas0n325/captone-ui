import Color = require("color");
import Theme from "../../styles";
export const fiscalPrinterScreenStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding, textAlign } = Theme.styles;
  return {
    ...buttons,
    ...miscellaneous,
    ...textAlign,
    root: {
      flex: 1,
      backgroundColor: colors.lightGrey
    },
    tabletRoot: {
      flex: 1,
      backgroundColor: colors.lightGrey,
      ...miscellaneous.screen
    },
    footerContainer: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      height: "32%",
      justifyContent: "flex-start",
      marginTop: padding.md
    },
    buttonsArea: {
      flexDirection: "column",
      marginTop: padding.sm
    },
    printButton: {
      ...buttons.btnPrimary,
      width: "100%",
      marginTop: padding.sm,
      borderRadius: padding.xs
    },
    printReportButtonMargin: {
      marginBottom: padding.sm
    },
    syncDataToPrinterStyle: {
      paddingTop: fonts.fontSize.sm,
      fontSize: fonts.fontSize.sm,
      paddingBottom: padding.xs
    },
    paddingStyle: {
      paddingVertical: padding.xxs,
      paddingHorizontal: padding.md
    },
    containerView: {
      flex: 0.47,
      flexDirection: "column",
      justifyContent : "center",
      alignItems:  "center",
      width: "100%",
      padding: padding.sm,
      marginBotton: padding.md,
      backgroundColor: colors.white
    },
    errorContainer: {
      flex: .25,
      alignItems: "stretch",
      backgroundColor: Color(colors.bad).alpha(0.1).toString(),
      borderLeftWidth: padding.xs,
      borderColor: colors.bad,
      margin: !Theme.isTablet ? padding.sm : 0,
      paddingBottom: padding.xs,
      paddingRight: padding.xs
    },
    errorMessageView: {
      flex: 1,
      flexDirection: "row",
      marginLeft: padding.xs,
      marginRight: padding.sm,
      paddingRight: padding.sm
    },
    errorMessageText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.sm,
      textAlign: "left",
      justifyContent: "center",
      lineHeight: padding.md,
      padding: padding.xs,
      paddingRight: padding.xs
    },
    imageView: {
      margin: padding.xs
    },
    indicatorPanel: {
      marginBottom: padding.md
    },
    modalBackground: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.grey
    },
    activityIndicatorContainerView: {
      backgroundColor: colors.white,
      width: "72%",
      borderRadius: padding.xs,
      alignSelf: "center",
      flex: 0.20,
      flexDirection: "column",
      justifyContent: "space-evenly"
    },
    printingText: {
      textAlign: "center",
      fontWeight: fonts.fontWeight.bold
    },
    spinnerStyle: {
      justifyContent: "center"
    },
    button: {
      width: "63%",
      alignSelf: "center"
    },
    actions: {
      ...miscellaneous.panel,
      marginTop: padding.sm
    },
    fiscalFooterContainer: {
      alignItems: "space-between",
      alignSelf: "stretch",
      marginBottom: padding.xs,
      backgroundColor: colors.white,
      paddingLeft: padding.sm,
      paddingRight: padding.sm,
      paddingTop: padding.sm
    },
    feedBackNote: {
      backgroundColor: colors.white,
      marginHorizontal: padding.sm,
      marginTop: padding.sm,
      paddingTop: padding.xs
    },
    documentNumberTextArea: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: padding.sm,
      marginBottom: padding.sm
    },
    container: {
      flex: 1,
      alignItems: "stretch"
    },
    iconStyle: {
      cautionColor: colors.bad,
      successColor: colors.good,
      height: padding.md,
      width: padding.md
    }
  };
};

export const fiscalConfigScreenStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding, textAlign } = Theme.styles;
  return {
    ...buttons,
    ...miscellaneous,
    ...textAlign,
    root: {
      flex: 1,
      backgroundColor: colors.lightGrey
    },
    tabletRoot: {
      flex: 1,
      backgroundColor: colors.lightGrey,
      ...miscellaneous.screen
    },
    errorMessageView: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      marginLeft: padding.xs,
      marginRight: padding.sm,
      paddingRight: padding.sm
    },
    errorMessageText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.sm,
      textAlign: "left",
      lineHeight: padding.md,
      padding: padding.xs
    },
    imageView: {
      height: padding.md,
      width: padding.md,
      margin: padding.xs
    },
    terminalErrorView: {
      alignSelf: "stretch",
      backgroundColor: Color(colors.bad).alpha(0.1).toString(),
      borderLeftWidth: padding.xs,
      borderColor: colors.bad,
      margin: padding.sm,
      paddingTop: padding.xs,
      paddingBottom: padding.xs,
      paddingRight: padding.xs
    },
    errorDescView: {
      alignItems: "flex-start",
      margin: padding.xs,
      marginLeft: padding.xl
    },
    errorDescriptionText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.xs,
      textAlign: "left"
    }
  };
};
