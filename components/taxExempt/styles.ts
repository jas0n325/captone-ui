import Color from "color";
import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../styles";

export const tabletTaxExemptStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white
    },
    actions: {
      margin: 0,
      marginTop: padding.md - 4
    },
    taxExemptHeader: {
      backgroundColor: colors.white,
      paddingTop: padding.md - 4,
      paddingLeft: padding.sm - 2
    }
  };
};

export const taxExemptStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  const caution = {
    cautionPanel: {
      alignSelf: "stretch",
      borderColor: colors.transparent,
      flexDirection: "row",
      borderLeftWidth: 4,
      paddingHorizontal: padding.md - padding.xs,
      margin: padding.sm
    },
    cautionIcon: {
      fontSize: fonts.fontSize.tl
    }
  };
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    textInput: {
      alignSelf: "stretch"
    },
    taxHeader: {
      alignSelf: "stretch",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: padding.sm
    },
    taxTitle: {
      fontSize: fonts.fontSize.nw,
      paddingLeft: padding.xs
    },
    textInputError: {
      paddingLeft: padding.xs
    },
    listItemsView: {
      marginBottom: padding.sm
    },
    btnReasonCode: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderColor: forms.input.borderColor,
      flexDirection: "row",
      justifyContent: "space-between",
      height: forms.input.height,
      paddingHorizontal: forms.inputText.paddingLeft
    },
    btnReasonCodeText: {
      color: fonts.color,
      fontSize: fonts.fontSize.fm
    },
    btnInvalidReasonCode: {
      borderBottomColor: forms.inputError.borderColor
    },
    reasonCodeError: {
      alignSelf: "stretch"
    },
    reasonCodeErrorText: {
      ...forms.inputErrorText,
      paddingLeft: padding.xs
    },
    optionButton: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.lightGrey,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: padding.sm,
      width: "100%"
    },
    itemView: {
      flexDirection: "column"
    },
    taxAppliedTitle: {
      fontSize: fonts.fontSize.xs,
      paddingLeft: padding.xs,
      fontWeight: fonts.fontWeight.light
    },
    itemTitle: {
      fontSize: fonts.fontSize.xxs
    },
    optionText: {
      fontSize: fonts.fontSize.fm,
      color: fonts.color,
      paddingBottom: fonts.fontSize.xxs
    },
    checkIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.fm
    },
    taxExemptHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs - 1,
      padding: padding.md - 5,
      paddingBottom: padding.xs - 1
    },
    taxExemptHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    taxExemptList: {
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
    },
    cautionText: {
      color: colors.black,
      textAlign: "left",
      fontFamily: fonts.fontFamily,
      fontSize: fonts.fontSize.sm,
      padding: padding.sm
    },
    cautionIconPadding: {
      paddingVertical: padding.sm
    },
    errorCautionPanel: {
      ...caution.cautionPanel,
      backgroundColor: Color(colors.bad).alpha(0.1).string(),
      borderLeftColor: colors.returnHeaderBackground
    },
    errorCautionIcon: {
      ...caution.cautionIcon,
      color: colors.returnHeaderBackground
    },
    warningCautionPanel: {
      ...caution.cautionPanel,
      backgroundColor: Color(colors.caution).alpha(0.1).toString(),
      borderLeftColor: colors.caution
    },
    warningCautionIcon: {
      ...caution.cautionIcon,
      color: colors.caution
    },
    infoCautionPanel: {
      ...caution.cautionPanel,
      backgroundColor: Color(colors.info).alpha(0.1).toString(),
      borderLeftColor: colors.info
    },
    infoCautionIcon: {
      ...caution.cautionIcon,
      color: colors.info
    }
  }, Theme.isTablet ? tabletTaxExemptStyle() : {});
};

export const taxExemptScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
