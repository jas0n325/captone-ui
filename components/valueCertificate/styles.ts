import Color from "color";

import Theme from "../../styles";

export const valueCertificateResultsPhoneStyles = () => {
  const { colors, padding } = Theme.styles;
  return Theme.merge({
    root: {
      backgroundColor: colors.lightGrey
    },
    subTitleArea: {
      marginLeft: padding.xs,
      padding: padding.xs,
      paddingBottom: padding.xs
    },
    errorArea: {
      backgroundColor: colors.white,
      justifyContent: "space-around",
      padding: padding.lg
    }
  });
};

export const valueCertificateResultsTabletStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      ...miscellaneous.statusBarHeight,
      flexDirection: "row"
    },
    doneButton: {
      justifyContent: "flex-end",
      padding: padding.sm,
      marginBottom: padding.sm
    },
    leftPanel: {
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      borderRightColor:  colors.grey,
      borderRightWidth: 1,
      flex: 1,
      justifyContent: "center"
    },
    rightPanel: {
      ...miscellaneous.actionPanel,
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "center"
    },
    totalArea: {
      marginHorizontal: padding.xxl + 50,
      marginTop: padding.md,
      alignItems: "center"
    },
    totalBox: {
      alignSelf: "stretch",
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "center",
      padding: padding.xs,
      paddingTop: padding.xs
    },
    totalText: {
      color: colors.black,
      fontSize: fonts.fontSize.md - 1
    },
    inputArea: {
      backgroundColor: colors.grey
    },
    inputPanel: {
      paddingTop: padding.xl
    },
    appliedCertificatesArea: {
      marginHorizontal: padding.xxl + 50 - padding.xs,
      marginTop: padding.md
    }
  };
};


export const valueCertificateResultsStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    root: {
      ...miscellaneous.fill
    },
    valueCertificates: {
      ...miscellaneous.fill
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
    subTitleArea: {
      alignItems: "flex-start",
      justifyContent: "flex-end"
    },
    subTitleText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      textAlign: "center"
    },
    totalArea: {
      backgroundColor: colors.white,
      justifyContent: "space-around",
      paddingHorizontal: padding.sm,
      paddingVertical: padding.xxs
    },
    totalAreaFeedbackNote: {
      paddingVertical: padding.sm
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
    remainingText: {
      color: colors.black,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.semibold
    },
    inputPanel: {
      alignItems: "flex-end",
      alignSelf: "stretch",
      justifyContent: "center",
      backgroundColor: colors.loginAndHeaderBackground
    },
    inputField: {
      backgroundColor: colors.white,
      borderColor: colors.loginAndHeaderText,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderBottomWidth: 1,
      borderTopLeftRadius: padding.xs,
      borderBottomLeftRadius: padding.xs,
      fontSize: fonts.fontSize.md,
      height: 36
    },
    cameraIconPanel: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.loginAndHeaderText,
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderTopWidth: 1,
      borderTopRightRadius: padding.xs,
      borderBottomRightRadius: padding.xs,
      height: 36,
      justifyContent: "center",
      marginRight: 0,
      width: 50
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    },
    feedbackNote: {
      padding: padding.sm
    }
  }, Theme.isTablet ? valueCertificateResultsTabletStyles() : valueCertificateResultsPhoneStyles());
};

export const valueCertificateLineStyles = () => {
  const { colors, fonts, padding, textAlign } = Theme.styles;
  return {
    ...textAlign,
    row: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.grey,
      borderRadius: padding.xs,
      flexDirection: "row",
      justifyContent: "center",
      marginHorizontal: padding.xs,
      marginTop: padding.xs,
      padding: padding.xs
    },
    disabled: {
      backgroundColor: colors.lighterGrey
    },
    details: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flex: 2,
      justifyContent: "center"
    },
    amountText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm,
      marginBottom: padding.xs
    },
    disabledAmountText: {
      color: colors.darkGrey
    },
    text: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs + 1,
      marginBottom: padding.xs
    },
    disabledText: {
      color: colors.grey
    },
    typeText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs + 1
    },
    voidIcon: {
      alignItems: "flex-end",
      backgroundColor: colors.white,
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt,
      padding: padding.sm
    },
    statusIcon: {
      color: Color(colors.darkGrey).alpha(0.6).toString(),
      fontSize: fonts.fontSize.bt,
      borderWidth: 0,
      padding: padding.sm
    }
  };
};

export const issueGiftCertificateStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
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
    textInputError: {
      paddingLeft: padding.xs,
      paddingBottom: padding.xs
    },
    button: {
      justifyContent: "center"
    },
    activeTabStyle: {
      backgroundColor: colors.action
    },
    activeTabTextStyle: {
      color: colors.white
    },
    tabStyle: {
      borderColor: colors.action,
      marginTop: padding.sm,
      padding: padding.sm
    },
    controlArea: {
      marginBottom: padding.sm
    },
    inputDisabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    },
    tabTextStyle: {
      color: colors.action
    },
    topSection: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      width: "100%"
    },
    totalArea: {
      justifyContent: "center",
      alignItems: "center",
      paddingTop: padding.md
    },
    totalText: {
      fontSize: fonts.fontSize.sm
    },
    totalAmountText: {
      fontSize: fonts.fontSize.tl,
      fontWeight: fonts.fontWeight.semibold
    },
    paddingBottom: {
      paddingBottom: padding.md - padding.xs,
      backgroundColor: colors.white
    }
  }, Theme.isTablet ? tabletIssueGiftCertificateStyle() : phoneIssueGiftCertificateStyle());
};

export const tabletIssueGiftCertificateStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white,
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "flex-start",
      paddingTop: padding.sm,
      paddingBottom: padding.sm,
      width: 350
    },
    actions: {
      margin: 0,
      marginTop: padding.md - 4,
      width: "100%"
    },
    button: {
      marginBottom: padding.sm - 2,
      width: "100%"
    }
  };
};

export const phoneIssueGiftCertificateStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    actions: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flexDirection: "row",
      padding: padding.md - 4,
      paddingLeft: 0
    },
    button: {
      flex: 1,
      marginLeft: padding.md - 4
    }
  };
};
