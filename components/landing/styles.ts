import Theme from "../../styles/index";
import Color from "color";

const phoneLandingStyle = () => {
  const { fonts, spacing } = Theme.styles;
  return ({
    message: {
      fontSize: fonts.fontSize.fm,
      padding: spacing.md
    },
    buttonPanel: {
      marginHorizontal: spacing.xxs
    },
    mainPanel: {
      paddingVertical: spacing.xs,
      marginHorizontal: spacing.xxs
    },
    mainButton: {
      flexDirection: "column",
      height: 132,
      paddingTop: spacing.md
    },
    mainButtonText: {
      fontSize: fonts.fontSize.md,
      marginTop: spacing.lg,
      paddingHorizontal: spacing.xxs
    },
    separator: {
      height: 132
    },
    rowPanel: {
      flex: 1,
      marginTop: spacing.xxs
    },
    rowButton: {
      height: 148,
      width: 148
    },
    rowButtonTextPanel: {
      height: 48,
      width: 148
    },
    rowButtonText: {
      fontSize: fonts.fontSize.md - 1
    }
  });
};

const tabletLandingStyle = () => {
  const { fonts, spacing } = Theme.styles;
  return ({
    landing: {
      padding: spacing.xl,
      paddingTop: spacing.sm
    },
    message: {
      fontSize: fonts.fontSize.lg - 2
    },
    buttonPanel: {
      marginTop: spacing.xl
    },
    mainPanel: {
      flex: 1,
      maxHeight: 164,
      paddingVertical: spacing.md
    },
    mainButton: {
      flexDirection: "row",
      paddingHorizontal: spacing.xl * 2
    },
    mainButtonText: {
      flex: 1,
      fontSize: fonts.fontSize.tl,
      paddingLeft: spacing.md
    },
    separator: {
    },
    rowPanel: {
      height: 296,
      marginBotton: spacing.xl
    },
    rowButton: {
      height: 256,
      width: 256
    },
    rowButtonTextPanel: {
      height: 54,
      width: 256
    },
    rowButtonText: {
      fontSize: fonts.fontSize.fm
    }
  });
};

export const landingStyle = () => {
  const { colors, fonts, miscellaneous, spacing } = Theme.styles;
  const mainColor = "rgba(51, 51, 51, 1)";
  return Theme.merge({
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.loginAndHeaderBackground
    },
    header: {
      borderBottomWidth: 0
    },
    landing: {
      backgroundColor: colors.loginAndHeaderBackground,
      flex: 1
    },
    message: {
      color: colors.loginAndHeaderText,
      fontFamily: fonts.family
    },
    buttonPanel: {
      alignSelf: "stretch",
      flex: 1
    },
    mainPanel: {
      alignSelf: "stretch",
      backgroundColor: Color(mainColor).toString(),
      flexDirection: "row"
    },
    mainButton: {
      alignItems: "center",
      backgroundColor: Color(mainColor).alpha(0.96).string(),
      flex: 1
    },
    icon : {
      color: colors.darkGrey
    },
    mainButtonText: {
      color: colors.white,
      fontFamily: fonts.family
    },
    separator: {
      backgroundColor: Color("rgba(100, 204, 201, 1)").toString(),
      width: 1
    },
    rowPanel: {
    },
    rowButtonPanel: {
      alignSelf: "stretch",
      flexDirection: "row"
    },
    rowButton: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderRadius: 4,
      margin: spacing.xxs
    },
    imageArea: {
      alignSelf: "stretch",
      borderRadius: 4,
      flex: 1,
      width: undefined,
      height: undefined
    },
    rowButtonTextPanel: {
      alignItems: "center",
      backgroundColor: Color("rgba(255, 255, 255, 0.94)").toString(),
      position: "absolute",
      bottom: 8,
      left: 0,
      padding: spacing.xs,
      paddingTop: spacing.xxs
    },
    rowButtonText: {
      color: colors.black,
      fontFamily: fonts.family
    }
  }, !Theme.isTablet ? phoneLandingStyle() : tabletLandingStyle());
};
