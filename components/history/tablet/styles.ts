import Color = require("color");
import Theme from "../../../styles";


export const salesHistoryStyles = () => {
  const { colors, fonts, miscellaneous, padding, spacing } = Theme.styles;
  return ({
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      paddingBottom: 0,
      paddingHorizontal: "20%",
      paddingTop: padding.md - 4
    },
    header: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "flex-start"
    },
    headerButtonsArea: {
      flexDirection: "row"
    },
    transactionButton: {
      marginLeft: padding.md - 4
    },
    transactionButtonText: {
      color: colors.navigationText,
      fontSize: fonts.fontSize.fm
    },
    list: {
      flex: 1
    },
    listArea: {
      flex: 4
    },
    emptyList: {
      fontSize: fonts.fontSize.tl,
      marginTop: 60,
      textAlign: "center"
    },
    errorContainer: {
      alignItems: "stretch",
      backgroundColor: Color(colors.bad).alpha(0.1).toString(),
      borderLeftWidth: padding.xs,
      borderColor: colors.bad,
      paddingVertical: padding.xs,
      paddingRight: padding.xs,
      marginRight: padding.md,
      marginLeft: padding.md
    },
    errorMessageView: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginLeft: padding.xs,
      marginRight: padding.sm,
      paddingRight: padding.sm
    },
    imageView: {
      height: padding.md,
      width: padding.md,
      margin: padding.xs
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
    inputWrapper: {
      paddingBottom: spacing.md
    }
  });
};

export const transactionHistoryStyles = () => {
  const { buttons, colors, forms, fonts, miscellaneous, padding } = Theme.styles;
  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      flexDirection: "row",
      backgroundColor: colors.lightGrey
    },
    container: {
      ...miscellaneous.fill,
      justifyContent: "flex-start"
    },
    leftPanel: {
      ...miscellaneous.fill,
      justifyContent: "flex-start",
      borderRightColor:  colors.grey,
      borderRightWidth: 1
    },
    rightPanel: {
      ...miscellaneous.actionPanel,
      padding: padding.md,
      backgroundColor: colors.white
    },
    receiptOptionFormArea: {
      height: "50%"
    },
    reasonCodeField: {
      marginBottom: padding.sm
    },
    receiptOptions: {
      backgroundColor: colors.white
    },
    reprintButton: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.xs
    },
    postVoidButton: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      width: "100%"
    },
    btnReasonCode: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderColor: forms.input.borderColor,
      flexDirection: "row",
      justifyContent: "space-between",
      height: forms.input.height,
      paddingHorizontal: padding.md
    },
    btnReasonCodeText: {
      color: fonts.color,
      fontSize: fonts.fontSize.fm
    }
  };
};
