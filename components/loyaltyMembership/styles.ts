import Theme from "../../styles";

const phoneLoyaltyMembershipDisplayStyle = () => {
  const { fonts, padding } = Theme.styles;
  return ({
    smallText: {
      fontSize: fonts.fontSize.xxs,
      marginRight: padding.xs
    },
    membershipViewCommon: {
      marginTop: padding.md
    },
    membershipHeader: {
      marginBottom: padding.xs + 1
    },
    membershipMain: {
      marginBottom: padding.md
    },
    membershipViewStatus: {
      alignItems: "flex-start",
      flexDirection: "column"
    },
    statusTag: {
      marginLeft: 0,
      marginTop: padding.xs
    },
    membershipViewPoints: {
      marginBottom: padding.xs
    },
    mainText: {
      fontSize: fonts.fontSize.md,
      marginBottom: padding.xs - 3
    },
    availablePointsAmountText: {
      fontSize: fonts.fontSize.lg - 2
    },
    membershipViewAvailablePoints: {
      marginTop: padding.xs - 2,
      marginBottom: padding.xs - 3
    },
    membershipViewExpiredPoints: {
      marginBottom: padding.lg - 3
    },
    secondaryGrayText: {
      fontSize: fonts.fontSize.xs
    },
    membershipViewPendingAndTotalPoints: {
      marginBottom: padding.sm - 4
    },
    membershipViewPointsDatesWithBorder: {
      marginBottom: padding.xs - 1
    },
    secondaryGrayLeftText: {
      fontSize: fonts.fontSize.sm
    },
    secondaryBlackLeftText: {
      fontSize: fonts.fontSize.md,
      marginBottom: padding.xs + 2
    }
  });
};

export const loyaltyMembershipDisplayStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      ...miscellaneous.screen,
      paddingTop: padding.md - 4
    },
    base: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      padding: padding.md - 4
    },
    headerPanel: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "center",
      paddingTop: padding.sm - 2,
      paddingBottom: padding.md - 4
    },
    membershipStatus: {
      flexGrow: 0,
      alignItems: "flex-start",
      justifyContent: "center"
    },
    statusTag: {
      borderColor: colors.grey,
      borderWidth: 1,
      borderRadius: padding.sm,
      flexDirection: "row",
      marginLeft: padding.sm
    },
    statusTagText: {
      alignSelf: "center",
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs,
      margin: padding.xs
    },
    statusTagCircle: {
      alignSelf: "center",
      borderRadius: padding.sm / 2,
      height: padding.sm,
      marginHorizontal: padding.xs,
      width: padding.sm
    },
    statusTagCircleActive: {
      backgroundColor: colors.good
    },
    statusTagCirclePending: {
      backgroundColor: colors.caution
    },
    statusTagCircleTerminated: {
      backgroundColor: colors.bad
    },
    smallText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs - 1,
      marginRight: padding.xs,
      textAlign: "left"
    },
    smallBoldText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs - 1,
      fontWeight: "bold",
      textAlign: "left",
      marginRight: padding.xs
    },
    chevronIcon: {
      color: colors.action,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    },
    membershipViewTitle: {
      color: colors.black,
      fontSize: fonts.fontSize.lg,
      textAlign: "left",
      fontWeight: "bold",
      marginBottom: padding.md
    },
    membershipHeader: {
      justifyContent: "space-between",
      flexDirection: "row",
      flex: 1,
      marginBottom: padding.xs + 2,
      marginLeft: padding.md,
      marginRight: padding.md,
      marginTop: padding.xs - 1.5
    },
    membershipMain: {
      flexDirection: "row",
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      marginBottom: padding.lg - 2
    },
    membershipViewStatus: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      marginBottom: padding.md - 5,
      marginLeft: padding.md,
      marginRight: padding.md
    },
    mainText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.fm,
      textAlign: "left",
      marginBottom: padding.xs
    },
    availablePointsAmountText: {
      textAlign: "center",
      color: colors.black,
      fontSize: fonts.fontSize.lg,
      fontWeight: "bold"
    },
    membershipViewAvailablePoints: {
      justifyContent: "center",
      marginTop: padding.xs,
      marginBottom: padding.xs
    },
    membershipViewAvailablePointsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: padding.sm,
      marginTop: padding.sm
    },
    secondaryGrayText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      textAlign: "center",
      marginBottom: padding.xs - 2
    },
    secondaryBlackText: {
      color: colors.black,
      fontSize: fonts.fontSize.md,
      textAlign: "center",
      marginBottom: padding.xs - 2
    },
    membershipViewSecondaryPoints: {
      justifyContent: "center",
      flex: 1,
      marginBottom: padding.xs
    },
    membershipViewPendingAndTotalPoints: {
      justifyContent: "space-between",
      flexDirection: "row",
      flex: 1,
      marginBottom: padding.sm - 2
    },
    viewVerticalSeparator: {
      borderColor: colors.grey,
      borderRightWidth: 1,
      width: 1,
      marginBottom: padding.sm
    },
    membershipViewPoints: {
      borderWidth: 1,
      borderColor: colors.grey,
      borderRadius: 11,
      marginBottom: padding.xs + 2,
      marginLeft: padding.md,
      marginRight: padding.md
    },
    membershipViewExpiredPoints: {
      flexDirection: "row",
      marginBottom: padding.lg,
      marginLeft: padding.md,
      marginRight: padding.md
    },
    secondaryGrayLeftText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.md - 1,
      textAlign: "left",
      marginBottom: padding.xs - 3
    },
    secondaryBlackLeftText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm,
      textAlign: "left",
      marginBottom: padding.sm - 2
    },
    membershipViewPointsDatesWithBorder: {
      borderBottomWidth: 1,
      borderColor: colors.grey,
      marginBottom: padding.sm - 2,
      marginLeft: padding.md,
      marginRight: padding.md
    },
    membershipViewPointsDatesNoBorder: {
      marginLeft: padding.md,
      marginRight: padding.md
    },
    membershipViewCommon: {
      marginLeft: padding.md,
      marginRight: padding.md
    }
  }, !Theme.isTablet ? phoneLoyaltyMembershipDisplayStyle() : undefined);
};

