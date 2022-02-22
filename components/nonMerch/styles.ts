import Theme from "../../styles";

export const tabletNonMerchStyles = () => {
  return {
    errorWrapper: {
      marginHorizontal: 0
    }
  };
};

export const phoneNonMerchStyles = () => {
  return {};
};

export const nonMerchStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing, textAlign } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    inputPanel: {
      alignSelf: "stretch",
      margin: 0,
      padding: 0
    },
    inputField: {
      backgroundColor: colors.white,
      borderColor: colors.grey,
      fontSize: fonts.fontSize.md,
      height: forms.input.height
    },
    nonMerchButton: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingRight: padding.md - 4,
      paddingVertical: padding.sm,
      backgroundColor: colors.white,
      fontSize: fonts.fontSize.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.grey
    },
    nonMerchButtonText: {
      ...buttons.btnSecondayText,
      ...textAlign.tal,
      color: colors.textColor
    },
    listWrapper: {
      marginTop: padding.sm - 2,
      marginLeft: padding.md - 4,
      display: "flex",
      flexDirection: "column",
      alignSelf: "stretch",
      flexGrow: 1,
      flexShrink: 1
    },
    pagination: {
      flex: 1,
      flexDirection: "row",
      marginRight: padding.sm - 2,
      marginLeft: 0,
      marginVertical: 8
    },
    paginationButtonView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    paginationButton: {
      ...buttons.btnPrimary,
      flex: 1,
      margin: 4,
      backgroundColor: colors.white
    },
    cancelButton: {
      ...buttons.btnPrimary,
      marginVertical: padding.xs - 1,
      backgroundColor: colors.white,
      height: 48
    },
    paginationButtonTitle: {
      ...buttons.btnSecondayText,
      fontSize: fonts.fontSize.md
    },
    errorWrapper: {
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      marginHorizontal: spacing.md
    }
  }, Theme.isTablet ? tabletNonMerchStyles() : phoneNonMerchStyles());
};
