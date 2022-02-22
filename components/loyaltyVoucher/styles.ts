import { getBottomSpace } from "react-native-iphone-x-helper";
import Theme from "../../styles";

export const loyaltyResultsPhoneStyles = () => {
  const { colors, padding } = Theme.styles;
  return Theme.merge({
    root: {
      backgroundColor: colors.lightGrey
    },
    subTitleArea: {
      borderBottomColor: colors.borderColor,
      padding: padding.md - 4,
      paddingBottom: padding.xs - 1
    },
    loyaltyErrorArea: {
      backgroundColor: colors.white,
      justifyContent: "space-around",
      padding: padding.lg
    },
    loyaltyVouchers: {
      paddingBottom: getBottomSpace()
    }
  });
};

export const loyaltyResultsTabletStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  return {
    subTitleArea: {
      ...miscellaneous.banner,
      paddingLeft: padding.sm,
      borderBottomColor: colors.grey
    },
    subTitleText: {
      fontSize: fonts.fontSize.sm
    },
    loyaltyErrorArea: {
      ...miscellaneous.fill,
      justifyContent: "center"
    },
    emptyText: {
      color: colors.grey,
      textAlign: "center",
      fontSize: fonts.fontSize.xl
    },
    totalText: {
      color: colors.black,
      fontSize: fonts.fontSize.md - 1
    }
  };
};


export const loyaltyResultsStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    root: {
      ...miscellaneous.fill
    },
    loyaltyVouchers: {
      ...miscellaneous.fill
    },
    assignLoyaltyAndSelectItemsBtn: {
      ...miscellaneous.banner,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      alignItems: "center",
      padding: padding.sm
    },
    assignLoyaltyContainer: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    assignLoyaltyIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.bt
    },
    assignLoyaltyText: {
      alignSelf: "center",
      color: colors.action,
      fontSize: fonts.fontSize.md,
      marginLeft: padding.xs,
      textAlign: "left"
    },
    assignLoyaltyOpenIcon: {
      color: colors.chevron,
      fontSize: fonts.fontSize.md
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    arrowArea: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "stretch"
    },
    titleText: {
      color: colors.black,
      textAlign: "center",
      fontSize: fonts.fontSize.md,
      marginBottom: padding.sm - 2
    },
    subTitleArea: {
      alignItems: "flex-start",
      borderBottomWidth: 1,
      justifyContent: "flex-end"
    },
    subTitleText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1,
      textAlign: "center"
    },
    totalArea: {
      backgroundColor: colors.white,
      justifyContent: "space-around",
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.sm + 4
    },
    totalLine: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: padding.xs - 3
    },
    totalText: {
      color: colors.black,
      fontSize: fonts.fontSize.sm - 1
    },
    loyaltyErrorArea: {
      alignItems: "center"
    }
  }, Theme.isTablet ? loyaltyResultsTabletStyles() : loyaltyResultsPhoneStyles());
};
