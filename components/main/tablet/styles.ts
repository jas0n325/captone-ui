import Color from "color";
import { Platform } from "react-native";

import Theme from "../../../styles";

export const mainStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing, textAlign } = Theme.styles;
  return ({
    ...miscellaneous,
    ...textAlign,
    ...buttons,
    ...forms,
    root: {
      ...miscellaneous.fill,
      flexDirection: "column"
    },
    mainRow: {
      ...miscellaneous.fill,
      flexDirection: "row"
    },
    leftPanel: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderRightColor:  colors.grey,
      borderRightWidth: 1,
      flex: 1,
      justifyContent: "center",
      flexDirection: "column"
    },
    rightPanel: {
      ...miscellaneous.actionPanel,
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "center",
      flexDirection: "column"
    },
    header: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      flexDirection: "row",
      height: forms.input.height,
      justifyContent: "center"
    },
    headerLogo: {
      alignSelf: "center",
      flex: 1,
      height: forms.input.height - padding.sm - 2,
      width: 200
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
    transaction: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.lighterGrey,
      borderBottomColor: colors.chevron,
      borderBottomWidth: 1,
      flexDirection: "row"
    },
    transactionLeft: {
      alignItems: "flex-start",
      flex: 1,
      justifyContent: "center",
      marginLeft: padding.md - 4,
      marginRight: padding.xl
    },
    transactionRight: {
      alignItems: "flex-end",
      flex: 1,
      justifyContent: "center",
      marginRight: padding.md - 4
    },
    selectItemBtn: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.transparent,
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    selectItemText: {
      alignSelf: "center",
      color: colors.action,
      fontSize: fonts.fontSize.fm,
      marginLeft: spacing.xxs
    },
    checkboxArea: {
      marginTop: spacing.xxs
    },
    transactionPanel: {
      flexDirection: "row"
    },
    transactionTextValue: {
      alignSelf: "stretch",
      fontSize: fonts.fontSize.md,
      fontWeight: "bold",
      color: colors.darkestGrey,
      marginLeft: spacing.xs
    },
    transactionNumber: {
      color: colors.textColor,
      paddingTop: spacing.xxs - 2
    },
    itemCount: {
      backgroundColor: colors.tagColor,
      paddingVertical: spacing.xxs,
      paddingHorizontal: spacing.xs + 2,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.transparent,
      overflow: "hidden",
      marginVertical: spacing.xs,
      marginRight: spacing.md
    },
    multiSelect: {
      marginVertical: padding.sm,
      paddingLeft: spacing.md,
      borderLeftWidth: 1,
      borderLeftColor: colors.darkestGrey
    },
    transactionBarIcon: {
      fontSize: fonts.fontSize.bt,
      color: colors.action
    },
    transactionBarDisabledIcon: {
      color: colors.shadow
    },
    display: {
      ...miscellaneous.fill,
      alignItems: "center",
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    itemLine: {
      alignSelf: "center",
      width: "100%"
    },
    actionTitle: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    actionBody: {
      ...miscellaneous.fill,
      padding: padding.md - 4,
      justifyContent: "center"
    },
    cancelProductActionsBtn: {
      alignSelf: "stretch",
      paddingTop: padding.sm,
      paddingHorizontal: 1
    },
    transactionDiscount: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderRadius: padding.sm - 2,
      justifyContent: "center",
      marginHorizontal: padding.sm - 2,
      marginVertical: padding.md - 4,
      padding: padding.md - 4
    },
    transactionLine: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: padding.md - 4
    },
    lastTransactionLine: {
      paddingBottom: 0
    },
    transactionLineText: {
      color: colors.black,
      flex: 1,
      fontSize: fonts.fontSize.fm
    },
    totalTransactionLineText: {
      ...textAlign.tar
    },
    loyaltyDiscount: {
      ...miscellaneous.actionPanel,
      marginTop: padding.md + 4
    },
    loyaltyPlan: {
      alignSelf: "stretch",
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "center",
      padding: padding.md - 4,
      paddingTop: padding.sm - 2
    },
    memberPlanText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm,
      paddingTop: padding.sm - 2
    },
    memberPlanBoldText: {
      fontWeight: fonts.fontWeight.semibold
    },
    memberPlanPoints: {
      alignSelf: "stretch",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    base: {
      height: 24,
      paddingTop: 24
    },
    actionBtn: {
      alignItems: "center",
      flexDirection: "row",
      height: Theme.isTablet ? spacing.xl : forms.input.height,
      justifyContent: "flex-start",
      marginRight: Theme.isTablet ? padding.xs - 1 : 0,
      marginTop: -spacing.xs,
      padding: spacing.md,
      marginLeft: -spacing.md
    },
    actionButtonIcon: {
      fontSize: fonts.fontSize.bt,
      color: colors.navigationText
    }
  });
};

