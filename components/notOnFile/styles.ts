import Theme from "../../styles";


export const tabletNotOnFileStyle = () => {
  const { miscellaneous, padding } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    },
    actions: {
      ...miscellaneous.screenActions,
      paddingVertical: padding.lg + 2
    }
  };
};

export const notOnFileStyle = () => {
  const { buttons, colors, forms, miscellaneous, padding, textAlign } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    ...textAlign,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    itemKey: {
      ...forms.input,
      justifyContent: "center"
    },
    itemText: {
      ...forms.inputText
    },
    btnDepartment: {
      ...forms.input,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingRight: padding.md - 4
    },
    btnInvalidDepartment: {
      borderBottomColor: forms.inputError.borderColor
    },
    departmentError: {
      alignSelf: "stretch"
    },
    departmentErrorText: {
      ...forms.inputErrorText,
      paddingLeft: padding.xs
    },
    textInput: {
      alignSelf: "stretch"
    },
    disabledArea: {
      backgroundColor: colors.lightGrey
    },
    textInputError: {
      paddingLeft: padding.xs
    },
    actions: {
      ...miscellaneous.panel,
      padding: padding.md - 4
    },
    button: {
      justifyContent: "center",
      marginBottom: padding.sm - 2
    }
  }, Theme.isTablet ? tabletNotOnFileStyle() : {});
};

export const notOnFileScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
