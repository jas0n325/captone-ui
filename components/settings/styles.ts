import Color from "color";
import { Platform } from "react-native";
import { isIphoneX } from "react-native-iphone-x-helper";

import Theme from "../../../ui/styles";

export const tenantSettingsScreenStyles = () => {
  const { miscellaneous, colors } = Theme.styles;
  return {
    ...miscellaneous,
    container: {
      alignSelf: "stretch",
      flex: 1,
      backgroundColor: colors.loginAndHeaderBackground
    }
  };
};

export const tenantStyle = () => {
  const { colors, fonts, forms, miscellaneous, padding, textAlign } = Theme.styles;

  return Theme.merge({
    ... miscellaneous,
    settings: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      flex: 1,
      justifyContent: "center"
    },
    pageTitle: {
      ...textAlign.tac,
      color: colors.loginAndHeaderText,
      fontSize: fonts.fontSize.bt - 2,
      marginBottom: padding.md + 5
    },
    error: {
      backgroundColor: colors.white,
      borderWidth: 0,
      height: forms.input.height * 1.2,
      marginBottom: padding.md - 4
    },
    errorContainer: {
      ...miscellaneous.fill,
      alignItems: "center",
      backgroundColor: colors.accent,
      justifyContent: "center",
      padding: padding.sm
    },
    errorText: {
      color: "rgba(208, 2, 27, 1)",
      fontFamily: fonts.fontFamily,
      fontSize: fonts.fontSize.xs,
      textAlign: "center"
    },
    textInput: {
      alignSelf: "center",
      marginBottom: padding.md - 4
    },
    textInputError: {
      color: Color(colors.bad).lighten(0.20).toString()
    },
    navigationBarTitleWrapper: {
      marginTop: padding.lg,
      ...Platform.select({
        ios: {
          paddingTop: (isIphoneX() ? padding.lg : padding.md) - 2
        },
        android: {
          paddingTop: padding.xs,
          paddingBottom: padding.sm + 7
        }
      }),
      flex: 0.1
    },
    navigationBarTitle: {
      alignItems: "center",
      alignSelf: "center",
      color: colors.loginAndHeaderText,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.md + 4,
      fontWeight: fonts.fontWeight.semibold,
      height: padding.lg + 2,
      marginLeft: padding.xs,
      textAlign: "center",
      width: "75%"
    },
    aptosLogo: {
      color: colors.loginAndHeaderText,
      height: 40,
      width: 100
    }
  }, Theme.isTablet ? {
    errorText: {
      fontSize: fonts.fontSize.sm
    },
    textInput: {
      width: "40%"
    }
  } : {
    textInput: {
      width: "80%"
    }
  });
};

export const terminalStyle = () => {
  const { buttons, colors, fonts, spacing, textAlign } = Theme.styles;

  return Theme.merge({
    ...tenantStyle(),
    root: {
      alignSelf: "center",
      flex: 1,
      maxWidth: 560
    },
    terminal: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.md
    },
    title: {
      ...textAlign.tal,
      color: colors.loginAndHeaderText,
      fontSize: fonts.fontSize.md,
      fontWeight: "bold",
      paddingBottom: 0,
      width: "100%"
    },
    textInput: {
      marginTop: spacing.md,
      width: "100%"
    },
    button: {
      ... buttons.btnTertiary,
      backgroundColor: colors.loginAndHeaderBackground,
      flex: 1,
      justifyContent: "center"
    },
    buttonText: {
      ... buttons.btnTertiaryText,
      color: colors.loginAndHeaderText
    },
    footer: {
      alignSelf: "center",
      marginBottom: Theme.isTablet ? spacing.lg : 0,
      paddingHorizontal: 0,
      width: "100%"
    },
    screenContainer: {
      alignSelf: "stretch",
      flex: 1,
      backgroundColor: colors.loginAndHeaderBackground
    }
  });
};

export const terminalConflictStyle = () => {
  const { buttons, colors, spacing } = Theme.styles;

  return Theme.merge({
    ...buttons,
    ...terminalStyle(),
    container: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: colors.white,
      justifyContent: "center",
      margin: spacing.xs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.md,
      maxWidth: 560
    },
    conflictTextInput: {
      alignSelf: "stretch",
      marginBottom: spacing.xxs + 2
    },
    actionButton: {
      marginTop: spacing.xxs + 2
    }
  });
};
