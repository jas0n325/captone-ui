import Theme from "../../../ui/styles/index";

export const storeOperationsScreenStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;

  return {
    ...miscellaneous,
    buttonsArea: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey
    },
    operationButton: {
      alignSelf: "stretch",
      backgroundColor: colors.white
    },
    operationButtonContents: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "stretch",
      marginHorizontal: padding.md,
      paddingVertical: padding.sm,
      borderColor: colors.lightGrey,
      borderBottomWidth: 1
    },
    operationButtonText: {
      color: fonts.color,
      fontSize: fonts.fontSize.md
    },
    operationButtonIcon: {
      color: colors.grey,
      fontSize: fonts.fontSize.lg
    },
    chevronIcon: {
      color: colors.chevron,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    }
  };
};
