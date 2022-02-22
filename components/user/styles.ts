import Theme from "../../styles/index";

export const tabletChangePassowrdStyle = () => {
  const { miscellaneous, padding } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    },
    actions: {
      ...miscellaneous.screenActions,
      paddingVertical: padding.lg + 2
    },
    changePasswordText: {
      marginHorizontal: "8.33%"
    }
  };
};

export const changePasswordStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    textInput: {
      alignSelf: "stretch"
    },
    textInputError: {
      paddingHorizontal: padding.xs
    },
    actions: {
      ...miscellaneous.panel,
      padding: padding.md - 4
    },
    button: {
      justifyContent: "center",
      marginBottom: padding.sm - 2
    },
    changePasswordText: {
      alignSelf: "stretch",
      marginHorizontal: padding.md - 4,
      marginBottom: padding.md - 4,
      justifyContent: "center",
      fontSize: fonts.fm,
      color: colors.darkerGrey
    },
    passwordLengthText: {
      alignSelf: "flex-start",
      marginHorizontal: padding.md - 4,
      marginBottom: padding.md - 4,
      flexDirection: "row",
      justifyContent: "flex-start",
      fontSize: fonts.fm,
      color: colors.darkerGrey
    },
    passwordRequirementsText: {
      alignSelf: "flex-start",
      marginHorizontal: padding.md - 4,
      marginBottom: padding.md - 4,
      marginTop: padding.md - 4,
      flexDirection: "row",
      justifyContent: "flex-start",
      fontSize: fonts.fm,
      color: colors.darkerGrey
    },
    passwordRequirementsIcon: {
      fontSize: fonts.fontSize.tl
    }
  }, Theme.isTablet ? tabletChangePassowrdStyle() : {});
};

export const changePasswordScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
