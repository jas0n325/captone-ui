import Color from "color";

import Theme from "../../styles/index";


const phoneLoginStyle = () => {
  const { fonts, padding } = Theme.styles;
  return ({
    login: {
      padding: padding.lg - 2
    },
    logoPanel: {
      alignSelf: "center",
      height: 80,
      marginBottom: padding.lg * 2 - 10,
      width: 240
    },
    error: {
      alignSelf: "stretch"
    },
    errorText: {
      fontSize: fonts.fontSize.xs
    },
    input: {
      alignSelf: "stretch"
    },
    feedBackNoteDisplay: {
      alignSelf: "stretch"
    },
    inputField: {
      width: "80%"
    },
    button: {
      width: "80%"
    }
  });
};

const tabletLoginStyle = () => {
  const { padding } = Theme.styles;
  return ({
    logoPanel: {
      alignSelf: "center",
      height: 120,
      marginBottom: padding.lg + 2,
      width: 360
    },
    error: {
      width: "55%"
    },
    feedBackNoteDisplay: {
      width: "55%"
    },
    input: {
      width: "55%"
    },
    inputField: {
      width: "55%"
    },
    button: {
      width: "55%"
    }
  });
};

export const loginStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  // If the login background has the same color as the input background, the input fields have all borders in order
  // to make then visible, otherwise just the normal input styling are used
  const inputBorder = Color(colors.loginAndHeaderBackground).hex() === Color(forms.input.backgroundColor).hex() ?
      { borderColor: Color(colors.loginAndHeaderText).alpha(0.5).toString(), borderWidth: 1 } :
      { borderColor: colors.loginAndHeaderText };
  return Theme.merge({
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.loginAndHeaderBackground
    },
    login: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      flex: 1,
      justifyContent: "center"
    },
    aptosLogoPanel: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
      left: padding.sm,
      position: "absolute",
      top: padding.sm
    },
    aptosLogo: {
      color: colors.aptosLogo,
      height: 80
    },
    error: {
      backgroundColor: colors.white,
      borderWidth: 0,
      height: forms.input.height,
      marginBottom: padding.md - 4
    },
    feedBackNoteDisplay: {
      backgroundColor: colors.white,
      borderWidth: 0,
      marginBottom: padding.md - 4
  },
    errorContainer: {
      ...miscellaneous.fill,
      alignItems: "center",
      backgroundColor: colors.accent,
      justifyContent: "center",
      overflow: "scroll",
      padding: padding.sm
    },
    errorText: {
      color: "rgba(208, 2, 27, 1)",
      fontFamily: fonts.fontFamily,
      fontSize: fonts.fontSize.fm,
      textAlign: "center"
    },
    logo: {
      alignSelf: "stretch",
      flex: 1,
      width: undefined,
      height: undefined
    },
    input: {
      alignSelf: "center",
      marginBottom: padding.md - 4
    },
    inputField: {
      ...inputBorder
    },
    button: {
      ... buttons.btnTertiary,
      backgroundColor: colors.loginAndHeaderBackground,
      justifyContent: "center"
    },
    buttonText: {
      ... buttons.btnTertiaryText,
      color: colors.loginAndHeaderText
    }
  }, !Theme.isTablet ? phoneLoginStyle() : tabletLoginStyle());
};
