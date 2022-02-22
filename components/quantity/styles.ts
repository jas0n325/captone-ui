import Theme from "../../styles/index";


export const quantityStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, textAlign }  = Theme.styles;
  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey
    },
    formArea: {
      height: "100%",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: Theme.isTablet ? 0 : padding.sm
    },
    controlsRow: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      flexDirection: "row",
      height: forms.input.height + 1,
      justifyContent: "center",
      marginBottom: padding.sm,
      paddingRight: padding.sm,
      width: "100%"
    },
    textPromptPanel: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey,
      justifyContent: "center",
      paddingLeft: padding.md,
      paddingRight: padding.sm
    },
    textPrompt: {
      ...textAlign.tac,
      fontSize: fonts.fontSize.fm,
      justifyContent: "center"
    },
    input: {
      ...miscellaneous.fill,
      borderWidth: 0,
      borderBottomWidth: 0,
      paddingHorizontal: padding.sm
    },
    placeholder: {
      padding: 0,
      paddingLeft: 0
    },
    quantityButtonsArea: {
      alignItems: "stretch",
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-evenly",
      paddingRight: padding.sm
    },
    quantityButton: {
      ...miscellaneous.fill,
      height: "100%",
      borderWidth: 1,
      borderColor: colors.action
    },
    quantityButtonMinus: {
      borderTopLeftRadius: buttons.btn.borderRadius,
      borderBottomLeftRadius: buttons.btn.borderRadius,
      borderRightWidth: 0
    },
    quantityButtonAdd: {
      borderTopRightRadius: buttons.btn.borderRadius,
      borderBottomRightRadius: buttons.btn.borderRadius
    },
    quantityButtonText: {
      ...buttons.btnSecondayText,
      fontSize: fonts.fontSize.bt
    },
    formAreaButton: {
      justifyContent: "center",
      marginHorizontal: Theme.isTablet ? 0 : padding.sm,
      marginBottom: padding.sm,
      marginTop: 0
    }
  };
};