export const actionTitleStyle = () => {
  const { colors, fonts, forms, padding, textAlign } = Theme.styles;
  return ({
    ...textAlign,
    root: {
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      height: forms.input.height * 2,
      justifyContent: "flex-end",
      padding: padding.md - 4,
      paddingBottom: padding.sm - 2
    },
    titleText: {
      ...textAlign.tal,
      color: colors.loginAndHeaderText,
      fontSize: Platform.OS === "ios" ? fonts.fontSize.tl + 1 : fonts.fontSize.tl,
      fontWeight: Platform.OS === "ios" ? fonts.fontWeight.semibold : fonts.fontWeight.medium
    }
  });
};

export const mainActionPanelStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, textAlign, spacing } = Theme.styles;
  return ({
    ...miscellaneous,
    ...textAlign,
    ...buttons,
    ...forms,
    root: {
      alignSelf: "stretch",
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between"
    },
    mainPanel: {
      alignSelf: "stretch",
      flex: 1,
      justifyContent: "center"
    },
    itemPanel: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      backgroundColor: colors.lightestGrey,
      justifyContent: "flex-start",
      paddingHorizontal: padding.md - 4,
      paddingTop: padding.lg - 15,
      height: forms.input.height * 2 - spacing.sm
    },
    errorPanel: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      justifyContent: "flex-start",
      paddingLeft: padding.xs - 1
    },
    actionPanel: {
      alignSelf: "stretch",
      flex: 1,
      paddingHorizontal: spacing.md
    },
    inputError: {
      color: colors.bad,
      fontSize: fonts.fontSize.sm - 1
    },
    assignCustomerBtn: {
      ...buttons.btnSeconday,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignSelf: "stretch",
      marginBottom: padding.sm - 2,
      borderWidth: 0,
      borderRadius: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGrey,
      paddingHorizontal: spacing.md
    },
    assignCustomerIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.lg
    },
    assignCustomerText: {
      ...buttons.btnSecondayText,
      paddingLeft: padding.xs - 1
    },
    totalPanel: {
      alignSelf: "stretch",
      alignItems: "center",
      borderTopColor:  Color(colors.black).fade(0.85).toString(),
      borderTopWidth: 1,
      padding: spacing.md
    }
  });
};

export const totalTransactionStyle = () => {
  const { buttons, colors, fonts, miscellaneous, spacing, textAlign } = Theme.styles;
  return ({
    ...miscellaneous,
    ...buttons,
    root: {
      flexDirection: "row",
      alignItems: "center"
    },
    totals: {
      width: "55%",
      paddingRight: spacing.md,
      boxSizing: "border-box"
    },
    row: {
      flexDirection: "row"
    },
    text: {
      color: fonts.color,
      flex: 1,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.semibold,
      marginBottom: spacing.xxs
    },
    totalText: {
      ...textAlign.tar,
      fontWeight: fonts.fontWeight.regular
    },
    returnText: {
      color: fonts.color,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.semibold
    },
    returnTotalText: {
      fontWeight: fonts.fontWeight.regular
    },
    btnTotal: {
      flex: 1,
      height: undefined
    },
    returnTotal: {
      alignItems: "flex-end",
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      width: "45%"
    },
    btnTotalText: {
      fontSize: fonts.fontSize.xs,
      fontWeight: fonts.fontWeight.bold,
      color: Color(colors.white).fade(0.4).toString()
    },
    btnTotalAmountText: {
      fontSize: fonts.fontSize.tl + 2,
      fontWeight: fonts.fontWeight.bold,
      marginTop: spacing.xxs - 2
    }
  });
};
