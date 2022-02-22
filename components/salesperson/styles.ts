import Theme from "../../styles";


export const tabletAssignSalespersonStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white
    },
    actions: {
      margin: 0,
      marginTop: padding.md - 4
    }
  };
};

export const assignSalespersonStyle = () => {
  const { buttons, colors, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
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
    actions: {
      ...miscellaneous.panel,
      margin: padding.md - 4
    },
    button: {
      justifyContent: "center",
      marginBottom: padding.sm - 2
    }
  }, Theme.isTablet ? tabletAssignSalespersonStyle() : {});
};
