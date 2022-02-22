import Theme from "../../../ui/styles/index";

export const tabletTaxFreeStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    optionsRoot: {
      ...miscellaneous.screen
    },
    spinnerContainer: {
      alignItems: "center",
      justifyContent: "center"
    }
  };
};

export const taxFreeStyles = () => {
  const { colors, fonts, miscellaneous, padding, buttons } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill
    },
    optionsRoot: {
      backgroundColor: colors.white,
      paddingHorizontal: padding.md,
      ...miscellaneous.fill
    },
    button: {
      marginBottom: padding.xs
    },
    taxFreeButtonText: {
      ...buttons.btnSecondaryText,
      fontSize: fonts.fontSize.md,
      color: colors.action
    },
    skipButton: {
      ...buttons.btnPrimary,
      width: "100%",
      backgroundColor: colors.white,
      marginTop: padding.sm
    },
    spinnerContainer: {
      marginVertical: padding.lg
    }}, Theme.isTablet ? tabletTaxFreeStyles() : {}
  );
};
