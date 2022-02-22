import Color from "color";
import { Platform } from "react-native";
import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";

import Theme from "../../ui/styles";


export const rootStyles = (deviceScreen: any) => {
  const { colors, fonts, miscellaneous, padding, spacing } = Theme.styles;
  return ({
    ...miscellaneous,
    aptosLogo: {
      color: colors.loginAndHeaderText,
      height: 40,
      width: 100
    },
    navigationBar: {
      backgroundColor: colors.loginAndHeaderBackground,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1
    },
    mainNavigationBar: {
      borderBottomWidth: 0,
      backgroundColor: colors.loginAndHeaderBackground
    },
    navigationBarLeft: {
      alignItems: "center",
      flexDirection: "row",
      height: padding.lg + 2,
      justifyContent: "center",
      paddingRight: padding.sm,
      paddingVertical: padding.xs - 1
    },
    navigationBarLeftButton: {
      justifyContent: "flex-start"
    },
    navigationBarLeftIcon: {
      fontSize: fonts.fontSize.tl,
      marginLeft: -spacing.sm,
      marginRight: padding.xs
    },
    navigationBarLeftText: {
      color: colors.loginAndHeaderText,
      fontSize: fonts.fontSize.fm + 1
    },
    backNavigationItem: {
      color: colors.navigationText
    },
    navigationBarTitleWrapper: {
      marginTop: padding.sm,
      position: "absolute",
      left: 0,
      right: 0
    },
    navigationBarTitle: {
      alignItems: "center",
      alignSelf: "center",
      color: colors.loginAndHeaderText,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.md + 4,
      fontWeight: fonts.fontWeight.semibold,
      height: padding.lg + 2,
      marginLeft: padding.xs,
      textAlign: "center",
      width: "75%"
    },
    navigationBarRight: {
      alignItems: "center",
      flexDirection: "row",
      height: padding.lg + 2,
      justifyContent: "center",
      paddingRight: padding.sm,
      paddingVertical: padding.xs - 1
    },
    navigationBarRightButton: {
      justifyContent: "flex-end"
    },
    navigationBarRightText: {
      color: colors.loginAndHeaderText,
      fontSize: fonts.fontSize.fm + 1
    },
    giftCardLogo: {
      color: Color(colors.white).alpha(0.6).toString(),
      height: padding.sm + 5.7,
      width:  padding.md + 4
    },
    reprintLogo: {
      color: Color(colors.white).alpha(0.6).toString(),
      height: padding.md + 2,
      width: padding.md + 2
    },
    fontLogo: {
      flexDirection: "row",
      justifyContent: "flex-end"
    },
    chevronIcon: {
      color: colors.white,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    },
    salesHistoryLogo: {
      color: Color(colors.white).alpha(0.6).toString(),
      height: padding.md + 3,
      width: padding.md + 3
    },
    postVoidLogo: {
      color: Color(colors.white).alpha(0.6).toString(),
      height: padding.md + 3,
      width: padding.md + 3
    },
    closeLogo: {
      height: padding.md + 4,
      width: padding.md + 4 ,
      color: colors.white
    },
    productInquiryLogo: {
      height: padding.md + 3,
      width: padding.md + 3,
      color: Color(colors.white).alpha(0.6).toString()
    },
    orderInquiryLogo: {
      height: padding.md + 3,
      width: padding.md + 3,
      color: Color(colors.white).alpha(0.6).toString()
    },
    searchCustomerLogo: {
      height: padding.md + 4,
      width: padding.md + 4,
      color: Color(colors.white).alpha(0.6).toString()
    },
    sideBar: {
      flex: 1,
      backgroundColor: "rgb(45,45,45)"
    },
    commerce: {
      color: Color(colors.white).alpha(0.6).toString(),
      flex: 1,
      fontSize: fonts.fontSize.xs + 1,
      paddingTop: padding.md - 4,
      paddingLeft: padding.md - 4
    },
    sideBarCloseButton: {
      paddingLeft: padding.sm + 2,
      paddingTop: padding.md - 0.5 ,
      paddingBottom: padding.xs + 3,
      size: 17
    },
    sideBarButton: {
      flexDirection: "row",
      paddingLeft: padding.md - 4,
      paddingRight: padding.sm + 6
    },
    sideBarButtonInfo: {
      paddingLeft: padding.md - 4,
      paddingRight: padding.sm + 6
    },
    sideBarActiveButton: Color(colors.black).alpha(0.3).toString(),
    sideBarButtonWrapper: {
      ...miscellaneous.fill,
      flexDirection: "row",
      alignItems: "center",
      paddingTop: padding.sm + 4,
      paddingBottom: padding.sm + 4,
      height: 48
    },
    sideBarButtonWrapperInfo: {
      paddingTop: padding.lg,
      flex: 1
    },
    sideBarIcon: {
      color: Color(colors.white).alpha(0.6).toString(),
      height: padding.sm + 5.7,
      width:  padding.md + 4
    },
    sideBarText: {
      color: colors.white,
      flex: 1,
      fontSize: fonts.fontSize.fm,
      marginLeft: padding.xl
    },
    sideBarTextWithIcon: {
      color: colors.white,
      flex: 1,
      fontSize: fonts.fontSize.fm,
      marginLeft: padding.sm + 6
    },
    separator: {
      backgroundColor: Color(colors.white).alpha(0.15).toString(),
      height: 1
    },
    terminalText: {
      color: Color(colors.white).alpha(0.6).toString(),
      flex: 1,
      fontSize: fonts.fontSize.sm + 1,
      paddingLeft: padding.xl
    },
    sceneStyle: {
      backgroundColor: colors.loginAndHeaderText,
      flex: 1
    }
  });
};

