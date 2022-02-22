import Color = require("color");
import { Dimensions } from "react-native";
import Theme from "../../styles/index";

export const tabletFindNearbyStyles = () => {
  return {
    spinnerContainer: {
      alignItems: "center",
      justifyContent: "center"
    }
  };
};

export const findNearbyStyles = () => {
  const { colors, fonts, miscellaneous, spacing, buttons, forms } = Theme.styles;

  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill
    },
    optionsRoot: {
      backgroundColor: colors.white,
      paddingHorizontal: 0,
      ...miscellaneous.fill
    },
    inputPanel: {
      height: forms.input.height,
      padding: 0,
      marginBottom: spacing.md
    },
    normalText: {
      marginTop: spacing.sl,
      color: colors.borderColor,
      fontSize: fonts.fontSize.sm
    },
    availableText: {
      marginTop: spacing.sl,
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.nw
    },
    row: {
      alignItems: "stretch",
      flex: 1,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignSelf: "stretch"
    },
    retailLocationChoiceButtonText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm,
      paddingBottom: 2
    },
    retailLocationChoiceButton: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: colors.white,
      fontSize: fonts.fontSize.sm
    },
    spinnerContainer: {
      marginVertical: spacing.lg
    },
    availableInventoryText: {
      fontSize: fonts.fontSize.nw
    },
    checkingInventoryText: {
      fontSize: fonts.fontSize.nw
    },
    unableAccessInventoryText: {
      fontSize: fonts.fontSize.nw
    },
    availablePositive: {
      color: colors.good
    },
    availableNegative: {
      color: colors.bad
    },
    unavailableInventoryText: {
      color: Color(colors.black).alpha(0.6).toString()
    },
    availableButton: {
      marginTop: spacing.xxs,
      flexDirection: "row"
    },
    spinnerStyle: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center"
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingBottom: spacing.xxs
    },
    availableOnly: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md
    },
    availableOnlyText: {
      fontSize: fonts.fontSize.fm
    },
    map: {
      width: Dimensions.get('window').width / 2,
      height: Dimensions.get('window').height / 3
    },
    androidMap: {
      width: Dimensions.get('window').width / 2.1,
      height: Dimensions.get('window').height / 3
    },
    rootForTablet: {
      ...miscellaneous.fill,
      flexDirection: "row",
      backgroundColor: colors.lightGrey
    },
    leftPanel: {
      alignSelf: "flex-start",
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start",
      paddingLeft: spacing.md,
      paddingTop: spacing.md,
      paddingRight: spacing.md,
      width: Dimensions.get('window').width / 2
    },
    leftPanelForMap: {
      paddingTop: 0
    },
    rightPanelIcon: {
      alignSelf: "flex-start",
      justifyContent: "flex-start",
      paddingRight: spacing.sm
    },
    shipmentButtonIconContainer: {
      borderRightColor: colors.action,
      color: colors.action
    },
    disabledButton: {
      backgroundColor: colors.darkGrey,
      color: colors.darkGrey
    },
    rightPanel: {
      ...miscellaneous.actionPanel,
      alignSelf: "flex-start",
      backgroundColor: colors.white,
      justifyContent: "flex-end",
      flex: 1,
      paddingRight: spacing.xxl
    },
    circle: {
      width: 24,
      height: 24,
      borderRadius: 24 / 2,
      backgroundColor: colors.blue
    },
    pinText: {
      color: colors.white,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingTop: spacing.xxs,
      paddingBottm: spacing.xxs,
      fontSize: 12
    },
    circleSelected: {
      backgroundColor: colors.orange
    },
    retailLocationChoiceButtonForTab: {
      backgroundColor: Color(colors.orange).alpha(0.08).string()
    },
    mainRowContainer: {
      paddingLeft: spacing.md,
      flex: 4,
      flexDirection: "row"
    },
    rowContainer: {
       borderBottomWidth: 0.5,
       borderBottomColor: colors.borderColor,
       paddingVertical: spacing.xs,
       flex: 3
    },
    leftrowContainer:{
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderColor,
      flex: 1
    },
    panelIcon:{
      alignItems: "center",
      paddingTop: spacing.lg
    },
    notConnectedPanel: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md
    },
    offline: {
      alignItems: "center",
      alignSelf: "stretch",
      flex: 1,
      justifyContent: "center"
    },
    offlineIcon: {
      alignItems: "center",
      backgroundColor: colors.offlineColor,
      color: colors.white,
      borderRadius: 50,
      fontSize: 70,
      justifyContent: "center",
      height: 100,
      margin: spacing.md,
      width: 100
    },
    offlineText: {
      marginTop: spacing.sl,
      justifyContent: "space-between",
      color: colors.placeholderTextColor,
      fontSize: fonts.fontSize.md
    },
    iconHeight:{
      height:fonts.fontSize.bt
    }
  }, Theme.isTablet ? tabletFindNearbyStyles() : {}
  );
};
