import Color from "color";
import { Platform } from "react-native";

import { colors as baseColors, miscellaneous as baseMiscellaneous, textAlign } from "../styles";


const inputHeight = 44;
const colors = Object.assign({}, baseColors);

const fonts = {
  family: Platform.OS === "ios" ? "System" : "Roboto",
  color: colors.black,
  fontSize: {
    xxs: 10,
    xs: 12,
    nw: 13,
    sm: 14,
    md: 16,
    fm: 17,
    tl: 20,
    bt: 24,
    lg: 28,
    xl: 36,
    xxl: 54
  },
  fontWeight: {
    thin: "100",        // Thin
    ultraLight: "200",  // Ultra Light
    light: "300",       // Light
    regular: "400",     // Regular
    medium: "500",      // Medium
    semibold: Platform.OS === "ios" ? "600" : "500",    // Semibold
    bold: "700",        // Bold
    heavy: "800",       // Heavy
    black: "900"        // Black
  }
};

const padding = {
  xxs: 4,
  xs: 5,
  sm: 10,
  md: 20,
  lg: 30,
  xl: 40,
  xxl: 60
};

const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32
};

const miscellaneous = Object.assign({}, baseMiscellaneous, {
  statusBarHeight: {
    ...Platform.select({
      ios: {
        paddingTop: 44
      },
      android: {
        paddingTop: padding.xs
      },
      windows: {
        paddingTop: padding.sm - 2
      }
    })
  }
});

const getButtons = () => {
  return ({
    btn: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderRadius: 4,
      borderWidth: 1,
      height: 108,
      justifyContent: "center",
      width: 108
    },

    btnHover: {
      borderColor: colors.action,
      shadowColor: colors.action,
      shadowRadius: 1,
      backgroundColor: Color(colors.action).fade(0.92).toString()
    },

    btnDisabled: {
      backgroundColor: colors.disabledColor,
      borderColor: colors.disabledColor
    },

    btnIcon: {
      alignSelf: "center",
      backgroundColor: colors.transparent,
      color: colors.action,
      fontSize: fonts.fontSize.xl,
      textAlign: "center"
    },

    btnIconDisabled: {
      color: colors.disabledDarkColor
    },

    btnText: {
      alignSelf: "center",
      color: colors.action,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.sm,
      textAlign: "center"
    },

    btnIconText: {
      paddingTop: padding.xs + 1
    },

    btnTextDisabled: {
      color: colors.disabledDarkColor
    },

    btnAction: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: Color(colors.action).fade(0.4).toString(),
      borderRadius: 4,
      borderWidth: 1,
      height: 90,
      width: 90,
      marginTop: spacing.sm,
      paddingTop: spacing.md
    },

    btnActionIcon: {
      fontSize: fonts.fontSize.xl - 4
    },

    btnActionText: {
      fontSize: fonts.fontSize.xxs,
      borderColor: Color(colors.action).fade(0.13).toString()
    },

    btnPrimary: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.action,
      borderColor: colors.action,
      borderRadius: 8,
      borderWidth: 1,
      height: inputHeight,
      justifyContent: "center"
    },

    btnPrimaryDetailed: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.action,
      borderColor: colors.action,
      borderRadius: 8,
      borderWidth: 1,
      height: inputHeight * 1.5,
      justifyContent: "center"
    },

    btnPrimaryText: {
      alignSelf: "center",
      color: colors.white,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.fm,
      textAlign: "center"
    },

    btnSeconday: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.action,
      borderRadius: 8,
      height: inputHeight,
      justifyContent: "center"
    },

    btnSecondayDetailed: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.action,
      borderRadius: 8,
      height: inputHeight * 1.5,
      justifyContent: "center"
    },

    btnSecondayText: {
      alignSelf: "center",
      color: colors.action,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.fm,
      textAlign: "center"
    },

    btnTertiary: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 0,
      height: inputHeight,
      justifyContent: "center"
    },

    btnTertiaryText: {
      alignSelf: "center",
      color: colors.action,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.fm,
      textAlign: "center"
    },

    btnTitleText: {
      alignSelf: "center",
      color: colors.action,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.fm,
      textAlign: "center"
    },

    btnSubTitleText: {
      alignSelf: "center",
      color: Color(colors.black).alpha(0.6).string(),
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.nw,
      textAlign: "center"
    },

    btnSubTitleLabelText: {
      alignSelf: "center",
      color: Color(colors.black).alpha(0.6).string(),
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.nw,
      textAlign: "center"
    }
  });
};

const getForms = () => {
  return ({
    input: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 0,
      borderBottomWidth: 1,
      borderColor: colors.grey,
      height: inputHeight
    },

    inputText: {
      color: colors.black,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.md,
      paddingLeft: padding.md - 4,
      textAlign: "left"
    },

    inputError: {
      borderBottomColor: colors.bad
    },

    inputErrorText: {
      color: colors.bad,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.sm,
      paddingLeft: 0,
      textAlign: "left",
      paddingTop: padding.xs - 1
    },

    inputDisabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    },

    inputAddon: {
      backgroundColor: colors.white,
      borderWidth: 0,
      borderBottomWidth: 1,
      borderColor: colors.grey,
      height: inputHeight,
      width: 25
    },

    inputAddonText: {
      color: colors.darkerGrey,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.lg,
      paddingHorizontal: padding.sm - 2,
      textAlign: "left"
    }
  });
};

const getCards = () => {
  return ({
      cardItem: {
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: colors.white,
        borderRadius: spacing.xs,
        flex: 1,
        marginHorizontal: spacing.xs,
        padding: spacing.xs,
        borderColor: colors.grey,
        borderWidth: 1
      },
      cardSelected: {
        borderColor: colors.action
      }
  });
};

export default (configuredStyles?: any): any => {
  const colorsAndFonts: any = configuredStyles ? configuredStyles["colorsAndFonts"] ||
      undefined : undefined;

  if (colorsAndFonts) {
    Object.keys(colorsAndFonts).forEach((key) => {
      const prop = key.replace("Color", "");
      if (colors.hasOwnProperty(prop)) {
        colors[prop] = colorsAndFonts[key];
      }
    });

    // Set accent color to be 10% of the action color
    colors.accent = Color(colors.action).alpha(0.1).toString();
  }

  const buttons = getButtons();
  const forms = getForms();
  const cards = getCards();

  return {
    colors,
    buttons,
    fonts,
    forms,
    inputHeight,
    miscellaneous,
    padding,
    textAlign,
    spacing,
    cards
  };
};