const phoneLoyaltyEnrollmentStyle = () => {
  return ({});
};

export const loyaltyEnrollmentStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      ...miscellaneous.screen,
      paddingTop: padding.md - padding.xxs
    },
    loyaltyViewCommon: {
      marginTop: padding.xs
    },
    membershipStatus: {
      flexGrow: 0,
      alignItems: "flex-start",
      justifyContent: "center"
    },
    chevronIcon: {
      color: colors.action,
      height: padding.sm + 6.7,
      width: padding.sm - 1.6
    },
    viewVerticalSeparator: {
      borderColor: colors.grey,
      borderRightWidth: 1,
      width: 1,
      marginBottom: padding.sm
    },
    cautionPanel: {
      marginHorizontal: padding.sm
    },
    errorText: {
      fontSize: fonts.fontSize.md,
      paddingLeft: padding.xs
    },
    textInput: {
      alignSelf: "stretch"
    },
    loyaltyMain: {
      marginBottom: padding.xs
    },
    cautionIconPadding: {
      paddingVertical: padding.sm
    },
    subtitleArea: {
      alignItems: "flex-start",
      justifyContent: "flex-end",
      backgroundColor: colors.tagColor,
      borderTopWidth: 0,
      marginTop: padding.sm,
      paddingTop: padding.xs,
      paddingBottom: padding.md,
      paddingHorizontal: padding.md
    },
    subtitleText: {
      color: colors.darkestGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.nw,
      fontWeight: fonts.fontWeight.semibold
    }
  }, !Theme.isTablet ? phoneLoyaltyEnrollmentStyle() : undefined);
};

export const tabletLoyaltyDiscountStyle = () => {
  const { padding } = Theme.styles;
  return {
    actions: {
      margin: 0,
      marginTop: padding.xxl - 4
    }
  };
};

export  const loyaltyDiscountStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      justifyContent: "flex-start"
    },
    remainingPoints: {
      color: colors.textColor,
      fontSize: fonts.fontSize.fm,
      fontWeight: fonts.fontWeight.semibold
    },
    memberPlan: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: padding.sm - 2,
      paddingHorizontal: padding.md - 4
    },
    borderBottom: {
      borderColor: colors.grey,
      borderBottomWidth: 1
    },
    memberPlanText: {
      alignSelf: "stretch"
    },
    memberPlanTitleText: {
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.fm
    },
    memberPlanNameText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.md - 1
    },
    chevronIcon: {
      color: colors.action,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    },
    redemptions: {
      marginTop: padding.xs
    },
    actions: {
      ...miscellaneous.panel,
      margin: padding.md - 4
    },
    button: {
      justifyContent: "center",
      marginBottom: padding.sm - 2
    }
  }, Theme.isTablet ? tabletLoyaltyDiscountStyle() : {});
};
