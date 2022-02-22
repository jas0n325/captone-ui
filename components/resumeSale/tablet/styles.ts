import Theme from "../../../styles";


export const resumeTransactionsStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      ...miscellaneous.screen,
      paddingTop: padding.md - padding.xs
    },
    base: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      padding: padding.md - padding.xs
    },
    headerPanel: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "center",
      paddingTop: padding.sm
    },
    inputPanel: {
      height: forms.input.height,
      padding: 0,
      marginBottom: padding.md - padding.xs
    },
    inputField: {
      backgroundColor: colors.white,
      borderColor: colors.darkGrey,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderBottomWidth: 1,
      borderTopLeftRadius: padding.xs,
      borderBottomLeftRadius: padding.xs,
      fontSize: fonts.fontSize.fm,
      height: forms.input.height,
      paddingTop: padding.sm,
      paddingBottom: padding.sm
    },
    cameraIconPanel: {
      backgroundColor: colors.white,
      borderColor: colors.darkGrey,
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderTopWidth: 1,
      height: forms.input.height,
      width: 50
    },
    cameraIcon: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.bt
    },
    addButton: {
      ...buttons.btnPrimary,
      alignItems: "center",
      justifyContent: "center",
      margin: padding.sm,
      marginTop: padding.md
    },
    addButtonText: {
      ...buttons.btnPrimaryText,
      fontSize: fonts.fontSize.fm
    },
    resultHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs,
      padding: padding.md - padding.xs,
      paddingBottom: padding.xs
    },
    resultHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs
    },
    subtitleArea: {
      alignItems: "flex-start",
      justifyContent: "flex-end",
      backgroundColor: colors.transparent,
      paddingLeft: padding.sm
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.xs + 1
    },
    emptyList: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "25%",
      paddingHorizontal: padding.md
    },
    emptyListText: {
      fontSize: fonts.fontSize.tl,
      textAlign: "center"
    },
    emptyListTextWithNewLine: {
      fontSize: fonts.fontSize.tl,
      textAlign: "center",
      marginBottom: padding.xs
    },
    listArea: {
      marginTop: spacing.md
    },
    errorText: {
      fontSize: fonts.fontSize.fm
    },
    placeholderStyle: {
      color: colors.darkGrey
    }
  }, tabletResumeStyle());
};

export const tabletResumeStyle = () => {
  const { colors, miscellaneous, padding } = Theme.styles;
  return {
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      paddingBottom: 0,
      paddingHorizontal: "20%",
      paddingTop: padding.sm
    },
    inputPanel: {
      marginBottom: padding.md - padding.xs
    },
    inputField: {
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderBottomWidth: 1,
      borderTopLeftRadius: padding.xs,
      borderBottomLeftRadius: padding.xs
    },
    cameraIconPanel: {
      borderRightWidth: 1,
      borderTopWidth: 1,
      borderTopRightRadius: padding.xs,
      borderBottomRightRadius: padding.xs
    }
  };
};

export const transactionStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    transaction: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      backgroundColor: colors.white,
      borderColor: Theme.isTablet ? colors.grey : colors.white,
      borderWidth: 1,
      borderRadius: padding.sm,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm,
      marginVertical: padding.xs,
      padding: padding.sm
    },
    details: {
      flex: 1
    },
    transactionRow: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: padding.xs
    },
    transactionText: {
      color: colors.black,
      fontSize: fonts.fontSize.md
    },
    attributeText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs
    },
    arrowArea: {
      alignItems: "stretch",
      justifyContent: "flex-end",
      paddingLeft: padding.xs
    },
    svgIcon: {
      color: colors.chevron,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    },
    referenceNumberField: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs,
      fontWeight: fonts.fontWeight.semibold
    }
  };
};
