import Theme from "../../../styles";


export const bagFeeStyles = () => {
  const { colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;

  return {
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    bagFeePanel: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderBottomWidth: 1
    },
    bagFeeExplainedText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1,
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.sm
    },
    quantityControls: {
      alignItems: "center",
      alignSelf: "stretch",
      borderColor: colors.grey,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      height: forms.input.height,
      paddingHorizontal: padding.md - 4,
      marginBottom: padding.sm + 4
    },
    generalText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm
    },
    generalTextArea: {
      alignItems: "center",
      justifyContent: "space-between",
      flexDirection: "row",
      paddingBottom: padding.md - 4,
      paddingHorizontal: padding.md - 4
    },
    disabledText: {
      color: colors.darkGrey
    },
    feedBackNote: {
      backgroundColor: colors.white,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md
    }
  };
};
