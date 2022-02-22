import Color from "color";

export interface Styles {
  buttons: any;
  colors: any;
  fonts: any;
  forms: any;
  miscellaneous: any;
  padding: any;
  textAlign: any;
  spacing: any;
  inputHeight: any;
  cards: any;
}

export const colors = {
  // Configured colors default values
  loginAndHeaderBackground: "rgba(54, 101, 149, 1)",
  loginAndHeaderText: "rgba(255, 255, 255, 1)",
  action: "rgba(0, 116, 217, 1)",
  accent: "rgba(0, 122, 255, 0.1)",
  aptosLogo: "rgba(255, 255, 255, 1)",
  navigationText: "rgba(193, 191, 147, 1)",
  itemDiscountsText: "rgba(54, 149, 60, 1)",
  returnHeaderBackground: "rgba(229, 106, 69, 1)",
  good: "rgba(29, 120, 29, 1)",
  bad: "rgba(178, 44, 17, 1)",
  blue: "rgba(50,98,149,1)",

  // System colors
  black: "rgba(0, 0, 0, 1)",
  white: "rgba(255, 255, 255, 1)",
  darkestGrey: "rgba(0, 0, 0, 0.6)",
  darkerGrey: "rgba(99, 102, 106, 1)",
  darkGrey: "rgba(142, 142, 147, 1)",
  grey: "rgba(0, 0, 0, 0.15)",
  lightGrey: "rgba(239, 239, 244, 1)",
  lighterGrey: "rgba(248, 248, 248, 1)",
  lightestGrey: "rgba(253, 253, 253, 1)",
  tagColor: "rgba(0, 0, 0, 0.04)",
  textColor: "rgba(0, 0, 0, 0.87)",
  borderColor: "rgba(0, 0, 0, 0.3)",
  orange: "rgba(240, 179, 35, 1)",

  // App colors
  transparent: "transparent",
  underlineColor: "transparent",
  underlineColorAndroid: "transparent",
  placeholderTextColor: Color("rgba(0, 0, 0, 0.87)").alpha(0.6).string(),
  selectionColor: "rgba(0, 0, 0, 0.5)",
  itemQuantity: "rgba(215, 215, 219, 1)",
  separator: "rgba(0, 0, 0, 0.08)",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.4)",
  chevron: "rgba(209, 209, 214, 1)",
  inputFieldBorderColor: "rgba(0, 0, 0, 0.48)",

  caution: "rgba(240, 179, 35, 1)",
  info: "rgba(73, 167, 224, 1)",
  neutral: "rgba(0, 0, 0, 0.6)",

  disabledColor: "rgba(242, 242, 242, 1)",
  disabledDarkColor: Color("rgba(0, 0, 0, 1)").fade(0.62).toString(),
  offlineColor: "rgba(0, 0, 0, 0.16)"
};

export const miscellaneous = {
  fill: {
    alignSelf: "stretch",
    flex: 1
  },
  panel: {
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center"
  },
  hr: {
    alignSelf: "stretch",
    backgroundColor: colors.grey,
    height: 1
  },
  banner: {
    height: 44,
    alignSelf: "stretch",
    backgroundColor: colors.white
  },
  errorPanel: {
    alignItems: "center",
    backgroundColor: Color(colors.bad).alpha(0.1).string(),
    borderColor: colors.bad,
    borderRadius: 5,
    borderWidth: 1,
    color: colors.bad,
    justifyContent: "center",
    textAlign: "center"
  }
};

export const textAlign = {
  tal: {
    textAlign: "left"
  },
  tac: {
    textAlign: "center"
  },
  tar: {
    textAlign: "right"
  }
};
