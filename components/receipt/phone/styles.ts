import Theme from "../../../styles";


export const receiptSummaryStyle = () => {
  const { colors, fonts, padding, miscellaneous, spacing } = Theme.styles;

  return ({
    ...miscellaneous.fill,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    topArea: {
      alignSelf: "stretch",
      justifyContent: "center",
      backgroundColor: colors.white
    },
    changeDueArea: {
      alignItems: "center",
      paddingHorizontal: padding.md,
      paddingVertical: padding.md
    },
    changeDueTitle: {
      fontSize: fonts.fontSize.xs + 1
    },
    changeDueText: {
      fontSize: fonts.fontSize.bt + 1,
      fontWeight: fonts.fontWeight.semibold
    },
    scrollView: {
      flex: 1,
      width: "100%"
    },
    bottomSection: {
      width: "100%",
      paddingBottom: "35%"
    },
    detailsArea: {
      // flex: 1,
      flexDirection: "row",
      padding: padding.md - 4,
      paddingBottom: 0
    },
    detailsSide: {
      flex: 1,
      justifyContent: "space-evenly"
    },
    detailsRightSide: {
      alignItems: "flex-end"
    },
    detailsText: {
      fontSize: fonts.fontSize.xs + 1
    },
    menuIcon: {
      color: colors.navigationText,
      fontSize: fonts.fontSize.lg,
      paddingTop: spacing.xxs
    }
  });
};
