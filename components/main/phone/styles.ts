import Color from "color";
import { getBottomSpace, isIphoneX } from "react-native-iphone-x-helper";

import Theme from "../../../styles";

export const mainStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding, spacing, forms } = Theme.styles;
  return ({
    ...buttons,
    ...miscellaneous,
    inputPanel: {
      alignSelf: "stretch",
      margin: 0,
      padding: 0,
      height: forms.input.height - spacing.sm,
      marginHorizontal: spacing.xs,
      marginBottom: spacing.sm
    },
    returnModeInputPanel: {
      backgroundColor: colors.returnHeaderBackground
    },
    inputField: {
      height: "100%",
      alignItems: "center",
      backgroundColor: forms.input.backgroundColor,
      color: colors.textColor,
      borderColor: colors.inputFieldBorderColor,
      borderRadius: padding.xs,
      fontSize: fonts.fontSize.md,
      borderWidth: 1,
      position: "absolute",
      width: "95%",
      paddingRight: 28 + spacing.sm,
      marginRight: 28 + spacing.md
    },
    closedTerminalStyles: {
      backgroundColor: Color(colors.loginAndHeaderBackground).alpha(0.5).toString(),
      borderColor: Color(colors.loginAndHeaderText).alpha(0.3).toString(),
      color: Color(colors.loginAndHeaderText).alpha(0.3).toString(),
      marginBottom: spacing.sm
    },
    itemError: {
      color: "rgba(255, 59, 48, 1)"
    },
    assignCustAndSelectItemsBtn: {
      ...miscellaneous.banner,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: padding.sm - 2,
      paddingHorizontal: spacing.md
    },
    assignCustomerContainer: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start",
      width : 168
    },
    assignCustomerIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.bt
    },
    assignCustomerText: {
      alignSelf: "center",
      color: colors.action,
      fontSize: fonts.fontSize.md,
      marginLeft: padding.xs,
      textAlign: "left"
    },
    assignCustomerOpenIcon: {
      color: colors.chevron,
      fontSize: fonts.fontSize.md
    },
    selectAllItemsContainer: {
      alignSelf: "stretch",
      alignItems: "flex-start",
      justifyContent: "center",
      flexDirection: "row",
      marginTop: spacing.xxs
    },
    selectAllItemsText: {
      color: colors.action,
      fontSize: fonts.fontSize.md
    },
    selectItemsContainer: {
      alignSelf: "stretch",
      alignItems: "flex-end",
      justifyContent: "center"
    },
    selectItemsText: {
      color: colors.action,
      fontSize: fonts.fontSize.md,
      textAlign: "right"
    },
    itemLine: {
      alignItems: "center",
      alignSelf: "stretch"
    },
    closedTerminalCameraIconStyles: {
      backgroundColor: colors.loginAndHeaderBackground,
      color: Color(colors.loginAndHeaderText).alpha(0.3).toString(),
      marginBottom: spacing.sm
    }
  });
};


export const totalTransactionStyle = () => {
  const { buttons, colors, fonts, spacing } = Theme.styles;
  return ({
    ...buttons,
    root: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.lighterGrey,
      padding: spacing.xs,
      paddingBottom: spacing.sm + (isIphoneX ? getBottomSpace() : 0)
    },
    transactionActionsButton: {
      ...buttons.btnPrimary,
      width: 50,
      backgroundColor: colors.white,
      marginRight: spacing.xs,
      borderRadius: 5
    },
    appsIcon: {
      color: colors.action,
      height: 20
    },
    returnTotal: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    returnTotalTitle: {
      color: fonts.color,
      fontSize: fonts.fontSize.sm,
      fontWeight: fonts.fontWeight.semibold
    },
    returnTotalText: {
      color: fonts.color,
      fontSize: fonts.fontSize.sm
    },
    btnTotal: {
      flex: 1,
      alignSelf: "center",
      flexDirection: "row"
    },
    chevronIcon: {
      height: 15,
      width: 40,
      borderWidth: 2
    },
    btnTotalPrice: {
      ...buttons.btnPrimaryText,
      flex: 1,
      fontSize: fonts.fontSize.fm,
      fontWeight: fonts.fontWeight.semibold
    }
  });
};
