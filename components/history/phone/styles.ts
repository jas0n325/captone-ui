import { Platform } from "react-native";
import { getBottomSpace } from "react-native-iphone-x-helper";
import Color = require("color");
import Theme from "../../../styles";


export const salesHistoryStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;
  return {
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      justifyContent: "flex-start",
      backgroundColor: colors.lightGrey
    },
    cameraIcon: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.bt
    },
    inputPanel: {
      width: "95%",
      height: forms.input.height,
      marginLeft: spacing.xs,
      marginRight: spacing.xs,
      marginTop: spacing.md,
      padding: 0
    },
    input: {
      width: "100%",
      borderColor: colors.inputFieldBorderColor,
      borderRadius: padding.xs,
      fontSize: fonts.fontSize.md,
      borderWidth: 1,
      backgroundColor: forms.input.backgroundColor,
      paddingRight: 28,
      marginRight: 28
    },
    footer: {
      backgroundColor: colors.lighterGrey,
      borderTopColor: colors.borderColor,
      borderTopWidth: 1,
      paddingHorizontal: padding.md - 4
    },
    separator: {
      width: padding.sm
    },
    listArea: {
      flex: 4
    },
    list: {
      flex: 1
    },
    listHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      padding: padding.md - 5,
      paddingBottom: padding.xs - 1
    },
    listHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    emptyList: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "25%",
      paddingHorizontal: padding.md
    },
    emptyListText: {
      fontSize: fonts.fontSize.tl,
      textAlign: "center"
    },
    errorContainer: {
      alignItems: "stretch",
      backgroundColor: Color(colors.bad).alpha(0.1).toString(),
      borderLeftWidth: padding.xs,
      borderColor: colors.bad,
      margin: !Theme.isTablet ? padding.sm : 0,
      paddingVertical: padding.xs,
      paddingRight: padding.xs
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
    contentContainer: {
      flexGrow: Platform.OS === "ios" ? 0 : 1
    }
  };
};

export const transactionHistoryStyles = () => {
  const { buttons, colors, forms, fonts, miscellaneous, spacing } = Theme.styles;
  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    footer: {
      backgroundColor: colors.white,
      borderTopColor: colors.borderColor,
      borderTopWidth: 1,
      flexDirection: "column",
      height: undefined,
      paddingHorizontal: spacing.sm - 2,
      paddingTop: spacing.sm - 2,
      paddingBottom: getBottomSpace() ? getBottomSpace() : spacing.sm - 2
    },
    reprintButton: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      width: "100%"
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
      paddingHorizontal: spacing.lg - 4
    },
    btnReasonCodeText: {
      color: fonts.color,
      fontSize: fonts.fontSize.fm
    },
    menuIcon: {
      color: colors.navigationText,
      fontSize: fonts.fontSize.lg,
      paddingTop: spacing.xs - 3
    },
    detailsText: {
      fontSize: fonts.fontSize.sm,
      paddingTop: spacing.md - 4
    },
    receiptOptionsArea: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      paddingTop: spacing.xs - 3
    }
  };
};
