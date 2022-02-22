import Color = require("color");

import Theme from "../../styles";


export const fatalErrorStyle = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    container: {
      flex: 1,
      backgroundColor: colors.lightGrey,
      justifyContent: "center",
      padding: padding.md
    },
    headerContainer: {
      marginTop: padding.xl + padding.sm
    },
    errorContainer: {
      padding: padding.sm
    },
    spacerContainer: {
      backgroundColor: colors.loginAndHeaderBackground,
      height: 10
    },
    headerText: {
      fontSize: fonts.fontSize.tl + 2,
      textAlign: "center",
      paddingBottom: padding.xs
    },
    normalText: {
      lineHeight: 22
    }
  };
};

export const VoidableErrorStyle = () => {
  const { buttons, miscellaneous, colors, fonts, padding} = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    btnPrimary: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: padding.xs,
      marginBottom: padding.sm,
      backgroundColor: colors.action
    },
    btnSecondary: {
      ...buttons.btnSeconday,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: padding.xs,
      marginBottom: padding.sm
    },
    header: {
      backgroundColor: colors.aptosLogo
    },
    titleStyle: {
      color: colors.white
    },
    btnText: {
      color: colors.white
    },
    errorDisplay: {
      paddingBottom: padding.md,
      backgroundColor: colors.white
    },
    errorContainer: {
      alignItems: "stretch",
      backgroundColor: Color(colors.bad).alpha(0.1).toString(),
      borderLeftWidth: padding.xs,
      borderColor: colors.bad,
      margin: !Theme.isTablet ? padding.sm : 0,
      paddingBottom: padding.xs,
      paddingRight: padding.md
    },
    errorMessageView: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      marginLeft: padding.xs,
      marginRight: padding.sm,
      paddingRight: padding.md
    },
    cautionText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.sm,
      textAlign: "left",
      justifyContent: "center",
      lineHeight: padding.md,
      padding: padding.xs,
      paddingRight: padding.md
    },
    cautionPanel: {
      alignSelf: "stretch",
      backgroundColor: Color(colors.caution).alpha(0.1).toString(),
      borderLeftWidth: padding.xs,
      borderColor: colors.bad,
      margin: padding.sm,
      paddingTop: padding.xs,
      paddingBottom: padding.xs,
      paddingRight: padding.md
    }
  }, Theme.isTablet ? tabletVoidableErrorScreen() : {});
};

export const tabletVoidableErrorScreen = () => {
  const { colors, miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen,
      backgroundColor: colors.lightGrey
    }
  };
};
