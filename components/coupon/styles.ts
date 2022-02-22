import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../styles";

export const tabletCouponStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white
    },
    actions: {
      margin: 0,
      marginTop: padding.md - 4
    },
    couponHeader: {
      backgroundColor: colors.white,
      paddingTop: padding.md - 4,
      paddingLeft: padding.sm - 2
    }
  };
};

export const couponStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    inputPanel: {
      alignSelf: "stretch"
    },
    inputError: {
      paddingLeft: padding.xs
    },
    couponHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs - 1,
      padding: padding.md - 5,
      paddingBottom: padding.xs - 1
    },
    couponHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    couponList: {
      flex: 1,
      marginBottom: getBottomSpace()
    },
    actions: {
      ...miscellaneous.panel,
      margin: padding.md - 4
    },
    button: {
      justifyContent: "center",
      marginBottom: padding.sm - 2
    }
  }, Theme.isTablet ? tabletCouponStyle() : {});
};

export const couponScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
