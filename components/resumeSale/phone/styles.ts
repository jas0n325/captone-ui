import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../../styles";


export const resumeTransactionsStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      paddingBottom: getBottomSpace()
    },
    inputPanel: {
      width: "95%",
      height: forms.input.height,
      marginHorizontal: spacing.xs,
      marginVertical: spacing.md,
      padding: 0
    },
    inputField: {
      backgroundColor: forms.input.backgroundColor,
      width: "100%",
      borderColor: colors.inputFieldBorderColor,
      borderRadius: padding.xs,
      fontSize: fonts.fontSize.md,
      borderWidth: 1,
      paddingRight: 28,
      marginRight: 28
    },
    cameraIconPanel: {
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderBottomWidth: 1,
      height: forms.input.height,
      width: 50
    },
    cameraIcon: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.bt
    },
    addButton: {
      ...buttons.btnPrimary,
      alignItems: "center",
      justifyContent: "center",
      margin: padding.sm,
      marginTop: padding.md
    },
    addButtonText: {
      ...buttons.btnPrimaryText,
      fontSize: fonts.fontSize.fm
    },
    resultHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs,
      padding: padding.md - padding.xs,
      paddingBottom: padding.xs
    },
    resultHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs
    },
    subtitleArea: {
      alignItems: "flex-start",
      justifyContent: "flex-end",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      paddingLeft: padding.xs + padding.sm,
      marginBottom: padding.xs,
      paddingTop: padding.sm + padding.xs
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.xs + 1,
      marginTop: 0,
      marginBottom: padding.sm
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
    emptyListTextWithNewLine: {
      fontSize: fonts.fontSize.fm,
      textAlign: "center",
      marginBottom: padding.xs,
      paddingBottom: padding.md + 2
    },
    emptySubtitleText: {
      color: colors.darkGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.md
    },
    errorText: {
      fontSize: fonts.fontSize.fm
    },
    placeholderStyle: {
      color: colors.darkGrey
    }
  }, {});
};

export const transactionStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    transaction: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      backgroundColor: colors.white,
      borderColor: Theme.isTablet ? colors.grey : colors.white,
      borderWidth: 1,
      borderRadius: padding.sm,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm,
      marginVertical: padding.xs,
      padding: padding.sm
    },
    details: {
      flex: 1
    },
    transactionRow: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: padding.xs
    },
    transactionText: {
      color: colors.black,
      fontSize: fonts.fontSize.md
    },
    attributeText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs
    },
    arrowArea: {
      alignItems: "stretch",
      justifyContent: "flex-end",
      paddingLeft: padding.xs
    },
    svgIcon: {
      color: colors.chevron,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    },
    referenceNumberField: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs,
      fontWeight: fonts.fontWeight.semibold
    }
  };
};


