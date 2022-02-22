import Theme from "../../styles";


export const notFoundStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return {
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    textInput: {
      alignSelf: "stretch"
    },
    textInputError: {
      paddingLeft: padding.xs
    },
    message: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs + 1,
      justifyContent: "center",
      margin: padding.md - 4,
      marginTop: padding.sm - 2
    },
    actions: {
      ...miscellaneous.panel,
      margin: padding.md - 4
    },
    button: {
      justifyContent: "center",
      marginBottom: padding.sm - 2
    }
  };
};

export const notFoundScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
