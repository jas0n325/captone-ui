import Color from "color";
import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../styles";

export const tabletTaxOverrideStyle = () => {
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

export const taxActionPanelStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return ({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill
    },
    infoButton: {
      ...buttons.btnSeconday,
      backgroundColor: Theme.isTablet ? buttons.btnAction.backgroundColor : colors.white,
      borderColor: Theme.isTablet ? buttons.btnAction.borderColor : colors.white,
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: padding.sm - 2
    },
    infoButtonIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.fm
    },
    infoButtonText: {
      ...buttons.btnSecondayText,
      paddingLeft: padding.xs - 1
    },
    actionsPanel: {
      ...miscellaneous.fill,
      alignItems: "center",
      justifyContent: "flex-start"
    },
    actions: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between"
    },
    btnAction: {
      ...buttons.btnAction,
      borderRadius: 4,
      borderWidth: 1,
      height: Theme.isTablet ? buttons.btnAction.height : 96,
      width: Theme.isTablet ? buttons.btnAction.width : 96,
      marginTop: !Theme.isTablet && padding.sm,
      marginLeft: !Theme.isTablet && padding.sm
    },
    btnActionText: {
      fontSize: Theme.isTablet ? buttons.btnActionText.fontSize : fonts.fontSize.sm - 1
    },
    lastBtn: {
      height: Theme.isTablet ? buttons.btnAction.height : 96,
      width: Theme.isTablet ? buttons.btnAction.width : 96
    }
  });
};

export const actionButtonStyle = () => {
  const { buttons, colors, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    actionButton: {
      alignItems: "center",
      justifyContent: "center",
      margin: padding.sm - 2
    }
  }, Theme.isTablet ? {
    btnDisabled: {
      backgroundColor: colors.white,
      borderWidth: 0
    }
  } : {});
};

export const phoneTaxOverrideStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  //Maximum number of selected item lines to show on the tax override screen at one time
  const maxListElements = 4;

  const fontSize = fonts.fontSize.md - 1;
  const paddingBottom = padding.xs - 1;
  const listHeight = maxListElements * (fontSize + paddingBottom);
  return {
    itemLines: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderRadius: padding.sm - 2,
      marginTop: padding.xs - 1,
      marginHorizontal: padding.sm - 2,
      marginBottom: padding.md - 4,
      padding: padding.sm - 2
    },
    line: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom
    },
    itemLineTitle: {
      color: colors.black,
      flex: 1,
      fontSize
    },
    fullItemLineList: {
      maxHeight: listHeight
    }
  };
};

export const itemTaxOverrideScreenStyle = () => {
  const { colors, miscellaneous, fonts, forms, padding, buttons } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey,
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
    itemTitle: {
      fontSize: fonts.fontSize.xxs
    },
    taxAppliedTitle: {
      fontSize: fonts.fontSize.xs,
      paddingLeft: padding.xs,
      fontWeight: fonts.fontWeight.light
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
    taxOverrideList: {
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
    cautionPanel: {
      alignSelf: "stretch",
      backgroundColor: Color(colors.caution).alpha(0.1).toString(),
      borderColor: colors.transparent,
      flexDirection: "row",
      borderLeftWidth: 4,
      borderLeftColor: colors.caution,
      paddingHorizontal: padding.md - 4,
      margin: padding.sm
    },
    cautionText: {
      color: colors.black,
      textAlign: "left",
      fontFamily: fonts.fontFamily,
      fontSize: fonts.fontSize.md - 2,
      padding: padding.sm
    },
    cautionIconPadding: {
      paddingVertical: padding.sm
    },
    cautionIcon: {
      color: colors.caution,
      fontSize: fonts.fontSize.md + 5
    }
  }, Theme.isTablet ? tabletTaxOverrideStyle() : phoneTaxOverrideStyles());
};
