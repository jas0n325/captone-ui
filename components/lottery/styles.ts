import Color from "color";

import { getBottomSpace } from "react-native-iphone-x-helper";
import Theme from "../../../ui/styles/index";

export const tabletScanLotteryStyle = () => {
  const { colors, miscellaneous, spacing } = Theme.styles;
  return {
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    actions: {
      margin: 0,
      marginTop: spacing.md
    },
    taxLotteryHeader: {
      padding: 0,
      paddingBottom: spacing.xs
    },
    appliedTitle: {
      paddingLeft: 0
    },
    editButton: {
      marginBottom: spacing.xs
    },
    lotteryLabels: {
      paddingLeft: 0
    }
  };
};

export const scanLotteryStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, spacing, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      paddingBottom: getBottomSpace()
    },
    inputPanel: {
      alignSelf: "stretch"
    },
    inputField: {
      backgroundColor: colors.white,
      fontSize: fonts.fontSize.md,
      height: forms.input.height
    },
    inputError: {
      paddingLeft: spacing.xs
    },
    cameraIconPanel: {
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderBottomWidth: 1,
      height: forms.input.height,
      width: 50
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    },
    taxLotteryHeader: {
      alignSelf: "stretch",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: spacing.xs
    },
    appliedTitle: {
      fontSize: fonts.fontSize.sm,
      paddingLeft: spacing.xs,
      fontWeight: fonts.fontWeight.bold,
      color: colors.darkestGrey
    },
    infoCautionPanel: {
      alignSelf: "stretch",
      borderColor: colors.transparent,
      flexDirection: "row",
      borderLeftWidth: 4,
      paddingHorizontal: spacing.md - spacing.xs,
      margin: spacing.sm,
      backgroundColor: Color(colors.info).alpha(0.1).toString(),
      borderLeftColor: colors.info
    },
    cautionIconPadding: {
      paddingVertical: spacing.sm
    },
    infoCautionIcon: {
      fontSize: fonts.fontSize.tl,
      color: colors.info,
      fontWeight: fonts.fontWeight.bold
    },
    cautionText: {
      color: colors.black,
      textAlign: "left",
      fontFamily: fonts.fontFamily,
      fontSize: fonts.fontSize.sm,
      padding: spacing.sm
    },
    lotteryView: {
      paddingLeft: spacing.xxs
    },
    lotteryLabels: {
      paddingLeft: spacing.md
    },
    lotteryLabelsEditMode: {
      paddingLeft: spacing.sm
    },
    btnWarningHeader: {
      alignSelf: "flex-start",
      color: colors.darkestGrey,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.nw,
      fontWeight: fonts.fontWeight.bold,
      paddingBottom: spacing.sm,
      paddingTop: spacing.xs,
      textAlign: "left",
      marginLeft: spacing.xxs,
      marginBottom: spacing.xxs
    },
    btnWarningText: {
      alignSelf: "flex-start",
      color: colors.darkerGrey,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.nw,
      paddingLeft: spacing.xs,
      textAlign: "left"
    },
    bulletIcon: {
      fontSize: fonts.fontSize.fm,
      color: colors.darkerGrey,
      marginBottom: spacing.xxs,
      marginLeft: spacing.md
    },
    eligibleTenderIcon :{
      height: spacing.xs,
      width: spacing.xs,
      color: colors.darkerGrey,
      marginBottom: spacing.xxs,
      marginLeft: padding.xs + 1,
      paddingTop: padding.md
    },
    tenderTextSpacing: {
      marginRight: fonts.fontSize.xxs,
      paddingRight: fonts.fontSize.sm
    },
    lotteryRequirement: {
      flexDirection: "row",
      paddingBottom: padding.sm,
      marginBottom: spacing.xxs,
      marginLeft: spacing.xs
    }
  }, Theme.isTablet ? tabletScanLotteryStyle() : {});
};

export const capturedLotteryLineStyles = () => {
  const { colors, fonts, spacing } = Theme.styles;
  return {
    root: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderRadius: spacing.xxs,
      borderWidth: 1,
      marginTop: spacing.xs,
      marginHorizontal: Theme.isTablet ? 0 : spacing.xs
    },
    detailsArea: {
      flex: 1,
      justifyContent: "space-between",
      padding: spacing.xs,
      paddingLeft: Theme.isTablet ? spacing.xs : spacing.md
    },
    topRowText: {
      fontSize: fonts.fontSize.md,
      color: colors.black
    },
    bottomRowText: {
      fontSize: fonts.fontSize.sm,
      color: colors.darkerGrey
    },
    voidIconArea: {
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xs
    },
    voidIcon: {
      color: colors.white,
      fontSize: fonts.fontSize.sm,
      padding: spacing.xxs
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkGrey
    }
  };
};
