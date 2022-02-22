import Theme from "../../styles";


export const priceScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};

export const priceStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing, textAlign } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    ...miscellaneous,
    ...textAlign,
    root: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey
    },
    formArea: {
      alignItems: "center",
      alignSelf: "stretch",
      justifyContent: "flex-start",
      paddingTop: Theme.isTablet ? 0 : padding.sm,
      paddingBottom: padding.sm
    },
    inputFormArea: {
      alignSelf: "stretch"
    },
    inputForm: {
      paddingLeft: padding.md
    },
    errorTextSyle: {
      paddingHorizontal: padding.md,
      marginLeft: spacing.xxs
    },
    btnReasonCode: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderColor: forms.input.borderColor,
      flexDirection: "row",
      justifyContent: "space-between",
      height: forms.input.height,
      paddingHorizontal: padding.md
    },
    btnReasonCodeText: {
      color: fonts.color,
      fontSize: fonts.fontSize.fm
    },
    btnInvalidReasonCode: {
      borderBottomColor: forms.inputError.borderColor
    },
    reasonCodeError: {
      alignSelf: "stretch"
    },
    reasonCodeErrorText: {
      ...forms.inputErrorText,
      paddingLeft: padding.xs
    },
    buttonsArea: {
      ...miscellaneous.fill,
      padding: Theme.isTablet ? 0 : padding.sm,
      paddingTop: 0
    },
    mainButton: {
      ...buttons.btnPrimary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: padding.sm
    },
    closeButton: {
      ...buttons.btnSeconday,
      alignItems: "center",
      justifyContent: "center"
    }
  }, Theme.isTablet ? tabletPriceStyles() : {});
};

export const tabletPriceStyles = () => {
  const { colors, miscellaneous, padding } = Theme.styles;
  return {
    notInActionPanel: {
      ...miscellaneous.screen
    },
    buttonsArea: {
      ...miscellaneous.screenActions,
      paddingVertical: padding.lg + 2
    },
    itemLine: {
      borderWidth: 1,
      borderColor: colors.grey,
      maxWidth: "100%"
    }
  };
};

export const tabletZeroPriceStyles = () => {
  const { miscellaneous, padding } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    },
    buttonsArea: {
      ...miscellaneous.screenActions,
      paddingVertical: padding.lg + 2
    },
    itemLine: {
      maxWidth: "unset"
    }
  };
};

export const zeroPriceStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, textAlign } = Theme.styles;
  return Theme.merge({
    ...priceStyles(),
    controlsRow: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flexDirection: "row",
      height: forms.input.height,
      justifyContent: "flex-start",
      marginBottom: padding.sm,
      paddingHorizontal: padding.sm
    },
    textPrompt: {
      fontSize: fonts.fontSize.fm,
      justifyContent: "center",
      paddingLeft: padding.sm,
      ...textAlign.tar
    },
    input: {
      ...miscellaneous.fill,
      borderWidth: 0,
      borderBottomWidth: 0,
      paddingLeft: padding.xs
    },
    disabledArea: {
      backgroundColor: colors.lightGrey
    },
    placeholder: {
      padding: 0
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
      borderWidth: 1,
      borderColor: colors.action,
      height: "100%"
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
    }
  }, Theme.isTablet ? tabletZeroPriceStyles() : {});
};

export const zeroPriceScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
