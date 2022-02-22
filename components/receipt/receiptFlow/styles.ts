import Color = require("color");
import Theme from "../../../styles";

export const receiptCategoryChoiceStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;

  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey
    },
    receiptTypeChoiceButton: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: padding.lg,
      paddingVertical: padding.sm,
      backgroundColor: colors.white,
      fontSize: fonts.fontSize.sm
    },
    checkIcon: {
      fontSize: fonts.fontSize.tl
    },
    receiptTypeChoiceButtonText: {
      ...buttons.btnSecondayText
    },
    receiptTypeChoiceButtonTextDisable: {
      ...buttons.btnSecondayText,
      color:colors.grey
    },
    buttonsArea: {
      alignSelf: "stretch",
      alignItems: "center"
    },
    progressionButton: {
      marginBottom: padding.sm
    }
  };
};

export const receiptEmailFormStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;

  return {
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey
    },
    errorText: {
      fontSize: fonts.fontSize.sm,
      marginHorizontal: padding.md
    },
    inputText: {
      alignSelf: "stretch",
      marginBottom: padding.lg
    },
    buttonsArea: {
      alignSelf: "stretch",
      alignItems: "center"
    },
    progressionButton: {
      marginBottom: padding.sm
    }
  };
};

export const receiptPhoneNumberFormStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;

  return {
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey
    },
    errorText: {
      fontSize: fonts.fontSize.sm,
      marginHorizontal: padding.md
    },
    inputText: {
      alignSelf: "stretch",
      marginBottom: padding.lg
    },
    buttonsArea: {
      alignSelf: "stretch",
      alignItems: "center"
    },
    progressionButton: {
      marginBottom: padding.sm
    }
  };
};

export const receiptPrinterChoiceStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;

  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey
    },
    receiptTypeChoiceButton: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.sm,
      backgroundColor: colors.white,
      fontSize: fonts.fontSize.sm
    },
    receiptTypeChoiceButtonText: {
      ...buttons.btnSecondayText
    },
    spinnerContainer: {
      marginVertical: padding.lg
    },
    buttonsArea: {
      alignSelf: "stretch",
      alignItems: "center"
    },
    progressionButton: {
      marginBottom: padding.sm
    },
    inputPanel: {
      alignSelf: "stretch",
      margin: 0,
      padding: 0
    },
    inputField: {
      backgroundColor: colors.white,
      borderColor: colors.grey,
      fontSize: fonts.fontSize.md,
      height: forms.input.height
    },
    inputError: {
      paddingLeft: padding.xs
    },
    cameraIconPanel: {
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderBottomWidth: 1,
      height: forms.input.height,
      width: 50
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    },
    infoMessageView: {
      height: padding.xxl,
      flexDirection: "row",
      alignItems: "flex-start",
      borderColor: colors.info,
      borderLeftWidth: padding.xs,
      margin: !Theme.isTablet ? padding.sm : 0,
      backgroundColor: Color(colors.info).alpha(0.1).toString(),
      alignSelf: "stretch"
    },
    infoMessageText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.sm,
      textAlign: "left",
      lineHeight: padding.md,
      padding: padding.xs,
      paddingRight: padding.xl
    },
    imageView: {
      height: padding.md,
      width: padding.md,
      margin: padding.xs
    },
    activityIndicatorContainerView: {
      backgroundColor: colors.white,
      borderRadius: padding.sm,
      width: "85%",
      height: "25%"
    },
    headerText: {
      textAlign: "center",
      fontWeight: fonts.fontWeight.bold,
      marginTop: spacing.md,
      fontSize: fonts.fontSize.fm,
      lineHeight: padding.md
    },
    descText: {
      textAlign: "center",
      lineHeight: fonts.fontSize.md,
      color: colors.textColor,
      marginTop: spacing.xxs,
      fontSize: fonts.fontSize.nw
    },
    spinnerStyle: {
      flex: 1,
      justifyContent: "flex-end",
      marginBottom: spacing.sm
    },
    appCloseSpinnerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroubndColor: colors.lightGrey
    },
    checkIcon: {
      fontSize: fonts.fontSize.tl
    }
  };
};

export const changeDueStyles = () => {
  const { buttons, colors, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    changeDueOptionsRoot: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    changeDueOptionsArea: {
      alignSelf: "stretch",
      paddingHorizontal: padding.md
    },
    changeDueScreenButton: {
      ...buttons.btnPrimary,
      width: "100%",
      backgroundColor: colors.white,
      marginTop: padding.sm
    },
    changeDueScreenButtonTitle: {
      ...buttons.btnSecondayText
    },
    bottomMostButton: {
      marginBottom: padding.md
    }
  }, Theme.isTablet ? tabletChangeDueStyles() : {});
};

export const tabletChangeDueStyles = () => {
  const { buttons, miscellaneous, padding } = Theme.styles;
  return {
    changeDueOptionsRoot: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: padding.md
    },
    changeDueOptionsArea: {
      ...miscellaneous.fill
    },
    changeDueScreenButton: {
      ...buttons.btnSeconday,
      marginBottom: padding.sm
    }
  };
};