/**
 * iPhone navbar height: 64px
 * iPhone X navbar height: 68px
 * Android portrait navbar height: 44px
 *
 * @param deviceScreen
 */
export const phoneStyles = (deviceScreen: any) => {
  const { padding } = Theme.styles;
  const statusBarHeight = isIphoneX() ? (getStatusBarHeight(true) - 2) : 40;

  return Theme.merge(rootStyles(deviceScreen), {
    navigationBar: {
      height: statusBarHeight + (Platform.OS === "ios" ? 24 : 4),
      paddingTop: isIphoneX() ? padding.xs : 0
    },
    navigationBarTitleWrapper: {
      ...Platform.select({
        ios: {
          top: (isIphoneX() ? padding.lg : padding.md) - 2
        },
        android: {
          top: -35
        },
        windows: {
          top: padding.xs
        }
      })
    },
    sideBar: {
      paddingTop: Platform.OS === "ios" ? getStatusBarHeight(false) : 0
    },
    sceneStyle: {
      marginTop: statusBarHeight + (Platform.OS === "ios" ? 24 : 4)
    }
  });
};

export const tabletStyles = (deviceScreen: any) => {
  const { padding } = Theme.styles;

  return Theme.merge(rootStyles(deviceScreen), {
    navigationBar: {
      height: Platform.OS === "ios" ? 68 : 50
    },
    navigationBarTitleWrapper: {
      ...Platform.select({
        ios: {
          top: padding.md
        },
        android: {
          top: -15
        },
        windows: {
          top: padding.xs
        }
      })
    },
    navigationBarLeft: {
      paddingVertical: Platform.OS === "ios" ? padding.xs - 1 : 0,
      paddingBottom: Platform.OS === "ios" ? padding.xs - 1 : padding.sm - 2
    },
    navigationBarRight: {
      paddingVertical: Platform.OS === "ios" ? padding.xs - 1 : 0,
      paddingBottom: Platform.OS === "ios" ? padding.xs - 1 : padding.sm - 2
    },
    sideBar: {
      paddingTop: Platform.OS === "ios" ? padding.md : 0
    },
    sideBarButton: {
      padding: padding.sm - 2
    },
    sceneStyle: {
      marginTop: Platform.OS === "ios" ? 68 : 50
    }
  });
};

export const activityIndicatorColor = "#999999";

